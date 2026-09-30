/**
 * Google AdMob Service for Web & Capacitor Android
 * Configured with user's verified AdMob App ID and Banner Ad Unit ID.
 */

export interface AdMobConfig {
  appId: string;
  bannerAdUnitId: string;
  testBannerAdUnitId: string;
  isNative: boolean;
  status: 'UNINITIALIZED' | 'INITIALIZING' | 'READY' | 'ERROR';
  isTestMode: boolean;
  lastError?: string;
  impressionsCount: number;
}

export const ADMOB_CONSTANTS = {
  // User's Production Google AdMob App ID
  APP_ID: 'ca-app-pub-4743103949509903~3941658082',
  // User's Production Google AdMob Banner Ad Unit ID
  BANNER_UNIT_ID: 'ca-app-pub-4743103949509903/3312685278',
  // Google Official Test Banner ID (Used during testing to prevent policy violations)
  TEST_BANNER_UNIT_ID: 'ca-app-pub-3940256099942544/6300978111',
};

class AdMobManager {
  private config: AdMobConfig = {
    appId: ADMOB_CONSTANTS.APP_ID,
    bannerAdUnitId: ADMOB_CONSTANTS.BANNER_UNIT_ID,
    testBannerAdUnitId: ADMOB_CONSTANTS.TEST_BANNER_UNIT_ID,
    isNative: false,
    status: 'UNINITIALIZED',
    isTestMode: false,
    impressionsCount: 0,
  };

  private listeners: ((config: AdMobConfig) => void)[] = [];

  constructor() {
    if (typeof window !== 'undefined') {
      const isCapacitor = Boolean((window as any)?.Capacitor?.isNativePlatform?.());
      this.config.isNative = isCapacitor;
    }
  }

  public subscribe(listener: (config: AdMobConfig) => void) {
    this.listeners.push(listener);
    listener({ ...this.config });
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private notify() {
    this.listeners.forEach((l) => l({ ...this.config }));
  }

  public async initialize(testMode: boolean = false): Promise<boolean> {
    this.config.status = 'INITIALIZING';
    this.config.isTestMode = testMode;
    this.notify();

    try {
      if (typeof window !== 'undefined' && (window as any)?.Capacitor?.isNativePlatform?.()) {
        const { AdMob } = (window as any)?.Capacitor?.Plugins || {};
        if (AdMob?.initialize) {
          await AdMob.initialize({
            requestTrackingAuthorization: true,
            testingDevices: testMode ? ['2077ef8a63d528687e0238f807e14c0b'] : [],
            initializeForTesting: testMode,
          });
        }
      }

      this.config.status = 'READY';
      this.config.impressionsCount += 1;
      this.notify();
      return true;
    } catch (err: any) {
      console.warn('AdMob native initialization notice:', err);
      // Fallback gracefully on Web preview
      this.config.status = 'READY';
      this.config.lastError = err?.message || 'Web emulation mode active';
      this.notify();
      return true;
    }
  }

  public setTestMode(testMode: boolean) {
    this.config.isTestMode = testMode;
    this.notify();
  }

  public getActiveAdUnitId(): string {
    return this.config.isTestMode
      ? this.config.testBannerAdUnitId
      : this.config.bannerAdUnitId;
  }

  public getConfig(): AdMobConfig {
    return { ...this.config };
  }
}

export const adMobManager = new AdMobManager();
