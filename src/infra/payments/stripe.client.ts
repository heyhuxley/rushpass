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
  private readonly webhookSecret: string;

  constructor(config: ConfigService) {
    const stripeKey = config.getOrThrow<string>('STRIPE_SECRET_KEY');
    if (
      config.get<string>('NODE_ENV') !== 'production' &&
      !/^(sk|rk)_test_/.test(stripeKey)
    ) {
      throw new Error('Non-production environments must use a Stripe test key');
    }
    this.webhookSecret = config.getOrThrow<string>('STRIPE_WEBHOOK_SECRET');
    this.stripe = new Stripe(stripeKey, { timeout: 1000 });
  }

  async createCheckoutSession(input: CreateCheckoutInput) {
    try {
      const session = await this.stripe.checkout.sessions.create(
        {
          line_items: input.lines.map((l) => ({
            quantity: l.quantity,
            price_data: {
              currency: input.currency,
              unit_amount: l.unitAmount,
              product_data: { name: l.name },
            },
          })),
          mode: 'payment',
          customer_email: input.email,
          client_reference_id: input.orderId,
          metadata: { orderId: input.orderId },
          success_url: input.successUrl,
          cancel_url: input.cancelUrl,
          // expires_at: Math.floor(input.expiresAt.getTime() / 1000),
        },
        { idempotencyKey: input.reference },
      );

      return { sessionId: session.id, url: session.url };
    } catch (err) {
      if (err instanceof Stripe.errors.StripeError) {
        switch (err.type) {
          case 'StripeInvalidRequestError':
            console.log(err);

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

  async fulfillCheckout(
    sessionId: string,
  ): Promise<Stripe.Checkout.Session | undefined> {
    return await this.stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['line_items'],
    });
  }

  constructWebhookEvent(rawBody: Buffer, signature: string | undefined) {
    if (!signature) throw new BadRequestException('Missing webhook signature');
    try {
      return this.stripe.webhooks.constructEvent(
        rawBody,
        signature,
        this.webhookSecret,
      );
    } catch (err) {
      if (err instanceof Stripe.errors.StripeError) {
        throw new BadRequestException('Invalid webhook signature', {
          cause: err.cause,
        });
      }
      throw err;
    }
  }
}
