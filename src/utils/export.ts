import { Paper } from '../types';
import { safeLink } from './openalex';
import { buildShareUrl } from './share';
// Logo, derleme sırasında base64 olarak gömülür: popup/iframe/indirilen HTML içinde de her zaman görünür.
import logoDataUrl from '../assets/logo-print.png?inline';

const escapeHtml = (s: unknown) =>
  String(s ?? '').replace(/[&<>"']/g, c => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  }[c] || c));

const DOC_TITLE = 'Abstract - Beğenilen Makaleler';

/**
 * Not (PDF'te siyah alanlar): önceki sürüm her sayfaya tekrarlanan `position: fixed` + `opacity` +
 * döndürülmüş filigran katmanları kullanıyordu. Tarayıcıların "PDF olarak kaydet" çıktısı bu
 * katmanları siyah kutular olarak çizebiliyor. Bu sürümde baskıda sabit konum, saydamlık, dönüşüm,
 * gölge ve arka plan dolgusu hiç kullanılmıyor; logo ise sıradan bir <img>.
 */
const STYLES = `
  @page { size: A4; margin: 16mm 14mm 18mm; }
  * { box-sizing: border-box; }
  html { -webkit-text-size-adjust: 100%; }
  body {
    margin: 0;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
    color: #0a2540;
    background: #f1f5f9;
    line-height: 1.6;
  }
  .sheet { max-width: 820px; margin: 0 auto; padding: 24px 18px 40px; }

  .toolbar {
    display: flex; flex-wrap: wrap; gap: 12px; align-items: center; justify-content: space-between;
    background: #ffffff; border: 1px solid #c5dfe9; border-radius: 16px;
    padding: 12px 16px; margin-bottom: 20px;
  }
  .toolbar .actions { display: flex; flex-wrap: wrap; gap: 8px; }
  .btn {
    font: inherit; font-size: 13px; font-weight: 600; padding: 9px 16px; border-radius: 10px;
    cursor: pointer; border: 1px solid #bae6fd; background: #f0f9ff; color: #0369a1;
  }
  .btn.primary { background: #0284c7; border-color: #0284c7; color: #ffffff; }

  .brand { display: flex; align-items: center; gap: 12px; }
  .brand img { width: 46px; height: 46px; display: block; }
  .brand-title { font-family: Georgia, 'Times New Roman', serif; font-size: 24px; font-weight: 700; margin: 0; line-height: 1.1; }
  .brand-sub { font-size: 12px; color: #527993; margin: 2px 0 0; }

  .doc-head {
    display: flex; justify-content: space-between; align-items: flex-end; gap: 12px;
    border-bottom: 2px solid #0284c7; padding-bottom: 12px; margin-bottom: 22px;
  }
  .doc-meta { text-align: right; font-size: 11px; color: #64748b; line-height: 1.5; }

  .paper {
    background: #ffffff; border: 1px solid #dbe5ec; border-radius: 14px;
    padding: 24px 26px; margin-bottom: 20px;
  }
  .paper-top { display: flex; justify-content: space-between; align-items: center; gap: 10px; margin-bottom: 10px; }
  .badge {
    display: inline-block; padding: 2px 10px; border-radius: 6px; font-size: 11px; font-weight: 700;
    color: #0369a1; border: 1px solid #7dd3fc; background: #e0f2fe;
  }
  .num { font-size: 11px; font-weight: 700; color: #64748b; }
  h1 { font-family: Georgia, 'Times New Roman', serif; font-size: 20px; line-height: 1.35; margin: 0 0 8px; color: #0a2540; }
  .meta { color: #527993; font-size: 13px; margin: 0 0 12px; padding-bottom: 8px; border-bottom: 1px solid #e8eef3; }
  .oa { color: #059669; font-weight: 600; }
  .label { font-size: 11px; font-weight: 800; letter-spacing: .06em; color: #0284c7; margin: 14px 0 5px; }
  .abs { font-size: 13.5px; line-height: 1.7; color: #1e293b; margin: 0 0 10px; text-align: left; overflow-wrap: anywhere; }
  .authors { font-size: 12.5px; color: #334155; margin: 0; line-height: 1.55; }
  .foot { margin-top: 16px; padding-top: 9px; border-top: 1px dashed #cbd5e1; font-size: 11px; color: #64748b; overflow-wrap: anywhere; }
  .foot a { color: #0369a1; text-decoration: none; }
  .foot div + div { margin-top: 2px; }
  .copy { text-align: center; margin-top: 26px; padding-top: 14px; border-top: 1px solid #e2e8f0; font-size: 12px; color: #64748b; }

  @media print {
    html, body { background: #ffffff !important; }
    .sheet { max-width: none; padding: 0; margin: 0; }
    .toolbar { display: none !important; }
    /* Baskıda dolgu, gölge, saydamlık ve dönüşüm yok: siyah kutu riski sıfır. */
    .paper { border: none; border-radius: 0; padding: 0; margin: 0; background: transparent; box-shadow: none; }
    .badge { background: transparent; }
    .paper + .paper { break-before: page; page-break-before: always; }
    .paper-top, h1, .meta, .label { break-after: avoid; page-break-after: avoid; }
    .authors, .foot { break-inside: avoid; page-break-inside: avoid; }
    .doc-head { margin-bottom: 14px; }
    a { color: inherit; }
  }
`;

function buildPapersHtml(papers: Paper[]): string {
  return papers.map((a, idx) => {
    const link = safeLink(a.link);
    const appLink = buildShareUrl(a);
    const authorsHtml = a.au && a.au.length
      ? a.au.map(x => `<b>${escapeHtml(x.n)}</b>${x.i ? ` (${escapeHtml(x.i)})` : ''}`).join(', ')
      : escapeHtml(a.authors);

    return `
    <article class="paper">
      <div class="paper-top">
        <span class="badge">${escapeHtml(a.field || a.sub || 'Akademik Makale')}</span>
        <span class="num">#${idx + 1} / ${papers.length}</span>
      </div>
      <h1>${escapeHtml(a.title)}</h1>
      <p class="meta">
        <strong>${escapeHtml(a.journal)}</strong> · ${escapeHtml(a.year)} · ${Number(a.cites || 0).toLocaleString('tr-TR')} atıf${a.oa && a.oa !== 'closed' ? ' · <span class="oa">Açık Erişim</span>' : ''}
      </p>
      <div class="label">ÖZET</div>
      <p class="abs">${escapeHtml(a.abs)}</p>
      <div class="label">YAZARLAR</div>
      <p class="authors">${authorsHtml}</p>
      <div class="foot">
        ${link ? `<div>Kaynak: <a href="${escapeHtml(link)}">${escapeHtml(link)}</a></div>` : ''}
        <div>Abstract'ta aç: <a href="${escapeHtml(appLink)}">${escapeHtml(appLink)}</a></div>
      </div>
    </article>`;
  }).join('');
}

function buildDocument(papers: Paper[], interactive: boolean): string {
  const dateStr = new Date().toLocaleDateString('tr-TR', { year: 'numeric', month: 'long', day: 'numeric' });

  const toolbar = interactive ? `
    <div class="toolbar">
      <div class="brand">
        <img src="${logoDataUrl}" alt="Abstract logosu" width="46" height="46">
        <div>
          <p class="brand-title">Abstract</p>
          <p class="brand-sub">${papers.length} makale kaydı</p>
        </div>
      </div>
      <div class="actions">
        <button type="button" class="btn" id="abs-download">⬇ HTML olarak indir</button>
        <button type="button" class="btn primary" id="abs-print">🖨 Yazdır / PDF kaydet</button>
      </div>
    </div>` : '';

  return `<!doctype html>
<html lang="tr">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(DOC_TITLE)}</title>
  <style>${STYLES}</style>
</head>
<body>
  <div class="sheet">
    ${toolbar}
    <header class="doc-head">
      <div class="brand">
        <img src="${logoDataUrl}" alt="Abstract logosu" width="46" height="46">
        <div>
          <p class="brand-title">Abstract</p>
          <p class="brand-sub">Beğenilen Akademik Makaleler</p>
        </div>
      </div>
      <div class="doc-meta">
        <div>Tarih: ${escapeHtml(dateStr)}</div>
        <div>Toplam: ${papers.length} makale</div>
      </div>
    </header>
    <main>${buildPapersHtml(papers)}</main>
    <footer class="copy">© 2026 Binali. Her hakkı saklıdır. · Abstract Akademik Keşif Platformu</footer>
  </div>
</body>
</html>`;
}

function downloadHtmlFile(papers: Paper[]) {
  const blob = new Blob([buildDocument(papers, false)], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'abstract-makaleler.html';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}

/** Belgedeki tüm görseller (logo) yüklenene kadar bekler; yoksa yazdırma anında logo boş çıkar. */
function waitForImages(doc: Document, timeoutMs = 2500): Promise<void> {
  const pending = Array.from(doc.images)
    .filter(img => !img.complete)
    .map(img => new Promise<void>(res => {
      img.addEventListener('load', () => res(), { once: true });
      img.addEventListener('error', () => res(), { once: true });
    }));
  if (!pending.length) return Promise.resolve();
  return Promise.race([
    Promise.all(pending).then(() => undefined),
    new Promise<void>(res => setTimeout(res, timeoutMs))
  ]);
}

export function exportPapersToPrint(papers: Paper[]) {
  if (!papers || !papers.length) return;

  const html = buildDocument(papers, true);
  const win = window.open('', '_blank', 'width=900,height=800');

  if (win) {
    const doc = win.document;
    doc.open();
    doc.write(html);
    doc.close();

    // Düğmeler açılan pencerede, uygulamanın kendi kodundan bağlanır (satır içi betik yok -> CSP uyumlu).
    doc.getElementById('abs-print')?.addEventListener('click', () => win.print());
    doc.getElementById('abs-download')?.addEventListener('click', () => downloadHtmlFile(papers));

    waitForImages(doc).then(() => {
      try {
        win.focus();
        win.print();
      } catch {
        /* kullanıcı "Yazdır" düğmesini kullanabilir */
      }
    });
    return;
  }

  // Açılır pencere engellendiyse: görünmez bir iframe üzerinden yazdır.
  const iframe = document.createElement('iframe');
  iframe.setAttribute('aria-hidden', 'true');
  iframe.style.cssText = 'position:fixed;right:0;bottom:0;width:0;height:0;border:0;visibility:hidden;';
  document.body.appendChild(iframe);

  const idoc = iframe.contentWindow?.document;
  if (!idoc || !iframe.contentWindow) {
    iframe.remove();
    downloadHtmlFile(papers);
    return;
  }
  const cleanup = () => setTimeout(() => iframe.remove(), 500);
  idoc.open();
  idoc.write(buildDocument(papers, false));
  idoc.close();

  waitForImages(idoc).then(() => {
    const w = iframe.contentWindow;
    if (!w) return;
    w.addEventListener('afterprint', cleanup, { once: true });
    try {
      w.focus();
      w.print();
    } catch {
      cleanup();
    }
    // afterprint hiç tetiklenmezse yine de temizle.
    setTimeout(() => iframe.remove(), 120000);
  });
}
