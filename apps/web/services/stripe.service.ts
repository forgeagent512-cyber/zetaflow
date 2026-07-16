import { apiClient } from "@/services/api/client";
import type { PaymentMethod, PaymentTransaction } from "@/types";

class StripeService {
  private readonly basePath = "/api/billing/stripe";

  async createCheckoutSession(priceId: string, customerId?: string): Promise<{ url: string; sessionId: string }> {
    const response = await apiClient.post<{ data: { url: string; sessionId: string } }>(`${this.basePath}/create-checkout`, { priceId, customerId });
    return response.data.data;
  }

  async createCustomerPortal(customerId: string): Promise<{ url: string }> {
    const response = await apiClient.post<{ data: { url: string } }>(`${this.basePath}/customer-portal`, { customerId });
    return response.data.data;
  }

  async createSubscription(priceId: string, paymentMethodId: string): Promise<{ subscriptionId: string; clientSecret: string }> {
    const response = await apiClient.post<{ data: { subscriptionId: string; clientSecret: string } }>(`${this.basePath}/subscriptions`, { priceId, paymentMethodId });
    return response.data.data;
  }

  async cancelSubscription(subscriptionId: string): Promise<void> {
    await apiClient.post(`${this.basePath}/subscriptions/${subscriptionId}/cancel`);
  }

  async updateSubscription(subscriptionId: string, data: { priceId?: string; pause?: boolean; resume?: boolean }): Promise<void> {
    await apiClient.patch(`${this.basePath}/subscriptions/${subscriptionId}`, data);
  }

  async getInvoices(customerId: string): Promise<{ data: unknown[] }> {
    const response = await apiClient.get(`${this.basePath}/invoices`, { params: { customerId } });
    return response.data;
  }

  async createInvoice(customerId: string, items: { price: number; description: string }[]): Promise<{ invoiceId: string; invoiceUrl: string }> {
    const response = await apiClient.post<{ data: { invoiceId: string; invoiceUrl: string } }>(`${this.basePath}/invoices`, { customerId, items });
    return response.data.data;
  }

  async setupPaymentMethod(): Promise<{ clientSecret: string }> {
    const response = await apiClient.post<{ data: { clientSecret: string } }>(`${this.basePath}/payment-methods/setup`);
    return response.data.data;
  }

  async getPaymentMethods(customerId: string): Promise<{ data: PaymentMethod[] }> {
    const response = await apiClient.get(`${this.basePath}/payment-methods`, { params: { customerId } });
    return response.data;
  }

  async createRefund(chargeId: string, amount?: number): Promise<{ refundId: string }> {
    const response = await apiClient.post<{ data: { refundId: string } }>(`${this.basePath}/refunds`, { chargeId, amount });
    return response.data.data;
  }

  async applyCoupon(subscriptionId: string, couponCode: string): Promise<void> {
    await apiClient.post(`${this.basePath}/coupons/apply`, { subscriptionId, couponCode });
  }
}

export const stripeService = new StripeService();
