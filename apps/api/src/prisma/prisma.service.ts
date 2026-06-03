import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common'
import { PrismaClient } from '@prisma/client'

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name)

  async onModuleInit() {
    try {
      await this.$connect()
      this.logger.log('Database connected')
    } catch (error) {
      this.logger.warn(
        'Database connection failed. API is running but database queries will fail. ' +
        'Update DATABASE_URL in your .env file with your Supabase connection string.',
      )
    }
  }

  async onModuleDestroy() {
    await this.$disconnect()
    this.logger.log('Database disconnected')
  }
}
