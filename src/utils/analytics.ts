/**
 * Abstract kullanım analitiği.
 * PostHog HTML snippet'i index.html içinde başlatılır.
 * Kullanıcı adı, e-posta, arama metni veya makale başlığı gönderilmez.
 */
type PostHogClient = {
  capture: (event: string, properties?: Record<string, string | number | boolean | null>) => void;
};

declare global {
  interface Window {
    posthog?: PostHogClient;
  }
}

export function trackEvent(
  event: string,
  properties?: Record<string, string | number | boolean | null>
): void {
  try {
    window.posthog?.capture(event, {
      app: 'abstract',
      ...properties
    });
  } catch {
    // Analitik hataları uygulamanın çalışmasını etkilememeli.
  }
}
