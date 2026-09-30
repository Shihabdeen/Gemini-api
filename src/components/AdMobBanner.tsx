import React, { useState, useEffect } from 'react';
import { ShieldCheck, Sparkles, ExternalLink, Info, CheckCircle2, AlertCircle } from 'lucide-react';
import { adMobManager, AdMobConfig, ADMOB_CONSTANTS } from '../services/admobService';

interface AdMobBannerProps {
  onOpenReleaseGuide?: () => void;
}

export const AdMobBanner: React.FC<AdMobBannerProps> = ({ onOpenReleaseGuide }) => {
  const [adConfig, setAdConfig] = useState<AdMobConfig>(adMobManager.getConfig());
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    adMobManager.initialize(false);
    const unsubscribe = adMobManager.subscribe((cfg) => setAdConfig(cfg));
    return () => unsubscribe();
  }, []);

  if (isDismissed) return null;

  const currentUnitId = adConfig.isTestMode
    ? ADMOB_CONSTANTS.TEST_BANNER_UNIT_ID
    : ADMOB_CONSTANTS.BANNER_UNIT_ID;

  return (
    <div className="bg-gradient-to-r from-slate-900 via-indigo-950/60 to-slate-900 border-t border-indigo-500/30 text-white shadow-2xl py-2.5 px-4 sticky bottom-0 z-40">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Left Info / AdMob Banner Branding */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-bold tracking-wider uppercase shrink-0">
            Ad
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-3 text-xs">
            <div className="flex items-center gap-1.5 font-medium text-slate-200">
              <span className="text-indigo-400 font-semibold">Google AdMob:</span>
              <span className="font-mono text-slate-300 bg-slate-800/80 px-1.5 py-0.5 rounded border border-slate-700 text-[11px] truncate max-w-[220px]">
                {currentUnitId}
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <span
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                  adConfig.isTestMode
                    ? 'bg-amber-950/60 text-amber-300 border-amber-500/30'
                    : 'bg-emerald-950/60 text-emerald-300 border-emerald-500/30'
                }`}
              >
                <CheckCircle2 className="w-2.5 h-2.5" />
                <span>{adConfig.isTestMode ? 'Test Mode' : 'Production Live Unit'}</span>
              </span>

              {adConfig.isNative ? (
                <span className="text-[10px] text-sky-400 bg-sky-950/50 px-1.5 py-0.5 rounded border border-sky-500/30">
                  Android Native SDK
                </span>
              ) : (
                <span className="text-[10px] text-slate-400 bg-slate-800/60 px-1.5 py-0.5 rounded">
                  Web Preview
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Center / Right Controls & Quick Actions */}
        <div className="flex items-center gap-2.5 text-xs w-full md:w-auto justify-end">
          {/* Mode Switcher */}
          <button
            onClick={() => adMobManager.setTestMode(!adConfig.isTestMode)}
            className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer flex items-center gap-1"
            title="Toggle between user production ad unit and Google safe test unit"
          >
            <span>Switch to: {adConfig.isTestMode ? 'Live Ad Unit' : 'Test Unit'}</span>
          </button>

          {/* Open Play Console Guide Button */}
          {onOpenReleaseGuide && (
            <button
              onClick={onOpenReleaseGuide}
              className="text-[11px] px-3 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold transition-colors cursor-pointer flex items-center gap-1 shadow-sm"
            >
              <Sparkles className="w-3 h-3" />
              <span>Get AAB & APK</span>
            </button>
          )}

          {/* Dismiss Banner Button */}
          <button
            onClick={() => setIsDismissed(true)}
            className="text-slate-500 hover:text-slate-300 text-xs px-1.5 py-0.5 rounded hover:bg-slate-800 transition-colors"
            title="Hide banner preview"
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  );
};
