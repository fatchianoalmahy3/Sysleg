import React, { useState, useMemo, useEffect } from 'react';
import { ModuleSchema } from '../core/types';
import { getVisibleFields } from '../core/formatters';
import { 
  Plus, 
  RefreshCw, 
  FileText, 
  RotateCcw, 
  ChevronDown, 
  Database 
} from 'lucide-react';
import { ExcelService } from '../services/excel';
import { FilterModal, FilterState } from '../components/FilterModal';
import { ModuleStatsGrid } from '../components/ModuleStatsGrid';
import { ListToolbar } from './list/ListToolbar';
import { ListTableView } from './list/ListTableView';
import { ListCardView } from './list/ListCardView';
import { useListViewFilter } from './list/useListViewFilter';

interface ListViewProps {
  schema: ModuleSchema;
  data: any[];
  totalServerCount?: number | null;
  loading: boolean;
  loadingMore?: boolean;
  hasMore?: boolean;
  onLoadMore?: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onRefresh: () => void;
  onAddClick: () => void;
  onEditClick: (item: any) => void;
  onDetailClick: (item: any) => void;
  onDeleteClick: (id: string) => void;
  onImportExportClick: () => void;
  onPrintClick: () => void;
  userRole: string;
}

const INITIAL_FILTER_STATE: FilterState = {
  categories: {},
  numberRanges: {},
  sortBy: undefined,
  sortOrder: 'asc'
};

export function ListView({
  schema,
  data,
  totalServerCount,
  loading,
  loadingMore = false,
  hasMore = false,
  onLoadMore,
  searchQuery,
  onSearchChange,
  onRefresh,
  onAddClick,
  onEditClick,
  onDetailClick,
  onDeleteClick,
  onImportExportClick,
  onPrintClick,
  userRole
}: ListViewProps) {
  const [viewMode, setViewMode] = useState<'table' | 'cards'>(() => {
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      return 'cards';
    }
    return 'table';
  });

  // Automatically default to card view on smartphone/mobile viewport
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setViewMode('cards');
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [activeFilters, setActiveFilters] = useState<FilterState>(INITIAL_FILTER_STATE);

  const canWrite = schema.allowedRoles.includes(userRole);

  const { activeFilterCount, filteredAndSortedData } = useListViewFilter({
    schema,
    data,
    searchQuery,
    activeFilters
  });

  const handleQuickExport = () => {
    if (filteredAndSortedData.length === 0) {
      alert('Tidak ada data untuk diekspor.');
      return;
    }
    ExcelService.exportToExcel(schema, filteredAndSortedData);
  };

  const handleRemoveCategoryChip = (fieldKey: string, valueToRemove: string) => {
    setActiveFilters(prev => ({
      ...prev,
      categories: {
        ...prev.categories,
        [fieldKey]: (prev.categories[fieldKey] || []).filter(v => v !== valueToRemove)
      }
    }));
  };

  const handleRemoveNumberRangeChip = (fieldKey: string, type: 'min' | 'max') => {
    setActiveFilters(prev => ({
      ...prev,
      numberRanges: {
        ...prev.numberRanges,
        [fieldKey]: {
          ...(prev.numberRanges[fieldKey] || {}),
          [type]: ''
        }
      }
    }));
  };

  const handleRemoveSortChip = () => {
    setActiveFilters(prev => ({
      ...prev,
      sortBy: undefined,
      sortOrder: 'asc'
    }));
  };

  const handleResetAllFilters = () => {
    setActiveFilters(INITIAL_FILTER_STATE);
    onSearchChange('');
  };

  const handleHeaderSortClick = (fieldKey: string) => {
    setActiveFilters(prev => {
      if (prev.sortBy === fieldKey) {
        if (prev.sortOrder === 'asc') {
          return { ...prev, sortOrder: 'desc' };
        } else {
          return { ...prev, sortBy: undefined, sortOrder: 'asc' };
        }
      } else {
        return { ...prev, sortBy: fieldKey, sortOrder: 'asc' };
      }
    });
  };

  const visibleFields = useMemo(() => getVisibleFields(schema), [schema]);

  const createButtonLabel = useMemo(() => {
    if (schema.actionLabels?.createButton) {
      return schema.actionLabels.createButton;
    }
    const cleanTitle = schema.title
      .replace(/^Database\s+/i, '')
      .replace(/^Master\s+/i, '')
      .replace(/\s*\(.*?\)\s*/g, '')
      .trim();
    return `Tambah ${cleanTitle || 'Data'}`;
  }, [schema]);

  return (
    <div className="space-y-5">
      {/* 1. Module Header Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">{schema.title}</h1>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100 flex items-center gap-1.5">
              <span>{filteredAndSortedData.length} Data</span>
              {totalServerCount !== null && totalServerCount !== undefined && (
                <span className="text-indigo-400 font-normal">
                  / {totalServerCount.toLocaleString('id-ID')}
                </span>
              )}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 line-clamp-1">
            {schema.description || 'Kelola dan perbarui seluruh basis data operasional secara tersentralisasi.'}
          </p>
        </div>

        {/* Primary Action Button (Desktop Only) */}
        {canWrite && (
          <div className="hidden md:flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={onAddClick}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 active:scale-98 rounded-xl shadow-md shadow-indigo-600/20 hover:shadow-indigo-600/30 transition-all cursor-pointer min-h-[42px] whitespace-nowrap"
            >
              <Plus className="w-4 h-4 shrink-0" />
              <span>{createButtonLabel}</span>
            </button>
          </div>
        )}
      </div>

      {/* 1.5 Standardized 4 Statistical Cards */}
      <ModuleStatsGrid
        schema={schema}
        data={data}
        totalServerCount={totalServerCount}
        onQuickFilter={onSearchChange}
      />

      {/* 2. Unified Standard Action & Filter Toolbar */}
      <ListToolbar
        schema={schema}
        searchQuery={searchQuery}
        onSearchChange={onSearchChange}
        activeFilterCount={activeFilterCount}
        activeFilters={activeFilters}
        onOpenFilterModal={() => setIsFilterModalOpen(true)}
        onQuickExport={handleQuickExport}
        onPrintClick={onPrintClick}
        onImportExportClick={onImportExportClick}
        viewMode={viewMode}
        setViewMode={setViewMode}
        onRefresh={onRefresh}
        loading={loading}
        onRemoveCategoryChip={handleRemoveCategoryChip}
        onRemoveNumberRangeChip={handleRemoveNumberRangeChip}
        onRemoveSortChip={handleRemoveSortChip}
        onResetAllFilters={handleResetAllFilters}
      />

      {/* 3. Main Content: Table or Cards with Skeleton / Empty State */}
      {loading && filteredAndSortedData.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden p-6 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="w-2 h-2 rounded-full bg-indigo-600 animate-ping" />
              <span className="text-xs font-bold text-slate-700">Sinkronisasi Basis Data {schema.title}...</span>
            </div>
            <div className="h-4 bg-slate-100 rounded-md w-24 animate-pulse" />
          </div>
          <div className="space-y-3 pt-1">
            {[1, 2, 3, 4, 5].map((idx) => (
              <div key={idx} className="flex items-center gap-4 py-2.5 border-b border-slate-50 last:border-0 animate-pulse">
                <div className="w-6 h-3.5 bg-slate-100 rounded shrink-0" />
                <div className="w-1/4 h-3.5 bg-slate-200/80 rounded" />
                <div className="w-1/3 h-3.5 bg-slate-100 rounded" />
                <div className="w-1/6 h-3.5 bg-slate-100 rounded" />
                <div className="ml-auto w-16 h-3.5 bg-slate-100 rounded shrink-0" />
              </div>
            ))}
          </div>
        </div>
      ) : filteredAndSortedData.length === 0 ? (
        <div className="bg-white rounded-2xl border-2 border-dashed border-slate-200 p-12 text-center space-y-3 shadow-xs">
          <div className="w-12 h-12 rounded-full bg-slate-50 text-slate-400 flex items-center justify-center mx-auto">
            <FileText className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-slate-800">Tidak ada entri data yang cocok</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              {searchQuery || activeFilterCount > 0
                ? 'Tidak ditemukan entri yang sesuai dengan kriteria filter dan pencarian aktif Anda.'
                : 'Mulai dengan menambahkan data baru atau mengimpor berkas Excel.'}
            </p>
          </div>
          {(searchQuery || activeFilterCount > 0) && (
            <button
              type="button"
              onClick={handleResetAllFilters}
              className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Bersihkan Filter & Pencarian</span>
            </button>
          )}
          {canWrite && !searchQuery && activeFilterCount === 0 && (
            <button
              type="button"
              onClick={onAddClick}
              className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Data Sekarang</span>
            </button>
          )}
        </div>
      ) : viewMode === 'table' ? (
        <ListTableView
          schema={schema}
          visibleFields={visibleFields}
          data={filteredAndSortedData}
          canWrite={canWrite}
          activeFilters={activeFilters}
          onHeaderSortClick={handleHeaderSortClick}
          onDetailClick={onDetailClick}
          onEditClick={onEditClick}
          onDeleteClick={onDeleteClick}
        />
      ) : (
        <ListCardView
          schema={schema}
          visibleFields={visibleFields}
          data={filteredAndSortedData}
          canWrite={canWrite}
          onDetailClick={onDetailClick}
          onEditClick={onEditClick}
          onDeleteClick={onDeleteClick}
        />
      )}

      {/* 4. Interactive Infinite Pagination */}
      {hasMore && onLoadMore && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Database className="w-4 h-4 text-indigo-500 shrink-0" />
            <span>
              Menampilkan <strong>{data.length}</strong> dari total <strong>{totalServerCount?.toLocaleString('id-ID') || data.length}</strong> data di Firestore.
            </span>
          </div>

          <button
            type="button"
            onClick={onLoadMore}
            disabled={loadingMore}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 active:bg-indigo-200 border border-indigo-200 rounded-xl transition-all shadow-xs cursor-pointer min-h-[42px] disabled:opacity-60"
          >
            {loadingMore ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-indigo-600" />
                <span>Memuat 100 Data Berikutnya...</span>
              </>
            ) : (
              <>
                <ChevronDown className="w-4 h-4 text-indigo-600" />
                <span>Muat 100 Data Berikutnya</span>
              </>
            )}
          </button>
        </div>
      )}

      {/* 5. Mobile Floating Action Button (FAB) */}
      {canWrite && userRole !== 'relawan' && (
        <div className="fixed bottom-20 right-5 z-40 md:hidden flex items-center">
          <button
            type="button"
            onClick={onAddClick}
            id="fab-add-button"
            className="flex items-center justify-center bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white p-3.5 rounded-full shadow-xl shadow-indigo-600/40 hover:shadow-2xl transition-all duration-200 cursor-pointer border border-indigo-400/30 min-h-[52px] min-w-[52px]"
            title={createButtonLabel}
            aria-label={createButtonLabel}
          >
            <Plus className="w-6 h-6" />
          </button>
        </div>
      )}

      {/* Filter Modal Dialog Component */}
      <FilterModal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        schema={schema}
        currentFilters={activeFilters}
        onApplyFilters={(newFilters) => setActiveFilters(newFilters)}
        onResetFilters={handleResetAllFilters}
      />
    </div>
  );
}
