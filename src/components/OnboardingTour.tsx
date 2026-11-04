import React, { useCallback, useEffect, useLayoutEffect, useState } from 'react';
import { TabId } from '../types';

interface TourStep {
  target?: string; // data-tour değeri; yoksa ekranın ortasında gösterilir
  tab?: TabId; // adım gösterilmeden önce açılacak sekme
  tr: { title: string; text: string };
  en: { title: string; text: string };
}

const STEPS: TourStep[] = [
  {
    tab: 'home',
    tr: { title: 'Abstract’a hoş geldin', text: 'Akademik makaleleri kaydırarak keşfet. Sana kısa bir tur yapalım; istediğin an “Turu geç” ile çıkabilirsin.' },
    en: { title: 'Welcome to Abstract', text: 'Discover academic papers by swiping. Let’s take a quick tour; you can leave any time with “Skip tour”.' }
  },
  {
    tab: 'home',
    target: 'explore-btn',
    tr: { title: 'Keşfet', text: 'Buna basınca makale kartları açılır. Kartları kaydırarak gezersin.' },
    en: { title: 'Explore', text: 'Tap here to open the paper cards and start swiping.' }
  },
  {
    tab: 'home',
    target: 'filter-btn',
    tr: { title: 'Filtrele', text: 'Alan, yayın yılı, yazar ve dergi seçebilirsin. Birden fazla alan seçersen önce hepsinin ortak olduğu makaleler gelir; ortak yayın yoksa sana haber verilir ve alanlar ayrı ayrı gösterilir.' },
    en: { title: 'Filter', text: 'Pick fields, publication years, author and journal. With several fields, papers shared by all of them come first; if none exist you are told and the fields are shown separately.' }
  },
  {
    tab: 'home',
    target: 'theme-btn',
    tr: { title: 'Gündüz / gece', text: 'Bu düğme görünümü gündüz ve gece arasında değiştirir.' },
    en: { title: 'Day / night', text: 'This button switches the look between day and night.' }
  },
  {
    tab: 'home',
    target: 'nav-disc',
    tr: { title: 'Keşfet sekmesi', text: 'Makale akışına istediğin zaman ortadaki bu büyük düğmeden dönebilirsin.' },
    en: { title: 'Explore tab', text: 'Come back to the paper feed any time with this big button in the middle.' }
  },
  {
    tab: 'disc',
    target: 'disc-stage',
    tr: { title: 'Makale kartı', text: 'Kartı sağa kaydır: beğen. Sola kaydır: geç. Yukarı kaydır ya da karta dokun: makalenin ayrıntıları açılır.' },
    en: { title: 'Paper card', text: 'Swipe right to like, left to pass. Swipe up or tap the card to open the paper details.' }
  },
  {
    tab: 'disc',
    target: 'disc-actions',
    tr: { title: 'Düğmeler', text: 'Kaydırmak istemezsen bu düğmeleri kullan: ✕ geç, ▲ ayrıntı, ♥ beğen.' },
    en: { title: 'Buttons', text: 'Prefer not to swipe? Use these: ✕ pass, ▲ details, ♥ like.' }
  },
  {
    tab: 'disc',
    target: 'disc-filter',
    tr: { title: 'Hızlı filtre', text: 'Filtreyi akıştayken de buradan değiştirebilirsin.' },
    en: { title: 'Quick filter', text: 'You can also change the filter from the feed right here.' }
  },
  {
    tab: 'disc',
    target: 'nav-likes',
    tr: { title: 'Beğenilenler', text: 'Beğendiğin makaleler burada birikir. Klasörlere ayırabilir ve çıktı alabilirsin.' },
    en: { title: 'Favorites', text: 'Papers you like are collected here. Sort them into folders and export them.' }
  },
  {
    tab: 'likes',
    target: 'nav-dashboard',
    tr: { title: 'Seyir (yakında)', text: 'Okuma istatistiklerin ve bilgi haritan burada olacak. Şimdilik kilitli; yakında açılacak.' },
    en: { title: 'Voyage (coming soon)', text: 'Your reading stats and knowledge map will live here. It is locked for now and opens soon.' }
  },
  {
    tab: 'sets',
    target: 'nav-sets',
    tr: { title: 'Ayarlar', text: 'Akış modu (dikey kaydırma), tema, dil, ses ve çeviri ayarları burada. Bu turu da buradan yeniden başlatabilirsin.' },
    en: { title: 'Settings', text: 'Feed mode, theme, language, sound and translation live here. You can also replay this tour from here.' }
  },
  {
    tab: 'home',
    tr: { title: 'Hazırsın!', text: 'İyi keşifler. Önce “Keşfet”e basıp ilk makaleni kaydır.' },
    en: { title: 'You’re all set!', text: 'Happy exploring. Tap “Explore” and swipe your first paper.' }
  }
];

interface Props {
  lang: 'tr' | 'en';
  onSetTab: (tab: TabId) => void;
  onClose: () => void;
}

const PAD = 6;
const TIP_W = 300;

export const OnboardingTour: React.FC<Props> = ({ lang, onSetTab, onClose }) => {
  const [idx, setIdx] = useState(0);
  const [rect, setRect] = useState<DOMRect | null>(null);
  const [vp, setVp] = useState({ w: window.innerWidth, h: window.innerHeight });
  const step = STEPS[idx];
  const t = step[lang] || step.tr;
  const isLast = idx === STEPS.length - 1;
  const L = lang === 'en'
    ? { skip: 'Skip tour', next: 'Next', back: 'Back', done: 'Finish' }
    : { skip: 'Turu geç', next: 'İleri', back: 'Geri', done: 'Bitir' };

  // Adım değişince doğru sekmeye geç
  useEffect(() => {
    if (step.tab) onSetTab(step.tab);
  }, [idx]);

  // Hedef elemanı bul (sekme geçişi sonrası görünmesi için kısa süre dener) ve konumunu takip et
  const measure = useCallback(() => {
    setVp({ w: window.innerWidth, h: window.innerHeight });
    if (!step.target) { setRect(null); return; }
    const el = document.querySelector<HTMLElement>(`[data-tour="${step.target}"]`);
    if (!el) { setRect(null); return; }
    const r = el.getBoundingClientRect();
    setRect(r.width && r.height ? r : null);
  }, [step.target]);

  useLayoutEffect(() => {
    setRect(null);
    measure();
    let tries = 0;
    const timer = setInterval(() => {
      measure();
      if (++tries > 12) clearInterval(timer);
    }, 120);
    window.addEventListener('resize', measure);
    return () => {
      clearInterval(timer);
      window.removeEventListener('resize', measure);
    };
  }, [idx, measure]);

  const next = () => (isLast ? onClose() : setIdx(i => i + 1));
  const back = () => setIdx(i => Math.max(0, i - 1));

  // Tooltip konumu: hedefin altına, yer yoksa üstüne; yatayda ekrana sığdır
  const tipW = Math.min(TIP_W, vp.w - 24);
  let tipStyle: React.CSSProperties;
  if (rect) {
    const below = rect.bottom + PAD + 12;
    const placeBelow = below + 170 < vp.h || rect.top < 200;
    const left = Math.min(Math.max(12, rect.left + rect.width / 2 - tipW / 2), vp.w - tipW - 12);
    tipStyle = placeBelow
      ? { top: Math.min(below, vp.h - 190), left, width: tipW }
      : { bottom: vp.h - rect.top + PAD + 12, left, width: tipW };
  } else {
    tipStyle = { top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: tipW };
  }

  return (
    <div className="fixed inset-0 z-[70]" role="dialog" aria-modal="true" aria-label="Uygulama turu">
      {/* Tıklamaları engelleyen katman */}
      <div className="absolute inset-0" onClick={(e) => e.stopPropagation()} />

      {/* Karartma + vurgulu alan */}
      {rect ? (
        <div
          className="absolute rounded-2xl pointer-events-none transition-all duration-300 ring-[3px] ring-accent"
          style={{
            top: rect.top - PAD,
            left: rect.left - PAD,
            width: rect.width + PAD * 2,
            height: rect.height + PAD * 2,
            boxShadow: '0 0 0 9999px rgba(6, 19, 15, 0.74)'
          }}
        />
      ) : (
        <div className="absolute inset-0 bg-[#06130f]/75 pointer-events-none" />
      )}

      {/* Açıklama kutusu */}
      <div className="absolute rounded-[22px] bg-card text-ink border-[1.5px] border-edge hard p-4" style={tipStyle}>
        <div className="flex items-start justify-between gap-2 mb-1">
          <h4 className="font-serif text-lg">{t.title}</h4>
          <span className="text-xs font-semibold text-mute tabular-nums shrink-0 mt-1.5">{idx + 1}/{STEPS.length}</span>
        </div>
        <p className="text-sm leading-relaxed text-mute">{t.text}</p>

        <div className="flex items-center justify-between mt-4">
          <button type="button" onClick={onClose} className="text-sm font-semibold text-mute underline underline-offset-2 min-h-[44px] pr-2">
            {L.skip}
          </button>
          <div className="flex gap-2">
            {idx > 0 && <button type="button" onClick={back} className="btn btn-ghost !min-h-[44px]">{L.back}</button>}
            <button type="button" onClick={next} className="btn btn-primary !min-h-[44px]">{isLast ? L.done : L.next}</button>
          </div>
        </div>
      </div>
    </div>
  );
};
