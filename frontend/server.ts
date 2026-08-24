import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import { parseSolidityContract } from './src/services/analyzerEngine.js';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '10mb' }));

  // Initialize Gemini API client lazily on server side only
  let aiClient: GoogleGenAI | null = null;
  function getGeminiClient(): GoogleGenAI | null {
    if (!aiClient) {
      const apiKey = process.env.GEMINI_API_KEY;
      if (apiKey) {
        aiClient = new GoogleGenAI({ apiKey });
      }
    }
    return aiClient;
  }

  // --- API ROUTES ---

  // Health check endpoint
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      service: 'SentinelX Analysis API & FastAPI XGBoost Engine',
      timestamp: new Date().toISOString(),
      models: {
        xgboost: 'v2.4-tree384',
        shapExplainer: 'v0.42.1',
        fastapiEngine: '0.111.0'
      }
    });
  });

  // Analyze smart contract endpoint (Proxies to Python FastAPI backend engine)
  app.post('/api/analyze', async (req, res): Promise<any> => {
    try {
      const { sourceCode, contractName, address, network, chain } = req.body;
      if (!sourceCode && !address) {
        return res.status(400).json({ error: 'Please provide sourceCode or address for smart contract analysis.' });
      }

      const input = (address && address.trim()) || (sourceCode && sourceCode.trim()) || '';

      try {
        const pyRes = await fetch('http://127.0.0.1:8000/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ input, chain: chain || 'ETH' }),
        });

        if (pyRes.ok) {
          const pyResult = await pyRes.json();
          return res.json({ success: true, report: pyResult, source: 'fastapi_xgboost' });
        }
      } catch (backendErr) {
        console.warn('FastAPI backend proxy error, using JS fallback:', backendErr);
      }

      const codeToAnalyze = sourceCode || `// Contract fetched from address ${address}`;
      const report = parseSolidityContract(codeToAnalyze, contractName || 'AnalyzedContract');

      if (address) report.address = address;
      if (network) report.network = network as any;

      return res.json({ success: true, report, source: 'js_fallback' });
    } catch (err: any) {
      console.error('Analysis error:', err);
      return res.status(500).json({ error: err.message || 'Error executing ML contract analysis' });
    }
  });


  // Optional AI Security Reasoning via server-side Gemini SDK
  app.post('/api/ai-audit-insights', async (req, res): Promise<any> => {
    try {
      const { sourceCode, report } = req.body;
      const ai = getGeminiClient();

      if (!ai) {
        return res.json({
          success: true,
          insight: 'AI deep explanation: The contract exhibit typical XGBoost feature weights for rug pull risk vectors. Ensure liquidity is locked and ownership permissions are bounded.',
          isSimulated: true
        });
      }

      const prompt = `You are a Senior Smart Contract Auditor. Analyze this report and code snippet concisely in 3 bullet points focusing on rug pull security, SHAP feature impact, and bytecode risk vectors:\nReport Risk Score: ${report.riskScore}\nReport Risk Level: ${report.riskLevel}\nCode:\n${(sourceCode || '').substring(0, 1500)}`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt
      });

      return res.json({
        success: true,
        insight: response.text || 'Analysis completed successfully.',
        isSimulated: false
      });
    } catch (err: any) {
      console.error('Gemini API error:', err);
      return res.json({
        success: true,
        insight: 'ML feature extraction and AST analysis complete. High impact features identified.',
        isSimulated: true
      });
    }
  });

  // Serve Vite Dev Server middleware in Development mode
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Production static file serving
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[SentinelX] Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
