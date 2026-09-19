import * as XLSX from 'xlsx';
import { ModuleSchema } from '../core/types';
import { getVisibleFields } from '../core/formatters';
import { validateRecord } from '../core/validator';

export interface ParsedImportRow {
  rowNumber: number;
  data: Record<string, any>;
  errors: string[];
  isValid: boolean;
}

export class ExcelService {
  /**
   * Helper untuk membuat ID acak ramah Firestore
   */
  public static generateUniqueId(prefix = 'doc'): string {
    const randomSuffix = Math.random().toString(36).substring(2, 9);
    const timeStamp = Date.now().toString(36).substring(4);
    return `${prefix}_${timeStamp}${randomSuffix}`;
  }

  /**
   * Export records to .xlsx file based on Module Schema
   */
  public static exportToExcel(schema: ModuleSchema, data: any[], filenamePrefix?: string) {
    // Filter out technical id field via standardized helper
    const visibleFields = getVisibleFields(schema);

    // Map data rows according to schema fields
    const exportRows = data.map((item, index) => {
      const row: Record<string, any> = {
        'No': index + 1
      };

      visibleFields.forEach((field) => {
        const val = item[field.key];
        if (field.type === 'location' && val) {
          row[field.label] = typeof val === 'object' ? (val.name || `${val.lat}, ${val.lng}`) : String(val);
        } else if (field.type === 'richtext' && val) {
          // Strip HTML tags for clean excel output
          row[field.label] = String(val).replace(/<[^>]*>?/gm, ' ').replace(/\s+/g, ' ').trim();
        } else if (field.type === 'number' && val !== undefined && val !== null) {
          row[field.label] = Number(val);
        } else {
          row[field.label] = val !== undefined && val !== null ? String(val) : '';
        }
      });

      return row;
    });

    const worksheet = XLSX.utils.json_to_sheet(exportRows);

    // Auto calculate column widths
    const columnWidths = Object.keys(exportRows[0] || {}).map((key) => {
      const maxLen = Math.max(
        key.length,
        ...exportRows.map((r) => String(r[key] || '').length)
      );
      return { wch: Math.min(Math.max(maxLen + 4, 12), 40) };
    });
    worksheet['!cols'] = columnWidths;

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, schema.title.slice(0, 31));

    const dateStr = new Date().toISOString().split('T')[0];
    const fileName = `${filenamePrefix || schema.id}_export_${dateStr}.xlsx`;
    XLSX.writeFile(workbook, fileName);
  }

  /**
   * Generate an empty template .xlsx with header columns & sample row for user to fill
   */
  public static downloadTemplate(schema: ModuleSchema) {
    const headerRow: Record<string, any> = {};
    const sampleRow: Record<string, any> = {};

    const importableFields = getVisibleFields(schema);

    importableFields.forEach((field) => {
      headerRow[field.label] = field.label;
      if (field.type === 'number') {
        sampleRow[field.label] = 100000;
      } else if (field.type === 'select' && field.options && field.options.length > 0) {
        sampleRow[field.label] = field.options[0];
      } else if (field.type === 'location') {
        sampleRow[field.label] = 'HQ Jakarta Pusat (Sudirman)';
      } else {
        sampleRow[field.label] = `Contoh ${field.label}`;
      }
    });

    const worksheet = XLSX.utils.json_to_sheet([sampleRow], { header: Object.keys(headerRow) });
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Template Import');

    XLSX.writeFile(workbook, `template_import_${schema.id}.xlsx`);
  }

  /**
   * Unduh Template Khusus Format Berita Acara KPU DPT 2024 Kabupaten Ponorogo
   */
  public static downloadKpuDptTemplate() {
    const sampleKpuRows = [
      {
        'NIK (16 Digit)': '3502011102780001',
        'Nama Lengkap Pemilih': 'Bambang Supriyanto',
        'Jenis Kelamin (L/P)': 'Laki-laki',
        'Usia': 48,
        'Provinsi': 'Jawa Timur',
        'Kabupaten': 'Kabupaten Ponorogo',
        'Kecamatan': 'Ponorogo (Kota)',
        'Desa/Kelurahan': 'Kelurahan Mangkujayan',
        'RW': '03',
        'RT': '02',
        'Nomor TPS': 'TPS 007',
        'Status Afiliasi': 'LOYALIS_PASTI',
        'Catatan Pemilih': 'Tokoh RT setempat, basis dukungan keluarga besar'
      },
      {
        'NIK (16 Digit)': '3502014506820002',
        'Nama Lengkap Pemilih': 'Sri Wahyuni, S.Pd.',
        'Jenis Kelamin (L/P)': 'Perempuan',
        'Usia': 44,
        'Provinsi': 'Jawa Timur',
        'Kabupaten': 'Kabupaten Ponorogo',
        'Kecamatan': 'Ponorogo (Kota)',
        'Desa/Kelurahan': 'Kelurahan Mangkujayan',
        'RW': '03',
        'RT': '02',
        'Nomor TPS': 'TPS 007',
        'Status Afiliasi': 'TARGET_PROSPEK',
        'Catatan Pemilih': 'Guru PAUD, respon visi caleg sangat positif'
      },
      {
        'NIK (16 Digit)': '3502022108950003',
        'Nama Lengkap Pemilih': 'Dimas Anggara Pratama',
        'Jenis Kelamin (L/P)': 'Laki-laki',
        'Usia': 30,
        'Provinsi': 'Jawa Timur',
        'Kabupaten': 'Kabupaten Ponorogo',
        'Kecamatan': 'Babadan',
        'Desa/Kelurahan': 'Desa Ngunut',
        'RW': '01',
        'RT': '04',
        'Nomor TPS': 'TPS 003',
        'Status Afiliasi': 'SWING_VOTER',
        'Catatan Pemilih': 'Pemuda sanggar reyog Ponorogo'
      },
      {
        'NIK (16 Digit)': '3502031904790005',
        'Nama Lengkap Pemilih': 'Suprapto Edi',
        'Jenis Kelamin (L/P)': 'Laki-laki',
        'Usia': 47,
        'Provinsi': 'Jawa Timur',
        'Kabupaten': 'Kabupaten Ponorogo',
        'Kecamatan': 'Siman',
        'Desa/Kelurahan': 'Desa Siman',
        'RW': '04',
        'RT': '02',
        'Nomor TPS': 'TPS 005',
        'Status Afiliasi': 'LOYALIS_PASTI',
        'Catatan Pemilih': 'Ketua kelompok tani makmur Siman'
      }
    ];

    const worksheet = XLSX.utils.json_to_sheet(sampleKpuRows);
    worksheet['!cols'] = [
      { wch: 22 }, // NIK
      { wch: 26 }, // Nama
      { wch: 20 }, // JK
      { wch: 8 },  // Usia
      { wch: 14 }, // Prov
      { wch: 20 }, // Kab
      { wch: 18 }, // Kec
      { wch: 24 }, // Desa
      { wch: 8 },  // RW
      { wch: 8 },  // RT
      { wch: 12 }, // TPS
      { wch: 18 }, // Status
      { wch: 35 }  // Catatan
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Format KPU DPT 2024');
    XLSX.writeFile(workbook, 'Template_KPU_DPT_Ponorogo_2024.xlsx');
  }

  /**
   * Parse uploaded .xlsx file against the Module Schema
   */
  public static async parseExcelFile(file: File, schema: ModuleSchema): Promise<ParsedImportRow[]> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          const rawJson: any[] = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

          if (!rawJson || rawJson.length === 0) {
            resolve([]);
            return;
          }

          // Build mapping dictionary from Label or Key to Schema Field + Common KPU Aliases
          const labelToFieldMap = new Map<string, typeof schema.fields[0]>();
          schema.fields.forEach((f) => {
            labelToFieldMap.set(f.label.toLowerCase().trim(), f);
            labelToFieldMap.set(f.key.toLowerCase().trim(), f);
          });

          // Intelligent KPU & General Electoral Column Aliases
          const findFieldByAlias = (col: string) => {
            const cleanCol = col.toLowerCase().replace(/[^a-z0-9]/g, '');
            for (const [key, field] of labelToFieldMap.entries()) {
              const cleanKey = key.toLowerCase().replace(/[^a-z0-9]/g, '');
              if (cleanCol === cleanKey) return field;
            }
            // Heuristic aliases
            if (cleanCol.includes('nik') || cleanCol.includes('noktp')) return schema.fields.find(f => f.key === 'nik');
            if (cleanCol.includes('namapemilih') || cleanCol.includes('namalengkap') || cleanCol === 'nama') return schema.fields.find(f => f.key === 'nama' || f.key === 'name');
            if (cleanCol.includes('jeniskelamin') || cleanCol === 'jk' || cleanCol === 'gender') return schema.fields.find(f => f.key === 'jenis_kelamin' || f.key === 'gender');
            if (cleanCol.includes('kecamatan') || cleanCol === 'distrik') return schema.fields.find(f => f.key === 'kecamatan');
            if (cleanCol.includes('desa') || cleanCol.includes('kelurahan')) return schema.fields.find(f => f.key === 'desa');
            if (cleanCol.includes('tps') || cleanCol.includes('nomortps')) return schema.fields.find(f => f.key === 'nomor_tps' || f.key === 'tps_tugas');
            if (cleanCol === 'rt' || cleanCol === 'nort') return schema.fields.find(f => f.key === 'rt');
            if (cleanCol === 'rw' || cleanCol === 'norw') return schema.fields.find(f => f.key === 'rw');
            if (cleanCol.includes('usia') || cleanCol.includes('umur')) return schema.fields.find(f => f.key === 'usia');
            if (cleanCol.includes('afiliasi') || cleanCol.includes('statusafiliasi')) return schema.fields.find(f => f.key === 'status_afiliasi');
            if (cleanCol.includes('targetsuara') || cleanCol === 'target') return schema.fields.find(f => f.key === 'target_suara');
            if (cleanCol.includes('jumlahdpt') || cleanCol === 'dpt') return schema.fields.find(f => f.key === 'jumlah_dpt');
            if (cleanCol.includes('statuswilayah') || cleanCol.includes('kuadran')) return schema.fields.find(f => f.key === 'status_wilayah');
            return undefined;
          };

          const results: ParsedImportRow[] = rawJson.map((row, idx) => {
            // Auto generate ID
            const parsedData: Record<string, any> = {
              id: ExcelService.generateUniqueId(schema.id.substring(0, 3))
            };
            const errors: string[] = [];

            // Map each row key to schema
            Object.entries(row).forEach(([colHeader, cellValue]) => {
              const matchedField = findFieldByAlias(colHeader);
              if (matchedField && matchedField.key !== 'id') {
                let formattedVal: any = cellValue;

                // Handle Gender normalization (L -> Laki-laki, P -> Perempuan)
                if ((matchedField.key === 'jenis_kelamin' || matchedField.key === 'gender') && typeof cellValue === 'string') {
                  const upperVal = cellValue.toUpperCase().trim();
                  if (upperVal === 'L' || upperVal.startsWith('LAKI')) {
                    formattedVal = 'Laki-laki';
                  } else if (upperVal === 'P' || upperVal.startsWith('PEREMPUAN')) {
                    formattedVal = 'Perempuan';
                  }
                }

                if (matchedField.type === 'number') {
                  const n = Number(String(cellValue).replace(/[^0-9.-]+/g, ''));
                  formattedVal = isNaN(n) ? cellValue : n;
                } else if (matchedField.type === 'location' && typeof cellValue === 'string') {
                  formattedVal = { lat: -7.8687, lng: 111.4623, name: cellValue };
                }
                parsedData[matchedField.key] = formattedVal;
              }
            });

            // Validate against schema using Universal Schema Validator
            const validation = validateRecord(schema, parsedData);
            validation.errorList.forEach(err => errors.push(err.message));

            return {
              rowNumber: idx + 2, // Excel row numbering
              data: parsedData,
              errors,
              isValid: validation.isValid
            };
          });

          resolve(results);
        } catch (err) {
          reject(err);
        }
      };

      reader.onerror = (err) => reject(err);
      reader.readAsArrayBuffer(file);
    });
  }
}
