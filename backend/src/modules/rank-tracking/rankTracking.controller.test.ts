import { Request, Response } from 'express';
import { RankTrackingController } from './rankTracking.controller';
import { RankTrackingService } from './rankTracking.service';

jest.mock('./rankTracking.service');
jest.mock('./providers/providerRegistry', () => ({
  rankingProviderRegistry: {
    getProviderStatus: jest.fn().mockResolvedValue('AVAILABLE')
  }
}));
jest.mock('./services/rankingAnalyticsService', () => ({
  RankingAnalyticsService: {
    computeAnalytics: jest.fn().mockReturnValue({ visibilityScore: 100 })
  }
}));

describe('RankTrackingController', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let json: jest.Mock;
  let status: jest.Mock;
  let send: jest.Mock;

  beforeEach(() => {
    json = jest.fn();
    send = jest.fn();
    status = jest.fn().mockReturnValue({ json, send });
    req = {
      params: { organizationId: 'org-1', configId: 'config-1', keywordId: 'kw-1', runId: 'run-1' },
      body: {},
      query: {}
    };
    res = { status, json, send };
    jest.clearAllMocks();
  });

  describe('createConfig', () => {
    it('should create a config and return 201', async () => {
      req.body = { name: 'Test Config' };
      const mockConfig = { id: 'config-1', name: 'Test Config' };
      (RankTrackingService.createConfig as jest.Mock).mockResolvedValue(mockConfig);

      await RankTrackingController.createConfig(req as Request, res as Response);

      expect(RankTrackingService.createConfig).toHaveBeenCalledWith('org-1', req.body);
      expect(status).toHaveBeenCalledWith(201);
      expect(json).toHaveBeenCalledWith({ data: mockConfig });
    });
  });

  describe('getConfigs', () => {
    it('should return configs', async () => {
      const mockConfigs = [{ id: 'config-1' }];
      (RankTrackingService.getConfigs as jest.Mock).mockResolvedValue(mockConfigs);

      await RankTrackingController.getConfigs(req as Request, res as Response);

      expect(RankTrackingService.getConfigs).toHaveBeenCalledWith('org-1', {});
      expect(json).toHaveBeenCalledWith({ data: mockConfigs });
    });
  });

  describe('deleteConfig', () => {
    it('should archive config and return 204', async () => {
      (RankTrackingService.archiveConfig as jest.Mock).mockResolvedValue(undefined);

      await RankTrackingController.deleteConfig(req as Request, res as Response);

      expect(RankTrackingService.archiveConfig).toHaveBeenCalledWith('org-1', 'config-1');
      expect(status).toHaveBeenCalledWith(204);
      expect(send).toHaveBeenCalled();
    });
  });

  describe('getRunsHistory', () => {
    it('should return runs history', async () => {
      const mockHistory = [{ id: 'run-1', status: 'COMPLETED' }];
      (RankTrackingService.getRunsHistory as jest.Mock).mockResolvedValue(mockHistory);
      (RankTrackingService.getRunRankings as jest.Mock).mockResolvedValue([{ position: 1 }]);

      await RankTrackingController.getRunsHistory(req as Request, res as Response);

      expect(RankTrackingService.getRunsHistory).toHaveBeenCalledWith('org-1', 'config-1');
      expect(json).toHaveBeenCalledWith(expect.objectContaining({
        data: expect.arrayContaining([
          expect.objectContaining({ id: 'run-1', analytics: expect.any(Object) })
        ])
      }));
    });
  });

  // More tests for other endpoints like getRankings, createRun...
  describe('createRun', () => {
    it('should trigger a run', async () => {
      const mockRun = { runId: 'run-1', totalJobs: 10 };
      (RankTrackingService.createRun as jest.Mock).mockResolvedValue(mockRun);

      await RankTrackingController.createRun(req as Request, res as Response);

      expect(RankTrackingService.createRun).toHaveBeenCalledWith('org-1', 'config-1');
      expect(status).toHaveBeenCalledWith(201);
      expect(json).toHaveBeenCalledWith({ data: mockRun });
    });
  });
});
