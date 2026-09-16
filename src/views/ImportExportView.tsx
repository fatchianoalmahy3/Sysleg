import React, { useState } from 'react';
import { ModuleSchema } from '../core/types';
import { 
  ArrowLeft, 
  FileSpreadsheet, 
  Download, 
  Upload, 
  CheckCircle2, 
  AlertCircle, 
  Check, 
  FileText, 
  FileUp,
  Table as TableIcon,
  HelpCircle,
  Sparkles,
  RefreshCw,
  Database,
  Code2,
  Copy,
  Layers
} from 'lucide-react';
import { ExcelService, ParsedImportRow } from '../services/excel';
import { SqlGenerator } from '../utils/sqlGenerator';

interface ImportExportViewProps {
  schema: ModuleSchema;
  currentData: any[];
  onBack: () => void;
  onBulkImport: (items: any[]) => Promise<any>;
  userRole: string;
}

export function ImportExportView({
  schema,
  currentData,
  onBack,
  onBulkImport,
  userRole
}: ImportExportViewProps) {
  const [activeTab, setActiveTab] = useState<'import' | 'export' | 'guide' | 'sql_migration'>('import');
  
  // Import State
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [parsing, setParsing] = useState(false);
  const [importRows, setImportRows] = useState<ParsedImportRow[]>([]);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<{ total: number; success: boolean; message: string } | null>(null);

  // Export State
  const [selectedFields, setSelectedFields] = useState<string[]>(() => schema.fields.map(f => f.key));
  const [copiedSql, setCopiedSql] = useState(false);

  const canWrite = schema.allowedRoles.includes(userRole);
  const isSuperAdmin = userRole === 'SUPER_ADMIN';

  const handleDownloadTemplate = () => {
    ExcelService.downloadTemplate(schema);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    setParsing(true);
    setImportResult(null);

    try {
      const rows = await ExcelService.parseExcelFile(file, schema);
      setImportRows(rows);
    } catch (err: any) {
      alert('Gagal membaca berkas Excel: ' + (err.message || 'Format berkas tidak didukung.'));
      setImportRows([]);
    } finally {
      setParsing(false);
    }
  };

  const handleExecuteImport = async () => {
    const validRows = importRows.filter(r => r.isValid).map(r => r.data);
    if (validRows.length === 0) {
      alert('Tidak ada baris data valid untuk diimpor. Harap periksa kembali berkas Excel Anda.');
      return;
    }

    setImporting(true);
    try {
      const result = await onBulkImport(validRows);
      setImportResult({
        total: result.totalInserted || validRows.length,
        success: true,
        message: `Berhasil mengimpor ${result.totalInserted || validRows.length} entri data ke modul ${schema.title}!`
      });
      // Clear current file
      setSelectedFile(null);
      setImportRows([]);
    } catch (err: any) {
      setImportResult({
        total: 0,
        success: false,
        message: err.message || 'Gagal melakukan import massal.'
      });
    } finally {
      setImporting(false);
    }
  };

  const handleToggleField = (key: string) => {
    if (selectedFields.includes(key)) {
      if (selectedFields.length > 1) {
        setSelectedFields(prev => prev.filter(k => k !== key));
      }
    } else {
      setSelectedFields(prev => [...prev, key]);
    }
  };

  const handleSelectAllFields = () => {
    setSelectedFields(schema.fields.map(f => f.key));
  };

  const handleCustomExport = () => {
    if (currentData.length === 0) {
      alert('Tidak ada data dalam modul untuk diekspor.');
      return;
    }

    // Filter fields schema
    const customSchema: ModuleSchema = {
      ...schema,
      fields: schema.fields.filter(f => selectedFields.includes(f.key))
    };

    ExcelService.exportToExcel(customSchema, currentData, `${schema.id}_custom`);
  };

  const handleCopySql = () => {
    const sql = SqlGenerator.generatePostgresSchema([schema]);
    navigator.clipboard.writeText(sql);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2000);
  };

  const handleDownloadFullSql = () => {
    SqlGenerator.downloadSqlFile('database_migration_schema.sql');
  };

  const validCount = importRows.filter(r => r.isValid).length;
  const invalidCount = importRows.length - validCount;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Navigation Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl border border-slate-200 transition-colors cursor-pointer min-h-[40px] min-w-[40px] flex items-center justify-center"
            title="Kembali ke Daftar"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-indigo-600">{schema.title}</span>
              <span className="text-slate-300">/</span>
              <span className="text-xs font-bold text-slate-500">Pusat Data</span>
            </div>
            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              Import, Export & SQL Engine Hub
            </h1>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 overflow-x-auto scrollbar-none">
          <button
            onClick={() => setActiveTab('import')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'import' ? 'bg-white text-indigo-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Import .xlsx
          </button>
          <button
            onClick={() => setActiveTab('export')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'export' ? 'bg-white text-indigo-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Ekspor Data
          </button>
          <button
            onClick={() => setActiveTab('guide')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'guide' ? 'bg-white text-indigo-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Format Skema
          </button>
          <button
            onClick={() => setActiveTab('sql_migration')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'sql_migration' ? 'bg-indigo-600 text-white shadow-xs' : 'text-indigo-700 hover:text-indigo-900'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>Supabase / SQL DDL</span>
          </button>
        </div>
      </div>

      {/* Success/Error Feedback Banner */}
      {importResult && (
        <div className={`p-4 rounded-2xl border flex items-center justify-between text-xs font-semibold shadow-xs ${
          importResult.success 
            ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
            : 'bg-rose-50 text-rose-800 border-rose-200'
        }`}>
          <div className="flex items-center gap-2">
            {importResult.success ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            ) : (
              <AlertCircle className="w-5 h-5 text-rose-600" />
            )}
            <span>{importResult.message}</span>
          </div>
          <button
            onClick={() => setImportResult(null)}
            className="text-slate-400 hover:text-slate-600 font-bold"
          >
            ✕
          </button>
        </div>
      )}

      {/* Tab 1: Import Excel */}
      {activeTab === 'import' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded bg-indigo-50 text-indigo-600 border border-indigo-100">
                    Langkah 1
                  </span>
                  <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                </div>
                <h3 className="text-sm font-bold text-slate-900">Unduh Format Master Excel</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Unduh template resmi berformat .xlsx yang telah disesuaikan dengan aturan validasi kolom untuk modul <strong>{schema.title}</strong>.
                </p>
              </div>

              <button
                onClick={handleDownloadTemplate}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-bold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-300 rounded-xl transition-all cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-slate-600" />
                <span>Unduh Template .xlsx</span>
              </button>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded bg-indigo-50 text-indigo-600 border border-indigo-100">
                    Langkah 2
                  </span>
                  <FileUp className="w-4 h-4 text-indigo-600" />
                </div>
                <h3 className="text-sm font-bold text-slate-900">Unggah Berkas Spreadsheet</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Pilih berkas spreadsheet hasil pengisian data yang siap diverifikasi dan disimpan ke database.
                </p>
              </div>

              <div>
                <label className="inline-flex items-center justify-center gap-2 w-full px-4 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md shadow-indigo-600/20 transition-all cursor-pointer">
                  <Upload className="w-3.5 h-3.5" />
                  <span>{selectedFile ? 'Ganti File Excel' : 'Pilih File .xlsx'}</span>
                  <input
                    type="file"
                    accept=".xlsx,.xls,.csv"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          </div>

          {parsing && (
            <div className="p-8 bg-white rounded-2xl border border-slate-200 text-center space-y-3 shadow-xs">
              <RefreshCw className="w-6 h-6 text-indigo-600 animate-spin mx-auto" />
              <div className="text-xs font-bold text-slate-700">Menganalisis & Memvalidasi Format Spreadsheet...</div>
              <p className="text-[11px] text-slate-400">Memeriksa kelengkapan kolom wajib dan tipe data...</p>
            </div>
          )}

          {importRows.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Hasil Audit & Validasi Baris Data</h3>
                  <div className="flex items-center gap-3 mt-1 text-xs">
                    <span className="text-slate-500">Total: <strong>{importRows.length}</strong></span>
                    <span className="text-emerald-600 font-bold">Valid: {validCount}</span>
                    {invalidCount > 0 && (
                      <span className="text-rose-600 font-bold">Gagal/Koreksi: {invalidCount}</span>
                    )}
                  </div>
                </div>

                <button
                  onClick={handleExecuteImport}
                  disabled={importing || validCount === 0 || !canWrite}
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 rounded-xl shadow-md shadow-emerald-600/20 transition-all cursor-pointer min-h-[40px]"
                >
                  {importing ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Check className="w-3.5 h-3.5" />
                  )}
                  <span>Simpan {validCount} Data Valid ke Cloud</span>
                </button>
              </div>

              <div className="overflow-x-auto border border-slate-200 rounded-xl max-h-80">
                <table className="w-full text-left border-collapse text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 sticky top-0 z-10">
                    <tr>
                      <th className="px-3 py-2.5 font-bold text-slate-500 uppercase text-[10px] w-14">Baris</th>
                      <th className="px-3 py-2.5 font-bold text-slate-500 uppercase text-[10px] w-24">Status</th>
                      <th className="px-3 py-2.5 font-bold text-slate-500 uppercase text-[10px]">Catatan Validasi</th>
                      <th className="px-3 py-2.5 font-bold text-slate-500 uppercase text-[10px]">Preview Nilai Input</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {importRows.map((row) => (
                      <tr key={row.rowNumber} className={row.isValid ? 'hover:bg-slate-50' : 'bg-rose-50/40'}>
                        <td className="px-3 py-2.5 font-mono text-slate-500">{row.rowNumber}</td>
                        <td className="px-3 py-2.5">
                          {row.isValid ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                              <Check className="w-3 h-3" /> Valid
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800">
                              <AlertCircle className="w-3 h-3" /> Error
                            </span>
                          )}
                        </td>
                        <td className="px-3 py-2.5 text-[11px] text-slate-600">
                          {row.errors.length > 0 ? (
                            <ul className="list-disc list-inside text-rose-600 space-y-0.5">
                              {row.errors.map((e, idx) => (
                                <li key={idx}>{e}</li>
                              ))}
                            </ul>
                          ) : (
                            <span className="text-slate-400">Siap diimpor</span>
                          )}
                        </td>
                        <td className="px-3 py-2.5 font-mono text-[10px] text-slate-500 truncate max-w-xs">
                          {JSON.stringify(row.data)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Custom Export */}
      {activeTab === 'export' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="border-b border-slate-100 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-sm font-bold text-slate-800">Kustomisasi Kolom Ekspor</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Pilih kolom mana saja yang ingin disertakan ke dalam berkas unduhan.
              </p>
            </div>
            <button
              onClick={handleSelectAllFields}
              className="text-xs font-bold text-indigo-600 hover:underline cursor-pointer self-start sm:self-auto"
            >
              Pilih Semua Kolom
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {schema.fields.map(field => {
              const isChecked = selectedFields.includes(field.key);
              return (
                <label
                  key={field.key}
                  className={`flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer select-none ${
                    isChecked ? 'bg-indigo-50/50 border-indigo-200 text-slate-900' : 'bg-slate-50 border-slate-200 text-slate-500'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => handleToggleField(field.key)}
                    className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
                  />
                  <div>
                    <span className="text-xs font-bold block">{field.label}</span>
                    <span className="text-[10px] text-slate-400 font-mono">key: {field.key}</span>
                  </div>
                </label>
              );
            })}
          </div>

          <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs text-slate-500">
              Total <strong>{currentData.length}</strong> rekaman data akan diekspor dengan <strong>{selectedFields.length}</strong> kolom.
            </div>

            <button
              onClick={handleCustomExport}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md shadow-indigo-600/20 transition-all cursor-pointer min-h-[44px]"
            >
              <Download className="w-4 h-4" />
              <span>Unduh Berkas .xlsx Sekarang</span>
            </button>
          </div>
        </div>
      )}

      {/* Tab 3: Format Skema Guide */}
      {activeTab === 'guide' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-sm font-bold text-slate-800">Spesifikasi Header & Aturan Tipe Data</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Panduan pemetaan field untuk modul {schema.title} saat mempersiapkan spreadsheet Excel mandiri.
            </p>
          </div>

          <div className="overflow-x-auto border border-slate-200 rounded-xl">
            <table className="w-full text-left border-collapse text-xs">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3 font-bold text-slate-500 uppercase text-[10px]">Header Kolom Excel</th>
                  <th className="px-4 py-3 font-bold text-slate-500 uppercase text-[10px]">Key Internal</th>
                  <th className="px-4 py-3 font-bold text-slate-500 uppercase text-[10px]">Tipe Data</th>
                  <th className="px-4 py-3 font-bold text-slate-500 uppercase text-[10px]">Wajib (Required)</th>
                  <th className="px-4 py-3 font-bold text-slate-500 uppercase text-[10px]">Opsi / Format Nilai</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {schema.fields.map(f => (
                  <tr key={f.key} className="hover:bg-slate-50/50">
                    <td className="px-4 py-3 font-bold text-slate-800">{f.label}</td>
                    <td className="px-4 py-3 font-mono text-slate-500">{f.key}</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded font-mono text-[10px]">
                        {f.type}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {f.validation?.required ? (
                        <span className="text-rose-600 font-bold">Wajib</span>
                      ) : (
                        <span className="text-slate-400">Opsional</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {f.options ? f.options.join(', ') : f.type === 'number' ? 'Nilai Angka (contoh: 500000)' : 'Teks Bebas'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 4: SQL Migration & DDL Schema Engine */}
      {activeTab === 'sql_migration' && (
        <div className="bg-slate-900 rounded-3xl p-6 sm:p-8 text-white border border-indigo-500/30 shadow-xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 flex items-center gap-1">
                  <Database className="w-3 h-3 text-emerald-400" />
                  Universal PostgreSQL / Supabase Engine
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 rounded-full font-bold">
                  Zero-Code DB Migration
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white">
                Skema SQL DDL & Portabilitas Database
              </h2>
              <p className="text-xs text-slate-400">
                Skema tabel relasional PostgreSQL lengkap dengan B-Tree Index dan Row Level Security (RLS) otomatis untuk modul {schema.title}.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCopySql}
                className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl border border-slate-700 transition-colors cursor-pointer"
              >
                {copiedSql ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedSql ? 'Tersalin' : 'Salin SQL Tabel Ini'}</span>
              </button>

              <button
                onClick={handleDownloadFullSql}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-indigo-600/30 transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Unduh Full schema.sql (Seluruh Modul)</span>
              </button>
            </div>
          </div>

          {/* Code Viewer */}
          <div className="bg-slate-950 rounded-2xl p-4 border border-slate-800 font-mono text-xs text-indigo-300 overflow-x-auto max-h-80 leading-relaxed select-all">
            <pre className="text-emerald-400">
              {SqlGenerator.generatePostgresSchema([schema])}
            </pre>
          </div>

          <div className="p-4 bg-white/5 rounded-2xl border border-white/10 text-xs text-slate-300 flex items-center gap-3">
            <Sparkles className="w-5 h-5 text-amber-300 shrink-0" />
            <div>
              <strong className="text-white">Panduan Migrasi ke Supabase / PostgreSQL:</strong>
              <p className="text-slate-400 mt-0.5">
                Buka SQL Editor di Supabase Dashboard, lalu *paste* dan jalankan query di atas. Setelah itu, cukup atur konfigurasi <code>VITE_SUPABASE_URL</code> dan <code>VITE_SUPABASE_ANON_KEY</code> pada file environment tanpa perlu merombak kode frontend.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
