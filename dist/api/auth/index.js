import { Router } from 'express';
import { AuthService } from '../../services/auth/auth.service.js';
import { authRateLimit } from '../../middleware/security.middleware.js';
import { authenticate } from '../../middleware/auth.middleware.js';
import { createClient } from '@supabase/supabase-js';
const router = Router();
const authService = new AuthService();
function getSupabase() {
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_ANON_KEY;
    if (!url || !key)
        throw new Error('Supabase configuration missing');
    return createClient(url, key, { auth: { persistSession: false } });
}
router.post('/login', authRateLimit, async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            res.status(400).json({ success: false, message: 'Email and password required' });
            return;
        }
        const supabase = getSupabase();
        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({ email, password });
        if (authError || !authData.user) {
            res.status(401).json({ success: false, message: 'Invalid credentials' });
            return;
        }
        const { data: user } = await supabase.from('users').select('*, organizations(name, slug)').eq('id', authData.user.id).maybeSingle();
        if (!user) {
            res.status(401).json({ success: false, message: 'User not found' });
            return;
        }
        const tokens = authService.generateTokens({
            userId: user.id,
            organizationId: user.organization_id,
            role: user.role_id ? 'Organization Admin' : 'Customer',
            email: user.email,
        });
        res.json({
            success: true,
            data: {
                user: {
                    id: user.id,
                    email: user.email,
                    fullName: user.full_name,
                    role: user.role_id ? 'Organization Admin' : 'Customer',
                    organizationId: user.organization_id,
                    organizationName: user.organizations?.name,
                },
                tokens,
            },
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error instanceof Error ? error.message : 'Login failed' });
    }
});
router.post('/register', authRateLimit, async (req, res) => {
    try {
        const { email, password, fullName, organizationName, industry } = req.body;
        if (!email || !password || !fullName) {
            res.status(400).json({ success: false, message: 'Email, password, and fullName required' });
            return;
        }
        const supabase = getSupabase();
        const { data: authData, error: authError } = await supabase.auth.signUp({ email, password });
        if (authError) {
            res.status(400).json({ success: false, message: authError.message });
            return;
        }
        if (!authData.user) {
            res.status(500).json({ success: false, message: 'User creation failed' });
            return;
        }
        const slug = organizationName?.toLowerCase().replace(/[^a-z0-9]+/g, '-') ?? `org-${authData.user.id.slice(0, 8)}`;
        const { data: org, error: orgError } = await supabase.from('organizations').insert({
            organization_name: organizationName ?? `${fullName}'s Organization`,
            slug,
            industry_id: null,
            company_email: email,
        }).select('*').single();
        if (orgError || !org) {
            await supabase.auth.admin.deleteUser(authData.user.id);
            res.status(500).json({ success: false, message: 'Organization creation failed' });
            return;
        }
        const { error: userError } = await supabase.from('users').insert({
            id: authData.user.id,
            organization_id: org.id,
            full_name: fullName,
            email,
            role_id: null,
        });
        if (userError) {
            res.status(500).json({ success: false, message: 'User profile creation failed' });
            return;
        }
        const tokens = authService.generateTokens({
            userId: authData.user.id,
            organizationId: org.id,
            role: 'Organization Admin',
            email,
        });
        res.status(201).json({
            success: true,
            data: {
                user: { id: authData.user.id, email, fullName, role: 'Organization Admin', organizationId: org.id, organizationName: org.organization_name },
                tokens,
            },
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error instanceof Error ? error.message : 'Registration failed' });
    }
});
router.post('/refresh', async (req, res) => {
    try {
        const { refreshToken } = req.body;
        if (!refreshToken) {
            res.status(400).json({ success: false, message: 'Refresh token required' });
            return;
        }
        const tokens = authService.refreshAccessToken(refreshToken);
        if (!tokens) {
            res.status(401).json({ success: false, message: 'Invalid or expired refresh token' });
            return;
        }
        res.json({ success: true, data: { tokens } });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Token refresh failed' });
    }
});
router.post('/logout', async (req, res) => {
    try {
        const { refreshToken } = req.body;
        if (refreshToken) {
            authService.revokeRefreshToken(refreshToken);
        }
        res.json({ success: true, message: 'Logged out successfully' });
    }
    catch {
        res.json({ success: true, message: 'Logged out successfully' });
    }
});
router.get('/me', authenticate, async (req, res) => {
    try {
        const payload = req.user;
        if (!payload) {
            res.status(401).json({ success: false, message: 'Unauthorized' });
            return;
        }
        const supabase = getSupabase();
        const { data: user } = await supabase.from('users').select('*, organizations(name, slug)').eq('id', payload.userId).maybeSingle();
        if (!user) {
            res.status(404).json({ success: false, message: 'User not found' });
            return;
        }
        res.json({
            success: true,
            data: {
                id: user.id,
                email: user.email,
                fullName: user.full_name,
                role: payload.role,
                organizationId: user.organization_id,
                organizationName: user.organizations?.name,
            },
        });
    }
    catch {
        res.status(401).json({ success: false, message: 'Invalid token' });
    }
});
export default router;
