"use client";

import React, { useEffect, useRef, useState } from 'react';
import * as maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

export interface CompetitorMarker {
  id: string;
  latitude: number;
  longitude: number;
  name: string;
  category: string;
  distanceMeters: number;
  status?: string; // e.g. ACTIVE, DISCOVERED
}

interface CompetitorMapProps {
  businessLat: number;
  businessLng: number;
  competitors: CompetitorMarker[];
  isLoading?: boolean;
  onMarkerClick?: (comp: CompetitorMarker) => void;
}

export const CompetitorMap: React.FC<CompetitorMapProps> = ({
  businessLat,
  businessLng,
  competitors,
  isLoading = false,
  onMarkerClick
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);

  useEffect(() => {
    if (!mapContainer.current) return;
    
    let centerLat = businessLat;
    let centerLng = businessLng;

    if (isNaN(businessLat) || isNaN(businessLng) || (businessLat === 0 && businessLng === 0)) {
      if (competitors.length > 0) {
        centerLat = competitors[0].latitude;
        centerLng = competitors[0].longitude;
      } else {
        return; // still wait
      }
    }

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
                  'https://tile.openstreetmap.org/{z}/{x}/{y}.png'
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
          center: [centerLng, centerLat],
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
          setTimeout(() => map.current?.resize(), 100);
        });
      } catch (err) {
        console.error('Failed to initialize MapLibre:', err);
        setTimeout(() => setMapError('Unable to load map'), 0);
      }
    }

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
        setMapLoaded(false);
      }
    };
  }, [businessLat, businessLng]);

  useEffect(() => {
    if (!map.current || !mapLoaded) return;

    // Remove existing markers
    const markers = document.getElementsByClassName('comp-marker');
    while(markers.length > 0) {
      markers[0].parentNode?.removeChild(markers[0]);
    }

    // Add business center marker
    const centerEl = document.createElement('div');
    centerEl.className = 'comp-marker center-marker';
    centerEl.innerHTML = `<div class="w-6 h-6 bg-blue-600 rounded-full border-2 border-white shadow-lg flex items-center justify-center"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg></div>`;
    new maplibregl.Marker({ element: centerEl })
      .setLngLat([businessLng, businessLat])
      .addTo(map.current);

    // Add competitors
    competitors.forEach((comp) => {
      const el = document.createElement('div');
      el.className = 'comp-marker cursor-pointer transition-transform hover:scale-110 relative';
      
      const isDiscovered = comp.status === 'DISCOVERED';
      const bgColor = isDiscovered ? 'bg-orange-500' : 'bg-emerald-500';
      
      el.innerHTML = `
        <div class="w-5 h-5 rounded-full ${bgColor} border-2 border-white shadow-md"></div>
      `;

      el.addEventListener('click', () => {
        if (onMarkerClick) onMarkerClick(comp);
      });

      const popupHTML = `
        <div class="p-2 text-sm text-gray-800 min-w-[150px]">
          <div class="font-bold border-b border-gray-200 pb-1 mb-1">${comp.name}</div>
          <div class="mb-1 text-xs text-gray-500">${comp.category || 'Unknown category'}</div>
          <div><strong>Distance:</strong> ${(comp.distanceMeters / 1000).toFixed(2)} km</div>
          <div class="mt-1 font-semibold text-xs text-gray-600">Status: ${comp.status}</div>
        </div>
      `;
      const popup = new maplibregl.Popup({ offset: 25, closeButton: false }).setHTML(popupHTML);

      new maplibregl.Marker({ element: el })
        .setLngLat([comp.longitude, comp.latitude])
        .setPopup(popup)
        .addTo(map.current!);
    });
    
    // Fit bounds
    if (competitors.length === 1 && businessLat === 0 && businessLng === 0) {
      map.current.setCenter([competitors[0].longitude, competitors[0].latitude]);
      map.current.setZoom(14);
    } else if (competitors.length > 0 || (businessLat !== 0 && businessLng !== 0)) {
      const bounds = new maplibregl.LngLatBounds();
      if (businessLat !== 0 && businessLng !== 0) {
        bounds.extend([businessLng, businessLat]);
      }
      competitors.forEach(p => bounds.extend([p.longitude, p.latitude]));
      map.current.fitBounds(bounds, { padding: 50 });
    }

  }, [competitors, mapLoaded, businessLat, businessLng, onMarkerClick]);

  if (mapError) {
    return (
      <div className="w-full h-[400px] md:h-[500px] lg:h-[600px] min-h-[400px] flex items-center justify-center bg-red-50 rounded-lg border border-red-200">
        <p className="text-red-500 font-medium">Unable to load map</p>
      </div>
    );
  }

  if (competitors.length === 0 && businessLat === 0 && businessLng === 0 && !isLoading) {
    return (
      <div className="w-full h-[400px] md:h-[500px] lg:h-[600px] min-h-[400px] flex items-center justify-center bg-gray-50 rounded-lg border border-gray-200">
        <p className="text-gray-500">No competitor locations configured</p>
      </div>
    );
  }

  return (
    <div className="w-full relative h-[400px] md:h-[500px] lg:h-[600px] min-h-[400px] rounded-xl overflow-hidden border border-gray-200 shadow-sm bg-gray-100">
      <div ref={mapContainer} className="absolute inset-0 w-full h-full" />
      
      {isLoading && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-white/70 backdrop-blur-sm">
          <div className="flex flex-col items-center text-gray-600">
            <svg className="animate-spin h-8 w-8 mb-2 text-emerald-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span className="font-medium">Loading competitor map…</span>
          </div>
        </div>
      )}

      <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm p-3 rounded-lg shadow-sm border border-gray-100 text-xs z-10">
        <h4 className="font-bold text-gray-700 mb-2">Map Legend</h4>
        <div className="space-y-2">
          <div className="flex items-center"><div className="w-4 h-4 rounded-full bg-blue-600 border border-white mr-2"></div> Your Business</div>
          <div className="flex items-center"><div className="w-4 h-4 rounded-full bg-emerald-500 border border-white mr-2"></div> Tracked Competitor</div>
          <div className="flex items-center"><div className="w-4 h-4 rounded-full bg-orange-500 border border-white mr-2"></div> Discovered Place</div>
        </div>
      </div>
    </div>
  );
};
