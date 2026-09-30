import React, { useState, useEffect } from 'react';
import { Calculator, Copy, Check, Sparkles, FileText, Layers, TrendingDown, Info } from 'lucide-react';
import { TokenCountResult } from '../types';

interface TokenCalculatorTabProps {
  onCountTokens: (text: string, model: string) => Promise<TokenCountResult | null>;
  isCounting: boolean;
}

const PRESETS = [
  {
    name: 'Short Prompt',
    tokensEstimate: '~25 tokens',
    text: 'Explain quantum computing to a high school student in three concise bullet points.',
  },
  {
    name: 'TypeScript Component',
    tokensEstimate: '~320 tokens',
    text: `import React, { useState, useEffect } from 'react';

interface MetricProps {
  label: string;
  value: number;
  unit?: string;
  trend?: 'up' | 'down';
}

export const MetricCard: React.FC<MetricProps> = ({ label, value, unit, trend }) => {
  const [animatedVal, setAnimatedVal] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => setAnimatedVal(value), 50);
    return () => clearTimeout(timer);
  }, [value]);

  return (
    <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl">
      <span className="text-xs text-slate-400">{label}</span>
      <div className="mt-1 flex items-baseline gap-1">
        <span className="text-2xl font-bold font-mono text-white">{animatedVal}</span>
        {unit && <span className="text-xs text-slate-500">{unit}</span>}
      </div>
    </div>
  );
};`,
  },
  {
    name: 'System Prompt + JSON Schema',
    tokensEstimate: '~480 tokens',
    text: `You are an elite data extraction agent. Analyze the provided customer conversation and extract structured telemetry.
Return strictly valid JSON conforming to this schema:
{
  "customerId": "string (UUID)",
  "sentiment": "POSITIVE | NEUTRAL | NEGATIVE",
  "urgencyScore": "number (1-10)",
  "intentCategory": "BILLING | TECHNICAL | ACCOUNT_MANAGEMENT | FEATURE_REQUEST",
  "actionItems": [
    {
      "assignedTeam": "string",
      "dueDate": "ISO8601 string",
      "priority": "HIGH | MEDIUM | LOW",
      "description": "string"
    }
  ],
  "requiresManagerEscalation": "boolean"
}
Rules:
1. Never hallucinate IDs.
2. Keep action descriptions under 30 words.
3. No Markdown code fences around output.`,
  },
  {
    name: 'Document Analysis (1,500 words)',
    tokensEstimate: '~1,950 tokens',
    text: `ANNUAL INFRASTRUCTURE & SCALABILITY REPORT
Executive Summary:
Over the past 12 calendar months, our global cloud architecture experienced a 340% increase in daily active queries, necessitating a comprehensive migration from legacy monolithic instances to decoupled, microservice-oriented serverless workers. Key milestones include decreasing median p99 latency from 1,240ms to 280ms, eliminating regional single-points-of-failure, and automating cold-start warming routines across 14 geographical regions.

Section 1: Capacity Planning and Quota Allocation
To maintain sub-second response times during peak burst intervals (typically 09:00 to 14:00 UTC), worker pools were configured with horizontal auto-scaling thresholds triggered when CPU utilization exceeds 65% for three consecutive evaluation cycles. Cache hit ratios improved from 42% to 88% following the implementation of distributed edge caching layers, resulting in an estimated 52% reduction in recurring compute expenditures.

Section 2: Cost Optimization and Token Budgeting
With the introduction of large language models for real-time document summarization and semantic indexing, token throughput rose to approximately 45 million tokens daily. By adopting context caching for recurrent system instructions and standard schema prefixes, billable input tokens decreased by 41.5%, maintaining operational costs well below our quarterly capital expenditure ceiling.

Section 3: Security, Compliance and Resiliency
All data in transit remains strictly encrypted with TLS 1.3, utilizing ephemeral ECDSA keys. Role-based access control (RBAC) was unified across all microservices, ensuring least-privilege principles are enforced for all automated service accounts. Zero downtime was recorded during five major database schema migrations conducted throughout Q2 and Q3.`,
  },
];

export const TokenCalculatorTab: React.FC<TokenCalculatorTabProps> = ({
  onCountTokens,
  isCounting,
}) => {
  const [inputText, setInputText] = useState(PRESETS[0].text);
  const [selectedModel, setSelectedModel] = useState('gemini-3.8-flash');
  const [countResult, setCountResult] = useState<TokenCountResult | null>(null);
  const [copied, setCopied] = useState(false);

  // Character, word, and line count
  const charCount = inputText.length;
  const wordCount = inputText.trim() ? inputText.trim().split(/\s+/).length : 0;
  const lineCount = inputText ? inputText.split('\n').length : 0;

  // Run token count when input changes or model changes (debounced)
  useEffect(() => {
    const handler = setTimeout(async () => {
      if (!inputText.trim()) {
        setCountResult(null);
        return;
      }
      const result = await onCountTokens(inputText, selectedModel);
      if (result) {
        setCountResult(result);
      }
    }, 400);

    return () => clearTimeout(handler);
  }, [inputText, selectedModel]);

  const handleCopy = () => {
    navigator.clipboard.writeText(inputText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const tokens = countResult?.totalTokens || Math.ceil(charCount / 4);
  const contextWindow = 1048576; // 1M tokens for Gemini 3.8 Flash
  const contextPercent = ((tokens / contextWindow) * 100).toFixed(4);

  // Pricing calculations
  const costFlash = (tokens * 0.075) / 1000000;
  const costFlashLite = (tokens * 0.0375) / 1000000;
  const costPro = (tokens * 1.25) / 1000000;
  const costCachedFlash = (tokens * 0.01875) / 1000000;

  return (
    <div className="space-y-6">
      {/* Intro Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <Calculator className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Interactive Token Counter & Cost Estimator</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Calculates precise tokens using the official Gemini SDK <code className="text-blue-400 font-mono">countTokens</code> API and estimates context window utilization & pricing.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">Target Model:</span>
            <select
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              className="bg-slate-800 border border-slate-700 text-white text-xs rounded-lg px-3 py-1.5 focus:outline-none focus:border-blue-500 cursor-pointer font-mono"
            >
              <option value="gemini-3.8-flash">gemini-3.8-flash (Standard)</option>
              <option value="gemini-3.1-flash-lite">gemini-3.1-flash-lite (Ultra-fast)</option>
              <option value="gemini-3.1-pro-preview">gemini-3.1-pro-preview (Deep reasoning)</option>
            </select>
          </div>
        </div>

        {/* Preset Sample Buttons */}
        <div className="mt-4 pt-4 border-t border-slate-800/80 flex flex-wrap items-center gap-2">
          <span className="text-xs text-slate-500 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-blue-400" />
            <span>Load Preset:</span>
          </span>
          {PRESETS.map((preset) => (
            <button
              key={preset.name}
              onClick={() => setInputText(preset.text)}
              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs transition-colors border border-slate-700/60 cursor-pointer flex items-center gap-1.5"
            >
              <span>{preset.name}</span>
              <span className="text-[10px] text-slate-500 font-mono">({preset.tokensEstimate})</span>
            </button>
          ))}
          {inputText && (
            <button
              onClick={() => setInputText('')}
              className="ml-auto text-xs text-slate-500 hover:text-rose-400 transition-colors cursor-pointer"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Main Grid: Text Area & Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Input Text Area (7 cols) */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3 text-xs text-slate-400 font-mono">
              <span>{charCount.toLocaleString()} chars</span>
              <span>•</span>
              <span>{wordCount.toLocaleString()} words</span>
              <span>•</span>
              <span>{lineCount.toLocaleString()} lines</span>
            </div>
            <button
              onClick={handleCopy}
              className="flex items-center gap-1 text-xs text-slate-400 hover:text-white px-2 py-1 rounded hover:bg-slate-800 transition-colors cursor-pointer"
              title="Copy input text"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>

          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Type or paste your prompt, document, JSON schema, or code here..."
            rows={14}
            className="w-full flex-1 bg-slate-950 border border-slate-800 rounded-xl p-4 text-sm font-mono text-slate-200 placeholder-slate-600 focus:outline-none focus:border-blue-500 resize-none leading-relaxed"
          />

          <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
            <span>Live auto-counting via server-side Gemini SDK</span>
            {isCounting && <span className="text-blue-400 font-mono animate-pulse">Calculating tokens...</span>}
          </div>
        </div>

        {/* Token Count & Price Matrix (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Token Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                Computed Tokens
              </span>
              <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950/40 border border-emerald-500/30 px-2 py-0.5 rounded">
                {countResult?.method === 'gemini_sdk_countTokens' ? 'Gemini Official SDK' : 'Estimating'}
              </span>
            </div>

            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-4xl font-extrabold text-white font-mono">
                {tokens.toLocaleString()}
              </span>
              <span className="text-sm text-slate-400 font-mono">tokens</span>
            </div>

            {/* Context Window Gauge */}
            <div className="mt-4 pt-4 border-t border-slate-800">
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-400">Context Window Utilization:</span>
                <span className="font-mono text-indigo-400 font-semibold">{contextPercent}%</span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-indigo-500 h-full rounded-full transition-all duration-300"
                  style={{ width: `${Math.max(1, parseFloat(contextPercent) * 10)}%` }}
                />
              </div>
              <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-1">
                <span>0</span>
                <span>Max: 1,048,576 tokens</span>
              </div>
            </div>
          </div>

          {/* Pricing Comparison Across Models */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm">
            <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-blue-400" />
              <span>Input Cost For This Text</span>
            </h3>

            <div className="space-y-2.5 text-xs">
              {/* Gemini 3.8 Flash */}
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-800/60 border border-slate-800">
                <div>
                  <span className="font-semibold text-white block">Gemini 3.8 Flash</span>
                  <span className="text-[11px] text-slate-400">$0.075 / 1M tokens</span>
                </div>
                <div className="text-right">
                  <span className="font-mono font-bold text-emerald-400 text-sm">
                    ${costFlash.toFixed(6)}
                  </span>
                  <span className="text-[10px] text-slate-500 block">per query</span>
                </div>
              </div>

              {/* Gemini 3.1 Flash Lite */}
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-800/60 border border-slate-800">
                <div>
                  <span className="font-semibold text-white block">Gemini 3.1 Flash Lite</span>
                  <span className="text-[11px] text-slate-400">$0.0375 / 1M tokens</span>
                </div>
                <div className="text-right">
                  <span className="font-mono font-bold text-sky-400 text-sm">
                    ${costFlashLite.toFixed(6)}
                  </span>
                  <span className="text-[10px] text-slate-500 block">50% cheaper</span>
                </div>
              </div>

              {/* Gemini 3.1 Pro Preview */}
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-800/60 border border-slate-800">
                <div>
                  <span className="font-semibold text-white block">Gemini 3.1 Pro Preview</span>
                  <span className="text-[11px] text-slate-400">$1.25 / 1M tokens</span>
                </div>
                <div className="text-right">
                  <span className="font-mono font-bold text-purple-400 text-sm">
                    ${costPro.toFixed(6)}
                  </span>
                  <span className="text-[10px] text-slate-500 block">deep reasoning</span>
                </div>
              </div>

              {/* Cached Context */}
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-emerald-950/20 border border-emerald-500/20">
                <div className="flex items-center gap-1.5">
                  <TrendingDown className="w-3.5 h-3.5 text-emerald-400" />
                  <div>
                    <span className="font-semibold text-emerald-300 block">Cached Prompt Price</span>
                    <span className="text-[10px] text-emerald-400/80">With Context Caching ($0.01875/1M)</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="font-mono font-bold text-emerald-300 text-sm">
                    ${costCachedFlash.toFixed(6)}
                  </span>
                  <span className="text-[10px] text-emerald-400/70 block">75% discount</span>
                </div>
              </div>
            </div>

            <div className="mt-3 pt-3 border-t border-slate-800 text-[11px] text-slate-500 flex items-start gap-1.5">
              <Info className="w-3.5 h-3.5 shrink-0 mt-0.5 text-slate-400" />
              <span>
                Under Google AI Studio Free Tier, up to 1,500 daily requests are $0.00 billed. Paid pricing activates when linked to a billing project.
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
