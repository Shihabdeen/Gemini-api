import React, { useState } from 'react';
import {
  Smartphone,
  Download,
  Copy,
  Check,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Github,
  Play,
  FileCode,
  Terminal,
  HelpCircle,
  Package,
  Info,
} from 'lucide-react';
import { ADMOB_CONSTANTS } from '../services/admobService';

export const PlayConsoleTab: React.FC = () => {
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  const handleCopy = (text: string, sectionId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(sectionId);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  const gitCommands = `# 1. Add all new Android and AdMob files
git add .

# 2. Commit the changes
git commit -m "Configure Google AdMob and Android AAB/APK build workflow"

# 3. Push to your GitHub repository
git push origin main`;

  const localBuildCommands = `# Step 1: Build the optimized web distribution
npm run build

# Step 2: Install Capacitor CLI and Android dependencies
npm install -D @capacitor/cli @capacitor/core @capacitor/android @capacitor-community/admob

# Step 3: Initialize the native Android project
npx cap add android
npx cap sync android

# Step 4: Build the signed Android App Bundle (.aab)
cd android
./gradlew bundleRelease

# Step 5: (Optional) Build test APK (.apk)
./gradlew assembleRelease`;

  const keytoolCommand = `keytool -genkeypair -v \\
  -keystore release.jks \\
  -alias playconsole \\
  -keyalg RSA \\
  -keysize 2048 \\
  -validity 10000 \\
  -storepass "YourSecurePasswordHere" \\
  -keypass "YourSecurePasswordHere" \\
  -dname "CN=GeminiUsage, OU=Mobile, O=AppStudio, L=City, ST=State, C=US"`;

  const manifestSnippet = `<manifest xmlns:android="http://schemas.android.com/apk/res/android">
    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
    <uses-permission android:name="com.google.android.gms.permission.AD_ID" />

    <application ...>
        <!-- Your Verified Google AdMob App ID -->
        <meta-data
            android:name="com.google.android.gms.ads.APPLICATION_ID"
            android:value="ca-app-pub-4743103949509903~3941658082" />
    </application>
</manifest>`;

  return (
    <div className="space-y-6">
      {/* 1. Header & AdMob Integration Verification */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div className="flex items-start gap-4">
            <div className="p-3.5 rounded-2xl bg-gradient-to-tr from-emerald-600 to-sky-500 text-white shadow-lg shadow-emerald-500/20">
              <Package className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-white">
                  Google Play Console & AdMob Release Center
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Ready for AAB Export
                </span>
              </div>
              <p className="text-sm text-slate-400 mt-1 max-w-2xl">
                Your application is configured with your Google AdMob App ID and Banner Ad Unit.
                Follow the instructions below to export your production <strong className="text-white">.aab (Android App Bundle)</strong> and test <strong className="text-white">.apk</strong>.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <a
              href="https://play.google.com/console"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-blue-500/20 transition-colors"
            >
              <span>Google Play Console</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        {/* AdMob Verified Identifiers Box */}
        <div className="mt-6 pt-5 border-t border-slate-800 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="bg-slate-800/60 p-3.5 rounded-xl border border-slate-700/60">
            <div className="flex items-center justify-between">
              <span className="text-slate-400 font-medium">AdMob App ID:</span>
              <span className="text-[10px] text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-500/30 font-semibold">
                Configured & Verified
              </span>
            </div>
            <code className="text-sky-300 font-mono text-sm block mt-1.5 font-bold">
              {ADMOB_CONSTANTS.APP_ID}
            </code>
            <span className="text-[11px] text-slate-500 block mt-1">
              Injected into <code className="text-slate-400">capacitor.config.json</code> & <code className="text-slate-400">AndroidManifest.xml</code>
            </span>
          </div>

          <div className="bg-slate-800/60 p-3.5 rounded-xl border border-slate-700/60">
            <div className="flex items-center justify-between">
              <span className="text-slate-400 font-medium">AdMob Banner Unit ID:</span>
              <span className="text-[10px] text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-500/30 font-semibold">
                Live In UI
              </span>
            </div>
            <code className="text-emerald-300 font-mono text-sm block mt-1.5 font-bold">
              {ADMOB_CONSTANTS.BANNER_UNIT_ID}
            </code>
            <span className="text-[11px] text-slate-500 block mt-1">
              Active in <code className="text-slate-400">AdMobBanner.tsx</code> and native Capacitor bridge
            </span>
          </div>
        </div>
      </div>

      {/* 2. Primary Method: 1-Click Automated Build on GitHub Actions */}
      <div className="bg-gradient-to-br from-slate-900 via-indigo-950/40 to-slate-900 border border-indigo-500/30 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2.5 rounded-xl bg-indigo-500/20 text-indigo-300 border border-indigo-500/40">
            <Github className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-white text-base">
                Method 1: Get .aab & .apk via GitHub Actions (Recommended)
              </h3>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-500/20 text-indigo-300 uppercase tracking-wider">
                Automated Cloud Build
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              Since your code is on GitHub, GitHub will build the signed <code className="text-white font-semibold font-mono">.aab</code> and <code className="text-white font-semibold font-mono">.apk</code> automatically using the included workflow file! You don't need Android Studio installed.
            </p>
          </div>
        </div>

        {/* 4 Step Visual Flow */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-5 text-xs">
          <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700/80 flex flex-col justify-between">
            <div>
              <span className="w-6 h-6 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-xs mb-2">
                1
              </span>
              <strong className="text-slate-200 block text-sm">Push Code to GitHub</strong>
              <p className="text-slate-400 mt-1.5 leading-relaxed">
                Push the latest changes including <code className="text-slate-300">.github/workflows/build-android.yml</code> and AdMob configs to your repository.
              </p>
            </div>
            <button
              onClick={() => handleCopy(gitCommands, 'git')}
              className="mt-3 flex items-center justify-center gap-1.5 py-1.5 px-2 bg-slate-700/80 hover:bg-slate-700 text-slate-200 rounded-lg transition-colors cursor-pointer"
            >
              {copiedSection === 'git' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedSection === 'git' ? 'Copied Git Commands' : 'Copy Git Commands'}</span>
            </button>
          </div>

          <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700/80 flex flex-col justify-between">
            <div>
              <span className="w-6 h-6 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-xs mb-2">
                2
              </span>
              <strong className="text-slate-200 block text-sm">Open "Actions" Tab</strong>
              <p className="text-slate-400 mt-1.5 leading-relaxed">
                Open your repository on GitHub (<code className="text-slate-300">github.com/your-username/your-repo</code>) and click on the <strong>Actions</strong> tab at the top.
              </p>
            </div>
            <div className="mt-3 text-[11px] text-indigo-400 bg-indigo-950/40 p-1.5 rounded text-center border border-indigo-500/20">
              Workflow: "Build Production AAB & APK"
            </div>
          </div>

          <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700/80 flex flex-col justify-between">
            <div>
              <span className="w-6 h-6 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-xs mb-2">
                3
              </span>
              <strong className="text-slate-200 block text-sm">Wait ~2-3 Minutes</strong>
              <p className="text-slate-400 mt-1.5 leading-relaxed">
                GitHub spins up an Android runner, builds the web assets, compiles Gradle, embeds AdMob, and signs the release bundle.
              </p>
            </div>
            <div className="mt-3 flex items-center justify-center gap-1.5 text-[11px] text-emerald-400">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Automated Keystore Signing</span>
            </div>
          </div>

          <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700/80 flex flex-col justify-between">
            <div>
              <span className="w-6 h-6 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-xs mb-2">
                4
              </span>
              <strong className="text-slate-200 block text-sm">Download .aab & .apk</strong>
              <p className="text-slate-400 mt-1.5 leading-relaxed">
                Scroll to the <strong>Artifacts</strong> section at the bottom of the run page. Download:
              </p>
            </div>
            <div className="mt-3 space-y-1 font-mono text-[11px]">
              <div className="bg-emerald-950/40 text-emerald-300 p-1 rounded border border-emerald-500/30 truncate">
                📦 Google-Play-Release-AAB
              </div>
              <div className="bg-sky-950/40 text-sky-300 p-1 rounded border border-sky-500/30 truncate">
                📱 Android-Testing-APK
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Google Play Console Upload Checklist */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm">
        <h3 className="font-bold text-white text-base flex items-center gap-2 mb-3">
          <ShieldCheck className="w-5 h-5 text-emerald-400" />
          <span>Google Play Console: Production Review Checklist</span>
        </h3>
        <p className="text-xs text-slate-400 mb-4">
          Google Play Console requires specific declarations when submitting an app containing Google AdMob. Complete these steps before publishing:
        </p>

        <div className="space-y-3 text-xs">
          {/* Item 1: App Content Ads Declaration */}
          <div className="bg-slate-800/50 p-3.5 rounded-xl border border-slate-800 flex items-start gap-3">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-white block">
                1. Ads Declaration (Mandatory for AdMob)
              </strong>
              <p className="text-slate-400 mt-1 leading-relaxed">
                In Play Console, go to <strong>Policy and programs &gt; App content &gt; Ads</strong>.
                Select <strong className="text-emerald-300">"Yes, my app contains ads"</strong>. This ensures compliance with Google's advertising policies.
              </p>
            </div>
          </div>

          {/* Item 2: Data Safety / Advertising ID */}
          <div className="bg-slate-800/50 p-3.5 rounded-xl border border-slate-800 flex items-start gap-3">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-white block">
                2. Data Safety: Advertising ID (AD_ID Permission)
              </strong>
              <p className="text-slate-400 mt-1 leading-relaxed">
                In <strong>App content &gt; Advertising ID</strong>, declare that your app uses the Advertising ID for <strong className="text-blue-300">"Advertising or marketing"</strong> through the Google Mobile Ads SDK (AdMob).
              </p>
            </div>
          </div>

          {/* Item 3: Upload AAB */}
          <div className="bg-slate-800/50 p-3.5 rounded-xl border border-slate-800 flex items-start gap-3">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-white block">
                3. Upload the .aab File to Production Track
              </strong>
              <p className="text-slate-400 mt-1 leading-relaxed">
                Go to <strong>Release &gt; Production &gt; Create new release</strong>. Drag and drop the <code className="text-emerald-300 font-mono">production-release.aab</code> file downloaded from GitHub Actions. Enter your release name (e.g. <em>1.0.0 - Gemini Usage Monitor</em>) and release notes.
              </p>
            </div>
          </div>

          {/* Item 4: Target Audience */}
          <div className="bg-slate-800/50 p-3.5 rounded-xl border border-slate-800 flex items-start gap-3">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-white block">
                4. Target Audience and Content Rating
              </strong>
              <p className="text-slate-400 mt-1 leading-relaxed">
                In <strong>App content &gt; Target audience</strong>, select 18 and older (or 13+), and complete the Content Rating questionnaire (Developer Tools / Utility category).
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Method 2: Local CLI Guide (If building on computer with Android Studio) */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Terminal className="w-5 h-5 text-sky-400" />
            <h3 className="font-bold text-white text-base">
              Method 2: Local Command-Line Build (Using Android Studio)
            </h3>
          </div>
          <button
            onClick={() => handleCopy(localBuildCommands, 'local')}
            className="flex items-center gap-1 text-xs text-slate-300 hover:text-white px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors cursor-pointer border border-slate-700"
          >
            {copiedSection === 'local' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedSection === 'local' ? 'Copied' : 'Copy Commands'}</span>
          </button>
        </div>

        <p className="text-xs text-slate-400 mb-3 leading-relaxed">
          If you prefer to compile locally on your own computer with Android Studio and the Android SDK installed:
        </p>

        <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 font-mono text-xs text-slate-200 overflow-x-auto leading-relaxed">
          <pre>{localBuildCommands}</pre>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-800 text-xs text-slate-400 flex items-start gap-2">
          <Info className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
          <span>
            The generated Android App Bundle will be located at:{' '}
            <code className="text-emerald-400 font-mono">android/app/build/outputs/bundle/release/app-release.aab</code>
          </span>
        </div>
      </div>

      {/* 5. Android Manifest Reference Snippet */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <FileCode className="w-5 h-5 text-indigo-400" />
            <h3 className="font-bold text-white text-base">
              Configured AndroidManifest.xml (AdMob Verification)
            </h3>
          </div>
          <button
            onClick={() => handleCopy(manifestSnippet, 'manifest')}
            className="flex items-center gap-1 text-xs text-slate-300 hover:text-white px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors cursor-pointer border border-slate-700"
          >
            {copiedSection === 'manifest' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedSection === 'manifest' ? 'Copied' : 'Copy XML'}</span>
          </button>
        </div>

        <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 font-mono text-xs text-indigo-300 overflow-x-auto">
          <pre>{manifestSnippet}</pre>
        </div>
      </div>
    </div>
  );
};
