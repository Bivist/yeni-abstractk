import { Paper, ReadingHistoryItem } from '../types';

type Signal = { paper: Pick<Paper, 'field' | 'sub' | 'kw' | 'tp'>; weight: number };

const normalize = (value: string) =>
  String(value || '')
    .toLocaleLowerCase('tr')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/ı/g, 'i')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();

const phrase = (value: string) => normalize(value).replace(/\s+/g, ' ');

function addFeature(profile: Map<string, number>, key: string, weight: number) {
  if (!key || key.length < 2) return;
  profile.set(key, (profile.get(key) || 0) + weight);
}

function featuresOf(paper: Pick<Paper, 'field' | 'sub' | 'kw' | 'tp'>, weight: number, profile: Map<string, number>) {
  addFeature(profile, `field:${phrase(paper.field)}`, weight * 2.8);
  addFeature(profile, `sub:${phrase(paper.sub || '')}`, weight * 2.1);
  (paper.kw || []).forEach(item => addFeature(profile, `term:${phrase(item)}`, weight * 1.7));
  (paper.tp || []).forEach(item => addFeature(profile, `topic:${phrase(item)}`, weight * 1.4));
}

function scorePaper(
  paper: Paper,
  profile: Map<string, number>,
  interactedIds: Set<string>
): number {
  if (interactedIds.has(paper.id)) return -1000;

  let score = 0;
  const field = `field:${phrase(paper.field)}`;
  const sub = `sub:${phrase(paper.sub || '')}`;
  score += profile.get(field) || 0;
  score += profile.get(sub) || 0;

  for (const item of paper.kw || []) score += profile.get(`term:${phrase(item)}`) || 0;
  for (const item of paper.tp || []) score += profile.get(`topic:${phrase(item)}`) || 0;

  // Küçük bir keşif payı: kişiselleştirme benzer içeriklere kilitlenmesin.
  const year = Number(paper.year);
  if (Number.isFinite(year)) {
    const age = Math.max(0, new Date().getFullYear() - year);
    score += Math.max(0, 1.2 - age * 0.08);
  }
  return score;
}

/**
 * Beğeniler ve kullanıcının ayrıntısını açtığı makalelerden ilgi profili çıkarır.
 * Profil yoksa mevcut keşif sırası korunur (soğuk başlangıç).
 */
export function rankPapersForUser(
  papers: Paper[],
  liked: Paper[],
  history: ReadingHistoryItem[]
): Paper[] {
  if (!papers.length || (!liked.length && !history.length)) return papers;

  const profile = new Map<string, number>();
  const interactedIds = new Set<string>();

  liked.forEach(paper => {
    interactedIds.add(paper.id);
    featuresOf(paper, 3.2, profile);
  });

  history.forEach(item => {
    interactedIds.add(item.paperId);
    featuresOf({
      field: item.field,
      sub: item.sub,
      kw: item.kw || [],
      tp: []
    }, 1.35, profile);
  });

  return papers
    .map((paper, index) => ({
      paper,
      index,
      score: scorePaper(paper, profile, interactedIds)
    }))
    .sort((a, b) => {
      if (a.score !== b.score) return b.score - a.score;
      return a.index - b.index;
    })
    .map(item => item.paper);
}
