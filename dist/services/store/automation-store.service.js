import { randomUUID } from 'node:crypto';
export class AutomationStoreService {
    async listProducts(supabase, filters) {
        let query = supabase.from('marketplace_products').select('*').eq('status', 'published').order('created_at', { ascending: false });
        if (filters?.category)
            query = query.eq('category_id', filters.category);
        if (filters?.industry)
            query = query.eq('industry_module', filters.industry);
        if (filters?.search)
            query = query.ilike('product_name', `%${filters.search}%`);
        const { data } = await query;
        return (data ?? []).map(p => ({
            id: p.id,
            name: p.product_name,
            description: p.description ?? '',
            shortDescription: p.short_description ?? '',
            category: p.category_id ?? '',
            industry: p.industry_module ?? '',
            price: Number(p.price ?? 0),
            salePrice: p.sale_price ? Number(p.sale_price) : undefined,
            thumbnailUrl: p.thumbnail_url,
            rating: Number(p.rating ?? 0),
            totalDownloads: p.downloads ?? 0,
            totalInstalls: p.installs ?? 0,
            status: p.status,
            createdAt: p.created_at,
        }));
    }
    async publishProduct(supabase, orgId, request) {
        const slug = request.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        const { data, error } = await supabase.from('marketplace_products').insert({
            organization_id: orgId,
            template_id: request.templateId,
            product_name: request.name,
            slug: `${slug}-${randomUUID().slice(0, 8)}`,
            short_description: request.description.slice(0, 200),
            description: request.description,
            category_id: request.category,
            industry_module: request.industry,
            price: request.price,
            thumbnail_url: request.thumbnailUrl,
            status: 'published',
            visibility: 'public',
        }).select('*').single();
        if (error || !data)
            throw new Error(error?.message ?? 'Failed to publish product');
        return {
            id: data.id,
            name: data.product_name,
            description: data.description ?? '',
            shortDescription: data.short_description ?? '',
            category: data.category_id ?? '',
            industry: data.industry_module ?? '',
            price: Number(data.price ?? 0),
            thumbnailUrl: data.thumbnail_url,
            rating: Number(data.rating ?? 0),
            totalDownloads: data.downloads ?? 0,
            totalInstalls: data.installs ?? 0,
            status: data.status,
            createdAt: data.created_at,
        };
    }
    async purchaseProduct(supabase, orgId, userId, productId) {
        const { data: product } = await supabase.from('marketplace_products').select('*').eq('id', productId).single();
        if (!product)
            throw new Error('Product not found');
        const orderNumber = `ORD-${Date.now()}-${randomUUID().slice(0, 6)}`;
        const { data: order } = await supabase.from('marketplace_orders').insert({
            organization_id: orgId,
            user_id: userId,
            order_number: orderNumber,
            total_amount: product.price,
            currency: 'USD',
            payment_status: 'paid',
            order_status: 'completed',
        }).select('*').single();
        if (!order)
            throw new Error('Order creation failed');
        const licenseKey = `AF-${randomUUID().toUpperCase().slice(0, 16)}`;
        await supabase.from('licenses').insert({
            organization_id: orgId,
            product_id: productId,
            license_key: licenseKey,
            status: 'active',
        });
        return { orderId: order.id, licenseKey };
    }
    async getProductDetail(supabase, productId) {
        const { data } = await supabase.from('marketplace_products').select('*').eq('id', productId).maybeSingle();
        if (!data)
            return null;
        return {
            id: data.id,
            name: data.product_name,
            description: data.description ?? '',
            shortDescription: data.short_description ?? '',
            category: data.category_id ?? '',
            industry: data.industry_module ?? '',
            price: Number(data.price ?? 0),
            salePrice: data.sale_price ? Number(data.sale_price) : undefined,
            thumbnailUrl: data.thumbnail_url,
            rating: Number(data.rating ?? 0),
            totalDownloads: data.downloads ?? 0,
            totalInstalls: data.installs ?? 0,
            status: data.status,
            createdAt: data.created_at,
        };
    }
    async getCategories(supabase) {
        const { data } = await supabase.from('product_categories').select('*').eq('status', 'active');
        return (data ?? []).map(c => ({ id: c.id, name: c.category_name, description: c.description ?? '' }));
    }
}
