import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { ThrottlerModule } from '@nestjs/throttler'
import { ScheduleModule } from '@nestjs/schedule'
import { AuthModule } from './modules/auth/auth.module'
import { OrgsModule } from './modules/orgs/orgs.module'
import { ContentModule } from './modules/content/content.module'
import { AssignmentsModule } from './modules/assignments/assignments.module'
import { SubmissionsModule } from './modules/submissions/submissions.module'
import { WritingModule } from './modules/writing/writing.module'
import { SpeakingModule } from './modules/speaking/speaking.module'
import { ReadingModule } from './modules/reading/reading.module'
import { ListeningModule } from './modules/listening/listening.module'
import { CefrModule } from './modules/cefr/cefr.module'
import { ReportsModule } from './modules/reports/reports.module'
import { BillingModule } from './modules/billing/billing.module'
import { CertificatesModule } from './modules/certificates/certificates.module'
import { AdminModule } from './modules/admin/admin.module'
import { AuditModule } from './modules/audit/audit.module'
import { QueueModule } from './modules/queue/queue.module'
import { PrismaModule } from './prisma/prisma.module'
import { AiModule } from './modules/ai/ai.module'
import { StorageModule } from './modules/storage/storage.module'

@Module({
  imports: [
    // Config
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '../../.env', '.env'],
    }),

    // Rate limiting
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 100 }]),

    // Scheduling (cron jobs)
    ScheduleModule.forRoot(),

    // Infrastructure
    PrismaModule,
    AiModule,
    StorageModule,
    QueueModule,
    AuditModule,

    // Feature modules
    AuthModule,
    OrgsModule,
    ContentModule,
    AssignmentsModule,
    SubmissionsModule,
    WritingModule,
    SpeakingModule,
    ReadingModule,
    ListeningModule,
    CefrModule,
    ReportsModule,
    BillingModule,
    CertificatesModule,
    AdminModule,
  ],
})
export class AppModule {}
