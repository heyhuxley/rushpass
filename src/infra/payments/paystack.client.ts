import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  InitializePaymentInput,
  VerifyPaymentInput,
} from './paystack.types.js';
import axios from 'axios';

@Injectable()
export class PaystackClient {
  private readonly baseUrl = 'https://api.paystack.co';
  private readonly SECRET_KEY: string;

  constructor(private readonly config: ConfigService) {
    this.SECRET_KEY = this.config.getOrThrow<string>('PAYSTACK_SECRET_KEY');
  }

  async initialize({ email, amountKobo, reference }: InitializePaymentInput) {
    try {
      const response = await axios({
        baseURL: this.baseUrl,
        url: '/transaction/initialize',
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.SECRET_KEY}`,
          'Content-Type': 'application/json',
        },
        data: {
          email,
          amount: amountKobo,
          currency: 'NGN',
          reference,
        },
      });

      return response.data;
    } catch (err) {
      if (err instanceof Error) throw new BadRequestException(err.message);
      throw err;
    }
  }

  async verify({ reference }: VerifyPaymentInput) {
    const response = await axios({
      baseURL: this.baseUrl,
      url: `/transaction/verify/${reference}`,
      method: 'GET',
      headers: {
        Authorization: `Bearer ${this.SECRET_KEY}`,
      },
      data: {
        reference,
      },
    });

    return response.data;
  }
}
