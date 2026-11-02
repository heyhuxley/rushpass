import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { TransformInterceptor } from './utils/transform.interceptor.js';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.set('trust proxy', 'loopback');

  app.setGlobalPrefix('/api');
  app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true, forbidNonWhitelisted: true }));
  app.useGlobalInterceptors(new TransformInterceptor(app.get(Reflector)));

  app.enableShutdownHooks();
  await app.listen(process.env.PORT ?? 3000);
}
await bootstrap();
