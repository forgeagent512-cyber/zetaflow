import { ContinuousLearningService } from '../services/automation-import/continuous-learning.service.js';
export async function templateLibraryScanHandler(req, res) {
    try {
        const learningService = new ContinuousLearningService();
        const report = await learningService.scanForChanges();
        return res.json({ success: true, data: report });
    }
    catch (error) {
        const message = error instanceof Error ? error.message : 'Template library scan failed';
        return res.status(500).json({ success: false, message });
    }
}
export async function templateLibraryStatsHandler(req, res) {
    try {
        const learningService = new ContinuousLearningService();
        const stats = learningService.getStats();
        return res.json({ success: true, data: stats });
    }
    catch (error) {
        const message = error instanceof Error ? error.message : 'Template library stats failed';
        return res.status(500).json({ success: false, message });
    }
}
