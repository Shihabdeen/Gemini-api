import React from 'react';
import {
  ShieldCheck,
  AlertTriangle,
  RefreshCw,
  Server,
  Zap,
  CheckCircle2,
  Key,
  ExternalLink,
  Cpu,
  Clock,
  HelpCircle,
} from 'lucide-react';
import { SystemStatus, ProbeResult } from '../types';

interface LiveProbeTabProps {
  status: SystemStatus | null;
  probeResult: ProbeResult | null;
  isProbing: boolean;
  onProbe: () => void;
}

export const LiveProbeTab: React.FC<LiveProbeTabProps> = ({
  status,
  probeResult,
  isProbing,
  onProbe,
}) => {
  return (
    <div className="space-y-6">
      {/* 1. Main Live Health Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="flex items-start gap-4">
            <div
              className={`p-3.5 rounded-2xl ${
                probeResult?.ok
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                  : probeResult === null
                  ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                  : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
              }`}
            >
              {probeResult?.ok ? (
                <ShieldCheck className="w-8 h-8" />
              ) : probeResult === null ? (
                <Zap className="w-8 h-8" />
              ) : (
                <AlertTriangle className="w-8 h-8" />
              )}
            </div>

            <div>
              <div className="flex items-center gap-2.5">
                <h2 className="text-xl font-bold text-white">Live API Connectivity & Quota Probe</h2>
                {probeResult && (
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                      probeResult.ok
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                    }`}
                  >
                    {probeResult.quotaStatus}
                  </span>
                )}
              </div>
              <p className="text-sm text-slate-400 mt-1 max-w-2xl">
                Executes a live lightweight probe via the official{' '}
                <code className="text-blue-400 bg-slate-800 px-1 py-0.5 rounded text-xs font-mono">
                  @google/genai
                </code>{' '}
                SDK to test your server-side API key, measure latency, verify quota availability, and inspect token consumption metadata.
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3">
            <button
              onClick={onProbe}
              disabled={isProbing}
              className="w-full sm:w-auto px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold rounded-xl text-sm shadow-md shadow-blue-600/20 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isProbing ? 'animate-spin' : ''}`} />
              <span>{isProbing ? 'Executing Probe...' : 'Run Quota Health Check'}</span>
            </button>
          </div>
        </div>

        {/* Probe Metrics Display */}
        {probeResult && (
          <div className="mt-6 pt-6 border-t border-slate-800/80">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-slate-800/50 p-3.5 rounded-xl border border-slate-800">
                <span className="text-xs text-slate-400 block">Response Code</span>
                <span
                  className={`text-lg font-bold font-mono ${
                    probeResult.ok ? 'text-emerald-400' : 'text-rose-400'
                  }`}
                >
                  {probeResult.statusCode} {probeResult.ok ? 'OK' : 'Error'}
                </span>
                <span className="text-[11px] text-slate-500 block mt-0.5">HTTP status</span>
              </div>

              <div className="bg-slate-800/50 p-3.5 rounded-xl border border-slate-800">
                <span className="text-xs text-slate-400 block">Round-trip Latency</span>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <Clock className="w-4 h-4 text-sky-400" />
                  <span className="text-lg font-bold font-mono text-white">
                    {probeResult.latencyMs} ms
                  </span>
                </div>
                <span className="text-[11px] text-slate-500 block">Server to Gemini API</span>
              </div>

              <div className="bg-slate-800/50 p-3.5 rounded-xl border border-slate-800">
                <span className="text-xs text-slate-400 block">Tokens In Probe</span>
                <span className="text-lg font-bold font-mono text-indigo-400">
                  {probeResult.usageMetadata?.totalTokens ?? 0}
                </span>
                <span className="text-[11px] text-slate-500 block">
                  {probeResult.usageMetadata?.promptTokens ?? 0} prompt /{' '}
                  {probeResult.usageMetadata?.candidatesTokens ?? 0} output
                </span>
              </div>

              <div className="bg-slate-800/50 p-3.5 rounded-xl border border-slate-800">
                <span className="text-xs text-slate-400 block">Probe Micro-Cost</span>
                <span className="text-lg font-bold font-mono text-emerald-400">
                  ${probeResult.estimatedCostUsd ?? '0.000000'}
                </span>
                <span className="text-[11px] text-slate-500 block">USD estimated</span>
              </div>
            </div>

            {/* Error or Success Notice */}
            {!probeResult.ok && (
              <div className="mt-4 p-4 rounded-xl bg-rose-950/30 border border-rose-500/30 text-rose-200 text-sm">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-rose-300">Diagnostic Details</h4>
                    <p className="mt-1 font-mono text-xs text-rose-300/90 break-all">
                      {probeResult.error}
                    </p>
                    {probeResult.suggestion && (
                      <p className="mt-2 text-xs text-slate-300 bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
                        <strong className="text-blue-400">Recommended Action:</strong>{' '}
                        {probeResult.suggestion}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {probeResult.ok && (
              <div className="mt-4 p-3.5 rounded-xl bg-emerald-950/20 border border-emerald-500/20 text-emerald-200 text-xs flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>
                    <strong>Quota Healthy:</strong> Gemini 3.8 Flash returned <em>"{probeResult.responseSample}"</em> in {probeResult.latencyMs}ms.
                  </span>
                </div>
                <span className="font-mono text-slate-400 text-[11px]">
                  Probe timestamp: {new Date(probeResult.timestamp).toLocaleTimeString()}
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 2. Environment & Key Configuration Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* API Key & Quota Tier Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <Key className="w-4 h-4 text-blue-400" />
              <h3 className="font-semibold text-white text-sm">API Key & Tier Configuration</h3>
            </div>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
              AI Studio Injected
            </span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between py-2 border-b border-slate-800/80">
              <span className="text-slate-400">Environment Key State:</span>
              <span className="font-medium text-emerald-400 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                {status?.apiKeyConfigured ? 'Attached in Environment' : 'Not Detected'}
              </span>
            </div>

            <div className="flex items-center justify-between py-2 border-b border-slate-800/80">
              <span className="text-slate-400">Key Fingerprint:</span>
              <span className="font-mono text-slate-300 bg-slate-800/80 px-2 py-0.5 rounded border border-slate-700/60">
                {status?.keyPrefix || 'AIza...configured'}
              </span>
            </div>

            <div className="flex items-center justify-between py-2 border-b border-slate-800/80">
              <span className="text-slate-400">Active Quota Tier:</span>
              <span className="font-medium text-blue-300">
                {status?.activeTierEstimate || 'Free Tier (1,500 RPD)'}
              </span>
            </div>

            <div className="flex items-center justify-between py-2">
              <span className="text-slate-400">Default Test Model:</span>
              <span className="font-mono text-sky-400 font-semibold">gemini-3.8-flash</span>
            </div>
          </div>

          <div className="mt-4 p-3 rounded-xl bg-slate-800/40 border border-slate-800 text-xs text-slate-400">
            <p className="leading-relaxed">
              API keys in Google AI Studio are securely injected into the backend via{' '}
              <strong className="text-slate-300">Settings &gt; Secrets</strong>. The client never sees your raw key.
            </p>
          </div>
        </div>

        {/* Runtime Server & Cloud Run Telemetry */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <Server className="w-4 h-4 text-indigo-400" />
              <h3 className="font-semibold text-white text-sm">Host Runtime & Container Health</h3>
            </div>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
              Cloud Run
            </span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between py-2 border-b border-slate-800/80">
              <span className="text-slate-400">Container Uptime:</span>
              <span className="font-mono text-slate-300">
                {status?.system.uptimeSeconds
                  ? `${Math.floor(status.system.uptimeSeconds / 60)}m ${status.system.uptimeSeconds % 60}s`
                  : '0m 30s'}
              </span>
            </div>

            <div className="flex items-center justify-between py-2 border-b border-slate-800/80">
              <span className="text-slate-400">Node.js Engine:</span>
              <span className="font-mono text-slate-300">{status?.system.nodeVersion || 'v22.x'}</span>
            </div>

            <div className="flex items-center justify-between py-2 border-b border-slate-800/80">
              <span className="text-slate-400">Memory Usage (RSS / Heap):</span>
              <span className="font-mono text-slate-300">
                {status?.system.memoryUsage.rssMb || '45'} MB RSS /{' '}
                {status?.system.memoryUsage.heapUsedMb || '22'} MB Heap
              </span>
            </div>

            <div className="flex items-center justify-between py-2">
              <span className="text-slate-400">User Account:</span>
              <span className="font-mono text-blue-400 truncate max-w-[200px]" title={status?.account.email}>
                {status?.account.email || 'shihabdeen2018@gmail.com'}
              </span>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between pt-1">
            <span className="text-[11px] text-slate-500">Region: asia-southeast1</span>
            <a
              href="https://console.cloud.google.com/billing"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 transition-colors"
            >
              <span>GCP Billing Console</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </div>

      {/* 3. Common Troubleshooting & Quota Exhaustion Guidance */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5">
        <h3 className="font-semibold text-white text-sm flex items-center gap-2 mb-3">
          <HelpCircle className="w-4 h-4 text-sky-400" />
          <span>Understanding Quota Codes & Resolution Steps</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="bg-slate-800/50 p-3.5 rounded-xl border border-slate-700/60">
            <span className="font-mono font-bold text-emerald-400 block mb-1">200 OK (Healthy)</span>
            <p className="text-slate-400 leading-relaxed">
              Requests are succeeding. You are within the 15 RPM, 1,000,000 TPM, and 1,500 RPD bounds of the free tier.
            </p>
          </div>

          <div className="bg-slate-800/50 p-3.5 rounded-xl border border-slate-700/60">
            <span className="font-mono font-bold text-amber-400 block mb-1">429 RESOURCE_EXHAUSTED</span>
            <p className="text-slate-400 leading-relaxed">
              Rate limit or daily quota reached. Rate limit resets every 60 seconds; daily 1,500 RPD resets at midnight PST. Or attach a billing project in AI Studio for 1,000 RPM.
            </p>
          </div>

          <div className="bg-slate-800/50 p-3.5 rounded-xl border border-slate-700/60">
            <span className="font-mono font-bold text-rose-400 block mb-1">403 PERMISSION_DENIED</span>
            <p className="text-slate-400 leading-relaxed">
              The model requires billing enabled (e.g. Gemini 3.1 Pro or image models), or the API key has restrictions. Configure in AI Studio Settings.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
