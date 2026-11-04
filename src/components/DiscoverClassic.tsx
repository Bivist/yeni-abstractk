import React, { useState, useRef } from 'react';
import { Paper } from '../types';
import { SFX } from '../utils/sfx';
import { toneFor, plainSummary } from '../utils/tone';
import { SlidersHorizontal, ArrowUp, Heart, X, Share2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { EmptyDeck } from './EmptyDeck';

interface DiscoverClassicProps {
  queue: Paper[];
  loading: boolean;
  onSwipe: (dir: number) => void;
  onOpenDetails: (paper: Paper) => void;
  onOpenFilter: () => void;
  filterSummary: string;
  isTranslating: boolean;
  langDict: Record<string, string>;
  hasMore: boolean;
  onResetFilter?: () => void;
  onSharePaper?: (paper: Paper) => void;
}

export const DiscoverClassic: React.FC<DiscoverClassicProps> = ({
  queue,
  loading,
  onSwipe,
  onOpenDetails,
  onOpenFilter,
  filterSummary,
  isTranslating,
  langDict,
  onResetFilter,
  onSharePaper
}) => {
  const topPaper = queue[0];
  const behindPaper = queue[1];

  const [dragOffset, setDragOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [heartBurst, setHeartBurst] = useState(false);
  const pointerStart = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  const handlePointerDown = (e: React.PointerEvent) => {
    SFX.init();
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
    pointerStart.current = { x: e.clientX, y: e.clientY };
    setIsDragging(true);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    setDragOffset({ x: e.clientX - pointerStart.current.x, y: e.clientY - pointerStart.current.y });
  };

  const handlePointerUp = () => {
    if (!isDragging) return;
    setIsDragging(false);

    const { x, y } = dragOffset;
    // Yukarı kaydır: ayrıntı
    if (y < -75 && Math.abs(y) > Math.abs(x)) {
      setDragOffset({ x: 0, y: 0 });
      if (topPaper) onOpenDetails(topPaper);
      return;
    }
    // Yatay kaydırma: beğen / geç
    if (Math.abs(x) > 90) {
      if (x > 0) {
        setHeartBurst(true);
        setTimeout(() => setHeartBurst(false), 700);
      }
      onSwipe(x > 0 ? 1 : -1);
      setDragOffset({ x: 0, y: 0 });
      return;
    }
    // Dokunma: ayrıntı
    if (Math.abs(x) < 6 && Math.abs(y) < 6 && topPaper) {
      onOpenDetails(topPaper);
    }
    setDragOffset({ x: 0, y: 0 });
  };

  const likeOpacity = Math.min(1, Math.max(0, dragOffset.x / 80));
  const nopeOpacity = Math.min(1, Math.max(0, -dragOffset.x / 80));

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden select-none max-w-lg min-[900px]:max-w-4xl mx-auto w-full">
      {/* Filtre özeti */}
      <div className="flex items-center gap-2 px-4 pb-3 shrink-0">
        <span className="chip bg-soft !text-ink flex-1 min-w-0 !justify-start !py-2.5 !text-sm !font-semibold">
          <span className="truncate">{plainSummary(filterSummary || langDict.sum_default || 'Tüm alanlar, rastgele')}</span>
        </span>
        <button type="button" onClick={onOpenFilter} data-tour="disc-filter" className="btn btn-line shrink-0">
          <SlidersHorizontal className="w-4 h-4" />
          {langDict.filter_btn || 'Filtrele'}
        </button>
      </div>

      {/* Kart sahnesi */}
      <div data-tour="disc-stage" className="flex-1 relative mx-4 mb-3 min-h-0">
        <AnimatePresence>
          {heartBurst && (
            <motion.div
              initial={{ scale: 0.4, opacity: 1, y: 0 }}
              animate={{ scale: 1.6, opacity: 0, y: -60 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.65, ease: 'easeOut' }}
              className="absolute inset-0 z-30 flex items-center justify-center pointer-events-none text-8xl text-accent"
              aria-hidden="true"
            >
              ♥
            </motion.div>
          )}
        </AnimatePresence>

        {!topPaper && (
          loading ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-mute" role="status">
              <div className="w-10 h-10 rounded-full border-[3px] border-line border-t-accent animate-spin" />
              <span className="text-sm font-semibold">{langDict.loading_articles || 'Makaleler yükleniyor…'}</span>
            </div>
          ) : (
            <EmptyDeck
              onOpenFilter={onOpenFilter}
              onReset={onResetFilter}
              message="Seçtiğin filtrelere uyan yeni makale bulunamadı. Filtreleri genişletebilir ya da tüm alanlara dönebilirsin."
            />
          )
        )}

        {/* Arkadaki kart */}
        {behindPaper && (
          <div
            className="absolute inset-0 rounded-[28px] bg-card border-[1.5px] border-edge overflow-hidden pointer-events-none"
            style={{ transform: 'scale(0.95) translateY(14px)', opacity: 0.7 }}
          >
            <div className={`${toneFor(behindPaper.sub || behindPaper.field)} h-28`} />
          </div>
        )}

        {/* Üstteki kart */}
        {topPaper && (
          <div
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            className="absolute inset-0 z-10 flex flex-col rounded-[28px] bg-card border-[1.5px] border-edge hard overflow-hidden touch-none cursor-grab active:cursor-grabbing will-change-transform"
            style={{
              transform: isDragging
                ? `translate3d(${dragOffset.x}px, ${dragOffset.y * 0.45}px, 0) rotate(${dragOffset.x * 0.06}deg)`
                : 'translate3d(0, 0, 0)',
              transition: isDragging ? 'none' : 'transform 0.28s cubic-bezier(0.16, 1, 0.3, 1)'
            }}
          >
            {/* Renkli başlık bandı */}
            <div className={`${toneFor(topPaper.sub || topPaper.field)} text-on-tone px-5 pt-4 pb-5 shrink-0`}>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="chip bg-white/60">{topPaper.sub || topPaper.field}</span>
                {topPaper.cross && <span className="chip bg-on-tone !text-white">Ortak alan: {topPaper.cross}</span>}
                {isTranslating && <span className="chip bg-white/60 ml-auto animate-pulse">🐟 blup</span>}
              </div>
              <h3 className="font-serif text-[23px] leading-[1.17] mt-3 line-clamp-5">
                {isTranslating && topPaper.trTitle ? topPaper.trTitle : topPaper.title}
              </h3>
            </div>

            {/* Özet */}
            <div className="flex-1 min-h-0 overflow-hidden px-5 pt-4">
              <p className="text-[15px] leading-relaxed text-ink/85 [mask-image:linear-gradient(to_bottom,black_72%,transparent_100%)] h-full">
                {isTranslating && topPaper.trAbs ? topPaper.trAbs : topPaper.abs}
              </p>
            </div>

            {/* Künye */}
            <div className="px-5 py-3 border-t border-line flex items-center justify-between gap-3">
              <div className="min-w-0">
                <b className="block text-sm font-bold text-ink truncate">{topPaper.authors || 'Yazar bilgisi yok'}</b>
                <span className="block text-xs text-mute truncate">{topPaper.journal}</span>
              </div>
              <div className="text-right shrink-0">
                <span className="block text-xs text-mute">{topPaper.year}</span>
                <span className="block text-sm font-extrabold text-accent-fg tabular-nums">
                  {topPaper.cites.toLocaleString('tr-TR')} atıf
                </span>
              </div>
            </div>

            {/* Damgalar */}
            <div
              className="absolute top-20 right-4 chip !text-base !px-4 !py-1.5 bg-t4 border-2 border-edge rotate-6 pointer-events-none"
              style={{ opacity: likeOpacity }}
            >
              Beğendim
            </div>
            <div
              className="absolute top-20 left-4 chip !text-base !px-4 !py-1.5 bg-t2 border-2 border-edge -rotate-6 pointer-events-none"
              style={{ opacity: nopeOpacity }}
            >
              Geç
            </div>
          </div>
        )}
      </div>

      {/* Eylem düğmeleri */}
      <div data-tour="disc-actions" className="flex items-center justify-center gap-4 pb-2 shrink-0">
        <button
          type="button"
          onClick={() => onSwipe(-1)}
          aria-label="Geç"
          title="Geç"
          disabled={!topPaper}
          className="w-14 h-14 rounded-full bg-card border-[1.5px] border-edge text-ink flex items-center justify-center active:scale-90 transition disabled:opacity-40"
        >
          <X className="w-6 h-6" strokeWidth={2.5} />
        </button>
        <button
          type="button"
          onClick={() => topPaper && onOpenDetails(topPaper)}
          aria-label="Ayrıntılar"
          title="Ayrıntılar"
          disabled={!topPaper}
          className="w-12 h-12 rounded-full bg-soft text-ink flex items-center justify-center active:scale-90 transition disabled:opacity-40"
        >
          <ArrowUp className="w-5 h-5" strokeWidth={2.5} />
        </button>
        {onSharePaper && (
          <button
            type="button"
            onClick={() => topPaper && onSharePaper(topPaper)}
            aria-label={langDict.share_btn || 'Paylaş'}
            title={langDict.share_btn || 'Paylaş'}
            disabled={!topPaper}
            className="w-12 h-12 rounded-full bg-soft text-ink flex items-center justify-center active:scale-90 transition disabled:opacity-40"
          >
            <Share2 className="w-5 h-5" />
          </button>
        )}
        <button
          type="button"
          onClick={() => onSwipe(1)}
          aria-label="Beğen"
          title="Beğen"
          disabled={!topPaper}
          className="w-16 h-16 rounded-full bg-accent text-accent-ink border-[1.5px] border-edge hard-sm flex items-center justify-center active:scale-90 transition disabled:opacity-40"
        >
          <Heart className="w-7 h-7 fill-current" />
        </button>
      </div>
      <p className="text-center text-[11px] text-mute pb-1.5 shrink-0">© 2026 Binali. Her hakkı saklıdır.</p>
    </div>
  );
};
