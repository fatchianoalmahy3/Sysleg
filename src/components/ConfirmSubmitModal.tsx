import React from 'react';
import { Save, AlertCircle, CheckCircle2, Loader2, Database, ShieldCheck, X } from 'lucide-react';

export interface SummaryField {
  label: string;
  value: any;
}

interface ConfirmSubmitModalProps {
  isOpen: boolean;
  isEditMode: boolean;
  moduleTitle: string;
  summaryFields: SummaryField[];
  isSaving: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmSubmitModal({
  isOpen,
  isEditMode,
  moduleTitle,
  summaryFields,
  isSaving,
  onConfirm,
  onCancel,
}: ConfirmSubmitModalProps) {
  if (!isOpen) return null;

  return (
    <div 
      id="confirm-submit-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs transition-opacity duration-200"
      onClick={isSaving ? undefined : onCancel}
    >
      <div 
        id="confirm-submit-modal"
        className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full overflow-hidden transition-all duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-6 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex items-start justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-400 shadow-xs">
              <Database className="w-5 h-5 text-indigo-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono uppercase tracking-widest text-indigo-300 font-bold">
                  Verifikasi Database
                </span>
                <span className="text-[10px] bg-indigo-500/30 text-indigo-200 px-2 py-0.5 rounded-full font-bold">
                  {moduleTitle}
                </span>
              </div>
              <h3 className="text-lg font-black text-white tracking-tight mt-0.5">
                {isEditMode ? 'Konfirmasi Perubahan Data' : 'Konfirmasi Entri Baru'}
              </h3>
            </div>
          </div>
          {!isSaving && (
            <button
              onClick={onCancel}
              className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Modal Content & Summary */}
        <div className="p-6 space-y-4">
          <p className="text-xs text-slate-600 leading-relaxed">
            Harap pastikan data yang Anda masukkan telah valid. Data akan langsung diverifikasi dan disimpan ke <strong>Cloud Firestore Database</strong>.
          </p>

          {/* Key Field Summary Box */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2.5">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 pb-1 border-b border-slate-200/60 flex items-center justify-between">
              <span>Ringkasan Data Entri</span>
              <span className="text-indigo-600 font-mono">Pratinjau</span>
            </div>
            
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {summaryFields.length > 0 ? (
                summaryFields.map((field, idx) => (
                  <div key={idx} className="flex items-start justify-between gap-3 text-xs">
                    <span className="text-slate-500 font-medium shrink-0 max-w-[40%] truncate">
                      {field.label}:
                    </span>
                    <span className="font-bold text-slate-900 text-right truncate">
                      {field.value !== undefined && field.value !== null && field.value !== ''
                        ? String(field.value)
                        : '-'}
                    </span>
                  </div>
                ))
              ) : (
                <div className="text-xs text-slate-400 italic text-center py-2">
                  Tidak ada field ringkasan
                </div>
              )}
            </div>
          </div>

          {/* Verification Protocol Notice */}
          <div className="flex items-start gap-2.5 p-3.5 bg-indigo-50/60 rounded-xl border border-indigo-100 text-xs text-indigo-900">
            <ShieldCheck className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
            <div className="text-[11px] leading-relaxed">
              <span className="font-bold">Standarisasi Transaksi:</span> Notifikasi konfirmasi berhasil (Toast) baru akan dimunculkan setelah server Cloud Database merespons verifikasi penyimpanan.
            </div>
          </div>
        </div>

        {/* Modal Action Buttons */}
        <div className="p-4 sm:p-6 bg-slate-50/80 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-end gap-3">
          <button
            type="button"
            id="btn-confirm-cancel"
            onClick={onCancel}
            disabled={isSaving}
            className="w-full sm:w-auto px-5 py-2.5 text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-200/70 border border-slate-300 rounded-xl transition-all cursor-pointer min-h-[42px] disabled:opacity-50"
          >
            Periksa Kembali
          </button>

          <button
            type="button"
            id="btn-confirm-save-db"
            onClick={onConfirm}
            disabled={isSaving}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 rounded-xl shadow-md shadow-indigo-600/20 transition-all cursor-pointer min-h-[42px] disabled:opacity-75"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-white" />
                <span>Menyimpan ke Database...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Ya, Simpan ke Database</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
