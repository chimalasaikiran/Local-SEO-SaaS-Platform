import { Request, Response } from 'express';
import { NominatimGeoProvider } from './providers/NominatimGeoProvider';
import { OsmPoiProvider } from './providers/OsmPoiProvider';
import { z } from 'zod';

const nominatim = new NominatimGeoProvider();
const osmPoi = new OsmPoiProvider();

// Validators
const GeocodeQuerySchema = z.object({
  q: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  country: z.string().optional(),
  postalCode: z.string().optional(),
  limit: z.coerce.number().min(1).max(50).optional()
}).refine(data => data.q || data.address || data.city || data.postalCode, {
  message: "At least one search parameter (q, address, city, postalCode) must be provided."
});

const ReverseGeocodeQuerySchema = z.object({
  latitude: z.coerce.number().min(-90).max(90),
  longitude: z.coerce.number().min(-180).max(180)
});

const NearbyQuerySchema = z.object({
  latitude: z.coerce.number().min(-90).max(90),
  longitude: z.coerce.number().min(-180).max(180),
  category: z.string().min(2).max(50),
  radius: z.coerce.number().min(100).max(50000).default(5000),
  limit: z.coerce.number().min(1).max(500).default(50)
});

export class GeoController {
  
  static async geocode(req: Request, res: Response) {
    try {
      const query = GeocodeQuerySchema.parse(req.query);
      const results = await nominatim.geocode(query);
      return res.json({ data: results });
    } catch (error) {
      console.error('Geocode error:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.issues });
      }
      return res.status(500).json({ error: 'Failed to geocode' });
    }
  }

  static async reverseGeocode(req: Request, res: Response) {
    try {
      const query = ReverseGeocodeQuerySchema.parse(req.query);
      const result = await nominatim.reverseGeocode(query.latitude, query.longitude);
      return res.json({ data: result });
    } catch (error) {
      console.error('Reverse Geocode error:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.issues });
      }
      return res.status(500).json({ error: 'Failed to reverse geocode' });
    }
  }

  static async nearby(req: Request, res: Response) {
    try {
      const query = NearbyQuerySchema.parse(req.query);
      const results = await osmPoi.searchNearby(query.category, query.latitude, query.longitude, query.radius, query.limit);
      return res.json({ data: results });
    } catch (error) {
      console.error('Nearby POI search error:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.issues });
      }
      return res.status(500).json({ error: 'Failed to find nearby places' });
    }
  }
}
