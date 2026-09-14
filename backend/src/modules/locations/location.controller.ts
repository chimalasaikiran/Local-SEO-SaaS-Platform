import { Request, Response, NextFunction } from 'express';
import { LocationService } from './location.service';
import { CreateLocationSchema, UpdateLocationSchema, ListLocationsQuerySchema } from './location.schema';
import { z } from 'zod';

export class LocationController {
  static async list(req: Request, res: Response, next: NextFunction) {
    try {
      const organizationId = req.organizationMembership?.organizationId;
      if (!organizationId) {
        return res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Organization ID missing in context' } });
      }

      // Check if businessId is provided in params (for nested route)
      const businessId = req.params.businessId;
      
      const queryParams = ListLocationsQuerySchema.parse({
        ...req.query,
        ...(businessId ? { businessId } : {})
      });

      const result = await LocationService.listLocations(organizationId, queryParams);

      return res.status(200).json({ success: true, data: result });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid query parameters', details: error.issues } });
      }
      next(error);
    }
  }

  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const organizationId = req.organizationMembership?.organizationId;
      if (!organizationId) {
        return res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Organization ID missing in context' } });
      }

      const { businessId } = req.params;
      if (!businessId) {
        return res.status(400).json({ success: false, error: { code: 'BAD_REQUEST', message: 'Business ID is required' } });
      }

      const payload = CreateLocationSchema.parse(req.body);
      const location = await LocationService.createLocation(organizationId, businessId, payload);

      return res.status(201).json({ success: true, data: location });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid payload', details: error.issues } });
      }
      if (error.message === 'BUSINESS_NOT_FOUND') {
        return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Business not found or belongs to another organization' } });
      }
      next(error);
    }
  }

  static async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const organizationId = req.organizationMembership?.organizationId;
      if (!organizationId) {
        return res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Organization ID missing in context' } });
      }

      const { locationId } = req.params;
      const location = await LocationService.getLocationById(organizationId, locationId);

      if (!location) {
        return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Location not found' } });
      }

      return res.status(200).json({ success: true, data: location });
    } catch (error) {
      next(error);
    }
  }

  static async update(req: Request, res: Response, next: NextFunction) {
    try {
      const organizationId = req.organizationMembership?.organizationId;
      if (!organizationId) {
        return res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Organization ID missing in context' } });
      }

      const { locationId } = req.params;
      const payload = UpdateLocationSchema.parse(req.body);

      const location = await LocationService.updateLocation(organizationId, locationId, payload);

      if (!location) {
        return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Location not found' } });
      }

      return res.status(200).json({ success: true, data: location });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid payload', details: error.issues } });
      }
      next(error);
    }
  }

  static async archive(req: Request, res: Response, next: NextFunction) {
    try {
      const organizationId = req.organizationMembership?.organizationId;
      if (!organizationId) {
        return res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Organization ID missing in context' } });
      }

      const { locationId } = req.params;
      
      const location = await LocationService.archiveLocation(organizationId, locationId);

      if (!location) {
        return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Location not found' } });
      }

      return res.status(200).json({ success: true, data: location });
    } catch (error) {
      next(error);
    }
  }
}
