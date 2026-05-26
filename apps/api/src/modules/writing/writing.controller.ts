import { Controller, Post, Get, Patch, Body, Param, UseGuards, Request, Query } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger'
import { IsString, IsEnum, IsOptional, IsUUID, IsNumber, Min, Max } from 'class-validator'
import { WritingService } from './writing.service'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'

class SubmitWritingDto {
  @IsEnum(['ACADEMIC_TASK_1', 'ACADEMIC_TASK_2', 'GENERAL_TASK_1', 'GENERAL_TASK_2'])
  taskType: 'ACADEMIC_TASK_1' | 'ACADEMIC_TASK_2' | 'GENERAL_TASK_1' | 'GENERAL_TASK_2'

  @IsString()
  prompt: string

  @IsString()
  answer: string

  @IsOptional() @IsUUID() assignmentId?: string
  @IsOptional() @IsUUID() contentItemId?: string
}

class OverrideScoreDto {
  @IsNumber() @Min(0) @Max(9)
  teacherScore: number

  @IsString()
  overrideReason: string

  @IsOptional() @IsString()
  comments?: string

  @IsOptional()
  criteriaAdjustments?: Record<string, { ai: number; teacher: number }>
}

@ApiTags('writing')
@Controller('writing')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class WritingController {
  constructor(private readonly writingService: WritingService) {}

  @Post('submit')
  @ApiOperation({ summary: 'Submit a writing answer for AI scoring' })
  submit(@Body() dto: SubmitWritingDto, @Request() req: { user: { sub: string } }) {
    return this.writingService.submitWriting({ ...dto, userId: req.user.sub })
  }

  @Get('history')
  @ApiOperation({ summary: 'Get writing submission history' })
  getHistory(@Request() req: { user: { sub: string } }, @Query('page') page = 1, @Query('limit') limit = 20) {
    return this.writingService.getUserWritingHistory(req.user.sub, +page, +limit)
  }

  @Get(':submissionId')
  @ApiOperation({ summary: 'Get a specific writing submission with score and feedback' })
  getSubmission(@Param('submissionId') id: string, @Request() req: { user: { sub: string } }) {
    return this.writingService.getSubmission(id, req.user.sub)
  }

  @Patch(':submissionId/override')
  @ApiOperation({ summary: 'Teacher score override with audit trail' })
  override(@Param('submissionId') id: string, @Body() dto: OverrideScoreDto, @Request() req: { user: { sub: string } }) {
    return this.writingService.teacherOverride({ submissionId: id, teacherId: req.user.sub, ...dto })
  }
}
