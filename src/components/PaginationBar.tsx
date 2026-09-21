import React from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  ChevronsLeft, 
  ChevronsRight 
} from 'lucide-react';

interface PaginationBarProps {
  currentPage: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  pageSizeOptions?: number[];
  serverTotalCount?: number | null;
}

export const PaginationBar: React.FC<PaginationBarProps> = ({
  currentPage,
  totalItems,
  pageSize,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 25, 50, 100],
  serverTotalCount = null
}) => {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const safeCurrentPage = Math.min(Math.max(1, currentPage), totalPages);

  const startEntry = totalItems === 0 ? 0 : (safeCurrentPage - 1) * pageSize + 1;
  const endEntry = Math.min(safeCurrentPage * pageSize, totalItems);

  // Generate page numbers with ellipsis
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible + 2) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);
      
      let leftBound = Math.max(2, safeCurrentPage - 1);
      let rightBound = Math.min(totalPages - 1, safeCurrentPage + 1);

      if (safeCurrentPage <= 3) {
        rightBound = 4;
      } else if (safeCurrentPage >= totalPages - 2) {
        leftBound = totalPages - 3;
      }

      if (leftBound > 2) {
        pages.push('...');
      }

      for (let i = leftBound; i <= rightBound; i++) {
        pages.push(i);
      }

      if (rightBound < totalPages - 1) {
        pages.push('...');
      }

      pages.push(totalPages);
    }
    return pages;
  };

  return (
    <div 
      id="pagination-control-bar"
      className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white px-4 py-3 sm:px-6 rounded-2xl border border-slate-200 shadow-xs select-none"
    >
      {/* 1. Showing entries counter */}
      <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 order-2 sm:order-1">
        <span>
          Menampilkan <strong className="text-slate-800 font-semibold">{startEntry}</strong>–<strong className="text-slate-800 font-semibold">{endEntry}</strong> dari{' '}
          <strong className="text-slate-900 font-bold">{totalItems.toLocaleString('id-ID')}</strong> data
          {serverTotalCount !== null && serverTotalCount > totalItems && (
            <span className="text-slate-400 font-normal"> (dari {serverTotalCount.toLocaleString('id-ID')} total cloud)</span>
          )}
        </span>

        <span className="hidden sm:inline-block text-slate-300">•</span>

        {/* Page size dropdown */}
        <div className="flex items-center gap-1.5">
          <label htmlFor="page-size-select" className="text-slate-500 text-xs">
            Baris:
          </label>
          <select
            id="page-size-select"
            value={pageSize}
            onChange={(e) => {
              onPageSizeChange(Number(e.target.value));
              onPageChange(1);
            }}
            className="bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold rounded-lg px-2.5 py-1 outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 cursor-pointer transition-colors"
          >
            {pageSizeOptions.map((opt) => (
              <option key={opt} value={opt}>
                {opt} / hal
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 2. Navigation controls */}
      <div className="flex items-center gap-1 order-1 sm:order-2">
        {/* First Page */}
        <button
          type="button"
          onClick={() => onPageChange(1)}
          disabled={safeCurrentPage <= 1}
          className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-slate-100 disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-slate-500 rounded-lg transition-colors cursor-pointer disabled:cursor-not-allowed"
          title="Halaman Pertama"
          aria-label="Halaman Pertama"
        >
          <ChevronsLeft className="w-4 h-4" />
        </button>

        {/* Previous Page */}
        <button
          type="button"
          onClick={() => onPageChange(safeCurrentPage - 1)}
          disabled={safeCurrentPage <= 1}
          className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-slate-100 disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-slate-500 rounded-lg transition-colors cursor-pointer disabled:cursor-not-allowed"
          title="Halaman Sebelumnya"
          aria-label="Halaman Sebelumnya"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {/* Numbered Page Pills */}
        <div className="flex items-center gap-1 mx-1">
          {getPageNumbers().map((p, idx) => {
            if (p === '...') {
              return (
                <span key={`ellipsis-${idx}`} className="px-1.5 py-1 text-xs text-slate-400 font-mono">
                  …
                </span>
              );
            }

            const pageNum = p as number;
            const isActive = pageNum === safeCurrentPage;

            return (
              <button
                key={`page-${pageNum}`}
                type="button"
                onClick={() => onPageChange(pageNum)}
                className={`min-w-[32px] h-8 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-xs font-bold'
                    : 'text-slate-600 hover:text-indigo-600 hover:bg-slate-100'
                }`}
              >
                {pageNum}
              </button>
            );
          })}
        </div>

        {/* Next Page */}
        <button
          type="button"
          onClick={() => onPageChange(safeCurrentPage + 1)}
          disabled={safeCurrentPage >= totalPages}
          className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-slate-100 disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-slate-500 rounded-lg transition-colors cursor-pointer disabled:cursor-not-allowed"
          title="Halaman Berikutnya"
          aria-label="Halaman Berikutnya"
        >
          <ChevronRight className="w-4 h-4" />
        </button>

        {/* Last Page */}
        <button
          type="button"
          onClick={() => onPageChange(totalPages)}
          disabled={safeCurrentPage >= totalPages}
          className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-slate-100 disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-slate-500 rounded-lg transition-colors cursor-pointer disabled:cursor-not-allowed"
          title="Halaman Terakhir"
          aria-label="Halaman Terakhir"
        >
          <ChevronsRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
