import { Controller, Post, Get, Body, Param, UseGuards, Request } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger'
import { IsNumber, IsString, IsOptional, IsUUID } from 'class-validator'
import { SpeakingService } from './speaking.service'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'

class CreateSessionDto {
  @IsNumber() part: 1 | 2 | 3
  @IsString() prompt: string
  @IsOptional() @IsUUID() assignmentId?: string
  @IsOptional() @IsUUID() contentItemId?: string
}

class CompleteSessionDto {
  @IsString() blobPath: string
  @IsString() fileName: string
  @IsOptional() durationSeconds?: number
}

class UploadUrlDto {
  @IsString() fileName: string
}

@ApiTags('speaking')
@Controller('speaking')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class SpeakingController {
  constructor(private readonly speakingService: SpeakingService) {}

  @Post('upload-url')
  @ApiOperation({ summary: 'Get a signed URL for direct browser audio upload' })
  getUploadUrl(@Body() dto: UploadUrlDto, @Request() req: { user: { sub: string } }) {
    return this.speakingService.getUploadUrl(req.user.sub, dto.fileName)
  }

  @Post('sessions')
  @ApiOperation({ summary: 'Create a new speaking session' })
  createSession(@Body() dto: CreateSessionDto, @Request() req: { user: { sub: string } }) {
    return this.speakingService.createSession({ ...dto, userId: req.user.sub })
  }

  @Post('sessions/:submissionId/complete')
  @ApiOperation({ summary: 'Complete a speaking session and trigger analysis' })
  completeSession(@Param('submissionId') id: string, @Body() dto: CompleteSessionDto, @Request() req: { user: { sub: string } }) {
    return this.speakingService.completeSession({ submissionId: id, userId: req.user.sub, ...dto, part: 1, prompt: '' })
  }

  @Get('sessions/:submissionId/report')
  @ApiOperation({ summary: 'Get speaking session report with score and feedback' })
  getReport(@Param('submissionId') id: string, @Request() req: { user: { sub: string } }) {
    return this.speakingService.getReport(id, req.user.sub)
  }
}
