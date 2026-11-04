import { Paper, SettingsState, LighthouseWatchState, ReadingHistoryItem } from '../types';

/**
 * localStorage'dan okunan veriyi doğrular. Bozuk / elle değiştirilmiş / eski sürümden kalan veri
 * uygulamayı çökertmesin diye her alan tek tek kontrol edilir.
 */

const isObj = (v: unknown): v is Record<string, any> => !!v && typeof v === 'object' && !Array.isArray(v);
const isStr = (v: unknown): v is string => typeof v === 'string';
const num = (v: unknown, d: number) => (typeof v === 'number' && Number.isFinite(v) ? v : d);

export function readRaw(key: string): unknown {
  try {
    const s = localStorage.getItem(key);
    return s ? JSON.parse(s) : undefined;
  } catch {
    return undefined;
  }
}

/** Yerel saate göre YYYY-MM-DD (toISOString UTC verdiği için gece yarısı civarında günü kaydırıyordu). */
export function localDateStr(d: Date = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function loadSettings(defaults: SettingsState): SettingsState {
  return sanitizeSettings(readRaw('abs_s'), defaults);
}

/** Ham (localStorage veya bulut) veriyi ayar nesnesine çevirir; geçersiz alanlar varsayılana düşer. */
export function sanitizeSettings(raw: unknown, defaults: SettingsState): SettingsState {
  if (!isObj(raw)) return defaults;
  return {
    theme: raw.theme === 'light' || raw.theme === 'dark' || raw.theme === 'auto' ? raw.theme : defaults.theme,
    fx: typeof raw.fx === 'boolean' ? raw.fx : defaults.fx,
    translate: typeof raw.translate === 'boolean' ? raw.translate : defaults.translate,
    sound: typeof raw.sound === 'boolean' ? raw.sound : defaults.sound,
    lang: raw.lang === 'en' || raw.lang === 'tr' ? raw.lang : defaults.lang,
    reelsMode: typeof raw.reelsMode === 'boolean' ? raw.reelsMode : defaults.reelsMode,
    displayMode: raw.displayMode === 'mobile' || raw.displayMode === 'desktop' || raw.displayMode === 'auto' ? raw.displayMode : defaults.displayMode
  };
}

export function loadLikedPapers(): Paper[] {
  return sanitizeLiked(readRaw('abs_liked'));
}

export function sanitizeLiked(raw: unknown): Paper[] {
  if (!Array.isArray(raw)) return [];
  const seen = new Set<string>();
  const out: Paper[] = [];
  for (const p of raw) {
    if (!isObj(p) || !isStr(p.id) || !isStr(p.title) || seen.has(p.id)) continue;
    seen.add(p.id);
    out.push({
      ...(p as any),
      link: isStr(p.link) ? p.link : '',
      abs: isStr(p.abs) ? p.abs : '',
      journal: isStr(p.journal) ? p.journal : '',
      authors: isStr(p.authors) ? p.authors : '',
      field: isStr(p.field) ? p.field : '',
      year: isStr(p.year) || typeof p.year === 'number' ? p.year : '',
      cites: num(p.cites, 0),
      refs: num(p.refs, 0),
      au: Array.isArray(p.au) ? p.au.filter((a: any) => isObj(a) && isStr(a.n)) : [],
      kw: Array.isArray(p.kw) ? p.kw.filter(isStr) : [],
      tp: Array.isArray(p.tp) ? p.tp.filter(isStr) : []
    });
  }
  return out;
}

export function loadFolders(): Record<string, string[]> {
  return sanitizeFolders(readRaw('abs_folders'));
}

export function sanitizeFolders(raw: unknown): Record<string, string[]> {
  if (!isObj(raw)) return {};
  const out: Record<string, string[]> = {};
  for (const [k, v] of Object.entries(raw)) {
    if (Array.isArray(v)) out[k] = v.filter(isStr);
  }
  return out;
}

export function loadHistory(): ReadingHistoryItem[] {
  return sanitizeHistory(readRaw('abs_history'));
}

export function sanitizeHistory(raw: unknown): ReadingHistoryItem[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter(h => isObj(h) && isStr(h.paperId) && isStr(h.title))
    .slice(0, 50)
    .map(h => ({
      paperId: h.paperId,
      title: h.title,
      field: isStr(h.field) ? h.field : 'Genel Bilim',
      sub: isStr(h.sub) ? h.sub : undefined,
      kw: Array.isArray(h.kw) ? h.kw.filter(isStr) : [],
      cites: num(h.cites, 0),
      timestamp: num(h.timestamp, Date.now())
    }));
}

export function freshLighthouseWatch(): LighthouseWatchState {
  return {
    streakDays: 1,
    lastVisitDate: localDateStr(),
    todayReadCount: 0,
    dailyGoal: 5,
    totalReadCount: 0,
    beamPower: 20
  };
}

export function loadLighthouseWatch(): LighthouseWatchState {
  return sanitizeLighthouseWatch(readRaw('abs_streak'));
}

/** Ham veriyi doğrular ve gün değişmişse seriyi (streak) günceller. */
export function sanitizeLighthouseWatch(raw: unknown): LighthouseWatchState {
  const today = localDateStr();
  const fresh = freshLighthouseWatch();
  if (!isObj(raw) || !isStr(raw.lastVisitDate)) return fresh;

  const parsed: LighthouseWatchState = {
    streakDays: Math.max(1, num(raw.streakDays, 1)),
    lastVisitDate: raw.lastVisitDate,
    todayReadCount: Math.max(0, num(raw.todayReadCount, 0)),
    dailyGoal: Math.max(1, num(raw.dailyGoal, 5)),
    totalReadCount: Math.max(0, num(raw.totalReadCount, 0)),
    beamPower: Math.min(100, Math.max(0, num(raw.beamPower, 20)))
  };
  if (parsed.lastVisitDate === today) return parsed;

  const yesterday = localDateStr(new Date(Date.now() - 86400000));
  const streakDays = parsed.lastVisitDate === yesterday ? parsed.streakDays + 1 : 1;
  return {
    ...parsed,
    streakDays,
    lastVisitDate: today,
    todayReadCount: 0,
    beamPower: Math.min(100, Math.round((streakDays / 7) * 100))
  };
}
