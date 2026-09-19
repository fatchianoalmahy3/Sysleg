import React from 'react';
import { Eye, Edit3, Trash2, ArrowUp, ArrowDown, ArrowUpDown } from 'lucide-react';
import { ModuleSchema, FieldSchema } from '../../core/types';
import { FieldRenderer } from '../../core/formatters';

interface ListTableViewProps {
  schema: ModuleSchema;
  visibleFields: FieldSchema[];
  data: any[];
  canWrite: boolean;
  activeFilters: { sortBy?: string; sortOrder?: 'asc' | 'desc' };
  onHeaderSortClick: (fieldKey: string) => void;
  onDetailClick: (item: any) => void;
  onEditClick: (item: any) => void;
  onDeleteClick: (id: string) => void;
}

export const ListTableView: React.FC<ListTableViewProps> = ({
  visibleFields,
  data,
  canWrite,
  activeFilters,
  onHeaderSortClick,
  onDetailClick,
  onEditClick,
  onDeleteClick
}) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/80 border-b border-slate-200 select-none">
              <th className="px-5 py-3.5 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider w-12">
                #
              </th>
              {visibleFields.map((field) => {
                const isSorted = activeFilters.sortBy === field.key;
                const isSortable = ['text', 'number', 'select', 'date', 'email', 'phone', 'boolean'].includes(field.type);
                return (
                  <th 
                    key={field.key} 
                    onClick={() => isSortable && onHeaderSortClick(field.key)}
                    className={`px-5 py-3.5 text-[10px] font-extrabold uppercase tracking-wider ${
                      isSortable ? 'cursor-pointer hover:bg-slate-100/70 transition-colors' : ''
                    } ${isSorted ? 'text-indigo-600' : 'text-slate-500'}`}
                  >
                    <div className="flex items-center gap-1.5">
                      <span>{field.label}</span>
                      {isSortable && (
                        isSorted ? (
                          activeFilters.sortOrder === 'desc' ? (
                            <ArrowDown className="w-3 h-3 text-indigo-600" />
                          ) : (
                            <ArrowUp className="w-3 h-3 text-indigo-600" />
                          )
                        ) : (
                          <ArrowUpDown className="w-3 h-3 text-slate-300 opacity-0 group-hover:opacity-100" />
                        )
                      )}
                    </div>
                  </th>
                );
              })}
              <th className="px-5 py-3.5 text-right text-[10px] font-extrabold text-slate-400 uppercase tracking-wider w-32">
                Aksi
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {data.map((item, idx) => (
              <tr 
                key={item.id || idx}
                className="hover:bg-indigo-50/30 transition-colors group cursor-pointer"
                onClick={() => onDetailClick(item)}
              >
                <td className="px-5 py-4 text-xs font-mono text-slate-400">
                  {idx + 1}
                </td>
                {visibleFields.map((field) => (
                  <td key={field.key} className="px-5 py-4 whitespace-nowrap">
                    <FieldRenderer field={field} value={item[field.key]} mode="table" />
                  </td>
                ))}
                <td className="px-5 py-4 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center justify-end gap-1">
                    <button
                      type="button"
                      onClick={() => onDetailClick(item)}
                      className="p-1.5 hover:bg-indigo-50 text-slate-400 hover:text-indigo-600 rounded-lg transition-colors cursor-pointer"
                      title="Buka Halaman Detail"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    {canWrite && (
                      <>
                        <button
                          type="button"
                          onClick={() => onEditClick(item)}
                          className="p-1.5 hover:bg-amber-50 text-slate-400 hover:text-amber-600 rounded-lg transition-colors cursor-pointer"
                          title="Edit Data"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onDeleteClick(item.id)}
                          className="p-1.5 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-lg transition-colors cursor-pointer"
                          title="Hapus Data"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
