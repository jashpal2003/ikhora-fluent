import { Injectable, OnModuleInit, Logger } from '@nestjs/common'
import { Worker } from 'bullmq'
import { ConfigService } from '@nestjs/config'
import IORedis from 'ioredis'
import { WritingService } from '../writing/writing.service'
import { SpeakingService } from '../speaking/speaking.service'

@Injectable()
export class QueueWorker implements OnModuleInit {
  private readonly logger = new Logger(QueueWorker.name)
  private readonly connection: IORedis

  constructor(
    private readonly config: ConfigService,
    private readonly writingService: WritingService,
    private readonly speakingService: SpeakingService,
  ) {
    const redisUrl = config.get('REDIS_URL') || 'redis://localhost:6379'
    this.connection = new IORedis(redisUrl, { maxRetriesPerRequest: null, lazyConnect: true })
  }

  onModuleInit() {
    this.startWritingWorker()
    this.startSpeakingWorker()
    this.logger.log('Queue workers started')
  }

  private startWritingWorker() {
    const worker = new Worker(
      'writing-scoring',
      async (job) => {
        this.logger.log(`Processing writing score job ${job.id}`)
        const { jobId, submissionId, taskType, prompt, answer, wordCount } = job.data
        await this.writingService.processWritingScore({ jobId, submissionId, taskType, prompt, answer, wordCount })
      },
      { connection: this.connection, concurrency: 5 },
    )

    worker.on('completed', (job) => this.logger.log(`Writing job ${job.id} completed`))
    worker.on('failed', (job, err) => this.logger.error(`Writing job ${job?.id} failed`, err))
  }

  private startSpeakingWorker() {
    const worker = new Worker(
      'speaking-scoring',
      async (job) => {
        this.logger.log(`Processing speaking score job ${job.id}`)
        const { jobId, submissionId, blobPath, part, prompt } = job.data
        await this.speakingService.processAudioJob({ jobId, submissionId, blobPath, part, prompt })
      },
      { connection: this.connection, concurrency: 3 },
    )

    worker.on('completed', (job) => this.logger.log(`Speaking job ${job.id} completed`))
    worker.on('failed', (job, err) => this.logger.error(`Speaking job ${job?.id} failed`, err))
  }
}
