import React, { useMemo, useCallback, useState } from 'react';
import Map, { Source, Layer, Marker, NavigationControl, ViewStateChangeEvent, MapLayerMouseEvent } from 'react-map-gl/maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';
import circle from '@turf/circle';
import { MapPin } from '@phosphor-icons/react';
import type { FeatureCollection, Geometry, GeoJsonProperties } from 'geojson';

// Types
export interface LocationPick {
  lat: number;
  lng: number;
  type: 'land' | 'water';
  placeName?: string;
}

export interface DamageRadii {
  crater: number; // meters
  fireball: number; // meters
  severeBlast: number; // meters
  lightBlast: number; // meters
}

export interface ImpactMapProps {
  lat: number;
  lng: number;
  zoom?: number;
  damageRadii?: DamageRadii;
  onLocationSelect?: (location: LocationPick) => void;
  onViewStateChange?: (viewState: { latitude: number; longitude: number; zoom: number }) => void;
  className?: string;
}

// Constants
const MAP_STYLE = 'https://tiles.openfreemap.org/styles/dark-matter';

// Simple heuristic for water detection (very coarse)
// In a real app, we'd use a proper polygon intersection or API
const isLikelyWater = (lat: number, lng: number): boolean => {
  // Pacific Ocean rough bounds
  if (lat < 50 && lat > -60 && lng < -120 && lng > -180) return true;
  if (lat < 50 && lat > -60 && lng > 130 && lng < 180) return true;
  // Atlantic Ocean rough bounds
  if (lat < 50 && lat > -60 && lng > -60 && lng < -20) return true;
  // Indian Ocean rough bounds
  if (lat < 20 && lat > -60 && lng > 40 && lng < 100) return true;
  return false;
};

export default function ImpactMap({
  lat,
  lng,
  zoom = 4,
  damageRadii,
  onLocationSelect,
  onViewStateChange,
  className = '',
}: ImpactMapProps) {
  const [viewState, setViewState] = useState({
    longitude: lng,
    latitude: lat,
    zoom: zoom,
  });

  // Sync external props to internal state if they change significantly
  React.useEffect(() => {
    if (Math.abs(viewState.latitude - lat) > 0.01 || Math.abs(viewState.longitude - lng) > 0.01) {
      setViewState((prev) => ({ ...prev, latitude: lat, longitude: lng }));
    }
  }, [lat, lng, viewState.latitude, viewState.longitude]);

  const handleMove = useCallback((evt: ViewStateChangeEvent) => {
    setViewState(evt.viewState);
    onViewStateChange?.({
      latitude: evt.viewState.latitude,
      longitude: evt.viewState.longitude,
      zoom: evt.viewState.zoom,
    });
  }, [onViewStateChange]);

  const handleClick = useCallback((evt: MapLayerMouseEvent) => {
    if (!onLocationSelect) return;
    
    const { lng, lat } = evt.lngLat;
    const type = isLikelyWater(lat, lng) ? 'water' : 'land';
    
    onLocationSelect({
      lat,
      lng,
      type,
      placeName: `${Math.abs(lat).toFixed(4)}°${lat >= 0 ? 'N' : 'S'}, ${Math.abs(lng).toFixed(4)}°${lng >= 0 ? 'E' : 'W'}`
    });
  }, [onLocationSelect]);

  // Generate GeoJSON for damage circles
  const damageGeoJSON = useMemo<FeatureCollection<Geometry, GeoJsonProperties> | null>(() => {
    if (!damageRadii) return null;

    const center = [lng, lat];
    const features = [];

    // Light blast (outermost)
    if (damageRadii.lightBlast > 0) {
      features.push(circle(center, damageRadii.lightBlast / 1000, {
        steps: 64,
        units: 'kilometers',
        properties: { type: 'lightBlast' }
      }));
    }

    // Severe blast
    if (damageRadii.severeBlast > 0) {
      features.push(circle(center, damageRadii.severeBlast / 1000, {
        steps: 64,
        units: 'kilometers',
        properties: { type: 'severeBlast' }
      }));
    }

    // Fireball
    if (damageRadii.fireball > 0) {
      features.push(circle(center, damageRadii.fireball / 1000, {
        steps: 64,
        units: 'kilometers',
        properties: { type: 'fireball' }
      }));
    }

    // Crater (innermost)
    if (damageRadii.crater > 0) {
      features.push(circle(center, damageRadii.crater / 1000, {
        steps: 64,
        units: 'kilometers',
        properties: { type: 'crater' }
      }));
    }

    return {
      type: 'FeatureCollection',
      features
    };
  }, [lat, lng, damageRadii]);

  return (
    <div className={`relative w-full h-full min-h-[400px] rounded-lg overflow-hidden bg-void ${className}`} aria-label="Interactive impact map">
      <Map
        {...viewState}
        onMove={handleMove}
        onClick={handleClick}
        mapStyle={MAP_STYLE}
        interactiveLayerIds={['background', 'water', 'land']}
        cursor={onLocationSelect ? 'crosshair' : 'grab'}
        attributionControl={false}
      >
        <NavigationControl position="bottom-right" showCompass={false} />
        
        {/* Target Marker */}
        <Marker longitude={lng} latitude={lat} anchor="bottom">
          <div className="text-danger-fire drop-shadow-glow-danger animate-pulse">
            <MapPin size={32} weight="fill" />
          </div>
        </Marker>

        {/* Damage Circles */}
        {damageGeoJSON && (
          <Source id="damage-circles" type="geojson" data={damageGeoJSON}>
            {/* Light Blast */}
            <Layer
              id="light-blast-fill"
              type="fill"
              filter={['==', 'type', 'lightBlast']}
              paint={{
                'fill-color': '#ffaa3d',
                'fill-opacity': 0.05,
              }}
            />
            <Layer
              id="light-blast-line"
              type="line"
              filter={['==', 'type', 'lightBlast']}
              paint={{
                'line-color': '#ffaa3d',
                'line-width': 1,
                'line-opacity': 0.3,
                'line-dasharray': [2, 2]
              }}
            />

            {/* Severe Blast */}
            <Layer
              id="severe-blast-fill"
              type="fill"
              filter={['==', 'type', 'severeBlast']}
              paint={{
                'fill-color': '#ffaa3d',
                'fill-opacity': 0.1,
              }}
            />
            <Layer
              id="severe-blast-line"
              type="line"
              filter={['==', 'type', 'severeBlast']}
              paint={{
                'line-color': '#ffaa3d',
                'line-width': 1.5,
                'line-opacity': 0.5,
              }}
            />

            {/* Fireball */}
            <Layer
              id="fireball-fill"
              type="fill"
              filter={['==', 'type', 'fireball']}
              paint={{
                'fill-color': '#ffaa3d',
                'fill-opacity': 0.25,
              }}
            />
            <Layer
              id="fireball-line"
              type="line"
              filter={['==', 'type', 'fireball']}
              paint={{
                'line-color': '#ffaa3d',
                'line-width': 2,
                'line-opacity': 0.8,
              }}
            />

            {/* Crater */}
            <Layer
              id="crater-fill"
              type="fill"
              filter={['==', 'type', 'crater']}
              paint={{
                'fill-color': '#ff5b2e',
                'fill-opacity': 0.4,
              }}
            />
            <Layer
              id="crater-line"
              type="line"
              filter={['==', 'type', 'crater']}
              paint={{
                'line-color': '#ff5b2e',
                'line-width': 2,
                'line-opacity': 1,
              }}
            />
          </Source>
        )}
      </Map>
      
      {/* Screen reader announcement for location changes */}
      <div className="sr-only" aria-live="polite">
        {`Map centered at ${Math.abs(lat).toFixed(2)} degrees ${lat >= 0 ? 'North' : 'South'}, ${Math.abs(lng).toFixed(2)} degrees ${lng >= 0 ? 'East' : 'West'}`}
      </div>
    </div>
  );
}
