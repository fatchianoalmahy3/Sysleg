import { createWorker } from 'tesseract.js';

export interface OcrKtpResult {
  rawText: string;
  nik?: string;
  nama?: string;
  jenisKelamin?: string;
  alamat?: string;
  rtRw?: string;
  kelDesa?: string;
  kecamatan?: string;
  confidence: number;
}

export interface OcrC1Result {
  rawText: string;
  suaraCaleg?: number;
  suaraPartai?: number;
  suaraTidakSah?: number;
  totalPenggunaHakPilih?: number;
  isArithmeticValid: boolean;
  arithmeticNotes: string[];
  confidence: number;
}

let cachedWorker: any = null;

async function getWorker(whitelist?: string) {
  if (cachedWorker) {
    if (whitelist) {
      await cachedWorker.setParameters({ tessedit_char_whitelist: whitelist });
    }
    return cachedWorker;
  }
  const worker = await createWorker('ind+eng');
  if (whitelist) {
    await worker.setParameters({ tessedit_char_whitelist: whitelist });
  }
  cachedWorker = worker;
  return worker;
}

export async function scanKtpOnDevice(
  imageSource: File | Blob | string,
  onProgress?: (progress: number, status: string) => void
): Promise<OcrKtpResult> {
  if (onProgress) onProgress(15, 'Memuat engine OCR lokal...');
  const worker = await getWorker('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz /:.-,');
  if (onProgress) onProgress(45, 'Menganalisis teks KTP...');
  const result = await worker.recognize(imageSource);
  const rawText = result.data.text;
  const confidence = result.data.confidence;
  if (onProgress) onProgress(85, 'Mengekstrak NIK dan nama pemilih...');

  let nik: string | undefined;
  const nikMatch = rawText.match(/(?:NIK|N1K|NlK|N!K)?[^\d]{0,8}(\d{16})/i) || rawText.match(/\b(\d{16})\b/);
  if (nikMatch && nikMatch[1]) nik = nikMatch[1];

  let nama: string | undefined;
  const namaMatch = rawText.match(/Nama[^\w\n]*([A-Z\s]{3,35})/i);
  if (namaMatch && namaMatch[1]) nama = namaMatch[1].replace(/[\n\r]/g, ' ').trim();

  let jenisKelamin: string | undefined;
  if (/LAKI|PRIA/i.test(rawText)) jenisKelamin = 'Laki-laki';
  else if (/PEREMPUAN|WANITA/i.test(rawText)) jenisKelamin = 'Perempuan';

  let kecamatan: string | undefined;
  const kecMatch = rawText.match(/Kecamatan[^\w\n]*([A-Z\s]{3,30})/i);
  if (kecMatch && kecMatch[1]) kecamatan = kecMatch[1].replace(/[\n\r]/g, ' ').trim();

  if (onProgress) onProgress(100, 'Selesai.');
  return { rawText, nik, nama, jenisKelamin, kecamatan, confidence };
}

export async function scanC1OnDevice(
  imageSource: File | Blob | string,
  onProgress?: (progress: number, status: string) => void
): Promise<OcrC1Result> {
  if (onProgress) onProgress(20, 'Memuat OCR angka...');
  const worker = await getWorker('0123456789\n :.-');
  if (onProgress) onProgress(50, 'Membaca perolehan suara...');
  const result = await worker.recognize(imageSource);
  const rawText = result.data.text;
  const confidence = result.data.confidence;

  const numbersFound = rawText.match(/\b\d{1,4}\b/g)?.map(n => parseInt(n, 10)) || [];
  const suaraCaleg = numbersFound.length > 0 ? numbersFound[0] : 0;
  const suaraPartai = numbersFound.length > 1 ? numbersFound[1] : suaraCaleg;
  const suaraTidakSah = numbersFound.length > 2 ? numbersFound[2] : 0;
  const totalPenggunaHakPilih = numbersFound.length > 3 ? numbersFound[3] : (suaraPartai + suaraTidakSah);

  const arithmeticNotes: string[] = [];
  let isArithmeticValid = true;

  if (suaraCaleg > suaraPartai) {
    isArithmeticValid = false;
    arithmeticNotes.push(`Suara caleg (${suaraCaleg}) tidak boleh melampaui total suara partai (${suaraPartai}).`);
  }
  if (totalPenggunaHakPilih < (suaraPartai + suaraTidakSah)) {
    isArithmeticValid = false;
    arithmeticNotes.push(`Total pengguna hak pilih (${totalPenggunaHakPilih}) kurang dari suara sah + tidak sah.`);
  }
  if (onProgress) onProgress(100, 'Validasi aritmatika selesai.');
  return { rawText, suaraCaleg, suaraPartai, suaraTidakSah, totalPenggunaHakPilih, isArithmeticValid, arithmeticNotes, confidence };
}
