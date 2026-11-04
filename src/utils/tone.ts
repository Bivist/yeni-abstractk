/** Makale alanına göre kararlı bir pastel ton seçer (kart başlık bandı ve etiketler için). */
const TONES = ['bg-t1', 'bg-t2', 'bg-t3', 'bg-t4', 'bg-t5'] as const;

export function toneFor(seed: string): (typeof TONES)[number] {
  let h = 0;
  for (const c of String(seed || '')) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return TONES[h % TONES.length];
}

/** "＋ Klasör" / "⬇ Çıktı al" gibi metinlerin başındaki simgeleri atar. */
export const stripSymbol = (s: string) => s.replace(/^[^\p{L}\p{N}]+/u, '');

/** Özet çipinde "A · B" yerine "A, B" gösterir. */
export const plainSummary = (s: string) => s.replace(/\s·\s/g, ', ');
