import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { MODULE_REGISTRY } from './src/core/registry';
import { GoogleGenAI, Type } from '@google/genai';

async function withRetry(fn, retries = 3, delay = 1000) {
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === retries - 1) throw error;
      console.warn(`API error: ${error.message}. Retrying in ${delay}ms...`);
      await new Promise(res => setTimeout(res, delay));
    }
  }
}

import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = 3000;

// Body parser
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// AI Auditor API
app.post('/api/audit-rab', async (req, res) => {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ success: false, error: 'GEMINI_API_KEY is not configured.' });
    }

    const { description } = req.body;
    if (!description) {
      return res.status(400).json({ success: false, error: 'Description is required.' });
    }

    const ai = new GoogleGenAI({ apiKey });
    
    const response = await withRetry(() => ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: `You are a strict financial auditor in West Java, Indonesia. Estimate the fair market total cost for the following logistics needs: "${description}".
Return ONLY a valid JSON object with no markdown formatting. The JSON must have exactly this schema:
{
  "estimatedCost": number (the fair market price in Rupiah for all items combined),
  "itemsFound": string[] (list of items you identified),
  "reasoning": string (brief explanation of your estimate)
}`,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            estimatedCost: { type: Type.INTEGER },
            itemsFound: { type: Type.ARRAY, items: { type: Type.STRING } },
            reasoning: { type: Type.STRING }
          },
          required: ["estimatedCost", "itemsFound", "reasoning"]
        }
      }
    }));

    const text = response.text;
    if (!text) throw new Error("Empty response from AI");

    const result = JSON.parse(text);
    // Add 5% safety margin
    const margin = Math.round(result.estimatedCost * 0.05);
    const approvedCost = result.estimatedCost + margin;

    res.json({
      success: true,
      data: {
        ...result,
        marginAdded: margin,
        approvedCost
      }
    });
  } catch (error: any) {
    console.error("AI Audit error:", error);
    res.status(500).json({ success: false, error: error.message || 'Failed to calculate RAB.' });
  }
});

// AI Regional Political & Logistics Price Benchmark API (Sangat Hemat Token & Terintegrasi)
app.post('/api/ai/benchmark-harga-lokal', async (req, res) => {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ success: false, error: 'GEMINI_API_KEY is not configured.' });
    }

    const { provinsi = 'Jawa Timur', kabupaten_kota = 'Kabupaten Ponorogo', nama_dapil = '' } = req.body;

    const ai = new GoogleGenAI({ apiKey });
    
    const prompt = `Anda adalah konsultan intelijen logistik pemilu dan auditor anggaran politik di Indonesia.
Tentukan standar rentang harga pasar yang wajar (batas bawah dan batas atas) untuk komoditas logistik kampanye dan operasional pemilu di wilayah:
- Provinsi: ${provinsi}
- Kabupaten/Kota: ${kabupaten_kota}
- Dapil: ${nama_dapil || 'Semua Dapil'}

Berikan taksiran harga realistis dalam mata uang Rupiah untuk 6 kategori wajib:
1. Honor Saksi TPS (per orang per hari-H pencoblosan & rekapitulasi)
2. Cetak Spanduk / Banner MMT (per meter persegi bahan standar outdoor)
3. Konsumsi / Nasi Box Pertemuan Warga (per porsi lengkap)
4. Uang Transport Relawan Door-to-Door / Canvasser (per orang per hari aktif)
5. Sewa Sound System & Tenda Pertemuan RW/Desa (per paket acara kecil)
6. Paket Sembako / Bantuan Aspirasi Warga Sederhana (per paket sembako dasar)

Keluarkan data HANYA dalam JSON terstruktur:
{
  "kabupaten_kota": "${kabupaten_kota}",
  "provinsi": "${provinsi}",
  "items": [
    {
      "kategori": string,
      "satuan": string,
      "harga_bawah": number,
      "harga_atas": number,
      "catatan_wilayah": string
    }
  ],
  "ringkasan_ekonomi_lokal": string
}`;

    const response = await withRetry(() => ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            kabupaten_kota: { type: Type.STRING },
            provinsi: { type: Type.STRING },
            items: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  kategori: { type: Type.STRING },
                  satuan: { type: Type.STRING },
                  harga_bawah: { type: Type.INTEGER },
                  harga_atas: { type: Type.INTEGER },
                  catatan_wilayah: { type: Type.STRING }
                },
                required: ["kategori", "satuan", "harga_bawah", "harga_atas", "catatan_wilayah"]
              }
            },
            ringkasan_ekonomi_lokal: { type: Type.STRING }
          },
          required: ["kabupaten_kota", "provinsi", "items", "ringkasan_ekonomi_lokal"]
        }
      }
    }));

    const text = response.text;
    if (!text) throw new Error("Empty response from AI");
    const parsed = JSON.parse(text);

    res.json({
      success: true,
      data: parsed
    });
  } catch (error: any) {
    console.error("AI Price Benchmark error:", error);
    res.status(500).json({ success: false, error: error.message || 'Gagal menghasilkan benchmark harga daerah.' });
  }
});

// AI Victory Strategist API (Rencana Aksi Kemenangan & Sainte-Laguë Makro)
app.post('/api/ai/strategi-kemenangan', async (req, res) => {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ success: false, error: 'GEMINI_API_KEY is not configured.' });
    }

    const { 
      nama_caleg = 'Calon Legislatif', 
      partai = 'Partai Pengusung',
      dapil = 'Dapil Terkait',
      total_dpt = 250000, 
      target_suara = 45000, 
      suara_terkunci = 28000,
      posisi_kursi = 'Kursi ke-6 (Aman Sementara)',
      safety_margin = 1250,
      battleground_kecamatan = ['Babadan', 'Jenangan', 'Kauman'],
      total_pengeluaran = 450000000,
      cpv_saat_ini = 16071
    } = req.body;

    const ai = new GoogleGenAI({ apiKey });

    const prompt = `Anda adalah Panglima Strategi Pemenangan Pemilu dan Konsultan Utama untuk Caleg:
- Caleg: ${nama_caleg} (${partai})
- Wilayah: ${dapil}
- Data Agregat Suara:
  * Total DPT: ${total_dpt.toLocaleString('id-ID')}
  * Target Suara: ${target_suara.toLocaleString('id-ID')}
  * Suara Terkunci Saat Ini: ${suara_terkunci.toLocaleString('id-ID')} (Capaian: ${Math.round((suara_terkunci / target_suara) * 100)}%)
  * Gap Suara Menuju Target: ${(target_suara - suara_terkunci).toLocaleString('id-ID')} suara
- Simulasi Parlemen (Sainte-Laguë):
  * Posisi Kursi: ${posisi_kursi}
  * Safety Margin (Jarak Aman ke Kursi Terakhir): ${safety_margin.toLocaleString('id-ID')} suara
- Wilayah Kritis / Medan Tempur (Battleground): ${battleground_kecamatan.join(', ')}
- Metrik Keuangan:
  * Total Dana Terpakai: Rp ${total_pengeluaran.toLocaleString('id-ID')}
  * Rata-rata Cost-per-Vote (CPV): Rp ${cpv_saat_ini.toLocaleString('id-ID')} / suara

Sebagai ahli strategi pemilu dan efisiensi dana:
Susun 3-4 arahan aksi taktis yang tegas, lugas, realistis, dan berorientasi pada kemenangan kursi parlemen.
Fokuskan pada:
1. Wilayah Prioritas Gerilya (ke mana Caleg & relawan harus mengarahkan energi).
2. Pertahanan Kursi Sainte-Laguë (cara mengunci gap suara kritis).
3. Disiplin Keuangan & Audit Biaya (cara mencegah bakar uang sia-sia).

Kembalikan dalam JSON terstruktur:
{
  "status_kesiapan": string (contoh: "SIAGA TINGGI - PERANG KURSI TERAKHIR" atau "STABIL - FOKUS KAWAL C1"),
  "prioritas_wilayah_utama": string,
  "arahan_taktis": [
    {
      "pilar": string (misal: "GERILYA WILAYAH", "SAINTE-LAGUE DEFENSE", "EFISIENSI DANA"),
      "tindakan_konkret": string,
      "alasan_data": string
    }
  ],
  "pesan_panglima": string (pesan motivasi taktis 1 paragraf untuk Caleg dan Timses)
}`;

    const response = await withRetry(() => ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            status_kesiapan: { type: Type.STRING },
            prioritas_wilayah_utama: { type: Type.STRING },
            arahan_taktis: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  pilar: { type: Type.STRING },
                  tindakan_konkret: { type: Type.STRING },
                  alasan_data: { type: Type.STRING }
                },
                required: ["pilar", "tindakan_konkret", "alasan_data"]
              }
            },
            pesan_panglima: { type: Type.STRING }
          },
          required: ["status_kesiapan", "prioritas_wilayah_utama", "arahan_taktis", "pesan_panglima"]
        }
      }
    }));

    const text = response.text;
    if (!text) throw new Error("Empty response from AI");
    const parsed = JSON.parse(text);

    res.json({
      success: true,
      data: parsed
    });
  } catch (error: any) {
    console.error("AI Strategy Generator error:", error);
    res.status(500).json({ success: false, error: error.message || 'Gagal menghasilkan strategi kemenangan.' });
  }
});

// API Route: Schema Registry definition (Cached with stale-while-revalidate)
app.get('/api/v1/schemas', (req, res) => {
  res.setHeader('Cache-Control', 'public, max-age=60, s-maxage=300, stale-while-revalidate=600');
  res.json({
    success: true,
    data: MODULE_REGISTRY
  });
});

// Serve static assets from public folder
app.use(express.static(path.join(process.cwd(), 'public')));

// Vite Middleware for Full Stack Dev & Prod Serving
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Starter Kit Backend] Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
