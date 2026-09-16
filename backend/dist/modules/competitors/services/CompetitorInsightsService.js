"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CompetitorInsightsService = void 0;
const db_1 = __importDefault(require("../../../config/db"));
class CompetitorInsightsService {
    /**
     * Calculates local SEO market insights based on Open Geo data (NOT Google Rankings).
     */
    static async calculateInsights(organizationId, locationId, radiusMeters = 5000) {
        const res = await db_1.default.query(`
      SELECT 
        COUNT(*) as total_count,
        MIN(distance_meters) as nearest_distance,
        AVG(distance_meters) as avg_distance
      FROM competitors
      WHERE organization_id = $1 
        AND location_id = $2 
        AND distance_meters <= $3
        AND status IN ('ACTIVE', 'DISCOVERED')
    `, [organizationId, locationId, radiusMeters]);
        const stats = res.rows[0];
        const totalCount = parseInt(stats.total_count) || 0;
        // Category distribution
        const catRes = await db_1.default.query(`
      SELECT category, COUNT(*) as count
      FROM competitors
      WHERE organization_id = $1 
        AND location_id = $2 
        AND distance_meters <= $3
        AND status IN ('ACTIVE', 'DISCOVERED')
      GROUP BY category
    `, [organizationId, locationId, radiusMeters]);
        const categoryDensity = {};
        catRes.rows.forEach(r => {
            categoryDensity[r.category] = parseInt(r.count);
        });
        // Simple density score logic based on count in radius
        const maxExpected = 50;
        let densityScore = Math.min((totalCount / maxExpected) * 100, 100);
        return {
            competitorCount: totalCount,
            nearestCompetitorDistanceMeters: stats.nearest_distance ? parseFloat(stats.nearest_distance) : null,
            averageCompetitorDistanceMeters: stats.avg_distance ? parseFloat(stats.avg_distance) : null,
            densityScore: Math.round(densityScore),
            categoryDensity
        };
    }
}
exports.CompetitorInsightsService = CompetitorInsightsService;
