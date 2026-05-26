import { Module, forwardRef } from '@nestjs/common'
import { SpeakingService } from './speaking.service'
import { SpeakingController } from './speaking.controller'
import { QueueModule } from '../queue/queue.module'

@Module({
  imports: [forwardRef(() => QueueModule)],
  controllers: [SpeakingController],
  providers: [SpeakingService],
  exports: [SpeakingService],
})
export class SpeakingModule {}
