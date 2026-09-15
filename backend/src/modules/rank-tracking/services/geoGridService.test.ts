import { generateGrid } from './geoGridService';

describe('GeoGridService', () => {
  it('should generate exactly 9 points for a 3x3 grid', () => {
    const points = generateGrid({
      latitude: 17.385044,
      longitude: 78.486671,
      gridSize: 3,
      radiusMeters: 1000
    });
    
    expect(points.length).toBe(9);
    
    // Center point should be exactly the input coordinate
    const centerPoint = points.find(p => p.rowIndex === 1 && p.columnIndex === 1);
    expect(centerPoint).toBeDefined();
    expect(centerPoint?.distanceFromCenterMeters).toBe(0);
    expect(centerPoint?.latitude).toBe(17.385044);
    expect(centerPoint?.longitude).toBe(78.486671);
  });

  it('should generate exactly 49 points for a 7x7 grid', () => {
    const points = generateGrid({
      latitude: 17.385044,
      longitude: 78.486671,
      gridSize: 7,
      radiusMeters: 5000
    });
    
    expect(points.length).toBe(49);
    const centerPoint = points.find(p => p.rowIndex === 3 && p.columnIndex === 3);
    expect(centerPoint).toBeDefined();
    expect(centerPoint?.distanceFromCenterMeters).toBe(0);
  });

  it('should throw error on even grid size', () => {
    expect(() => {
      generateGrid({
        latitude: 17.385044,
        longitude: 78.486671,
        gridSize: 4 as any, // bypassing type if applicable
        radiusMeters: 1000
      });
    }).toThrow('Invalid grid size');
  });

  it('should throw error on invalid coordinates', () => {
    expect(() => {
      generateGrid({
        latitude: 91,
        longitude: 78.486671,
        gridSize: 3,
        radiusMeters: 1000
      });
    }).toThrow('Invalid latitude');
  });
});
