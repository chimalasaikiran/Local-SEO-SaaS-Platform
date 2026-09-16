import { Router } from 'express';
import { GeoController } from './geo.controller';
import { requireAuth } from '../../middlewares/auth.middleware';

const router = Router();

// Geo API should require authentication
router.use(requireAuth);

router.get('/geocode', GeoController.geocode);
router.get('/reverse', GeoController.reverseGeocode);
router.get('/nearby', GeoController.nearby);

export { router as geoRoutes };
