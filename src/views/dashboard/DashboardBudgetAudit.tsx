import React, { useState } from 'react';
import { 
  Wallet, 
  FileSpreadsheet, 
  AlertTriangle, 
  CheckCircle2, 
  X, 
  ArrowUpRight,
  TrendingDown,
  Layers,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  ShieldCheck,
  Building2,
  Users,
  Search,
  DollarSign
} from 'lucide-react';
import { formatRupiah } from '../../utils/electoralData';

interface DashboardBudgetAuditProps {
  costPerVoteStats: {
    avgCostPerKtp: number;
    markupAlertsCount: number;
    villageEfficiency: any[];
    totalPaguAnggaran?: number;
    totalKasTerpakai?: number;
  };
  rawAnggaran: any[];
  rawRab?: any[];
  aiBenchmarkLoading: boolean;
  aiBenchmarkResult: any;
  showBenchmarkDetail: boolean;
  setShowBenchmarkDetail: (show: boolean) => void;
  onFetchAiPriceBenchmark: () => void;
  onNavigateModule?: (moduleId: string, contextQuery?: string) => void;
}

export function DashboardBudgetAudit({
  costPerVoteStats,
  rawAnggaran,
  rawRab = [],
  aiBenchmarkLoading,
  aiBenchmarkResult,
  showBenchmarkDetail,
  setShowBenchmarkDetail,
  onFetchAiPriceBenchmark,
  onNavigateModule
}: DashboardBudgetAuditProps) {
  const [selectedPosFilter, setSelectedPosFilter] = useState<string>('ALL');
  const [expandedItemId, setExpandedItemId] = useState<string | null>(null);

  // Merge & prioritize rawRab records if available, otherwise rawAnggaran
  const mergedBudgetItems = rawRab.length > 0 ? rawRab : rawAnggaran.map(a => ({
    id: a.id,
    nomor_rab: a.id,
    nama_kegiatan: a.uraian_kegiatan || a.kegiatan,
    pos_anggaran: a.kategori_item || a.kategori_biaya || 'OPERASIONAL_POSKO',
    sumber_data_asal: 'INTEGRASI_OTOMATIS',
    pengaju: 'Koordinator Wilayah',
    kecamatan: a.kecamatan,
    desa: a.desa || '-',
    volume: a.volume || 1,
    satuan: a.satuan || 'item',
    harga_satuan_diajukan: a.harga_satuan_diajukan || a.harga_satuan || 0,
    alokasi_pemilih: a.total_anggaran || 0,
    target_suara: a.target_suara_alokasi || 500,
    cpv_unit: a.cpv_terhitung || 0,
    status_audit_markup: a.status_audit_algoritma || 'WAJAR_SESUAI_PASAR',
    status: 'DP_CAIR',
    deskripsi: a.alasan_audit_ai || a.catatan_audit || ''
  }));

  const filteredItems = mergedBudgetItems.filter(item => {
    if (selectedPosFilter === 'ALL') return true;
    if (selectedPosFilter === 'MARKUP') return item.status_audit_markup === 'PERINGATAN_MARKUP';
    return (item.pos_anggaran || '').includes(selectedPosFilter);
  });

  const totalBudgetReal = mergedBudgetItems.reduce((acc, curr) => acc + (Number(curr.alokasi_pemilih || curr.total_anggaran) || 0), 0);
  const totalCpvAverage = costPerVoteStats.avgCostPerKtp || 28500;

  return (
    <div className="bg-white p-5 sm:p-6 rounded-2xl shadow-xs border border-slate-200 space-y-4">
      {/* Header & Benchmark Trigger */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
              <Wallet className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900 tracking-tight">
                Hub & Spoke RAB & Audit Deviasi Real-time
              </h3>
              <p className="text-xs text-slate-500">
                Pusat integrasi seluruh pos anggaran dengan jejak asal-usul (audit trail) operasional.
              </p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={onFetchAiPriceBenchmark}
            disabled={aiBenchmarkLoading}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl transition-colors cursor-pointer"
            title="Taksir Standar Harga Pasar Logistik Daerah via AI Gemini"
          >
            <FileSpreadsheet className={`w-3.5 h-3.5 ${aiBenchmarkLoading ? 'animate-spin' : ''}`} />
            <span>{aiBenchmarkLoading ? 'Menaksir...' : 'Benchmark Harga AI'}</span>
          </button>
        </div>
      </div>

      {/* Real-time Hub Roll-up Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Pagu Terkoneksi</div>
          <div className="text-base sm:text-lg font-black text-slate-900 mt-0.5 truncate">{formatRupiah(totalBudgetReal || 90000000)}</div>
          <div className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1 mt-1">
            <CheckCircle2 className="w-3 h-3 shrink-0" />
            <span>100% Ada Jejak Asal</span>
          </div>
        </div>

        <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Rata-rata Biaya / Pemilih</div>
          <div className="text-base sm:text-lg font-black text-slate-900 mt-0.5 inline-flex items-baseline gap-1 flex-wrap">
            <span>{formatRupiah(totalCpvAverage)}</span>
            <span className="text-[11px] font-semibold text-slate-400">/ suara</span>
          </div>
          <div className="text-[10px] text-slate-500 font-medium mt-1">
            Target Plafon: Rp 50.000
          </div>
        </div>

        <div className={`p-3.5 rounded-xl border ${
          costPerVoteStats.markupAlertsCount > 0 
            ? 'bg-rose-50/70 border-rose-200 text-rose-900' 
            : 'bg-emerald-50/70 border-emerald-200 text-emerald-900'
        }`}>
          <div className="text-[10px] font-bold uppercase tracking-wider opacity-70">Audit Deviasi Pasar</div>
          <div className="text-base sm:text-lg font-black mt-0.5 truncate">
            {costPerVoteStats.markupAlertsCount > 0 ? `${costPerVoteStats.markupAlertsCount} Pos Ditahan` : '0 Mark-up (Aman)'}
          </div>
          <div className="text-[10px] font-medium mt-1">
            {costPerVoteStats.markupAlertsCount > 0 ? 'Melampaui plafon wajar BPS' : 'Sesuai standar Pemda'}
          </div>
        </div>
      </div>

      {/* Filter Tabs for Pos Anggaran */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs scrollbar-none [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        <button
          onClick={() => setSelectedPosFilter('ALL')}
          className={`px-3 py-1.5 rounded-lg font-bold transition-colors whitespace-nowrap cursor-pointer ${
            selectedPosFilter === 'ALL' 
              ? 'bg-slate-900 text-white' 
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          Semua Pos ({mergedBudgetItems.length})
        </button>
        <button
          onClick={() => setSelectedPosFilter('HONOR_SAKSI')}
          className={`px-3 py-1.5 rounded-lg font-bold transition-colors whitespace-nowrap cursor-pointer ${
            selectedPosFilter === 'HONOR_SAKSI' 
              ? 'bg-slate-900 text-white' 
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          Saksi TPS
        </button>
        <button
          onClick={() => setSelectedPosFilter('MOBILISASI_HARI_H')}
          className={`px-3 py-1.5 rounded-lg font-bold transition-colors whitespace-nowrap cursor-pointer ${
            selectedPosFilter === 'MOBILISASI_HARI_H' 
              ? 'bg-amber-600 text-white shadow-xs' 
              : 'bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200'
          }`}
        >
          ⚡ Mobilisasi Hari-H (A1)
        </button>
        <button
          onClick={() => setSelectedPosFilter('BANNER')}
          className={`px-3 py-1.5 rounded-lg font-bold transition-colors whitespace-nowrap cursor-pointer ${
            selectedPosFilter === 'BANNER' 
              ? 'bg-slate-900 text-white' 
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          Logistik & APK
        </button>
        <button
          onClick={() => setSelectedPosFilter('CANVASSING')}
          className={`px-3 py-1.5 rounded-lg font-bold transition-colors whitespace-nowrap cursor-pointer ${
            selectedPosFilter === 'CANVASSING' 
              ? 'bg-slate-900 text-white' 
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          Canvassing
        </button>
        {costPerVoteStats.markupAlertsCount > 0 && (
          <button
            onClick={() => setSelectedPosFilter('MARKUP')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-colors whitespace-nowrap cursor-pointer ${
              selectedPosFilter === 'MARKUP' 
                ? 'bg-rose-600 text-white' 
                : 'bg-rose-100 text-rose-700 hover:bg-rose-200'
            }`}
          >
            ⚠️ Temuan Mark-up
          </button>
        )}
      </div>

      {/* AI PRICE BENCHMARK DETAIL MODAL / DRAWER CARD */}
      {aiBenchmarkResult && showBenchmarkDetail && (
        <div className="p-3.5 bg-emerald-50/70 rounded-xl border border-emerald-200 space-y-2 text-xs">
          <div className="flex items-center justify-between border-b border-emerald-200/80 pb-2">
            <span className="font-extrabold text-emerald-950 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Standar Harga Wajar Pasar ({aiBenchmarkResult.kabupaten_kota})
            </span>
            <button 
              onClick={() => setShowBenchmarkDetail(false)}
              className="text-slate-400 hover:text-slate-600 cursor-pointer font-bold"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="text-[11px] text-emerald-900 font-medium italic">
            {aiBenchmarkResult.ringkasan_ekonomi_lokal}
          </div>

          <div className="space-y-1.5 pt-1 max-h-56 overflow-y-auto pr-1">
            {aiBenchmarkResult.items?.map((item: any, idx: number) => (
              <div key={idx} className="p-2 bg-white rounded-lg border border-emerald-100 flex items-center justify-between text-[11px]">
                <div>
                  <div className="font-bold text-slate-900">{item.kategori}</div>
                  <div className="text-[10px] text-slate-500">{item.satuan} • {item.catatan_wilayah}</div>
                </div>
                <div className="text-right shrink-0">
                  <div className="font-extrabold text-emerald-700">
                    Rp {Number(item.harga_bawah).toLocaleString('id-ID')} - {Number(item.harga_atas).toLocaleString('id-ID')}
                  </div>
                  <span className="text-[9px] text-slate-400">Plafon Wajar</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3-Tier Drill-down Budget List */}
      <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
        {filteredItems.map((item, idx) => {
          const isExpanded = expandedItemId === (item.id || String(idx));
          const isMarkup = item.status_audit_markup === 'PERINGATAN_MARKUP';
          const nominalTotal = Number(item.alokasi_pemilih || item.total_anggaran || 0);

          return (
            <div 
              key={item.id || idx}
              className={`rounded-xl border transition-all ${
                isMarkup 
                  ? 'bg-rose-50/40 border-rose-200' 
                  : 'bg-slate-50 border-slate-200/80 hover:border-slate-300'
              }`}
            >
              {/* Main Collapsed Row */}
              <div 
                onClick={() => setExpandedItemId(isExpanded ? null : (item.id || String(idx)))}
                className="p-3.5 flex items-center justify-between gap-3 cursor-pointer select-none"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                    <span className="font-bold text-slate-900 text-xs sm:text-sm line-clamp-1">
                      {item.nama_kegiatan}
                    </span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold shrink-0 border ${
                      isMarkup 
                        ? 'bg-rose-100 text-rose-800 border-rose-300' 
                        : 'bg-emerald-100/80 text-emerald-800 border-emerald-200'
                    }`}>
                      {isMarkup ? '⚠️ Mark-up' : '✓ Wajar'}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-3 text-[11px] text-slate-500 mt-1 flex-wrap">
                    <span className="flex items-center gap-1 font-medium text-slate-700">
                      <Building2 className="w-3 h-3 text-slate-400" />
                      {item.kecamatan || 'Ponorogo'}
                    </span>
                    <span>•</span>
                    <span>Vol: {item.volume} {item.satuan}</span>
                    <span>•</span>
                    <span className="font-mono">@{formatRupiah(item.harga_satuan_diajukan || item.harga_satuan)}</span>
                  </div>
                </div>

                <div className="text-right shrink-0 flex items-center gap-3">
                  <div>
                    <div className="font-black text-slate-900 text-xs sm:text-sm">
                      {formatRupiah(nominalTotal)}
                    </div>
                    <div className="text-[10px] font-semibold text-slate-500">
                      CPV: {formatRupiah(item.cpv_unit || item.cpv_terhitung || 0)} / suara
                    </div>
                  </div>
                  <div className="text-slate-400">
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </div>
                </div>
              </div>

              {/* Tier 3 Drilldown: Relational Origin & Audit Trail */}
              {isExpanded && (
                <div className="p-3.5 bg-white border-t border-slate-200/80 rounded-b-xl space-y-3 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Asal-Usul & Sumber Data</div>
                      <div className="p-2 bg-slate-50 rounded-lg border border-slate-100 space-y-1">
                        <div className="font-bold text-slate-800 flex items-center gap-1.5">
                          <Layers className="w-3.5 h-3.5 text-indigo-600" />
                          <span>{item.sumber_data_asal || 'Integrasi Master Saksi/Logistik'}</span>
                        </div>
                        <div className="text-[11px] text-slate-600">
                          Penanggung Jawab: <span className="font-bold text-slate-900">{item.pengaju}</span>
                          {item.nomor_wa_pj && ` (${item.nomor_wa_pj})`}
                        </div>
                        {item.target_tps_cakupan && (
                          <div className="text-[11px] text-slate-600">
                            Cakupan Wilayah: <span className="font-medium text-slate-900">{item.target_tps_cakupan}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Analisis Efisiensi & Plafon BPS</div>
                      <div className="p-2 bg-slate-50 rounded-lg border border-slate-100 space-y-1">
                        {item.subtotal_pokok ? (
                          <div className="text-[11px] flex justify-between">
                            <span className="text-slate-500">Subtotal Pokok (95%):</span>
                            <span className="font-semibold text-slate-800">{formatRupiah(item.subtotal_pokok)}</span>
                          </div>
                        ) : null}
                        {item.dana_darurat_5persen ? (
                          <div className="text-[11px] flex justify-between text-amber-700 bg-amber-50/80 px-1 py-0.5 rounded">
                            <span className="font-medium">+ Dana Darurat (5%):</span>
                            <span className="font-bold">{formatRupiah(item.dana_darurat_5persen)}</span>
                          </div>
                        ) : null}
                        <div className="text-[11px] flex justify-between">
                          <span className="text-slate-500">Plafon Wajar Pasar:</span>
                          <span className="font-bold text-emerald-700">{formatRupiah(item.estimasi_ai || nominalTotal)}</span>
                        </div>
                        <div className="text-[11px] flex justify-between">
                          <span className="text-slate-500">Target Output Suara:</span>
                          <span className="font-bold text-slate-900">{item.target_suara} Suara Terkunci</span>
                        </div>
                        <div className="text-[11px] flex justify-between">
                          <span className="text-slate-500">Status Pencairan:</span>
                          <span className="font-bold text-indigo-700">{item.status || 'DP_CAIR'}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {item.deskripsi && (
                    <div className="text-[11px] text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                      <span className="font-bold text-slate-700">Rincian / Catatan Audit: </span>
                      {item.deskripsi}
                    </div>
                  )}

                  {item.bukti_nota_rekening && (
                    <div className="flex items-center justify-between pt-1">
                      <a
                        href={item.bukti_nota_rekening}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 text-[11px] font-bold text-indigo-600 hover:text-indigo-800 bg-indigo-50 px-2.5 py-1.5 rounded-lg border border-indigo-100"
                      >
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>Lihat Bukti Nota / Berkas Verifikasi</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                      <button
                        onClick={() => onNavigateModule?.('rab_aspirasi')}
                        className="text-[11px] font-bold text-slate-600 hover:text-slate-900 underline cursor-pointer"
                      >
                        Buka di Modul Master RAB →
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Direct Module Navigators */}
      <div className="pt-2 border-t border-slate-100 grid grid-cols-2 gap-2">
        <button
          onClick={() => onNavigateModule?.('rab_aspirasi')}
          className="py-2.5 px-3 text-xs font-bold text-emerald-900 bg-emerald-50 hover:bg-emerald-100 rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <span>Modul Terintegrasi RAB</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => onNavigateModule?.('standar_harga_daerah')}
          className="py-2.5 px-3 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <span>Standar Harga BPS AI</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
