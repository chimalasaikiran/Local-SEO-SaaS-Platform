"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.geoRoutes = void 0;
const express_1 = require("express");
const geo_controller_1 = require("./geo.controller");
const auth_middleware_1 = require("../../middlewares/auth.middleware");
const router = (0, express_1.Router)();
exports.geoRoutes = router;
// Geo API should require authentication
router.use(auth_middleware_1.requireAuth);
router.get('/geocode', geo_controller_1.GeoController.geocode);
router.get('/reverse', geo_controller_1.GeoController.reverseGeocode);
router.get('/nearby', geo_controller_1.GeoController.nearby);
