import React, { useState } from 'react';
import { Layers, Search, Check, ShieldAlert, Cpu, Sparkles, DollarSign } from 'lucide-react';
import { ModelSpec } from '../types';

interface ModelsCatalogTabProps {
  models: ModelSpec[];
}

export const ModelsCatalogTab: React.FC<ModelsCatalogTabProps> = ({ models }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');

  const categories = ['ALL', ...Array.from(new Set(models.map((m) => m.category)))];

  const filteredModels = models.filter((m) => {
    const matchesSearch =
      m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'ALL' || m.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      {/* Search and Filters Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20">
              <Layers className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Gemini Models, Quotas & Pricing Catalog</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Official limits and rate comparisons across the Gemini 3 series family.
              </p>
            </div>
          </div>

          {/* Search bar */}
          <div className="relative w-full md:w-64">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search model or ID..."
              className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        {/* Category Pills */}
        <div className="mt-4 pt-4 border-t border-slate-800/80 flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Models Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredModels.map((model) => (
          <div
            key={model.id}
            className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between hover:border-slate-700 transition-all shadow-sm"
          >
            <div>
              {/* Header: Name & Tier Badge */}
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="font-bold text-white text-base">{model.name}</h3>
                  <span className="text-[11px] font-mono text-blue-400 block mt-0.5">{model.id}</span>
                </div>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-semibold border ${
                    model.isPaidOnly
                      ? 'bg-purple-950/40 text-purple-300 border-purple-500/30'
                      : 'bg-emerald-950/40 text-emerald-300 border-emerald-500/30'
                  }`}
                >
                  {model.isPaidOnly ? 'Paid Only' : 'Free Tier'}
                </span>
              </div>

              <p className="text-xs text-slate-400 mt-2.5 leading-relaxed">{model.description}</p>

              {/* Context and Output Specs */}
              <div className="grid grid-cols-2 gap-2 mt-4 text-xs">
                <div className="bg-slate-800/60 p-2.5 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-500 block">Context Window</span>
                  <span className="font-mono font-semibold text-white">
                    {model.contextWindow.toLocaleString()} tok
                  </span>
                </div>
                <div className="bg-slate-800/60 p-2.5 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-500 block">Max Output</span>
                  <span className="font-mono font-semibold text-white">
                    {model.maxOutputTokens ? `${model.maxOutputTokens.toLocaleString()} tok` : 'N/A'}
                  </span>
                </div>
              </div>

              {/* Rate Limits Section */}
              <div className="mt-4 pt-3 border-t border-slate-800/80">
                <span className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider block mb-2">
                  Rate Limits & Quota
                </span>
                <div className="space-y-1.5 text-xs">
                  {/* Free tier limits */}
                  <div className="flex items-center justify-between py-1 px-2 rounded-lg bg-slate-800/40">
                    <span className="text-slate-400">Free Tier:</span>
                    <span className="font-mono text-slate-300">
                      {model.limits.free.rpm} RPM | {model.limits.free.rpd} RPD
                    </span>
                  </div>

                  {/* Paid tier limits */}
                  <div className="flex items-center justify-between py-1 px-2 rounded-lg bg-slate-800/40">
                    <span className="text-slate-400">Pay-as-you-go:</span>
                    <span className="font-mono text-emerald-400">
                      {model.limits.paid.rpm} RPM | {model.limits.paid.rpd}
                    </span>
                  </div>
                </div>
              </div>

              {/* Pricing section */}
              <div className="mt-4 pt-3 border-t border-slate-800/80">
                <span className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider block mb-2">
                  Pricing (Per 1M Tokens)
                </span>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-slate-800/40 p-2 rounded-lg">
                    <span className="text-[10px] text-slate-500 block">Input</span>
                    <span className="font-mono font-bold text-white">
                      ${model.pricing.inputPer1M.toFixed(3)}
                    </span>
                  </div>
                  <div className="bg-slate-800/40 p-2 rounded-lg">
                    <span className="text-[10px] text-slate-500 block">Output</span>
                    <span className="font-mono font-bold text-white">
                      ${model.pricing.outputPer1M.toFixed(2)}
                    </span>
                  </div>
                </div>
                {model.pricing.cachedPer1M && (
                  <div className="mt-1.5 flex items-center justify-between text-[11px] px-2 py-1 rounded bg-emerald-950/20 text-emerald-400 border border-emerald-500/20">
                    <span>Cached Input (75% off):</span>
                    <span className="font-mono font-semibold">${model.pricing.cachedPer1M.toFixed(4)}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Best For footer */}
            <div className="mt-4 pt-3 border-t border-slate-800/80 text-[11px] text-slate-500">
              <span className="text-slate-400 font-medium">Recommended for: </span>
              <span>{model.recommendedFor}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
