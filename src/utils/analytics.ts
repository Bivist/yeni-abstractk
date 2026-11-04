/**
 * PostHog yalnızca kullanıcı isteğe bağlı analitiğe izin verdikten sonra yüklenir.
 * İzin verilmediğinde hiçbir analitik isteği veya analitik depolaması başlatılmaz.
 */
type PostHogClient = {
  capture: (event: string, properties?: Record<string, string | number | boolean | null>) => void;
  opt_in_capturing?: () => void;
  opt_out_capturing?: () => void;
  register?: (properties: Record<string, string>) => void;
};

declare global {
  interface Window {
    posthog?: PostHogClient & { init?: (key: string, config: Record<string, unknown>) => void; __loaded?: boolean };
  }
}

const POSTHOG_KEY = 'phc_tTTp7kghPmC3WYZLU5bhs7JmiVt2pCv5GXeFeJ6gt98j';
const POSTHOG_HOST = 'https://us.i.posthog.com';
let allowed = false;
let loading = false;

export function enableAnalytics(): void {
  allowed = true;
  if (typeof window === 'undefined') return;

  const existing = window.posthog;
  if (existing?.__loaded) {
    existing.opt_in_capturing?.();
    return;
  }
  if (loading) return;
  loading = true;

  // PostHog'un resmi yükleyici kalıbı: SDK, yalnızca açık rızadan sonra indirilir.
  const script = document.createElement('script');
  script.async = true;
  script.crossOrigin = 'anonymous';
  script.src = POSTHOG_HOST.replace('.i.posthog.com', '-assets.i.posthog.com') + '/static/array.js';
  script.onload = () => {
    loading = false;
    const ph = window.posthog;
    if (!allowed || !ph?.init) return;
    ph.init?.(POSTHOG_KEY, {
      api_host: POSTHOG_HOST,
      defaults: '2026-08-30',
      autocapture: false,
      capture_pageview: true,
      capture_pageleave: true,
      disable_session_recording: true,
      person_profiles: 'identified_only',
      persistence: 'localStorage',
      loaded: (client: PostHogClient) => client.register?.({ app: 'abstract-redesign' })
    });
    if (window.posthog) window.posthog.__loaded = true;
  };
  script.onerror = () => { loading = false; };
  document.head.appendChild(script);
}

export function disableAnalytics(): void {
  allowed = false;
  try { window.posthog?.opt_out_capturing?.(); } catch {}
}

export function trackEvent(
  event: string,
  properties?: Record<string, string | number | boolean | null>
): void {
  if (!allowed) return;
  try {
    window.posthog?.capture(event, {
      app: 'abstract-redesign',
      ...properties
    });
  } catch {
    // Analitik hataları uygulamanın çalışmasını etkilememeli.
  }
}
