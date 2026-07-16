import { Router } from 'express';
import { createClient } from '@supabase/supabase-js';
import { EncryptionService } from '../../services/security/encryption-service.js';
import { authenticate } from '../../middleware/auth.middleware.js';
const router = Router();
const encryptionService = new EncryptionService();
function getSupabase() {
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_ANON_KEY;
    if (!url || !key)
        throw new Error('Supabase configuration missing');
    return createClient(url, key, { auth: { persistSession: false } });
}
router.get('/', authenticate, async (req, res) => {
    try {
        const supabase = getSupabase();
        const orgId = req.organizationId;
        const { type } = req.query;
        let query = supabase.from('credential_vault').select('id, name, type, created_at, updated_at').eq('organization_id', orgId);
        if (type)
            query = query.eq('type', type);
        const { data, error } = await query.order('created_at', { ascending: false });
        if (error)
            throw new Error(error.message);
        res.json({ success: true, data: data ?? [] });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error instanceof Error ? error.message : 'Failed to list credentials' });
    }
});
router.post('/', authenticate, async (req, res) => {
    try {
        const supabase = getSupabase();
        const orgId = req.organizationId;
        const { name, type, value } = req.body;
        if (!name || !type || !value) {
            res.status(400).json({ success: false, message: 'Name, type, and value are required' });
            return;
        }
        const encryptedValue = await encryptionService.encrypt(JSON.stringify(value));
        const { data, error } = await supabase.from('credential_vault').insert({
            organization_id: orgId, name, type, encrypted_value: encryptedValue,
        }).select('id, name, type, created_at, updated_at').single();
        if (error)
            throw new Error(error.message);
        res.status(201).json({ success: true, data });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error instanceof Error ? error.message : 'Failed to store credential' });
    }
});
router.get('/:id', authenticate, async (req, res) => {
    try {
        const supabase = getSupabase();
        const orgId = req.organizationId;
        const { id } = req.params;
        const { data, error } = await supabase.from('credential_vault').select('id, name, type, created_at, updated_at').eq('id', id).eq('organization_id', orgId).single();
        if (error) {
            res.status(404).json({ success: false, message: 'Credential not found' });
            return;
        }
        res.json({ success: true, data });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error instanceof Error ? error.message : 'Failed to get credential' });
    }
});
router.delete('/:id', authenticate, async (req, res) => {
    try {
        const supabase = getSupabase();
        const orgId = req.organizationId;
        const { id } = req.params;
        const { error } = await supabase.from('credential_vault').delete().eq('id', id).eq('organization_id', orgId);
        if (error) {
            res.status(404).json({ success: false, message: 'Credential not found' });
            return;
        }
        res.json({ success: true, message: 'Credential deleted' });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error instanceof Error ? error.message : 'Failed to delete credential' });
    }
});
router.post('/:id/rotate', authenticate, async (req, res) => {
    try {
        const supabase = getSupabase();
        const orgId = req.organizationId;
        const { id } = req.params;
        const { value } = req.body;
        if (!value) {
            res.status(400).json({ success: false, message: 'New value is required' });
            return;
        }
        const encryptedValue = await encryptionService.encrypt(JSON.stringify(value));
        const { data, error } = await supabase.from('credential_vault').update({
            encrypted_value: encryptedValue, rotated_at: new Date().toISOString(), updated_at: new Date().toISOString(),
        }).eq('id', id).eq('organization_id', orgId).select('id, name, type, created_at, rotated_at, updated_at').single();
        if (error) {
            res.status(404).json({ success: false, message: 'Credential not found' });
            return;
        }
        res.json({ success: true, data });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error instanceof Error ? error.message : 'Failed to rotate credential' });
    }
});
export default router;
