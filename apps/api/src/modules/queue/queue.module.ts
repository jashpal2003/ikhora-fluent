import { Module, Global, forwardRef } from '@nestjs/common'
import { QueueService } from './queue.service'
import { QueueWorker } from './queue.worker'
import { WritingModule } from '../writing/writing.module'
import { SpeakingModule } from '../speaking/speaking.module'

@Global()
@Module({
  imports: [forwardRef(() => WritingModule), forwardRef(() => SpeakingModule)],
  providers: [QueueService, QueueWorker],
  exports: [QueueService],
})
export class QueueModule {}
