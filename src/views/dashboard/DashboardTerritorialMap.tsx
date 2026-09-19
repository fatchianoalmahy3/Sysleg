import React, { useEffect } from 'react';
import { Map, X, MessageCircle } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, GeoJSON, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix Leaflet's default marker icons in Vite/React
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

function MapViewController({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, zoom, { duration: 1.2 });
  }, [center, zoom, map]);
  return null;
}

function createTacticalDotIcon(status: 'AMAN' | 'RAWAN' | 'KOSONG', count: number, isSelected: boolean = false, isLoksus: boolean = false) {
  const bg = isLoksus ? '#9333ea' : (status === 'AMAN' ? '#10b981' : status === 'RAWAN' ? '#f59e0b' : '#ef4444');
  const selectedRing = isSelected ? `ring-2 ring-indigo-600 scale-110 shadow-md` : `hover:scale-110`;

  return L.divIcon({
    className: 'tactical-radar-dot-custom',
    html: `
      <div class="relative flex items-center justify-center cursor-pointer select-none" style="width: 24px; height: 24px;">
        <div class="relative z-10 flex items-center justify-center rounded-full border-2 border-white text-white font-extrabold text-[9px] shadow-sm transition-transform duration-150 ${selectedRing}" 
             style="width: 22px; height: 22px; background-color: ${bg}; box-shadow: 0 1px 4px rgba(0,0,0,0.25);">
          ${isLoksus ? 'LK' : (count > 99 ? '99+' : count)}
        </div>
      </div>
    `,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    popupAnchor: [0, -12]
  });
}

interface DashboardTerritorialMapProps {
  currentDapilConfig: {
    center: [number, number];
    zoom: number;
    name: string;
    districts: string[];
  };
  showVillagePolygons: boolean;
  setShowVillagePolygons: (show: boolean) => void;
  villageGeoData: any;
  mapMarkerMode: 'NONE' | 'VILLAGE' | 'TPS';
  setMapMarkerMode: (mode: 'NONE' | 'VILLAGE' | 'TPS') => void;
  mapPinStatusFilter: 'ALL' | 'WARNING_ONLY' | 'SAFE_ONLY';
  setMapPinStatusFilter: (filter: 'ALL' | 'WARNING_ONLY' | 'SAFE_ONLY') => void;
  villageBattleList: any[];
  filteredTpsList: any[];
  selectedVillage: string;
  setSelectedVillage: (v: string) => void;
  tpsStats: {
    total: number;
  };
}

export function DashboardTerritorialMap({
  currentDapilConfig,
  showVillagePolygons,
  setShowVillagePolygons,
  villageGeoData,
  mapMarkerMode,
  setMapMarkerMode,
  mapPinStatusFilter,
  setMapPinStatusFilter,
  villageBattleList,
  filteredTpsList,
  selectedVillage,
  setSelectedVillage,
  tpsStats
}: DashboardTerritorialMapProps) {
  return (
    <div className="bg-white p-5 rounded-2xl shadow-xs border border-slate-200 space-y-3">
      <div className="flex items-center justify-between flex-wrap gap-2 pb-2 border-b border-slate-100">
        <div>
          <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
            <Map className="w-4 h-4 text-indigo-600" />
            Peta Teritorial Terfokus: {currentDapilConfig.name}
          </h3>
          <p className="text-xs text-slate-500">
            Visualisasi sebaran posko dan status kesiapan titik TPS di wilayah bertarung klien.
          </p>
        </div>

        {/* Map Layer Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Toggle Poligon Batas Desa */}
          <button
            onClick={() => setShowVillagePolygons(!showVillagePolygons)}
            className={`px-2.5 py-1 rounded-lg border text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              showVillagePolygons
                ? 'bg-indigo-50 border-indigo-200 text-indigo-700 shadow-xs'
                : 'bg-white border-slate-200 text-slate-600 hover:text-slate-900'
            }`}
            title="Tampilkan / Sembunyikan batas administrasi poligon desa"
          >
            <span className={`w-2 h-2 rounded-full ${showVillagePolygons ? 'bg-indigo-600' : 'bg-slate-300'}`}></span>
            <span>Batas Desa ({villageGeoData?.features?.length || 0})</span>
          </button>

          {/* Marker Level: Poligon Murni vs Posko vs TPS */}
          <div className="inline-flex bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-[11px] font-bold">
            <button
              onClick={() => setMapMarkerMode('NONE')}
              className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                mapMarkerMode === 'NONE' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Tampilan poligon bersih tanpa titik penanda"
            >
              🗺️ Poligon Murni
            </button>
            <button
              onClick={() => setMapMarkerMode('VILLAGE')}
              className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                mapMarkerMode === 'VILLAGE' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              📍 Posko ({villageBattleList.length})
            </button>
            <button
              onClick={() => setMapMarkerMode('TPS')}
              className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                mapMarkerMode === 'TPS' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              🗳️ TPS ({tpsStats.total})
            </button>
          </div>

          {/* Pin Filter: All vs Warnings only */}
          {mapMarkerMode !== 'NONE' && (
            <div className="inline-flex bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-[11px] font-bold">
              <button
                onClick={() => setMapPinStatusFilter('ALL')}
                className={`px-2 py-1 rounded-md transition-all cursor-pointer ${
                  mapPinStatusFilter === 'ALL' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Semua
              </button>
              <button
                onClick={() => setMapPinStatusFilter('WARNING_ONLY')}
                className={`px-2 py-1 rounded-md transition-all cursor-pointer flex items-center gap-1 ${
                  mapPinStatusFilter === 'WARNING_ONLY' ? 'bg-rose-600 text-white shadow-xs' : 'text-rose-600 hover:text-rose-800'
                }`}
                title="Hanya tampilkan titik rawan / butuh saksi"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                <span>Rawan Saja</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Focused Map Container */}
      <div className="h-80 w-full rounded-xl overflow-hidden border border-slate-200 relative z-0">
        <MapContainer
          center={currentDapilConfig.center}
          zoom={currentDapilConfig.zoom}
          scrollWheelZoom={true}
          style={{ height: '100%', width: '100%' }}
        >
          <MapViewController center={currentDapilConfig.center} zoom={currentDapilConfig.zoom} />
          
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {/* Dynamic GeoJSON Boundaries */}
          {showVillagePolygons && villageGeoData && (
            <GeoJSON
              key={`geo-${currentDapilConfig.name}-${villageGeoData.features?.length || 0}`}
              data={villageGeoData}
              style={(feature: any) => {
                const isSelected = selectedVillage === feature?.properties?.name;
                return {
                  fillColor: isSelected ? '#6366f1' : '#cbd5e1',
                  fillOpacity: isSelected ? 0.45 : 0.2,
                  color: isSelected ? '#4338ca' : '#64748b',
                  weight: isSelected ? 2.5 : 1,
                  dashArray: isSelected ? '' : '2, 3'
                };
              }}
              onEachFeature={(feature: any, layer: any) => {
                const desaName = feature?.properties?.name;
                layer.on({
                  click: () => {
                    if (desaName) {
                      setSelectedVillage(desaName);
                    }
                  }
                });
                layer.bindTooltip(`<strong>${desaName}</strong>`, { sticky: true, className: 'text-xs' });
              }}
            />
          )}

          {/* Posko Kelurahan Markers */}
          {mapMarkerMode === 'VILLAGE' && villageBattleList.map((v) => {
            if (mapPinStatusFilter === 'WARNING_ONLY' && v.status === 'AMAN') return null;
            return (
              <Marker
                key={`${v.kecamatan}-${v.name}`}
                position={[v.lat, v.lng]}
                icon={createTacticalDotIcon(v.status, v.ktpCount, selectedVillage === v.name)}
                eventHandlers={{
                  click: () => setSelectedVillage(v.name)
                }}
              >
                <Popup>
                  <div className="p-1 space-y-1.5 text-xs min-w-[170px]">
                    <div className="font-extrabold text-slate-900 border-b pb-1 flex justify-between items-center">
                      <span>{v.name}</span>
                      <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold ${
                        v.status === 'AMAN' ? 'bg-emerald-100 text-emerald-800' :
                        v.status === 'RAWAN' ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800'
                      }`}>
                        {v.status}
                      </span>
                    </div>
                    <div className="space-y-0.5 text-[11px] text-slate-600">
                      <div className="flex justify-between">
                        <span>KTP Terkumpul:</span>
                        <strong>{v.ktpCount} / {v.targetKtp}</strong>
                      </div>
                      <div className="flex justify-between">
                        <span>Saksi Terisi:</span>
                        <strong>{v.saksiCount} / {v.totalTps} TPS</strong>
                      </div>
                      <div className="flex justify-between">
                        <span>Kordes:</span>
                        <strong className="truncate max-w-[100px]">{v.kordesName}</strong>
                      </div>
                    </div>
                    {v.kordesPhone && (
                      <a
                        href={`https://wa.me/${v.kordesPhone.replace(/\D/g, '')}?text=Halo%20${encodeURIComponent(v.kordesName)},%20update%20lapangan%20posko%20${encodeURIComponent(v.name)}`}
                        target="_blank"
                        rel="noreferrer"
                        className="w-full mt-1 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded text-center flex items-center justify-center gap-1 cursor-pointer text-[11px]"
                      >
                        <MessageCircle className="w-3 h-3" />
                        <span>WA Kordes</span>
                      </a>
                    )}
                  </div>
                </Popup>
              </Marker>
            );
          })}

          {/* TPS Specific Markers */}
          {mapMarkerMode === 'TPS' && filteredTpsList.map((tps) => {
            if (mapPinStatusFilter === 'WARNING_ONLY' && tps.status === 'AMAN' && !tps.isLoksus) return null;
            return (
              <Marker
                key={tps.id}
                position={[tps.lat, tps.lng]}
                icon={createTacticalDotIcon(tps.status, tps.ktpCount, false, !!tps.isLoksus)}
              >
                <Popup>
                  <div className="p-1 space-y-1.5 text-xs min-w-[170px]">
                    <div className="font-extrabold text-slate-900 border-b pb-1 flex justify-between items-center">
                      <div className="flex items-center gap-1">
                        <span>{tps.nomorTps} ({tps.desa})</span>
                        {tps.isLoksus && (
                          <span className="px-1 py-0.2 rounded bg-purple-100 text-purple-800 text-[8px] font-black">
                            LOKSUS
                          </span>
                        )}
                      </div>
                      <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold ${
                        tps.isLoksus ? 'bg-purple-100 text-purple-800' :
                        tps.status === 'AMAN' ? 'bg-emerald-100 text-emerald-800' :
                        tps.status === 'RAWAN' ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800'
                      }`}>
                        {tps.isLoksus ? 'TPS KHUSUS' : tps.status}
                      </span>
                    </div>
                    {tps.isLoksus && tps.loksusName && (
                      <div className="p-1 bg-purple-50 rounded border border-purple-200 text-[10px] text-purple-900 font-bold">
                        {tps.loksusName}
                      </div>
                    )}
                    <div className="space-y-0.5 text-[11px] text-slate-600">
                      <div className="flex justify-between">
                        <span>KTP Terdaftar:</span>
                        <strong>{tps.ktpCount} / {tps.targetSuara}</strong>
                      </div>
                      <div className="flex justify-between">
                        <span>DPT TPS:</span>
                        <strong>{tps.dpt} Pemilih</strong>
                      </div>
                      <div className="flex justify-between">
                        <span>Saksi Ditugaskan:</span>
                        <strong className="truncate max-w-[100px]">{tps.saksiName}</strong>
                      </div>
                    </div>
                    {tps.saksiPhone && (
                      <a
                        href={`https://wa.me/${tps.saksiPhone.replace(/\D/g, '')}?text=Halo%20Bpk/Ibu%20${encodeURIComponent(tps.saksiName)},%20update%20terkini%20kesiapan%20${encodeURIComponent(tps.nomorTps)}%20${encodeURIComponent(tps.desa)}`}
                        target="_blank"
                        rel="noreferrer"
                        className="w-full mt-1 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-center flex items-center justify-center gap-1.5 cursor-pointer text-xs"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span>Hubungi Saksi (WA)</span>
                      </a>
                    )}
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>

        {/* Active Village Selection Notice */}
        {selectedVillage !== 'ALL' && (
          <div className="absolute top-2.5 right-2.5 bg-indigo-900 text-white px-3 py-1.5 rounded-xl shadow-lg z-[1000] text-xs flex items-center gap-2 border border-indigo-700 animate-in fade-in">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Fokus: <strong>{selectedVillage}</strong></span>
            <button
              onClick={() => setSelectedVillage('ALL')}
              className="ml-1 p-0.5 hover:bg-indigo-800 rounded text-slate-300 hover:text-white cursor-pointer"
              title="Kembali ke semua desa"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Floating Map Legend */}
        <div className="absolute bottom-2 left-2 bg-white/95 backdrop-blur-xs p-2.5 rounded-xl border border-slate-200 shadow-md z-[1000] text-[11px]">
          <div className="flex items-center justify-between gap-2 mb-1">
            <span className="font-black text-slate-800">
              {mapMarkerMode === 'VILLAGE' ? 'Radar Titik Posko Kelurahan:' : 'Radar Titik TPS Lapangan:'}
            </span>
            <span className="text-[10px] text-slate-400">Angka = KTP</span>
          </div>
          <div className="flex items-center gap-3 font-semibold text-slate-600">
            <div className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
              <span>Aman (≥35 KTP)</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
              <span>Rawan (&lt;35 KTP)</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
              <span>Butuh Saksi</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
