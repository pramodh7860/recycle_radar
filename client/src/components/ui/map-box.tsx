import { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { Maximize2, MapPin, AlertTriangle } from "lucide-react";
import { CollectionZone, WasteCollection } from "@shared/schema";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast"; // Corrected import path

interface MapBoxProps {
  title?: string;
  description?: string;
  fullWidth?: boolean;
  additionalMarkers?: {
    id: number;
    coordinates: [number, number];
    type: 'waste' | 'factory' | 'complaint';
    data?: any;
  }[];
  onMarkerClick?: (id: number, type: string, data: any) => void;
  allowMarkerDrag?: boolean;
  onMarkerDragEnd?: (coordinates: [number, number]) => void;
}

const MapBox = ({ 
  title = "Waste Collection Map", 
  description,
  fullWidth = false,
  additionalMarkers = [],
  onMarkerClick,
  allowMarkerDrag = false,
  onMarkerDragEnd 
}: MapBoxProps) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapboxgl, setMapboxgl] = useState<any>(null);
  const [map, setMap] = useState<any>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  // Fetch collection zones
  const { data: zones = [], isLoading } = useQuery<CollectionZone[]>({
    queryKey: ['/api/collection-zones'],
  });

  // Load Mapbox GL JS asynchronously
  useEffect(() => {
    const loadMapbox = async () => {
      try {
        const mapboxglModule = await import('mapbox-gl');
        setMapboxgl(mapboxglModule.default);
      } catch (error) {
        console.error('Failed to load Mapbox GL JS:', error);
      }
    };

    loadMapbox();
  }, []);

  // Initialize map when Mapbox is loaded and container is ready
  useEffect(() => {
    if (!mapboxgl || !mapContainerRef.current || mapLoaded) return;

    // Use a public API key for Mapbox.  This should be replaced with a secure method in production.
    const apiKey = 'pk.eyJ1IjoiYm9sdC13YXN0ZSIsImEiOiJjbHRkOHNoZ2UwMGNtMmpud3k2aHFnczkyIn0.HYcvfgWk_-rGcNbMFnLPVw';
    mapboxgl.accessToken = apiKey;

    const newMap = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: 'mapbox://styles/mapbox/streets-v11',
      center: [77.2090, 28.6139], // New Delhi coordinates
      zoom: 11,
      pitch: 45, // 3D effect
      bearing: -17.6,
    });

    newMap.on('load', () => {
      // Add 3D building layer for terrain
      newMap.addLayer({
        'id': '3d-buildings',
        'source': 'composite',
        'source-layer': 'building',
        'filter': ['==', 'extrude', 'true'],
        'type': 'fill-extrusion',
        'minzoom': 15,
        'paint': {
          'fill-extrusion-color': '#aaa',
          'fill-extrusion-height': [
            'interpolate', ['linear'], ['zoom'],
            15, 0,
            15.05, ['get', 'height']
          ],
          'fill-extrusion-base': [
            'interpolate', ['linear'], ['zoom'],
            15, 0,
            15.05, ['get', 'min_height']
          ],
          'fill-extrusion-opacity': 0.6
        }
      });

      setMap(newMap);
      setMapLoaded(true);
    });

    return () => {
      if (newMap) newMap.remove();
    };
  }, [mapboxgl, mapLoaded]);

  // Add markers when map is loaded and zones are available
  useEffect(() => {
    if (!map || !zones.length) return;

    // Remove existing markers
    const existingMarkers = document.querySelectorAll('.mapboxgl-marker');
    existingMarkers.forEach(marker => marker.remove());

    // Add markers for each zone
    zones.forEach(zone => {
      try {
        const coordinates = JSON.parse(zone.coordinates) as [number, number];

        // Create marker element
        const markerElement = document.createElement('div');
        markerElement.className = 'flex items-center justify-center';

        // Set marker color based on zone type
        let markerColor = '';
        switch (zone.zoneType) {
          case 'collection':
            markerColor = 'bg-red-600';
            break;
          case 'processing':
            markerColor = 'bg-red-500';
            break;
          case 'high_waste':
            markerColor = 'bg-red-700';
            break;
          default:
            markerColor = 'bg-red-400';
        }

        // Create the marker HTML
        markerElement.innerHTML = `
          <div class="h-6 w-6 rounded-full ${markerColor} flex items-center justify-center text-white text-xs font-bold">
            ${zone.id}
          </div>
        `;

        // Add marker to map
        new mapboxgl.Marker(markerElement)
          .setLngLat(coordinates)
          .setPopup(new mapboxgl.Popup().setHTML(`
            <div class="p-2">
              <div class="font-bold">${zone.name}</div>
              <div class="text-xs">${zone.zoneType.replace('_', ' ')}</div>
            </div>
          `))
          .addTo(map);
      } catch (error) {
        console.error(`Error creating marker for zone ${zone.id}:`, error);
      }
    });

    // Add additional markers if provided
    additionalMarkers.forEach(marker => {
      try {
        // Create marker element
        const markerElement = document.createElement('div');
        markerElement.className = 'flex items-center justify-center';

        // Set marker style based on type
        let markerIcon = '';
        let markerColor = '';

        switch (marker.type) {
          case 'waste':
            markerIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg>`;
            markerColor = 'bg-amber-500';
            break;
          case 'factory':
            markerIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 20a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8l-7 5V8l-7 5V4a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"></path></svg>`;
            markerColor = 'bg-blue-500';
            break;
          case 'complaint':
            markerIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>`;
            markerColor = 'bg-red-600';
            break;
          default:
            markerIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle></svg>`;
            markerColor = 'bg-gray-600';
        }

        // Create the marker HTML with icon
        markerElement.innerHTML = `
          <div class="h-8 w-8 rounded-full ${markerColor} flex items-center justify-center text-white">
            ${markerIcon}
          </div>
        `;

        // Create the marker and add it to the map
        const mapMarker = new mapboxgl.Marker({
          element: markerElement,
          draggable: allowMarkerDrag
        })
          .setLngLat(marker.coordinates)
          .addTo(map);

        // Add popup if data is available
        if (marker.data) {
          mapMarker.setPopup(
            new mapboxgl.Popup().setHTML(`
              <div class="p-2">
                <div class="font-bold">ID: ${marker.id}</div>
                <div class="text-xs">${marker.type}</div>
              </div>
            `)
          );
        }

        // Add click handler if provided
        if (onMarkerClick) {
          markerElement.addEventListener('click', () => {
            onMarkerClick(marker.id, marker.type, marker.data);
          });
        }

        // Add drag end handler if provided
        if (allowMarkerDrag && onMarkerDragEnd) {
          mapMarker.on('dragend', () => {
            const lngLat = mapMarker.getLngLat();
            onMarkerDragEnd([lngLat.lng, lngLat.lat]);
          });
        }
      } catch (error) {
        console.error(`Error creating custom marker:`, error);
      }
    });
  }, [map, zones, additionalMarkers, onMarkerClick, allowMarkerDrag, onMarkerDragEnd]);

  // Handle dialog open/close to resize map
  useEffect(() => {
    if (dialogOpen && map) {
      setTimeout(() => {
        map.resize();
      }, 100);
    }
  }, [dialogOpen, map]);

  return (
    <Card className={fullWidth ? "w-full" : ""}>
      <CardHeader className="border-b border-gray-200 p-4 flex justify-between items-center">
        <CardTitle className="font-inter font-medium text-lg">{title}</CardTitle>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <button className="text-red-700 hover:text-red-900">
              <Maximize2 className="h-5 w-5" />
            </button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[900px] sm:max-h-[800px]">
            <div className="h-[600px] w-full">
              {!mapLoaded && (
                <div className="h-full w-full flex items-center justify-center bg-gray-100">
                  <div className="animate-spin h-8 w-8 border-4 border-red-700 border-t-transparent rounded-full"></div>
                </div>
              )}
              <div id="fullscreen-map" className="h-full w-full" ref={mapContainerRef}></div>
            </div>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent className="p-4">
        <div className="relative">
          {isLoading && (
            <div className="absolute inset-0 bg-gray-100 bg-opacity-70 flex items-center justify-center z-10">
              <div className="animate-spin h-8 w-8 border-4 border-red-700 border-t-transparent rounded-full"></div>
            </div>
          )}

          <div className="map-container h-96 rounded-lg relative">
            {!mapLoaded && (
              <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center text-white">
                <div className="text-center">
                  <svg className="mx-auto h-12 w-12 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                  </svg>
                  <p>Interactive Waste Collection Map</p>
                  <p className="text-sm opacity-80">Loading map data...</p>
                </div>
              </div>
            )}
            <div id="map" className="h-full w-full" ref={mapContainerRef}></div>

            {/* Map Legend */}
            <div className="absolute bottom-4 right-4 bg-white rounded-md shadow-md p-3 text-sm">
              <div className="mb-2 font-medium">Map Legend</div>
              <div className="flex items-center mb-1">
                <span className="inline-block w-3 h-3 rounded-full bg-red-600 mr-2"></span>
                <span>Collection Points</span>
              </div>
              <div className="flex items-center mb-1">
                <span className="inline-block w-3 h-3 rounded-full bg-red-500 mr-2"></span>
                <span>Processing Centers</span>
              </div>
              <div className="flex items-center mb-1">
                <span className="inline-block w-3 h-3 rounded-full bg-red-700 mr-2"></span>
                <span>High Waste Areas</span>
              </div>
              <div className="flex items-center mb-1">
                <span className="inline-block w-3 h-3 rounded-full bg-amber-500 mr-2"></span>
                <span>Waste Collection</span>
              </div>
              <div className="flex items-center">
                <span className="inline-block w-3 h-3 rounded-full bg-blue-500 mr-2"></span>
                <span>Factories</span>
              </div>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="bg-gray-50 p-3 rounded-md">
              <div className="text-xs text-gray-600 mb-1">Total Coverage</div>
              <div className="text-lg font-medium">12.4 km²</div>
            </div>
            <div className="bg-gray-50 p-3 rounded-md">
              <div className="text-xs text-gray-600 mb-1">Active Areas</div>
              <div className="text-lg font-medium">{zones.length} Zones</div>
            </div>
            <div className="bg-gray-50 p-3 rounded-md">
              <div className="text-xs text-gray-600 mb-1" role="heading" aria-level={2}>{title}</div>
              {description && <p className="text-xs text-gray-500 mb-2">{description}</p>}
              <div className="text-xs text-gray-600 mb-1">Collection Points</div>
                <div className="text-lg font-medium">
                  {zones.filter(z => z.zoneType === 'collection').length} Points
                </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default MapBox;