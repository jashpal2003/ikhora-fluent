import { IsEmail, IsString, MinLength, IsOptional, IsEnum } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'

export class RegisterDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  email: string

  @ApiProperty({ example: 'John Doe' })
  @IsString()
  @MinLength(2)
  name: string

  @ApiProperty({ example: 'SecurePass123!' })
  @IsString()
  @MinLength(8)
  password: string

  @ApiProperty({ required: false, example: 'en' })
  @IsOptional()
  @IsString()
  nativeLanguage?: string

  @ApiProperty({ required: false, enum: ['IELTS', 'CEFR', 'TOEFL', 'PTE', 'DET'] })
  @IsOptional()
  @IsEnum(['IELTS', 'CEFR', 'TOEFL', 'PTE', 'DET'])
  targetExam?: string
}

export class LoginDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  email: string

  @ApiProperty({ example: 'SecurePass123!' })
  @IsString()
  password: string
}

export class RefreshTokenDto {
  @IsString()
  refreshToken: string
}
