// Stripe payment integration
import { loadStripe, Stripe } from '@stripe/stripe-js';

// Get publishable key from environment
const stripePublishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '';

// Check if Stripe is configured
export const isStripeConfigured = stripePublishableKey && 
  !stripePublishableKey.includes('your_key') &&
  stripePublishableKey.startsWith('pk_');

// Stripe instance (lazy loaded)
let stripePromise: Promise<Stripe | null> | null = null;

export function getStripe(): Promise<Stripe | null> {
  if (!stripePromise && isStripeConfigured) {
    stripePromise = loadStripe(stripePublishableKey);
  }
  return stripePromise || Promise.resolve(null);
}

export interface PaymentIntentData {
  amount: number;
  currency: string;
  orderNumber: string;
  customerEmail: string;
  customerName: string;
}

export interface PaymentResult {
  success: boolean;
  clientSecret?: string;
  error?: string;
}

// Create payment intent via API
export async function createPaymentIntent(data: PaymentIntentData): Promise<PaymentResult> {
  try {
    const response = await fetch('/api/create-payment-intent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      return {
        success: false,
        error: error.message || 'Failed to create payment intent',
      };
    }

    const result = await response.json();
    return {
      success: true,
      clientSecret: result.clientSecret,
    };
  } catch (error) {
    console.error('Payment intent error:', error);
    return {
      success: false,
      error: 'Network error. Please try again.',
    };
  }
}

// Format amount for Stripe (convert dollars to cents)
export function formatAmountForStripe(amount: number): number {
  return Math.round(amount * 100);
}

// Format amount from Stripe (convert cents to dollars)
export function formatAmountFromStripe(amount: number): number {
  return amount / 100;
}
