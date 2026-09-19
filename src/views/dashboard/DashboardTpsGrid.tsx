import React from 'react';
import { ShieldCheck, Search, CheckCircle2, AlertTriangle, MessageCircle } from 'lucide-react';

interface DashboardTpsGridProps {
  tpsBattleList: any[];
  filteredTpsList: any[];
  tpsStats: {
    total: number;
    rawan: number;
    kosong: number;
    aman: number;
    loksus?: number;
  };
  tpsStatusFilter: 'ALL' | 'AMAN' | 'RAWAN' | 'KOSONG' | 'LOKSUS';
  setTpsStatusFilter: (filter: 'ALL' | 'AMAN' | 'RAWAN' | 'KOSONG' | 'LOKSUS') => void;
  tpsSearchQuery: string;
  setTpsSearchQuery: (query: string) => void;
  selectedVillage: string;
  setSelectedVillage: (v: string) => void;
  activeDapil: string;
  onNavigateModule?: (moduleId: string, contextQuery?: string) => void;
}

export function DashboardTpsGrid({
  tpsBattleList,
  filteredTpsList,
  tpsStats,
  tpsStatusFilter,
  setTpsStatusFilter,
  tpsSearchQuery,
  setTpsSearchQuery,
  selectedVillage,
  setSelectedVillage,
  activeDapil,
  onNavigateModule
}: DashboardTpsGridProps) {
  return (
    <div className="bg-white p-5 sm:p-6 rounded-2xl shadow-xs border border-slate-200 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-100">
        <div>
          <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-indigo-600" />
            Matriks Kesiapan Saksi & Kekuatan Suara TPS
          </h3>
          <p className="text-xs text-slate-500">
            Monitoring penetrasi suara, 15 TPS Lokasi Khusus (Loksus), dan kesiapan saksi mandat bilik TPS Dapil {activeDapil.replace('DAPIL_', '')}.
          </p>
        </div>

        {/* Status Tabs */}
        <div className="inline-flex flex-wrap bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-bold gap-1">
          <button
            onClick={() => setTpsStatusFilter('ALL')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              tpsStatusFilter === 'ALL' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Semua ({tpsStats.total})
          </button>
          <button
            onClick={() => setTpsStatusFilter('LOKSUS')}
            className={`px-2.5 py-1.5 rounded-lg transition-all cursor-pointer ${
              tpsStatusFilter === 'LOKSUS' ? 'bg-purple-600 text-white shadow-xs' : 'text-purple-700 hover:text-purple-900 bg-purple-50'
            }`}
          >
            🏢 Loksus ({tpsStats.loksus || 0})
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
              filteredTpsList.slice(0, 25).map((tps) => (
                <tr key={tps.id} className={`transition-colors ${tps.isLoksus ? 'bg-purple-50/40 hover:bg-purple-50/70' : 'hover:bg-slate-50/80'}`}>
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-1.5">
                      <span className="font-extrabold text-slate-900">{tps.nomorTps}</span>
                      {tps.isLoksus && (
                        <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-purple-100 text-purple-800 border border-purple-200">
                          LOKSUS
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-500">
                      {tps.loksusName ? `${tps.loksusName} • ` : ''}{tps.desa}, Kec. {tps.kecamatan}
                    </div>
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
                        onClick={() => onNavigateModule?.('user_relawan', tps.desa)}
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
        <span>Menampilkan {Math.min(25, filteredTpsList.length)} dari {filteredTpsList.length} TPS terdata (Termasuk 15 TPS Loksus KPU)</span>
        <span className="font-semibold text-slate-700">Dapil Ponorogo: 6 Dapil Resmi DPRD</span>
      </div>
    </div>
  );
}
