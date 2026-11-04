import React, { useEffect, useState } from 'react';
import { enableAnalytics, disableAnalytics } from '../utils/analytics';

type Choice = 'accepted' | 'rejected';
const STORAGE_KEY = 'abs_privacy_choice_v1';

function readChoice(): Choice | null {
  try {
    const value = localStorage.getItem(STORAGE_KEY);
    return value === 'accepted' || value === 'rejected' ? value : null;
  } catch {
    return null;
  }
}

export function CookieConsent() {
  const [choice, setChoice] = useState<Choice | null>(() => readChoice());
  const [open, setOpen] = useState(() => readChoice() === null);
  const [showDetails, setShowDetails] = useState(false);
  const english = typeof navigator !== 'undefined' && !navigator.language.toLowerCase().startsWith('tr');

  useEffect(() => {
    if (choice === 'accepted') enableAnalytics();
    else disableAnalytics();
  }, [choice]);

  const save = (next: Choice) => {
    try { localStorage.setItem(STORAGE_KEY, next); } catch {}
    setChoice(next);
    setOpen(false);
    setShowDetails(false);
  };

  return (
    <>
      <button
        type="button"
        onClick={() => { setOpen(true); setShowDetails(true); }}
        className="fixed bottom-3 left-3 z-[85] rounded-full border border-edge bg-card/95 px-3 py-2 text-xs font-semibold text-mute shadow-lg backdrop-blur"
        aria-label={english ? 'Privacy and cookie settings' : 'Gizlilik ve çerez ayarları'}
      >
        {english ? 'Privacy settings' : 'Gizlilik ayarları'}
      </button>

      {open && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/45 p-3 sm:items-center" role="presentation">
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="privacy-title"
            className="w-full max-w-xl rounded-3xl border border-edge bg-card p-5 text-ink shadow-2xl sm:p-6"
          >
            <div className="mb-2 text-xs font-bold uppercase tracking-[0.16em] text-mute">
              {english ? 'Your privacy matters' : 'Gizliliğiniz önemli'}
            </div>
            <h2 id="privacy-title" className="mb-2 text-xl font-bold">
              {english ? 'Cookie and analytics preferences' : 'Çerez ve analitik tercihleri'}
            </h2>
            <p className="text-sm leading-relaxed text-mute">
              {english
                ? 'Abstract uses essential browser storage to keep the app and your preferences working. With your permission, we also use PostHog analytics to understand general product usage. Analytics is off unless you opt in.'
                : 'Abstract, uygulamanın ve tercihlerinizin çalışması için gerekli tarayıcı depolamasını kullanır. İzin vermeniz hâlinde, uygulamanın genel kullanımını anlamak için PostHog analitiği de kullanılır. Açıkça izin vermediğiniz sürece analitik devre dışıdır.'}
            </p>

            <div className="mt-4 rounded-2xl border border-edge bg-soft/60 p-3">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="text-sm font-semibold">{english ? 'Essential storage' : 'Zorunlu depolama'}</div>
                  <div className="text-xs text-mute">{english ? 'Required for core features and saved preferences' : 'Temel işlevler ve kayıtlı tercihler için gerekli'}</div>
                </div>
                <span className="text-xs font-semibold text-mute">{english ? 'Always on' : 'Her zaman etkin'}</span>
              </div>
              {showDetails && (
                <div className="mt-3 border-t border-edge pt-3">
                  <div className="text-sm font-semibold">{english ? 'Optional analytics' : 'İsteğe bağlı analitik'}</div>
                  <p className="mt-1 text-xs leading-relaxed text-mute">
                    {english
                      ? 'PostHog may use cookies or local storage and receives usage events such as screen views. It is loaded only after you accept.'
                      : 'PostHog çerez veya yerel depolama kullanabilir; ekran görüntüleme gibi kullanım olaylarını alır. Yalnızca kabul etmenizden sonra yüklenir.'}
                  </p>
                </div>
              )}
            </div>

            <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button type="button" onClick={() => save('rejected')} className="rounded-xl border border-edge px-4 py-3 text-sm font-semibold hover:bg-soft">
                {english ? 'Reject optional' : 'İsteğe bağlıları reddet'}
              </button>
              <button type="button" onClick={() => setShowDetails(v => !v)} className="rounded-xl border border-edge px-4 py-3 text-sm font-semibold hover:bg-soft">
                {english ? 'Details' : 'Tercihleri incele'}
              </button>
              <button type="button" onClick={() => save('accepted')} className="rounded-xl bg-ink px-4 py-3 text-sm font-semibold text-paper hover:opacity-90">
                {english ? 'Accept analytics' : 'Analitiği kabul et'}
              </button>
            </div>
            <p className="mt-3 text-[11px] leading-relaxed text-mute">
              {english
                ? 'You can change your choice at any time using Privacy settings. Read the Privacy Policy and Cookie Policy for more information.'
                : 'Tercihinizi istediğiniz zaman Gizlilik ayarları bölümünden değiştirebilirsiniz. Ayrıntılar için Gizlilik ve Çerez Politikası metinlerini okuyabilirsiniz.'}
            </p>
            <a href="/legal/" className="mt-2 inline-flex text-xs font-bold text-ink underline underline-offset-4">
              {english ? 'Privacy, cookies & legal terms' : 'Gizlilik, çerezler ve yasal metinler'} →
            </a>
          </section>
        </div>
      )}
    </>
  );
}
