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

    // 6. Select Options check
    if (field.type === 'select' && field.options && field.options.length > 0) {
      if (!field.options.includes(String(val))) {
        const msg = `Pilihan ${field.label} tidak valid. Harus salah satu dari: ${field.options.join(', ')}`;
        errors[field.key] = msg;
        errorList.push({ fieldKey: field.key, fieldLabel: field.label, message: msg });
      }
    }
  }

  return {
    isValid: errorList.length === 0,
    errors,
    errorList,
  };
}
