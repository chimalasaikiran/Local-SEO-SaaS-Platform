import { handleRankTrackingJob } from './rankTrackingWorker';
import { Pool } from 'pg';

jest.mock('pg', () => {
  const mClient = {
    query: jest.fn(),
    release: jest.fn(),
  };
  return {
    Pool: jest.fn(() => ({
      connect: jest.fn().mockResolvedValue(mClient),
    })),
  };
});

describe('rankTrackingWorker', () => {
  let mockClient: any;

  beforeEach(() => {
    jest.clearAllMocks();
    mockClient = (new Pool()).connect() as any as Promise<any>;
    mockClient = {
      query: jest.fn(),
      release: jest.fn(),
    };
    (Pool as unknown as jest.Mock).mockImplementation(() => ({
      connect: jest.fn().mockResolvedValue(mockClient)
    }));
  });

  const validJobData = {
    organizationId: 'org-1',
    runId: 'run-1',
    configId: 'config-1',
    jobId: 'job-1',
    keywordId: 'kw-1',
    gridPointId: 'gp-1'
  };

  it('should handle RANKING_PROVIDER_NOT_CONFIGURED and not insert fake data', async () => {
    // Setup mocks
    mockClient.query.mockImplementation((queryStr: string) => {
      if (queryStr.includes('SELECT * FROM rank_tracking_configs')) return { rows: [{ search_engine: 'GOOGLE', device: 'DESKTOP' }] };
      if (queryStr.includes('SELECT * FROM keywords')) return { rows: [{ id: 'kw-1' }] };
      if (queryStr.includes('SELECT * FROM rank_grid_points')) return { rows: [{ id: 'gp-1' }] };
      if (queryStr.includes('SELECT total_jobs')) return { rows: [{ total_jobs: 1 }] };
      if (queryStr.includes('COUNT(*)')) return { rows: [{ completed: 0, failed: 1 }] };
      return { rows: [] };
    });

    await handleRankTrackingJob(validJobData);

    // Verify it failed with correct error code
    const updateJobCall = mockClient.query.mock.calls.find((c: any) => c[0].includes('UPDATE rank_tracking_jobs SET status = \'FAILED\''));
    expect(updateJobCall).toBeDefined();
    expect(updateJobCall[1]).toContain('RANKING_PROVIDER_NOT_CONFIGURED');

    // Verify NO ranking row inserted
    const insertRankingCall = mockClient.query.mock.calls.find((c: any) => c[0].includes('INSERT INTO keyword_rankings'));
    expect(insertRankingCall).toBeUndefined();
    
    // Verify run progress update
    const updateRunCall = mockClient.query.mock.calls.find((c: any) => c[0].includes('UPDATE rank_tracking_runs SET status = $1'));
    expect(updateRunCall).toBeDefined();
    expect(updateRunCall[1][0]).toBe('FAILED');
  });

  // More simulated tests...
});
