"use client";

import React, { useEffect, useRef, useState } from 'react';
import * as maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

export interface GridPoint {
  id: string;
  latitude: number;
  longitude: number;
  rowIndex: number;
  columnIndex: number;
  distanceFromCenterMeters: number;
  position?: number | null; // 1-100 or null if not ranking. Undefined if not checked.
  keyword?: string;
  timestamp?: string;
}

interface PositionMapProps {
  businessLat: number;
  businessLng: number;
  points: GridPoint[];
  gridSize: number;
  isLoading?: boolean;
  hasRankingData?: boolean;
  onPointClick?: (point: GridPoint) => void;
}

const getPositionColor = (position?: number | null) => {
  if (position === undefined) return '#9CA3AF'; // Not checked - gray
  if (position === null) return '#1F2937'; // Not ranking - dark gray
  if (position >= 1 && position <= 3) return '#10B981'; // Top 3 - emerald
  if (position >= 4 && position <= 10) return '#84CC16'; // 4-10 - lime
  if (position >= 11 && position <= 20) return '#EAB308'; // 11-20 - yellow
  if (position >= 21 && position <= 50) return '#F97316'; // 21-50 - orange
  return '#EF4444'; // 51-100 - red
};

const getPositionLabel = (position?: number | null) => {
  if (position === undefined) return 'Not checked';
  if (position === null) return 'Not ranking';
  if (position >= 1 && position <= 3) return 'Top 3';
  if (position >= 4 && position <= 10) return 'Top 10';
  if (position >= 11 && position <= 20) return '11-20';
  if (position >= 21 && position <= 50) return '21-50';
  return '51-100';
};

export const PositionMap: React.FC<PositionMapProps> = ({
  businessLat,
  businessLng,
  points,
  isLoading = false,
  hasRankingData = true,
  onPointClick
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);

  useEffect(() => {
    if (!mapContainer.current) return;
    
    // Ensure we have valid coordinates before trying to render
    if (isNaN(businessLat) || isNaN(businessLng)) {
      console.warn("Invalid coordinates for PositionMap", { businessLat, businessLng });
      return;
    }

    // Initialize map
    if (!map.current) {
      try {
        map.current = new maplibregl.Map({
          container: mapContainer.current,
        style: {
          version: 8,
          sources: {
            'osm-tiles': {
              type: 'raster',
              tiles: [
                'https://a.tile.openstreetmap.org/{z}/{x}/{y}.png',
                'https://b.tile.openstreetmap.org/{z}/{x}/{y}.png',
                'https://c.tile.openstreetmap.org/{z}/{x}/{y}.png'
              ],
              tileSize: 256,
              maxzoom: 19,
              attribution: '© OpenStreetMap contributors'
            }
          },
          layers: [
            {
              id: 'osm-tiles-layer',
              type: 'raster',
              source: 'osm-tiles',
              minzoom: 0,
              maxzoom: 19
            }
          ]
        },
        center: [businessLng, businessLat],
        zoom: 13,
      });

      map.current.addControl(new maplibregl.NavigationControl(), 'top-right');

      map.current.on('error', (e) => {
        console.error('MapLibre error:', e.error);
        if (e.error && e.error.message && e.error.message.includes('Unable to load')) {
          setTimeout(() => setMapError('Unable to load map'), 0);
        }
      });

      map.current.on('load', () => {
        setMapLoaded(true);
        // Force a resize slightly after load to fix blank canvas issues in hidden tabs
        setTimeout(() => {
          map.current?.resize();
        }, 100);
      });
    } catch (err) {
      console.error('Failed to initialize MapLibre:', err);
      setTimeout(() => setMapError('Unable to load map'), 0);
    }
    }

    // Clean up on unmount or when dependencies change
    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
        setMapLoaded(false);
      }
    };
  }, [businessLat, businessLng]);

  // Update markers when points change or map loads
  useEffect(() => {
    if (!map.current || !mapLoaded) return;

    // Remove existing markers
    const markers = document.getElementsByClassName('grid-marker');
    while(markers.length > 0) {
      markers[0].parentNode?.removeChild(markers[0]);
    }

    // Add business center marker
    const centerEl = document.createElement('div');
    centerEl.className = 'grid-marker center-marker';
    centerEl.innerHTML = `<div class="w-4 h-4 bg-blue-600 rounded-full border-2 border-white shadow-md"></div>`;
    new maplibregl.Marker({ element: centerEl })
      .setLngLat([businessLng, businessLat])
      .addTo(map.current);

    // Add grid points
    points.forEach((point) => {
      const el = document.createElement('div');
      el.className = 'grid-marker cursor-pointer transition-transform hover:scale-110';
      
      const bgColor = getPositionColor(point.position);
      const displayPos = point.position === undefined ? '—' : (point.position === null ? '—' : point.position.toString());
      
      el.innerHTML = `
        <div class="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-xs shadow-md border-2 border-white" style="background-color: ${bgColor}">
          ${displayPos}
        </div>
      `;

      el.addEventListener('click', () => {
        if (onPointClick) onPointClick(point);
      });

      const popupHTML = `
        <div class="p-2 text-sm text-gray-800 min-w-[200px]">
          <div class="font-bold border-b border-gray-200 pb-1 mb-1">Coordinate [${point.rowIndex}, ${point.columnIndex}]</div>
          <div class="mb-1 text-xs text-gray-500">${point.latitude.toFixed(5)}, ${point.longitude.toFixed(5)}</div>
          ${point.keyword ? `<div class="mb-1"><strong>Keyword:</strong> ${point.keyword}</div>` : ''}
          ${point.timestamp ? `<div class="mb-1"><strong>Checked:</strong> ${new Date(point.timestamp).toLocaleString()}</div>` : ''}
          <div class="mt-2 font-semibold">State: ${getPositionLabel(point.position)}</div>
          ${point.position ? `<div><strong>Exact Rank:</strong> ${point.position}</div>` : ''}
        </div>
      `;
      const popup = new maplibregl.Popup({ offset: 25, closeButton: false }).setHTML(popupHTML);

      new maplibregl.Marker({ element: el })
        .setLngLat([point.longitude, point.latitude])
        .setPopup(popup)
        .addTo(map.current!);
    });
    
    // Fit bounds
    if (points.length === 1) {
      map.current.setCenter([points[0].longitude, points[0].latitude]);
      map.current.setZoom(14);
    } else if (points.length > 1) {
      const bounds = new maplibregl.LngLatBounds();
      points.forEach(p => bounds.extend([p.longitude, p.latitude]));
      map.current.fitBounds(bounds, { padding: 40 });
    }

  }, [points, mapLoaded, businessLat, businessLng, onPointClick]);

  if (mapError) {
    return (
      <div className="w-full min-h-[400px] h-[400px] md:h-[500px] lg:h-[600px] flex items-center justify-center bg-red-50 rounded-lg border border-red-200">
        <p className="text-red-500 font-medium">Unable to load map</p>
      </div>
    );
  }

  if (points.length === 0 && !isLoading) {
    return (
      <div className="w-full min-h-[400px] h-[400px] md:h-[500px] lg:h-[600px] flex items-center justify-center bg-gray-50 rounded-lg border border-gray-200">
        <p className="text-gray-500">No geo-grid points configured</p>
      </div>
    );
  }

  return (
    <div className="w-full relative min-h-[400px] h-[400px] md:h-[500px] lg:h-[600px] rounded-lg overflow-hidden border border-gray-200 bg-gray-100">
      <div ref={mapContainer} className="absolute inset-0 w-full h-full" />
      
      {isLoading && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-white/70 backdrop-blur-sm">
          <div className="flex flex-col items-center text-gray-600">
            <svg className="animate-spin h-8 w-8 mb-2 text-emerald-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span className="font-medium">Loading position map…</span>
          </div>
        </div>
      )}

      {!hasRankingData && !isLoading && points.length > 0 && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 bg-yellow-50 text-yellow-800 px-4 py-2 rounded-full border border-yellow-200 shadow-sm text-sm font-medium">
          Ranking data unavailable
        </div>
      )}

      {/* Legend */}
      <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm p-3 rounded-lg shadow border border-gray-100 text-xs z-10">
        <h4 className="font-bold text-gray-700 mb-2">Ranking Legend</h4>
        <div className="space-y-1.5">
          <div className="flex items-center"><div className="w-3 h-3 rounded bg-[#10B981] mr-2"></div> 1-3 (Excellent)</div>
          <div className="flex items-center"><div className="w-3 h-3 rounded bg-[#84CC16] mr-2"></div> 4-10 (Good)</div>
          <div className="flex items-center"><div className="w-3 h-3 rounded bg-[#EAB308] mr-2"></div> 11-20 (Fair)</div>
          <div className="flex items-center"><div className="w-3 h-3 rounded bg-[#F97316] mr-2"></div> 21-50 (Poor)</div>
          <div className="flex items-center"><div className="w-3 h-3 rounded bg-[#EF4444] mr-2"></div> 51-100</div>
          <div className="flex items-center mt-2 pt-2 border-t border-gray-200"><div className="w-3 h-3 rounded bg-[#1F2937] mr-2"></div> Not ranking</div>
          <div className="flex items-center"><div className="w-3 h-3 rounded bg-[#9CA3AF] mr-2"></div> Not checked</div>
        </div>
      </div>
    </div>
  );
};
