import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { MODULE_REGISTRY } from './src/core/registry';
import { GoogleGenAI, Type } from '@google/genai';
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
    
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
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
    });

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

// API Route: Schema Registry definition (Cached with stale-while-revalidate)
app.get('/api/v1/schemas', (req, res) => {
  res.setHeader('Cache-Control', 'public, max-age=60, s-maxage=300, stale-while-revalidate=600');
  res.json({
    success: true,
    data: MODULE_REGISTRY
  });
});

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
