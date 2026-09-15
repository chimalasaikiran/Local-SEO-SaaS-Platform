export interface Keyword {
  id: string;
  organization_id: string;
  business_id: string;
  location_id: string;
  keyword: string;
  normalized_keyword: string;
  search_engine: string;
  country_code: string;
  language_code: string;
  device: string;
  status: 'ACTIVE' | 'PAUSED' | 'ARCHIVED';
  created_at: string;
  updated_at: string;
}

export interface KeywordLocation {
  id: string;
  organization_id: string;
  keyword_id: string;
  latitude: number;
  longitude: number;
  radius_meters: number | null;
  label: string | null;
  created_at: string;
}

export interface KeywordRanking {
  id: string;
  organization_id: string;
  keyword_id: string;
  keyword_location_id: string | null;
  provider: string;
  search_engine: string;
  device: string;
  position: number | null;
  visibility_score: number | null;
  checked_at: string;
  created_at: string;
}

export interface PaginatedKeywords {
  data: (Keyword & {
    business?: { id: string; name: string };
    location?: { id: string; name: string };
    currentRanking?: KeywordRanking | null;
    previousRanking?: KeywordRanking | null;
    rankingChange?: number | null;
    lastCheckedAt?: string | null;
  })[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

// Provider abstraction for future (Step 5)
export interface RankingResult {
  keyword: string;
  location: { lat: number; lng: number } | null;
  searchEngine: string;
  device: string;
  position: number | null;
  visibilityScore: number | null;
  checkedAt: Date;
  provider: string;
}

export interface RankingProvider {
  checkKeywordRanking(keywordId: string, config: any): Promise<RankingResult>;
  checkKeywordRankings(keywordIds: string[], config: any): Promise<RankingResult[]>;
  getCapabilities(): { searchEngines: string[], devices: string[] };
}
