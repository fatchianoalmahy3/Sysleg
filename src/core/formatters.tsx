import React from 'react';
import { FieldSchema, ModuleSchema } from './types';
import { MapPin, FileText, ExternalLink, Download, Mail, Phone, CheckCircle, XCircle } from 'lucide-react';

/**
 * Filter out technical ID fields for clean end-user presentation
 */
export function isCurrencyField(field: FieldSchema): boolean {
  if (field.currency === true) return true;
  if (field.currency === false) return false;
  const key = field.key.toLowerCase();
  const label = (field.label || "").toLowerCase();
  const nonCur = ["dpt", "suara", "vote", "volume", "qty", "kuantitas", "jumlah_dpt", "target_suara", "suara_terkunci", "gap_suara", "nomor", "urut", "kursi", "margin", "safety_margin", "score", "bobot", "durasi", "persen", "persentase", "tps", "rt", "rw", "kuota"];
  for (const p of nonCur) if (key.includes(p) || label.includes(p)) return false;
  const cur = ["harga", "biaya", "anggaran", "dana", "nominal", "tarif", "plafon", "rab", "pemborosan", "cpv", "uang", "subtotal", "total_biaya", "gaji", "honor", "kas", "nilai"];
  for (const p of cur) if (key.includes(p) || label.includes(p)) return true;
  return false;
}

export function formatNumberFieldValue(field: FieldSchema, value: any): string {
  const num = Number(value);
  if (isNaN(num)) return String(value);
  if (isCurrencyField(field)) return `Rp ${num.toLocaleString("id-ID")}`;
  const formatted = num.toLocaleString("id-ID");
  return field.unit ? `${formatted} ${field.unit}` : formatted;
}

export function getVisibleFields(schema: ModuleSchema): FieldSchema[] {
  return schema.fields.filter(f => f.key !== 'id');
}

/**
 * Standard Indonesian Currency Formatter
 */
export function formatCurrency(val: any): string {
  const num = Number(val);
  if (isNaN(num)) return 'Rp 0';
  return `Rp ${num.toLocaleString('id-ID')}`;
}

/**
 * Clean plain-text formatting for exports, print tables, or titles
 */
export function formatPlainString(field: FieldSchema, val: any): string {
  if (val === undefined || val === null || val === '') return '-';
  
  if (field.type === 'number') {
    return formatNumberFieldValue(field, val);
  }
  
  if (field.type === 'location' && val) {
    if (typeof val === 'object') {
      return val.name || `${val.lat?.toFixed(4)}, ${val.lng?.toFixed(4)}`;
    }
    return String(val);
  }

  if (field.type === 'richtext' && val) {
    return String(val).replace(/<[^>]*>?/gm, ' ').replace(/\s+/g, ' ').trim();
  }

  if (field.type === 'file' && val) {
    return '[Lampiran Berkas]';
  }

  if (field.type === 'boolean') {
    return val === true || val === 'true' || val === 1 ? 'Aktif' : 'Nonaktif';
  }

  return String(val);
}

/**
 * Universal badge color mapper for select/status fields
 */
export function getSelectBadgeClasses(val: string): string {
  const str = String(val);
  const positive = [
    'Lunas', 'Elektronik', 'Teknologi', 'Aktif', 'Selesai', 'Disetujui', 'Terkonfirmasi',
    'TERVERIFIKASI_SAH', 'AUDIT_MATEMATIS_PAS_VALID', 'PASTI_COBLOS_100', 'SUDAH_TRANSFER_C1_VALID',
    'SELESAI_SERAHKAN_C1', 'STANDBY_BUKA_TPS', 'SEDANG_REKAP_HITUNG', 'WAJAR_SESUAI_PASAR', 'LOLOS_KURSI_AMAN',
    'BASIS_HIJAU (Aman / Loyal)'
  ];
  const info = [
    'KEMUNGKINAN_BESAR_75', 'TPS_REGULER', 'TPS_LOKSUS_PESANTREN', 'TPS_LOKSUS_RUTAN', 'TPS_LOKSUS_RSUD',
    'SIAP_DICAIRKAN'
  ];
  const warning = [
    'Menunggu Pembayaran', 'Sumber Daya Manusia', 'Pemasaran', 'Proses', 'Tertunda',
    'SELISIH_SUARA_WARNING', 'RAGU_SWING_50', 'MENUNGGU_VERIFIKASI', 'KURSI_TERAKHIR_RAWAN',
    'PERINGATAN_MARKUP', 'BATTLEGROUND_KUNING (Medan Tempur Kritis)'
  ];
  const danger = [
    'Batal', 'Ditolak', 'Nonaktif', 'Kadaluarsa',
    'SUARA_CALEG_MELEBIHI_TOTAL', 'DITAHAN_C1_BELUM_LENGKAP', 'RAWAN_PINDAH_25', 'LOKASI_GPS_MENYIMPANG',
    'DITOLAK_BURAM', 'SANGAT_BOROS_EVALUASI', 'BELUM_LOLOS_KURSI', 'RAWAN_MERAH (Penetrasi Rendah)'
  ];

  if (positive.some(p => str.includes(p))) {
    return 'bg-emerald-50 text-emerald-700 border-emerald-200 font-bold';
  }
  if (info.some(i => str.includes(i))) {
    return 'bg-sky-50 text-sky-700 border-sky-200 font-bold';
  }
  if (warning.some(w => str.includes(w))) {
    return 'bg-amber-50 text-amber-700 border-amber-200 font-bold';
  }
  if (danger.some(d => str.includes(d))) {
    return 'bg-rose-50 text-rose-700 border-rose-200 font-bold';
  }
  return 'bg-slate-100 text-slate-700 border-slate-200';
}

interface FieldRendererProps {
  field: FieldSchema;
  value: any;
  mode?: 'table' | 'card' | 'detail' | 'print';
}

/**
 * Standardized DRY Field Renderer for any schema field across the application
 */
export const FieldRenderer: React.FC<FieldRendererProps> = ({ field, value, mode = 'table' }) => {
  if (value === undefined || value === null || value === '') {
    return <span className="text-slate-400 text-xs italic">-</span>;
  }

  // 1. Currency & Numbers
  if (field.type === 'number') {
    if (mode === 'detail') {
      return (
        <p className="text-base sm:text-lg font-mono font-bold text-slate-900">
          {formatNumberFieldValue(field, value)}
        </p>
      );
    }
    return (
      <span className="font-mono text-xs font-semibold text-slate-800">
        {formatNumberFieldValue(field, value)}
      </span>
    );
  }

  // 2. Select & Status Badges
  if (field.type === 'select') {
    const badgeClass = getSelectBadgeClasses(String(value));
    return (
      <span className={`inline-block px-2.5 py-0.5 text-[11px] font-semibold rounded-full border ${badgeClass}`}>
        {value}
      </span>
    );
  }

  // 3. Location Picker
  if (field.type === 'location' && value) {
    const locName = typeof value === 'object' 
      ? (value.name || `${value.lat?.toFixed(2)}, ${value.lng?.toFixed(2)}`) 
      : String(value);

    if (mode === 'detail') {
      return (
        <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-800">{locName}</p>
              {typeof value === 'object' && value.lat && value.lng && (
                <p className="text-[11px] font-mono text-slate-500 mt-0.5">
                  GPS: {value.lat.toFixed(6)}, {value.lng.toFixed(6)}
                </p>
              )}
            </div>
          </div>
          {typeof value === 'object' && value.lat && value.lng && (
            <a
              href={`https://www.google.com/maps?q=${value.lat},${value.lng}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-800 bg-white hover:bg-indigo-50 px-3 py-2 rounded-lg border border-slate-200 transition-colors shadow-2xs self-start sm:self-auto"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Buka Google Maps</span>
            </a>
          )}
        </div>
      );
    }

    return (
      <span className="inline-flex items-center gap-1 text-xs text-slate-700 bg-slate-100/80 px-2 py-0.5 rounded-md">
        <MapPin className="w-3 h-3 text-indigo-500 shrink-0" />
        <span className="truncate max-w-[140px]">{locName}</span>
      </span>
    );
  }

  // 4. File & Media
  if (field.type === 'file' && value) {
    const isImg = typeof value === 'string' && (value.startsWith('data:image') || value.includes('unsplash.com') || value.includes('http'));

    if (mode === 'detail') {
      return (
        <div className="space-y-3">
          {isImg && (
            <div className="rounded-2xl overflow-hidden border border-slate-200 shadow-xs max-w-md bg-slate-900">
              <img 
                src={value} 
                alt="Media Preview" 
                className="w-full h-auto max-h-72 object-cover" 
                referrerPolicy="no-referrer"
              />
            </div>
          )}
          <a
            href={value}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold rounded-xl border border-indigo-200 transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Unduh Dokumen Berkas Asli</span>
          </a>
        </div>
      );
    }

    return (
      <div className="flex items-center gap-2">
        {isImg ? (
          <img src={value} alt="thumb" className="w-8 h-8 rounded-lg object-cover border border-slate-200 shrink-0" referrerPolicy="no-referrer" />
        ) : (
          <span className="inline-flex items-center gap-1 text-xs text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md font-medium">
            <FileText className="w-3 h-3" /> Berkas
          </span>
        )}
      </div>
    );
  }

  // 5. Email with clickable mailto
  if (field.type === 'email') {
    if (mode === 'detail') {
      return (
        <a 
          href={`mailto:${value}`}
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-indigo-600 hover:text-indigo-800 hover:underline"
        >
          <Mail className="w-4 h-4 text-indigo-500" />
          <span>{String(value)}</span>
        </a>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 text-xs text-slate-700 font-medium">
        <Mail className="w-3 h-3 text-indigo-400 shrink-0" />
        <span className="truncate max-w-[180px]">{String(value)}</span>
      </span>
    );
  }

  // 6. Phone with direct Call/WhatsApp link
  if (field.type === 'phone') {
    const cleanNum = String(value).replace(/[^\d+]/g, '');
    const waLink = cleanNum.startsWith('0') 
      ? `https://wa.me/62${cleanNum.substring(1)}` 
      : `https://wa.me/${cleanNum.replace('+', '')}`;

    if (mode === 'detail') {
      return (
        <div className="flex items-center gap-3">
          <p className="text-xs sm:text-sm font-mono font-semibold text-slate-900">
            {String(value)}
          </p>
          <a
            href={waLink}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-[11px] font-bold rounded-lg border border-emerald-200 transition-colors"
          >
            <Phone className="w-3 h-3 text-emerald-600" />
            <span>Chat WhatsApp</span>
          </a>
        </div>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 text-xs font-mono text-slate-700">
        <Phone className="w-3 h-3 text-emerald-600 shrink-0" />
        <span>{String(value)}</span>
      </span>
    );
  }

  // 7. Boolean / Switch indicator
  if (field.type === 'boolean') {
    const isTrue = value === true || value === 'true' || value === 1;
    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 text-[11px] font-semibold rounded-full border ${
        isTrue 
          ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
          : 'bg-slate-100 text-slate-500 border-slate-200'
      }`}>
        {isTrue ? <CheckCircle className="w-3 h-3 text-emerald-600" /> : <XCircle className="w-3 h-3 text-slate-400" />}
        <span>{isTrue ? 'Aktif' : 'Nonaktif'}</span>
      </span>
    );
  }

  // 8. Textarea
  if (field.type === 'textarea') {
    if (mode === 'detail') {
      return (
        <p className="text-xs sm:text-sm text-slate-700 whitespace-pre-line leading-relaxed bg-slate-50 p-3.5 rounded-xl border border-slate-200">
          {String(value)}
        </p>
      );
    }
    return (
      <span className="text-xs text-slate-700 truncate max-w-[200px] block" title={String(value)}>
        {String(value)}
      </span>
    );
  }

  // 9. Rich Text
  if (field.type === 'richtext') {
    if (mode === 'detail') {
      return (
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 text-xs sm:text-sm text-slate-700 leading-relaxed max-w-none prose prose-slate">
          <div dangerouslySetInnerHTML={{ __html: value }} />
        </div>
      );
    }
    const plainText = String(value).replace(/<[^>]*>?/gm, ' ').replace(/\s+/g, ' ').trim();
    return (
      <span className="text-xs text-slate-600 truncate max-w-[200px] block" title={plainText}>
        {plainText || '-'}
      </span>
    );
  }

  // 10. Default Text / Date / String
  if (mode === 'detail') {
    return (
      <p className="text-xs sm:text-sm font-semibold text-slate-800">
        {String(value)}
      </p>
    );
  }

  return (
    <span className="text-xs text-slate-800 truncate max-w-[200px] block" title={String(value)}>
      {String(value)}
    </span>
  );
};
