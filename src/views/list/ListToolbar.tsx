import React from 'react';
import { 
  Search, 
  X, 
  SlidersHorizontal, 
  FileSpreadsheet, 
  Printer, 
  FileText, 
  Table as TableIcon, 
  LayoutGrid, 
  RefreshCw, 
  RotateCcw 
} from 'lucide-react';
import { ModuleSchema } from '../../core/types';
import { FilterState } from '../../components/FilterModal';

interface ListToolbarProps {
  schema: ModuleSchema;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  activeFilterCount: number;
  activeFilters: FilterState;
  onOpenFilterModal: () => void;
  onQuickExport: () => void;
  onPrintClick: () => void;
  onImportExportClick: () => void;
  viewMode: 'table' | 'cards';
  setViewMode: (mode: 'table' | 'cards') => void;
  onRefresh: () => void;
  loading: boolean;
  onRemoveCategoryChip: (fieldKey: string, val: string) => void;
  onRemoveNumberRangeChip: (fieldKey: string, type: 'min' | 'max') => void;
  onRemoveSortChip: () => void;
  onResetAllFilters: () => void;
}

export const ListToolbar: React.FC<ListToolbarProps> = ({
  schema,
  searchQuery,
  onSearchChange,
  activeFilterCount,
  activeFilters,
  onOpenFilterModal,
  onQuickExport,
  onPrintClick,
  onImportExportClick,
  viewMode,
  setViewMode,
  onRefresh,
  loading,
  onRemoveCategoryChip,
  onRemoveNumberRangeChip,
  onRemoveSortChip,
  onResetAllFilters
}) => {
  return (
    <div className="bg-white p-3 sm:p-3.5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-2.5">
        {/* Left: Integrated Search & Filter Modal Trigger */}
        <div className="flex items-center gap-2 flex-1">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder={`Cari data ${schema.title.toLowerCase()}...`}
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-10 pr-9 py-2.5 text-xs bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:bg-white rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-100 transition-all font-medium text-slate-900"
            />
            {searchQuery && (
              <button 
                type="button"
                onClick={() => onSearchChange('')}
                className="absolute right-3 top-2.5 text-xs font-bold text-slate-400 hover:text-slate-600 p-0.5 rounded-full hover:bg-slate-200 cursor-pointer"
                title="Hapus pencarian"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={onOpenFilterModal}
            className={`inline-flex items-center justify-center gap-2 px-3.5 py-2.5 text-xs font-bold rounded-xl border transition-all cursor-pointer min-h-[42px] shrink-0 ${
              activeFilterCount > 0
                ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm shadow-indigo-600/20'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            }`}
            title="Buka Filter Data & Pengurutan"
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span>Filter</span>
            {activeFilterCount > 0 && (
              <span className="px-1.5 py-0.2 text-[10px] font-black bg-white text-indigo-600 rounded-full">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>

        {/* Right: Consolidated Action Controls */}
        <div className="flex items-center justify-end gap-1.5 flex-wrap sm:flex-nowrap shrink-0">
          <button
            type="button"
            onClick={onQuickExport}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 hover:text-emerald-700 bg-slate-50 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-200 rounded-xl transition-colors cursor-pointer min-h-[42px]"
            title="Ekspor Data ke Excel (.xlsx)"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span className="hidden sm:inline">Excel</span>
          </button>

          <button
            type="button"
            onClick={onPrintClick}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl transition-colors cursor-pointer min-h-[42px]"
            title="Cetak Laporan / Simpan PDF"
          >
            <Printer className="w-4 h-4 text-slate-500" />
            <span className="hidden sm:inline">Cetak</span>
          </button>

          <button
            type="button"
            onClick={onImportExportClick}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-indigo-700 hover:text-indigo-900 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-xl transition-colors cursor-pointer min-h-[42px]"
            title="Pusat Impor & Ekspor Lengkap"
          >
            <FileText className="w-4 h-4 text-indigo-600" />
            <span className="hidden sm:inline">Hub</span>
          </button>

          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                viewMode === 'table'
                  ? 'bg-white text-indigo-600 shadow-xs font-bold'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
              title="Tampilan Tabel"
            >
              <TableIcon className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('cards')}
              className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                viewMode === 'cards'
                  ? 'bg-white text-indigo-600 shadow-xs font-bold'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
              title="Tampilan Kartu"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>

          <button
            type="button"
            onClick={onRefresh}
            disabled={loading}
            className="p-2.5 text-slate-600 hover:text-indigo-600 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-200 transition-colors cursor-pointer min-h-[42px] min-w-[42px] flex items-center justify-center"
            title="Segarkan Data"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-indigo-600' : ''}`} />
          </button>
        </div>
      </div>

      {/* Active Filter Chips & Clear All */}
      {(activeFilterCount > 0 || searchQuery) && (
        <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center gap-1.5">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1">
            Filter Aktif:
          </span>

          {searchQuery && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
              Pencarian: "{searchQuery}"
              <button
                type="button"
                onClick={() => onSearchChange('')}
                className="hover:text-rose-600 ml-0.5 cursor-pointer"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {activeFilters.sortBy && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
              Urut: {schema.fields.find(f => f.key === activeFilters.sortBy)?.label || activeFilters.sortBy} ({activeFilters.sortOrder === 'desc' ? 'Z-A / Maks' : 'A-Z / Min'})
              <button
                type="button"
                onClick={onRemoveSortChip}
                className="hover:text-rose-600 ml-0.5 cursor-pointer"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {Object.keys(activeFilters.categories).map((fieldKey) => {
            const vals = activeFilters.categories[fieldKey];
            const fieldLabel = schema.fields.find(f => f.key === fieldKey)?.label || fieldKey;
            if (!Array.isArray(vals)) return null;
            return vals.map((val: string) => (
              <span key={`${fieldKey}-${val}`} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
                {fieldLabel}: {val}
                <button
                  type="button"
                  onClick={() => onRemoveCategoryChip(fieldKey, val)}
                  className="hover:text-rose-600 ml-0.5 cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ));
          })}

          {Object.keys(activeFilters.numberRanges).map((fieldKey) => {
            const range = activeFilters.numberRanges[fieldKey];
            if (!range) return null;
            const fieldLabel = schema.fields.find(f => f.key === fieldKey)?.label || fieldKey;
            const chips = [];
            if (range.min !== undefined && range.min !== '') {
              chips.push(
                <span key={`${fieldKey}-min`} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Min {fieldLabel}: {Number(range.min).toLocaleString('id-ID')}
                  <button
                    type="button"
                    onClick={() => onRemoveNumberRangeChip(fieldKey, 'min')}
                    className="hover:text-rose-600 ml-0.5 cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              );
            }
            if (range.max !== undefined && range.max !== '') {
              chips.push(
                <span key={`${fieldKey}-max`} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Maks {fieldLabel}: {Number(range.max).toLocaleString('id-ID')}
                  <button
                    type="button"
                    onClick={() => onRemoveNumberRangeChip(fieldKey, 'max')}
                    className="hover:text-rose-600 ml-0.5 cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              );
            }
            return chips;
          })}

          <button
            type="button"
            onClick={onResetAllFilters}
            className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-600 hover:text-rose-700 px-2 py-1 rounded-lg hover:bg-rose-50 transition-colors ml-auto cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset Semua Filter</span>
          </button>
        </div>
      )}
    </div>
  );
};
