import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { UsersModule } from './modules/users/users.module.js';
import { ApiKeyMiddleware } from './middleware/api-key.middleware.js';
import { PrismaModule } from './infra/prisma/prisma.module.js';
import { AuthModule } from './modules/auth/auth.module.js';
import { AuthenticationModule } from '@nestjs/authentication';
import { OtpModule } from './modules/otp/otp.module.js';
import { minutes, ThrottlerModule } from '@nestjs/throttler';
import { RedisModule } from './infra/redis/redis.module.js';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { z } from 'zod';
import { FileTemplateEngine, MailModule } from '@nestjs/mail';
import { join } from 'node:path';
import { EmailVerificationMail } from './modules/notifications/email-verification.mail.js';
import { NotificationsModule } from './modules/notifications/notifications.module.js';
import { mailTransport } from './mail-transport.js';
import { EventsModule } from './modules/events/events.module.js';

@Module({
  imports: [
    UsersModule,
    PrismaModule,
    AuthModule,
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: z.object({
        PORT: z.coerce.number().default(3000),
        JWT_SECRET: z.string().min(64),
        JWT_ISSUER: z.string().startsWith('http'),
        HMAC_SECRET: z.string().min(10),
      }),
    }),
    AuthenticationModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        accessToken: {
          key: config.getOrThrow<string>('JWT_SECRET'),
          issuer: config.getOrThrow<string>('JWT_ISSUER'),
          audience: 'rushpass',
          ttl: '15m',
        },
        refreshToken: false,
      }),
    }),
    OtpModule,
    ThrottlerModule.forRoot({
      throttlers: [
        {
          ttl: minutes(10),
          limit: 5,
        },
      ],
    }),
    RedisModule,
    MailModule.forRootAsync({
      useFactory: () => ({
        transport: mailTransport(),
        templates: new FileTemplateEngine({
          dir: join(import.meta.dirname, './modules/mail/templates'),
          layout: 'layout',
          cache: process.env.NODE_ENV === 'production',
        }),
        from: 'RushPass Team <noreply@rushpass.test>',
      }),
    }),
    NotificationsModule,
    EventsModule,
  ],
  controllers: [AppController],
  providers: [AppService, EmailVerificationMail],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): any {
    consumer
      .apply(ApiKeyMiddleware)
      .forRoutes({ path: 'user/:id', method: RequestMethod.GET });
  }
}
