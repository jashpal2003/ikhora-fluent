import { NestFactory } from '@nestjs/core'
import { ValidationPipe, Logger } from '@nestjs/common'
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger'
import { ConfigService } from '@nestjs/config'
import compression from 'compression'
import helmet from 'helmet'
import { AppModule } from './app.module'

async function bootstrap() {
  const logger = new Logger('Bootstrap')
  const app = await NestFactory.create(AppModule)
  const configService = app.get(ConfigService)

  // Security
  app.use(helmet())
  app.use(compression())

  // CORS
  app.enableCors({
    origin: configService.get('APP_URL') || 'http://localhost:3000',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Organization-Id'],
  })

  // Global prefix
  app.setGlobalPrefix('api')

  // Validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  )

  // Swagger docs (dev only)
  if (configService.get('NODE_ENV') !== 'production') {
    const config = new DocumentBuilder()
      .setTitle('Ikhora Fluent API')
      .setDescription('Complete API for the Ikhora Fluent learning platform')
      .setVersion('1.0')
      .addBearerAuth()
      .addTag('auth', 'Authentication endpoints')
      .addTag('organizations', 'Organization management')
      .addTag('content', 'Content library management')
      .addTag('writing', 'IELTS writing practice')
      .addTag('speaking', 'IELTS speaking practice')
      .addTag('reading', 'IELTS reading practice')
      .addTag('listening', 'IELTS listening practice')
      .addTag('cefr', 'CEFR language hub tools')
      .addTag('assignments', 'Teacher assignments')
      .addTag('reports', 'Analytics and reports')
      .addTag('billing', 'Subscriptions and billing')
      .addTag('certificates', 'CEFR certificates')
      .addTag('admin', 'Super admin operations')
      .build()

    const document = SwaggerModule.createDocument(app, config)
    SwaggerModule.setup('api/docs', app, document, {
      swaggerOptions: { persistAuthorization: true },
    })
    logger.log('Swagger docs available at /api/docs')
  }

  const port = configService.get<number>('PORT') || 4000
  await app.listen(port)
  logger.log(`🚀 Ikhora Fluent API running on http://localhost:${port}/api`)
  logger.log(`📚 Docs: http://localhost:${port}/api/docs`)
}

bootstrap()
