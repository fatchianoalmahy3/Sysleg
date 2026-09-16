import { MapPin, Search, Compass, Check } from 'lucide-react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import { useState } from 'react';
import L from 'leaflet';

// Leaflet default icon fix
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

interface LocationData {
  lat: number;
  lng: number;
  name: string;
}

interface LocationPickerProps {
  value: LocationData | null;
  onChange: (value: LocationData) => void;
  label: string;
}

const PRESET_LOCATIONS: LocationData[] = [
  { lat: -7.2140, lng: 107.9000, name: 'Posko Garut Kota' },
  { lat: -7.2500, lng: 107.8500, name: 'Posko Tarogong' },
  { lat: -7.1500, lng: 107.9200, name: 'Posko Karangpawitan' },
];

function LocationClicker({ onLocationSelect }: { onLocationSelect: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onLocationSelect(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

export function LocationPicker({ value, onChange, label }: LocationPickerProps) {
  const LOCATIONIQ_API_KEY = import.meta.env.VITE_LOCATIONIQ_API_KEY;
  const mapCenter: [number, number] = value ? [value.lat, value.lng] : [-7.2140, 107.9000];

  const handleMapClick = (lat: number, lng: number) => {
    onChange({ lat, lng, name: `Custom: ${lat.toFixed(4)}, ${lng.toFixed(4)}` });
  };

  return (
    <div className="space-y-2">
      <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">{label}</label>
      
      <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-sm">
        <div className="relative h-64 bg-slate-50 z-0 border-b border-slate-100">
          {LOCATIONIQ_API_KEY ? (
            <MapContainer 
              center={mapCenter} 
              zoom={13} 
              style={{ height: '100%', width: '100%', zIndex: 1 }}
            >
              <TileLayer
                attribution='&copy; <a href="https://locationiq.com/?ref=maps">LocationIQ</a>'
                url={`https://{s}-tiles.locationiq.com/v3/osm_streets/{z}/{x}/{y}.png?key=${LOCATIONIQ_API_KEY}`}
              />
              <LocationClicker onLocationSelect={handleMapClick} />
              {value && <Marker position={[value.lat, value.lng]} />}
            </MapContainer>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center flex-col p-6 text-center z-10">
              <Compass className="w-8 h-8 text-slate-300 mb-3" />
              <p className="text-sm font-bold text-slate-600">Map Belum Tersedia</p>
              <p className="text-xs text-slate-400 max-w-sm mt-1">
                Masukkan VITE_LOCATIONIQ_API_KEY di environment untuk mengaktifkan pemetaan.
              </p>
            </div>
          )}

          {/* Coordinates overlay badge */}
          {value && (
            <div className="absolute bottom-3 right-3 bg-slate-900/80 backdrop-blur-sm text-[10px] font-mono text-white px-2.5 py-1 rounded-md shadow-md z-10">
              LAT: {value.lat.toFixed(4)}, LNG: {value.lng.toFixed(4)}
            </div>
          )}
        </div>

        {/* Preset Selectors */}
        <div className="p-3 bg-slate-50/50 space-y-2">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Pilih Preset Posko</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {PRESET_LOCATIONS.map((loc) => {
              const isSelected = value?.name === loc.name;
              return (
                <button
                  key={loc.name}
                  type="button"
                  onClick={() => onChange(loc)}
                  className={`flex items-center justify-between text-left p-2 rounded-lg border text-xs transition-all ${
                    isSelected
                      ? 'border-indigo-500 bg-indigo-50/50 text-indigo-700 font-bold'
                      : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                  }`}
                >
                  <span className="truncate pr-1">{loc.name}</span>
                  {isSelected && <Check className="w-3.5 h-3.5 text-indigo-600 flex-shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
