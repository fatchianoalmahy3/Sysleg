import { ModuleSchema, FieldSchema } from './types';
import { getVisibleFields } from './formatters';

export interface ValidationError {
  fieldKey: string;
  fieldLabel: string;
  message: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
  errorList: ValidationError[];
}

/**
 * Universal Record Validator for Forms, Excel Imports, and API Mutations
 */
export function validateRecord(schema: ModuleSchema, data: Record<string, any>): ValidationResult {
  const errors: Record<string, string> = {};
  const errorList: ValidationError[] = [];

  const visibleFields = getVisibleFields(schema);

  for (const field of visibleFields) {
    const val = data[field.key];
    const isRequired = field.validation?.required;

    // 1. Required Check
    const isBlank = val === undefined || val === null || val === '' || (typeof val === 'string' && val.trim() === '');
    
    if (isRequired && isBlank) {
      const msg = `${field.label} wajib diisi.`;
      errors[field.key] = msg;
      errorList.push({ fieldKey: field.key, fieldLabel: field.label, message: msg });
      continue;
    }

    if (isBlank) {
      continue; // Non-required blank values pass subsequent validation
    }

    // 2. Number validation (Min, Max)
    if (field.type === 'number') {
      const numVal = Number(val);
      if (isNaN(numVal)) {
        const msg = `${field.label} harus berupa angka yang valid.`;
        errors[field.key] = msg;
        errorList.push({ fieldKey: field.key, fieldLabel: field.label, message: msg });
        continue;
      }

      if (field.validation?.min !== undefined && numVal < field.validation.min) {
        const msg = `${field.label} minimal ${field.validation.min}.`;
        errors[field.key] = msg;
        errorList.push({ fieldKey: field.key, fieldLabel: field.label, message: msg });
      }

      if (field.validation?.max !== undefined && numVal > field.validation.max) {
        const msg = `${field.label} maksimal ${field.validation.max}.`;
        errors[field.key] = msg;
        errorList.push({ fieldKey: field.key, fieldLabel: field.label, message: msg });
      }
    }

    // 3. Email Validation
    if (field.type === 'email') {
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (typeof val === 'string' && !emailPattern.test(val.trim())) {
        const msg = `Format email ${field.label} tidak valid.`;
        errors[field.key] = msg;
        errorList.push({ fieldKey: field.key, fieldLabel: field.label, message: msg });
      }
    }

    // 4. Phone Validation
    if (field.type === 'phone') {
      const cleanPhone = String(val).replace(/[\s\-\+\(\)]/g, '');
      if (cleanPhone.length < 7 || cleanPhone.length > 16 || isNaN(Number(cleanPhone))) {
        const msg = `Nomor telepon ${field.label} tidak valid (minimal 7-15 digit angka).`;
        errors[field.key] = msg;
        errorList.push({ fieldKey: field.key, fieldLabel: field.label, message: msg });
      }
    }

    // 5. Custom Regex Pattern
    if (field.validation?.pattern && typeof val === 'string') {
      try {
        const regex = new RegExp(field.validation.pattern);
        if (!regex.test(val)) {
          const msg = field.validation.patternMessage || `Format ${field.label} tidak sesuai pola yang ditentukan.`;
          errors[field.key] = msg;
          errorList.push({ fieldKey: field.key, fieldLabel: field.label, message: msg });
        }
      } catch (err) {
        console.warn(`Invalid regex pattern for field ${field.key}`, err);
      }
    }

    // 5b. NIK 16-Digit Formatting Check
    if (field.key === 'nik' && val) {
      const cleanNik = String(val).trim();
      if (!/^\d{16}$/.test(cleanNik)) {
        const msg = `Nomor Induk Kependudukan (NIK) harus terdiri dari tepat 16 digit angka.`;
        errors['nik'] = msg;
        errorList.push({ fieldKey: 'nik', fieldLabel: 'NIK', message: msg });
      }
    }

    // 6. Select Options check
    if (field.type === 'select' && field.options && field.options.length > 0) {
      if (!field.options.includes(String(val))) {
        const msg = `Pilihan ${field.label} tidak valid. Harus salah satu dari: ${field.options.join(', ')}`;
        errors[field.key] = msg;
        errorList.push({ fieldKey: field.key, fieldLabel: field.label, message: msg });
      }
    }
  }

  // 7. Domain Cross-Field Checks
  // A. Quick Count C1 Mathematical Integrity
  if (schema.id === 'quick_count_c1') {
    const caleg = Number(data.suara_sah_caleg || 0);
    const totalSah = Number(data.total_suara_sah || 0);
    const tidakSah = Number(data.suara_tidak_sah || 0);
    const totalPengguna = Number(data.total_pengguna_hak_pilih || 0);

    if (caleg > totalSah) {
      const msg = `Anomali: Suara sah caleg (${caleg}) tidak boleh melebihi total seluruh suara sah di TPS (${totalSah}).`;
      errors['suara_sah_caleg'] = msg;
      errorList.push({ fieldKey: 'suara_sah_caleg', fieldLabel: 'Suara Sah Caleg', message: msg });
      data.status_audit_matematis = 'SUARA_CALEG_MELEBIHI_TOTAL';
    } else if (totalPengguna > 0 && totalPengguna !== (totalSah + tidakSah)) {
      data.status_audit_matematis = 'SELISIH_SUARA_WARNING';
    } else {
      data.status_audit_matematis = 'AUDIT_MATEMATIS_PAS_VALID';
    }

    if (!data.watermark_hash_forensik) {
      const hash = `C1-FORENSIC-SHA256-${Date.now().toString(16).toUpperCase()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
      data.watermark_hash_forensik = hash;
    }
  }

  // B. RAB Aspirasi CPV Calculation & Emergency Fund
  if (schema.id === 'rab_aspirasi') {
    const vol = Number(data.volume) || 1;
    const price = Number(data.harga_satuan_diajukan) || 0;
    const subtotal = Math.round(vol * price);
    const darurat = Math.round(subtotal * 0.05);
    const totalPagu = subtotal + darurat;
    const targetSuara = Number(data.target_suara) || 1;
    const cpv = Math.round(totalPagu / targetSuara);

    data.subtotal_pokok = subtotal;
    data.dana_darurat_5persen = darurat;
    data.alokasi_pemilih = totalPagu;
    data.cpv_unit = cpv;

    if (cpv > 100000) {
      data.status_audit_markup = 'SANGAT_BOROS_EVALUASI';
    } else if (cpv > 50000) {
      data.status_audit_markup = 'PERINGATAN_MARKUP';
    } else {
      data.status_audit_markup = 'WAJAR_SESUAI_PASAR';
    }
  }

  // C. LPJ Kegiatan SILPA & Reconciliation
  if (schema.id === 'lpj_kegiatan') {
    const diterima = Number(data.dana_diterima) || 0;
    const terpakai = Number(data.nominal_terpakai) || 0;
    const sisa = diterima - terpakai;
    data.sisa_kas_silpa = sisa;
    
    if (sisa > 0) {
      data.status_silpa = 'LEBIH_KEMBALIKAN_KAS';
    } else if (sisa < 0) {
      data.status_silpa = 'DEFISIT_KLAIM_DARURAT';
    } else {
      data.status_silpa = 'PAS_SESUAI_PAGU';
    }
  }

  return {
    isValid: errorList.length === 0,
    errors,
    errorList,
  };
}
