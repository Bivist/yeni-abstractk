import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Paper } from '../types';
import { SFX } from '../utils/sfx';
import { toneFor, plainSummary } from '../utils/tone';
import { motion, AnimatePresence } from 'motion/react';
import { Heart, Info, ExternalLink, ChevronDown, Share2, SlidersHorizontal } from 'lucide-react';
import { EmptyDeck } from './EmptyDeck';

interface DiscoverReelsProps {
  queue: Paper[];
  likedPapers: Paper[];
  loading: boolean;
  onLikePaper: (paper: Paper) => void;
  onOpenDetails: (paper: Paper) => void;
  onOpenFilter: () => void;
  onFetchMore: () => void;
  filterSummary: string;
  isTranslating: boolean;
  langDict: Record<string, string>;
  onResetFilter?: () => void;
  onSharePaper?: (paper: Paper) => void;
}

const railBtn =
  'w-12 h-12 rounded-full bg-soft text-ink flex items-center justify-center active:scale-90 transition';

export const DiscoverReels: React.FC<DiscoverReelsProps> = ({
  queue,
  likedPapers,
  loading,
  onLikePaper,
  onOpenDetails,
  onOpenFilter,
  onFetchMore,
  filterSummary,
  isTranslating,
  langDict,
  onResetFilter,
  onSharePaper
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [heartBurst, setHeartBurst] = useState(false);
  const [doubleTapHeart, setDoubleTapHeart] = useState<{ x: number; y: number } | null>(null);

  const touchStartRef = useRef<{ x: number; y: number; time: number }>({ x: 0, y: 0, time: 0 });
  const lastTapRef = useRef<number>(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const currentPaper = queue[currentIndex];
  const isLiked = currentPaper ? likedPapers.some(p => p.id === currentPaper.id) : false;

  // Makale azalınca otomatik yükle
  useEffect(() => {
    if (queue.length - currentIndex < 4 && !loading) onFetchMore();
  }, [currentIndex, queue.length, loading, onFetchMore]);

  const goToNext = useCallback(() => {
    if (currentIndex < queue.length - 1) {
      SFX.up();
      setCurrentIndex(prev => prev + 1);
    }
  }, [currentIndex, queue.length]);

  const handleLike = useCallback(() => {
    if (!currentPaper) return;
    SFX.right();
    onLikePaper(currentPaper);
    setHeartBurst(true);
    setTimeout(() => setHeartBurst(false), 800);
  }, [currentPaper, onLikePaper]);

  const handlePointerDown = (e: React.PointerEvent) => {
    SFX.init();
    touchStartRef.current = { x: e.clientX, y: e.clientY, time: Date.now() };
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    const deltaX = e.clientX - touchStartRef.current.x;
    const deltaY = e.clientY - touchStartRef.current.y;
    const absX = Math.abs(deltaX);
    const absY = Math.abs(deltaY);

    // Çift dokunma: hızlı beğeni
    if (absX < 8 && absY < 8) {
      const now = Date.now();
      if (now - lastTapRef.current < 300) {
        if (containerRef.current) {
          const rect = containerRef.current.getBoundingClientRect();
          setDoubleTapHeart({ x: e.clientX - rect.left, y: e.clientY - rect.top });
          setTimeout(() => setDoubleTapHeart(null), 800);
        }
        handleLike();
      }
      lastTapRef.current = now;
      return;
    }

    if (absY > absX && absY > 45) {
      // Dikey kaydırma: sonraki makale
      goToNext();
    } else if (absX > absY && absX > 50) {
      if (deltaX > 50) {
        handleLike(); // sağa: beğen
      } else if (deltaX < -50 && currentPaper) {
        SFX.up();
        onOpenDetails(currentPaper); // sola: ayrıntı
      }
    }
  };

  return (
    <div ref={containerRef} data-tour="disc-stage" className="flex-1 flex flex-col h-full overflow-hidden select-none relative max-w-lg min-[900px]:max-w-4xl mx-auto w-full">
      {/* Filtre özeti */}
      <div className="flex items-center gap-2 px-4 pb-3 shrink-0">
        <span className="chip bg-soft !text-ink flex-1 min-w-0 !justify-start !py-2.5 !text-sm !font-semibold">
          <span className="truncate">{plainSummary(filterSummary || langDict.sum_default || 'Tüm alanlar')}</span>
        </span>
        <button type="button" onClick={onOpenFilter} data-tour="disc-filter" className="btn btn-line shrink-0">
          <SlidersHorizontal className="w-4 h-4" />
          {langDict.filter_btn || 'Filtrele'}
        </button>
      </div>

      <AnimatePresence>
        {heartBurst && (
          <motion.div
            initial={{ scale: 0.3, opacity: 1, y: 0 }}
            animate={{ scale: 2.2, opacity: 0, y: -70 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
            className="absolute inset-0 z-40 flex items-center justify-center pointer-events-none text-accent text-8xl"
            aria-hidden="true"
          >
            ♥
          </motion.div>
        )}
        {doubleTapHeart && (
          <motion.div
            initial={{ scale: 0.2, opacity: 1 }}
            animate={{ scale: 1.6, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.65, ease: 'easeOut' }}
            style={{ left: doubleTapHeart.x - 32, top: doubleTapHeart.y - 32 }}
            className="absolute z-40 pointer-events-none text-accent text-6xl"
            aria-hidden="true"
          >
            ♥
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex-1 relative mx-4 mb-3 min-h-0">
        {!currentPaper && (
          loading ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-mute" role="status">
              <div className="w-10 h-10 rounded-full border-[3px] border-line border-t-accent animate-spin" />
              <span className="text-sm font-semibold">{langDict.loading_articles || 'Makaleler yükleniyor…'}</span>
            </div>
          ) : (
            <EmptyDeck
              onOpenFilter={onOpenFilter}
              onReset={onResetFilter}
              message="Akışta gösterilecek başka makale kalmadı. Filtreleri genişletebilir ya da tüm alanlara dönebilirsin."
            />
          )
        )}

        {currentPaper && (
          <AnimatePresence mode="wait">
            <motion.div
              key={currentPaper.id}
              initial={{ opacity: 0, y: 40, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -40, scale: 0.98 }}
              transition={{ type: 'spring', damping: 26, stiffness: 280, mass: 0.8 }}
              onPointerDown={handlePointerDown}
              onPointerUp={handlePointerUp}
              className="absolute inset-0 flex flex-col rounded-[28px] bg-card border-[1.5px] border-edge hard overflow-hidden touch-none"
            >
              <div className={`${toneFor(currentPaper.sub || currentPaper.field)} text-on-tone px-5 pt-4 pb-5 pr-[72px] shrink-0`}>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="chip bg-white/60">{currentPaper.sub || currentPaper.field}</span>
                  {currentPaper.cross && <span className="chip bg-on-tone !text-white">Ortak alan: {currentPaper.cross}</span>}
                  {isTranslating && <span className="chip bg-white/60 animate-pulse">🐟 blup</span>}
                </div>
                <h2 className="font-serif text-[23px] leading-[1.17] mt-3 line-clamp-4">
                  {isTranslating && currentPaper.trTitle ? currentPaper.trTitle : currentPaper.title}
                </h2>
              </div>

              <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar px-5 pt-4 pr-[72px]">
                <p className="text-[15px] leading-relaxed text-ink/85">
                  {isTranslating && currentPaper.trAbs ? currentPaper.trAbs : currentPaper.abs}
                </p>
              </div>

              <div className="px-5 py-3 pr-[72px] border-t border-line flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <b className="block text-sm font-bold text-ink truncate">{currentPaper.authors || 'Yazar bilgisi yok'}</b>
                  <span className="block text-xs text-mute truncate">{currentPaper.journal}, {currentPaper.year}</span>
                </div>
                <span className="shrink-0 text-sm font-extrabold text-accent-fg tabular-nums">
                  {currentPaper.cites.toLocaleString('tr-TR')} atıf
                </span>
              </div>

              {/* Sağ eylem şeridi */}
              <div className="absolute right-3 bottom-3 flex flex-col items-center gap-2.5" onPointerDown={(e) => e.stopPropagation()} onPointerUp={(e) => e.stopPropagation()}>
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); handleLike(); }}
                  aria-label="Beğen"
                  aria-pressed={isLiked}
                  title="Beğen (sağa kaydır)"
                  className={`w-14 h-14 rounded-full border-[1.5px] border-edge flex items-center justify-center active:scale-90 transition ${isLiked ? 'bg-accent text-accent-ink' : 'bg-card text-ink'}`}
                >
                  <Heart className={`w-6 h-6 ${isLiked ? 'fill-current' : ''}`} />
                </button>
                <button type="button" onClick={(e) => { e.stopPropagation(); onOpenDetails(currentPaper); }} aria-label="Ayrıntılar" title="Ayrıntılar (sola kaydır)" className={railBtn}>
                  <Info className="w-5 h-5" />
                </button>
                {onSharePaper && (
                  <button type="button" onClick={(e) => { e.stopPropagation(); onSharePaper(currentPaper); }} aria-label={langDict.share_btn || 'Paylaş'} title={langDict.share_btn || 'Paylaş'} className={railBtn}>
                    <Share2 className="w-5 h-5" />
                  </button>
                )}
                {currentPaper.link && (
                  <a href={currentPaper.link} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} aria-label="Kaynağında aç" title="Kaynağında aç" className={railBtn}>
                    <ExternalLink className="w-[18px] h-[18px]" />
                  </a>
                )}
                <button type="button" onClick={(e) => { e.stopPropagation(); goToNext(); }} aria-label="Sonraki makale" title="Sonraki makale (kaydır)" className="w-12 h-12 rounded-full bg-ink text-paper flex items-center justify-center active:scale-90 transition">
                  <ChevronDown className="w-5 h-5" />
                </button>
              </div>
            </motion.div>
          </AnimatePresence>
        )}
      </div>

      <p className="text-center text-xs text-mute pb-1.5 shrink-0">
        Kaydır: sonraki makale. Sağa: beğen. Sola: ayrıntı.
      </p>
    </div>
  );
};
