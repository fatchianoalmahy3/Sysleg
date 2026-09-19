import React from 'react';
import { 
  Building2, 
  Sparkles, 
  RefreshCw, 
  Database, 
  ArrowUpRight, 
  MapPin, 
  ShieldCheck, 
  Wallet, 
  Vote, 
  Check 
} from 'lucide-react';
import { formatRupiah } from '../../utils/electoralData';

interface DashboardHeaderProps {
  calegInfo: any;
  rawSystemSettings: any;
  activeDapil: string;
  setActiveDapil: (dapil: string) => void;
  loading: boolean;
  seedingCloud: boolean;
  onSeedDatabase: () => void;
  onRefresh: () => void;
  onNavigateModule?: (moduleId: string, contextQuery?: string) => void;
  rawTenantApproval: any[];
  rawManajemenTenant: any[];
  costPerVoteStats: {
    totalPaguAnggaran: number;
    markupAlertsCount: number;
  };
  rawQc: any[];
  dapilCenters: Record<string, { name: string }>;
}

export function DashboardHeader({
  calegInfo,
  rawSystemSettings,
  activeDapil,
  setActiveDapil,
  loading,
  seedingCloud,
  onSeedDatabase,
  onRefresh,
  onNavigateModule,
  rawTenantApproval,
  rawManajemenTenant,
  costPerVoteStats,
  rawQc,
  dapilCenters
}: DashboardHeaderProps) {
  return (
    <div className="space-y-4">
      {/* SaaS Multi-Tenant Strategic Banner */}
      <div className="bg-slate-900 text-white rounded-2xl p-5 sm:p-6 shadow-md border border-slate-800 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              WAR ROOM EKSEKUTIF CALEG 2024
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700">
              Kabupaten Ponorogo • KPU BA No. 425/2023
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-950 text-emerald-300 border border-emerald-800/60 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>Cloud Firestore Aktif</span>
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2">
            <span>{calegInfo?.nama_lengkap || 'Drs. H. Ahmad Fauzan, M.Si.'}</span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-indigo-600/30 text-indigo-300 border border-indigo-500/40">
              No. Urut {calegInfo?.nomor_urut || '01'}
            </span>
          </h2>

          <p className="text-xs text-slate-400 flex items-center gap-1.5">
            <span>Partai: <strong>{calegInfo?.partai || 'PKB (Partai Kebangkitan Bangsa)'}</strong></span>
            <span>•</span>
            <span>Target Pemenangan: <strong className="text-amber-400">{(calegInfo?.target_suara_global || 18500).toLocaleString('id-ID')} Suara</strong></span>
          </p>
        </div>

        {/* Global Action Tools */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Refresh Realtime */}
          <button
            onClick={onRefresh}
            disabled={loading}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all border border-slate-700 flex items-center gap-1.5 disabled:opacity-50 cursor-pointer shadow-xs"
            title="Segarkan data langsung dari Cloud Firestore"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-slate-300 ${loading ? 'animate-spin' : ''}`} />
            <span>{loading ? 'Menyinkronkan...' : 'Segarkan'}</span>
          </button>

          {/* Atomic Seeder */}
          <button
            onClick={onSeedDatabase}
            disabled={seedingCloud}
            className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs disabled:opacity-50 cursor-pointer"
            title="Suntikkan dataset pemilu resmi Ponorogo ke seluruh 16 koleksi Cloud Firestore"
          >
            <Database className={`w-3.5 h-3.5 ${seedingCloud ? 'animate-bounce' : ''}`} />
            <span>{seedingCloud ? 'Menyuntikkan...' : 'Suntik Data'}</span>
          </button>
        </div>
      </div>

      {/* Multi-Tenant Global Stats Row */}
      <div className="bg-slate-900/95 text-white rounded-2xl p-4 sm:p-5 border border-slate-800 shadow-xs space-y-3">
        <div className="flex items-center justify-between text-xs text-slate-400 border-b border-slate-800 pb-2">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-indigo-400" />
            <span className="font-bold text-slate-200">SaaS Multi-Tenant Klien Caleg Ponorogo</span>
          </div>
          <span className="text-[11px] text-indigo-300 font-mono">
            Tenant: {rawSystemSettings?.appName || 'Sikad-Pileg Ponorogo Engine'}
          </span>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Kuota & Lisensi Tenant */}
          <div 
            onClick={() => onNavigateModule?.('manajemen_tenant_saas')}
            className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/60 hover:border-indigo-500/60 hover:bg-slate-800 transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between text-slate-400 text-[10px] mb-1">
              <span>TENANT CALEG AKTIF</span>
              <ArrowUpRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-indigo-400 transition-colors" />
            </div>
            <div className="text-base font-black text-white">
              {rawManajemenTenant.length || 4} Klien Caleg
            </div>
            <div className="text-[10px] text-emerald-400 font-medium">
              Kuota: {(rawManajemenTenant.reduce((acc, t) => acc + (Number(t.kuota_dpt) || 0), 0) || 1000000).toLocaleString('id-ID')} DPT
            </div>
          </div>

          {/* Antrean Approval Caleg */}
          <div 
            onClick={() => onNavigateModule?.('saas_tenant_approval')}
            className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/60 hover:border-amber-500/60 hover:bg-slate-800 transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between text-slate-400 text-[10px] mb-1">
              <span>ANTREAN CALEG</span>
              <ArrowUpRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-amber-400 transition-colors" />
            </div>
            <div className="text-base font-black text-white">
              {rawTenantApproval.filter(t => t.status === 'MENUNGGU_VERIFIKASI').length || 2} Verifikasi
            </div>
            <div className="text-[10px] text-amber-400 font-medium">
              Calon Tenant DPRD Baru
            </div>
          </div>

          {/* Audit Anggaran & Mark-up */}
          <div 
            onClick={() => onNavigateModule?.('anggaran_kampanye')}
            className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/60 hover:border-indigo-500/60 hover:bg-slate-800 transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between text-slate-400 text-[10px] mb-1">
              <span>AUDIT ANGGARAN</span>
              <ArrowUpRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-indigo-400 transition-colors" />
            </div>
            <div className="text-base font-black text-white">
              {formatRupiah(costPerVoteStats.totalPaguAnggaran)}
            </div>
            <div className="text-[10px] text-indigo-300 font-medium">
              {costPerVoteStats.markupAlertsCount > 0 ? (
                <span className="text-rose-400 font-bold">⚠️ {costPerVoteStats.markupAlertsCount} Deviasi BPS</span>
              ) : (
                '7 Standar BPS Terhubung'
              )}
            </div>
          </div>

          {/* C1 Plano TPS Masuk */}
          <div 
            onClick={() => onNavigateModule?.('quick_count_c1')}
            className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/60 hover:border-sky-500/60 hover:bg-slate-800 transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between text-slate-400 text-[10px] mb-1">
              <span>C1 PLANO TPS</span>
              <ArrowUpRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-sky-400 transition-colors" />
            </div>
            <div className="text-base font-black text-white">
              {rawQc.length || 3} TPS Masuk
            </div>
            <div className="text-[10px] text-sky-400 font-medium">
              Otentikasi Kriptografis Sah
            </div>
          </div>
        </div>
      </div>

      {/* Dapil Selector Bar */}
      <div className="bg-white p-3 sm:p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-indigo-600" />
          <span className="text-xs font-black text-slate-800">Fokus Dapil Teritorial:</span>
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          {Object.entries(dapilCenters).map(([key, config]) => {
            const isActive = activeDapil === key;
            const label = key === 'ALL' ? 'Seluruh Ponorogo' : key.replace('_', ' ');
            return (
              <button
                key={key}
                onClick={() => setActiveDapil(key)}
                className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
                title={config.name}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
