import React, { useState, useEffect, useCallback } from 'react';
import {
  Activity,
  ShieldCheck,
  Calculator,
  Terminal,
  Layers,
  History,
  BookOpen,
  RefreshCw,
  ExternalLink,
  Zap,
} from 'lucide-react';
import { SystemStatus, ProbeResult, ModelSpec, SessionLogEntry, TokenCountResult } from './types';
import { Header } from './components/Header';
import { KpiSummary } from './components/KpiSummary';
import { LiveProbeTab } from './components/LiveProbeTab';
import { TokenCalculatorTab } from './components/TokenCalculatorTab';
import { PlaygroundTab } from './components/PlaygroundTab';
import { ModelsCatalogTab } from './components/ModelsCatalogTab';
import { SessionAuditTab } from './components/SessionAuditTab';
import { BillingGuideTab } from './components/BillingGuideTab';

const LOCAL_STORAGE_KEY = 'gemini_usage_monitor_logs_v1';
const LOCAL_STORAGE_BUDGET_KEY = 'gemini_usage_monitor_budget_v1';

export default function App() {
  const [activeTab, setActiveTab] = useState<'probe' | 'calculator' | 'playground' | 'models' | 'audit' | 'guide'>('probe');
  const [status, setStatus] = useState<SystemStatus | null>(null);
  const [models, setModels] = useState<ModelSpec[]>([]);
  const [probeResult, setProbeResult] = useState<ProbeResult | null>(null);
  const [isProbing, setIsProbing] = useState<boolean>(false);
  const [isCounting, setIsCounting] = useState<boolean>(false);
  const [isExecuting, setIsExecuting] = useState<boolean>(false);

  // Session Logs from localStorage
  const [logs, setLogs] = useState<SessionLogEntry[]>(() => {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.error('Error loading logs from localStorage', e);
    }
    return [];
  });

  // Budget threshold
  const [budgetLimit, setBudgetLimit] = useState<number>(() => {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_BUDGET_KEY);
      if (stored) return parseFloat(stored);
    } catch (e) {
      console.error('Error loading budget from localStorage', e);
    }
    return 5.0;
  });

  // Save logs to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(logs));
    } catch (e) {
      console.error('Error saving logs to localStorage', e);
    }
  }, [logs]);

  // Save budget limit to localStorage
  const handleBudgetChange = (newLimit: number) => {
    setBudgetLimit(newLimit);
    try {
      localStorage.setItem(LOCAL_STORAGE_BUDGET_KEY, newLimit.toString());
    } catch (e) {
      console.error('Error saving budget to localStorage', e);
    }
  };

  const handleClearLogs = () => {
    setLogs([]);
    try {
      localStorage.removeItem(LOCAL_STORAGE_KEY);
    } catch (e) {
      console.error('Error clearing logs', e);
    }
  };

  const handleAddLog = (newLog: SessionLogEntry) => {
    setLogs((prev) => [newLog, ...prev]);
  };

  // Fetch initial status
  const fetchStatus = useCallback(async () => {
    try {
      const res = await fetch('/api/usage/status');
      if (res.ok) {
        const data = await res.json();
        setStatus(data);
      }
    } catch (err) {
      console.error('Failed to fetch status', err);
    }
  }, []);

  // Fetch models catalog
  const fetchModels = useCallback(async () => {
    try {
      const res = await fetch('/api/usage/models');
      if (res.ok) {
        const data = await res.json();
        setModels(data.models || []);
      }
    } catch (err) {
      console.error('Failed to fetch models', err);
    }
  }, []);

  // Execute Live Probe
  const handleRunProbe = useCallback(async () => {
    setIsProbing(true);
    try {
      const res = await fetch('/api/usage/probe', { method: 'POST' });
      const data: ProbeResult = await res.json();
      setProbeResult(data);

      // Record to audit log
      handleAddLog({
        id: `probe_${Date.now()}`,
        timestamp: data.timestamp || new Date().toISOString(),
        type: 'probe',
        model: data.model || 'gemini-3.8-flash',
        promptSnippet: 'Ping test for quota check',
        promptTokens: data.usageMetadata?.promptTokens || 0,
        candidatesTokens: data.usageMetadata?.candidatesTokens || 0,
        totalTokens: data.usageMetadata?.totalTokens || 0,
        latencyMs: data.latencyMs || 0,
        costUsd: parseFloat(data.estimatedCostUsd || '0'),
        status: data.ok ? 'success' : 'error',
        errorMessage: data.error,
      });
    } catch (err: any) {
      const errorResult: ProbeResult = {
        ok: false,
        statusCode: 500,
        quotaStatus: 'NETWORK_ERROR',
        latencyMs: 0,
        error: err?.message || 'Failed to connect to backend server',
        timestamp: new Date().toISOString(),
      };
      setProbeResult(errorResult);
    } finally {
      setIsProbing(false);
    }
  }, []);

  // Count tokens API wrapper
  const handleCountTokens = async (text: string, model: string): Promise<TokenCountResult | null> => {
    setIsCounting(true);
    try {
      const res = await fetch('/api/usage/count-tokens', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, model }),
      });
      const data = await res.json();
      return data;
    } catch (err) {
      console.error('Error counting tokens', err);
      return null;
    } finally {
      setIsCounting(false);
    }
  };

  // Execute prompt API wrapper
  const handleExecutePrompt = async (prompt: string, model: string, systemInstruction: string) => {
    setIsExecuting(true);
    try {
      const res = await fetch('/api/usage/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, model, systemInstruction }),
      });
      const data = await res.json();
      return data;
    } catch (err: any) {
      return {
        ok: false,
        error: err?.message || 'Network error executing prompt',
        latencyMs: 0,
      };
    } finally {
      setIsExecuting(false);
    }
  };

  // Initial mount: load status, models, and run quick probe
  useEffect(() => {
    fetchStatus();
    fetchModels();
    handleRunProbe();
  }, [fetchStatus, fetchModels, handleRunProbe]);

  const navTabs = [
    { id: 'probe', label: 'Quota & Health Check', icon: ShieldCheck },
    { id: 'calculator', label: 'Token & Cost Calculator', icon: Calculator },
    { id: 'playground', label: 'Live Test & Telemetry', icon: Terminal },
    { id: 'models', label: 'Models & Limits Catalog', icon: Layers },
    { id: 'audit', label: `Session Audit (${logs.length})`, icon: History },
    { id: 'guide', label: 'Cloud Billing Guide', icon: BookOpen },
  ] as const;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      {/* Top Application Bar */}
      <Header
        status={status}
        probeResult={probeResult}
        isProbing={isProbing}
        onProbe={handleRunProbe}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* KPI Summary Cards */}
        <KpiSummary
          logs={logs}
          dailyAllowance={status?.dailyQuotaAllowance || 1500}
          budgetLimit={budgetLimit}
          latestLatency={probeResult?.latencyMs || null}
        />

        {/* Tab Navigation Pill Bar */}
        <div className="border-b border-slate-800 pb-1">
          <nav className="flex space-x-1 sm:space-x-2 overflow-x-auto py-1 scrollbar-none">
            {navTabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all whitespace-nowrap cursor-pointer ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Active Tab Views */}
        <div>
          {activeTab === 'probe' && (
            <LiveProbeTab
              status={status}
              probeResult={probeResult}
              isProbing={isProbing}
              onProbe={handleRunProbe}
            />
          )}

          {activeTab === 'calculator' && (
            <TokenCalculatorTab
              onCountTokens={handleCountTokens}
              isCounting={isCounting}
            />
          )}

          {activeTab === 'playground' && (
            <PlaygroundTab
              onExecutePrompt={handleExecutePrompt}
              onLogAdd={handleAddLog}
              isExecuting={isExecuting}
            />
          )}

          {activeTab === 'models' && <ModelsCatalogTab models={models} />}

          {activeTab === 'audit' && (
            <SessionAuditTab
              logs={logs}
              budgetLimit={budgetLimit}
              onBudgetChange={handleBudgetChange}
              onClearLogs={handleClearLogs}
            />
          )}

          {activeTab === 'guide' && <BillingGuideTab />}
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-900 bg-slate-950 py-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>
            Google AI Studio Usage & Quota Monitor • Built with <code>@google/genai</code> SDK
          </span>
          <div className="flex items-center gap-4">
            <span className="font-mono text-slate-400">Account: {status?.account.email || 'shihabdeen2018@gmail.com'}</span>
            <a
              href="https://ai.google.dev/pricing"
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-400 hover:text-blue-400 flex items-center gap-1 transition-colors"
            >
              <span>Gemini Pricing Docs</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
