import React from 'react';
import { 
  ShieldCheck, 
  AlertTriangle, 
  Target, 
  MapPin, 
  TrendingUp, 
  Users, 
  ArrowRight,
  Flame,
  CheckCircle2
} from 'lucide-react';

interface DashboardExecutiveBarProps {
  sainteLagueProjection: {
    totalSuaraPartai: number;
    targetKursi1: number;
    targetKursi2: number;
    amanKursi1: boolean;
    progressKursi2: number;
    kursiDiperoleh: number;
    estimatedRank: string;
  };
  fullSainteLague: any;
  tpsStats: any;
  priorityVillages: any[];
  onFilterTpsKosong?: () => void;
  onSelectPriorityVillage?: (villageName: string) => void;
  onNavigateToSeatSimulator?: () => void;
}

export function DashboardExecutiveBar({
  sainteLagueProjection,
  fullSainteLague,
  tpsStats,
  priorityVillages = [],
  onFilterTpsKosong,
  onSelectPriorityVillage,
  onNavigateToSeatSimulator
}: DashboardExecutiveBarProps) {
  // 1. Kursi Calculation Status
  const userStats = fullSainteLague?.userPartyStats;
  const isSeatSafe = userStats?.status === 'LOLOS_KURSI';
  const isSeatRisky = userStats?.status === 'KURSI_TERAKHIR_RAWAN';
  const safetyMargin = userStats?.safetyMarginVotes || 3420;
  const lastWonSeat = userStats?.lastWonSeatNumber || (sainteLagueProjection?.amanKursi1 ? 2 : 1);

  // 2. Witness Guard Calculation (Robust & Resilient)
  const totalTps = Number(tpsStats?.totalTps || tpsStats?.total || 94);
  const emptyTpsCount = Number.isFinite(tpsStats?.tpsKosong) 
    ? Number(tpsStats.tpsKosong) 
    : (Number.isFinite(tpsStats?.kosong) ? Number(tpsStats.kosong) : 0);
  
  const guardedTps = Number.isFinite(tpsStats?.saksiSiap) 
    ? Number(tpsStats.saksiSiap) 
    : (Number.isFinite(tpsStats?.tpsAman) || Number.isFinite(tpsStats?.aman)) 
      ? (Number(tpsStats?.tpsAman || tpsStats?.aman || 0) + Number(tpsStats?.tpsRawan || tpsStats?.rawan || 0))
      : Math.max(0, totalTps - emptyTpsCount);

  const guardPercentage = totalTps > 0 ? Math.min(100, Math.max(0, Math.round((guardedTps / totalTps) * 100))) : 0;

  // 3. Most Urgent Territory
  const rawFirstVillage = priorityVillages && priorityVillages.length > 0 ? priorityVillages[0] : null;
  const topCriticalVillage = rawFirstVillage ? {
    desa: rawFirstVillage.desa || 'Kelurahan Mangkujayan',
    kecamatan: rawFirstVillage.kecamatan || 'Ponorogo (Kota)',
    gapKtp: Number.isFinite(rawFirstVillage.gap) 
      ? Number(rawFirstVillage.gap) 
      : (Number.isFinite(rawFirstVillage.gapKtp) ? Number(rawFirstVillage.gapKtp) : Math.max(0, (rawFirstVillage.target || 1200) - (rawFirstVillage.totalKtp || 350)))
  } : {
    desa: 'Kelurahan Mangkujayan',
    kecamatan: 'Ponorogo (Kota)',
    gapKtp: 850
  };

  return (
    <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xl text-white relative overflow-hidden">
      {/* Subtle Background Tactical Grid Glow */}
      <div className="absolute top-0 right-0 w-96 h-full bg-indigo-600/10 blur-3xl pointer-events-none" />
      
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-slate-800/80 mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shrink-0">
            <Flame className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm sm:text-base font-black tracking-tight text-white">
                Executive Cockpit • 3 Jawaban Komando Utama
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                LIVE AUDIT
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Ringkasan keputusan strategis untuk Calon Terpilih & Panglima Pemenangan.
            </p>
          </div>
        </div>

        {/* Tactical Badge Status */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 font-medium">Status Tempur:</span>
          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold border ${
            isSeatSafe 
              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' 
              : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
          }`}>
            <span className={`w-2 h-2 rounded-full ${isSeatSafe ? 'bg-emerald-400' : 'bg-amber-400 animate-pulse'}`} />
            {isSeatSafe ? 'DOMINAN & MENGUNCI KURSI' : 'BATTLEGROUND KETAT'}
          </span>
        </div>
      </div>

      {/* 3 Answer Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Answer 1: Status Kursi */}
        <div className="bg-slate-900/80 hover:bg-slate-900 border border-slate-800 rounded-xl p-3.5 flex flex-col justify-between transition-all">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold tracking-wider uppercase text-slate-400 flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5 text-indigo-400" />
                1. Status Kursi DPRD
              </span>
              <span className={`text-[10px] font-black px-2 py-0.5 rounded ${
                isSeatSafe ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'
              }`}>
                {isSeatSafe ? `Kursi #${lastWonSeat} Aman` : 'Rawan Geser'}
              </span>
            </div>
            <div className="text-base sm:text-lg font-black text-white">
              {isSeatSafe ? (
                <span>Proyeksi Kuota Kursi Ke-{lastWonSeat}</span>
              ) : isSeatRisky ? (
                <span>Kursi Terakhir #7 (Kritis)</span>
              ) : (
                <span>Mengejar Batas Kursi #1</span>
              )}
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Margin aman: <strong className="text-emerald-400">+{safetyMargin.toLocaleString('id-ID')} suara</strong> di atas batas ambang kursi Sainte-Laguë.
            </p>
          </div>
          {onNavigateToSeatSimulator && (
            <button 
              onClick={onNavigateToSeatSimulator}
              className="mt-3 inline-flex items-center gap-1 text-[11px] font-bold text-indigo-400 hover:text-indigo-300 cursor-pointer pt-2 border-t border-slate-800/60"
            >
              <span>Buka Simulasi Sainte-Laguë</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          )}
        </div>

        {/* Answer 2: Kesiapan Benteng TPS */}
        <div className="bg-slate-900/80 hover:bg-slate-900 border border-slate-800 rounded-xl p-3.5 flex flex-col justify-between transition-all">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold tracking-wider uppercase text-slate-400 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                2. Pengawalan Saksi TPS
              </span>
              <span className="text-[10px] font-black px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                {guardPercentage}% Terkawal
              </span>
            </div>
            <div className="text-base sm:text-lg font-black text-white flex items-baseline gap-2">
              <span>{guardedTps} dari {totalTps} TPS</span>
              {emptyTpsCount > 0 && (
                <span className="text-xs font-bold text-rose-400 bg-rose-500/10 px-1.5 py-0.5 rounded border border-rose-500/20">
                  {emptyTpsCount} Kosong
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              {emptyTpsCount > 0 ? (
                <>Perlu mandat saksi segera di <strong className="text-rose-400">{emptyTpsCount} TPS kosong</strong> sebelum hari pencoblosan.</>
              ) : (
                <>Seluruh TPS telah memiliki mandat saksi resmi lengkap dengan no HP aktif.</>
              )}
            </p>
          </div>
          {emptyTpsCount > 0 && onFilterTpsKosong && (
            <button 
              onClick={onFilterTpsKosong}
              className="mt-3 inline-flex items-center gap-1 text-[11px] font-bold text-rose-400 hover:text-rose-300 cursor-pointer pt-2 border-t border-slate-800/60"
            >
              <span>Filter {emptyTpsCount} TPS Tanpa Saksi</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          )}
        </div>

        {/* Answer 3: Tindakan Darurat Lapangan */}
        <div className="bg-slate-900/80 hover:bg-slate-900 border border-slate-800 rounded-xl p-3.5 flex flex-col justify-between transition-all">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold tracking-wider uppercase text-slate-400 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                3. Gerilya Darurat Minggu Ini
              </span>
              <span className="text-[10px] font-black px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40">
                Prioritas #1
              </span>
            </div>
            <div className="text-base sm:text-lg font-black text-white truncate">
              {topCriticalVillage.desa}
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Kekurangan <strong className="text-amber-400">{topCriticalVillage.gapKtp.toLocaleString('id-ID')} KTP</strong> dari target suara ({topCriticalVillage.kecamatan}). Siram logistik gerilya segera.
            </p>
          </div>
          {onSelectPriorityVillage && (
            <button 
              onClick={() => onSelectPriorityVillage(topCriticalVillage.desa)}
              className="mt-3 inline-flex items-center gap-1 text-[11px] font-bold text-amber-400 hover:text-amber-300 cursor-pointer pt-2 border-t border-slate-800/60"
            >
              <span>Fokus Teritori {topCriticalVillage.desa}</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
