// @vitest-environment jsdom
import React from 'react';
import { render, screen, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';

afterEach(() => {
  cleanup();
});
import { PositionMap } from '../PositionMap';

vi.mock('maplibre-gl', () => {
  return {
    Map: class {
      addControl = vi.fn();
      on = vi.fn();
      remove = vi.fn();
      resize = vi.fn();
      setCenter = vi.fn();
      setZoom = vi.fn();
      fitBounds = vi.fn();
    },
    NavigationControl: class {},
    Marker: class {
      setLngLat = vi.fn().mockReturnThis();
      setPopup = vi.fn().mockReturnThis();
      addTo = vi.fn();
    },
    Popup: class {
      setHTML = vi.fn().mockReturnThis();
    },
    LngLatBounds: class {
      extend = vi.fn();
    }
  };
});

describe('PositionMap', () => {
  const defaultProps = {
    businessLat: 40.7128,
    businessLng: -74.0060,
    gridSize: 3,
    points: [],
  };

  it('renders No geo-grid points configured when points are empty', () => {
    render(<PositionMap {...defaultProps} points={[]} />);
    expect(screen.getByText('No geo-grid points configured')).toBeTruthy();
  });

  it('renders loading state when isLoading is true', () => {
    render(<PositionMap {...defaultProps} isLoading={true} points={[]} />);
    expect(screen.getByText('Loading position map…')).toBeTruthy();
  });

  it('renders missing ranking data overlay when hasRankingData is false', () => {
    const points = [{
      id: '1',
      latitude: 40.713,
      longitude: -74.007,
      rowIndex: 0,
      columnIndex: 0,
      distanceFromCenterMeters: 100,
      position: undefined
    }];
    render(<PositionMap {...defaultProps} points={points} hasRankingData={false} />);
    expect(screen.getByText('Ranking data unavailable')).toBeTruthy();
  });

  it('renders map legend and prevents empty state when points exist', () => {
    const points = [{
      id: '1',
      latitude: 40.713,
      longitude: -74.007,
      rowIndex: 0,
      columnIndex: 0,
      distanceFromCenterMeters: 100,
      position: 1
    }];
    render(<PositionMap {...defaultProps} points={points} hasRankingData={true} />);
    
    expect(screen.queryByText('No geo-grid points configured')).toBeNull();
    
    expect(screen.getByText('Ranking Legend')).toBeTruthy();
    expect(screen.getByText('1-3 (Excellent)')).toBeTruthy();
    expect(screen.getByText('Not ranking')).toBeTruthy();
    expect(screen.getByText('Not checked')).toBeTruthy();
  });
});
