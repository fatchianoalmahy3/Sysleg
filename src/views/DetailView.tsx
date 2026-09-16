import React, { useState } from 'react';
import { ModuleSchema } from '../core/types';
import { FieldRenderer, getVisibleFields } from '../core/formatters';
import { 
  ArrowLeft, 
  Printer, 
  Edit3, 
  Trash2, 
  FileSpreadsheet, 
  ShieldCheck,
  Calendar,
  Clock,
  Layers,
  Copy,
  Check,
  CheckCircle2,
  XCircle,
  MessageSquare,
  Sparkles,
  ExternalLink,
  Lock,
  UserCheck,
  RefreshCw
} from 'lucide-react';
import { ExcelService } from '../services/excel';
import { ApiService } from '../services/api';
import { formatRupiah } from '../utils/electoralData';

interface DetailViewProps {
  schema: ModuleSchema;
  item: any;
  onBack: () => void;
  onEdit: (item: any) => void;
  onDelete: (id: string) => void;
  onPrint: () => void;
  userRole: string;
}

export function DetailView({
  schema,
  item,
  onBack,
  onEdit,
  onDelete,
  onPrint,
  userRole
}: DetailViewProps) {
  const [currentItem, setCurrentItem] = useState(item);
  const [copied, setCopied] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);

  const canWrite = schema.allowedRoles.includes(userRole);
  const isSuperAdmin = userRole === 'SUPER_ADMIN';
  const isTenantApproval = schema.id === 'saas_tenant_approval';

  const handleCopyId = () => {
    navigator.clipboard.writeText(currentItem.id || '');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExportSingle = () => {
    ExcelService.exportToExcel(schema, [currentItem], `${schema.id}_detail_${currentItem.id}`);
  };

  // 1-Click Approve & Activate Tenant
  const handleApproveTenant = async () => {
    if (isUpdatingStatus) return;
    setIsUpdatingStatus(true);
    setActionSuccessMsg(null);

    try {
      const cleanName = (currentItem.nama_caleg || 'caleg')
        .replace(/[^A-Za-z0-9]/g, '')
        .substring(0, 8)
        .toUpperCase();
      const generatedTenantId = currentItem.tenant_id || `TNT-${cleanName}-${Math.floor(100 + Math.random() * 900)}`;
      const generatedTimsesEmail = currentItem.akun_timses_email || `timses.${cleanName.toLowerCase()}@pemenangancaleg.id`;

      const updatePayload = {
        ...currentItem,
        status: 'DISETUJUI_AKTIF',
        tenant_id: generatedTenantId,
        akun_timses_email: generatedTimsesEmail,
        catatan_superadmin: currentItem.catatan_superadmin || `Disetujui otomatis oleh Superadmin pada ${new Date().toLocaleString('id-ID')}`
      };

      await ApiService.updateRecord('saas_tenant_approval', currentItem.id, updatePayload);
      setCurrentItem(updatePayload);
      setActionSuccessMsg('Workspace Caleg berhasil disetujui & diaktifkan!');
    } catch (err: any) {
      alert(`Gagal mengaktifkan tenant: ${err.message}`);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  // 1-Click Reject
  const handleRejectTenant = async () => {
    if (isUpdatingStatus) return;
    const reason = prompt('Masukkan alasan penolakan pendaftaran Caleg:', 'Data persyaratan belum lengkap atau nomor WhatsApp tidak valid.');
    if (reason === null) return;

    setIsUpdatingStatus(true);
    try {
      const updatePayload = {
        ...currentItem,
        status: 'DITOLAK',
        catatan_superadmin: `DITOLAK: ${reason} (${new Date().toLocaleString('id-ID')})`
      };

      await ApiService.updateRecord('saas_tenant_approval', currentItem.id, updatePayload);
      setCurrentItem(updatePayload);
      setActionSuccessMsg('Status pendaftaran diubah menjadi Ditolak.');
    } catch (err: any) {
      alert(`Gagal menolak pendaftaran: ${err.message}`);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  // Format and launch official WhatsApp message
  const handleSendWhatsApp = () => {
    const rawPhone = String(currentItem.no_wa || '').replace(/[^0-9]/g, '');
    let cleanPhone = rawPhone;
    if (cleanPhone.startsWith('0')) {
      cleanPhone = '62' + cleanPhone.substring(1);
    } else if (!cleanPhone.startsWith('62')) {
      cleanPhone = '62' + cleanPhone;
    }

    const message = `Halo Bapak/Ibu *${currentItem.nama_caleg}* (${currentItem.partai} - ${currentItem.nama_dapil}),

Selamat! Pendaftaran Workspace SaaS Pemenangan Pemilu Anda telah *DISETUJUI & AKTIF*.

Berikut rincian akun pemenangan Anda:
* Paket: ${currentItem.paket}
* Nilai Investasi: ${formatRupiah(currentItem.harga_kesepakatan || 0)}
* ID Tenant: ${currentItem.tenant_id || '-'}
* Akun Login Tim Ses: ${currentItem.akun_timses_email || currentItem.email}

Silakan akses link workspace atau balas pesan ini untuk panduan onboarding saksi & relawan. Terima kasih!`;

    const waUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
    window.open(waUrl, '_blank');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Navigation & Action Bar */}
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
              <span className="text-xs font-bold text-slate-500">Detail Dokumen</span>
            </div>
            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              {currentItem.nama_caleg || currentItem.name || currentItem.customer_name || currentItem.action || `ID: ${currentItem.id}`}
            </h1>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleExportSingle}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-xl shadow-xs transition-colors cursor-pointer min-h-[40px]"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
            <span className="hidden sm:inline">Ekspor .xlsx</span>
          </button>

          <button
            onClick={onPrint}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-xl shadow-xs transition-colors cursor-pointer min-h-[40px]"
          >
            <Printer className="w-3.5 h-3.5 text-indigo-600" />
            <span>{isTenantApproval ? 'Cetak Faktur / Invoice' : 'Cetak / PDF'}</span>
          </button>

          {canWrite && (
            <>
              <button
                onClick={() => onEdit(currentItem)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md shadow-indigo-600/20 transition-all cursor-pointer min-h-[40px]"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edit Data</span>
              </button>

              <button
                onClick={() => onDelete(currentItem.id)}
                className="p-2 text-rose-600 hover:text-rose-700 hover:bg-rose-50 border border-rose-200 rounded-xl transition-colors cursor-pointer min-h-[40px] min-w-[40px] flex items-center justify-center"
                title="Hapus Entri Ini"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      </div>

      {/* DEDICATED APPROVAL ACTION BANNER FOR SUPERADMIN (SAAS TENANT WORKFLOW) */}
      {isTenantApproval && isSuperAdmin && (
        <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white border border-indigo-500/30 shadow-xl space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-indigo-800/60 pb-5">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-indigo-500/30 text-indigo-300 border border-indigo-400/30 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-300" />
                  SaaS Approval Hub
                </span>
                <span className={`text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full border ${
                  currentItem.status === 'DISETUJUI_AKTIF'
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/40'
                    : currentItem.status === 'DITOLAK'
                    ? 'bg-rose-500/20 text-rose-300 border-rose-400/40'
                    : 'bg-amber-500/20 text-amber-300 border-amber-400/40'
                }`}>
                  Status: {currentItem.status || 'PENDING_VERIFIKASI'}
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white">
                Otorisasi & Aktivasi Pemenangan Caleg
              </h2>
              <p className="text-xs text-indigo-200">
                Persetujuan instan 1-klik untuk mengaktifkan workspace database, akun tim ses, dan faktur penagihan.
              </p>
            </div>

            {/* Status Feedback */}
            {actionSuccessMsg && (
              <div className="p-3 bg-emerald-500/20 border border-emerald-400/40 rounded-xl text-emerald-300 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{actionSuccessMsg}</span>
              </div>
            )}
          </div>

          {/* Quick Action Buttons Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {currentItem.status !== 'DISETUJUI_AKTIF' ? (
              <button
                type="button"
                onClick={handleApproveTenant}
                disabled={isUpdatingStatus}
                className="inline-flex items-center justify-center gap-2 px-5 py-3.5 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-bold rounded-2xl shadow-lg shadow-emerald-600/30 transition-all cursor-pointer text-xs disabled:opacity-50"
              >
                {isUpdatingStatus ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <CheckCircle2 className="w-4 h-4" />
                )}
                <span>1-Klik Setujui & Aktifkan</span>
              </button>
            ) : (
              <div className="p-3 bg-emerald-500/20 border border-emerald-400/30 rounded-2xl text-emerald-300 text-xs font-bold flex items-center justify-center gap-2">
                <Check className="w-4 h-4" />
                <span>Workspace Aktif Terverifikasi</span>
              </div>
            )}

            {currentItem.no_wa && (
              <button
                type="button"
                onClick={handleSendWhatsApp}
                className="inline-flex items-center justify-center gap-2 px-4 py-3.5 bg-emerald-700/80 hover:bg-emerald-700 text-white font-bold rounded-2xl border border-emerald-500/40 transition-all cursor-pointer text-xs"
              >
                <MessageSquare className="w-4 h-4 text-emerald-300" />
                <span>Kirim WhatsApp ke Caleg</span>
              </button>
            )}

            <button
              type="button"
              onClick={onPrint}
              className="inline-flex items-center justify-center gap-2 px-4 py-3.5 bg-indigo-600/80 hover:bg-indigo-600 text-white font-bold rounded-2xl border border-indigo-400/40 transition-all cursor-pointer text-xs"
            >
              <Printer className="w-4 h-4 text-indigo-200" />
              <span>Cetak Faktur Tagihan A4</span>
            </button>
          </div>

          {/* Quick Details Pills */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 bg-white/5 rounded-2xl border border-white/10 text-xs">
            <div>
              <span className="text-[10px] text-indigo-300 uppercase block font-semibold">Tenant ID</span>
              <span className="font-mono font-bold text-white">{currentItem.tenant_id || '(Otomatis saat disetujui)'}</span>
            </div>
            <div>
              <span className="text-[10px] text-indigo-300 uppercase block font-semibold">Akun Tim Ses</span>
              <span className="font-mono text-white truncate block">{currentItem.akun_timses_email || '(Otomatis saat disetujui)'}</span>
            </div>
            <div>
              <span className="text-[10px] text-indigo-300 uppercase block font-semibold">Nilai Investasi</span>
              <span className="font-bold text-amber-300">{formatRupiah(currentItem.harga_kesepakatan || 0)}</span>
            </div>
            <div>
              <span className="text-[10px] text-indigo-300 uppercase block font-semibold">Aksi Lain</span>
              {currentItem.status !== 'DITOLAK' ? (
                <button
                  type="button"
                  onClick={handleRejectTenant}
                  className="text-rose-400 hover:text-rose-300 hover:underline font-bold text-[11px]"
                >
                  Tolak Pendaftaran
                </button>
              ) : (
                <span className="text-rose-400 font-bold">Ditolak</span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Formal Document Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Document Header Letterhead */}
        <div className="p-6 sm:p-8 bg-slate-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono uppercase tracking-widest px-2.5 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                REST REPO DOKUMEN SISTEM
              </span>
              <span className="flex items-center gap-1 text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-md">
                <ShieldCheck className="w-3 h-3" /> VERIFIED
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight">
              {currentItem.nama_caleg || currentItem.name || currentItem.customer_name || currentItem.action || 'Dokumen Entri'}
            </h2>
            <p className="text-xs text-slate-400">
              Modul: {schema.title} • Skema: {schema.id}
            </p>
          </div>

          <div className="flex flex-col sm:items-end gap-1.5 text-xs text-slate-300">
            <div className="flex items-center gap-1.5 font-mono text-slate-300">
              <span className="text-[10px] text-slate-400">ID SISTEM:</span>
              <span className="font-bold text-white">{currentItem.id}</span>
              <button 
                onClick={handleCopyId}
                className="p-1 hover:bg-slate-800 rounded transition-colors text-slate-400 hover:text-white"
                title="Salin ID"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              </button>
            </div>
            <div className="text-[11px] text-slate-400 flex items-center gap-1">
              <Clock className="w-3 h-3" /> Waktu Akses: {new Date().toLocaleDateString('id-ID', { dateStyle: 'full' })}
            </div>
          </div>
        </div>

        {/* Structured Field Details */}
        <div className="p-6 sm:p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {getVisibleFields(schema).map((field) => {
              const val = currentItem[field.key];
              const isFullWidth = ['richtext', 'location', 'file', 'catatan_superadmin', 'catatan_fitur'].includes(field.key) || ['richtext', 'location', 'file'].includes(field.type);

              return (
                <div 
                  key={field.key} 
                  className={`space-y-1.5 pb-4 border-b border-slate-100 last:border-0 ${
                    isFullWidth ? 'md:col-span-2' : ''
                  }`}
                >
                  <span className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                    {field.label}
                  </span>

                  <FieldRenderer field={field} value={val} mode="detail" />
                </div>
              );
            })}
          </div>

          {/* Audit & Lifecycle Note */}
          <div className="mt-8 pt-6 border-t border-slate-100 bg-slate-50/50 -mx-6 sm:-mx-8 -mb-6 sm:-mb-8 p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center flex-shrink-0">
                <Check className="w-4 h-4" />
              </div>
              <div className="text-xs">
                <span className="font-bold text-slate-800">Status Validasi Dokumen: Aktif</span>
                <p className="text-slate-400">Data tersimpan aman pada Dynamic REST Controller Storage.</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={onPrint}
                className="px-4 py-2 text-xs font-bold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                {isTenantApproval ? 'Cetak Faktur Tagihan A4' : 'Cetak Lembar Resmi A4'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
