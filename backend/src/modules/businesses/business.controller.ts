import { Request, Response, NextFunction } from 'express';
import { BusinessService } from './business.service';
import { CreateBusinessSchema, UpdateBusinessSchema, ListBusinessesQuerySchema } from './business.schema';
import { z } from 'zod';

export class BusinessController {
  static async list(req: Request, res: Response, next: NextFunction) {
    try {
      const organizationId = req.organizationMembership?.organizationId;
      if (!organizationId) {
        return res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Organization ID missing in context' } });
      }

      const queryParams = ListBusinessesQuerySchema.parse(req.query);

      const result = await BusinessService.listBusinesses(organizationId, queryParams);

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

      const payload = CreateBusinessSchema.parse(req.body);
      const business = await BusinessService.createBusiness(organizationId, payload);

      return res.status(201).json({ success: true, data: business });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid payload', details: error.issues } });
      }
      if (error.code === 'CONFLICT') {
         return res.status(409).json({ success: false, error: { code: 'CONFLICT', message: error.message } });
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

      const { businessId } = req.params;
      const business = await BusinessService.getBusinessById(organizationId, businessId);

      if (!business) {
        return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Business not found' } });
      }

      return res.status(200).json({ success: true, data: business });
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

      const { businessId } = req.params;
      const payload = UpdateBusinessSchema.parse(req.body);

      const business = await BusinessService.updateBusiness(organizationId, businessId, payload);

      if (!business) {
        return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Business not found' } });
      }

      return res.status(200).json({ success: true, data: business });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid payload', details: error.issues } });
      }
      if (error.code === 'CONFLICT') {
         return res.status(409).json({ success: false, error: { code: 'CONFLICT', message: error.message } });
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

      const { businessId } = req.params;
      
      const business = await BusinessService.archiveBusiness(organizationId, businessId);

      if (!business) {
        return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Business not found' } });
      }

      return res.status(200).json({ success: true, data: business });
    } catch (error) {
      next(error);
    }
  }
}
