import { Module } from '@nestjs/common';
import { PaystackClient } from './paystack.client.js';
import { ConfigService } from '@nestjs/config';

@Module({
  providers: [PaystackClient, ConfigService],
  exports: [PaystackClient],
})
export class PaystackModule {}
