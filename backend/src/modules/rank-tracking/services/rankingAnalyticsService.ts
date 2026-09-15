export const VISIBILITY_SCORE_VERSION = "v1";

export interface RankingMetricInput {
  position: number | null;
}

export interface RankingAnalytics {
  averagePosition: number | null;
  bestPosition: number | null;
  worstPosition: number | null;
  rankingCount: number;
  notFoundCount: number;
  visibilityScore: number;
}

export class RankingAnalyticsService {
  /**
   * Calculates the Local Visibility Score (v1)
   * Top 3: 100%
   * 4-10: 80%
   * 11-20: 60%
   * 21-50: 40%
   * 51-100: 20%
   * Not ranking / null: 0%
   */
  static calculateVisibilityScore(rankings: RankingMetricInput[]): number {
    if (rankings.length === 0) return 0;

    let totalScore = 0;
    for (const item of rankings) {
      const pos = item.position;
      if (pos === null) {
        totalScore += 0;
      } else if (pos >= 1 && pos <= 3) {
        totalScore += 100;
      } else if (pos >= 4 && pos <= 10) {
        totalScore += 80;
      } else if (pos >= 11 && pos <= 20) {
        totalScore += 60;
      } else if (pos >= 21 && pos <= 50) {
        totalScore += 40;
      } else if (pos >= 51 && pos <= 100) {
        totalScore += 20;
      }
    }

    return Math.round(totalScore / rankings.length);
  }

  /**
   * Computes all metrics for a given set of rankings.
   */
  static computeAnalytics(rankings: RankingMetricInput[]): RankingAnalytics {
    let rankingCount = 0;
    let notFoundCount = 0;
    let sumPositions = 0;
    let bestPosition: number | null = null;
    let worstPosition: number | null = null;

    for (const item of rankings) {
      if (item.position === null) {
        notFoundCount++;
      } else {
        rankingCount++;
        sumPositions += item.position;

        if (bestPosition === null || item.position < bestPosition) {
          bestPosition = item.position;
        }
        if (worstPosition === null || item.position > worstPosition) {
          worstPosition = item.position;
        }
      }
    }

    const averagePosition = rankingCount > 0 ? sumPositions / rankingCount : null;
    const visibilityScore = this.calculateVisibilityScore(rankings);

    return {
      averagePosition: averagePosition ? Math.round(averagePosition * 10) / 10 : null,
      bestPosition,
      worstPosition,
      rankingCount,
      notFoundCount,
      visibilityScore,
    };
  }

  /**
   * Calculates position change from previous to current.
   * +4 means improved by 4.
   * -4 means dropped by 4.
   */
  static calculatePositionChange(
    previousPosition: number | null,
    currentPosition: number | null
  ): number | null {
    if (currentPosition === null) {
      // Not ranking now
      return null;
    }
    
    if (previousPosition === null) {
      // Newly ranking, cannot express as a delta
      return null; 
    }

    // Lower position is better. So previous - current.
    // previous = 8, current = 4 -> +4
    return previousPosition - currentPosition;
  }
}
