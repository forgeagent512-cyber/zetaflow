import { apiClient } from "@/services/api/client";
import type { CMSPage, ThemeConfig, BlogPost, DocPage, Announcement, FormDefinition, EmailTemplate, MediaItem, StoreProduct, WorkflowTemplate, ProductReview, StoreDeployment } from "@/types/cms";

class CMSService {
  private readonly basePath = "/api/cms";

  async getPages(): Promise<CMSPage[]> {
    const response = await apiClient.get<{ data: CMSPage[] }>(`${this.basePath}/pages`);
    return response.data.data;
  }

  async getPage(id: string): Promise<CMSPage> {
    const response = await apiClient.get<{ data: CMSPage }>(`${this.basePath}/pages/${id}`);
    return response.data.data;
  }

  async savePage(page: CMSPage): Promise<CMSPage> {
    const response = await apiClient.post<{ data: CMSPage }>(`${this.basePath}/pages`, page);
    return response.data.data;
  }

  async deletePage(id: string): Promise<void> {
    await apiClient.delete(`${this.basePath}/pages/${id}`);
  }

  async getTheme(): Promise<ThemeConfig> {
    const response = await apiClient.get<{ data: ThemeConfig }>(`${this.basePath}/theme`);
    return response.data.data;
  }

  async saveTheme(theme: ThemeConfig): Promise<ThemeConfig> {
    const response = await apiClient.post<{ data: ThemeConfig }>(`${this.basePath}/theme`, theme);
    return response.data.data;
  }

  async getBlogPosts(): Promise<BlogPost[]> {
    const response = await apiClient.get<{ data: BlogPost[] }>(`${this.basePath}/blog`);
    return response.data.data;
  }

  async saveBlogPost(post: BlogPost): Promise<BlogPost> {
    const response = await apiClient.post<{ data: BlogPost }>(`${this.basePath}/blog`, post);
    return response.data.data;
  }

  async getProducts(): Promise<StoreProduct[]> {
    const response = await apiClient.get<{ data: StoreProduct[] }>(`${this.basePath}/store/products`);
    return response.data.data;
  }

  async saveProduct(product: StoreProduct): Promise<StoreProduct> {
    const response = await apiClient.post<{ data: StoreProduct }>(`${this.basePath}/store/products`, product);
    return response.data.data;
  }

  async deleteProduct(id: string): Promise<void> {
    await apiClient.delete(`${this.basePath}/store/products/${id}`);
  }

  async getTemplates(): Promise<WorkflowTemplate[]> {
    const response = await apiClient.get<{ data: WorkflowTemplate[] }>(`${this.basePath}/store/templates`);
    return response.data.data;
  }

  async saveTemplate(template: WorkflowTemplate): Promise<WorkflowTemplate> {
    const response = await apiClient.post<{ data: WorkflowTemplate }>(`${this.basePath}/store/templates`, template);
    return response.data.data;
  }

  async deleteTemplate(id: string): Promise<void> {
    await apiClient.delete(`${this.basePath}/store/templates/${id}`);
  }

  async getReviews(productId: string): Promise<ProductReview[]> {
    const response = await apiClient.get<{ data: ProductReview[] }>(`${this.basePath}/store/reviews/${productId}`);
    return response.data.data;
  }

  async submitReview(review: ProductReview): Promise<ProductReview> {
    const response = await apiClient.post<{ data: ProductReview }>(`${this.basePath}/store/reviews`, review);
    return response.data.data;
  }

  async getDeployments(): Promise<StoreDeployment[]> {
    const response = await apiClient.get<{ data: StoreDeployment[] }>(`${this.basePath}/store/deployments`);
    return response.data.data;
  }

  async deployProduct(productId: string, config: Record<string, unknown>): Promise<StoreDeployment> {
    const response = await apiClient.post<{ data: StoreDeployment }>(`${this.basePath}/store/deploy`, { productId, config });
    return response.data.data;
  }

  async getPurchases(): Promise<StoreProduct[]> {
    const response = await apiClient.get<{ data: StoreProduct[] }>(`${this.basePath}/store/purchases`);
    return response.data.data;
  }

  async purchaseProduct(productId: string, license: string): Promise<{ id: string }> {
    const response = await apiClient.post<{ data: { id: string } }>(`${this.basePath}/store/purchase`, { productId, license });
    return response.data.data;
  }

  async publishToStore(projectId: string, listing: Partial<StoreProduct>): Promise<StoreProduct> {
    const response = await apiClient.post<{ data: StoreProduct }>(`${this.basePath}/store/publish`, { projectId, listing });
    return response.data.data;
  }

  async deleteBlogPost(id: string): Promise<void> {
    await apiClient.delete(`${this.basePath}/blog/${id}`);
  }

  async getDocs(): Promise<DocPage[]> {
    const response = await apiClient.get<{ data: DocPage[] }>(`${this.basePath}/docs`);
    return response.data.data;
  }

  async saveDoc(doc: DocPage): Promise<DocPage> {
    const response = await apiClient.post<{ data: DocPage }>(`${this.basePath}/docs`, doc);
    return response.data.data;
  }

  async uploadMedia(file: File, folder: string): Promise<MediaItem> {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", folder);
    const response = await apiClient.post<{ data: MediaItem }>(`${this.basePath}/media/upload`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data.data;
  }

  async getAnnouncements(): Promise<Announcement[]> {
    const response = await apiClient.get<{ data: Announcement[] }>(`${this.basePath}/announcements`);
    return response.data.data;
  }

  async saveAnnouncement(announcement: Announcement): Promise<Announcement> {
    const response = await apiClient.post<{ data: Announcement }>(`${this.basePath}/announcements`, announcement);
    return response.data.data;
  }

  async getForms(): Promise<FormDefinition[]> {
    const response = await apiClient.get<{ data: FormDefinition[] }>(`${this.basePath}/forms`);
    return response.data.data;
  }

  async saveForm(form: FormDefinition): Promise<FormDefinition> {
    const response = await apiClient.post<{ data: FormDefinition }>(`${this.basePath}/forms`, form);
    return response.data.data;
  }

  async getEmailTemplates(): Promise<EmailTemplate[]> {
    const response = await apiClient.get<{ data: EmailTemplate[] }>(`${this.basePath}/email-templates`);
    return response.data.data;
  }

  async saveEmailTemplate(template: EmailTemplate): Promise<EmailTemplate> {
    const response = await apiClient.post<{ data: EmailTemplate }>(`${this.basePath}/email-templates`, template);
    return response.data.data;
  }

  async search(query: string): Promise<unknown[]> {
    const response = await apiClient.get<{ data: unknown[] }>(`${this.basePath}/search`, { params: { q: query } });
    return response.data.data;
  }
}

export const cmsService = new CMSService();
