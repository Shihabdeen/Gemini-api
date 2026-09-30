import React, { useState, useEffect } from 'react';
import { Activity, ShieldCheck, AlertCircle, RefreshCw, Clock, ExternalLink, Zap } from 'lucide-react';
import { SystemStatus, ProbeResult } from '../types';

interface HeaderProps {
  status: SystemStatus | null;
  probeResult: ProbeResult | null;
  isProbing: boolean;
  onProbe: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  status,
  probeResult,
  isProbing,
  onProbe,
}) => {
  // Calculate time remaining until midnight Pacific Time (PST/PDT)
  const [pstCountdown, setPstCountdown] = useState<string>('');

  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date();
      // Pacific time string
      const pstString = now.toLocaleString('en-US', { timeZone: 'America/Los_Angeles' });
      const pstDate = new Date(pstString);
      
      const midnightPst = new Date(pstDate);
      midnightPst.setHours(24, 0, 0, 0);

      const diffMs = midnightPst.getTime() - pstDate.getTime();
      const hours = Math.floor(diffMs / (1000 * 60 * 60));
      const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);

      setPstCountdown(`${hours}h ${minutes}m ${seconds}s`);
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, []);

  const isHealthy = probeResult?.ok ?? (status?.apiKeyConfigured ?? false);

  return (
    <header className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-30 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          {/* Logo & Branding */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-sky-400 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-lg font-bold tracking-tight text-white">
                  Gemini API & AI Studio Usage Monitor
                </h1>
                <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/30">
                  v3.8 Flash
                </span>
              </div>
              <p className="text-xs text-slate-400 flex items-center gap-1.5">
                <span>Account:</span>
                <span className="font-mono text-slate-300 font-medium">
                  {status?.account.email || 'shihabdeen2018@gmail.com'}
                </span>
                <span className="inline-block w-1 h-1 rounded-full bg-slate-600"></span>
                <span>Real-time Quota, Tokens & Diagnostics</span>
              </p>
            </div>
          </div>

          {/* Right Actions & Status Badges */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* PST Daily Quota Reset Timer */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700/60 text-xs text-slate-300">
              <Clock className="w-3.5 h-3.5 text-sky-400" />
              <span>Daily Quota Reset:</span>
              <span className="font-mono font-semibold text-sky-300">{pstCountdown || 'calculating...'}</span>
              <span className="text-[10px] text-slate-500 font-sans">(Midnight PST)</span>
            </div>

            {/* Health Status Pill */}
            <div
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium ${
                isHealthy
                  ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-300'
                  : 'bg-rose-950/40 border-rose-500/30 text-rose-300'
              }`}
            >
              {isHealthy ? (
                <>
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>API Ready</span>
                </>
              ) : (
                <>
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>Needs Key</span>
                </>
              )}
            </div>

            {/* Live Probe Action Button */}
            <button
              onClick={onProbe}
              disabled={isProbing}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-sm transition-all duration-150 disabled:opacity-50 cursor-pointer"
              title="Send a quick probe to verify Gemini API quota and response latency"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isProbing ? 'animate-spin' : ''}`} />
              <span>{isProbing ? 'Probing...' : 'Check Quota Health'}</span>
            </button>

            {/* Direct Link to Google AI Studio */}
            <a
              href="https://aistudio.google.com/app/plan_and_billing"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs text-slate-300 hover:text-white transition-colors"
              title="Open Official Google AI Studio Billing & Plan page"
            >
              <span>AI Studio Billing</span>
              <ExternalLink className="w-3 h-3 text-slate-400" />
            </a>
          </div>
        </div>
      </div>
    </header>
  );
};
