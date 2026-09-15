import { RankingAnalyticsService } from './rankingAnalyticsService';

describe('RankingAnalyticsService', () => {
  it('should calculate visibility score correctly', () => {
    // 1-3: 100
    // 4-10: 80
    // 11-20: 60
    // null: 0
    // (100 + 80 + 60 + 0) / 4 = 240 / 4 = 60
    const rankings = [
      { position: 2 },
      { position: 5 },
      { position: 15 },
      { position: null }
    ];
    
    const score = RankingAnalyticsService.calculateVisibilityScore(rankings);
    expect(score).toBe(60);
  });

  it('should calculate analytics correctly', () => {
    const rankings = [
      { position: 2 },
      { position: 8 },
      { position: 20 },
      { position: null },
      { position: null }
    ];
    
    const analytics = RankingAnalyticsService.computeAnalytics(rankings);
    
    expect(analytics.rankingCount).toBe(3);
    expect(analytics.notFoundCount).toBe(2);
    expect(analytics.bestPosition).toBe(2);
    expect(analytics.worstPosition).toBe(20);
    expect(analytics.averagePosition).toBe(10); // (2+8+20)/3 = 30/3 = 10
  });

  it('should handle all null rankings gracefully', () => {
    const rankings = [
      { position: null },
      { position: null }
    ];
    
    const analytics = RankingAnalyticsService.computeAnalytics(rankings);
    
    expect(analytics.rankingCount).toBe(0);
    expect(analytics.notFoundCount).toBe(2);
    expect(analytics.bestPosition).toBeNull();
    expect(analytics.worstPosition).toBeNull();
    expect(analytics.averagePosition).toBeNull();
    expect(analytics.visibilityScore).toBe(0);
  });
});
