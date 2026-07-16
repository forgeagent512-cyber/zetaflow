import { Router } from 'express';
import { createClient } from '@supabase/supabase-js';
import { authenticate } from '../../middleware/auth.middleware.js';
import { DeploymentCenter } from '../../services/devops/deployment-center.js';
const router = Router();
const deploymentCenter = new DeploymentCenter();
function getSupabase() {
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_ANON_KEY;
    if (!url || !key)
        throw new Error('Supabase configuration missing');
    return createClient(url, key, { auth: { persistSession: false } });
}
router.get('/', authenticate, async (req, res) => {
    try {
        const orgId = req.organizationId;
        const deployments = await deploymentCenter.getDeployments(orgId);
        res.json({ success: true, data: deployments });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error instanceof Error ? error.message : 'Failed to list deployments' });
    }
});
router.post('/', authenticate, async (req, res) => {
    try {
        const orgId = req.organizationId;
        const deployment = await deploymentCenter.createDeployment({ ...req.body, organizationId: orgId });
        res.json({ success: true, data: deployment });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error instanceof Error ? error.message : 'Failed to create deployment' });
    }
});
router.get('/:id', authenticate, async (req, res) => {
    try {
        const deployment = await deploymentCenter.getDeployment(req.params.id);
        if (!deployment) {
            res.status(404).json({ success: false, message: 'Deployment not found' });
            return;
        }
        res.json({ success: true, data: deployment });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error instanceof Error ? error.message : 'Failed to get deployment' });
    }
});
router.post('/:id/deploy', authenticate, async (req, res) => {
    try {
        const result = await deploymentCenter.deploy(req.params.id);
        res.json({ success: true, data: result });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error instanceof Error ? error.message : 'Failed to deploy' });
    }
});
router.post('/:id/pause', authenticate, async (req, res) => {
    try {
        const result = await deploymentCenter.pauseDeployment(req.params.id);
        res.json({ success: true, data: result });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error instanceof Error ? error.message : 'Failed to pause deployment' });
    }
});
router.post('/:id/resume', authenticate, async (req, res) => {
    try {
        const result = await deploymentCenter.resumeDeployment(req.params.id);
        res.json({ success: true, data: result });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error instanceof Error ? error.message : 'Failed to resume deployment' });
    }
});
router.post('/:id/restart', authenticate, async (req, res) => {
    try {
        const result = await deploymentCenter.restartDeployment(req.params.id);
        res.json({ success: true, data: result });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error instanceof Error ? error.message : 'Failed to restart deployment' });
    }
});
router.post('/:id/rollback', authenticate, async (req, res) => {
    try {
        const { version } = req.body;
        const result = await deploymentCenter.rollbackDeployment(req.params.id, version);
        res.json({ success: true, data: result });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error instanceof Error ? error.message : 'Failed to rollback deployment' });
    }
});
router.delete('/:id', authenticate, async (req, res) => {
    try {
        await deploymentCenter.deleteDeployment(req.params.id);
        res.json({ success: true, message: 'Deployment deleted' });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error instanceof Error ? error.message : 'Failed to delete deployment' });
    }
});
router.get('/:id/logs', authenticate, async (req, res) => {
    try {
        const logs = await deploymentCenter.getDeploymentLogs(req.params.id);
        res.json({ success: true, data: logs });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error instanceof Error ? error.message : 'Failed to get deployment logs' });
    }
});
export default router;
