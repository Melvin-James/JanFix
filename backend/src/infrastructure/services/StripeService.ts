import Stripe from "stripe";
import { env } from "../config/env.ts";

export interface CreatePaymentIntentParams {
  amountPaise: number;
  currency?: string;
  metadata: Record<string, string>;
  idempotencyKey?: string;
}

export class StripeService {
  private _stripe: Stripe;

  constructor() {
    this._stripe = new Stripe(env.STRIPE_SECRET_KEY, {
      apiVersion: "2025-02-24.acacia" as unknown as Stripe.LatestApiVersion,
    });
  }

  async createPaymentIntent(
    params: CreatePaymentIntentParams
  ): Promise<Stripe.PaymentIntent> {
    const currency = (params.currency || env.STRIPE_CURRENCY || "inr").toLowerCase();

    return await this._stripe.paymentIntents.create(
      {
        amount: params.amountPaise,
        currency,
        automatic_payment_methods: {
          enabled: true,
        },
        metadata: params.metadata,
      },
      params.idempotencyKey
        ? { idempotencyKey: params.idempotencyKey }
        : undefined
    );
  }

  constructWebhookEvent(
    payload: Buffer | string,
    signature: string
  ): Stripe.Event {
    return this._stripe.webhooks.constructEvent(
      payload,
      signature,
      env.STRIPE_WEBHOOK_SECRET
    );
  }

  async retrievePaymentIntent(
    paymentIntentId: string
  ): Promise<Stripe.PaymentIntent> {
    return await this._stripe.paymentIntents.retrieve(paymentIntentId);
  }
}
