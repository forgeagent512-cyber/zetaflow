import { apiClient } from "@/services/api/client";
import type { Invoice, Quote, Subscription, Coupon, PaymentMethod } from "@/types";

class BillingService {
  private readonly basePath = "/api/billing";

  async getPlans(): Promise<{ data: unknown[] }> {
    const response = await apiClient.get(`${this.basePath}/plans`);
    return response.data;
  }

  async getSubscription(): Promise<{ data: Subscription }> {
    const response = await apiClient.get<{ data: Subscription }>(`${this.basePath}/subscription`);
    return response.data;
  }

  async getInvoices(): Promise<{ data: Invoice[] }> {
    const response = await apiClient.get<{ data: Invoice[] }>(`${this.basePath}/invoices`);
    return response.data;
  }

  async getInvoicePdf(invoiceId: string): Promise<Blob> {
    const response = await apiClient.get(`${this.basePath}/invoices/${invoiceId}/pdf`, { responseType: "blob" });
    return response.data;
  }

  async getQuotes(): Promise<{ data: Quote[] }> {
    const response = await apiClient.get<{ data: Quote[] }>(`${this.basePath}/quotes`);
    return response.data;
  }

  async createQuote(quote: Partial<Quote>): Promise<{ data: Quote }> {
    const response = await apiClient.post<{ data: Quote }>(`${this.basePath}/quotes`, quote);
    return response.data;
  }

  async acceptQuote(quoteId: string): Promise<{ data: Invoice }> {
    const response = await apiClient.post<{ data: Invoice }>(`${this.basePath}/quotes/${quoteId}/accept`);
    return response.data;
  }

  async getPaymentMethods(): Promise<{ data: PaymentMethod[] }> {
    const response = await apiClient.get<{ data: PaymentMethod[] }>(`${this.basePath}/payment-methods`);
    return response.data;
  }

  async getUsage(): Promise<{ data: unknown }> {
    const response = await apiClient.get(`${this.basePath}/usage`);
    return response.data;
  }

  async getCoupons(): Promise<{ data: Coupon[] }> {
    const response = await apiClient.get<{ data: Coupon[] }>(`${this.basePath}/coupons`);
    return response.data;
  }

  async validateCoupon(code: string): Promise<{ data: Coupon & { valid: boolean; message: string } }> {
    const response = await apiClient.post(`${this.basePath}/coupons/validate`, { code });
    return response.data;
  }

  async getRevenue(): Promise<{ data: { total: number; mrr: number; arr: number } }> {
    const response = await apiClient.get<{ data: { total: number; mrr: number; arr: number } }>(`${this.basePath}/admin/revenue`);
    return response.data;
  }

  async getFailingPayments(): Promise<{ data: unknown[] }> {
    const response = await apiClient.get(`${this.basePath}/admin/failed-payments`);
    return response.data;
  }

  async sendInvoiceEmail(invoiceId: string): Promise<void> {
    await apiClient.post(`${this.basePath}/invoices/${invoiceId}/send`);
  }

  async createOneTimePayment(amount: number, description: string): Promise<{ checkoutUrl: string }> {
    const response = await apiClient.post<{ data: { checkoutUrl: string } }>(`${this.basePath}/payments/one-time`, { amount, description });
    return response.data.data;
  }
}

export const billingService = new BillingService();
