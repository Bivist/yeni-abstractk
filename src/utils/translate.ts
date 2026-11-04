import { Paper } from '../types';

// Bounded memory cache for translated strings to prevent memory leaks
class TranslationCache {
  private cache = new Map<string, string>();
  private maxItems = 400;

  get(key: string): string | undefined {
    return this.cache.get(key);
  }

  set(key: string, val: string) {
    if (this.cache.size >= this.maxItems) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey) this.cache.delete(firstKey);
    }
    this.cache.set(key, val);
  }

  has(key: string): boolean {
    return this.cache.has(key);
  }
}

const memoryCache = new TranslationCache();

// Safe async translation with 3.5s timeout to guarantee zero main-thread freeze
export async function translateSingle(text: string, targetLang: string = 'tr'): Promise<string> {
  if (!text || !text.trim()) return '';
  const trimmed = text.trim();
  const cached = memoryCache.get(trimmed);
  if (cached) return cached;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);

    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${targetLang}&dt=t&q=${encodeURIComponent(trimmed)}`;
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (!res.ok) return text;
    const data = await res.json();
    const result = (data[0] || []).map((x: any) => x[0]).join('');
    if (result) {
      memoryCache.set(trimmed, result);
      return result;
    }
    return text;
  } catch (err) {
    // Graceful fallback to original text without throwing or stalling
    return text;
  }
}

export function chunkText(text: string): string[] {
  const chunks: string[] = [];
  let current = '';
  const sentences = text.split(/(?<=[.!?])\s+/);
  for (const part of sentences) {
    if (current && (current + part).length > 500) {
      chunks.push(current);
      current = '';
    }
    current += (current ? ' ' : '') + part;
  }
  if (current) chunks.push(current);
  return chunks.slice(0, 4); // Limit chunks to keep latency ultra-low
}

export async function ensureTranslatedPaper(paper: Paper, targetLang: string = 'tr'): Promise<Paper> {
  if (!paper) return paper;
  if (paper.trTitle && paper.trAbs) return paper;
  if (paper.trP) return paper.trP;

  paper.trP = (async () => {
    try {
      const [t, bParts] = await Promise.all([
        translateSingle(paper.title, targetLang),
        Promise.all(chunkText(paper.abs).map(c => translateSingle(c, targetLang)))
      ]);
      paper.trTitle = t || paper.title;
      paper.trAbs = bParts.join(' ') || paper.abs;
    } catch {
      paper.trTitle = paper.title;
      paper.trAbs = paper.abs;
    }
    return paper;
  })();

  return paper.trP;
}
