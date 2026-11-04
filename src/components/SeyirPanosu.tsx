import React, { useMemo } from 'react';
import { Paper, LighthouseWatchState, ReadingHistoryItem } from '../types';
import { Flame } from 'lucide-react';

interface SeyirPanosuProps {
  readingHistory: ReadingHistoryItem[];
  likedPapers: Paper[];
  lighthouseWatch: LighthouseWatchState;
  onOpenDetails: (paper: Paper) => void;
  langDict: Record<string, string>;
}

/** Okuma istatistikleri. Şimdilik "Yakında" kilidinin arkasında önizleme olarak gösterilir. */
export const SeyirPanosu: React.FC<SeyirPanosuProps> = ({ readingHistory, likedPapers, lighthouseWatch }) => {
  const totalReads = Math.max(lighthouseWatch.totalReadCount, readingHistory.length);

  const fieldStats = useMemo(() => {
    const counts: Record<string, number> = {};
    readingHistory.forEach(h => { counts[h.field || 'Diğer'] = (counts[h.field || 'Diğer'] || 0) + 1; });
    likedPapers.forEach(p => { counts[p.field || 'Diğer'] = (counts[p.field || 'Diğer'] || 0) + 2; });
    const total = Object.values(counts).reduce((a, b) => a + b, 0) || 1;
    return Object.entries(counts)
      .map(([name, n]) => ({ name, pct: Math.round((n / total) * 100) }))
      .sort((a, b) => b.pct - a.pct)
      .slice(0, 6);
  }, [readingHistory, likedPapers]);

  const topKeywords = useMemo(() => {
    const map: Record<string, number> = {};
    likedPapers.forEach(p => (p.kw || []).forEach(k => { map[k] = (map[k] || 0) + 1; }));
    return Object.entries(map).sort((a, b) => b[1] - a[1]).slice(0, 10);
  }, [likedPapers]);

  return (
    <div className="flex-1 min-h-0 overflow-y-auto px-5 pb-10 max-w-lg min-[900px]:max-w-5xl mx-auto w-full space-y-5 select-none">
      <h1 className="font-serif text-[32px] leading-none text-ink">Okuma istatistiklerim</h1>

      <div className="grid grid-cols-3 gap-2.5 text-center">
        <div className="rounded-2xl bg-t1 text-on-tone p-3"><b className="block font-serif text-2xl">{totalReads}</b><span className="text-xs">okuma</span></div>
        <div className="rounded-2xl bg-t5 text-on-tone p-3"><b className="block font-serif text-2xl">{likedPapers.length}</b><span className="text-xs">beğeni</span></div>
        <div className="rounded-2xl bg-t2 text-on-tone p-3"><b className="font-serif text-2xl inline-flex items-center gap-1"><Flame className="w-5 h-5" />{lighthouseWatch.streakDays}</b><span className="block text-xs">gün üst üste</span></div>
      </div>

      <section className="rounded-[22px] bg-card border border-line p-4">
        <h2 className="font-serif text-lg text-ink mb-3">Alanlara göre dağılım</h2>
        {fieldStats.length === 0 ? (
          <p className="text-sm text-mute">Makale okudukça burada hangi alanlara yöneldiğini göreceksin.</p>
        ) : (
          <ul className="space-y-3">
            {fieldStats.map(s => (
              <li key={s.name}>
                <div className="flex justify-between text-sm font-semibold text-ink mb-1"><span>{s.name}</span><span className="text-mute">%{s.pct}</span></div>
                <div className="h-2.5 rounded-full bg-soft overflow-hidden"><div className="h-full rounded-full bg-accent" style={{ width: `${s.pct}%` }} /></div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="rounded-[22px] bg-card border border-line p-4">
        <h2 className="font-serif text-lg text-ink mb-3">Sık geçen konular</h2>
        {topKeywords.length === 0 ? (
          <p className="text-sm text-mute">Beğendiğin makalelerin anahtar kelimeleri burada toplanır.</p>
        ) : (
          <div className="flex flex-wrap gap-1.5">
            {topKeywords.map(([k, n]) => <span key={k} className="chip bg-t3">{k} <span className="opacity-60">{n}</span></span>)}
          </div>
        )}
      </section>
    </div>
  );
};
