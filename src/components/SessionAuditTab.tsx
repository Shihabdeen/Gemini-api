import React, { useState } from 'react';
import { History, Download, Trash2, CheckCircle2, AlertCircle, Clock, Filter, Coins, ShieldAlert } from 'lucide-react';
import { SessionLogEntry } from '../types';

interface SessionAuditTabProps {
  logs: SessionLogEntry[];
  budgetLimit: number;
  onBudgetChange: (newLimit: number) => void;
  onClearLogs: () => void;
}

export const SessionAuditTab: React.FC<SessionAuditTabProps> = ({
  logs,
  budgetLimit,
  onBudgetChange,
  onClearLogs,
}) => {
  const [filterType, setFilterType] = useState<string>('ALL');

  const filteredLogs = logs.filter((l) => {
    if (filterType === 'ALL') return true;
    if (filterType === 'SUCCESS') return l.status === 'success';
    if (filterType === 'ERROR') return l.status === 'error';
    return true;
  });

  const totalCost = logs.reduce((acc, curr) => acc + (curr.costUsd || 0), 0);
  const totalTokens = logs.reduce((acc, curr) => acc + (curr.totalTokens || 0), 0);
  const isBudgetWarning = totalCost >= budgetLimit * 0.8;

  // Export to CSV
  const handleExportCsv = () => {
    const headers = ['Timestamp', 'Type', 'Model', 'PromptSnippet', 'PromptTokens', 'OutputTokens', 'TotalTokens', 'LatencyMs', 'CostUSD', 'Status', 'Error'];
    const rows = logs.map((l) => [
      `"${l.timestamp}"`,
      `"${l.type}"`,
      `"${l.model}"`,
      `"${(l.promptSnippet || '').replace(/"/g, '""')}"`,
      l.promptTokens,
      l.candidatesTokens,
      l.totalTokens,
      l.latencyMs,
      l.costUsd,
      `"${l.status}"`,
      `"${(l.errorMessage || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `gemini_session_usage_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export to JSON
  const handleExportJson = () => {
    const jsonStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(logs, null, 2));
    const link = document.createElement('a');
    link.setAttribute('href', jsonStr);
    link.setAttribute('download', `gemini_session_usage_${Date.now()}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner: Budget & Quota Threshold */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Coins className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Session Usage Audit & Budget Threshold</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Inspect all recorded API transactions, monitor cumulative spend, and export audit trails.
              </p>
            </div>
          </div>

          {/* Budget Limit Slider / Selector */}
          <div className="flex items-center gap-4 bg-slate-800/80 px-4 py-2.5 rounded-xl border border-slate-700/80">
            <div>
              <div className="flex justify-between items-baseline gap-2">
                <span className="text-xs text-slate-400 font-medium">Session Budget Alert:</span>
                <span className="text-xs font-mono font-bold text-white">${budgetLimit.toFixed(2)} USD</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="25"
                step="0.5"
                value={budgetLimit}
                onChange={(e) => onBudgetChange(parseFloat(e.target.value))}
                className="w-36 accent-emerald-500 cursor-pointer mt-1"
              />
            </div>

            <div className="text-right border-l border-slate-700 pl-4">
              <span className="text-[10px] text-slate-500 block">Spent So Far</span>
              <span className="text-sm font-bold font-mono text-emerald-400">
                ${totalCost.toFixed(5)}
              </span>
            </div>
          </div>
        </div>

        {/* Budget Warning Banner if approaching */}
        {isBudgetWarning && (
          <div className="mt-4 p-3 rounded-xl bg-amber-950/30 border border-amber-500/30 text-amber-300 text-xs flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
            <span>
              <strong>Budget Advisory:</strong> Session consumption (${totalCost.toFixed(4)}) has reached {((totalCost / budgetLimit) * 100).toFixed(0)}% of your ${budgetLimit.toFixed(2)} alert threshold.
            </span>
          </div>
        )}
      </div>

      {/* Audit Log Table Header & Actions */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-blue-400" />
            <h3 className="font-semibold text-white text-sm">
              Activity Records ({logs.length} calls)
            </h3>
            <span className="text-xs text-slate-500">
              • {totalTokens.toLocaleString()} total tokens consumed
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Filter buttons */}
            <div className="flex rounded-lg bg-slate-800 p-0.5 border border-slate-700/60 text-xs">
              <button
                onClick={() => setFilterType('ALL')}
                className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                  filterType === 'ALL' ? 'bg-blue-600 text-white font-medium' : 'text-slate-400 hover:text-white'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilterType('SUCCESS')}
                className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                  filterType === 'SUCCESS' ? 'bg-blue-600 text-white font-medium' : 'text-slate-400 hover:text-white'
                }`}
              >
                Success
              </button>
              <button
                onClick={() => setFilterType('ERROR')}
                className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                  filterType === 'ERROR' ? 'bg-blue-600 text-white font-medium' : 'text-slate-400 hover:text-white'
                }`}
              >
                Errors
              </button>
            </div>

            {/* Export buttons */}
            <button
              onClick={handleExportCsv}
              disabled={logs.length === 0}
              className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs border border-slate-700 flex items-center gap-1 cursor-pointer disabled:opacity-40"
              title="Download activity report as CSV"
            >
              <Download className="w-3.5 h-3.5" />
              <span>CSV</span>
            </button>
            <button
              onClick={handleExportJson}
              disabled={logs.length === 0}
              className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs border border-slate-700 flex items-center gap-1 cursor-pointer disabled:opacity-40"
              title="Download activity report as JSON"
            >
              <Download className="w-3.5 h-3.5" />
              <span>JSON</span>
            </button>

            {/* Clear logs */}
            <button
              onClick={onClearLogs}
              disabled={logs.length === 0}
              className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-950/20 transition-colors cursor-pointer disabled:opacity-40"
              title="Clear Session Logs"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Logs Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider text-[10px]">
                <th className="py-2.5 px-3">Time</th>
                <th className="py-2.5 px-3">Type</th>
                <th className="py-2.5 px-3">Model</th>
                <th className="py-2.5 px-3">Prompt / Details</th>
                <th className="py-2.5 px-3 text-right">Tokens</th>
                <th className="py-2.5 px-3 text-right">Latency</th>
                <th className="py-2.5 px-3 text-right">Est. Cost</th>
                <th className="py-2.5 px-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-600 font-sans">
                    No activity logs recorded yet. Execute a probe or prompt to generate telemetry.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-2.5 px-3 text-slate-400 whitespace-nowrap text-[11px]">
                      {new Date(log.timestamp).toLocaleTimeString()}
                    </td>
                    <td className="py-2.5 px-3 whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded text-[10px] bg-slate-800 text-slate-300">
                        {log.type}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-blue-400 whitespace-nowrap">
                      {log.model}
                    </td>
                    <td className="py-2.5 px-3 font-sans text-slate-300 max-w-xs truncate" title={log.promptSnippet}>
                      {log.promptSnippet || 'Health check ping'}
                    </td>
                    <td className="py-2.5 px-3 text-right text-indigo-300 whitespace-nowrap">
                      {log.totalTokens.toLocaleString()}
                    </td>
                    <td className="py-2.5 px-3 text-right text-slate-400 whitespace-nowrap">
                      {log.latencyMs}ms
                    </td>
                    <td className="py-2.5 px-3 text-right text-emerald-400 whitespace-nowrap">
                      ${log.costUsd.toFixed(6)}
                    </td>
                    <td className="py-2.5 px-3 text-center whitespace-nowrap">
                      {log.status === 'success' ? (
                        <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400 bg-emerald-950/40 px-1.5 py-0.5 rounded border border-emerald-500/20">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>200</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] text-rose-400 bg-rose-950/40 px-1.5 py-0.5 rounded border border-rose-500/20" title={log.errorMessage}>
                          <AlertCircle className="w-3 h-3" />
                          <span>Err</span>
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
