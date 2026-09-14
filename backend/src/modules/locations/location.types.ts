export interface Location {
  id: string;
  organization_id: string;
  business_id: string;
  name: string;
  address_line_1: string;
  address_line_2: string | null;
  city: string;
  state: string | null;
  postal_code: string | null;
  country: string;
  latitude: number | null;
  longitude: number | null;
  timezone: string | null;
  phone: string | null;
  website_url: string | null;
  status: 'ACTIVE' | 'ARCHIVED';
  created_at: Date;
  updated_at: Date;
}

export interface PaginatedLocations {
  data: Location[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
