export interface ModelPricing {
  inputPer1M: number;
  outputPer1M: number;
  cachedPer1M?: number;
  perImagePrice?: number;
}

export interface ModelLimits {
  free: {
    rpm: number;
    tpm: number;
    rpd: number | string;
  };
  paid: {
    rpm: number;
    tpm: number;
    rpd: number | string;
  };
}

export interface ModelSpec {
  id: string;
  name: string;
  description: string;
  category: string;
  tier: string;
  contextWindow: number;
  maxOutputTokens: number;
  limits: ModelLimits;
  pricing: ModelPricing;
  recommendedFor: string;
  isPaidOnly: boolean;
  status: string;
}

export interface SystemStatus {
  ok: boolean;
  apiKeyConfigured: boolean;
  keyPrefix: string | null;
  account: {
    email: string;
    appUrl: string;
    appletId: string;
  };
  system: {
    nodeVersion: string;
    platform: string;
    uptimeSeconds: number;
    memoryUsage: {
      rssMb: string;
      heapUsedMb: string;
      heapTotalMb: string;
    };
  };
  activeTierEstimate: string;
  dailyQuotaAllowance: number;
  modelsCount: number;
  timestamp: string;
}

export interface ProbeResult {
  ok: boolean;
  statusCode: number;
  quotaStatus: string;
  statusMessage?: string;
  model?: string;
  latencyMs: number;
  responseSample?: string;
  usageMetadata?: {
    promptTokens: number;
    candidatesTokens: number;
    totalTokens: number;
    cachedTokens: number;
  };
  estimatedCostUsd?: string;
  error?: string;
  suggestion?: string;
  timestamp: string;
}

export interface TokenCountResult {
  ok: boolean;
  totalTokens: number;
  method: string;
  model: string;
  characterCount: number;
  contextUtilizationPercent?: string;
  estimatedCostUsd?: string;
  error?: string;
}

export interface SessionLogEntry {
  id: string;
  timestamp: string;
  type: 'probe' | 'execution' | 'token_count';
  model: string;
  promptSnippet: string;
  promptTokens: number;
  candidatesTokens: number;
  totalTokens: number;
  latencyMs: number;
  costUsd: number;
  status: 'success' | 'error';
  errorMessage?: string;
}
