import { HttpAdapterHost, NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import helmet from 'helmet'
import * as compression from 'compression'
import * as cookieParser from 'cookie-parser'
import { ValidationPipe } from '@nestjs/common'
import { PrismaClientExceptionFilter } from './prisma-client-exception/prisma-client-exception.filter'
import { NestExpressApplication } from '@nestjs/platform-express'
import { join } from 'path'
import { AllExceptionsFilter } from './filter/http.exception-filter'

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    bufferLogs: true,
    logger: ['error', 'warn', 'debug', 'log', 'verbose'],
  })
  const httpAdapter = app.get(HttpAdapterHost)
  app.useGlobalFilters(new AllExceptionsFilter(httpAdapter))
  app.useGlobalFilters(new PrismaClientExceptionFilter(httpAdapter.httpAdapter))

  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: 'cross-origin' },
    }),
  )
  app.setGlobalPrefix('api')
  app.use(compression())
  app.enableCors({
    origin: ['http://localhost:3001', 'http://localhost'],
    credentials: true,
  })
  app.use(cookieParser())
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  )
  app.useStaticAssets(join(__dirname, '..', 'uploads'), {
    prefix: '/public',
  })
  await app.listen(3000)
}
bootstrap()
