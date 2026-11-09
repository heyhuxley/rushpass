import {
  BadRequestException,
  ConflictException,
  HttpException,
  HttpStatus,
  Injectable,
  RequestTimeoutException,
} from '@nestjs/common';
import { Stripe } from 'stripe';
import { CreateCheckoutInput } from './stripe.types.js';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class StripeClient {
  private readonly stripe: Stripe;

  constructor(config: ConfigService) {
    const stripeKey = config.getOrThrow<string>('STRIPE_SECRET_KEY');
    if (
      config.get<string>('NODE_ENV') !== 'production' &&
      !/^(sk|rk)_test_/.test(stripeKey)
    ) {
      throw new Error('Non-production environments must use a Stripe test key');
    }
    this.stripe = new Stripe(stripeKey, { timeout: 1000 });
  }

  async createCheckoutSession(input: CreateCheckoutInput) {
    try {
      const session = await this.stripe.checkout.sessions.create({
        line_items: input.lines.map((l) => ({
          quantity: l.quantity,
          price_data: {
            currency: input.currency,
            unit_amount: l.unitAmount,
            product_data: { name: l.name },
          },
        })),
        mode: 'payment',
        success_url: input.successUrl,
      });

      return { sessionId: session.id, url: session.url };
    } catch (err) {
      if (err instanceof Stripe.errors.StripeError) {
        switch (err.type) {
          case 'StripeInvalidRequestError':
            throw new BadRequestException('Invalid parameters supplied');

          case 'StripeIdempotencyError':
            throw new ConflictException(
              'An idempotency key was used improperly',
            );

          case 'StripeRateLimitError':
            throw new HttpException(
              'Too many requests',
              HttpStatus.TOO_MANY_REQUESTS,
            );

          case 'StripeConnectionError':
            throw new RequestTimeoutException('Request timed out');

          default:
            throw new HttpException(err.message, err.statusCode || 500, {
              cause: err.cause,
              errorCode: err.code,
            });
        }
      }
      throw err;
    }
  }
}
