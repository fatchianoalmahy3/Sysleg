import React, { useState, useMemo, useEffect, useRef } from 'react';
import { ModuleSchema } from '../core/types';
import { getVisibleFields, formatPlainString } from '../core/formatters';
import { 
  ArrowLeft, 
  Printer, 
  Download, 
  QrCode, 
  CheckCircle2, 
  Copy, 
  Check, 
  ExternalLink, 
  X, 
  ShieldAlert, 
  Sparkles, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  Maximize2,
  Building2,
  CreditCard,
  Calendar,
  UserCheck,
  FileText
} from 'lucide-react';
import { ExcelService } from '../services/excel';
import { QRCodeSVG } from 'qrcode.react';
import { ApiService } from '../services/api';
import { DEFAULT_SYSTEM_SETTINGS, formatRupiah } from '../utils/electoralData';

interface PrintDocumentViewProps {
  schema: ModuleSchema;
  data: any[];
  onBack: () => void;
  userRole: string;
}

export function PrintDocumentView({
  schema,
  data,
  onBack,
  userRole
}: PrintDocumentViewProps) {
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [zoom, setZoom] = useState<number>(1);
  const [systemSettings, setSystemSettings] = useState<any>(DEFAULT_SYSTEM_SETTINGS);
  const containerRef = useRef<HTMLDivElement>(null);

  // Fetch or retrieve system settings for Dynamic Letterhead (Kop Surat)
  useEffect(() => {
    let isMounted = true;
    const loadSettings = async () => {
      try {
        const cached = ApiService.getCachedRecords('saas_system_settings');
        if (cached && cached.length > 0) {
          if (isMounted) setSystemSettings({ ...DEFAULT_SYSTEM_SETTINGS, ...cached[0] });
          return;
        }
        const records = await ApiService.getRecords('saas_system_settings');
        if (records && records.length > 0 && isMounted) {
          setSystemSettings({ ...DEFAULT_SYSTEM_SETTINGS, ...records[0] });
        }
      } catch (err) {
        console.warn('Fallback to default system settings:', err);
      }
    };
    loadSettings();
    return () => { isMounted = false; };
  }, []);

  // Automatic Fit-to-Screen calculation
  const handleFitToScreen = () => {
    if (!containerRef.current) return;
    const availableWidth = containerRef.current.clientWidth - 48; // padding margin
    const standardA4Width = 794; // Standard A4 width in pixels at 96 DPI (210mm)
    if (availableWidth > 0) {
      const calculatedScale = Math.min(Math.max(availableWidth / standardA4Width, 0.35), 1.25);
      setZoom(Number(calculatedScale.toFixed(2)));
    }
  };

  // Initial Auto-fit for smaller screens on mount
  useEffect(() => {
    const handleInitialScale = () => {
      if (window.innerWidth < 880) {
        const availableWidth = window.innerWidth - 32;
        const standardA4Width = 794;
        const scale = Math.min(Math.max(availableWidth / standardA4Width, 0.35), 1);
        setZoom(Number(scale.toFixed(2)));
      } else {
        setZoom(1);
      }
    };
    handleInitialScale();
  }, []);

  const handleZoomIn = () => setZoom((prev) => Math.min(Number((prev + 0.1).toFixed(2)), 1.6));
  const handleZoomOut = () => setZoom((prev) => Math.max(Number((prev - 0.1).toFixed(2)), 0.35));
  const handleResetZoom = () => setZoom(1);

  const handlePrint = () => {
    window.print();
  };

  const handleExportExcel = () => {
    ExcelService.exportToExcel(schema, data);
  };

  const currentDate = useMemo(() => {
    return new Date().toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  }, []);

  // Detect whether this document is an Invoice / SaaS Approval record
  const isInvoiceMode = useMemo(() => {
    return schema.id === 'saas_tenant_approval' && data.length === 1;
  }, [schema.id, data.length]);

  const singleRecord = data[0] || {};

  const documentMeta = useMemo(() => {
    const prefix = isInvoiceMode ? 'INV-SAAS' : `SK/REP/${schema.id.toUpperCase()}`;
    const docNumber = isInvoiceMode 
      ? `INV/${new Date().getFullYear()}/${(singleRecord.tenant_id || singleRecord.partai || 'CALEG').substring(0, 8).toUpperCase()}/${Math.floor(1000 + Math.random() * 9000)}`
      : `${prefix}/${new Date().getFullYear()}/${Math.floor(1000 + Math.random() * 9000)}`;
      
    const verificationUUID = `VRF-${schema.id.substring(0, 3).toUpperCase()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}-${Date.now().toString(36).toUpperCase()}`;
    const generatedAt = new Date().toISOString();
    
    // Hash simulation for digital certificate
    const certHash = Array.from(verificationUUID + schema.id + data.length)
      .map((c) => c.charCodeAt(0).toString(16))
      .join('')
      .substring(0, 32)
      .toUpperCase();

    const verifyUrl = `${window.location.origin}${window.location.pathname}?view=verify&doc=${encodeURIComponent(docNumber)}&uuid=${verificationUUID}&schema=${schema.id}&count=${data.length}&hash=${certHash}`;

    return {
      docNumber,
      verificationUUID,
      generatedAt,
      certHash,
      verifyUrl
    };
  }, [schema.id, data.length, isInvoiceMode, singleRecord]);

  const handleCopyVerificationUrl = () => {
    navigator.clipboard.writeText(documentMeta.verifyUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="w-full mx-auto space-y-6 pb-16" ref={containerRef}>
      {/* Top Floating / Navigation Controls Bar (Hidden during printing) */}
      <div className="print:hidden sticky top-2 z-30 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white/95 backdrop-blur-md p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-md">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl border border-slate-200 transition-colors cursor-pointer min-h-[40px] min-w-[40px] flex items-center justify-center"
            title="Kembali ke Halaman Sebelumnya"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-md">
                Standard A4 Real Scale (Times New Roman 12pt)
              </span>
              {isInvoiceMode && (
                <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
                  Faktur Resmi SaaS
                </span>
              )}
            </div>
            <h1 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight mt-0.5">
              {isInvoiceMode ? `Faktur Tagihan Pendaftaran (${singleRecord.nama_caleg || 'Caleg'})` : `Lembar Dokumen Resmi: ${schema.title}`}
            </h1>
          </div>
        </div>

        {/* Toolbar: Zoom Controls, Verification, Export, and Print */}
        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap justify-end">
          {/* Zoom Controller Group */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-slate-700 shadow-2xs">
            <button
              type="button"
              onClick={handleZoomOut}
              className="p-1.5 hover:bg-white hover:text-slate-900 rounded-lg transition-colors cursor-pointer"
              title="Perkecil Tampilan (Zoom Out)"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={handleResetZoom}
              className="px-2 py-1 text-xs font-mono font-bold hover:bg-white rounded-lg transition-colors"
              title="Kembalikan Skala Asli 100%"
            >
              {Math.round(zoom * 100)}%
            </button>
            <button
              type="button"
              onClick={handleZoomIn}
              className="p-1.5 hover:bg-white hover:text-slate-900 rounded-lg transition-colors cursor-pointer"
              title="Perbesar Tampilan (Zoom In)"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={handleFitToScreen}
              className="ml-1 px-2.5 py-1 text-[11px] font-bold text-indigo-700 hover:bg-white rounded-lg flex items-center gap-1 transition-colors cursor-pointer border-l border-slate-200"
              title="Paskan dengan Lebar Layar"
            >
              <Maximize2 className="w-3 h-3" />
              <span>Paskan Layar</span>
            </button>
          </div>

          <button
            type="button"
            onClick={() => setShowVerifyModal(true)}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-xl transition-colors cursor-pointer min-h-[38px]"
            title="Periksa Keabsahan Kriptografi Dokumen"
          >
            <QrCode className="w-3.5 h-3.5 text-indigo-600" />
            <span className="hidden sm:inline">Audit QR</span>
          </button>

          {!isInvoiceMode && (
            <button
              type="button"
              onClick={handleExportExcel}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-xl shadow-xs transition-colors cursor-pointer min-h-[38px]"
            >
              <Download className="w-3.5 h-3.5 text-emerald-600" />
              <span className="hidden sm:inline">Excel</span>
            </button>
          )}

          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md shadow-indigo-600/20 transition-all cursor-pointer min-h-[38px]"
          >
            <Printer className="w-4 h-4" />
            <span>Cetak / PDF A4</span>
          </button>
        </div>
      </div>

      {/* Realistic Document Workbench Stage (Grey background simulating office desk) */}
      <div className="bg-slate-200/90 p-4 sm:p-10 rounded-3xl border border-slate-300/80 shadow-inner flex justify-center overflow-x-auto print:p-0 print:bg-transparent print:border-none print:shadow-none">
        
        {/* Dynamic Zoom Wrapper */}
        <div 
          style={{ 
            transform: `scale(${zoom})`, 
            transformOrigin: 'top center',
            transition: 'transform 0.15s ease-out'
          }}
          className="print:transform-none"
        >
          {/* Physical A4 Sheet Container (Standard A4 Dimensions: 794px × 1123px at 96 DPI, 210mm x 297mm) */}
          <div 
            style={{ 
              fontFamily: '"Times New Roman", Times, Georgia, serif',
              fontSize: '12pt',
              lineHeight: '1.5'
            }}
            className="w-[794px] min-h-[1123px] bg-white text-slate-900 p-[20mm] shadow-2xl rounded-xs border border-slate-300/70 space-y-6 print:w-full print:min-h-0 print:p-0 print:border-none print:shadow-none print:rounded-none"
          >
            
            {/* Kop Surat Resmi Lembaga / Double Border Letterhead */}
            <div className="border-b-4 border-double border-slate-900 pb-3 flex items-start justify-between gap-4">
              <div className="space-y-0.5 text-left flex-1">
                <h2 className="text-[15pt] font-bold tracking-tight text-slate-950 uppercase leading-snug">
                  {systemSettings.nama_lembaga || DEFAULT_SYSTEM_SETTINGS.nama_lembaga}
                </h2>
                <p className="text-[10pt] font-semibold text-slate-800">
                  {systemSettings.sub_judul || DEFAULT_SYSTEM_SETTINGS.sub_judul}
                </p>
                <p className="text-[9pt] text-slate-700 leading-normal">
                  {systemSettings.alamat_kantor || DEFAULT_SYSTEM_SETTINGS.alamat_kantor}
                </p>
                <p className="text-[8.5pt] text-slate-600">
                  Layanan Bantuan: {systemSettings.no_telp_layanan} • Email: {systemSettings.email_resmi} • Web: {systemSettings.website}
                </p>
              </div>

              {/* Official Seal Badge */}
              <div className="text-right shrink-0">
                <div className="w-14 h-14 rounded-lg bg-slate-900 text-white font-serif font-black flex flex-col items-center justify-center border-2 border-slate-800 shadow-xs">
                  <span className="text-[14pt] leading-none">SK</span>
                  <span className="text-[7pt] tracking-widest mt-0.5">RESMI</span>
                </div>
                <span className="text-[8pt] font-mono text-slate-600 block mt-1">DOKUMEN RESMI</span>
              </div>
            </div>

            {/* DEDICATED INVOICE LAYOUT IF PRINTING CALEG SAAS REGISTRATION */}
            {isInvoiceMode ? (
              <div className="space-y-6 pt-2">
                {/* Invoice Title & Meta Box */}
                <div className="flex items-center justify-between border-b border-slate-300 pb-4">
                  <div>
                    <span className="text-[10pt] uppercase tracking-widest text-slate-600 font-bold block">
                      SURAT TAGIHAN RESMI (OFFICIAL INVOICE)
                    </span>
                    <h3 className="text-[16pt] font-bold uppercase text-slate-900">
                      FAKTUR AKTIVASI WORKSPACE PEMENANGAN
                    </h3>
                  </div>
                  <div className="text-right text-[10pt]">
                    <div className="font-mono font-bold text-slate-900 text-[11pt]">
                      {documentMeta.docNumber}
                    </div>
                    <div className="text-slate-600">
                      Tanggal: <span className="font-bold text-slate-800">{currentDate}</span>
                    </div>
                    <div className="mt-1">
                      <span className={`inline-block px-2.5 py-0.5 text-[9pt] font-bold uppercase rounded border ${
                        singleRecord.status === 'DISETUJUI_AKTIF'
                          ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                          : 'bg-amber-100 text-amber-900 border-amber-300'
                      }`}>
                        STATUS: {singleRecord.status || 'PENDING VERIFIKASI'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Billed To / Client Identity Grid */}
                <div className="grid grid-cols-2 gap-4 p-4 bg-slate-50 border border-slate-300 rounded text-[10.5pt]">
                  <div className="space-y-1">
                    <span className="text-[8.5pt] font-bold text-slate-500 uppercase tracking-wider block">
                      Ditagihkan Kepada (Calon Anggota Legislatif):
                    </span>
                    <div className="text-[13pt] font-bold text-slate-950">
                      {singleRecord.nama_caleg || 'Nama Caleg'}
                    </div>
                    <div className="text-slate-700">
                      Partai Politik: <strong>{singleRecord.partai || '-'} (No. Urut {singleRecord.nomor_urut || '-'})</strong>
                    </div>
                    <div className="text-slate-700">
                      Email: <strong>{singleRecord.email || '-'}</strong> • WA: <strong>{singleRecord.no_wa || '-'}</strong>
                    </div>
                  </div>

                  <div className="space-y-1 text-right">
                    <span className="text-[8.5pt] font-bold text-slate-500 uppercase tracking-wider block">
                      Wilayah & Dapil Penugasan:
                    </span>
                    <div className="text-[12pt] font-bold text-slate-900">
                      {singleRecord.tingkat_pemilihan || 'Tingkat Pemilihan'}
                    </div>
                    <div className="text-slate-700">
                      Dapil: <strong>{singleRecord.nama_dapil || '-'}</strong>
                    </div>
                    <div className="text-slate-700">
                      Wilayah: <strong>{singleRecord.kota || '-'}, {singleRecord.provinsi || '-'}</strong>
                    </div>
                    {singleRecord.tenant_id && (
                      <div className="font-mono text-[9pt] text-indigo-900 pt-0.5">
                        ID Tenant: <strong>{singleRecord.tenant_id}</strong>
                      </div>
                    )}
                  </div>
                </div>

                {/* Itemized Service & Price Table */}
                <div>
                  <table className="w-full border-collapse border border-slate-400 text-[10.5pt]">
                    <thead>
                      <tr className="bg-slate-100 border-b border-slate-400 text-[10pt] uppercase font-bold">
                        <th className="border border-slate-400 p-2 text-center w-12">No</th>
                        <th className="border border-slate-400 p-2 text-left">Deskripsi Layanan & Fasilitas SaaS</th>
                        <th className="border border-slate-400 p-2 text-center w-32">Tingkat</th>
                        <th className="border border-slate-400 p-2 text-right w-40">Biaya (Rp)</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="border border-slate-400 p-3 text-center align-top font-mono">1</td>
                        <td className="border border-slate-400 p-3 align-top">
                          <div className="font-bold text-[11pt] text-slate-950">
                            Paket Berlangganan SaaS: {singleRecord.paket || 'Paket Standar'}
                          </div>
                          <div className="text-[9.5pt] text-slate-700 mt-1 leading-relaxed">
                            Aktivasi akun SaaS pemenangan Pemilu terpadu untuk wilayah <strong>{singleRecord.nama_dapil}</strong>.
                            Mencakup kuota pendataan DPT & Konstituen, manajemen multi-level Tim Ses / Relawan (Korcam, Kordes, Saksi TPS), modul Quick Count real-time Form C1 Plano, dan hak akses dashboard analitik.
                          </div>
                          {singleRecord.akun_timses_email && (
                            <div className="mt-2 p-2 bg-slate-100 border border-slate-300 rounded text-[9pt] font-mono">
                              Akun Tim Ses Terdaftar: <strong>{singleRecord.akun_timses_email}</strong>
                            </div>
                          )}
                        </td>
                        <td className="border border-slate-400 p-3 text-center align-top text-[10pt]">
                          {singleRecord.tingkat_pemilihan}
                        </td>
                        <td className="border border-slate-400 p-3 text-right align-top font-bold text-[11pt] font-mono">
                          {formatRupiah(singleRecord.harga_kesepakatan || 0)}
                        </td>
                      </tr>
                    </tbody>
                    <tfoot>
                      <tr className="bg-slate-50 font-bold border-t-2 border-slate-400">
                        <td colSpan={3} className="border border-slate-400 p-2.5 text-right text-[11pt] uppercase">
                          Total Nilai Investasi (Bruto)
                        </td>
                        <td className="border border-slate-400 p-2.5 text-right font-mono text-[12pt] text-slate-950">
                          {formatRupiah(singleRecord.harga_kesepakatan || 0)}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>

                {/* Bank Account Transfer Instruction Box */}
                <div className="p-4 bg-slate-50 border border-slate-300 rounded text-[10pt] space-y-2">
                  <div className="font-bold uppercase text-[10.5pt] text-slate-900 border-b border-slate-200 pb-1 flex items-center justify-between">
                    <span>Instruksi Pembayaran & Rekening Bank Resmi</span>
                    <span className="font-mono text-[9pt] text-slate-600">Verifikasi Otomatis</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                    <div>
                      <span className="text-[8.5pt] text-slate-500 uppercase block">Bank Penampung:</span>
                      <strong className="text-[11pt] text-slate-900">{systemSettings.bank_nama}</strong>
                    </div>
                    <div>
                      <span className="text-[8.5pt] text-slate-500 uppercase block">Nomor Rekening:</span>
                      <strong className="text-[12pt] font-mono text-indigo-950">{systemSettings.bank_rekening}</strong>
                    </div>
                    <div>
                      <span className="text-[8.5pt] text-slate-500 uppercase block">Atas Nama Rekening:</span>
                      <strong className="text-[11pt] text-slate-900">{systemSettings.bank_atas_nama}</strong>
                    </div>
                  </div>
                  <p className="text-[8.5pt] text-slate-600 italic pt-1 border-t border-slate-200">
                    *Harap sertakan nomor invoice <strong>{documentMeta.docNumber}</strong> pada berita transfer dan konfirmasi via WhatsApp ke {systemSettings.no_telp_layanan}.
                  </p>
                </div>
              </div>
            ) : (
              /* STANDARD MODULE RECAPITULATION REPORT LAYOUT */
              <div className="space-y-4 pt-1">
                {/* Document Title & Meta */}
                <div className="space-y-1 text-center py-2">
                  <h3 className="text-[14pt] font-bold uppercase tracking-wide underline underline-offset-4">
                    LAPORAN REKAPITULASI {schema.title.toUpperCase()}
                  </h3>
                  <p className="text-[9.5pt] text-slate-600 font-mono">
                    Nomor Dokumen: {documentMeta.docNumber}
                  </p>
                </div>

                {/* Meta Info Bar */}
                <div className="grid grid-cols-4 gap-3 p-3 bg-slate-50 rounded border border-slate-300 text-[9.5pt]">
                  <div>
                    <span className="text-[8pt] text-slate-500 uppercase font-bold block">Modul Skema</span>
                    <span className="font-bold text-slate-900">{schema.title}</span>
                  </div>
                  <div>
                    <span className="text-[8pt] text-slate-500 uppercase font-bold block">Total Rekaman</span>
                    <span className="font-bold text-slate-900">{data.length} Baris Data</span>
                  </div>
                  <div>
                    <span className="text-[8pt] text-slate-500 uppercase font-bold block">Tanggal Terbit</span>
                    <span className="font-bold text-slate-900">{currentDate}</span>
                  </div>
                  <div>
                    <span className="text-[8pt] text-slate-500 uppercase font-bold block">Otorisator</span>
                    <span className="font-bold text-slate-900">{userRole.replace('_', ' ')}</span>
                  </div>
                </div>

                {/* Printable Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse border border-slate-400 text-[10pt]">
                    <thead>
                      <tr className="bg-slate-100 border-b border-slate-400">
                        <th className="border border-slate-400 px-2.5 py-1.5 text-[9pt] font-bold text-slate-900 uppercase w-10 text-center">
                          No
                        </th>
                        {getVisibleFields(schema).map(f => (
                          <th key={f.key} className="border border-slate-400 px-2.5 py-1.5 text-[9pt] font-bold text-slate-900 uppercase">
                            {f.label}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {data.map((item, idx) => (
                        <tr key={item.id || idx} className="border-b border-slate-300">
                          <td className="border border-slate-400 px-2 py-1.5 text-center font-mono">{idx + 1}</td>
                          {getVisibleFields(schema).map(f => {
                            const text = formatPlainString(f, item[f.key]);
                            return (
                              <td key={f.key} className="border border-slate-400 px-2.5 py-1.5 text-slate-900">
                                {text}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Official Digital Certificate Seal (QR Code compliant with UU ITE - No wet signature) */}
            <div className="pt-4 border-t-2 border-slate-400">
              <div className="p-4 bg-slate-50 border border-slate-400 rounded flex flex-row items-start gap-4">
                {/* QR Code */}
                <div 
                  onClick={() => setShowVerifyModal(true)}
                  className="bg-white p-2 rounded border border-slate-400 shrink-0 cursor-pointer text-center"
                  title="Klik untuk memvalidasi dokumen secara digital"
                >
                  <QRCodeSVG
                    value={documentMeta.verifyUrl}
                    size={80}
                    level="M"
                    includeMargin={false}
                    className="mx-auto"
                  />
                  <span className="block mt-1 text-[7.5pt] font-mono text-slate-500 font-bold uppercase">
                    Pindai UU ITE
                  </span>
                </div>

                {/* Digital Certificate Legal Text */}
                <div className="space-y-1 text-slate-800 text-left flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[8.5pt] font-bold text-emerald-900 bg-emerald-100 px-2 py-0.5 rounded border border-emerald-300 inline-flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-700" />
                      Dokumen Sah Terverifikasi Elektronik
                    </span>
                    <span className="text-[8pt] font-mono text-slate-600">
                      Ref: {documentMeta.docNumber}
                    </span>
                  </div>

                  <h4 className="text-[10pt] font-bold text-slate-950 pt-0.5">
                    Sertifikasi Keabsahan Digital Terpadu (UU ITE Pasal 5 Ayat 1)
                  </h4>

                  <p className="text-[8.5pt] text-slate-700 leading-snug">
                    {systemSettings.catatan_legal || DEFAULT_SYSTEM_SETTINGS.catatan_legal}
                  </p>

                  <div className="pt-1 flex flex-wrap items-center gap-x-3 text-[8pt] font-mono text-slate-600">
                    <span>UUID: <strong>{documentMeta.verificationUUID}</strong></span>
                    <span>Checksum: <strong>{documentMeta.certHash.substring(0, 16)}...</strong></span>
                    <span>Waktu: <strong>{currentDate}</strong></span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Verification Audit Modal Dialog */}
      {showVerifyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div 
            className="bg-white rounded-3xl shadow-2xl border border-slate-100 max-w-lg w-full overflow-hidden animate-in zoom-in-95 duration-200"
            role="dialog"
            aria-modal="true"
          >
            <div className="bg-gradient-to-r from-slate-900 via-indigo-900 to-slate-900 p-6 text-white relative">
              <button
                onClick={() => setShowVerifyModal(false)}
                className="absolute top-4 right-4 text-white/70 hover:text-white p-2 rounded-full hover:bg-white/10 transition-colors cursor-pointer"
                aria-label="Tutup Dialog"
              >
                <X className="w-5 h-5" />
              </button>
              
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-300 shrink-0">
                  <ShieldAlert className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <span className="text-[10px] font-bold tracking-widest uppercase px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                    AUDIT ELEKTRONIK RESMI
                  </span>
                  <h3 className="text-lg font-black text-white mt-1">
                    Validasi Keaslian Dokumen Digital
                  </h3>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <h4 className="text-sm font-black text-emerald-900">
                    Dokumen Sah & Tercatat di Repository Cloud
                  </h4>
                  <p className="text-xs text-emerald-700 leading-relaxed">
                    Struktur skema, integritas data, dan otorisasi dokumen telah diverifikasi secara sah.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-200">
                <div className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-xs shrink-0">
                  <QRCodeSVG
                    value={documentMeta.verifyUrl}
                    size={100}
                    level="Q"
                  />
                </div>
                <div className="space-y-1.5 text-xs w-full">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">Nomor Dokumen</span>
                    <span className="font-mono font-bold text-slate-900">{documentMeta.docNumber}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">UUID Kriptografi</span>
                    <span className="font-mono text-indigo-700 font-bold break-all">{documentMeta.verificationUUID}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-1.5 bg-slate-900 text-emerald-400 p-3 rounded-xl font-mono text-[11px] break-all select-all">
                <span className="text-[9px] text-slate-400 uppercase block">SHA256 CHECKSUM PASS:</span>
                {documentMeta.certHash}
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-700">Tautan Verifikasi Resmi:</label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={documentMeta.verifyUrl}
                    className="w-full text-xs font-mono bg-slate-100 border border-slate-300 rounded-xl px-3 py-2 text-slate-600 truncate focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleCopyVerificationUrl}
                    className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shrink-0 cursor-pointer"
                  >
                    {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedLink ? 'Tersalin' : 'Salin'}</span>
                  </button>
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setShowVerifyModal(false)}
                className="px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-200/70 rounded-xl transition-colors cursor-pointer"
              >
                Tutup
              </button>
              <button
                type="button"
                onClick={handlePrint}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Cetak Dokumen</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
