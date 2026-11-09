import { Test, TestingModule } from '@nestjs/testing';
import { StripeClient } from './stripe.client.js';

describe('StripeClient', () => {
  let provider: StripeClient;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [StripeClient],
    }).compile();

    provider = module.get<StripeClient>(StripeClient);
  });

  it('should be defined', () => {
    expect(provider).toBeDefined();
  });
});
