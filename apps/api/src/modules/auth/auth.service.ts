import { Injectable, UnauthorizedException, ConflictException, Logger } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { ConfigService } from '@nestjs/config'
import * as bcrypt from 'bcryptjs'
import { PrismaService } from '../../prisma/prisma.service'
import type { RegisterDto, LoginDto } from './auth.dto'

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name)

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {}

  async register(dto: RegisterDto) {
    // Check duplicate email
    const existing = await this.prisma.user.findUnique({ where: { email: dto.email.toLowerCase() } })
    if (existing) throw new ConflictException('Email already registered')

    const hashedPassword = await bcrypt.hash(dto.password, 12)

    const user = await this.prisma.user.create({
      data: {
        email: dto.email.toLowerCase(),
        name: dto.name,
        hashedPassword,
        nativeLanguage: dto.nativeLanguage,
        targetExam: dto.targetExam as any,
        emailVerified: false,
      },
      select: { id: true, email: true, name: true, globalRole: true, createdAt: true },
    })

    // Create empty skill profile
    await this.prisma.studentSkillProfile.create({
      data: { userId: user.id },
    })

    const tokens = await this.generateTokens(user.id, user.email, user.globalRole)
    this.logger.log(`New user registered: ${user.email}`)
    return { user, ...tokens }
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
      select: { id: true, email: true, name: true, hashedPassword: true, globalRole: true, emailVerified: true },
    })

    if (!user || !user.hashedPassword) throw new UnauthorizedException('Invalid credentials')

    const passwordValid = await bcrypt.compare(dto.password, user.hashedPassword)
    if (!passwordValid) throw new UnauthorizedException('Invalid credentials')

    // Update last login
    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    })

    const tokens = await this.generateTokens(user.id, user.email, user.globalRole)
    const { hashedPassword: _, ...safeUser } = user
    return { user: safeUser, ...tokens }
  }

  async getMe(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true, email: true, name: true, globalRole: true, avatarUrl: true,
        nativeLanguage: true, targetExam: true, targetBand: true, emailVerified: true,
        createdAt: true, lastLoginAt: true,
        orgMemberships: {
          include: { organization: { select: { id: true, name: true, slug: true, logoUrl: true } } },
        },
        skillProfile: true,
      },
    })
    if (!user) throw new UnauthorizedException()
    return user
  }

  private async generateTokens(userId: string, email: string, role: string) {
    const payload = { sub: userId, email, role }
    const accessToken = await this.jwt.signAsync(payload, {
      secret: this.config.getOrThrow('NEXTAUTH_SECRET'),
      expiresIn: '15m',
    })
    const refreshToken = await this.jwt.signAsync(payload, {
      secret: this.config.getOrThrow('NEXTAUTH_SECRET'),
      expiresIn: '30d',
    })
    return { accessToken, refreshToken }
  }

  async validateToken(token: string) {
    try {
      return await this.jwt.verifyAsync(token, {
        secret: this.config.getOrThrow('NEXTAUTH_SECRET'),
      })
    } catch {
      throw new UnauthorizedException('Invalid or expired token')
    }
  }
}
