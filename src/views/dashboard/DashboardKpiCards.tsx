import React from 'react';
import { Users, ShieldCheck, Wallet, Award } from 'lucide-react';
import { formatRupiah } from '../../utils/electoralData';

interface DashboardKpiCardsProps {
  overallKtpCount: number;
  activeTargetSuara: number;
  progressPercent: number;
  tpsStats: {
    total: number;
    aman: number;
    rawan: number;
    kosong: number;
    saksiSiap: number;
    saksiPercent: number;
  };
  costPerVoteStats: {
    avgCostPerKtp: number;
    markupAlertsCount: number;
  };
  sainteLagueProjection: {
    kursiDiperoleh: number;
  };
  fullSainteLague: {
    userPartyStats: {
      safetyMarginVotes: number;
    };
  };
  onNavigateModule?: (moduleId: string, contextQuery?: string) => void;
}

export function DashboardKpiCards({
  overallKtpCount,
  activeTargetSuara,
  progressPercent,
  tpsStats,
  costPerVoteStats,
  sainteLagueProjection,
  fullSainteLague,
  onNavigateModule
}: DashboardKpiCardsProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {/* KPI 1: KTP Konstituen Terkumpul */}
      <div 
        onClick={() => onNavigateModule?.('konstituen')}
        className="bg-white p-4 sm:p-5 rounded-2xl shadow-xs border border-slate-200 hover:border-indigo-400 hover:shadow-md transition-all cursor-pointer group"
        title="Klik untuk membuka Master Konstituen & KTP"
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] sm:text-xs font-bold text-slate-500 group-hover:text-indigo-600 uppercase tracking-wider transition-colors">
            KTP Terverifikasi
          </span>
          <div className="p-1.5 sm:p-2 bg-indigo-50 text-indigo-600 rounded-xl group-hover:bg-indigo-600 group-hover:text-white transition-colors">
            <Users className="w-3.5 sm:w-4 h-3.5 sm:h-4" />
          </div>
        </div>
        <div className="flex items-baseline gap-1.5 flex-wrap">
          <span className="text-xl sm:text-2xl font-black text-slate-900">
            {overallKtpCount.toLocaleString('id-ID')}
          </span>
          <span className="text-[10px] sm:text-xs text-slate-400">/ {activeTargetSuara.toLocaleString('id-ID')}</span>
        </div>
        <div className="mt-3 space-y-1">
          <div className="flex justify-between text-[10px] sm:text-[11px] font-semibold text-slate-500">
            <span>Ketercapaian Kuota</span>
            <span className="font-bold text-indigo-600">{progressPercent}%</span>
          </div>
          <div className="w-full h-1.5 sm:h-2 bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full bg-indigo-600 rounded-full transition-all duration-500" style={{ width: `${progressPercent}%` }}></div>
          </div>
        </div>
      </div>

      {/* KPI 2: Kesiapan Saksi TPS (%) */}
      <div 
        onClick={() => onNavigateModule?.('user_relawan')}
        className="bg-white p-4 sm:p-5 rounded-2xl shadow-xs border border-slate-200 hover:border-emerald-400 hover:shadow-md transition-all cursor-pointer group"
        title="Klik untuk membuka Struktur Relawan & Saksi TPS"
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] sm:text-xs font-bold text-slate-500 group-hover:text-emerald-600 uppercase tracking-wider transition-colors">
            Saksi TPS Terpasang
          </span>
          <div className="p-1.5 sm:p-2 bg-emerald-50 text-emerald-600 rounded-xl group-hover:bg-emerald-600 group-hover:text-white transition-colors">
            <ShieldCheck className="w-3.5 sm:w-4 h-3.5 sm:h-4" />
          </div>
        </div>
        <div className="flex items-baseline gap-1.5 flex-wrap">
          <span className="text-xl sm:text-2xl font-black text-slate-900">
            {tpsStats.saksiPercent}%
          </span>
          <span className="text-[10px] sm:text-xs text-slate-400">({tpsStats.saksiSiap}/{tpsStats.total})</span>
        </div>
        <div className="mt-3 flex items-center justify-between text-[10px] sm:text-[11px] font-medium text-slate-600">
          <span className="text-emerald-600 font-bold">🟢 {tpsStats.aman}</span>
          <span className="text-amber-600 font-bold">🟡 {tpsStats.rawan}</span>
          <span className="text-rose-600 font-bold">🔴 {tpsStats.kosong}</span>
        </div>
      </div>

      {/* KPI 3: Audit Biaya per Suara (Cost-per-Vote) */}
      <div 
        onClick={() => onNavigateModule?.('rencana_anggaran')}
        className="bg-white p-4 sm:p-5 rounded-2xl shadow-xs border border-slate-200 hover:border-amber-400 hover:shadow-md transition-all cursor-pointer group"
        title="Klik untuk membuka Rencana Anggaran & CPV"
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] sm:text-xs font-bold text-slate-500 group-hover:text-amber-600 uppercase tracking-wider transition-colors">
            Cost-per-Vote (CPV)
          </span>
          <div className="p-1.5 sm:p-2 bg-amber-50 text-amber-600 rounded-xl group-hover:bg-amber-600 group-hover:text-white transition-colors">
            <Wallet className="w-3.5 sm:w-4 h-3.5 sm:h-4" />
          </div>
        </div>
        <div className="flex items-baseline gap-1.5 flex-wrap">
          <span className="text-xl sm:text-2xl font-black text-slate-900">
            {formatRupiah(costPerVoteStats.avgCostPerKtp)}
          </span>
          <span className="text-[10px] sm:text-xs text-slate-400">/ KTP</span>
        </div>
        <p className="text-[10px] sm:text-[11px] text-slate-500 mt-3 font-medium flex items-center gap-1 truncate">
          {costPerVoteStats.markupAlertsCount > 0 ? (
            <span className="text-rose-600 font-bold">⚠️ {costPerVoteStats.markupAlertsCount} Mark-up Terdeteksi</span>
          ) : (
            <>
              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span>
              <span>Efisiensi: <strong className="text-slate-800">Sesuai BPS</strong></span>
            </>
          )}
        </p>
      </div>

      {/* KPI 4: Proyeksi Sainte-Laguë Kursi Parlemen */}
      <div 
        onClick={() => onNavigateModule?.('simulasi_sainte_lague')}
        className="bg-white p-4 sm:p-5 rounded-2xl shadow-xs border border-slate-200 hover:border-violet-400 hover:shadow-md transition-all cursor-pointer group"
        title="Klik untuk membuka Simulasi Sainte-Laguë"
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] sm:text-xs font-bold text-slate-500 group-hover:text-violet-600 uppercase tracking-wider transition-colors">
            Sainte-Laguë
          </span>
          <div className="p-1.5 sm:p-2 bg-violet-50 text-violet-600 rounded-xl group-hover:bg-violet-600 group-hover:text-white transition-colors">
            <Award className="w-3.5 sm:w-4 h-3.5 sm:h-4" />
          </div>
        </div>
        <div className="flex items-baseline gap-1.5 flex-wrap">
          <span className="text-xl sm:text-2xl font-black text-violet-700">
            {sainteLagueProjection.kursiDiperoleh} Kursi
          </span>
          <span className="text-[10px] sm:text-xs font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
            Terkunci
          </span>
        </div>
        <p className="text-[10px] sm:text-[11px] text-slate-500 mt-3 font-medium truncate">
          Margin: <strong className="text-indigo-600">+{fullSainteLague.userPartyStats.safetyMarginVotes.toLocaleString('id-ID')} Suara</strong>
        </p>
      </div>
    </div>
  );
}
