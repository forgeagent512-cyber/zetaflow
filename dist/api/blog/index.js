import { Router } from 'express';
import { createClient } from '@supabase/supabase-js';
import { authenticate } from '../../middleware/auth.middleware.js';
const router = Router();
function getSupabase() {
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_ANON_KEY;
    if (!url || !key)
        throw new Error('Supabase configuration missing');
    return createClient(url, key, { auth: { persistSession: false } });
}
router.get('/posts', authenticate, async (req, res) => {
    try {
        const supabase = getSupabase();
        const orgId = req.organizationId;
        const { category, status, page = '1', limit = '10' } = req.query;
        let query = supabase.from('blog_posts').select('*').eq('organization_id', orgId);
        if (category)
            query = query.eq('category_id', category);
        if (status)
            query = query.eq('status', status);
        const offset = (Number(page) - 1) * Number(limit);
        const { data, error, count } = await query
            .order('created_at', { ascending: false })
            .range(offset, offset + Number(limit) - 1);
        if (error)
            throw new Error(error.message);
        res.json({ success: true, data: data ?? [], total: count ?? data?.length ?? 0, page: Number(page), limit: Number(limit) });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error instanceof Error ? error.message : 'Failed to list posts' });
    }
});
router.post('/posts', authenticate, async (req, res) => {
    try {
        const supabase = getSupabase();
        const orgId = req.organizationId;
        const { title, slug, content, excerpt, authorId, categoryId, tags, status, metaTitle, metaDescription } = req.body;
        if (!title || !slug || !content) {
            res.status(400).json({ success: false, message: 'Title, slug, and content are required' });
            return;
        }
        const { data, error } = await supabase.from('blog_posts').insert({
            organization_id: orgId, title, slug, content, excerpt, author_id: authorId,
            category_id: categoryId, tags, status: status ?? 'draft',
            meta_title: metaTitle, meta_description: metaDescription,
        }).select().single();
        if (error)
            throw new Error(error.message);
        res.status(201).json({ success: true, data });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error instanceof Error ? error.message : 'Failed to create post' });
    }
});
router.get('/posts/:id', authenticate, async (req, res) => {
    try {
        const supabase = getSupabase();
        const orgId = req.organizationId;
        const { id } = req.params;
        const { data, error } = await supabase.from('blog_posts').select('*').eq('id', id).eq('organization_id', orgId).single();
        if (error) {
            res.status(404).json({ success: false, message: 'Post not found' });
            return;
        }
        res.json({ success: true, data });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error instanceof Error ? error.message : 'Failed to get post' });
    }
});
router.put('/posts/:id', authenticate, async (req, res) => {
    try {
        const supabase = getSupabase();
        const orgId = req.organizationId;
        const { id } = req.params;
        const { title, slug, content, excerpt, authorId, categoryId, tags, status, metaTitle, metaDescription } = req.body;
        const updates = {};
        if (title !== undefined)
            updates.title = title;
        if (slug !== undefined)
            updates.slug = slug;
        if (content !== undefined)
            updates.content = content;
        if (excerpt !== undefined)
            updates.excerpt = excerpt;
        if (authorId !== undefined)
            updates.author_id = authorId;
        if (categoryId !== undefined)
            updates.category_id = categoryId;
        if (tags !== undefined)
            updates.tags = tags;
        if (status !== undefined)
            updates.status = status;
        if (metaTitle !== undefined)
            updates.meta_title = metaTitle;
        if (metaDescription !== undefined)
            updates.meta_description = metaDescription;
        updates.updated_at = new Date().toISOString();
        const { data, error } = await supabase.from('blog_posts').update(updates).eq('id', id).eq('organization_id', orgId).select().single();
        if (error) {
            res.status(404).json({ success: false, message: 'Post not found' });
            return;
        }
        res.json({ success: true, data });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error instanceof Error ? error.message : 'Failed to update post' });
    }
});
router.delete('/posts/:id', authenticate, async (req, res) => {
    try {
        const supabase = getSupabase();
        const orgId = req.organizationId;
        const { id } = req.params;
        const { error } = await supabase.from('blog_posts').delete().eq('id', id).eq('organization_id', orgId);
        if (error) {
            res.status(404).json({ success: false, message: 'Post not found' });
            return;
        }
        res.json({ success: true, message: 'Post deleted' });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error instanceof Error ? error.message : 'Failed to delete post' });
    }
});
router.post('/posts/:id/publish', authenticate, async (req, res) => {
    try {
        const supabase = getSupabase();
        const orgId = req.organizationId;
        const { id } = req.params;
        const { data, error } = await supabase.from('blog_posts').update({
            status: 'published', published_at: new Date().toISOString(), updated_at: new Date().toISOString(),
        }).eq('id', id).eq('organization_id', orgId).select().single();
        if (error) {
            res.status(404).json({ success: false, message: 'Post not found' });
            return;
        }
        res.json({ success: true, data });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error instanceof Error ? error.message : 'Failed to publish post' });
    }
});
router.get('/categories', authenticate, async (req, res) => {
    try {
        const supabase = getSupabase();
        const orgId = req.organizationId;
        const { data, error } = await supabase.from('blog_categories').select('*').eq('organization_id', orgId).order('name');
        if (error)
            throw new Error(error.message);
        res.json({ success: true, data: data ?? [] });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error instanceof Error ? error.message : 'Failed to list categories' });
    }
});
router.post('/categories', authenticate, async (req, res) => {
    try {
        const supabase = getSupabase();
        const orgId = req.organizationId;
        const { name, slug, description } = req.body;
        if (!name || !slug) {
            res.status(400).json({ success: false, message: 'Name and slug are required' });
            return;
        }
        const { data, error } = await supabase.from('blog_categories').insert({
            organization_id: orgId, name, slug, description,
        }).select().single();
        if (error)
            throw new Error(error.message);
        res.status(201).json({ success: true, data });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error instanceof Error ? error.message : 'Failed to create category' });
    }
});
export default router;
