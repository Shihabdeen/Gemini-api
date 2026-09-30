import React from 'react';
import { BookOpen, ExternalLink, ShieldCheck, DollarSign, Bell, Database, Zap, ArrowRight } from 'lucide-react';

export const BillingGuideTab: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Intro Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Google AI Studio & Cloud Billing Guide</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Comprehensive explanation of rate limit enforcement, free tier terms, and budget controls in Google Cloud.
            </p>
          </div>
        </div>
      </div>

      {/* Comparison Grid: Free vs Pay-as-you-go */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Free Tier Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-2xl pointer-events-none" />
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-white text-base flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              <span>Free of Charge Tier</span>
            </h3>
            <span className="text-[11px] font-mono text-emerald-300 bg-emerald-950/40 border border-emerald-500/30 px-2 py-0.5 rounded">
              $0.00 / month
            </span>
          </div>

          <ul className="space-y-2.5 text-xs text-slate-300">
            <li className="flex items-start gap-2">
              <span className="text-emerald-400 font-bold">•</span>
              <span><strong>15 Requests Per Minute (RPM)</strong> and <strong>1,000,000 Tokens Per Minute (TPM)</strong> limit.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-400 font-bold">•</span>
              <span><strong>1,500 Requests Per Day (RPD)</strong> maximum quota allowance.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-400 font-bold">•</span>
              <span>Daily quota resets every night at <strong>00:00 PST (Midnight Pacific)</strong>.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-400 font-bold">•</span>
              <span>Supported on core models like <code>gemini-3.8-flash</code> and <code>gemini-3.1-flash-lite</code>.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-amber-400 font-bold">•</span>
              <span className="text-slate-400">Note: Prompts submitted under the free tier may be reviewed by human reviewers to train and improve Google models.</span>
            </li>
          </ul>

          <div className="mt-5 pt-4 border-t border-slate-800 flex justify-between items-center text-xs">
            <span className="text-slate-500">Best for: Prototyping & Apps under 1.5k reqs/day</span>
          </div>
        </div>

        {/* Pay-as-you-go Tier */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-2xl pointer-events-none" />
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-white text-base flex items-center gap-2">
              <Zap className="w-5 h-5 text-indigo-400" />
              <span>Pay-as-you-go Tier</span>
            </h3>
            <span className="text-[11px] font-mono text-indigo-300 bg-indigo-950/40 border border-indigo-500/30 px-2 py-0.5 rounded">
              Linked to Cloud Billing
            </span>
          </div>

          <ul className="space-y-2.5 text-xs text-slate-300">
            <li className="flex items-start gap-2">
              <span className="text-indigo-400 font-bold">•</span>
              <span><strong>1,000+ Requests Per Minute (RPM)</strong> and <strong>4,000,000 TPM</strong> ceiling.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-indigo-400 font-bold">•</span>
              <span><strong>Unlimited Requests Per Day</strong> (no 1,500 cap).</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-indigo-400 font-bold">•</span>
              <span>Unlocks flagship models like <code>gemini-3.1-pro-preview</code> and <code>gemini-3.1-flash-image</code>.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-indigo-400 font-bold">•</span>
              <span><strong>Data Privacy:</strong> Customer prompt and output data is <em>never</em> used to train Google models.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-indigo-400 font-bold">•</span>
              <span>Input: $0.075/1M tok, Output: $0.30/1M tok for Flash. Context caching provides a 75% discount.</span>
            </li>
          </ul>

          <div className="mt-5 pt-4 border-t border-slate-800 flex justify-between items-center text-xs">
            <a
              href="https://aistudio.google.com/app/plan_and_billing"
              target="_blank"
              rel="noopener noreferrer"
              className="text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-medium transition-colors"
            >
              <span>Manage Billing in AI Studio</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>

      {/* Google Cloud Budget & Alert Setup Walkthrough */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm">
        <div className="flex items-center gap-2.5 mb-4">
          <Bell className="w-5 h-5 text-amber-400" />
          <h3 className="font-bold text-white text-base">
            How to Set Up Budget Alerts in Google Cloud Console
          </h3>
        </div>

        <p className="text-xs text-slate-400 leading-relaxed mb-4">
          To prevent unexpected bills when your application scales, Google Cloud allows you to configure automated budget threshold alerts that send emails whenever spending crosses specified milestones (e.g., 50%, 90%, 100%).
        </p>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
          <div className="bg-slate-800/50 p-3.5 rounded-xl border border-slate-800 flex flex-col justify-between">
            <div>
              <span className="w-6 h-6 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-xs mb-2">
                1
              </span>
              <strong className="text-slate-200 block">Open Cloud Billing</strong>
              <p className="text-slate-400 mt-1">
                Navigate to <code>console.cloud.google.com/billing</code> and select your linked billing account.
              </p>
            </div>
          </div>

          <div className="bg-slate-800/50 p-3.5 rounded-xl border border-slate-800 flex flex-col justify-between">
            <div>
              <span className="w-6 h-6 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-xs mb-2">
                2
              </span>
              <strong className="text-slate-200 block">Budgets & Alerts</strong>
              <p className="text-slate-400 mt-1">
                Click on the <strong>Budgets & alerts</strong> navigation tab and click <strong>Create Budget</strong>.
              </p>
            </div>
          </div>

          <div className="bg-slate-800/50 p-3.5 rounded-xl border border-slate-800 flex flex-col justify-between">
            <div>
              <span className="w-6 h-6 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-xs mb-2">
                3
              </span>
              <strong className="text-slate-200 block">Set Target Amount</strong>
              <p className="text-slate-400 mt-1">
                Filter by service <em>"Generative Language API"</em> and define a monthly target (e.g. $10.00).
              </p>
            </div>
          </div>

          <div className="bg-slate-800/50 p-3.5 rounded-xl border border-slate-800 flex flex-col justify-between">
            <div>
              <span className="w-6 h-6 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-xs mb-2">
                4
              </span>
              <strong className="text-slate-200 block">Trigger Notifications</strong>
              <p className="text-slate-400 mt-1">
                Configure email alerts to your address (<code>shihabdeen2018@gmail.com</code>) at 50%, 80%, and 100%.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-4 pt-3 flex items-center justify-end">
          <a
            href="https://console.cloud.google.com/billing/budgets"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1.5 transition-colors font-medium"
          >
            <span>Open Google Cloud Budgets & Alerts</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* Context Caching Savings Spotlight */}
      <div className="bg-gradient-to-r from-emerald-950/40 via-slate-900 to-slate-900 border border-emerald-500/30 rounded-2xl p-5 shadow-sm">
        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-white text-base">
              Pro-Tip: Save 75% on High-Volume Prompts with Context Caching
            </h3>
            <p className="text-xs text-slate-300 mt-1 max-w-3xl leading-relaxed">
              When processing long context documents (such as PDFs, large code repositories, or static system guidelines exceeding 32,768 tokens), you can pre-cache the tokens once. Subsequent calls referencing the cache cost only{' '}
              <strong className="text-emerald-400 font-mono">$0.01875 / 1M tokens</strong> instead of $0.075 / 1M tokens.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
