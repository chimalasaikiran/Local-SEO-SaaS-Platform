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
}

interface PositionMapProps {
  businessLat: number;
  businessLng: number;
  points: GridPoint[];
  gridSize: number;
  onPointClick?: (point: GridPoint) => void;
}

const getPositionColor = (position?: number | null) => {
  if (position === undefined) return '#9CA3AF'; // Not checked - gray
  if (position === null) return '#EF4444'; // Not ranking - red
  if (position >= 1 && position <= 3) return '#10B981'; // Top 3 - emerald
  if (position >= 4 && position <= 10) return '#84CC16'; // 4-10 - lime
  if (position >= 11 && position <= 20) return '#EAB308'; // 11-20 - yellow
  if (position >= 21 && position <= 50) return '#F97316'; // 21-50 - orange
  return '#EF4444'; // 51-100 - red
};

export const PositionMap: React.FC<PositionMapProps> = ({
  businessLat,
  businessLng,
  points,
  gridSize,
  onPointClick
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  useEffect(() => {
    if (!mapContainer.current) return;
    
    // Ensure we have valid coordinates before trying to render
    if (isNaN(businessLat) || isNaN(businessLng)) {
      console.warn("Invalid coordinates for PositionMap", { businessLat, businessLng });
      return;
    }

    // Initialize map
    if (!map.current) {
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

      map.current.on('load', () => {
        setMapLoaded(true);
        // Force a resize slightly after load to fix blank canvas issues in hidden tabs
        setTimeout(() => {
          map.current?.resize();
        }, 100);
      });
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

      new maplibregl.Marker({ element: el })
        .setLngLat([point.longitude, point.latitude])
        .addTo(map.current!);
    });
    
    // Fit bounds
    if (points.length > 0) {
      const bounds = new maplibregl.LngLatBounds();
      points.forEach(p => bounds.extend([p.longitude, p.latitude]));
      map.current.fitBounds(bounds, { padding: 40 });
    }

  }, [points, mapLoaded, businessLat, businessLng, onPointClick]);

  return (
    <div className="w-full h-full relative min-h-[400px] rounded-lg overflow-hidden border border-gray-200">
      <div ref={mapContainer} className="absolute inset-0" />
      
      {/* Legend */}
      <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm p-3 rounded-lg shadow border border-gray-100 text-xs z-10">
        <h4 className="font-bold text-gray-700 mb-2">Ranking Legend</h4>
        <div className="space-y-1.5">
          <div className="flex items-center"><div className="w-3 h-3 rounded bg-[#10B981] mr-2"></div> 1-3 (Excellent)</div>
          <div className="flex items-center"><div className="w-3 h-3 rounded bg-[#84CC16] mr-2"></div> 4-10 (Good)</div>
          <div className="flex items-center"><div className="w-3 h-3 rounded bg-[#EAB308] mr-2"></div> 11-20 (Fair)</div>
          <div className="flex items-center"><div className="w-3 h-3 rounded bg-[#F97316] mr-2"></div> 21-50 (Poor)</div>
          <div className="flex items-center"><div className="w-3 h-3 rounded bg-[#EF4444] mr-2"></div> 51-100 / Not ranking</div>
          <div className="flex items-center mt-2 pt-2 border-t border-gray-200"><div className="w-3 h-3 rounded bg-[#9CA3AF] mr-2"></div> Not checked</div>
        </div>
      </div>
    </div>
  );
};
