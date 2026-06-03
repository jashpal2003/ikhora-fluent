import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { BlobServiceClient, generateBlobSASQueryParameters, BlobSASPermissions, StorageSharedKeyCredential } from '@azure/storage-blob'
import { v4 as uuidv4 } from 'uuid'

@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name)
  private readonly blobServiceClient: BlobServiceClient
  private readonly credential: StorageSharedKeyCredential
  private readonly accountName: string
  private readonly containers = {
    audio: '',
    documents: '',
    reports: '',
  }

  constructor(private readonly config: ConfigService) {
    this.accountName = config.getOrThrow('AZURE_STORAGE_ACCOUNT_NAME')
    const accountKey = config.getOrThrow('AZURE_STORAGE_ACCOUNT_KEY')
    this.credential = new StorageSharedKeyCredential(this.accountName, accountKey)
    this.blobServiceClient = new BlobServiceClient(
      `https://${this.accountName}.blob.core.windows.net`,
      this.credential,
    )
    // All containers default to "ikhoradata" (single-container setup)
    this.containers.audio = config.get('AZURE_STORAGE_CONTAINER_AUDIO') || 'ikhoradata'
    this.containers.documents = config.get('AZURE_STORAGE_CONTAINER_DOCUMENTS') || 'ikhoradata'
    this.containers.reports = config.get('AZURE_STORAGE_CONTAINER_REPORTS') || 'ikhoradata'
  }

  /**
   * Generate a short-lived SAS upload URL for browser-direct upload
   */
  async getUploadUrl(params: {
    containerType: 'audio' | 'documents' | 'reports'
    userId: string
    fileName: string
    expiryMinutes?: number
  }): Promise<{ uploadUrl: string; blobPath: string; expiresAt: string }> {
    const containerName = this.containers[params.containerType]
    const ext = params.fileName.split('.').pop() || 'bin'
    // Organize by type subdirectory within single container
    const typePrefix = params.containerType === 'audio' ? 'audio' : params.containerType === 'documents' ? 'docs' : 'reports'
    const blobPath = `${typePrefix}/${params.userId}/${uuidv4()}.${ext}`
    const expiryMinutes = params.expiryMinutes || 15

    const expiresAt = new Date()
    expiresAt.setMinutes(expiresAt.getMinutes() + expiryMinutes)

    const sasPermissions = new BlobSASPermissions()
    sasPermissions.write = true
    sasPermissions.create = true

    const sasToken = generateBlobSASQueryParameters(
      {
        containerName,
        blobName: blobPath,
        permissions: sasPermissions,
        startsOn: new Date(),
        expiresOn: expiresAt,
      },
      this.credential,
    ).toString()

    const uploadUrl = `https://${this.accountName}.blob.core.windows.net/${containerName}/${blobPath}?${sasToken}`
    return { uploadUrl, blobPath, expiresAt: expiresAt.toISOString() }
  }

  /**
   * Generate a short-lived read URL for secure access
   */
  async getReadUrl(containerType: 'audio' | 'documents' | 'reports', blobPath: string, expiryMinutes = 60): Promise<string> {
    const containerName = this.containers[containerType]
    const expiresAt = new Date()
    expiresAt.setMinutes(expiresAt.getMinutes() + expiryMinutes)

    const sasPermissions = new BlobSASPermissions()
    sasPermissions.read = true

    const sasToken = generateBlobSASQueryParameters(
      { containerName, blobName: blobPath, permissions: sasPermissions, expiresOn: expiresAt },
      this.credential,
    ).toString()

    return `https://${this.accountName}.blob.core.windows.net/${containerName}/${blobPath}?${sasToken}`
  }

  /**
   * Upload a buffer directly (for server-side report generation)
   */
  async uploadBuffer(
    containerType: 'audio' | 'documents' | 'reports',
    blobPath: string,
    buffer: Buffer,
    contentType: string,
  ): Promise<string> {
    const containerName = this.containers[containerType]
    const containerClient = this.blobServiceClient.getContainerClient(containerName)
    const blockBlobClient = containerClient.getBlockBlobClient(blobPath)

    await blockBlobClient.upload(buffer, buffer.length, {
      blobHTTPHeaders: { blobContentType: contentType },
    })

    return `https://${this.accountName}.blob.core.windows.net/${containerName}/${blobPath}`
  }

  /**
   * Delete a blob
   */
  async deleteBlob(containerType: 'audio' | 'documents' | 'reports', blobPath: string): Promise<void> {
    try {
      const containerName = this.containers[containerType]
      const containerClient = this.blobServiceClient.getContainerClient(containerName)
      await containerClient.deleteBlob(blobPath)
    } catch (error) {
      this.logger.error(`Failed to delete blob ${blobPath}`, error)
    }
  }

  /**
   * Download a blob as a buffer
   */
  async downloadBuffer(containerType: 'audio' | 'documents' | 'reports', blobPath: string): Promise<Buffer> {
    const containerName = this.containers[containerType]
    const containerClient = this.blobServiceClient.getContainerClient(containerName)
    const blockBlobClient = containerClient.getBlockBlobClient(blobPath)
    const response = await blockBlobClient.download(0)
    const chunks: Buffer[] = []
    for await (const chunk of response.readableStreamBody as AsyncIterable<Buffer>) {
      chunks.push(chunk)
    }
    return Buffer.concat(chunks)
  }
}
