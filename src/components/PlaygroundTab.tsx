import React, { useState } from 'react';
import { Play, Copy, Check, Terminal, Sparkles, Clock, Coins, FileCode, CheckCircle2, AlertCircle } from 'lucide-react';
import { SessionLogEntry } from '../types';

interface PlaygroundTabProps {
  onExecutePrompt: (
    prompt: string,
    model: string,
    systemInstruction: string
  ) => Promise<{
    ok: boolean;
    text?: string;
    error?: string;
    latencyMs: number;
    usageMetadata?: {
      promptTokens: number;
      candidatesTokens: number;
      totalTokens: number;
    };
    costEstimate?: {
      totalCostUsd: string;
      promptCostUsd: string;
      outputCostUsd: string;
    };
  }>;
  onLogAdd: (log: SessionLogEntry) => void;
  isExecuting: boolean;
}

const PLAYGROUND_PRESETS = [
  {
    name: 'Fast Fact Check',
    prompt: 'What are the three most prominent architectural advancements of the Gemini 3 model family compared to earlier models?',
    systemInstruction: 'Answer concisely in 3 bullet points with a technical tone.',
  },
  {
    name: 'Code Review & Refactor',
    prompt: `function processItems(arr) {
  var res = [];
  for(var i=0; i<arr.length; i++) {
    if(arr[i] % 2 === 0) {
      res.push(arr[i] * 2);
    }
  }
  return res;
}`,
    systemInstruction: 'You are a senior TypeScript engineer. Refactor this code to clean idiomatic modern TypeScript, explaining the changes.',
  },
  {
    name: 'JSON Data Synthesis',
    prompt: 'Generate telemetry metrics for a high-availability Redis cluster (memory used, hit rate, connected clients, ops per second).',
    systemInstruction: 'Return valid raw JSON only. Do not format with markdown ticks.',
  },
];

export const PlaygroundTab: React.FC<PlaygroundTabProps> = ({
  onExecutePrompt,
  onLogAdd,
  isExecuting,
}) => {
  const [model, setModel] = useState('gemini-3.8-flash');
  const [prompt, setPrompt] = useState(PLAYGROUND_PRESETS[0].prompt);
  const [systemInstruction, setSystemInstruction] = useState(PLAYGROUND_PRESETS[0].systemInstruction);
  const [showSystemPrompt, setShowSystemPrompt] = useState(false);
  const [lastResponse, setLastResponse] = useState<any>(null);
  const [copied, setCopied] = useState(false);

  const handleRun = async () => {
    if (!prompt.trim() || isExecuting) return;

    const res = await onExecutePrompt(prompt, model, systemInstruction);
    setLastResponse(res);

    if (res.ok) {
      onLogAdd({
        id: `call_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        timestamp: new Date().toISOString(),
        type: 'execution',
        model,
        promptSnippet: prompt.substring(0, 60) + (prompt.length > 60 ? '...' : ''),
        promptTokens: res.usageMetadata?.promptTokens || 0,
        candidatesTokens: res.usageMetadata?.candidatesTokens || 0,
        totalTokens: res.usageMetadata?.totalTokens || 0,
        latencyMs: res.latencyMs,
        costUsd: parseFloat(res.costEstimate?.totalCostUsd || '0'),
        status: 'success',
      });
    } else {
      onLogAdd({
        id: `call_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        timestamp: new Date().toISOString(),
        type: 'execution',
        model,
        promptSnippet: prompt.substring(0, 60) + (prompt.length > 60 ? '...' : ''),
        promptTokens: 0,
        candidatesTokens: 0,
        totalTokens: 0,
        latencyMs: res.latencyMs,
        costUsd: 0,
        status: 'error',
        errorMessage: res.error,
      });
    }
  };

  const handleCopyOutput = () => {
    if (lastResponse?.text) {
      navigator.clipboard.writeText(lastResponse.text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Configuration Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <Terminal className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Live Request Playground & Telemetry</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Send a real test query to inspect exact candidate tokens generated, prompt tokens counted, and microsecond response latency.
              </p>
            </div>
          </div>

          {/* Model selection & Run button */}
          <div className="flex items-center gap-2.5">
            <select
              value={model}
              onChange={(e) => setModel(e.target.value)}
              className="bg-slate-800 border border-slate-700 text-white text-xs rounded-lg px-3 py-2 font-mono focus:outline-none focus:border-blue-500 cursor-pointer"
            >
              <option value="gemini-3.8-flash">gemini-3.8-flash (Default)</option>
              <option value="gemini-3.1-flash-lite">gemini-3.1-flash-lite (Ultra-fast)</option>
            </select>

            <button
              onClick={handleRun}
              disabled={isExecuting || !prompt.trim()}
              className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold rounded-lg text-xs shadow-md shadow-blue-600/20 flex items-center gap-1.5 cursor-pointer disabled:opacity-50 transition-all"
            >
              <Play className={`w-3.5 h-3.5 fill-current ${isExecuting ? 'animate-pulse' : ''}`} />
              <span>{isExecuting ? 'Calling Gemini...' : 'Send Request'}</span>
            </button>
          </div>
        </div>

        {/* Quick Presets */}
        <div className="mt-4 pt-4 border-t border-slate-800/80 flex flex-wrap items-center gap-2 text-xs">
          <span className="text-slate-500 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>Preset Tests:</span>
          </span>
          {PLAYGROUND_PRESETS.map((p) => (
            <button
              key={p.name}
              onClick={() => {
                setPrompt(p.prompt);
                setSystemInstruction(p.systemInstruction);
                if (p.systemInstruction) setShowSystemPrompt(true);
              }}
              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/60 transition-colors cursor-pointer"
            >
              {p.name}
            </button>
          ))}
          <button
            onClick={() => setShowSystemPrompt(!showSystemPrompt)}
            className="ml-auto text-xs text-blue-400 hover:text-blue-300 transition-colors cursor-pointer"
          >
            {showSystemPrompt ? 'Hide System Prompt' : '+ Add System Prompt'}
          </button>
        </div>
      </div>

      {/* Editor & Response Area */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Prompt Input */}
        <div className="space-y-4">
          {showSystemPrompt && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
              <label className="block text-xs font-semibold text-slate-300 mb-2">
                System Instruction (Optional)
              </label>
              <textarea
                value={systemInstruction}
                onChange={(e) => setSystemInstruction(e.target.value)}
                placeholder="e.g. You are an expert data science tutor..."
                rows={3}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs font-mono text-slate-300 focus:outline-none focus:border-blue-500"
              />
            </div>
          )}

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col h-[380px]">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-slate-300">Prompt Contents</label>
              <span className="text-[11px] font-mono text-slate-500">{prompt.length} chars</span>
            </div>

            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Enter your prompt here..."
              className="w-full flex-1 bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm font-mono text-slate-200 placeholder-slate-600 focus:outline-none focus:border-blue-500 resize-none leading-relaxed"
            />

            <div className="mt-3 flex items-center justify-between">
              <span className="text-xs text-slate-500">Press Send to test quota & measure usage</span>
              <button
                onClick={handleRun}
                disabled={isExecuting || !prompt.trim()}
                className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-lg text-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <Play className="w-3 h-3 fill-current" />
                <span>Run</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right: Output & Telemetry */}
        <div className="space-y-4">
          {/* Live Telemetry Bar */}
          {lastResponse && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Call Telemetry
                </span>
                <span
                  className={`text-xs px-2.5 py-0.5 rounded-full font-medium flex items-center gap-1 ${
                    lastResponse.ok
                      ? 'bg-emerald-950/50 text-emerald-400 border border-emerald-500/30'
                      : 'bg-rose-950/50 text-rose-400 border border-rose-500/30'
                  }`}
                >
                  {lastResponse.ok ? (
                    <>
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Success (200 OK)</span>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="w-3 h-3" />
                      <span>Failed</span>
                    </>
                  )}
                </span>
              </div>

              <div className="grid grid-cols-4 gap-2 text-center">
                <div className="bg-slate-800/50 p-2 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">Latency</span>
                  <div className="flex items-center justify-center gap-1 mt-0.5">
                    <Clock className="w-3 h-3 text-sky-400" />
                    <span className="text-sm font-bold font-mono text-white">
                      {lastResponse.latencyMs}ms
                    </span>
                  </div>
                </div>

                <div className="bg-slate-800/50 p-2 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">Prompt Tok</span>
                  <span className="text-sm font-bold font-mono text-blue-400">
                    {lastResponse.usageMetadata?.promptTokens ?? 0}
                  </span>
                </div>

                <div className="bg-slate-800/50 p-2 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">Output Tok</span>
                  <span className="text-sm font-bold font-mono text-indigo-400">
                    {lastResponse.usageMetadata?.candidatesTokens ?? 0}
                  </span>
                </div>

                <div className="bg-slate-800/50 p-2 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">Call Cost</span>
                  <span className="text-sm font-bold font-mono text-emerald-400">
                    ${lastResponse.costEstimate?.totalCostUsd ?? '0.00000'}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Model Output Container */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col h-[380px]">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <FileCode className="w-3.5 h-3.5 text-blue-400" />
                <span>Response Output</span>
              </label>

              {lastResponse?.text && (
                <button
                  onClick={handleCopyOutput}
                  className="flex items-center gap-1 text-xs text-slate-400 hover:text-white px-2 py-1 rounded hover:bg-slate-800 cursor-pointer transition-colors"
                >
                  {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copied ? 'Copied' : 'Copy Output'}</span>
                </button>
              )}
            </div>

            <div className="flex-1 bg-slate-950 border border-slate-800 rounded-xl p-3.5 overflow-y-auto font-mono text-xs text-slate-200 whitespace-pre-wrap leading-relaxed">
              {isExecuting ? (
                <div className="h-full flex items-center justify-center text-slate-500 gap-2">
                  <div className="w-2 h-2 rounded-full bg-blue-500 animate-ping"></div>
                  <span>Streaming token generation from Gemini...</span>
                </div>
              ) : lastResponse?.ok ? (
                lastResponse.text
              ) : lastResponse?.error ? (
                <div className="text-rose-400 p-2 rounded bg-rose-950/20 border border-rose-500/20">
                  <strong>Error executing call:</strong>
                  <p className="mt-1">{lastResponse.error}</p>
                </div>
              ) : (
                <div className="h-full flex items-center justify-center text-slate-600 text-center px-4">
                  Run a request from the left panel to test token usage and view the generated output here.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
