import { Request, Response } from 'express';
import { RankTrackingService } from './rankTracking.service';
import { RankingAnalyticsService } from './services/rankingAnalyticsService';
import { rankingProviderRegistry } from './providers/providerRegistry';

export class RankTrackingController {
  static async createConfig(req: Request, res: Response) {
    try {
      const organizationId = req.params.organizationId;
      const config = await RankTrackingService.createConfig(organizationId, req.body);
      res.status(201).json({ data: config });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  static async getConfigs(req: Request, res: Response) {
    try {
      const organizationId = req.params.organizationId;
      const configs = await RankTrackingService.getConfigs(organizationId, req.query);
      res.json({ data: configs });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  static async getConfigById(req: Request, res: Response) {
    try {
      const organizationId = req.params.organizationId;
      const config = await RankTrackingService.getConfigById(organizationId, req.params.configId);
      if (!config) return res.status(404).json({ error: 'Config not found' });
      res.json({ data: config });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  static async updateConfig(req: Request, res: Response) {
    try {
      const organizationId = req.params.organizationId;
      const config = await RankTrackingService.updateConfig(organizationId, req.params.configId, req.body);
      res.json({ data: config });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  static async deleteConfig(req: Request, res: Response) {
    try {
      const organizationId = req.params.organizationId;
      await RankTrackingService.archiveConfig(organizationId, req.params.configId);
      res.status(204).send();
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  static async getKeywords(req: Request, res: Response) {
    try {
      const organizationId = req.params.organizationId;
      const keywords = await RankTrackingService.getKeywords(organizationId, req.params.configId);
      res.json({ data: keywords });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  static async addKeyword(req: Request, res: Response) {
    try {
      const organizationId = req.params.organizationId;
      const { keywordId } = req.body;
      const link = await RankTrackingService.addKeyword(organizationId, req.params.configId, keywordId);
      res.status(201).json({ data: link });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  static async removeKeyword(req: Request, res: Response) {
    try {
      const organizationId = req.params.organizationId;
      await RankTrackingService.removeKeyword(organizationId, req.params.configId, req.params.keywordId);
      res.status(204).send();
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  static async getGrid(req: Request, res: Response) {
    try {
      const organizationId = req.params.organizationId;
      const grid = await RankTrackingService.getGrid(organizationId, req.params.configId);
      res.json({ data: grid });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  static async regenerateGrid(req: Request, res: Response) {
    try {
      const organizationId = req.params.organizationId;
      const grid = await RankTrackingService.regenerateGrid(organizationId, req.params.configId);
      res.json({ data: grid });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  static async createRun(req: Request, res: Response) {
    try {
      const organizationId = req.params.organizationId;
      const run = await RankTrackingService.createRun(organizationId, req.params.configId);
      res.status(201).json({ data: run });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  static async getRun(req: Request, res: Response) {
    try {
      const organizationId = req.params.organizationId;
      const run = await RankTrackingService.getRun(organizationId, req.params.runId);
      if (!run) return res.status(404).json({ error: 'Run not found' });
      res.json({ data: run });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  static async getRankings(req: Request, res: Response) {
    try {
      const organizationId = req.params.organizationId;
      const rankings = await RankTrackingService.getLatestRankings(organizationId, req.params.configId);
      
      const metricsInput = rankings.map(r => ({ position: r.position }));
      const analytics = RankingAnalyticsService.computeAnalytics(metricsInput);
      
      res.json({ data: { rankings, analytics } });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
  
  static async getRunsHistory(req: Request, res: Response) {
    try {
      const organizationId = req.params.organizationId;
      const history = await RankTrackingService.getRunsHistory(organizationId, req.params.configId);
      
      // Calculate analytics for each run
      const enrichedHistory = await Promise.all(history.map(async (run) => {
        let analytics = null;
        if (run.status === 'COMPLETED' || run.status === 'PARTIAL') {
          const rankings = await RankTrackingService.getRunRankings(organizationId, run.id);
          const metricsInput = rankings.map(r => ({ position: r.position }));
          analytics = RankingAnalyticsService.computeAnalytics(metricsInput);
        }
        return { ...run, analytics };
      }));

      res.json({ data: enrichedHistory });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  static async getRunRankings(req: Request, res: Response) {
    try {
      const organizationId = req.params.organizationId;
      const rankings = await RankTrackingService.getRunRankings(organizationId, req.params.runId);
      
      const metricsInput = rankings.map(r => ({ position: r.position }));
      const analytics = RankingAnalyticsService.computeAnalytics(metricsInput);
      
      res.json({ data: { rankings, analytics } });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  static async getProviderStatus(req: Request, res: Response) {
    try {
      const status = await rankingProviderRegistry.getProviderStatus();
      res.json({ data: { status } });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
}
