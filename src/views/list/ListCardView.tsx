import React from 'react';
import { Edit3, Trash2 } from 'lucide-react';
import { ModuleSchema, FieldSchema } from '../../core/types';
import { FieldRenderer } from '../../core/formatters';

interface ListCardViewProps {
  schema: ModuleSchema;
  visibleFields: FieldSchema[];
  data: any[];
  canWrite: boolean;
  onDetailClick: (item: any) => void;
  onEditClick: (item: any) => void;
  onDeleteClick: (id: string) => void;
}

export const ListCardView: React.FC<ListCardViewProps> = ({
  visibleFields,
  data,
  canWrite,
  onDetailClick,
  onEditClick,
  onDeleteClick
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {data.map((item, idx) => {
        const cardTitle = item.nama_lengkap || item.nama_caleg || item.nama || item.nama_kegiatan || item.nama_barang || item.name || item.customer_name || item.action || `Entri #${idx + 1}`;
        const cardBadge = item.status_verifikasi || item.status || item.role || item.status_audit || item.category || item.department || item.payment_status;
        const photoUrl = typeof item.foto_ktp === 'string' && item.foto_ktp.startsWith('http') ? item.foto_ktp : (typeof item.foto === 'string' && item.foto.startsWith('http') ? item.foto : null);
        const waNumber = item.nomor_wa || item.no_wa || item.telepon;

        return (
          <div 
            key={item.id || idx}
            onClick={() => onDetailClick(item)}
            className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs hover:shadow-md hover:border-indigo-300 transition-all cursor-pointer flex flex-col justify-between space-y-3.5"
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-3">
                <div className="flex items-start gap-3 min-w-0">
                  {photoUrl && (
                    <img 
                      src={photoUrl} 
                      alt="Thumbnail" 
                      referrerPolicy="no-referrer"
                      className="w-10 h-10 rounded-xl object-cover border border-slate-200 shrink-0" 
                    />
                  )}
                  <div className="min-w-0">
                    <span className="text-[10px] font-mono font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md inline-block">
                      #{idx + 1} • {String(item.id).substring(0, 8)}
                    </span>
                    <h3 className="text-sm font-bold text-slate-900 mt-1 line-clamp-1 truncate">
                      {cardTitle}
                    </h3>
                  </div>
                </div>
                {cardBadge && (
                  <span className="text-[10px] font-bold px-2 py-0.5 bg-slate-100 text-slate-700 rounded-full shrink-0">
                    {cardBadge}
                  </span>
                )}
              </div>

              <div className="space-y-2 text-xs">
                {visibleFields.slice(0, 4).map((f) => (
                  <div key={f.key} className="flex items-center justify-between gap-2 text-xs">
                    <span className="text-slate-400 font-medium shrink-0">{f.label}:</span>
                    <div className="text-right truncate">
                      <FieldRenderer field={f} value={item[f.key]} mode="table" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center gap-2">
                <span 
                  className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer py-1"
                  onClick={() => onDetailClick(item)}
                >
                  Lihat Detail →
                </span>
                {waNumber && (
                  <a
                    href={`https://wa.me/${String(waNumber).replace(/[^0-9]/g, '')}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[10px] font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-2 py-0.5 rounded-lg border border-emerald-200 flex items-center gap-1"
                    title="Chat WhatsApp Langsung"
                  >
                    WA
                  </a>
                )}
              </div>
              <div className="flex items-center gap-1">
                {canWrite && (
                  <>
                    <button
                      type="button"
                      onClick={() => onEditClick(item)}
                      className="p-2 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded-xl min-w-[38px] min-h-[38px] flex items-center justify-center cursor-pointer transition-colors"
                      title="Edit Data"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onDeleteClick(item.id)}
                      className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-xl min-w-[38px] min-h-[38px] flex items-center justify-center cursor-pointer transition-colors"
                      title="Hapus Data"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
