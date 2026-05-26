import { Module, forwardRef } from '@nestjs/common'
import { WritingService } from './writing.service'
import { WritingController } from './writing.controller'
import { QueueModule } from '../queue/queue.module'

@Module({
  imports: [forwardRef(() => QueueModule)],
  controllers: [WritingController],
  providers: [WritingService],
  exports: [WritingService],
})
export class WritingModule {}
