/**
 * PostHog yalnızca kullanıcı isteğe bağlı analitiğe izin verdikten sonra yüklenir.
 */
type PostHogClient = {
  capture: (event: string, properties?: Record<string, string | number | boolean | null>) => void;
  opt_in_capturing?: () => void;
  opt_out_capturing?: () => void;
  register?: (properties: Record<string, string>) => void;
  init?: (key: string, config: Record<string, unknown>) => void;
  __loaded?: boolean;
};
declare global { interface Window { posthog?: PostHogClient; } }

const POSTHOG_KEY = 'phc_tTTp7kghPmC3WYZLU5bhs7JmiVt2pCv5GXeFeJ6gt98j';
const POSTHOG_HOST = 'https://us.i.posthog.com';
let allowed = false;
let loading = false;

export function enableAnalytics(): void {
  allowed = true;
  if (typeof window === 'undefined' || window.posthog?.__loaded || loading) return;
  loading = true;

  // PostHog resmi dizi-yükleyici kalıbı; bu kod yalnızca opt-in sonrasında çalışır.
  const w = window as Window & { posthog?: any };
  const p: any = [];
  p._i = [];
  p.init = function (key: string, config: Record<string, unknown>) {
    function stub(target: any, name: string) {
      target[name] = (...args: any[]) => target.push([name, ...args]);
    }
    const methods = 'capture register register_once unregister identify alias reset get_distinct_id get_session_id opt_in_capturing opt_out_capturing has_opted_in_capturing has_opted_out_capturing'.split(' ');
    methods.forEach(name => stub(p, name));
    p._i.push([key, config]);
    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.async = true;
    script.crossOrigin = 'anonymous';
    script.src = POSTHOG_HOST.replace('.i.posthog.com', '-assets.i.posthog.com') + '/static/array.js';
    script.onload = () => {
      loading = false;
      p.__loaded = true;
      if (!allowed) p.opt_out_capturing();
    };
    script.onerror = () => { loading = false; };
    document.head.appendChild(script);
  };
  w.posthog = p;
  p.init(POSTHOG_KEY, {
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
}

export function disableAnalytics(): void {
  allowed = false;
  try { window.posthog?.opt_out_capturing?.(); } catch {}
}

export function trackEvent(event: string, properties?: Record<string, string | number | boolean | null>): void {
  if (!allowed) return;
  try { window.posthog?.capture(event, { app: 'abstract-redesign', ...properties }); } catch {}
}
