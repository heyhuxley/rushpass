
export interface CheckoutLine {
  name: string;
  unitAmount: number;
  quantity: number;
}

export interface CreateCheckoutInput {
  orderId: string;
  reference: string; // used as the idempotency key
  email: string;
  currency: string; // lowercase ISO code, e.g. 'usd'
  lines: CheckoutLine[];
  successUrl: string;
  cancelUrl: string;
  expiresAt: Date;
}
