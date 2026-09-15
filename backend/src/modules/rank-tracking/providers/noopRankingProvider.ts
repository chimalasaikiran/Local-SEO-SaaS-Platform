import { RankingProvider, RankingRequest, RankingResult } from './rankingProvider';

export class NoopRankingProvider implements RankingProvider {
  providerName = 'NOOP';
  supportedSearchEngines = ['GOOGLE'];
  supportedDevices = ['DESKTOP', 'MOBILE'];
  supportsGeoCoordinates = true;
  supportsLocalResults = true;

  async checkRanking(request: RankingRequest): Promise<RankingResult> {
    // Deliberately throwing error to indicate not configured
    // This allows the worker to catch it and update job status properly
    throw new Error('RANKING_PROVIDER_NOT_CONFIGURED');
  }

  async checkRankings(requests: RankingRequest[]): Promise<RankingResult[]> {
    throw new Error('RANKING_PROVIDER_NOT_CONFIGURED');
  }

  async healthCheck(): Promise<boolean> {
    // It's technically healthy as a system, but it's fundamentally a No-op.
    return true;
  }
}
