import React from 'react';
import { SlidersHorizontal, ChevronRight, Heart, Flame, Compass, ArrowLeft, ArrowRight, Activity } from 'lucide-react';
import { LighthouseWatchState } from '../types';

interface HomeScreenProps {
  onExplore: () => void;
  onOpenFilter: () => void;
  onGoLikes: () => void;
  onGoDashboard?: () => void;
  likesCount: number;
  langDict: Record<string, string>;
  reelsMode: boolean;
  lighthouseWatch: LighthouseWatchState;
  onUpdateDailyGoal: (goal: number) => void;
}

const rankOf = (streak: number, total: number) =>
  streak >= 14 || total >= 50 ? 'Usta'
  : streak >= 7 || total >= 25 ? 'Araştırmacı'
  : streak >= 3 || total >= 10 ? 'Gezgin'
  : 'Meraklı';

const RING_R = 30;
const RING_C = 2 * Math.PI * RING_R;

export const HomeScreen: React.FC<HomeScreenProps> = ({
  onExplore,
  onOpenFilter,
  onGoLikes,
  onGoDashboard,
  likesCount,
  langDict,
  reelsMode,
  lighthouseWatch,
  onUpdateDailyGoal
}) => {
  const { todayReadCount: today, dailyGoal: goal, streakDays, totalReadCount } = lighthouseWatch;
  const pct = Math.min(100, Math.round((today / Math.max(goal, 1)) * 100));
  const reached = today >= goal;
  const dateStr = new Date().toLocaleDateString('tr-TR', { weekday: 'long', day: 'numeric', month: 'long' });

  return (
    <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-5 pb-8 space-y-6 max-w-6xl mx-auto w-full select-none">
      {/* ── Karşılama ── */}
      <section className="pt-2">
        <p className="text-sm text-mute capitalize">{dateStr}</p>
        <h1 className="font-serif text-[44px] leading-[1.03] tracking-tight text-ink mt-2">
          Bilimi kaydırarak keşfet.
        </h1>
        <p className="mt-3 text-base leading-relaxed text-mute max-w-[32ch]">
          Akademik makaleleri kaydır, beğen, geç, derinleş.
        </p>

        <div className="flex flex-wrap items-center gap-3 mt-5">
          <button
            type="button"
            onClick={onExplore}
            data-tour="explore-btn"
            className="btn btn-primary hard-sm !min-h-[54px] !px-7 !text-base border-[1.5px] border-edge"
          >
            <Compass className="w-5 h-5" />
            {langDict.hero_explore || 'Keşfet'}
          </button>
          <button type="button" onClick={onOpenFilter} data-tour="filter-btn" className="btn btn-line !min-h-[54px]">
            <SlidersHorizontal className="w-4 h-4" />
            {langDict.hero_filter || 'Filtrele'}
          </button>
        </div>
        {reelsMode && <p className="mt-3 text-sm font-semibold text-accent-fg">Akış modu açık: makaleler dikey kayar.</p>}

        {/* Kaydırma kartı: uygulamanın ana hareketini gösterir */}
        <div className="relative h-52 mt-8" aria-hidden="true">
          <div className="absolute left-1/2 top-3 w-[64%] h-44 -translate-x-1/2 -rotate-[9deg] rounded-[26px] bg-t3 border-[1.5px] border-edge" />
          <div className="absolute left-1/2 top-1.5 w-[64%] h-44 -translate-x-1/2 rotate-[6deg] rounded-[26px] bg-t1 border-[1.5px] border-edge" />
          <div className="absolute left-1/2 top-0 w-[64%] h-44 -translate-x-1/2 -rotate-[2deg] rounded-[26px] bg-card border-[1.5px] border-edge hard overflow-hidden flex flex-col">
            <div className="bg-t4 px-4 py-3 space-y-2">
              <div className="h-3 w-4/5 rounded-full bg-on-tone" />
              <div className="h-3 w-3/5 rounded-full bg-on-tone" />
            </div>
            <div className="p-4 space-y-2.5">
              <div className="h-2 w-full rounded-full bg-line" />
              <div className="h-2 w-11/12 rounded-full bg-line" />
              <div className="h-2 w-4/5 rounded-full bg-line" />
              <div className="h-2 w-2/5 rounded-full bg-line" />
            </div>
          </div>
        </div>
        <div className="flex items-center justify-between text-sm font-semibold text-mute mt-1">
          <span className="inline-flex items-center gap-1.5"><ArrowLeft className="w-4 h-4" /> Sola kaydır: geç</span>
          <span className="inline-flex items-center gap-1.5">Sağa kaydır: beğen <ArrowRight className="w-4 h-4" /></span>
        </div>
      </section>

      {/* ── Beğenilenler ── */}
      <button
        type="button"
        onClick={onGoLikes}
        className="w-full flex items-center gap-4 rounded-[24px] bg-t5 text-on-tone p-4 text-left active:scale-[0.99] transition-transform"
      >
        <span className="w-12 h-12 rounded-2xl bg-card text-accent-fg flex items-center justify-center shrink-0">
          <Heart className="w-6 h-6 fill-current" />
        </span>
        <span className="flex-1 min-w-0">
          <b className="block text-lg font-extrabold">{langDict.likes_title || 'Beğenilenler'}</b>
          <span className="text-sm">{likesCount} {langDict.items_saved || 'makale kaydedildi'}</span>
        </span>
        <ChevronRight className="w-5 h-5 shrink-0" />
      </button>

      {/* ── Günlük okuma ── */}
      <section className="rounded-[24px] bg-card border border-line p-5">
        <div className="flex items-center gap-4">
          <div className="relative w-[76px] h-[76px] shrink-0" role="img" aria-label={`Günlük hedef yüzde ${pct}`}>
            <svg viewBox="0 0 76 76" className="w-full h-full -rotate-90">
              <circle cx="38" cy="38" r={RING_R} fill="none" strokeWidth="8" className="stroke-soft" />
              <circle
                cx="38" cy="38" r={RING_R} fill="none" strokeWidth="8" strokeLinecap="round"
                className="stroke-accent"
                style={{ strokeDasharray: RING_C, strokeDashoffset: RING_C - (RING_C * pct) / 100, transition: 'stroke-dashoffset .6s ease' }}
              />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-base font-extrabold text-ink">%{pct}</span>
          </div>

          <div className="flex-1 min-w-0">
            <h2 className="font-serif text-xl text-ink">Bugünkü okuma</h2>
            <p className="text-sm text-mute mt-0.5">
              {reached ? 'Hedefi tamamladın, tebrikler.' : `${today} / ${goal} makale okundu, ${Math.max(0, goal - today)} makale kaldı.`}
            </p>
            <span className="chip bg-t2 mt-2">
              <Flame className="w-3.5 h-3.5" /> {streakDays} gün üst üste
            </span>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-line flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-mute">Günlük hedef</span>
            <div className="inline-flex p-1 rounded-xl bg-soft" role="radiogroup" aria-label="Günlük hedef">
              {[3, 5, 10, 15].map((g) => (
                <button
                  key={g}
                  type="button"
                  role="radio"
                  aria-checked={goal === g}
                  onClick={() => onUpdateDailyGoal(g)}
                  className={`min-w-[36px] h-9 rounded-lg text-sm font-bold transition-colors ${goal === g ? 'bg-ink text-paper' : 'text-mute'}`}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>
          <span className="text-sm font-bold text-ink text-right leading-tight">
            {rankOf(streakDays, totalReadCount)}
            <span className="block text-xs font-medium text-mute">{totalReadCount} okuma</span>
          </span>
        </div>

        {onGoDashboard && (
          <button
            type="button"
            onClick={onGoDashboard}
            className="mt-4 w-full min-h-[48px] px-4 rounded-2xl bg-soft text-ink flex items-center justify-between text-sm font-bold"
          >
            <span className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-accent-fg" />
              Okuma istatistiklerim
              <span className="chip bg-t1 !py-0.5">Yakında</span>
            </span>
            <ChevronRight className="w-4 h-4 text-mute" />
          </button>
        )}
      </section>

      {/* ── Kapsam ── */}
      <section className="grid grid-cols-3 text-center divide-x divide-line" aria-label="Kapsam">
        {[
          ['270M+', langDict.stat_articles || 'Makale'],
          ['50K+', langDict.stat_journals || 'Dergi'],
          ['26', langDict.stat_fields || 'Alan']
        ].map(([num, label]) => (
          <div key={label} className="px-2">
            <b className="block font-serif text-3xl text-ink">{num}</b>
            <span className="text-sm text-mute">{label}</span>
          </div>
        ))}
      </section>

      <footer className="pt-4 pb-4 text-center border-t border-line">
        <p className="text-xs text-mute">© 2026 Binali. Her hakkı saklıdır.</p>
      </footer>
    </div>
  );
};
