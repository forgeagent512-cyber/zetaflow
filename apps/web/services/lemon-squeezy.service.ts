import { apiClient } from "@/services/api/client";

class LemonSqueezyService {
  private readonly basePath = "/api/billing/lemon-squeezy";

  async createCheckout(variantId: string, customerEmail: string): Promise<{ url: string }> {
    const response = await apiClient.post<{ data: { url: string } }>(`${this.basePath}/checkout`, { variantId, customerEmail });
    return response.data.data;
  }

  async createCustomerPortal(customerId: string): Promise<{ url: string }> {
    const response = await apiClient.post<{ data: { url: string } }>(`${this.basePath}/customer-portal`, { customerId });
    return response.data.data;
  }

  async getLicenseKey(orderId: string): Promise<{ licenseKey: string; activationLimit: number }> {
    const response = await apiClient.get<{ data: { licenseKey: string; activationLimit: number } }>(`${this.basePath}/license-keys/${orderId}`);
    return response.data.data;
  }

  async validateLicenseKey(licenseKey: string): Promise<{ valid: boolean; instance?: unknown }> {
    const response = await apiClient.post<{ data: { valid: boolean; instance?: unknown } }>(`${this.basePath}/license-keys/validate`, { licenseKey });
    return response.data.data;
  }

  async getProducts(): Promise<{ data: unknown[] }> {
    const response = await apiClient.get(`${this.basePath}/products`);
    return response.data;
  }

  async getVariants(productId: string): Promise<{ data: unknown[] }> {
    const response = await apiClient.get(`${this.basePath}/products/${productId}/variants`);
    return response.data;
  }

  async createSubscription(variantId: string, customerEmail: string): Promise<{ subscriptionId: string; url: string }> {
    const response = await apiClient.post<{ data: { subscriptionId: string; url: string } }>(`${this.basePath}/subscriptions`, { variantId, customerEmail });
    return response.data.data;
  }

  async cancelSubscription(subscriptionId: string): Promise<void> {
    await apiClient.post(`${this.basePath}/subscriptions/${subscriptionId}/cancel`);
  }
}

export const lemonSqueezyService = new LemonSqueezyService();
