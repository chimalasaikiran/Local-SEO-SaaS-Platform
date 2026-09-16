"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RankTrackingController = void 0;
const rankTracking_service_1 = require("./rankTracking.service");
const rankingAnalyticsService_1 = require("./services/rankingAnalyticsService");
const providerRegistry_1 = require("./providers/providerRegistry");
class RankTrackingController {
    static async createConfig(req, res) {
        try {
            const organizationId = req.params.organizationId;
            const config = await rankTracking_service_1.RankTrackingService.createConfig(organizationId, req.body);
            res.status(201).json({ data: config });
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
    static async getConfigs(req, res) {
        try {
            const organizationId = req.params.organizationId;
            const configs = await rankTracking_service_1.RankTrackingService.getConfigs(organizationId, req.query);
            res.json({ data: configs });
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
    static async getConfigById(req, res) {
        try {
            const organizationId = req.params.organizationId;
            const config = await rankTracking_service_1.RankTrackingService.getConfigById(organizationId, req.params.configId);
            if (!config)
                return res.status(404).json({ error: 'Config not found' });
            res.json({ data: config });
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
    static async updateConfig(req, res) {
        try {
            const organizationId = req.params.organizationId;
            const config = await rankTracking_service_1.RankTrackingService.updateConfig(organizationId, req.params.configId, req.body);
            res.json({ data: config });
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
    static async deleteConfig(req, res) {
        try {
            const organizationId = req.params.organizationId;
            await rankTracking_service_1.RankTrackingService.archiveConfig(organizationId, req.params.configId);
            res.status(204).send();
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
    static async getKeywords(req, res) {
        try {
            const organizationId = req.params.organizationId;
            const keywords = await rankTracking_service_1.RankTrackingService.getKeywords(organizationId, req.params.configId);
            res.json({ data: keywords });
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
    static async addKeyword(req, res) {
        try {
            const organizationId = req.params.organizationId;
            const { keywordId } = req.body;
            const link = await rankTracking_service_1.RankTrackingService.addKeyword(organizationId, req.params.configId, keywordId);
            res.status(201).json({ data: link });
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
    static async removeKeyword(req, res) {
        try {
            const organizationId = req.params.organizationId;
            await rankTracking_service_1.RankTrackingService.removeKeyword(organizationId, req.params.configId, req.params.keywordId);
            res.status(204).send();
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
    static async getGrid(req, res) {
        try {
            const organizationId = req.params.organizationId;
            const grid = await rankTracking_service_1.RankTrackingService.getGrid(organizationId, req.params.configId);
            res.json({ data: grid });
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
    static async regenerateGrid(req, res) {
        try {
            const organizationId = req.params.organizationId;
            const grid = await rankTracking_service_1.RankTrackingService.regenerateGrid(organizationId, req.params.configId);
            res.json({ data: grid });
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
    static async createRun(req, res) {
        try {
            const organizationId = req.params.organizationId;
            const run = await rankTracking_service_1.RankTrackingService.createRun(organizationId, req.params.configId);
            res.status(201).json({ data: run });
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
    static async getRun(req, res) {
        try {
            const organizationId = req.params.organizationId;
            const run = await rankTracking_service_1.RankTrackingService.getRun(organizationId, req.params.runId);
            if (!run)
                return res.status(404).json({ error: 'Run not found' });
            res.json({ data: run });
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
    static async getRankings(req, res) {
        try {
            const organizationId = req.params.organizationId;
            const rankings = await rankTracking_service_1.RankTrackingService.getLatestRankings(organizationId, req.params.configId);
            const metricsInput = rankings.map(r => ({ position: r.position }));
            const analytics = rankingAnalyticsService_1.RankingAnalyticsService.computeAnalytics(metricsInput);
            res.json({ data: { rankings, analytics } });
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
    static async getRunsHistory(req, res) {
        try {
            const organizationId = req.params.organizationId;
            const history = await rankTracking_service_1.RankTrackingService.getRunsHistory(organizationId, req.params.configId);
            // Calculate analytics for each run
            const enrichedHistory = await Promise.all(history.map(async (run) => {
                let analytics = null;
                if (run.status === 'COMPLETED' || run.status === 'PARTIAL') {
                    const rankings = await rankTracking_service_1.RankTrackingService.getRunRankings(organizationId, run.id);
                    const metricsInput = rankings.map(r => ({ position: r.position }));
                    analytics = rankingAnalyticsService_1.RankingAnalyticsService.computeAnalytics(metricsInput);
                }
                return { ...run, analytics };
            }));
            res.json({ data: enrichedHistory });
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
    static async getRunRankings(req, res) {
        try {
            const organizationId = req.params.organizationId;
            const rankings = await rankTracking_service_1.RankTrackingService.getRunRankings(organizationId, req.params.runId);
            const metricsInput = rankings.map(r => ({ position: r.position }));
            const analytics = rankingAnalyticsService_1.RankingAnalyticsService.computeAnalytics(metricsInput);
            res.json({ data: { rankings, analytics } });
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
    static async getProviderStatus(req, res) {
        try {
            const status = await providerRegistry_1.rankingProviderRegistry.getProviderStatus();
            res.json({ data: { status } });
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
}
exports.RankTrackingController = RankTrackingController;
