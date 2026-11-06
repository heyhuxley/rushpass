export interface InitializePaymentInput {
  email: string;
  amountKobo: number;
  reference: string;
}

export interface VerifyPaymentInput {
  reference: string
}