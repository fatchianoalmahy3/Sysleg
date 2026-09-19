import React, { useState, useEffect } from 'react';
import { ModuleSchema } from '../core/types';
import { getVisibleFields } from '../core/formatters';
import { validateRecord } from '../core/validator';
import { ArrowLeft, Save, AlertTriangle, CheckCircle2, RotateCcw, HelpCircle, Camera, Lock } from 'lucide-react';
import { MediaUploader } from '../components/MediaUploader';
import { RichTextEditor } from '../components/RichTextEditor';
import { LocationPicker } from '../components/LocationPicker';
import { RegionPicker } from '../components/RegionPicker';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { ConfirmSubmitModal } from '../components/ConfirmSubmitModal';
import { OcrScannerModal } from '../components/OcrScannerModal';
import { ACTIVE_DAPIL_CONFIG } from '../utils/dapilGuard';

interface FormViewProps {
  schema: ModuleSchema;
  initialData?: any | null;
  onSubmit: (values: Record<string, any>) => Promise<void>;
  onBack: () => void;
  loading?: boolean;
}

export function FormView({
  schema,
  initialData,
  onSubmit,
  onBack,
  loading = false
}: FormViewProps) {
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  
  const [isDirty, setIsDirty] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lockedFields, setLockedFields] = useState<string[]>([]);
  
  // OCR Scanner State
  const [isScannerOpen, setIsScannerOpen] = useState(false);

  const isEditMode = !!initialData;
  const isOcrModule = ['konstituen', 'saksi_c1'].includes(schema.id);
  
  // Step logic: If new entry for OCR modules, start at step 1. Otherwise start at step 2.
  const [formStep, setFormStep] = useState<1 | 2>(isEditMode || !isOcrModule ? 2 : 1);
  const userRole = typeof window !== 'undefined' ? localStorage.getItem('admin_active_role') || 'superadmin' : 'superadmin';
  const isRelawan = userRole === 'relawan';

  // Filter technical ID field from input fields via centralized helper
  const visibleFields = getVisibleFields(schema);

  useEffect(() => {
    const initial: Record<string, any> = {};
    const userProvinsi = localStorage.getItem("user_provinsi") || ""; 
    const userKota = localStorage.getItem("user_kota") || ""; 
    const userKecamatan = localStorage.getItem("user_kecamatan") || ""; 
    const userDesa = localStorage.getItem("user_desa") || "";
    schema.fields.forEach((field) => {
      if (initialData && initialData[field.key] !== undefined) {
        initial[field.key] = initialData[field.key];
      } else if (field.defaultValue !== undefined) {
        initial[field.key] = field.defaultValue;
      } else if (!initialData && field.key === "provinsi" && userProvinsi) { 
        initial[field.key] = userProvinsi; 
      } else if (!initialData && (field.key === "kota" || field.key === "kota_tugas") && userKota) { 
        initial[field.key] = userKota; 
      } else if (!initialData && (field.key === "kecamatan" || field.key === "kecamatan_tugas") && userKecamatan) { 
        initial[field.key] = userKecamatan; 
      } else if (!initialData && (field.key === "desa" || field.key === "desa_tugas") && userDesa) { 
        initial[field.key] = userDesa;
      } else {
        initial[field.key] = '';
      }
    });
    setFormData(initial);
    setErrors({});
    setSubmitError(null);
    setIsDirty(false);
  }, [schema, initialData]);

  const handleChange = (key: string, value: any) => {
    setFormData((prev) => {
      const next = { ...prev, [key]: value };
      if (key === "provinsi" || key === "provinsi_tugas") {
        next[key.replace("provinsi", "kota")] = "";
        next[key.replace("provinsi", "kecamatan")] = "";
        next[key.replace("provinsi", "desa")] = "";
      } else if (key === "kota" || key === "kota_tugas") {
        next[key.replace("kota", "kecamatan")] = "";
        next[key.replace("kota", "desa")] = "";
      } else if (key === "kecamatan" || key === "kecamatan_tugas") {
        next[key.replace("kecamatan", "desa")] = "";
      }

      // Automatic Calculation & Audit Engine for RAB, Anggaran, and LPJ
      if (schema.id === 'rab_aspirasi' || schema.id === 'anggaran_kampanye' || schema.id === 'lpj_kegiatan') {
        const vol = Number(next.volume) || 0;
        const harga = Number(next.harga_satuan_diajukan || next.harga_satuan) || 0;
        const targetSuara = Number(next.target_suara || next.target_suara_alokasi) || 1;
        const subtotal = vol * harga;

        if (schema.id === 'rab_aspirasi') {
          // Automatic 5% emergency buffer calculation
          const buffer5 = Math.round(subtotal * 0.05);
          const totalCairWithBuffer = subtotal + buffer5;

          next.subtotal_pokok = subtotal;
          next.dana_darurat_5persen = buffer5;
          next.alokasi_pemilih = totalCairWithBuffer;
          next.cpv_unit = targetSuara > 0 ? Math.round(totalCairWithBuffer / targetSuara) : 0;
          
          if (!next.nomor_rab || next.nomor_rab === 'RAB-AUTO') {
            const posCode = String(next.pos_anggaran || 'OPR').substring(0, 4).toUpperCase();
            next.nomor_rab = `RAB-${(next.kecamatan || 'PNG').substring(0, 3).toUpperCase()}-${posCode}-${Math.floor(100 + Math.random() * 900)}`;
          }

          // Benchmark ceiling estimate calculation
          let benchmarkPlafon = harga;
          const pos = String(next.pos_anggaran || '');
          if (pos.includes('HONOR_SAKSI')) benchmarkPlafon = 200000;
          else if (pos.includes('BANNER')) benchmarkPlafon = 18000;
          else if (pos.includes('MOBILISASI_HARI_H')) benchmarkPlafon = 50000;
          else if (pos.includes('KONSUMSI')) benchmarkPlafon = 22000;
          else if (pos.includes('TRANSPORT')) benchmarkPlafon = 60000;
          else if (pos.includes('SOUND')) benchmarkPlafon = 1000000;
          else if (pos.includes('ASPIRASI')) benchmarkPlafon = 80000;
          else benchmarkPlafon = 25000;

          next.estimasi_ai = Math.round(vol * benchmarkPlafon * 1.05); // including 5% buffer
          if (harga > benchmarkPlafon * 1.25) {
            next.status_audit_markup = 'PERINGATAN_MARKUP';
          } else if (harga > benchmarkPlafon * 1.5) {
            next.status_audit_markup = 'SANGAT_BOROS_EVALUASI';
          } else {
            next.status_audit_markup = 'WAJAR_SESUAI_PASAR';
          }
        }

        if (schema.id === 'lpj_kegiatan') {
          const danaDiterima = Number(next.dana_diterima) || 0;
          const nominalTerpakai = Number(next.nominal_terpakai) || 0;
          const sisaSilpa = danaDiterima - nominalTerpakai;

          next.sisa_kas_silpa = sisaSilpa;
          if (sisaSilpa > 0) {
            next.status_silpa = 'LEBIH_KEMBALIKAN_KAS';
          } else if (sisaSilpa < 0) {
            next.status_silpa = 'DEFISIT_KLAIM_DARURAT';
          } else {
            next.status_silpa = 'PAS_SESUAI_PAGU';
          }
        }

        if (schema.id === 'anggaran_kampanye') {
          next.total_anggaran = subtotal;
          next.cpv_terhitung = targetSuara > 0 ? Math.round(subtotal / targetSuara) : 0;
        }
      }

      return next;
    });

    setIsDirty(true);
    if (errors[key]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
    }
  };

  const handleCancelClick = () => {
    if (isDirty) {
      setShowCancelConfirm(true);
    } else {
      onBack();
    }
  };

  const executeReset = () => {
    const initial: Record<string, any> = {};
    const userProvinsi = localStorage.getItem("user_provinsi") || ""; 
    const userKota = localStorage.getItem("user_kota") || ""; 
    const userKecamatan = localStorage.getItem("user_kecamatan") || ""; 
    const userDesa = localStorage.getItem("user_desa") || "";
    schema.fields.forEach((field) => {
      initial[field.key] = initialData?.[field.key] ?? field.defaultValue ?? '';
    });
    setFormData(initial);
    setErrors({});
    setIsDirty(false);
    setShowResetConfirm(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    // Single source of truth validation using Universal Schema Validator
    const validation = validateRecord(schema, formData);

    if (!validation.isValid) {
      setErrors(validation.errors);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    // Open standardized confirmation modal
    setShowSubmitConfirm(true);
  };

  const executeSubmit = async () => {
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      await onSubmit(formData);
      setShowSubmitConfirm(false);
    } catch (err: any) {
      setSubmitError(err.message || 'Gagal menyimpan data ke Cloud Database.');
      setShowSubmitConfirm(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Breadcrumb & Navigation Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-3">
          <button
            onClick={handleCancelClick}
            className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl border border-slate-200 transition-colors cursor-pointer min-h-[40px] min-w-[40px] flex items-center justify-center"
            title="Kembali ke Daftar"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-indigo-600">{schema.title}</span>
              <span className="text-slate-300">/</span>
              <span className="text-xs font-bold text-slate-700">
                {isEditMode ? 'Form Edit Data' : 'Form Entri Baru'}
              </span>
            </div>
            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
              {isEditMode ? `Edit Data: ${initialData?.name || initialData?.id || 'Entri'}` : `Tambah ${schema.title.split(' ')[1] || 'Entri'} Baru`}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isOcrModule && formStep === 2 && (
             <button
               type="button"
               onClick={() => setIsScannerOpen(true)}
               className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors cursor-pointer min-h-[40px] shadow-sm shadow-indigo-600/20"
             >
               <Camera className="w-3.5 h-3.5" />
               <span className="hidden sm:inline">Scan Ulang {schema.id === 'konstituen' ? 'KTP' : 'C1'}</span>
             </button>
          )}
          {formStep === 2 && (
            <button
              type="button"
              onClick={() => setShowResetConfirm(true)}
              disabled={loading}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl border border-slate-200 transition-colors cursor-pointer min-h-[40px]"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Reset Form</span>
            </button>
          )}
          <button
            type="button"
            onClick={handleCancelClick}
            disabled={loading}
            className="px-3.5 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl border border-slate-200 transition-colors cursor-pointer min-h-[40px]"
          >
            Batal
          </button>
        </div>
      </div>

      {/* Error Alert */}
      {(Object.keys(errors).length > 0 || submitError) && (
        <div className="bg-rose-50 border border-rose-200 text-rose-800 p-4 rounded-2xl flex items-start gap-3 shadow-xs">
          <AlertTriangle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
          <div className="text-xs space-y-1">
            <h4 className="font-bold">Gagal Menyimpan Data</h4>
            <p>{submitError || 'Harap lengkapi semua kolom bertanda bintang (*) dengan nilai yang valid.'}</p>
          </div>
        </div>
      )}

      {/* Step 1: Scanner Gate (Only for new entries in specific modules) */}
      {formStep === 1 ? (
        <div className="bg-white p-8 sm:p-12 rounded-2xl shadow-xs border border-slate-200 text-center max-w-xl mx-auto mt-8">
          <div className="w-20 h-20 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <Camera className="w-10 h-10" />
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mb-3">
            Langkah 1: Scan {schema.id === 'konstituen' ? 'e-KTP' : 'C1 Plano'} Asli
          </h2>
          <p className="text-slate-500 text-sm leading-relaxed mb-8 max-w-sm mx-auto">
            Untuk menjaga validitas data dan mencegah duplikasi fiktif, Anda wajib memindai dokumen asli. Sistem AI akan mengekstrak data secara otomatis.
          </p>
          <button
            onClick={() => setIsScannerOpen(true)}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 text-sm font-black text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-lg shadow-indigo-600/30 transition-all hover:-translate-y-0.5 active:translate-y-0"
          >
            <Camera className="w-5 h-5" />
            Buka Kamera Sekarang
          </button>
        </div>
      ) : (
        /* Step 2: Main Form Body */
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 sm:p-8 space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-sm font-bold text-slate-800">Spesifikasi Isian Data</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Semua parameter divalidasi sesuai dengan metadata skema terintegrasi.
            </p>
          </div>

        <div className="space-y-6">
          {visibleFields.map((field) => {
            const hasError = !!errors[field.key];
            const isRequired = field.validation?.required;
            const isFieldLocked = field.readOnly || lockedFields.includes(field.key);
            const inputBaseClasses = `w-full px-4 py-2.5 text-xs border rounded-xl shadow-2xs focus:outline-none focus:ring-3 transition-all font-medium min-h-[44px]`;
            const inputStateClasses = hasError 
              ? 'border-rose-400 focus:ring-rose-100 text-rose-900 bg-white' 
              : isFieldLocked
                ? 'bg-slate-50 border-slate-200 text-slate-500 cursor-not-allowed opacity-90'
                : 'bg-white border-slate-300 focus:border-indigo-500 focus:ring-indigo-100 text-slate-800';

            return (
              <div key={field.key} className="space-y-1.5">
                {/* Field Header */}
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700 tracking-wide">
                    {field.label} {isRequired && <span className="text-rose-500 font-black">*</span>}
                    {isFieldLocked && (
                      <span className="flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-emerald-50 border border-emerald-100 text-emerald-600 text-[9px] uppercase tracking-wider">
                        <Lock className="w-2.5 h-2.5" /> Auto
                      </span>
                    )}
                  </label>
                  <span className="text-[10px] uppercase font-mono text-slate-400">
                    Tipe: {field.type}
                  </span>
                </div>

                {/* Conditional Field Inputs */}
                {field.type === 'file' ? (
                  <MediaUploader
                    label={field.label}
                    value={formData[field.key] || ''}
                    onChange={(url) => handleChange(field.key, url)}
                    placeholder={field.placeholder}
                  />
                ) : field.type === 'richtext' ? (
                  <RichTextEditor
                    label={field.label}
                    value={formData[field.key] || ''}
                    onChange={(html) => handleChange(field.key, html)}
                    placeholder={field.placeholder}
                  />
                ) : field.type.startsWith('region_') ? (
                  <RegionPicker
                    type={field.type as any}
                    value={formData[field.key] || ''}
                    onChange={(val) => handleChange(field.key, val)}
                    disabled={isFieldLocked}
                    formData={formData}
                    fieldKey={field.key}
                  />

                ) : field.type === 'location' ? (
                  <LocationPicker
                    label={field.label}
                    value={formData[field.key] || null}
                    onChange={(loc) => handleChange(field.key, loc)}
                  />
                ) : field.type === 'textarea' ? (
                  <textarea
                    rows={3}
                    disabled={isFieldLocked}
                    value={formData[field.key] !== undefined ? formData[field.key] : ''}
                    placeholder={field.placeholder || `Masukkan ${field.label.toLowerCase()}...`}
                    onChange={(e) => handleChange(field.key, e.target.value)}
                    className={`w-full px-4 py-2.5 text-xs border rounded-xl shadow-2xs focus:outline-none focus:ring-3 transition-all font-medium ${
                      hasError 
                        ? 'border-rose-400 focus:ring-rose-100 text-rose-900 bg-white' 
                        : isFieldLocked
                          ? 'bg-slate-50 border-slate-200 text-slate-500 cursor-not-allowed opacity-90'
                          : 'bg-white border-slate-300 focus:border-indigo-500 focus:ring-indigo-100 text-slate-800'
                    }`}
                  />
                ) : field.type === 'boolean' ? (
                  <label className="flex items-center gap-3 cursor-pointer py-1.5">
                    <input
                      type="checkbox"
                      checked={!!formData[field.key]}
                      disabled={isFieldLocked}
                      onChange={(e) => handleChange(field.key, e.target.checked)}
                      className="w-4 h-4 text-indigo-600 rounded-md border-slate-300 focus:ring-indigo-500 cursor-pointer disabled:opacity-50"
                    />
                    <span className="text-xs font-semibold text-slate-700">
                      {formData[field.key] ? 'Aktif / Ya' : 'Nonaktif / Tidak'}
                    </span>
                  </label>
                ) : field.type === 'select' ? (
                  <select
                    disabled={isFieldLocked}
                    value={formData[field.key] || ''}
                    onChange={(e) => handleChange(field.key, e.target.value)}
                    className={`${inputBaseClasses} ${inputStateClasses}`}
                  >
                    <option value="">-- Pilih {field.label} --</option>
                    {field.options?.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type={field.type === 'number' ? 'number' : field.type === 'date' ? 'date' : field.type === 'email' ? 'email' : field.type === 'phone' ? 'tel' : 'text'}
                    inputMode={field.type === 'number' || field.key.includes('nik') || field.type === 'phone' ? 'numeric' : undefined}
                    disabled={isFieldLocked}
                    value={formData[field.key] !== undefined ? formData[field.key] : ''}
                    placeholder={field.placeholder || `Masukkan ${field.label.toLowerCase()}...`}
                    onChange={(e) => handleChange(field.key, e.target.value)}
                    className={`${inputBaseClasses} ${inputStateClasses}`}
                  />
                )}

                {/* Optional Help Text */}
                {field.helpText && !hasError && (
                  <p className="text-[11px] text-slate-400 flex items-center gap-1 pl-0.5">
                    <HelpCircle className="w-3 h-3 text-slate-400 shrink-0" />
                    <span>{field.helpText}</span>
                  </p>
                )}

                {/* Validation Error Text */}
                {hasError && (
                  <p className="text-xs text-rose-600 font-semibold pl-1">
                    {errors[field.key]}
                  </p>
                )}
              </div>
            );
          })}
        </div>

        {/* Form Action Footer */}
        <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-slate-400">
            Kolom bertanda <span className="text-rose-500 font-bold">*</span> wajib diisi untuk integritas skema.
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={handleCancelClick}
              disabled={loading}
              className="w-full sm:w-auto px-5 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl border border-slate-200 transition-colors cursor-pointer min-h-[44px]"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 rounded-xl shadow-md shadow-indigo-600/20 hover:shadow-indigo-600/30 transition-all cursor-pointer min-h-[44px]"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <Save className="w-4 h-4" />
              )}
              <span>{isEditMode ? 'Simpan Perubahan' : 'Simpan Entri Baru'}</span>
            </button>
          </div>
        </div>
        </form>
      )}

      <ConfirmDialog
        isOpen={showCancelConfirm}
        title="Batal Edit?"
        message="Anda memiliki perubahan yang belum disimpan. Yakin ingin membatalkan dan membuang semua perubahan?"
        confirmLabel="Ya, Buang Perubahan"
        cancelLabel="Kembali ke Form"
        variant="warning"
        onConfirm={onBack}
        onCancel={() => setShowCancelConfirm(false)}
      />

      <ConfirmDialog
        isOpen={showResetConfirm}
        title="Reset Form?"
        message="Ini akan menghapus seluruh data yang telah Anda ketik dan mengembalikannya ke nilai awal. Anda tidak dapat mengurungkan aksi ini."
        confirmLabel="Ya, Reset"
        cancelLabel="Batal"
        variant="warning"
        onConfirm={executeReset}
        onCancel={() => setShowResetConfirm(false)}
      />

      <ConfirmSubmitModal
        isOpen={showSubmitConfirm}
        isEditMode={isEditMode}
        moduleTitle={schema.title}
        summaryFields={visibleFields.slice(0, 5).map((f) => ({
          label: f.label,
          value: formData[f.key] !== undefined && formData[f.key] !== null ? formData[f.key] : ''
        }))}
        isSaving={isSubmitting || loading}
        onConfirm={executeSubmit}
        onCancel={() => !isSubmitting && setShowSubmitConfirm(false)}
      />

      <OcrScannerModal 
        isOpen={isScannerOpen} 
        onClose={() => setIsScannerOpen(false)} 
        mode={schema.id === 'konstituen' ? 'ktp' : 'c1'}
        dapilConfig={ACTIVE_DAPIL_CONFIG}
        allowGallery={!isRelawan}
        onScanComplete={(result, file) => {
          setFormData(prev => ({ ...prev, ...result }));
          
          // Lock all fields that were successfully extracted by OCR
          const newLockedFields = Object.keys(result).filter(key => 
            result[key] !== undefined && result[key] !== null && result[key] !== ''
          );
          setLockedFields(prev => Array.from(new Set([...prev, ...newLockedFields])));
          
          setIsDirty(true);
          setFormStep(2); // Proceed to form after successful scan
          // In a real app we'd also upload the `file` directly to Supabase Storage here and set the URL.
          // For now, the user still has to upload it via the media uploader field manually, or we can handle it via ApiService.
        }}
      />
    </div>
  );
}
