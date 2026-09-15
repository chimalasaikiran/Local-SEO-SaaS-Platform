export interface RankingRequest {
  keyword: string;
  latitude: number;
  longitude: number;
  searchEngine: string;
  device: string;
  country: string;
  language: string;
  maxRank: number;
}

export interface RankingResult {
  keyword: string;
  position: number | null; // 1-100 or NULL if not found
  provider: string;
  checkedAt: Date;
  metadata?: Record<string, any>;
}

export interface RankingProvider {
  providerName: string;
  supportedSearchEngines: string[];
  supportedDevices: string[];
  supportsGeoCoordinates: boolean;
  supportsLocalResults: boolean;

  checkRanking(request: RankingRequest): Promise<RankingResult>;
  checkRankings(requests: RankingRequest[]): Promise<RankingResult[]>;
  healthCheck(): Promise<boolean>;
}
