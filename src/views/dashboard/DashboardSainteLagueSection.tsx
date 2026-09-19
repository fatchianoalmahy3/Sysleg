import React, { useState } from 'react';
import { Award, ArrowUpRight, Sliders, RefreshCw, AlertTriangle, CheckCircle2 } from 'lucide-react';

interface DashboardSainteLagueSectionProps {
  fullSainteLague: {
    totalVotes: number;
    userPartyStats: {
      status: string;
      lastWonSeatNumber?: number;
      safetyMarginVotes: number;
    };
    seatWinners: Array<{
      seatNumber: number;
      partyName: string;
      isUserParty: boolean;
      quotient: number;
      divisor: number;
    }>;
  };
  sainteLagueProjection: {
    progressKursi2: number;
  };
  showSainteLagueDetail: boolean;
  setShowSainteLagueDetail: React.Dispatch<React.SetStateAction<boolean>>;
  onNavigateModule?: (moduleId: string, contextQuery?: string) => void;
}

export function DashboardSainteLagueSection({
  fullSainteLague,
  sainteLagueProjection,
  showSainteLagueDetail,
  setShowSainteLagueDetail,
  onNavigateModule
}: DashboardSainteLagueSectionProps) {
  // What-If Simulation State
  const [competitorSurge, setCompetitorSurge] = useState<number>(0); // % increase of competitors
  const [extraVotesNeeded, setExtraVotesNeeded] = useState<number>(0); // Additional votes for user party

  // Calculate simulated user party votes & competitors
  const userBaseVotes = fullSainteLague.totalVotes || 38500;
  const simUserVotes = userBaseVotes + extraVotesNeeded;
  
  // Calculate simulated seat margin
  const baseMargin = fullSainteLague.userPartyStats.safetyMarginVotes || 3200;
  const competitorMultiplier = 1 + (competitorSurge / 100);
  const simMargin = Math.round(simUserVotes - (baseMargin * competitorMultiplier));
  const isSimSafe = simMargin > 0;

  return (
    <div className="bg-white p-5 sm:p-6 rounded-2xl shadow-xs border border-slate-200 space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
            <Award className="w-5 h-5 text-violet-600" />
            Simulasi Kursi Sainte-Laguë Parlemen
          </h3>
          <p className="text-xs text-slate-500">
            Komputasi pembagi ganjil (1, 3, 5, 7) & simulator skenario "What-If" persaingan.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowSainteLagueDetail(prev => !prev)}
            className="text-xs font-bold text-violet-700 bg-violet-50 hover:bg-violet-100 px-3 py-1.5 rounded-xl border border-violet-200 transition-colors cursor-pointer"
          >
            {showSainteLagueDetail ? 'Tutup Rincian' : 'Rincian 7 Kursi'}
          </button>
        </div>
      </div>

      <div className="p-4 bg-violet-50/70 rounded-2xl border border-violet-100 space-y-3 text-xs">
        <div className="flex justify-between items-center flex-wrap gap-1">
          <span className="font-semibold text-slate-700">Akumulasi Suara Sah Partai Kita:</span>
          <span className="font-black text-violet-900 text-sm font-mono">{fullSainteLague.totalVotes.toLocaleString('id-ID')} Suara</span>
        </div>
        <div className="flex justify-between items-center text-[11px] text-slate-600 flex-wrap gap-1">
          <span>Status Mandat Parlemen:</span>
          <span className={`font-extrabold px-2.5 py-0.5 rounded-md text-[10px] ${
            fullSainteLague.userPartyStats.status === 'LOLOS_KURSI' 
              ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
              : fullSainteLague.userPartyStats.status === 'KURSI_TERAKHIR_RAWAN'
              ? 'bg-amber-100 text-amber-800 border border-amber-200'
              : 'bg-rose-100 text-rose-800 border border-rose-200'
          }`}>
            {fullSainteLague.userPartyStats.status === 'LOLOS_KURSI' 
              ? `Lolos Kursi #${fullSainteLague.userPartyStats.lastWonSeatNumber || 1} (Aman)`
              : fullSainteLague.userPartyStats.status === 'KURSI_TERAKHIR_RAWAN'
              ? 'Kursi Terakhir (Rawan Rebutan)'
              : 'Belum Mendapat Kursi'}
          </span>
        </div>
        <div className="flex justify-between items-center text-[11px] text-slate-600">
          <span>Jarak Aman / Margin Kursi Terakhir:</span>
          <strong className="text-indigo-700 font-mono">+{fullSainteLague.userPartyStats.safetyMarginVotes.toLocaleString('id-ID')} Suara</strong>
        </div>

        {/* INTERACTIVE WHAT-IF SCENARIO SIMULATOR */}
        <div className="mt-2 pt-3 border-t border-violet-200/80 bg-white/90 p-3.5 rounded-xl border space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-violet-600" />
              Simulator Skenario "What-If"
            </span>
            <button
              type="button"
              onClick={() => { setCompetitorSurge(0); setExtraVotesNeeded(0); }}
              className="text-[10px] text-slate-500 hover:text-slate-800 flex items-center gap-1"
            >
              <RefreshCw className="w-2.5 h-2.5" /> Reset
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Slider 1: Kenaikan Suara Lawan */}
            <div className="space-y-1">
              <div className="flex justify-between text-[10px] font-bold text-slate-600">
                <span>Lonjakan Suara Kompetitor:</span>
                <span className="text-violet-700 font-mono">+{competitorSurge}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="50"
                step="5"
                value={competitorSurge}
                onChange={(e) => setCompetitorSurge(Number(e.target.value))}
                className="w-full accent-violet-600 cursor-pointer h-1.5 bg-slate-200 rounded-lg"
              />
            </div>

            {/* Slider 2: Target Suara Tambahan */}
            <div className="space-y-1">
              <div className="flex justify-between text-[10px] font-bold text-slate-600">
                <span>Target Suara Tambahan Kita:</span>
                <span className="text-emerald-700 font-mono">+{extraVotesNeeded.toLocaleString('id-ID')}</span>
              </div>
              <input
                type="range"
                min="0"
                max="10000"
                step="500"
                value={extraVotesNeeded}
                onChange={(e) => setExtraVotesNeeded(Number(e.target.value))}
                className="w-full accent-emerald-600 cursor-pointer h-1.5 bg-slate-200 rounded-lg"
              />
            </div>
          </div>

          {/* Simulation Outcome Banner */}
          <div className={`p-2.5 rounded-lg border flex items-center justify-between text-xs ${
            isSimSafe 
              ? 'bg-emerald-50 text-emerald-900 border-emerald-200' 
              : 'bg-rose-50 text-rose-900 border-rose-200'
          }`}>
            <div className="flex items-center gap-2 min-w-0">
              {isSimSafe ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              )}
              <span className="truncate font-semibold text-[11px]">
                {isSimSafe 
                  ? `Skenario AMAN: Estimasi sisa margin +${simMargin.toLocaleString('id-ID')} suara.` 
                  : `Skenario BAHAYA: Terancam tersalip! Butuh minimal +${Math.abs(simMargin).toLocaleString('id-ID')} suara lagi.`
                }
              </span>
            </div>
          </div>
        </div>

        {/* DETAILED 7-SEAT ALLOCATION MATRIX */}
        {showSainteLagueDetail && (
          <div className="pt-2 border-t border-violet-200/80 space-y-1.5 animate-in fade-in duration-150">
            <div className="text-[10px] font-bold text-violet-900 uppercase">Daftar Alokasi 7 Kursi Dapil 1:</div>
            <div className="space-y-1">
              {fullSainteLague.seatWinners.map((winner) => (
                <div 
                  key={winner.seatNumber}
                  className={`flex items-center justify-between p-1.5 rounded text-[11px] ${
                    winner.isUserParty 
                      ? 'bg-violet-200/80 font-bold text-violet-950 border border-violet-300' 
                      : 'bg-white/80 text-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    <span className="w-4 h-4 rounded-full bg-slate-900 text-white text-[9px] flex items-center justify-center font-bold">
                      {winner.seatNumber}
                    </span>
                    <span>{winner.partyName}</span>
                    {winner.isUserParty && <span className="text-[9px] text-violet-800">(Partai Kita)</span>}
                  </div>
                  <span className="font-mono text-[10px] text-slate-500">
                    Koefisien: {winner.quotient.toLocaleString('id-ID')} (/:{winner.divisor})
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="pt-2 border-t border-violet-200/60">
          <div className="flex justify-between text-[11px] font-bold text-violet-900 mb-1">
            <span>Prospek Kursi ke-2 Partai di Dapil</span>
            <span>{sainteLagueProjection.progressKursi2}%</span>
          </div>
          <div className="w-full h-2 bg-violet-200/80 rounded-full overflow-hidden">
            <div className="h-full bg-violet-600 rounded-full transition-all duration-500" style={{ width: `${sainteLagueProjection.progressKursi2}%` }}></div>
          </div>
        </div>
      </div>

      {/* Direct Module Launcher */}
      <div className="pt-1">
        <button
          type="button"
          onClick={() => onNavigateModule?.('simulasi_sainte_lague')}
          className="w-full py-2.5 px-3 text-xs font-bold text-violet-700 bg-violet-50 hover:bg-violet-100 rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer border border-violet-200"
        >
          <span>Buka Modul Simulasi Sainte-Laguë & 8 Partai</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
