export interface AuthorAffiliation {
  n: string;
  i?: string;
}

export interface Paper {
  id: string;
  link: string;
  title: string;
  abs: string;
  year: number | string;
  date?: string;
  lang?: string;
  type?: string;
  journal: string;
  pub?: string;
  authors: string;
  au: AuthorAffiliation[];
  field: string;
  sub?: string;
  kw: string[];
  tp: string[];
  cites: number;
  refs: number;
  oa?: string;
  cross?: string;
  trTitle?: string;
  trAbs?: string;
  trP?: Promise<any>;
}

export interface FilterState {
  sel: Set<string>;
  from: string;
  to: string;
  authorId: string;
  journalId: string;
  aName: string;
  jName: string;
  en: boolean;
}

export interface SettingsState {
  theme: 'auto' | 'light' | 'dark';
  fx: boolean;
  translate: boolean;
  sound: boolean;
  lang: 'tr' | 'en';
  reelsMode: boolean; // Akış modu (dikey kaydırma)
  displayMode: 'auto' | 'mobile' | 'desktop';
}

export interface LighthouseWatchState {
  streakDays: number;
  lastVisitDate: string; // YYYY-MM-DD
  todayReadCount: number;
  dailyGoal: number; // default 5 articles
  totalReadCount: number;
  beamPower: number; // 0 to 100%
}

export interface TaxonomyNode {
  id: string;
  label: string;
  s?: { u?: number; f?: number };
  q?: string;
  children: TaxonomyNode[];
  parent?: TaxonomyNode | null;
  root?: TaxonomyNode;
  el?: HTMLDivElement;
}

export interface ReadingHistoryItem {
  paperId: string;
  title: string;
  field: string;
  sub?: string;
  kw: string[];
  cites: number;
  timestamp: number;
}

export type TabId = 'home' | 'disc' | 'likes' | 'dashboard' | 'sets';
