import React, { useState, useEffect, useMemo } from 'react';
import { ApiService } from '../services/api';
import { seedCloudDatabase } from '../services/dbSeeder';
import { PONOROGO_DISTRICTS } from '../data/ponorogoRegions';

// Subcomponents decoupled for clean modular architecture
import { DashboardHeader } from './dashboard/DashboardHeader';
import { DashboardKpiCards } from './dashboard/DashboardKpiCards';
import { DashboardTerritorialMap } from './dashboard/DashboardTerritorialMap';
import { DashboardTpsGrid } from './dashboard/DashboardTpsGrid';
import { DashboardPrioritySection } from './dashboard/DashboardPrioritySection';
import { DashboardBudgetAudit } from './dashboard/DashboardBudgetAudit';
import { DashboardSainteLagueSection } from './dashboard/DashboardSainteLagueSection';
import { DashboardRealCountSection } from './dashboard/DashboardRealCountSection';
import { DashboardExecutiveBar } from './dashboard/DashboardExecutiveBar';
import { SaksiFieldPortalModal } from './dashboard/SaksiFieldPortalModal';
import { QuickVoterAddModal } from './dashboard/QuickVoterAddModal';
import { DemoGuideCard } from '../components/DemoGuideCard';
import { useDashboardMetrics } from './dashboard/useDashboardMetrics';
import { 
  Flame, 
  Map, 
  ShieldCheck, 
  FileCheck2, 
  LayoutGrid, 
  Smartphone, 
  UserPlus 
} from 'lucide-react';

// Center coordinates per Dapil in Kabupaten Ponorogo
export const DAPIL_CENTERS: Record<string, { center: [number, number]; zoom: number; name: string; districts: string[] }> = {
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

interface DashboardViewProps {
  onNavigateModule?: (moduleId: string, contextQuery?: string) => void;
  userRole?: string;
  onSwitchRole?: (newRole: string) => void;
  activeSegmentProp?: 'IKHTISAR' | 'PETA_TERITORI' | 'TPS_PASUKAN' | 'C1_REALCOUNT' | 'SEMUA';
  onSegmentChangeProp?: (segment: 'IKHTISAR' | 'PETA_TERITORI' | 'TPS_PASUKAN' | 'C1_REALCOUNT' | 'SEMUA') => void;
}

export function DashboardView({ 
  onNavigateModule, 
  userRole = 'demo', 
  onSwitchRole,
  activeSegmentProp,
  onSegmentChangeProp
}: DashboardViewProps = {}) {
  const [loading, setLoading] = useState(true);
  const [seedingCloud, setSeedingCloud] = useState(false);
  const [seedMessage, setSeedMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Raw Database Collections (All 16 Schema Modules Connected)
  const [calegInfo, setCalegInfo] = useState<any>(null);
  const [rawKonstituen, setRawKonstituen] = useState<any[]>([]);
  const [rawRelawan, setRawRelawan] = useState<any[]>([]);
  const [rawRab, setRawRab] = useState<any[]>([]);
  const [rawDpt, setRawDpt] = useState<any[]>([]);
  const [rawQc, setRawQc] = useState<any[]>([]);
  const [rawTargetWilayah, setRawTargetWilayah] = useState<any[]>([]);
  const [rawStandarHarga, setRawStandarHarga] = useState<any[]>([]);
  const [rawAnggaran, setRawAnggaran] = useState<any[]>([]);
  const [rawLpj, setRawLpj] = useState<any[]>([]);
  const [rawSainteLague, setRawSainteLague] = useState<any[]>([]);
  const [rawTenantApproval, setRawTenantApproval] = useState<any[]>([]);
  const [rawManajemenTenant, setRawManajemenTenant] = useState<any[]>([]);
  const [rawSystemSettings, setRawSystemSettings] = useState<any | null>(null);

  // Active Territory & Filter State
  const [activeDapil, setActiveDapil] = useState<string>('DAPIL_1');
  const [internalSegment, setInternalSegment] = useState<'IKHTISAR' | 'PETA_TERITORI' | 'TPS_PASUKAN' | 'C1_REALCOUNT' | 'SEMUA'>('IKHTISAR');
  const activeSegment = activeSegmentProp ?? internalSegment;
  const setActiveSegment = (segment: 'IKHTISAR' | 'PETA_TERITORI' | 'TPS_PASUKAN' | 'C1_REALCOUNT' | 'SEMUA') => {
    setInternalSegment(segment);
    if (onSegmentChangeProp) {
      onSegmentChangeProp(segment);
    }
  };
  const [isSaksiPortalOpen, setIsSaksiPortalOpen] = useState(false);
  const [isQuickVoterOpen, setIsQuickVoterOpen] = useState(false);
  const [tpsSearchQuery, setTpsSearchQuery] = useState('');
  const [tpsStatusFilter, setTpsStatusFilter] = useState<'ALL' | 'AMAN' | 'RAWAN' | 'KOSONG' | 'LOKSUS'>('ALL');
  const [selectedVillage, setSelectedVillage] = useState<string>('ALL');
  const [mapMarkerMode, setMapMarkerMode] = useState<'NONE' | 'VILLAGE' | 'TPS'>('NONE');
  const [mapPinStatusFilter, setMapPinStatusFilter] = useState<'ALL' | 'WARNING_ONLY' | 'SAFE_ONLY'>('ALL');
  const [villageGeoData, setVillageGeoData] = useState<any>(null);
  const [showVillagePolygons, setShowVillagePolygons] = useState<boolean>(true);

  // AI Intelligence & Strategy States
  const [aiStrategyLoading, setAiStrategyLoading] = useState(false);
  const [aiStrategyResult, setAiStrategyResult] = useState<any | null>(null);
  const [aiBenchmarkLoading, setAiBenchmarkLoading] = useState(false);
  const [aiBenchmarkResult, setAiBenchmarkResult] = useState<any | null>(null);
  const [showSainteLagueDetail, setShowSainteLagueDetail] = useState(false);
  const [showBenchmarkDetail, setShowBenchmarkDetail] = useState(false);

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

  const fetchLiveDatabaseMetrics = async () => {
    try {
      setLoading(true);

      const [
        konstituenList, 
        relawanList, 
        calegList, 
        dapilList, 
        rabList, 
        dptList, 
        qcList,
        targetWilayahList,
        standarHargaList,
        anggaranList,
        lpjList,
        sainteLagueList,
        tenantApprovalList,
        manajemenTenantList,
        systemSettingsList
      ] = await Promise.all([
        ApiService.getRecords('konstituen').catch(() => []),
        ApiService.getRecords('user_relawan').catch(() => []),
        ApiService.getRecords('master_caleg').catch(() => []),
        ApiService.getRecords('master_dapil').catch(() => []),
        ApiService.getRecords('rab_aspirasi').catch(() => []),
        ApiService.getRecords('data_dpt').catch(() => []),
        ApiService.getRecords('quick_count_c1').catch(() => []),
        ApiService.getRecords('target_dapil_wilayah').catch(() => []),
        ApiService.getRecords('standar_harga_daerah').catch(() => []),
        ApiService.getRecords('anggaran_kampanye').catch(() => []),
        ApiService.getRecords('lpj_kegiatan').catch(() => []),
        ApiService.getRecords('simulasi_sainte_lague').catch(() => []),
        ApiService.getRecords('saas_tenant_approval').catch(() => []),
        ApiService.getRecords('manajemen_tenant_saas').catch(() => []),
        ApiService.getRecords('saas_system_settings').catch(() => [])
      ]);

      setRawKonstituen(konstituenList);
      setRawRelawan(relawanList);
      setRawRab(rabList);
      setRawDpt(dptList);
      setRawQc(qcList);
      setRawTargetWilayah(targetWilayahList);
      setRawStandarHarga(standarHargaList);
      setRawAnggaran(anggaranList);
      setRawLpj(lpjList);
      setRawSainteLague(sainteLagueList);
      setRawTenantApproval(tenantApprovalList);
      setRawManajemenTenant(manajemenTenantList);

      if (calegList.length > 0) {
        setCalegInfo(calegList[0]);
      }
      if (systemSettingsList.length > 0) {
        setRawSystemSettings(systemSettingsList[0]);
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

  const currentDapilConfig = useMemo(() => {
    return DAPIL_CENTERS[activeDapil] || DAPIL_CENTERS['DAPIL_1'];
  }, [activeDapil]);

  // Hook for encapsulated metrics, lists, and statistical models
  const {
    activeDapilKonstituen,
    activeDapilRelawan,
    villageBattleList,
    tpsBattleList,
    filteredTpsList,
    tpsStats,
    voterCertaintyStats,
    priorityVillages,
    costPerVoteStats,
    sainteLagueProjection,
    fullSainteLague
  } = useDashboardMetrics({
    activeDapil,
    currentDapilConfig,
    rawKonstituen,
    rawRelawan,
    rawRab,
    rawAnggaran,
    rawLpj,
    rawSainteLague,
    calegInfo,
    tpsSearchQuery,
    tpsStatusFilter,
    selectedVillage
  });

  // Handler: On-Demand AI Victory Strategist
  const handleFetchAiStrategy = async () => {
    try {
      setAiStrategyLoading(true);
      const res = await fetch('/api/ai/strategi-kemenangan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nama_caleg: calegInfo?.nama_lengkap || 'H. Ahmad Muzakki, M.Si',
          partai: calegInfo?.partai || 'Partai Pengusung Kita',
          dapil: currentDapilConfig.name,
          total_dpt: 125400,
          target_suara: calegInfo?.target_suara_global ? Number(calegInfo.target_suara_global) : 18500,
          suara_terkunci: activeDapilKonstituen.length || 720,
          posisi_kursi: fullSainteLague.userPartyStats.status === 'LOLOS_KURSI' 
            ? `Kursi ke-${fullSainteLague.userPartyStats.lastWonSeatNumber} (Lolos Aman)` 
            : fullSainteLague.userPartyStats.status === 'KURSI_TERAKHIR_RAWAN'
            ? 'Kursi Terakhir #7 (Sangat Kritis)'
            : 'Belum Lolos Kursi (Kurang Suara)',
          safety_margin: fullSainteLague.userPartyStats.safetyMarginVotes,
          battleground_kecamatan: priorityVillages.map(v => v.desa.replace('Kelurahan ', '').replace('Desa ', '')),
          total_pengeluaran: costPerVoteStats.totalRabCair || 45000000,
          cpv_saat_ini: costPerVoteStats.avgCostPerKtp || 38500
        })
      });
      const json = await res.json();
      if (json.success) {
        setAiStrategyResult(json.data);
      } else {
        alert(json.error || 'Gagal memuat strategi pemenangan AI.');
      }
    } catch (err: any) {
      alert('Koneksi AI Strategist gagal: ' + err.message);
    } finally {
      setAiStrategyLoading(false);
    }
  };

  // Handler: On-Demand AI Regional Price Benchmark
  const handleFetchAiPriceBenchmark = async () => {
    try {
      setAiBenchmarkLoading(true);
      const res = await fetch('/api/ai/benchmark-harga-lokal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provinsi: 'Jawa Timur',
          kabupaten_kota: 'Kabupaten Ponorogo',
          nama_dapil: currentDapilConfig.name
        })
      });
      const json = await res.json();
      if (json.success) {
        setAiBenchmarkResult(json.data);
        setShowBenchmarkDetail(true);
      } else {
        alert(json.error || 'Gagal menaksir benchmark harga daerah.');
      }
    } catch (err: any) {
      alert('Koneksi AI Benchmark gagal: ' + err.message);
    } finally {
      setAiBenchmarkLoading(false);
    }
  };

  const activeTargetSuara = calegInfo?.target_suara_global ? Number(calegInfo.target_suara_global) : 18500;
  const overallKtpCount = activeDapilKonstituen.length || 720;
  const progressPercent = Math.min(100, Math.round((overallKtpCount / activeTargetSuara) * 100));

  return (
    <div className="space-y-6">
      {/* 1. EXECUTIVE WAR ROOM HEADER */}
      <DashboardHeader
        calegInfo={calegInfo}
        rawSystemSettings={rawSystemSettings}
        activeDapil={activeDapil}
        setActiveDapil={setActiveDapil}
        loading={loading}
        seedingCloud={seedingCloud}
        onSeedDatabase={handleSeedDatabase}
        onRefresh={fetchLiveDatabaseMetrics}
        onNavigateModule={onNavigateModule}
        rawTenantApproval={rawTenantApproval}
        rawManajemenTenant={rawManajemenTenant}
        costPerVoteStats={costPerVoteStats}
        rawQc={rawQc}
        dapilCenters={DAPIL_CENTERS}
      />

      {/* Cloud Notification */}
      {seedMessage && (
        <div className={`p-3.5 rounded-xl border flex items-center justify-between text-xs font-semibold ${
          seedMessage.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-rose-50 border-rose-200 text-rose-800'
        }`}>
          <span>{seedMessage.text}</span>
          <button onClick={() => setSeedMessage(null)} className="underline text-[11px] cursor-pointer">Tutup</button>
        </div>
      )}

      {/* 1.5. INTERACTIVE DEMO GUIDE */}
      {userRole === 'demo' && (
        <DemoGuideCard
          currentRole={userRole}
          onSwitchRole={onSwitchRole}
          onOpenSainteLague={() => {
            setActiveSegment('IKHTISAR');
            setShowSainteLagueDetail(true);
          }}
          onOpenSaksiPortal={() => {
            setIsSaksiPortalOpen(true);
          }}
          onOpenTerritoryMap={() => {
            setActiveSegment('PETA_TERITORI');
          }}
        />
      )}

      {/* 2. EXECUTIVE COCKPIT */}
      <DashboardExecutiveBar
        sainteLagueProjection={sainteLagueProjection}
        fullSainteLague={fullSainteLague}
        tpsStats={tpsStats}
        priorityVillages={priorityVillages}
        onFilterTpsKosong={() => {
          setActiveSegment('TPS_PASUKAN');
          setTpsStatusFilter('KOSONG');
        }}
        onSelectPriorityVillage={(village) => {
          setSelectedVillage(village);
          setActiveSegment('PETA_TERITORI');
        }}
        onNavigateToSeatSimulator={() => {
          setActiveSegment('IKHTISAR');
          setShowSainteLagueDetail(true);
        }}
      />

      {/* 3. SEGMENTED VIEW SWITCHER & ACTION DISPATCH BAR */}
      <div className="bg-white border border-slate-200 rounded-2xl p-2 sm:p-2.5 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-2.5">
        <div className="hidden md:flex items-center gap-1 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          <button
            onClick={() => setActiveSegment('IKHTISAR')}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
              activeSegment === 'IKHTISAR'
                ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Flame className="w-3.5 h-3.5" />
            <span>Ikhtisar Eksekutif</span>
          </button>

          <button
            onClick={() => setActiveSegment('PETA_TERITORI')}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
              activeSegment === 'PETA_TERITORI'
                ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Map className="w-3.5 h-3.5" />
            <span>Radar Teritori GIS</span>
          </button>

          <button
            onClick={() => setActiveSegment('TPS_PASUKAN')}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
              activeSegment === 'TPS_PASUKAN'
                ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Benteng TPS & Saksi</span>
            {tpsStats.tpsKosong > 0 && (
              <span className="text-[10px] px-1.5 py-0.2 bg-rose-500 text-white rounded-full font-bold">
                {tpsStats.tpsKosong}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveSegment('C1_REALCOUNT')}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
              activeSegment === 'C1_REALCOUNT'
                ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <FileCheck2 className="w-3.5 h-3.5" />
            <span>Real-Count & C1 Plano</span>
          </button>

          <button
            onClick={() => setActiveSegment('SEMUA')}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
              activeSegment === 'SEMUA'
                ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span>Semua Panel</span>
          </button>
        </div>

        <div className="flex md:hidden items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse"></span>
            <span className="text-xs font-bold text-slate-800">
              {activeSegment === 'IKHTISAR' && 'Fokus Lensa: Ikhtisar Eksekutif'}
              {activeSegment === 'PETA_TERITORI' && 'Fokus Lensa: Radar Teritori GIS'}
              {activeSegment === 'TPS_PASUKAN' && 'Fokus Lensa: Benteng TPS & Saksi'}
              {activeSegment === 'C1_REALCOUNT' && 'Fokus Lensa: Real-Count C1 Plano'}
              {activeSegment === 'SEMUA' && 'Fokus Lensa: Semua Panel'}
            </span>
          </div>
          <span className="text-[10px] font-medium text-slate-400">Ganti di Nav Bawah</span>
        </div>

        <div className="flex items-center gap-2 shrink-0 border-t md:border-t-0 pt-2 md:pt-0 border-slate-100">
          <button
            onClick={() => setIsQuickVoterOpen(true)}
            className="flex-1 md:flex-initial inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-xl text-xs font-bold cursor-pointer transition-colors"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>+ Input Cepat Konstituen</span>
          </button>

          <button
            onClick={() => setIsSaksiPortalOpen(true)}
            className="flex-1 md:flex-initial inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-black cursor-pointer shadow-sm transition-all"
          >
            <Smartphone className="w-3.5 h-3.5 text-indigo-400" />
            <span>Portal Saksi HP</span>
          </button>
        </div>
      </div>

      {/* 4. DYNAMIC VIEW PANELS */}
      {(activeSegment === 'IKHTISAR' || activeSegment === 'SEMUA') && (
        <div className="space-y-6">
          <DashboardKpiCards
            overallKtpCount={overallKtpCount}
            activeTargetSuara={activeTargetSuara}
            progressPercent={progressPercent}
            tpsStats={tpsStats}
            costPerVoteStats={costPerVoteStats}
            sainteLagueProjection={sainteLagueProjection}
            fullSainteLague={fullSainteLague}
            onNavigateModule={onNavigateModule}
          />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-7 space-y-6">
              <DashboardPrioritySection
                rawTargetWilayah={rawTargetWilayah}
                priorityVillages={priorityVillages}
                voterCertaintyStats={voterCertaintyStats}
                aiStrategyLoading={aiStrategyLoading}
                aiStrategyResult={aiStrategyResult}
                onFetchAiStrategy={handleFetchAiStrategy}
                onNavigateModule={onNavigateModule}
                setSelectedVillage={setSelectedVillage}
                setTpsStatusFilter={setTpsStatusFilter}
              />
            </div>

            <div className="lg:col-span-5 space-y-6">
              <DashboardSainteLagueSection
                fullSainteLague={fullSainteLague}
                sainteLagueProjection={sainteLagueProjection}
                showSainteLagueDetail={showSainteLagueDetail}
                setShowSainteLagueDetail={setShowSainteLagueDetail}
                onNavigateModule={onNavigateModule}
              />

              <DashboardBudgetAudit
                costPerVoteStats={costPerVoteStats}
                rawAnggaran={rawAnggaran}
                rawRab={rawRab}
                aiBenchmarkLoading={aiBenchmarkLoading}
                aiBenchmarkResult={aiBenchmarkResult}
                showBenchmarkDetail={showBenchmarkDetail}
                setShowBenchmarkDetail={setShowBenchmarkDetail}
                onFetchAiPriceBenchmark={handleFetchAiPriceBenchmark}
                onNavigateModule={onNavigateModule}
              />
            </div>
          </div>
        </div>
      )}

      {activeSegment === 'PETA_TERITORI' && (
        <div className="space-y-6">
          <DashboardTerritorialMap
            currentDapilConfig={currentDapilConfig}
            showVillagePolygons={showVillagePolygons}
            setShowVillagePolygons={setShowVillagePolygons}
            villageGeoData={villageGeoData}
            mapMarkerMode={mapMarkerMode}
            setMapMarkerMode={setMapMarkerMode}
            mapPinStatusFilter={mapPinStatusFilter}
            setMapPinStatusFilter={setMapPinStatusFilter}
            villageBattleList={villageBattleList}
            filteredTpsList={filteredTpsList}
            selectedVillage={selectedVillage}
            setSelectedVillage={setSelectedVillage}
            tpsStats={tpsStats}
          />
        </div>
      )}

      {activeSegment === 'TPS_PASUKAN' && (
        <div className="space-y-6">
          <DashboardTpsGrid
            tpsBattleList={tpsBattleList}
            filteredTpsList={filteredTpsList}
            tpsStats={tpsStats}
            tpsStatusFilter={tpsStatusFilter}
            setTpsStatusFilter={setTpsStatusFilter}
            tpsSearchQuery={tpsSearchQuery}
            setTpsSearchQuery={setTpsSearchQuery}
            selectedVillage={selectedVillage}
            setSelectedVillage={setSelectedVillage}
            activeDapil={activeDapil}
            onNavigateModule={onNavigateModule}
          />
        </div>
      )}

      {activeSegment === 'C1_REALCOUNT' && (
        <div className="space-y-6">
          <DashboardRealCountSection
            rawQc={rawQc}
            activeDapilRelawan={activeDapilRelawan}
            onNavigateModule={onNavigateModule}
          />
        </div>
      )}

      {activeSegment === 'SEMUA' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-7 space-y-6">
              <DashboardTerritorialMap
                currentDapilConfig={currentDapilConfig}
                showVillagePolygons={showVillagePolygons}
                setShowVillagePolygons={setShowVillagePolygons}
                villageGeoData={villageGeoData}
                mapMarkerMode={mapMarkerMode}
                setMapMarkerMode={setMapMarkerMode}
                mapPinStatusFilter={mapPinStatusFilter}
                setMapPinStatusFilter={setMapPinStatusFilter}
                villageBattleList={villageBattleList}
                filteredTpsList={filteredTpsList}
                selectedVillage={selectedVillage}
                setSelectedVillage={setSelectedVillage}
                tpsStats={tpsStats}
              />
              <DashboardTpsGrid
                tpsBattleList={tpsBattleList}
                filteredTpsList={filteredTpsList}
                tpsStats={tpsStats}
                tpsStatusFilter={tpsStatusFilter}
                setTpsStatusFilter={setTpsStatusFilter}
                tpsSearchQuery={tpsSearchQuery}
                setTpsSearchQuery={setTpsSearchQuery}
                selectedVillage={selectedVillage}
                setSelectedVillage={setSelectedVillage}
                activeDapil={activeDapil}
                onNavigateModule={onNavigateModule}
              />
            </div>
            <div className="lg:col-span-5 space-y-6">
              <DashboardRealCountSection
                rawQc={rawQc}
                activeDapilRelawan={activeDapilRelawan}
                onNavigateModule={onNavigateModule}
              />
            </div>
          </div>
        </div>
      )}

      {/* Dedicated Mobile Witness Portal Modal */}
      <SaksiFieldPortalModal
        isOpen={isSaksiPortalOpen}
        onClose={() => setIsSaksiPortalOpen(false)}
        onSuccessSubmit={() => fetchLiveDatabaseMetrics()}
      />

      {/* Fast Door-to-Door Voter Input Modal */}
      <QuickVoterAddModal
        isOpen={isQuickVoterOpen}
        onClose={() => setIsQuickVoterOpen(false)}
        existingVoters={rawKonstituen}
        onSuccess={() => fetchLiveDatabaseMetrics()}
      />
    </div>
  );
}
