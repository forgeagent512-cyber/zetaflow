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
router.get('/white-label', authenticate, async (req, res) => {
    try {
        const supabase = getSupabase();
        const orgId = req.organizationId;
        const { data, error } = await supabase.from('white_label_settings').select('*').eq('organization_id', orgId).single();
        if (error) {
            res.json({ success: true, data: null });
            return;
        }
        res.json({ success: true, data });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error instanceof Error ? error.message : 'Failed to get white label settings' });
    }
});
router.put('/white-label', authenticate, async (req, res) => {
    try {
        const supabase = getSupabase();
        const orgId = req.organizationId;
        const { brandName, logoUrl, primaryColor, secondaryColor, customDomain, faviconUrl, footerText } = req.body;
        const updates = {};
        if (brandName !== undefined)
            updates.brand_name = brandName;
        if (logoUrl !== undefined)
            updates.logo_url = logoUrl;
        if (primaryColor !== undefined)
            updates.primary_color = primaryColor;
        if (secondaryColor !== undefined)
            updates.secondary_color = secondaryColor;
        if (customDomain !== undefined)
            updates.custom_domain = customDomain;
        if (faviconUrl !== undefined)
            updates.favicon_url = faviconUrl;
        if (footerText !== undefined)
            updates.footer_text = footerText;
        updates.updated_at = new Date().toISOString();
        const { data, error } = await supabase.from('white_label_settings').upsert({
            organization_id: orgId, ...updates, created_at: new Date().toISOString(),
        }).select().single();
        if (error)
            throw new Error(error.message);
        res.json({ success: true, data });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error instanceof Error ? error.message : 'Failed to update white label settings' });
    }
});
router.post('/white-label/verify-domain', authenticate, async (req, res) => {
    try {
        const { domain } = req.body;
        if (!domain) {
            res.status(400).json({ success: false, message: 'Domain is required' });
            return;
        }
        const dnsRecord = `_buildagent-verify.${domain}`;
        const dnsValue = `buildagent-verify-${req.organizationId}`;
        res.json({ success: true, data: { domain, dnsRecord, dnsType: 'TXT', dnsValue, verified: false, message: `Add TXT record ${dnsRecord} with value "${dnsValue}"` } });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error instanceof Error ? error.message : 'Domain verification failed' });
    }
});
export default router;
