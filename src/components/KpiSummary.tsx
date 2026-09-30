import React from 'react';
import { Gauge, Zap, Database, DollarSign, Clock, CheckCircle2 } from 'lucide-react';
import { SessionLogEntry } from '../types';

interface KpiSummaryProps {
  logs: SessionLogEntry[];
  dailyAllowance: number;
  budgetLimit: number;
  latestLatency: number | null;
}

export const KpiSummary: React.FC<KpiSummaryProps> = ({
  logs,
  dailyAllowance = 1500,
  budgetLimit = 5.0,
  latestLatency,
}) => {
  const totalCalls = logs.length;
  const successfulCalls = logs.filter((l) => l.status === 'success').length;
  const totalPromptTokens = logs.reduce((acc, curr) => acc + (curr.promptTokens || 0), 0);
  const totalCandidatesTokens = logs.reduce((acc, curr) => acc + (curr.candidatesTokens || 0), 0);
  const totalTokens = totalPromptTokens + totalCandidatesTokens;
  const totalCost = logs.reduce((acc, curr) => acc + (curr.costUsd || 0), 0);

  const avgLatency =
    successfulCalls > 0
      ? Math.round(
          logs.filter((l) => l.status === 'success').reduce((acc, curr) => acc + curr.latencyMs, 0) /
            successfulCalls
        )
      : latestLatency || 0;

  // Percentage of daily 1500 requests used
  const dailyUsedPercent = Math.min(100, Math.max(0, (totalCalls / dailyAllowance) * 100));
  const budgetUsedPercent = Math.min(100, Math.max(0, (totalCost / budgetLimit) * 100));

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. Daily Quota (RPD) */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 shadow-sm hover:border-slate-700 transition-colors">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-slate-400">Daily Free Quota (RPD)</span>
          <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
            <Gauge className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2.5 flex items-baseline gap-2">
          <span className="text-2xl font-bold text-white font-mono">{totalCalls}</span>
          <span className="text-xs text-slate-400 font-mono">/ {dailyAllowance.toLocaleString()} reqs</span>
        </div>
        {/* Progress Bar */}
        <div className="mt-3">
          <div className="flex justify-between text-[11px] text-slate-400 mb-1">
            <span>{dailyUsedPercent.toFixed(1)}% Used</span>
            <span>{Math.max(0, dailyAllowance - totalCalls).toLocaleString()} Left</span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                dailyUsedPercent > 80 ? 'bg-amber-500' : 'bg-blue-500'
              }`}
              style={{ width: `${Math.max(2, dailyUsedPercent)}%` }}
            />
          </div>
        </div>
        <div className="mt-2.5 text-[11px] text-slate-500 flex items-center gap-1">
          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
          <span>Resets midnight PST (00:00 Pacific)</span>
        </div>
      </div>

      {/* 2. Rate Limits (RPM / TPM) */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 shadow-sm hover:border-slate-700 transition-colors">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-slate-400">Active Model Limits</span>
          <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
            <Zap className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2.5 flex items-baseline gap-1.5">
          <span className="text-xl font-bold text-white font-mono">15 RPM</span>
          <span className="text-xs text-slate-400">/ 1M TPM</span>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-2 text-[11px]">
          <div className="bg-slate-800/60 p-2 rounded-lg border border-slate-800">
            <span className="text-slate-400 block">Context Window</span>
            <span className="text-indigo-300 font-mono font-semibold">1,048,576</span>
          </div>
          <div className="bg-slate-800/60 p-2 rounded-lg border border-slate-800">
            <span className="text-slate-400 block">Max Output</span>
            <span className="text-indigo-300 font-mono font-semibold">65,536 tok</span>
          </div>
        </div>
        <div className="mt-2 text-[11px] text-slate-500">
          <span>Gemini 3.8 Flash default standard tier</span>
        </div>
      </div>

      {/* 3. Total Tokens Consumed */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 shadow-sm hover:border-slate-700 transition-colors">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-slate-400">Session Tokens</span>
          <div className="p-2 rounded-lg bg-sky-500/10 text-sky-400">
            <Database className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2.5 flex items-baseline gap-2">
          <span className="text-2xl font-bold text-white font-mono">{totalTokens.toLocaleString()}</span>
          <span className="text-xs text-slate-400">tokens</span>
        </div>
        <div className="mt-3 flex justify-between text-[11px] text-slate-400 bg-slate-800/60 p-2 rounded-lg border border-slate-800">
          <div>
            <span className="text-slate-500 block">Prompt:</span>
            <span className="font-mono text-slate-300 font-semibold">{totalPromptTokens.toLocaleString()}</span>
          </div>
          <div className="text-right">
            <span className="text-slate-500 block">Output:</span>
            <span className="font-mono text-slate-300 font-semibold">{totalCandidatesTokens.toLocaleString()}</span>
          </div>
        </div>
        <div className="mt-2 text-[11px] text-slate-500">
          <span>Calculated via official usageMetadata</span>
        </div>
      </div>

      {/* 4. Estimated Spend & Budget */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 shadow-sm hover:border-slate-700 transition-colors">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-slate-400">Estimated Cost & Latency</span>
          <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
            <DollarSign className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2.5 flex items-baseline justify-between">
          <div>
            <span className="text-2xl font-bold text-emerald-400 font-mono">${totalCost.toFixed(5)}</span>
            <span className="text-xs text-slate-400 ml-1">USD</span>
          </div>
          <div className="flex items-center gap-1 text-xs text-slate-300 bg-slate-800/80 px-2 py-1 rounded-md border border-slate-700">
            <Clock className="w-3 h-3 text-sky-400" />
            <span className="font-mono font-medium">{avgLatency} ms</span>
          </div>
        </div>
        {/* Budget Bar */}
        <div className="mt-3">
          <div className="flex justify-between text-[11px] text-slate-400 mb-1">
            <span>Budget: ${totalCost.toFixed(3)} / ${budgetLimit.toFixed(2)}</span>
            <span className="text-emerald-400 font-medium">Free Tier ($0.00 billed)</span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-emerald-500 h-full rounded-full transition-all duration-300"
              style={{ width: `${Math.max(1, budgetUsedPercent)}%` }}
            />
          </div>
        </div>
        <div className="mt-2 text-[11px] text-slate-500">
          <span>Standard tier: $0.075 / 1M prompt, $0.30 / 1M output</span>
        </div>
      </div>
    </div>
  );
};
