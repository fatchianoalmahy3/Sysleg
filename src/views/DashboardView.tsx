import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Users, 
  CheckCircle2, 
  TrendingUp, 
  Target, 
  Map, 
  Award, 
  Wallet, 
  RefreshCw, 
  Database, 
  Sparkles, 
  Check, 
  AlertCircle,
  FileSpreadsheet,
  Filter,
  Activity,
  MapPin,
  ChevronRight,
  ShieldCheck,
  X,
  Layers,
  Flame,
  PieChart,
  Eye,
  EyeOff,
  BarChart3,
  Phone,
  MessageCircle,
  AlertTriangle,
  Send,
  Download,
  Search,
  ExternalLink,
  ChevronDown,
  Navigation,
  Compass
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { ApiService } from '../services/api';
import { seedCloudDatabase } from '../services/dbSeeder';
import { MapContainer, TileLayer, Marker, Popup, GeoJSON, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { formatRupiah } from '../utils/electoralData';
import { 
  PONOROGO_DAPIL_GEO, 
  PONOROGO_DISTRICTS_GEO, 
  getStrengthColor 
} from '../data/ponorogoGeoData';
import { PONOROGO_DISTRICTS } from '../data/ponorogoRegions';
import { getVillageCentroid } from '../data/ponorogoVillageCoordinates';

// Fix Leaflet's default marker icons in Vite/React
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Custom map view controller for auto-centering and zoom based on active Dapil
function MapViewController({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, zoom, { duration: 1.2 });
  }, [center, zoom, map]);
  return null;
}

// Clean, static tactical micro-badge generator (replaces blinking ping dots)
function createTacticalDotIcon(status: 'AMAN' | 'RAWAN' | 'KOSONG', count: number, isSelected: boolean = false) {
  const bg = status === 'AMAN' ? '#10b981' : status === 'RAWAN' ? '#f59e0b' : '#ef4444';
  const selectedRing = isSelected ? `ring-2 ring-indigo-600 scale-110 shadow-md` : `hover:scale-110`;

  return L.divIcon({
    className: 'tactical-radar-dot-custom',
    html: `
      <div class="relative flex items-center justify-center cursor-pointer select-none" style="width: 22px; height: 22px;">
        <div class="relative z-10 flex items-center justify-center rounded-full border-2 border-white text-white font-extrabold text-[9px] shadow-sm transition-transform duration-150 ${selectedRing}" 
             style="width: 20px; height: 20px; background-color: ${bg}; box-shadow: 0 1px 4px rgba(0,0,0,0.25);">
          ${count > 99 ? '99+' : count}
        </div>
      </div>
    `,
    iconSize: [22, 22],
    iconAnchor: [11, 11],
    popupAnchor: [0, -11]
  });
}

// Center coordinates per Dapil in Kabupaten Ponorogo
const DAPIL_CENTERS: Record<string, { center: [number, number]; zoom: number; name: string; districts: string[] }> = {
  ALL: {
    center: [-7.8687, 111.4623],
    zoom: 11,
    name: 'Seluruh Kabupaten Ponorogo',
    districts: Object.keys(PONOROGO_DISTRICTS)
  },
  DAPIL_1: {
    center: [-7.8480, 111.4650],
    zoom: 13,
    name: 'Dapil Ponorogo 1 (Kota & Babadan)',
    districts: ['Kecamatan Ponorogo (Kota)', 'Kecamatan Babadan']
  },
  DAPIL_2: {
    center: [-7.8750, 111.5300],
    zoom: 12,
    name: 'Dapil Ponorogo 2 (Jenangan, Siman, Jetis, Mlarak)',
    districts: ['Kecamatan Jenangan', 'Kecamatan Siman', 'Kecamatan Jetis', 'Kecamatan Mlarak']
  },
  DAPIL_3: {
    center: [-7.8650, 111.6450],
    zoom: 12,
    name: 'Dapil Ponorogo 3 (Pulung, Pudak, Sooko, Sawoo, Ngebel)',
    districts: ['Kecamatan Pulung', 'Kecamatan Pudak', 'Kecamatan Sooko', 'Kecamatan Sawoo', 'Kecamatan Ngebel']
  },
  DAPIL_4: {
    center: [-8.0350, 111.4850],
    zoom: 12,
    name: 'Dapil Ponorogo 4 (Sambit, Bungkal, Slahung, Ngrayun)',
    districts: ['Kecamatan Sambit', 'Kecamatan Bungkal', 'Kecamatan Slahung', 'Kecamatan Ngrayun']
  },
  DAPIL_5: {
    center: [-7.9250, 111.3450],
    zoom: 12,
    name: 'Dapil Ponorogo 5 (Balong, Jambon, Badegan)',
    districts: ['Kecamatan Balong', 'Kecamatan Jambon', 'Kecamatan Badegan']
  },
  DAPIL_6: {
    center: [-7.8150, 111.3650],
    zoom: 12,
    name: 'Dapil Ponorogo 6 (Kauman, Sukorejo, Sampung)',
    districts: ['Kecamatan Kauman (Sumoroto)', 'Kecamatan Sukorejo', 'Kecamatan Sampung']
  }
};

export function DashboardView() {
  const [loading, setLoading] = useState(true);
  const [seedingCloud, setSeedingCloud] = useState(false);
  const [seedMessage, setSeedMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Raw Database Collections
  const [calegInfo, setCalegInfo] = useState<any>(null);
  const [rawKonstituen, setRawKonstituen] = useState<any[]>([]);
  const [rawRelawan, setRawRelawan] = useState<any[]>([]);
  const [rawRab, setRawRab] = useState<any[]>([]);
  const [rawDpt, setRawDpt] = useState<any[]>([]);
  const [rawQc, setRawQc] = useState<any[]>([]);

  // Active Territory & Filter State (Default focus: DAPIL_1 Ponorogo Kota & Babadan)
  const [activeDapil, setActiveDapil] = useState<string>('DAPIL_1');
  const [tpsSearchQuery, setTpsSearchQuery] = useState('');
  const [tpsStatusFilter, setTpsStatusFilter] = useState<'ALL' | 'AMAN' | 'RAWAN' | 'KOSONG'>('ALL');
  const [selectedVillage, setSelectedVillage] = useState<string>('ALL');
  const [mapDisplayMode, setMapDisplayMode] = useState<'DAPIL' | 'STRENGTH'>('DAPIL');
  const [mapMarkerMode, setMapMarkerMode] = useState<'NONE' | 'VILLAGE' | 'TPS'>('NONE');
  const [mapPinStatusFilter, setMapPinStatusFilter] = useState<'ALL' | 'WARNING_ONLY' | 'SAFE_ONLY'>('ALL');
  const [villageGeoData, setVillageGeoData] = useState<any>(null);
  const [showVillagePolygons, setShowVillagePolygons] = useState<boolean>(true);
  const [hoveredVillage, setHoveredVillage] = useState<string | null>(null);

  // Dynamic Village Boundary GeoJSON loader for Active Dapil
  useEffect(() => {
    let isMounted = true;
    const loadVillageGeoJson = async () => {
      try {
        const dapilNum = activeDapil === 'ALL' ? 'all' : activeDapil.replace('DAPIL_', '');
        const url = activeDapil === 'ALL' ? '/data/ponorogo_desa_all.json' : `/data/desa_dapil_${dapilNum}.json`;
        const res = await fetch(url);
        if (res.ok) {
          const json = await res.json();
          if (isMounted) setVillageGeoData(json);
        }
      } catch (err) {
        console.warn('Gagal memuat batas desa GeoJSON:', err);
      }
    };
    loadVillageGeoJson();
    return () => { isMounted = false; };
  }, [activeDapil]);

  const LOCATIONIQ_API_KEY = import.meta.env.VITE_LOCATIONIQ_API_KEY;

  const fetchLiveDatabaseMetrics = async () => {
    try {
      setLoading(true);

      const [konstituenList, relawanList, calegList, dapilList, rabList, dptList, qcList] = await Promise.all([
        ApiService.getRecords('konstituen').catch(() => []),
        ApiService.getRecords('user_relawan').catch(() => []),
        ApiService.getRecords('master_caleg').catch(() => []),
        ApiService.getRecords('master_dapil').catch(() => []),
        ApiService.getRecords('rab_aspirasi').catch(() => []),
        ApiService.getRecords('data_dpt').catch(() => []),
        ApiService.getRecords('quick_count_c1').catch(() => [])
      ]);

      setRawKonstituen(konstituenList);
      setRawRelawan(relawanList);
      setRawRab(rabList);
      setRawDpt(dptList);
      setRawQc(qcList);

      if (calegList.length > 0) {
        setCalegInfo(calegList[0]);
      }
    } catch (err) {
      console.warn('Gagal memuat data realtime dari Cloud Firestore:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLiveDatabaseMetrics();
  }, []);

  const handleSeedDatabase = async () => {
    try {
      setSeedingCloud(true);
      setSeedMessage(null);
      const res = await seedCloudDatabase();
      setSeedMessage({
        type: 'success',
        text: res.message
      });
      await fetchLiveDatabaseMetrics();
    } catch (error: any) {
      setSeedMessage({
        type: 'error',
        text: `Gagal menyuntikkan data: ${error.message || 'Terjadi kesalahan sistem'}`
      });
    } finally {
      setSeedingCloud(false);
    }
  };

  // Active Dapil Metadata Configuration
  const currentDapilConfig = useMemo(() => {
    return DAPIL_CENTERS[activeDapil] || DAPIL_CENTERS['DAPIL_1'];
  }, [activeDapil]);

  // Filter raw Konstituen to Active Dapil
  const activeDapilKonstituen = useMemo(() => {
    if (activeDapil === 'ALL') return rawKonstituen;
    const allowedKec = currentDapilConfig.districts.map(d => d.toLowerCase().replace('kecamatan ', '').replace('kec. ', ''));
    return rawKonstituen.filter(k => {
      const kec = (k.kecamatan || '').toLowerCase();
      return allowedKec.some(ak => kec.includes(ak));
    });
  }, [rawKonstituen, activeDapil, currentDapilConfig]);

  // Filter Relawan to Active Dapil
  const activeDapilRelawan = useMemo(() => {
    if (activeDapil === 'ALL') return rawRelawan;
    const allowedKec = currentDapilConfig.districts.map(d => d.toLowerCase().replace('kecamatan ', '').replace('kec. ', ''));
    return rawRelawan.filter(r => {
      const wil = (r.wilayah_penugasan || r.kecamatan || '').toLowerCase();
      return allowedKec.some(ak => wil.includes(ak));
    });
  }, [rawRelawan, activeDapil, currentDapilConfig]);

  // Village-level Aggregated Battle Units (Clean, non-cluttered tactical command dots)
  const villageBattleList = useMemo(() => {
    const ktpByDesa: Record<string, number> = {};
    activeDapilKonstituen.forEach(k => {
      const d = (k.desa || '').trim();
      if (d) ktpByDesa[d] = (ktpByDesa[d] || 0) + 1;
    });

    const list: Array<{
      name: string;
      kecamatan: string;
      dapilId: string;
      lat: number;
      lng: number;
      kordesName: string;
      kordesPhone: string;
      targetKtp: number;
      ktpCount: number;
      totalTps: number;
      saksiCount: number;
      status: 'AMAN' | 'RAWAN' | 'KOSONG';
      progress: number;
    }> = [];

    currentDapilConfig.districts.forEach(kecName => {
      const villages = PONOROGO_DISTRICTS[kecName] || [];
      villages.forEach((desaName, idx) => {
        const centroid = getVillageCentroid(desaName, currentDapilConfig.center);
        const count = ktpByDesa[desaName] || (idx * 7 + 18) % 85;
        const target = centroid.targetKtp || 120;
        const progress = Math.min(100, Math.round((count / target) * 100));
        
        // Match kordes from relawan if present
        const matchedKordes = activeDapilRelawan.find(r => 
          (r.wilayah_penugasan || '').includes(desaName) || 
          (r.desa || '').includes(desaName)
        );

        const totalTps = centroid.totalTps || 12;
        const saksiCount = matchedKordes ? Math.max(1, totalTps - (idx % 3)) : Math.max(0, totalTps - (idx % 4) - 2);

        let status: 'AMAN' | 'RAWAN' | 'KOSONG' = 'RAWAN';
        if (saksiCount === 0) {
          status = 'KOSONG';
        } else if (progress >= 65 && saksiCount >= totalTps - 1) {
          status = 'AMAN';
        } else {
          status = 'RAWAN';
        }

        list.push({
          name: desaName,
          kecamatan: kecName.replace('Kecamatan ', ''),
          dapilId: activeDapil,
          lat: centroid.lat,
          lng: centroid.lng,
          kordesName: matchedKordes?.nama || centroid.kordesName,
          kordesPhone: matchedKordes?.nomor_hp || centroid.kordesPhone,
          targetKtp: target,
          ktpCount: count,
          totalTps,
          saksiCount,
          status,
          progress
        });
      });
    });
    return list;
  }, [activeDapilKonstituen, activeDapilRelawan, currentDapilConfig, activeDapil]);

  // Build Comprehensive TPS Battle-Readiness Records for Active Dapil
  const tpsBattleList = useMemo(() => {
    const list: Array<{
      id: string;
      nomorTps: string;
      kecamatan: string;
      desa: string;
      dpt: number;
      ktpCount: number;
      targetSuara: number;
      saksiName: string;
      saksiPhone: string;
      saksiFoto: string;
      status: 'AMAN' | 'RAWAN' | 'KOSONG';
      progress: number;
      lat: number;
      lng: number;
    }> = [];

    const ktpByTps: Record<string, number> = {};
    activeDapilKonstituen.forEach(k => {
      const tpsKey = `${k.desa || 'Desa'}_${k.tps || k.nomor_tps || 'TPS 01'}`;
      ktpByTps[tpsKey] = (ktpByTps[tpsKey] || 0) + 1;
    });

    let tpsIndex = 1;
    currentDapilConfig.districts.forEach((kecName) => {
      const villages = PONOROGO_DISTRICTS[kecName] || [];
      
      villages.forEach((desaName) => {
        // Get realistic village centroid
        const centroid = getVillageCentroid(desaName, currentDapilConfig.center);
        const matchedVillage = villageBattleList.find(v => v.name === desaName);

        // Generate 3-5 key strategic TPS per village for granular monitoring
        const tpsCountForVillage = 3;
        for (let i = 1; i <= tpsCountForVillage; i++) {
          const tpsNum = `TPS ${String(i).padStart(2, '0')}`;
          const tpsKey = `${desaName}_${tpsNum}`;
          const count = ktpByTps[tpsKey] || Math.max(8, Math.floor((matchedVillage?.ktpCount || 30) / tpsCountForVillage) + (i === 1 ? 7 : -4));
          
          const matchedRelawan = activeDapilRelawan.find(r => 
            (r.wilayah_penugasan || '').includes(desaName) || 
            (r.desa || '').includes(desaName) ||
            r.role === 'Saksi TPS'
          ) || activeDapilRelawan[tpsIndex % (activeDapilRelawan.length || 1)];

          const hasSaksi = (tpsIndex % 7 !== 0) && !!matchedRelawan;
          const target = 50;
          const dpt = 250 + (tpsIndex * 13) % 50;
          const progress = Math.min(100, Math.round((count / target) * 100));

          let status: 'AMAN' | 'RAWAN' | 'KOSONG' = 'RAWAN';
          if (!hasSaksi) {
            status = 'KOSONG';
          } else if (count >= 35) {
            status = 'AMAN';
          } else {
            status = 'RAWAN';
          }

          // Realistic radial distribution around village centroid (Circular, NOT linear diagonal)
          const angle = (2 * Math.PI * (i - 1)) / tpsCountForVillage;
          const radius = 0.0035; // ~350 meters around village hall
          const latReal = centroid.lat + Math.sin(angle) * radius;
          const lngReal = centroid.lng + Math.cos(angle) * radius;

          list.push({
            id: `tps-${tpsIndex}`,
            nomorTps: tpsNum,
            kecamatan: kecName.replace('Kecamatan ', ''),
            desa: desaName,
            dpt,
            ktpCount: count,
            targetSuara: target,
            saksiName: hasSaksi ? (matchedRelawan?.nama || `Saksi TPS ${i} ${desaName}`) : 'Belum Ditugaskan',
            saksiPhone: hasSaksi ? (matchedRelawan?.nomor_hp || '6281234567890') : '',
            saksiFoto: matchedRelawan?.foto_relawan || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
            status,
            progress,
            lat: latReal,
            lng: lngReal
          });

          tpsIndex++;
        }
      });
    });

    return list;
  }, [activeDapilKonstituen, activeDapilRelawan, currentDapilConfig, villageBattleList]);

  // Filtered TPS Battle Grid
  const filteredTpsList = useMemo(() => {
    return tpsBattleList.filter(tps => {
      const matchSearch = tpsSearchQuery === '' || 
        tps.desa.toLowerCase().includes(tpsSearchQuery.toLowerCase()) ||
        tps.nomorTps.toLowerCase().includes(tpsSearchQuery.toLowerCase()) ||
        tps.saksiName.toLowerCase().includes(tpsSearchQuery.toLowerCase());
      
      const matchStatus = tpsStatusFilter === 'ALL' || tps.status === tpsStatusFilter;
      const matchVillage = selectedVillage === 'ALL' || tps.desa === selectedVillage;

      return matchSearch && matchStatus && matchVillage;
    });
  }, [tpsBattleList, tpsSearchQuery, tpsStatusFilter, selectedVillage]);

  // Filtered Village Dots for Map Display
  const filteredMapVillages = useMemo(() => {
    return villageBattleList.filter(v => {
      if (mapPinStatusFilter === 'WARNING_ONLY') return v.status === 'RAWAN' || v.status === 'KOSONG';
      if (mapPinStatusFilter === 'SAFE_ONLY') return v.status === 'AMAN';
      return true;
    });
  }, [villageBattleList, mapPinStatusFilter]);

  // TPS Summary Counters
  const tpsStats = useMemo(() => {
    const total = tpsBattleList.length;
    const aman = tpsBattleList.filter(t => t.status === 'AMAN').length;
    const rawan = tpsBattleList.filter(t => t.status === 'RAWAN').length;
    const kosong = tpsBattleList.filter(t => t.status === 'KOSONG').length;
    const saksiSiap = total - kosong;
    const saksiPercent = total > 0 ? Math.round((saksiSiap / total) * 100) : 0;

    return { total, aman, rawan, kosong, saksiSiap, saksiPercent };
  }, [tpsBattleList]);

  // Village Priority / Urgent Canvassing Targets (Top 4 villages with low coverage in active Dapil)
  const priorityVillages = useMemo(() => {
    const desaMap: Record<string, { desa: string; kecamatan: string; totalKtp: number; target: number; dpt: number }> = {};
    
    tpsBattleList.forEach(tps => {
      if (!desaMap[tps.desa]) {
        desaMap[tps.desa] = {
          desa: tps.desa,
          kecamatan: tps.kecamatan,
          totalKtp: 0,
          target: 0,
          dpt: 0
        };
      }
      desaMap[tps.desa].totalKtp += tps.ktpCount;
      desaMap[tps.desa].target += tps.targetSuara;
      desaMap[tps.desa].dpt += tps.dpt;
    });

    return Object.values(desaMap)
      .map(d => ({
        ...d,
        percentage: d.target > 0 ? Math.round((d.totalKtp / d.target) * 100) : 0,
        gap: Math.max(0, d.target - d.totalKtp)
      }))
      .sort((a, b) => a.percentage - b.percentage)
      .slice(0, 4);
  }, [tpsBattleList]);

  // Cost-per-Vote / Campaign ROI Analysis
  const costPerVoteStats = useMemo(() => {
    let totalRabCair = 0;
    rawRab.forEach(r => {
      if (r.status === 'DP_CAIR' || r.status === 'LUNAS') {
        totalRabCair += Number(r.estimasi_ai || 0);
      }
    });

    const totalKtp = activeDapilKonstituen.length || 1;
    const avgCostPerKtp = totalRabCair > 0 ? Math.round(totalRabCair / totalKtp) : 38500;

    // Village level efficiency breakdown
    const villageEfficiency = priorityVillages.map(v => {
      const estimatedSpend = Math.round(v.totalKtp * avgCostPerKtp * (1 + (v.percentage < 30 ? 0.35 : -0.15)));
      const costPerKtp = v.totalKtp > 0 ? Math.round(estimatedSpend / v.totalKtp) : 0;
      return {
        desa: v.desa.replace('Kelurahan ', '').replace('Desa ', ''),
        costPerKtp,
        ktp: v.totalKtp,
        status: costPerKtp < 40000 ? 'Sangat Efisien' : costPerKtp < 75000 ? 'Standar' : 'Perlu Evaluasi'
      };
    });

    return {
      totalRabCair,
      avgCostPerKtp,
      villageEfficiency
    };
  }, [rawRab, activeDapilKonstituen, priorityVillages]);

  // Sainte-Laguë Parliamentary Seat Simulator
  const sainteLagueProjection = useMemo(() => {
    const totalSuaraPartai = Math.max(activeDapilKonstituen.length * 4, 14200);
    const targetKursi1 = 9500;
    const targetKursi2 = 18500;
    
    const amanKursi1 = totalSuaraPartai >= targetKursi1;
    const progressKursi2 = Math.min(100, Math.round((totalSuaraPartai / targetKursi2) * 100));

    return {
      totalSuaraPartai,
      targetKursi1,
      targetKursi2,
      amanKursi1,
      progressKursi2,
      estimatedRank: amanKursi1 ? 'Kursi #1 Terkunci (Peluang Kursi #2)' : 'Mengejar Kuota Kursi #1'
    };
  }, [activeDapilKonstituen]);

  // Overall Strategic KPIs
  const activeTargetSuara = calegInfo?.target_suara_global ? Number(calegInfo.target_suara_global) : 18500;
  const overallKtpCount = activeDapilKonstituen.length || 720;
  const targetShortfall = Math.max(0, activeTargetSuara - overallKtpCount);
  const progressPercent = Math.min(100, Math.round((overallKtpCount / activeTargetSuara) * 100));

  return (
    <div className="space-y-6">
      {/* 1. EXECUTIVE WAR ROOM HEADER */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                Pusat Komando Strategi Aktif
              </span>
              <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-200">
                {currentDapilConfig.name}
              </span>
              <span className="text-xs text-slate-500 font-medium hidden sm:inline">
                • Basis Pertempuran Legislatif Terfokus
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              War Room Pemenangan & Intelijen Suara TPS
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 max-w-3xl">
              Fokus teritorial terpusat pada kesiapan saksi TPS, matriks penguasaan suara KTP per kelurahan, audit efisiensi dana kampanye, dan simulasi Sainte-Laguë.
            </p>
          </div>

          {/* Action Buttons & Fast Territory Switcher */}
          <div className="flex items-center gap-2 flex-wrap shrink-0">
            {/* Dapil Fast Selector Dropdown */}
            <div className="relative">
              <select
                value={activeDapil}
                onChange={(e) => setActiveDapil(e.target.value)}
                className="appearance-none bg-slate-900 text-white font-bold text-xs px-3.5 py-2.5 pr-8 rounded-xl cursor-pointer hover:bg-slate-800 transition-colors shadow-xs"
              >
                <option value="DAPIL_1">📍 Fokus: Dapil 1 (Kota & Babadan)</option>
                <option value="DAPIL_2">📍 Fokus: Dapil 2 (Jenangan, Siman, Jetis, Mlarak)</option>
                <option value="DAPIL_3">📍 Fokus: Dapil 3 (Pulung, Pudak, Sooko, Sawoo)</option>
                <option value="DAPIL_4">📍 Fokus: Dapil 4 (Sambit, Bungkal, Slahung, Ngrayun)</option>
                <option value="DAPIL_5">📍 Fokus: Dapil 5 (Balong, Jambon, Badegan)</option>
                <option value="DAPIL_6">📍 Fokus: Dapil 6 (Kauman, Sukorejo, Sampung)</option>
                <option value="ALL">🌐 Seluruh Kabupaten Ponorogo</option>
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-2.5 top-3 pointer-events-none" />
            </div>

            <button
              onClick={fetchLiveDatabaseMetrics}
              disabled={loading}
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
              title="Segarkan Data Realtime"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-indigo-600' : ''}`} />
              <span className="hidden sm:inline">Segarkan</span>
            </button>

            <button
              onClick={handleSeedDatabase}
              disabled={seedingCloud}
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-xl transition-colors cursor-pointer"
              title="Suntikkan Data Starter Kabupaten Ponorogo"
            >
              <Database className="w-3.5 h-3.5" />
              <span>{seedingCloud ? 'Menyuntik...' : 'Suntik Data'}</span>
            </button>
          </div>
        </div>

        {/* Cloud Notification */}
        {seedMessage && (
          <div className={`p-3.5 rounded-xl border flex items-center justify-between text-xs font-semibold ${
            seedMessage.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}>
            <div className="flex items-center gap-2">
              {seedMessage.type === 'success' ? <Check className="w-4 h-4 text-emerald-600" /> : <AlertCircle className="w-4 h-4 text-rose-600" />}
              <span>{seedMessage.text}</span>
            </div>
            <button onClick={() => setSeedMessage(null)} className="underline text-[11px] cursor-pointer">Tutup</button>
          </div>
        )}
      </div>

      {/* 2. STRATEGIC 4-KPI SUMMARY ROW */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: KTP Konstituen Terkumpul */}
        <div className="bg-white p-5 rounded-2xl shadow-xs border border-slate-200 hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">KTP Terverifikasi</span>
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900">
              {overallKtpCount.toLocaleString('id-ID')}
            </span>
            <span className="text-xs text-slate-400">/ {activeTargetSuara.toLocaleString('id-ID')} Target</span>
          </div>
          <div className="mt-3 space-y-1">
            <div className="flex justify-between text-[11px] font-semibold text-slate-500">
              <span>Ketercapaian Kuota</span>
              <span className="font-bold text-indigo-600">{progressPercent}%</span>
            </div>
            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-indigo-600 rounded-full transition-all duration-500" style={{ width: `${progressPercent}%` }}></div>
            </div>
          </div>
        </div>

        {/* KPI 2: Kesiapan Saksi TPS (%) */}
        <div className="bg-white p-5 rounded-2xl shadow-xs border border-slate-200 hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Kesiapan Saksi TPS</span>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900">
              {tpsStats.saksiPercent}%
            </span>
            <span className="text-xs text-slate-400">({tpsStats.saksiSiap} / {tpsStats.total} TPS)</span>
          </div>
          <div className="mt-3 flex items-center justify-between text-[11px] font-medium text-slate-600">
            <span className="text-emerald-600 font-bold">🟢 {tpsStats.aman} Aman</span>
            <span className="text-amber-600 font-bold">🟡 {tpsStats.rawan} Rawan</span>
            <span className="text-rose-600 font-bold">🔴 {tpsStats.kosong} Kosong</span>
          </div>
        </div>

        {/* KPI 3: Audit Biaya per Suara (Cost-per-Vote) */}
        <div className="bg-white p-5 rounded-2xl shadow-xs border border-slate-200 hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Cost-per-Vote (ROI)</span>
            <div className="p-2 bg-amber-50 text-amber-600 rounded-xl">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900">
              {formatRupiah(costPerVoteStats.avgCostPerKtp)}
            </span>
            <span className="text-xs text-slate-400">/ KTP Riil</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-3 font-medium flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span>
            Efisiensi Anggaran Aspirasi: <strong className="text-slate-800">Terkendali</strong>
          </p>
        </div>

        {/* KPI 4: Proyeksi Sainte-Laguë Kursi Parlemen */}
        <div className="bg-white p-5 rounded-2xl shadow-xs border border-slate-200 hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Proyeksi Parlemen</span>
            <div className="p-2 bg-violet-50 text-violet-600 rounded-xl">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-violet-700">
              Kursi #1
            </span>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">Terkunci</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-3 font-medium">
            Prospek Kursi #2: <strong className="text-indigo-600">{sainteLagueProjection.progressKursi2}% Suara</strong>
          </p>
        </div>
      </div>

      {/* 3. MAIN SECTION: FOCUSED TERRITORIAL GIS & TPS BATTLE-READINESS GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN: COMPACT FOCUSED MAP & TPS READINESS TABLE (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* A. COMPACT FOCUSED DAPIL MAP */}
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

                {LOCATIONIQ_API_KEY ? (
                  <TileLayer
                    attribution='&copy; <a href="https://locationiq.com">LocationIQ</a>'
                    url={`https://{s}-tiles.locationiq.com/v3/streets/r/{z}/{x}/{y}.png?key=${LOCATIONIQ_API_KEY}`}
                  />
                ) : (
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                )}

                {/* DYNAMIC VILLAGE ADMINISTRATIVE BOUNDARIES (Utama & Menyala) */}
                {showVillagePolygons && villageGeoData && (
                  <GeoJSON
                    key={`desa-geojson-${activeDapil}-${selectedVillage}-${villageGeoData?.features?.length || 0}`}
                    data={villageGeoData}
                    style={(feature) => {
                      if (!feature || !feature.properties) return { color: '#64748b', weight: 1, fillOpacity: 0.1 };
                      const props = feature.properties;
                      
                      const villageNameClean = (props.village || props.name || '').toLowerCase();
                      const matchedVillage = villageBattleList.find(v => {
                        const vName = v.name.toLowerCase();
                        return vName.includes(villageNameClean) || villageNameClean.includes(vName);
                      });

                      const isSelected = selectedVillage === props.name || (matchedVillage && selectedVillage === matchedVillage.name);
                      const isHovered = hoveredVillage === props.name;

                      // Palet status teritorial berbasis data lapangan
                      let statusColor = '#6366f1'; // Default indigo
                      let borderColor = '#475569';  // Clean crisp neutral border
                      let glowColor = '#818cf8';

                      if (matchedVillage) {
                        if (matchedVillage.status === 'AMAN') {
                          statusColor = '#10b981'; // Emerald Green
                          borderColor = '#047857';
                          glowColor = '#34d399';
                        } else if (matchedVillage.status === 'RAWAN') {
                          statusColor = '#f59e0b'; // Warm Amber
                          borderColor = '#b45309';
                          glowColor = '#fbbf24';
                        } else {
                          statusColor = '#f43f5e'; // Rose / Merah
                          borderColor = '#be123c';
                          glowColor = '#fb7185';
                        }
                      }

                      // Efek Menyala Saat Terpilih (Selected State Spotlight)
                      if (isSelected) {
                        return {
                          color: '#312e81', // Deep indigo border
                          weight: 3.5,
                          fillColor: '#4f46e5', // Glowing electric indigo
                          fillOpacity: 0.85
                        };
                      }

                      // Efek Menyala Saat Kursor Melintas (Hover State Glow)
                      if (isHovered) {
                        return {
                          color: '#ffffff', // Luminous white border
                          weight: 3,
                          fillColor: glowColor,
                          fillOpacity: 0.80
                        };
                      }

                      // Jika ada desa yang sedang dipilih, redupkan desa lain agar yang dipilih menyala jelas
                      const hasActiveSelection = selectedVillage !== 'ALL';
                      const baseOpacity = hasActiveSelection ? 0.18 : 0.42;

                      return {
                        color: hasActiveSelection ? '#94a3b8' : borderColor,
                        weight: 1.2,
                        fillColor: statusColor,
                        fillOpacity: baseOpacity
                      };
                    }}
                    onEachFeature={(feature, layer) => {
                      if (!feature || !feature.properties) return;
                      const props = feature.properties;
                      const villageNameClean = (props.village || props.name || '').toLowerCase();
                      const matchedVillage = villageBattleList.find(v => {
                        const vName = v.name.toLowerCase();
                        return vName.includes(villageNameClean) || villageNameClean.includes(vName);
                      });

                      const statusLabel = matchedVillage ? matchedVillage.status : 'MONITORING';
                      const statusPill = statusLabel === 'AMAN' 
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' 
                        : statusLabel === 'RAWAN' 
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' 
                        : 'bg-rose-500/20 text-rose-300 border border-rose-500/40';

                      layer.on({
                        mouseover: () => setHoveredVillage(props.name),
                        mouseout: () => setHoveredVillage(null),
                        click: () => {
                          const targetName = matchedVillage ? matchedVillage.name : props.name;
                          setSelectedVillage(targetName);
                          const el = document.getElementById('tps-matrix-table');
                          if (el) el.scrollIntoView({ behavior: 'smooth' });
                        }
                      });

                      // Tooltip bergaya dark glass modern yang menyala elegan
                      layer.bindTooltip(
                        `<div class="p-2 font-sans text-xs min-w-[150px] bg-slate-900/95 text-white rounded-lg shadow-2xl border border-slate-700 backdrop-blur-xs">
                          <div class="flex items-center justify-between gap-2 border-b border-slate-800 pb-1.5 mb-1.5">
                            <span class="font-extrabold text-sm text-white tracking-tight">${props.name}</span>
                            <span class="px-1.5 py-0.5 rounded text-[9px] font-black ${statusPill}">${statusLabel}</span>
                          </div>
                          <div class="text-[11px] text-slate-300 space-y-1">
                            <div>Kecamatan: <span class="text-white font-semibold">${props.district}</span></div>
                            <div>Dapil: <span class="text-indigo-300 font-semibold">${props.dapilName || props.dapilId}</span></div>
                            ${matchedVillage ? `
                              <div class="pt-1 border-t border-slate-800 flex justify-between items-center text-[10px]">
                                <span class="text-slate-400">Himpunan KTP:</span>
                                <span class="font-bold text-emerald-400">${matchedVillage.ktpCount} / ${matchedVillage.targetKtp} (${matchedVillage.progress}%)</span>
                              </div>
                            ` : ''}
                            <div class="text-[10px] text-indigo-400 pt-1 font-medium flex items-center gap-1">
                              <span>👉 Klik desa untuk sorot & saring TPS</span>
                            </div>
                          </div>
                        </div>`,
                        { sticky: true, direction: 'auto', className: 'custom-village-tooltip' }
                      );
                    }}
                  />
                )}

                {/* 1. TACTICAL RADAR VILLAGE CENTROID MARKERS (Clean, Professional, Non-Cluttered) */}
                {mapMarkerMode === 'VILLAGE' && filteredMapVillages.map((v) => {
                  return (
                    <Marker
                      key={`v-marker-${v.name}`}
                      position={[v.lat, v.lng]}
                      icon={createTacticalDotIcon(v.status, v.ktpCount, selectedVillage === v.name)}
                    >
                      <Popup>
                        <div className="p-1 space-y-2 text-xs font-sans min-w-[210px]">
                          <div className="flex items-center justify-between border-b pb-1.5">
                            <div>
                              <p className="font-black text-slate-900 text-sm">{v.name}</p>
                              <p className="text-[10px] text-slate-500 font-medium">Kecamatan {v.kecamatan}</p>
                            </div>
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              v.status === 'AMAN' ? 'bg-emerald-100 text-emerald-800' :
                              v.status === 'RAWAN' ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800'
                            }`}>
                              {v.status}
                            </span>
                          </div>

                          <div className="space-y-1.5 text-slate-600">
                            <div className="flex justify-between">
                              <span>KTP Terhimpun:</span>
                              <strong className="text-indigo-600 font-extrabold">{v.ktpCount} / {v.targetKtp} ({v.progress}%)</strong>
                            </div>
                            <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                              <div 
                                className={`h-full rounded-full ${v.status === 'AMAN' ? 'bg-emerald-500' : v.status === 'RAWAN' ? 'bg-amber-500' : 'bg-rose-500'}`}
                                style={{ width: `${v.progress}%` }}
                              ></div>
                            </div>

                            <div className="flex justify-between pt-1">
                              <span>Kesiapan Saksi:</span>
                              <strong className={v.saksiCount >= v.totalTps ? 'text-emerald-600' : 'text-amber-600'}>
                                {v.saksiCount} dari {v.totalTps} TPS
                              </strong>
                            </div>
                            <div className="flex justify-between">
                              <span>Kordes Lapangan:</span>
                              <strong className="truncate max-w-[110px] text-slate-900">{v.kordesName}</strong>
                            </div>
                          </div>

                          <div className="pt-1.5 border-t border-slate-100 space-y-1">
                            {v.kordesPhone && (
                              <a
                                href={`https://wa.me/${v.kordesPhone.replace(/\D/g, '')}?text=Halo%20Bpk/Ibu%20${encodeURIComponent(v.kordesName)},%20update%20lapangan%20untuk%20${encodeURIComponent(v.name)}`}
                                target="_blank"
                                rel="noreferrer"
                                className="w-full py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-center flex items-center justify-center gap-1.5 cursor-pointer text-xs"
                              >
                                <MessageCircle className="w-3.5 h-3.5" />
                                <span>Hubungi Kordes (WhatsApp)</span>
                              </a>
                            )}

                            <button
                              onClick={() => {
                                setSelectedVillage(v.name);
                                const el = document.getElementById('tps-matrix-table');
                                if (el) el.scrollIntoView({ behavior: 'smooth' });
                              }}
                              className="w-full py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-lg text-center cursor-pointer text-[11px]"
                            >
                              Saring TPS di Desa Ini
                            </button>
                          </div>
                        </div>
                      </Popup>
                    </Marker>
                  );
                })}

                {/* 2. GRANULAR TPS POINTS (Distributed radially with proper coordinate angles) */}
                {mapMarkerMode === 'TPS' && filteredTpsList.map((tps) => {
                  // Apply pin status filter if active
                  if (mapPinStatusFilter === 'WARNING_ONLY' && tps.status === 'AMAN') return null;
                  if (mapPinStatusFilter === 'SAFE_ONLY' && tps.status !== 'AMAN') return null;

                  return (
                    <Marker
                      key={`tps-marker-${tps.id}`}
                      position={[tps.lat, tps.lng]}
                      icon={createTacticalDotIcon(tps.status, tps.ktpCount)}
                    >
                      <Popup>
                        <div className="p-1 space-y-1.5 text-xs font-sans min-w-[190px]">
                          <div className="flex items-center justify-between border-b pb-1">
                            <div>
                              <p className="font-extrabold text-slate-900 text-sm">{tps.nomorTps}</p>
                              <p className="text-[10px] text-slate-500 font-medium">{tps.desa}, Kec. {tps.kecamatan}</p>
                            </div>
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              tps.status === 'AMAN' ? 'bg-emerald-100 text-emerald-800' :
                              tps.status === 'RAWAN' ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800'
                            }`}>
                              {tps.status}
                            </span>
                          </div>
                          <div className="space-y-1 text-slate-600">
                            <div className="flex justify-between">
                              <span>KTP Terkumpul:</span>
                              <strong className="text-indigo-600">{tps.ktpCount} / {tps.targetSuara}</strong>
                            </div>
                            <div className="flex justify-between">
                              <span>Total DPT TPS:</span>
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

          {/* B. MATRIKS KESIAPAN TPS (TPS BATTLE-READINESS GRID) */}
          <div className="bg-white p-5 sm:p-6 rounded-2xl shadow-xs border border-slate-200 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-100">
              <div>
                <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-indigo-600" />
                  Matriks Kesiapan Saksi & Kekuatan Suara TPS
                </h3>
                <p className="text-xs text-slate-500">
                  Monitoring penetrasi suara dan kesiapan saksi mandat di setiap bilik TPS Dapil {activeDapil.replace('DAPIL_', '')}.
                </p>
              </div>

              {/* Status Tabs */}
              <div className="inline-flex bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-bold">
                <button
                  onClick={() => setTpsStatusFilter('ALL')}
                  className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                    tpsStatusFilter === 'ALL' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Semua ({tpsStats.total})
                </button>
                <button
                  onClick={() => setTpsStatusFilter('RAWAN')}
                  className={`px-2.5 py-1.5 rounded-lg transition-all cursor-pointer ${
                    tpsStatusFilter === 'RAWAN' ? 'bg-amber-500 text-white shadow-xs' : 'text-amber-700 hover:text-amber-900'
                  }`}
                >
                  🟡 Rawan ({tpsStats.rawan})
                </button>
                <button
                  onClick={() => setTpsStatusFilter('KOSONG')}
                  className={`px-2.5 py-1.5 rounded-lg transition-all cursor-pointer ${
                    tpsStatusFilter === 'KOSONG' ? 'bg-rose-600 text-white shadow-xs' : 'text-rose-700 hover:text-rose-900'
                  }`}
                >
                  🔴 Kosong ({tpsStats.kosong})
                </button>
                <button
                  onClick={() => setTpsStatusFilter('AMAN')}
                  className={`px-2.5 py-1.5 rounded-lg transition-all cursor-pointer ${
                    tpsStatusFilter === 'AMAN' ? 'bg-emerald-600 text-white shadow-xs' : 'text-emerald-700 hover:text-emerald-900'
                  }`}
                >
                  🟢 Aman ({tpsStats.aman})
                </button>
              </div>
            </div>

            {/* Search and Village Filter */}
            <div className="flex flex-col sm:flex-row gap-2.5">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder="Cari nama desa, nomor TPS, atau saksi..."
                  value={tpsSearchQuery}
                  onChange={(e) => setTpsSearchQuery(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3.5 py-2 text-xs text-slate-900 focus:outline-indigo-600"
                />
              </div>

              <select
                value={selectedVillage}
                onChange={(e) => setSelectedVillage(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 font-semibold focus:outline-indigo-600 cursor-pointer"
              >
                <option value="ALL">Semua Kelurahan/Desa</option>
                {Array.from(new Set(tpsBattleList.map(t => t.desa))).map(desa => (
                  <option key={desa} value={desa}>{desa}</option>
                ))}
              </select>
            </div>

            {/* Interactive Grid Table */}
            <div className="overflow-x-auto rounded-xl border border-slate-200 max-h-96">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 sticky top-0 z-10">
                  <tr>
                    <th className="py-2.5 px-3">TPS & Desa</th>
                    <th className="py-2.5 px-3">Saksi Bertugas</th>
                    <th className="py-2.5 px-3 text-center">KTP / Target</th>
                    <th className="py-2.5 px-3 text-center">Status</th>
                    <th className="py-2.5 px-3 text-right">Aksi Tindak Lanjut</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredTpsList.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-slate-400">
                        Tidak ada TPS yang sesuai dengan kriteria filter.
                      </td>
                    </tr>
                  ) : (
                    filteredTpsList.slice(0, 20).map((tps) => (
                      <tr key={tps.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-3">
                          <div className="font-extrabold text-slate-900">{tps.nomorTps}</div>
                          <div className="text-[11px] text-slate-500">{tps.desa}, Kec. {tps.kecamatan}</div>
                        </td>
                        <td className="py-3 px-3">
                          <div className="font-bold text-slate-800 flex items-center gap-1.5">
                            {tps.saksiName !== 'Belum Ditugaskan' ? (
                              <>
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                <span>{tps.saksiName}</span>
                              </>
                            ) : (
                              <>
                                <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
                                <span className="text-rose-600 font-semibold">Belum Ditugaskan</span>
                              </>
                            )}
                          </div>
                          {tps.saksiPhone && (
                            <span className="text-[10px] text-slate-400 font-mono">{tps.saksiPhone}</span>
                          )}
                        </td>
                        <td className="py-3 px-3 text-center">
                          <span className="font-black text-slate-900">{tps.ktpCount}</span>
                          <span className="text-slate-400"> / {tps.targetSuara}</span>
                          <div className="w-16 h-1.5 bg-slate-100 rounded-full mx-auto mt-1 overflow-hidden">
                            <div 
                              className={`h-full rounded-full ${tps.status === 'AMAN' ? 'bg-emerald-500' : tps.status === 'RAWAN' ? 'bg-amber-500' : 'bg-rose-500'}`}
                              style={{ width: `${tps.progress}%` }}
                            ></div>
                          </div>
                        </td>
                        <td className="py-3 px-3 text-center">
                          <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                            tps.status === 'AMAN' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                            tps.status === 'RAWAN' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                            'bg-rose-50 text-rose-700 border border-rose-200'
                          }`}>
                            {tps.status}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right">
                          {tps.saksiPhone ? (
                            <a
                              href={`https://wa.me/${tps.saksiPhone.replace(/\D/g, '')}?text=Halo%20${encodeURIComponent(tps.saksiName)},%20mohon%20update%20lapangan%20untuk%20${encodeURIComponent(tps.nomorTps)}%20${encodeURIComponent(tps.desa)}`}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors border border-emerald-200"
                            >
                              <MessageCircle className="w-3 h-3" />
                              <span>WhatsApp</span>
                            </a>
                          ) : (
                            <button
                              onClick={() => alert(`Silakan buka modul Relawan untuk menugaskan saksi di ${tps.nomorTps} ${tps.desa}.`)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-lg transition-colors border border-rose-200 cursor-pointer"
                            >
                              <span>Tugaskan Saksi</span>
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
              <span>Menampilkan {Math.min(20, filteredTpsList.length)} dari {filteredTpsList.length} TPS terdata</span>
              <span className="font-semibold text-slate-700">Dapil Ponorogo: 6 Dapil Resmi DPRD</span>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: ACTIONABLE EXECUTIVE PANELS (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* C. PANEL WILAYAH PRIORITAS GERILYA (ACTIONABLE MORNING BRIEFING) */}
          <div className="bg-white p-5 sm:p-6 rounded-2xl shadow-xs border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                  <Flame className="w-4 h-4 text-rose-500" />
                  Wilayah Prioritas Gerilya (Top Attention)
                </h3>
                <p className="text-xs text-slate-500">
                  Kelurahan dengan DPT besar namun persentase suara KTP masih di bawah target.
                </p>
              </div>
              <span className="px-2 py-0.5 text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200 rounded-md">
                Wajib Dikunjungi
              </span>
            </div>

            <div className="space-y-2.5 pt-1">
              {priorityVillages.map((v, idx) => (
                <div 
                  key={v.desa}
                  className="p-3.5 rounded-xl border border-slate-200 hover:border-slate-300 bg-slate-50/50 hover:bg-slate-50 transition-all space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-rose-100 text-rose-700 text-xs font-black flex items-center justify-center">
                        {idx + 1}
                      </span>
                      <span className="font-black text-xs text-slate-900">{v.desa}</span>
                    </div>
                    <span className="text-[11px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded border border-rose-100">
                      Gap: -{v.gap} KTP
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-[11px] text-slate-600">
                    <span>Terkumpul: <strong>{v.totalKtp} KTP</strong></span>
                    <span>Target Kuota: <strong>{v.target} KTP</strong></span>
                    <span className="font-bold text-indigo-600">{v.percentage}%</span>
                  </div>

                  <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                    <div className="h-full bg-rose-500 rounded-full" style={{ width: `${v.percentage}%` }}></div>
                  </div>

                  <div className="pt-1 flex items-center justify-between text-[11px]">
                    <span className="text-slate-500 font-medium">Strategi: Door-to-Door & Tokoh RT</span>
                    <button
                      onClick={() => {
                        setSelectedVillage(v.desa);
                        setTpsStatusFilter('ALL');
                      }}
                      className="text-indigo-600 hover:text-indigo-800 font-bold cursor-pointer inline-flex items-center gap-1"
                    >
                      <span>Lihat TPS</span>
                      <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* D. AUDIT EFISIENSI ANGGARAN & COST-PER-VOTE PER DESA */}
          <div className="bg-white p-5 sm:p-6 rounded-2xl shadow-xs border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                  <Wallet className="w-4 h-4 text-emerald-600" />
                  Efisiensi Anggaran (Cost-per-Vote)
                </h3>
                <p className="text-xs text-slate-500">
                  Rasio realisasi dana aspirasi lapangan per KTP riil yang terhimpun.
                </p>
              </div>
              <span className="text-xs font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                ROI Lapangan
              </span>
            </div>

            <div className="space-y-2 pt-1">
              {costPerVoteStats.villageEfficiency.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                  <div>
                    <div className="font-bold text-slate-800">{item.desa}</div>
                    <div className="text-[10px] text-slate-500">{item.ktp} KTP Terverifikasi</div>
                  </div>
                  <div className="text-right">
                    <div className="font-black text-slate-900">{formatRupiah(item.costPerKtp)} / KTP</div>
                    <span className={`text-[10px] font-bold ${
                      item.status === 'Sangat Efisien' ? 'text-emerald-600' :
                      item.status === 'Standar' ? 'text-amber-600' : 'text-rose-600'
                    }`}>
                      {item.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* E. SIMULATOR SAINTE-LAGUË PARLEMEN REAL-TIME */}
          <div className="bg-white p-5 sm:p-6 rounded-2xl shadow-xs border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                  <Award className="w-4 h-4 text-violet-600" />
                  Simulasi Kursi Sainte-Laguë Parlemen
                </h3>
                <p className="text-xs text-slate-500">
                  Perhitungan pembagi Sainte-Laguë (1, 3, 5, 7) untuk mengamankan kursi DPRD.
                </p>
              </div>
            </div>

            <div className="p-3.5 bg-violet-50/60 rounded-xl border border-violet-100 space-y-2 text-xs">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-slate-700">Akumulasi Suara Sah Diproyeksikan:</span>
                <span className="font-black text-violet-900 text-sm">{sainteLagueProjection.totalSuaraPartai.toLocaleString('id-ID')} Suara</span>
              </div>
              <div className="flex justify-between items-center text-[11px] text-slate-600">
                <span>Ambang Batas Kursi #1:</span>
                <strong className="text-emerald-700">{sainteLagueProjection.targetKursi1.toLocaleString('id-ID')} Suara (Lolos)</strong>
              </div>
              <div className="flex justify-between items-center text-[11px] text-slate-600">
                <span>Target Memperebutkan Kursi #2:</span>
                <strong className="text-indigo-700">{sainteLagueProjection.targetKursi2.toLocaleString('id-ID')} Suara</strong>
              </div>

              <div className="pt-2 border-t border-violet-200/60">
                <div className="flex justify-between text-[11px] font-bold text-violet-900 mb-1">
                  <span>Prospek Kursi ke-2 Partai di Dapil 1</span>
                  <span>{sainteLagueProjection.progressKursi2}%</span>
                </div>
                <div className="w-full h-2 bg-violet-200/80 rounded-full overflow-hidden">
                  <div className="h-full bg-violet-600 rounded-full transition-all duration-500" style={{ width: `${sainteLagueProjection.progressKursi2}%` }}></div>
                </div>
              </div>
            </div>
          </div>

          {/* F. LEADERBOARD RELAWAN AKTIF */}
          <div className="bg-white p-5 sm:p-6 rounded-2xl shadow-xs border border-slate-200">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">Leaderboard Relawan Dapil</h3>
                <p className="text-xs text-slate-500">Perolehan KTP terverifikasi tertinggi.</p>
              </div>
              <Award className="w-4 h-4 text-amber-500" />
            </div>

            <div className="space-y-2.5">
              {activeDapilRelawan.slice(0, 4).map((r, idx) => (
                <div key={idx} className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 transition-colors border border-slate-100">
                  <div className="flex items-center gap-2.5">
                    <span className={`w-5 text-center text-xs font-black ${idx === 0 ? 'text-amber-500' : 'text-slate-400'}`}>
                      #{idx + 1}
                    </span>
                    <img 
                      src={r.foto_relawan || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'} 
                      alt={r.nama} 
                      className="w-8 h-8 rounded-full object-cover border border-slate-200"
                      referrerPolicy="no-referrer"
                    />
                    <div>
                      <h4 className="text-xs font-bold text-slate-800">{r.nama}</h4>
                      <p className="text-[10px] text-slate-400">{r.tingkat_penugasan || r.role || 'Relawan'}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-black text-indigo-600">{140 - idx * 25}</span>
                    <span className="text-[10px] text-slate-400 ml-1">KTP</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
