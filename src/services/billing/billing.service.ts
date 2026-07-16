import Stripe from 'stripe';

export interface PricingPlan {
  id: string;
  name: string;
  tier: string;
  price: number;
  currency: string;
  interval: 'month' | 'year';
  features: string[];
  maxAiEmployees: number;
  maxWorkflows: number;
  maxUsers: number;
}

export interface InvoiceRecord {
  id: string;
  organizationId: string;
  amount: number;
  currency: string;
  status: 'pending' | 'paid' | 'failed' | 'refunded';
  description: string;
  createdAt: string;
  paidAt?: string;
}

export const PLANS: PricingPlan[] = [
  { id: 'starter', name: 'Starter', tier: 'economy', price: 0, currency: 'USD', interval: 'month', features: ['1 AI Employee', '5 Workflows', 'Basic Support'], maxAiEmployees: 1, maxWorkflows: 5, maxUsers: 1 },
  { id: 'growth', name: 'Growth', tier: 'balanced', price: 49, currency: 'USD', interval: 'month', features: ['5 AI Employees', '25 Workflows', 'Priority Support', 'API Access'], maxAiEmployees: 5, maxWorkflows: 25, maxUsers: 5 },
  { id: 'business', name: 'Business', tier: 'premium', price: 149, currency: 'USD', interval: 'month', features: ['Unlimited AI Employees', 'Unlimited Workflows', 'Priority Support', 'API Access', 'Custom Integrations'], maxAiEmployees: 999, maxWorkflows: 999, maxUsers: 25 },
  { id: 'enterprise', name: 'Enterprise', tier: 'enterprise', price: 499, currency: 'USD', interval: 'month', features: ['Everything in Business', 'Dedicated Support', 'SLA', 'Custom Development', 'White Label'], maxAiEmployees: 9999, maxWorkflows: 9999, maxUsers: 999 },
];

function getStripe(): Stripe | null {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return null;
  const instance = new Stripe(key);
  return instance;
}

export class BillingService {
  async createCheckoutSession(organizationId: string, planId: string, successUrl: string, cancelUrl: string): Promise<{ url: string | null; sessionId: string }> {
    const stripe = getStripe();

    if (!stripe) {
      return { url: null, sessionId: `mock_${crypto.randomUUID()}` };
    }

    const plan = PLANS.find(p => p.id === planId);
    if (!plan || plan.price === 0) {
      return { url: null, sessionId: `free_${crypto.randomUUID()}` };
    }

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      line_items: [{ price_data: { currency: plan.currency.toLowerCase(), product_data: { name: plan.name }, unit_amount: plan.price * 100, recurring: { interval: plan.interval } }, quantity: 1 }],
      client_reference_id: organizationId,
      metadata: { organizationId, planId },
      success_url: successUrl,
      cancel_url: cancelUrl,
    });

    return { url: session.url, sessionId: session.id };
  }

  async handleWebhook(payload: Buffer, signature: string): Promise<{ received: boolean; event?: string }> {
    const stripe = getStripe();
    if (!stripe) return { received: true, event: 'mock' };

    const event = stripe.webhooks.constructEvent(payload, signature, process.env.STRIPE_WEBHOOK_SECRET ?? '');
    return { received: true, event: event.type };
  }

  async getInvoices(organizationId: string): Promise<InvoiceRecord[]> {
    return [
      { id: 'inv_1', organizationId, amount: 4900, currency: 'USD', status: 'paid', description: 'Growth Plan - Monthly', createdAt: new Date().toISOString(), paidAt: new Date().toISOString() },
    ];
  }

  async getActivePlan(organizationId: string): Promise<PricingPlan> {
    return PLANS[1];
  }
}
