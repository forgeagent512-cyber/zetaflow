import Stripe from 'stripe';
export const PLANS = [
    { id: 'starter', name: 'Starter', tier: 'economy', price: 0, currency: 'USD', interval: 'month', features: ['1 AI Employee', '5 Workflows', 'Basic Support'], maxAiEmployees: 1, maxWorkflows: 5, maxUsers: 1 },
    { id: 'growth', name: 'Growth', tier: 'balanced', price: 49, currency: 'USD', interval: 'month', features: ['5 AI Employees', '25 Workflows', 'Priority Support', 'API Access'], maxAiEmployees: 5, maxWorkflows: 25, maxUsers: 5 },
    { id: 'business', name: 'Business', tier: 'premium', price: 149, currency: 'USD', interval: 'month', features: ['Unlimited AI Employees', 'Unlimited Workflows', 'Priority Support', 'API Access', 'Custom Integrations'], maxAiEmployees: 999, maxWorkflows: 999, maxUsers: 25 },
    { id: 'enterprise', name: 'Enterprise', tier: 'enterprise', price: 499, currency: 'USD', interval: 'month', features: ['Everything in Business', 'Dedicated Support', 'SLA', 'Custom Development', 'White Label'], maxAiEmployees: 9999, maxWorkflows: 9999, maxUsers: 999 },
];
function getStripe() {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key)
        return null;
    return new Stripe(key);
}
export class BillingService {
    async createCheckoutSession(organizationId, planId, successUrl, cancelUrl) {
        const stripe = getStripe();
        const plan = PLANS.find((candidate) => candidate.id === planId);
        if (!stripe || !plan || plan.price === 0) {
            return { url: null, sessionId: '' };
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
    async handleWebhook(payload, signature) {
        const stripe = getStripe();
        if (!stripe || !process.env.STRIPE_WEBHOOK_SECRET) {
            return { received: false, event: 'disabled' };
        }
        const event = stripe.webhooks.constructEvent(payload, signature, process.env.STRIPE_WEBHOOK_SECRET);
        return { received: true, event: event.type };
    }
    async getInvoices(organizationId) {
        return [];
    }
    async getActivePlan(organizationId) {
        return PLANS.find((plan) => plan.id === 'starter') ?? PLANS[0];
    }
}
