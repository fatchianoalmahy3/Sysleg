import React, { useState } from 'react';
import { Flame, Sparkles, ChevronRight, ArrowUpRight, CheckCircle2, UserCheck, HelpCircle, AlertOctagon } from 'lucide-react';

interface DashboardPrioritySectionProps {
  rawTargetWilayah: any[];
  priorityVillages: any[];
  voterCertaintyStats?: {
    pasti100: number;
    kemungkinan75: number;
    ragu50: number;
    rawan25: number;
    total: number;
  };
  aiStrategyLoading: boolean;
  aiStrategyResult: any;
  onFetchAiStrategy: () => void;
  onNavigateModule?: (moduleId: string, contextQuery?: string) => void;
  setSelectedVillage: (v: string) => void;
  setTpsStatusFilter: (filter: 'ALL' | 'AMAN' | 'RAWAN' | 'KOSONG' | 'LOKSUS') => void;
}

export function DashboardPrioritySection({
  rawTargetWilayah,
  priorityVillages,
  voterCertaintyStats,
  aiStrategyLoading,
  aiStrategyResult,
  onFetchAiStrategy,
  onNavigateModule,
  setSelectedVillage,
  setTpsStatusFilter
}: DashboardPrioritySectionProps) {
  const [scopeLevel, setScopeLevel] = useState<'KECAMATAN' | 'DESA'>('KECAMATAN');

  const certainty = voterCertaintyStats || {
    pasti100: 420,
    kemungkinan75: 185,
    ragu50: 95,
    rawan25: 20,
    total: 720
  };

  const pctPasti = Math.round((certainty.pasti100 / (certainty.total || 1)) * 100);
  const pctProspek = Math.round((certainty.kemungkinan75 / (certainty.total || 1)) * 100);
  const pctSwing = Math.round((certainty.ragu50 / (certainty.total || 1)) * 100);
  const pctRawan = Math.round((certainty.rawan25 / (certainty.total || 1)) * 100);

  return (
    <div className="bg-white p-5 sm:p-6 rounded-2xl shadow-xs border border-slate-200 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
            <Flame className="w-4 h-4 text-rose-500" />
            Wilayah Prioritas Gerilya (Top Attention)
          </h3>
          <p className="text-xs text-slate-500">
            Analisis kuadran wilayah Makro & Meso (307 Desa) serta skor kepastian pemilih.
          </p>
        </div>
        <button
          onClick={onFetchAiStrategy}
          disabled={aiStrategyLoading}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 disabled:opacity-50 rounded-xl transition-all shadow-xs cursor-pointer"
          title="Panggil Analisis Strategi AI Gemini (Hemat Token & Makro Dapil)"
        >
          <Sparkles className={`w-3.5 h-3.5 text-amber-300 ${aiStrategyLoading ? 'animate-spin' : ''}`} />
          <span>{aiStrategyLoading ? 'Menganalisis...' : 'Strategi AI'}</span>
        </button>
      </div>

      {/* SKOR KEPASTIAN SUARA (VOTER CERTAINTY MATRIX) */}
      <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-black text-slate-800 flex items-center gap-1.5">
            <UserCheck className="w-3.5 h-3.5 text-indigo-600" />
            Matriks Kepastian Suara Pemilih ({certainty.total} Konstituen)
          </span>
          <span className="text-[10px] font-bold text-slate-400">Anti-Gembos</span>
        </div>

        <div className="grid grid-cols-4 gap-1.5 text-center">
          <div className="p-2 rounded-lg bg-emerald-50 border border-emerald-200">
            <div className="text-[10px] font-bold text-emerald-800 flex items-center justify-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
              Pasti (100%)
            </div>
            <div className="text-sm font-black text-emerald-900 mt-0.5">{certainty.pasti100}</div>
            <div className="text-[9px] text-emerald-600">{pctPasti}% basis aman</div>
          </div>

          <div className="p-2 rounded-lg bg-sky-50 border border-sky-200">
            <div className="text-[10px] font-bold text-sky-800 flex items-center justify-center gap-1">
              <UserCheck className="w-3 h-3 text-sky-600" />
              Prospek (75%)
            </div>
            <div className="text-sm font-black text-sky-900 mt-0.5">{certainty.kemungkinan75}</div>
            <div className="text-[9px] text-sky-600">{pctProspek}% butuh kawal</div>
          </div>

          <div className="p-2 rounded-lg bg-amber-50 border border-amber-200">
            <div className="text-[10px] font-bold text-amber-800 flex items-center justify-center gap-1">
              <HelpCircle className="w-3 h-3 text-amber-600" />
              Swing (50%)
            </div>
            <div className="text-sm font-black text-amber-900 mt-0.5">{certainty.ragu50}</div>
            <div className="text-[9px] text-amber-600">{pctSwing}% sowan caleg</div>
          </div>

          <div className="p-2 rounded-lg bg-rose-50 border border-rose-200">
            <div className="text-[10px] font-bold text-rose-800 flex items-center justify-center gap-1">
              <AlertOctagon className="w-3 h-3 text-rose-600" />
              Rawan (25%)
            </div>
            <div className="text-sm font-black text-rose-900 mt-0.5">{certainty.rawan25}</div>
            <div className="text-[9px] text-rose-600">{pctRawan}% filter budget</div>
          </div>
        </div>
      </div>

      {/* MESO VS MAKRO TOGGLE */}
      <div className="flex items-center justify-between pt-1">
        <span className="text-xs font-bold text-slate-700">Tingkat Hirarki Wilayah:</span>
        <div className="inline-flex bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs font-bold">
          <button
            onClick={() => setScopeLevel('KECAMATAN')}
            className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
              scopeLevel === 'KECAMATAN' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Makro (Kecamatan)
          </button>
          <button
            onClick={() => setScopeLevel('DESA')}
            className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
              scopeLevel === 'DESA' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Meso (307 Desa/Kelurahan)
          </button>
        </div>
      </div>

      {/* AI STRATEGY BRIEFING RESULT CARD */}
      {aiStrategyResult && (
        <div className="p-4 bg-slate-900 text-white rounded-xl border border-slate-800 space-y-3 animate-in fade-in duration-200">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <span className="text-[10px] uppercase font-mono tracking-wider text-amber-400 font-bold flex items-center gap-1.5">
              <Sparkles className="w-3 h-3 text-amber-400" />
              AI Commander Directive
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded font-extrabold bg-rose-500/20 text-rose-300 border border-rose-500/30">
              {aiStrategyResult.status_kesiapan}
            </span>
          </div>

          <div className="text-xs space-y-1">
            <div className="text-slate-400 text-[11px]">Wilayah Medan Tempur Kunci:</div>
            <div className="font-extrabold text-white text-sm text-indigo-200">
              {aiStrategyResult.prioritas_wilayah_utama}
            </div>
          </div>

          <div className="space-y-2 pt-1 border-t border-slate-800/80">
            {aiStrategyResult.arahan_taktis?.map((t: any, idx: number) => (
              <div key={idx} className="p-2.5 rounded-lg bg-slate-800/80 border border-slate-700/60 text-xs space-y-1">
                <div className="flex items-center justify-between text-[10px] font-bold">
                  <span className="text-amber-300">{t.pilar}</span>
                </div>
                <p className="text-slate-100 font-medium leading-relaxed">{t.tindakan_konkret}</p>
                <p className="text-[10px] text-slate-400 italic font-mono">{t.alasan_data}</p>
              </div>
            ))}
          </div>

          {aiStrategyResult.pesan_panglima && (
            <div className="p-2.5 bg-indigo-950/60 rounded-lg border border-indigo-900/60 text-[11px] text-indigo-200 leading-relaxed italic">
              "{aiStrategyResult.pesan_panglima}"
            </div>
          )}
        </div>
      )}

      <div className="space-y-2.5 pt-1">
        {scopeLevel === 'KECAMATAN' && rawTargetWilayah.length > 0 ? (
          rawTargetWilayah.slice(0, 4).map((tw, idx) => {
            const target = Number(tw.target_suara) || 5000;
            const terkumpul = Number(tw.suara_terkunci) || 0;
            const pct = Math.min(100, Math.round((terkumpul / target) * 100));
            const isRawan = tw.status_kuadran === 'RAWAN_MERAH';
            const isBattle = tw.status_kuadran === 'BATTLEGROUND_KUNING';

            const kecName = tw.kecamatan || tw.kecamatan_target || 'Ponorogo';
            return (
              <div 
                key={tw.id || idx}
                className="p-3.5 rounded-xl border border-slate-200 hover:border-slate-300 bg-slate-50/50 hover:bg-slate-50 transition-all space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`w-5 h-5 rounded-full text-xs font-black flex items-center justify-center ${
                      isRawan ? 'bg-rose-100 text-rose-700' : isBattle ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
                    }`}>
                      {idx + 1}
                    </span>
                    <span className="font-black text-xs text-slate-900">{kecName}</span>
                    {tw.dapil && <span className="text-[10px] text-slate-400">({tw.dapil})</span>}
                  </div>
                  <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded border ${
                    isRawan ? 'bg-rose-50 text-rose-700 border-rose-200' :
                    isBattle ? 'bg-amber-50 text-amber-700 border-amber-200' :
                    'bg-emerald-50 text-emerald-700 border-emerald-200'
                  }`}>
                    {tw.status_kuadran?.replace('_', ' ') || tw.status_wilayah?.split(' ')[0] || 'BASIS'}
                  </span>
                </div>

                <div className="flex justify-between items-center text-[11px] text-slate-600">
                  <span>Terkumpul: <strong>{terkumpul.toLocaleString('id-ID')} KTP</strong></span>
                  <span>Target: <strong>{target.toLocaleString('id-ID')}</strong></span>
                  <span className="font-bold text-indigo-600">{pct}%</span>
                </div>

                <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full ${isRawan ? 'bg-rose-500' : isBattle ? 'bg-amber-500' : 'bg-emerald-500'}`} 
                    style={{ width: `${pct}%` }}
                  ></div>
                </div>

                <div className="pt-1 flex items-center justify-between text-[11px] gap-2">
                  <span className="text-slate-500 font-medium truncate">
                    PIC: {tw.pic_korcam || 'Koordinator'}
                  </span>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => onNavigateModule?.('data_dpt', kecName)}
                      className="px-2 py-0.5 text-[10px] font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded border border-indigo-200 transition-colors cursor-pointer"
                      title={`Lihat Daftar DPT di ${kecName}`}
                    >
                      DPT
                    </button>
                    <button
                      onClick={() => onNavigateModule?.('user_relawan', kecName)}
                      className="px-2 py-0.5 text-[10px] font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded border border-emerald-200 transition-colors cursor-pointer"
                      title={`Lihat Relawan & Saksi di ${kecName}`}
                    >
                      Relawan
                    </button>
                    <button
                      onClick={() => onNavigateModule?.('target_dapil_wilayah', kecName)}
                      className="px-2 py-0.5 text-[10px] font-bold text-slate-700 bg-white hover:bg-slate-100 rounded border border-slate-200 transition-colors cursor-pointer"
                      title={`Lihat Detail Strategi di ${kecName}`}
                    >
                      Strategi
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          priorityVillages.slice(0, 5).map((v, idx) => (
            <div 
              key={`${v.kecamatan}-${v.desa}-${idx}`}
              className="p-3.5 rounded-xl border border-slate-200 hover:border-slate-300 bg-slate-50/50 hover:bg-slate-50 transition-all space-y-2"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-rose-100 text-rose-700 text-xs font-black flex items-center justify-center">
                    {idx + 1}
                  </span>
                  <div>
                    <span className="font-black text-xs text-slate-900">{v.desa}</span>
                    <span className="text-[10px] text-slate-400 ml-1.5">({v.kecamatan})</span>
                  </div>
                </div>
                <span className="text-[11px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded border border-rose-100">
                  Gap: -{v.gap} KTP
                </span>
              </div>

              <div className="flex justify-between items-center text-[11px] text-slate-600">
                <span>Terkumpul: <strong>{v.totalKtp} KTP</strong></span>
                <span>Target: <strong>{v.target} KTP</strong></span>
                <span className="font-bold text-indigo-600">{v.percentage}%</span>
              </div>

              <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                <div className="h-full bg-rose-500 rounded-full" style={{ width: `${v.percentage}%` }}></div>
              </div>

              <div className="pt-1 flex items-center justify-between text-[11px]">
                <span className="text-slate-500 font-medium">Fokus: Door-to-Door Kordes</span>
                <button
                  onClick={() => {
                    setSelectedVillage(v.desa);
                    setTpsStatusFilter('ALL');
                  }}
                  className="text-indigo-600 hover:text-indigo-800 font-bold cursor-pointer inline-flex items-center gap-1"
                >
                  <span>Buka TPS</span>
                  <ChevronRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Direct Module Launcher */}
      <div className="pt-2 border-t border-slate-100">
        <button
          onClick={() => onNavigateModule?.('target_dapil_wilayah')}
          className="w-full py-2 px-3 text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <span>Buka Modul Target Wilayah & Strategi Kuadran</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
