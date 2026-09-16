"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateGrid = generateGrid;
const EARTH_RADIUS_METERS = 6378137;
/**
 * Validates grid parameters
 */
function validateGridParams(params) {
    const { latitude, longitude, gridSize, radiusMeters } = params;
    if (latitude < -90 || latitude > 90) {
        throw new Error('Invalid latitude. Must be between -90 and 90.');
    }
    if (longitude < -180 || longitude > 180) {
        throw new Error('Invalid longitude. Must be between -180 and 180.');
    }
    if (radiusMeters <= 0) {
        throw new Error('Invalid radius. Must be greater than zero.');
    }
    if (![3, 5, 7, 9, 11].includes(gridSize)) {
        throw new Error('Invalid grid size. Must be 3, 5, 7, 9, or 11.');
    }
}
/**
 * Calculates a new coordinate given a start point, bearing, and distance.
 * (Vincenty/Haversine equivalent logic for moving a point)
 * Using simplified flat-earth approximation for small distances (< 100km).
 * 1 degree of lat = ~111,320m
 * 1 degree of lon = ~111,320m * cos(lat)
 */
function calculateOffsetCoordinate(lat, lon, offsetLatMeters, offsetLonMeters) {
    // Approximate length of a degree of latitude in meters
    const latDegreeMeters = 111320;
    // New latitude
    const newLat = lat + offsetLatMeters / latDegreeMeters;
    // Approximate length of a degree of longitude at this latitude in meters
    const lonDegreeMeters = 111320 * Math.cos((lat * Math.PI) / 180);
    // New longitude
    let newLon = lon + offsetLonMeters / lonDegreeMeters;
    // Normalize longitude
    if (newLon > 180)
        newLon -= 360;
    if (newLon < -180)
        newLon += 360;
    return {
        latitude: newLat,
        longitude: newLon,
    };
}
/**
 * Generates a deterministic, symmetrical geographic grid centered on a location.
 */
function generateGrid(params) {
    validateGridParams(params);
    const { latitude, longitude, gridSize, radiusMeters } = params;
    const points = [];
    const centerIndex = Math.floor(gridSize / 2);
    // The distance between adjacent cells is radiusMeters / centerIndex
    const stepSizeMeters = radiusMeters / centerIndex;
    for (let row = 0; row < gridSize; row++) {
        for (let col = 0; col < gridSize; col++) {
            // Calculate how many steps from center (positive is N/E, negative is S/W)
            // row 0 is top (North), so centerIndex - row
            // col 0 is left (West), so col - centerIndex
            const latSteps = centerIndex - row;
            const lonSteps = col - centerIndex;
            const offsetLatMeters = latSteps * stepSizeMeters;
            const offsetLonMeters = lonSteps * stepSizeMeters;
            const { latitude: newLat, longitude: newLon } = calculateOffsetCoordinate(latitude, longitude, offsetLatMeters, offsetLonMeters);
            // Distance from center = sqrt(x^2 + y^2) for a simplified flat projection which is fine here
            const distanceFromCenterMeters = Math.sqrt(Math.pow(offsetLatMeters, 2) + Math.pow(offsetLonMeters, 2));
            points.push({
                latitude: newLat,
                longitude: newLon,
                rowIndex: row,
                columnIndex: col,
                distanceFromCenterMeters: Math.round(distanceFromCenterMeters * 100) / 100,
            });
        }
    }
    return points;
}
