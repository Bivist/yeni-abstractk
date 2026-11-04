import { Paper } from '../types';
import { WORK_ID_RE, shortWorkId } from './openalex';

/** Uygulamanın herkese açık, arama motorlarınca okunabilir makale sayfası. */
export function buildShareUrl(paper: Pick<Paper, 'id'>): string {
  const id = shortWorkId(paper.id);
  return WORK_ID_RE.test(id)
    ? `${window.location.origin}/paper/${id}`
    : `${window.location.origin}/`;
}

/** Açılışta eski paylaşım bağlantılarındaki makale kimliğini okur. */
export function readSharedIdFromLocation(): string | null {
  try {
    const params = new URLSearchParams(window.location.search);
    const raw = params.get('makale') || params.get('share');
    if (!raw) return null;
    const id = raw.trim().toUpperCase();
    return WORK_ID_RE.test(id) ? id : null;
  } catch {
    return null;
  }
}

/** Eski sorgu parametresini temizler. */
export function clearSharedParam(): void {
  try {
    const url = new URL(window.location.href);
    if (!url.searchParams.has('makale') && !url.searchParams.has('share')) return;
    url.searchParams.delete('makale');
    url.searchParams.delete('share');
    window.history.replaceState(window.history.state, '', url.pathname + url.search + url.hash);
  } catch {
    /* sessizce geç */
  }
}

async function copyText(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    /* eski yönteme düş */
  }
  try {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.setAttribute('readonly', '');
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand('copy');
    document.body.removeChild(ta);
    return ok;
  } catch {
    return false;
  }
}

export type ShareResult = 'shared' | 'copied' | 'cancelled' | 'failed';

/** Telefonda paylaşım menüsünü açar; desteklenmiyorsa bağlantıyı kopyalar. */
export async function sharePaper(paper: Paper, title?: string): Promise<ShareResult> {
  const url = buildShareUrl(paper);
  const shownTitle = (title || paper.title || 'Makale').trim();

  if (typeof navigator.share === 'function') {
    try {
      await navigator.share({
        title: shownTitle,
        text: `${shownTitle} — Abstract'ta oku`,
        url
      });
      return 'shared';
    } catch (err: any) {
      if (err && err.name === 'AbortError') return 'cancelled';
    }
  }
  return (await copyText(url)) ? 'copied' : 'failed';
}
