import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = parseInt(process.env.PORT || '3000', 10);

app.use(express.json({ limit: '10mb' }));

// Initialize GoogleGenAI SDK on server side with 'aistudio-build' User-Agent
const apiKey = process.env.GEMINI_API_KEY || '';
let ai: GoogleGenAI | null = null;

if (apiKey) {
  ai = new GoogleGenAI({
    apiKey: apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Model specifications, rate limits and pricing catalog
const MODEL_SPECS = [
  {
    id: 'gemini-3.8-flash',
    name: 'Gemini 3.8 Flash',
    description: 'Next-gen workhorse model for high-frequency text and multimodal reasoning tasks.',
    category: 'Core Text & Multimodal',
    tier: 'Free & Pay-as-you-go',
    contextWindow: 1048576,
    maxOutputTokens: 65536,
    limits: {
      free: { rpm: 15, tpm: 1000000, rpd: 1500 },
      paid: { rpm: 1000, tpm: 4000000, rpd: 'Unlimited' },
    },
    pricing: {
      inputPer1M: 0.075,
      outputPer1M: 0.30,
      cachedPer1M: 0.01875,
    },
    recommendedFor: 'Summarization, analysis, fast Q&A, chat, JSON extraction',
    isPaidOnly: false,
    status: 'Active',
  },
  {
    id: 'gemini-3.1-flash-lite',
    name: 'Gemini 3.1 Flash Lite',
    description: 'Ultra-low latency, budget-optimized model for high-throughput micro-tasks.',
    category: 'Fast / Lightweight',
    tier: 'Free & Pay-as-you-go',
    contextWindow: 1048576,
    maxOutputTokens: 65536,
    limits: {
      free: { rpm: 15, tpm: 1000000, rpd: 1500 },
      paid: { rpm: 1000, tpm: 4000000, rpd: 'Unlimited' },
    },
    pricing: {
      inputPer1M: 0.0375,
      outputPer1M: 0.15,
      cachedPer1M: 0.009375,
    },
    recommendedFor: 'High-throughput parsing, classification, live assistance',
    isPaidOnly: false,
    status: 'Active',
  },
  {
    id: 'gemini-3.1-pro-preview',
    name: 'Gemini 3.1 Pro Preview',
    description: 'Flagship reasoning and STEM/coding intelligence model for complex problems.',
    category: 'Advanced Reasoning',
    tier: 'Pay-as-you-go',
    contextWindow: 2097152,
    maxOutputTokens: 65536,
    limits: {
      free: { rpm: 0, tpm: 0, rpd: 0 },
      paid: { rpm: 360, tpm: 2000000, rpd: 'Unlimited' },
    },
    pricing: {
      inputPer1M: 1.25,
      outputPer1M: 5.00,
      cachedPer1M: 0.3125,
    },
    recommendedFor: 'Complex math, architecture, deep code refactoring, multi-turn reasoning',
    isPaidOnly: true,
    status: 'Paid Key Required',
  },
  {
    id: 'gemini-3.1-flash-image',
    name: 'Gemini 3.1 Flash Image',
    description: 'High-fidelity image generation and editing model with aspect ratio control.',
    category: 'Image Generation',
    tier: 'Pay-as-you-go',
    contextWindow: 32768,
    maxOutputTokens: 8192,
    limits: {
      free: { rpm: 0, tpm: 0, rpd: 0 },
      paid: { rpm: 60, tpm: 100000, rpd: 'Unlimited' },
    },
    pricing: {
      inputPer1M: 0.10,
      outputPer1M: 0.40,
      perImagePrice: 0.03,
    },
    recommendedFor: 'Visual asset design, UI mockups, graphic synthesis',
    isPaidOnly: true,
    status: 'Paid Key Required',
  },
  {
    id: 'gemini-3.8-live',
    name: 'Gemini 3.8 Live',
    description: 'Ultra-low latency bidirectional real-time audio and speech streaming.',
    category: 'Real-time Audio / Live API',
    tier: 'Free & Pay-as-you-go',
    contextWindow: 128000,
    maxOutputTokens: 8192,
    limits: {
      free: { rpm: 3, tpm: 30000, rpd: 100 },
      paid: { rpm: 60, tpm: 500000, rpd: 'Unlimited' },
    },
    pricing: {
      inputPer1M: 0.30,
      outputPer1M: 1.20,
    },
    recommendedFor: 'Voice agents, hands-free dialogues, conversational workflows',
    isPaidOnly: false,
    status: 'Active',
  },
  {
    id: 'gemini-embedding-2-preview',
    name: 'Gemini Embedding 2 Preview',
    description: 'State-of-the-art multimodal vector embeddings for semantic search and RAG.',
    category: 'Embeddings & Vectors',
    tier: 'Free & Pay-as-you-go',
    contextWindow: 8192,
    maxOutputTokens: 0,
    limits: {
      free: { rpm: 15, tpm: 1000000, rpd: 1500 },
      paid: { rpm: 1500, tpm: 5000000, rpd: 'Unlimited' },
    },
    pricing: {
      inputPer1M: 0.02,
      outputPer1M: 0.00,
    },
    recommendedFor: 'Vector similarity, document clustering, RAG retrieval',
    isPaidOnly: false,
    status: 'Active',
  },
];

// Helper to extract clean error message and retry info from Google GenAI errors
function extractErrorDetails(error: any) {
  let cleanMessage = error?.message || 'Unknown error';
  let retryDelay: string | null = null;
  let quotaMetric: string | null = null;

  try {
    const parsed = typeof error.message === 'string' && error.message.startsWith('{')
      ? JSON.parse(error.message)
      : null;

    if (parsed?.error) {
      if (parsed.error.message) {
        cleanMessage = parsed.error.message;
      }
      if (Array.isArray(parsed.error.details)) {
        const retryInfo = parsed.error.details.find((d: any) => d['@type']?.includes('RetryInfo'));
        if (retryInfo?.retryDelay) {
          retryDelay = retryInfo.retryDelay;
        }
        const quotaFailure = parsed.error.details.find((d: any) => d['@type']?.includes('QuotaFailure'));
        if (quotaFailure?.violations?.[0]?.quotaMetric) {
          quotaMetric = quotaFailure.violations[0].quotaMetric;
        }
      }
    }
  } catch (_) {
    // keep original string
  }

  return { cleanMessage, retryDelay, quotaMetric };
}
app.get('/api/usage/status', (req: Request, res: Response) => {
  const memory = process.memoryUsage();
  const uptimeSeconds = Math.floor(process.uptime());

  res.json({
    ok: true,
    apiKeyConfigured: Boolean(apiKey),
    keyPrefix: apiKey ? `${apiKey.substring(0, 4)}...${apiKey.substring(apiKey.length - 4)}` : null,
    account: {
      email: 'shihabdeen2018@gmail.com',
      appUrl: process.env.APP_URL || 'https://ais-dev-eiwf4ofwxrlvyhv2ekhypg-399016935881.asia-southeast1.run.app',
      appletId: 'bf5ed202-89b0-4776-9572-1b9069809700',
    },
    system: {
      nodeVersion: process.version,
      platform: process.platform,
      uptimeSeconds,
      memoryUsage: {
        rssMb: (memory.rss / (1024 * 1024)).toFixed(1),
        heapUsedMb: (memory.heapUsed / (1024 * 1024)).toFixed(1),
        heapTotalMb: (memory.heapTotal / (1024 * 1024)).toFixed(1),
      },
    },
    activeTierEstimate: 'Free Tier / Standard Project',
    dailyQuotaAllowance: 1500,
    modelsCount: MODEL_SPECS.length,
    timestamp: new Date().toISOString(),
  });
});

// 2. API: Live Probe to check API key quota & connectivity
app.post('/api/usage/probe', async (req: Request, res: Response) => {
  if (!apiKey || !ai) {
    return res.status(400).json({
      ok: false,
      error: 'GEMINI_API_KEY is not configured in the application environment.',
      statusCode: 400,
      quotaStatus: 'NO_KEY',
      suggestion: 'Configure your API key in Settings > Secrets.',
    });
  }

  const startTime = Date.now();
  const modelsToTry = ['gemini-3.8-flash', 'gemini-3.1-flash-lite'];

  for (const modelToTest of modelsToTry) {
    try {
      const probeResponse = await ai.models.generateContent({
        model: modelToTest,
        contents: 'Ping test for quota check. Return "OK".',
        config: {
          temperature: 0.1,
        },
      });

      const latencyMs = Date.now() - startTime;
      const usageMetadata = probeResponse.usageMetadata || {
        promptTokenCount: 9,
        candidatesTokenCount: 2,
        totalTokenCount: 11,
      };

      return res.json({
        ok: true,
        statusCode: 200,
        quotaStatus: 'HEALTHY',
        statusMessage: `Gemini API is reachable and responding within expected latency via ${modelToTest}.`,
        model: modelToTest,
        latencyMs,
        responseSample: probeResponse.text?.trim() || 'OK',
        usageMetadata: {
          promptTokens: usageMetadata.promptTokenCount || 0,
          candidatesTokens: usageMetadata.candidatesTokenCount || 0,
          totalTokens: usageMetadata.totalTokenCount || 0,
          cachedTokens: usageMetadata.cachedContentTokenCount || 0,
        },
        estimatedCostUsd: (
          ((usageMetadata.promptTokenCount || 0) * 0.075 + (usageMetadata.candidatesTokenCount || 0) * 0.3) /
          1000000
        ).toFixed(7),
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      const { cleanMessage, retryDelay, quotaMetric } = extractErrorDetails(error);

      // If it's a 503 high demand spike and we have another model to try, continue loop
      if (cleanMessage.includes('503') || cleanMessage.includes('high demand') || cleanMessage.includes('UNAVAILABLE')) {
        if (modelToTest === modelsToTry[0]) {
          continue;
        }
      }

      const latencyMs = Date.now() - startTime;
      const status = error?.status || 500;

      let quotaStatus = 'ERROR';
      let suggestion = 'Review your API key configuration and rate limits.';

      if (cleanMessage.includes('429') || cleanMessage.includes('RESOURCE_EXHAUSTED') || cleanMessage.includes('Quota exceeded')) {
        quotaStatus = 'EXHAUSTED_OR_RATE_LIMITED';
        suggestion = retryDelay
          ? `Free tier burst rate limit reached. Google recommends waiting ${retryDelay} before retrying, or linking billing in Settings > Secrets for 1,000 RPM.`
          : 'You have hit the Gemini API rate limit or daily quota. Wait a few moments or link billing in Settings > Secrets.';
      } else if (cleanMessage.includes('403') || cleanMessage.includes('PERMISSION_DENIED')) {
        quotaStatus = 'PERMISSION_DENIED';
        suggestion = 'The API key does not have permission to access this model. Ensure the key is active in Settings > Secrets.';
      } else if (cleanMessage.includes('API_KEY_INVALID') || cleanMessage.includes('400')) {
        quotaStatus = 'INVALID_KEY';
        suggestion = 'The current API key is invalid. Please select or generate a valid key in Settings > Secrets.';
      } else if (cleanMessage.includes('503') || cleanMessage.includes('high demand') || cleanMessage.includes('UNAVAILABLE')) {
        quotaStatus = 'HIGH_DEMAND_SPIKE';
        suggestion = 'Gemini servers are experiencing a temporary demand spike for this model. Try again in a few moments.';
      }

      return res.status(200).json({
        ok: false,
        statusCode: status,
        quotaStatus,
        latencyMs,
        error: cleanMessage,
        retryDelay,
        quotaMetric,
        suggestion,
        timestamp: new Date().toISOString(),
      });
    }
  }
});

// 3. API: Count Tokens accurately using Gemini SDK
app.post('/api/usage/count-tokens', async (req: Request, res: Response) => {
  const { text = '', model = 'gemini-3.8-flash' } = req.body;

  if (!apiKey || !ai) {
    // Provide a close approximation if no key (approx 4 chars per token)
    const approximateTokens = Math.ceil(text.length / 4) || 0;
    return res.json({
      ok: true,
      totalTokens: approximateTokens,
      method: 'heuristic_approximation',
      model,
      characterCount: text.length,
      note: 'API key not configured; calculated using standard 4-char rule.',
    });
  }

  try {
    const tokenResponse = await ai.models.countTokens({
      model,
      contents: text || ' ',
    });

    const totalTokens = tokenResponse.totalTokens || 0;
    const modelSpec = MODEL_SPECS.find((m) => m.id === model) || MODEL_SPECS[0];
    const estimatedCostUsd = ((totalTokens * modelSpec.pricing.inputPer1M) / 1000000).toFixed(6);

    return res.json({
      ok: true,
      totalTokens,
      method: 'gemini_sdk_countTokens',
      model,
      characterCount: text.length,
      contextUtilizationPercent: ((totalTokens / modelSpec.contextWindow) * 100).toFixed(4),
      estimatedCostUsd,
    });
  } catch (error: any) {
    const approximateTokens = Math.ceil(text.length / 4) || 0;
    return res.json({
      ok: false,
      totalTokens: approximateTokens,
      method: 'heuristic_fallback',
      model,
      characterCount: text.length,
      error: error?.message || 'Failed to call countTokens',
    });
  }
});

// 4. API: Execute a test prompt and return full usage telemetry
app.post('/api/usage/execute', async (req: Request, res: Response) => {
  const { prompt = '', model = 'gemini-3.8-flash', systemInstruction = '' } = req.body;

  if (!prompt.trim()) {
    return res.status(400).json({ ok: false, error: 'Prompt is required.' });
  }

  if (!apiKey || !ai) {
    return res.status(400).json({
      ok: false,
      error: 'GEMINI_API_KEY is missing. Please set your API key in Settings > Secrets.',
    });
  }

  const startTime = Date.now();
  try {
    const config: any = {
      temperature: 0.7,
    };
    if (systemInstruction?.trim()) {
      config.systemInstruction = systemInstruction.trim();
    }

    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config,
    });

    const latencyMs = Date.now() - startTime;
    const usageMetadata = response.usageMetadata || {
      promptTokenCount: Math.ceil(prompt.length / 4),
      candidatesTokenCount: Math.ceil((response.text?.length || 0) / 4),
      totalTokenCount: Math.ceil((prompt.length + (response.text?.length || 0)) / 4),
    };

    const modelSpec = MODEL_SPECS.find((m) => m.id === model) || MODEL_SPECS[0];
    const promptCost = ((usageMetadata.promptTokenCount || 0) * modelSpec.pricing.inputPer1M) / 1000000;
    const outputCost = ((usageMetadata.candidatesTokenCount || 0) * modelSpec.pricing.outputPer1M) / 1000000;
    const totalCostUsd = (promptCost + outputCost).toFixed(6);

    return res.json({
      ok: true,
      text: response.text || '',
      model,
      latencyMs,
      usageMetadata: {
        promptTokens: usageMetadata.promptTokenCount || 0,
        candidatesTokens: usageMetadata.candidatesTokenCount || 0,
        totalTokens: usageMetadata.totalTokenCount || 0,
        cachedTokens: usageMetadata.cachedContentTokenCount || 0,
      },
      costEstimate: {
        promptCostUsd: promptCost.toFixed(6),
        outputCostUsd: outputCost.toFixed(6),
        totalCostUsd,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    const latencyMs = Date.now() - startTime;
    const { cleanMessage, retryDelay, quotaMetric } = extractErrorDetails(error);

    return res.status(200).json({
      ok: false,
      error: cleanMessage,
      retryDelay,
      quotaMetric,
      latencyMs,
      statusCode: error?.status || 500,
    });
  }
});

// 5. API: Models catalog and limits
app.get('/api/usage/models', (req: Request, res: Response) => {
  res.json({
    ok: true,
    models: MODEL_SPECS,
    freeTierAllowances: {
      description: 'Free tier limits apply per project/API key. Rate limits refresh every minute; daily quotas refresh at midnight PST.',
      standardRpm: 15,
      standardTpm: 1000000,
      standardRpd: 1500,
    },
  });
});

// Vite or Static handling
async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`[Usage Monitor Server] running on http://0.0.0.0:${port}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
