import { Request, Response } from 'express';
import { KeywordService } from './keyword.service';
import { 
  CreateKeywordSchema, 
  BulkCreateKeywordsSchema, 
  UpdateKeywordSchema, 
  ListKeywordsQuerySchema,
  CreateKeywordLocationSchema
} from './keyword.schema';

export class KeywordController {
  static async list(req: Request, res: Response) {
    try {
      const { organizationId } = req.organizationMembership!;
      const query = ListKeywordsQuerySchema.parse(req.query);

      const result = await KeywordService.list(organizationId, query);

      return res.status(200).json({
        success: true,
        data: result
      });
    } catch (error: any) {
      if (error.name === 'ZodError') {
        return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid query parameters', details: error.errors } });
      }
      console.error('[KeywordController.list]', error);
      return res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch keywords' } });
    }
  }

  static async getById(req: Request, res: Response) {
    try {
      const { organizationId } = req.organizationMembership!;
      const { keywordId } = req.params;

      const keyword = await KeywordService.getById(organizationId, keywordId);

      return res.status(200).json({
        success: true,
        data: keyword
      });
    } catch (error: any) {
      if (error.message === 'Keyword not found') {
        return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: error.message } });
      }
      console.error('[KeywordController.getById]', error);
      return res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch keyword' } });
    }
  }

  static async create(req: Request, res: Response) {
    try {
      const { organizationId } = req.organizationMembership!;
      const payload = CreateKeywordSchema.parse(req.body);

      const keyword = await KeywordService.create(organizationId, payload);

      return res.status(201).json({
        success: true,
        data: keyword
      });
    } catch (error: any) {
      if (error.name === 'ZodError') {
        return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid input', details: error.errors } });
      }
      if (error.message.includes('not found') || error.message.includes('not match') || error.message.includes('does not belong')) {
         return res.status(403).json({ success: false, error: { code: 'FORBIDDEN', message: error.message } });
      }
      if (error.message.includes('already exists')) {
        return res.status(409).json({ success: false, error: { code: 'CONFLICT', message: error.message } });
      }
      console.error('[KeywordController.create]', error);
      return res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to create keyword' } });
    }
  }

  static async bulkCreate(req: Request, res: Response) {
    try {
      const { organizationId } = req.organizationMembership!;
      const payload = BulkCreateKeywordsSchema.parse(req.body);

      const result = await KeywordService.bulkCreate(organizationId, payload);

      return res.status(201).json({
        success: true,
        data: result
      });
    } catch (error: any) {
      if (error.name === 'ZodError') {
        return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid input', details: error.errors } });
      }
      if (error.message.includes('not found') || error.message.includes('not match') || error.message.includes('does not belong')) {
         return res.status(403).json({ success: false, error: { code: 'FORBIDDEN', message: error.message } });
      }
      console.error('[KeywordController.bulkCreate]', error);
      return res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to bulk create keywords' } });
    }
  }

  static async update(req: Request, res: Response) {
    try {
      const { organizationId } = req.organizationMembership!;
      const { keywordId } = req.params;
      const payload = UpdateKeywordSchema.parse(req.body);

      const keyword = await KeywordService.update(organizationId, keywordId, payload);

      return res.status(200).json({
        success: true,
        data: keyword
      });
    } catch (error: any) {
      if (error.name === 'ZodError') {
        return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid input', details: error.errors } });
      }
      if (error.message === 'Keyword not found') {
        return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: error.message } });
      }
      if (error.message.includes('already exists')) {
        return res.status(409).json({ success: false, error: { code: 'CONFLICT', message: error.message } });
      }
      console.error('[KeywordController.update]', error);
      return res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to update keyword' } });
    }
  }

  static async archive(req: Request, res: Response) {
    try {
      const { organizationId } = req.organizationMembership!;
      const { keywordId } = req.params;

      const keyword = await KeywordService.archive(organizationId, keywordId);

      return res.status(200).json({
        success: true,
        data: keyword
      });
    } catch (error: any) {
      if (error.message === 'Keyword not found') {
        return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: error.message } });
      }
      console.error('[KeywordController.archive]', error);
      return res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to archive keyword' } });
    }
  }

  // --- Keyword Locations ---
  static async listLocations(req: Request, res: Response) {
    try {
      const { organizationId } = req.organizationMembership!;
      const { keywordId } = req.params;

      const locations = await KeywordService.listLocations(organizationId, keywordId);

      return res.status(200).json({
        success: true,
        data: locations
      });
    } catch (error: any) {
      if (error.message === 'Keyword not found') {
        return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: error.message } });
      }
      console.error('[KeywordController.listLocations]', error);
      return res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch keyword locations' } });
    }
  }

  static async addLocation(req: Request, res: Response) {
    try {
      const { organizationId } = req.organizationMembership!;
      const { keywordId } = req.params;
      const payload = CreateKeywordLocationSchema.parse(req.body);

      const location = await KeywordService.addLocation(organizationId, keywordId, payload);

      return res.status(201).json({
        success: true,
        data: location
      });
    } catch (error: any) {
      if (error.name === 'ZodError') {
        return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid input', details: error.errors } });
      }
      if (error.message === 'Keyword not found') {
        return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: error.message } });
      }
      console.error('[KeywordController.addLocation]', error);
      return res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to add keyword location' } });
    }
  }

  static async removeLocation(req: Request, res: Response) {
    try {
      const { organizationId } = req.organizationMembership!;
      const { keywordId, locationId } = req.params;

      await KeywordService.removeLocation(organizationId, keywordId, locationId);

      return res.status(200).json({
        success: true,
        data: { message: 'Keyword location removed' }
      });
    } catch (error: any) {
      if (error.message === 'Keyword location not found') {
        return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: error.message } });
      }
      console.error('[KeywordController.removeLocation]', error);
      return res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to remove keyword location' } });
    }
  }
}
