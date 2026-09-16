/**
 * Dapil Guard & Anti-Data Fiktif Protocol
 * Validates Indonesian NIK structure, geographical boundary constraints,
 * and ensures KTP belongs to the candidate's assigned electoral district (Dapil).
 */

export interface DapilConfig {
  dapilName: string;
  kabupatenCode: string; // e.g. "3205" for Garut, "3510" for Banyuwangi
  kabupatenName: string;
  kecamatanList: {
    code: string; // 6 digit NIK prefix (e.g. "320521")
    name: string;
    desaList?: string[];
  }[];
}

// Default Configuration: Dapil Kabupaten Example (e.g., Dapil 1 Kabupaten dengan 3 Kecamatan Utama)
// Can be configured / adjusted per candidate requirement
export const ACTIVE_DAPIL_CONFIG: DapilConfig = {
  dapilName: "Dapil 1 (Pusat Kota & Sekitarnya)",
  kabupatenCode: "3205", // Garut example or generic
  kabupatenName: "Kabupaten Wilayah Pemenangan",
  kecamatanList: [
    { code: "320521", name: "Tarogong Kidul" },
    { code: "320533", name: "Tarogong Kaler" },
    { code: "320501", name: "Garut Kota" },
    { code: "320502", name: "Karangpawitan" }
  ]
};

export interface NikValidationResult {
  isValid: boolean;
  nikCleaned: string;
  isInsideDapil: boolean;
  rejectReason?: string;
  parsedData?: {
    provinsiCode: string;
    kabupatenCode: string;
    kecamatanCode: string;
    kecamatanName?: string;
    birthDate?: string;
    gender?: 'Laki-laki' | 'Perempuan';
    sequenceNumber: string;
  };
}

/**
 * Validates NIK integrity and performs automatic hard-reject if outside Dapil boundary.
 */
export function validateNikWithDapilGuard(
  nikInput: string, 
  config: DapilConfig = ACTIVE_DAPIL_CONFIG
): NikValidationResult {
  if (!nikInput) {
    return { isValid: false, nikCleaned: '', isInsideDapil: false, rejectReason: 'NIK wajib diisi.' };
  }

  // Clean non-digits
  const cleaned = nikInput.replace(/\D/g, '');

  if (cleaned.length !== 16) {
    return {
      isValid: false,
      nikCleaned: cleaned,
      isInsideDapil: false,
      rejectReason: `Format NIK tidak sah: Wajib tepat 16 digit angka (terdeteksi ${cleaned.length} digit).`
    };
  }

  // Breakdown 16 digit NIK: PP KK CC HH BB TT NNNN
  const provCode = cleaned.substring(0, 2);
  const kabCode = cleaned.substring(0, 4);
  const kecCode = cleaned.substring(0, 6);
  let day = parseInt(cleaned.substring(6, 8), 10);
  const month = parseInt(cleaned.substring(8, 10), 10);
  const yearShort = cleaned.substring(10, 12);
  const sequence = cleaned.substring(12, 16);

  // Gender & Birthdate check
  let gender: 'Laki-laki' | 'Perempuan' = 'Laki-laki';
  if (day > 40) {
    gender = 'Perempuan';
    day = day - 40; // Women have +40 in Indonesian NIK
  }

  // Basic date validity check
  if (day < 1 || day > 31 || month < 1 || month > 12) {
    return {
      isValid: false,
      nikCleaned: cleaned,
      isInsideDapil: false,
      rejectReason: `Indikasi Data Fiktif: Tanggal/Bulan Lahir pada NIK (${day}/${month}) tidak valid.`
    };
  }

  // Check sequence number (cannot be 0000)
  if (sequence === '0000') {
    return {
      isValid: false,
      nikCleaned: cleaned,
      isInsideDapil: false,
      rejectReason: 'Indikasi Data Fiktif: Nomor urut seri NIK tidak boleh 0000.'
    };
  }

  // Check Kabupaten match (optional soft or hard warning)
  // Check Kecamatan in Dapil Whitelist (HARD REJECT NON-DAPIL)
  const matchedKecamatan = config.kecamatanList.find(k => k.code === kecCode);

  if (!matchedKecamatan) {
    const matchedKecamatanNames = config.kecamatanList.map(k => `${k.name} (${k.code})`).join(', ');
    return {
      isValid: false,
      nikCleaned: cleaned,
      isInsideDapil: false,
      rejectReason: `⛔ KTP DITOLAK SISTEM: NIK (${cleaned}) teridentifikasi di luar cakupan ${config.dapilName}. Sistem hanya menerima pemilih dari kecamatan: ${matchedKecamatanNames}.`,
      parsedData: {
        provinsiCode: provCode,
        kabupatenCode: kabCode,
        kecamatanCode: kecCode,
        sequenceNumber: sequence
      }
    };
  }

  return {
    isValid: true,
    nikCleaned: cleaned,
    isInsideDapil: true,
    parsedData: {
      provinsiCode: provCode,
      kabupatenCode: kabCode,
      kecamatanCode: kecCode,
      kecamatanName: matchedKecamatan.name,
      birthDate: `${day.toString().padStart(2, '0')}/${month.toString().padStart(2, '0')}/${yearShort}`,
      gender,
      sequenceNumber: sequence
    }
  };
}
