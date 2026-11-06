import { Test, TestingModule } from '@nestjs/testing';
import { PaystackClient } from './paystack.client.js';

describe('PaystackClient', () => {
  let provider: PaystackClient;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PaystackClient],
    }).compile();

    provider = module.get<PaystackClient>(PaystackClient);
  });

  it('should be defined', () => {
    expect(provider).toBeDefined();
  });
});
