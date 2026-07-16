import { apiClient } from "@/services/api/client";

class PayoneerService {
  private readonly basePath = "/api/billing/payoneer";

  async createInvoicePayment(invoiceId: string, clientEmail: string, amount: number, currency: string): Promise<{ paymentId: string; status: string }> {
    const response = await apiClient.post<{ data: { paymentId: string; status: string } }>(`${this.basePath}/invoice-payments`, { invoiceId, clientEmail, amount, currency });
    return response.data.data;
  }

  async createAgencyPayment(agencyId: string, amount: number, currency: string, description: string): Promise<{ paymentId: string; status: string }> {
    const response = await apiClient.post<{ data: { paymentId: string; status: string } }>(`${this.basePath}/agency-payments`, { agencyId, amount, currency, description });
    return response.data.data;
  }

  async sendInternationalPayment(recipientId: string, amount: number, currency: string, bankDetails: Record<string, string>): Promise<{ paymentId: string; status: string }> {
    const response = await apiClient.post<{ data: { paymentId: string; status: string } }>(`${this.basePath}/international-payments`, { recipientId, amount, currency, bankDetails });
    return response.data.data;
  }

  async getPaymentStatus(paymentId: string): Promise<{ status: string; verificationRequired: boolean }> {
    const response = await apiClient.get<{ data: { status: string; verificationRequired: boolean } }>(`${this.basePath}/payments/${paymentId}`);
    return response.data.data;
  }

  async approvePayment(paymentId: string): Promise<void> {
    await apiClient.post(`${this.basePath}/payments/${paymentId}/approve`);
  }

  async verifyBusiness(businessId: string, documents: FormData): Promise<{ verified: boolean; message: string }> {
    const response = await apiClient.post<{ data: { verified: boolean; message: string } }>(`${this.basePath}/businesses/${businessId}/verify`, documents, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data.data;
  }
}

export const payoneerService = new PayoneerService();
