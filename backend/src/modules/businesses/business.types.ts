export interface Business {
  id: string;
  organization_id: string;
  name: string;
  slug: string;
  website_url: string | null;
  phone: string | null;
  primary_category: string | null;
  description: string | null;
  status: 'ACTIVE' | 'ARCHIVED';
  created_at: Date;
  updated_at: Date;
}

export interface PaginatedBusinesses {
  data: (Business & { location_count?: number })[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
