import type { IncomingMessage, ServerResponse } from 'node:http';

interface VercelRequest extends IncomingMessage {
  query: Record<string, string | string[] | undefined>;
}

const SITE = 'https://abstractk.vercel.app';
const WORK_ID_RE = /^W\d{3,15}$/;

function escapeHtml(value: unknown): string {
  return String(value ?? '').replace(/[&<>"']/g, ch => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[ch]!));
}

function abstractFromIndex(index: Record<string, number[]> | null | undefined): string {
  if (!index) return '';
  const words: string[] = [];
  for (const [word, positions] of Object.entries(index)) {
    for (const position of positions) words[position] = word;
  }
  return words.join(' ').replace(/\s+/g, ' ').trim();
}

export default async function handler(req: VercelRequest, res: ServerResponse) {
  const rawId = req.query.id;
  const id = (Array.isArray(rawId) ? rawId[0] : rawId || '').trim().toUpperCase();

  if (!WORK_ID_RE.test(id)) {
    res.statusCode = 400;
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    return res.end('Geçersiz makale kimliği.');
  }

  try {
    const response = await fetch(
      `https://api.openalex.org/works/${encodeURIComponent(id)}?select=id,doi,title,publication_year,publication_date,authorships,primary_location,abstract_inverted_index,cited_by_count,open_access`,
      { headers: { 'Accept': 'application/json' } }
    );

    if (response.status === 404) {
      res.statusCode = 404;
      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      return res.end('Makale bulunamadı.');
    }
    if (!response.ok) throw new Error(`OpenAlex HTTP ${response.status}`);

    const work = await response.json();
    const title = String(work.title || '').trim();
    const abstract = abstractFromIndex(work.abstract_inverted_index);
    if (!title || !abstract) {
      res.statusCode = 404;
      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      return res.end('Bu makale için başlık veya özet bilgisi bulunamadı.');
    }

    const authors = (work.authorships || [])
      .map((item: any) => item.author?.display_name)
      .filter(Boolean);
    const journal = work.primary_location?.source?.display_name || '';
    const date = work.publication_date || work.publication_year || '';
    const doi = typeof work.doi === 'string' ? work.doi : '';
    const sourceUrl = doi.startsWith('https://') ? doi : `https://openalex.org/${id}`;
    const canonical = `${SITE}/paper/${id}`;
    const description = abstract.length > 300 ? abstract.slice(0, 297) + '...' : abstract;
    const schema = {
      '@context': 'https://schema.org',
      '@type': 'ScholarlyArticle',
      headline: title,
      description: abstract,
      datePublished: date ? String(date) : undefined,
      author: authors.map((name: string) => ({ '@type': 'Person', name })),
      isPartOf: journal ? { '@type': 'Periodical', name: journal } : undefined,
      identifier: doi || work.id,
      url: canonical,
      mainEntityOfPage: canonical,
      publisher: work.primary_location?.source?.host_organization_name
        ? { '@type': 'Organization', name: work.primary_location.source.host_organization_name }
        : undefined
    };

    const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${escapeHtml(title)} | Abstract</title>
<meta name="description" content="${escapeHtml(description)}">
<meta name="robots" content="index,follow,max-image-preview:large">
<link rel="canonical" href="${canonical}">
<meta property="og:type" content="article">
<meta property="og:site_name" content="Abstract">
<meta property="og:title" content="${escapeHtml(title)}">
<meta property="og:description" content="${escapeHtml(description)}">
<meta property="og:url" content="${canonical}">
<meta name="twitter:card" content="summary">
<script type="application/ld+json">${JSON.stringify(schema).replace(/</g, '\\u003c')}</script>
<style>
:root{color-scheme:light}*{box-sizing:border-box}body{margin:0;background:#eef7fb;color:#0a2540;font:16px/1.7 system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}.wrap{max-width:900px;margin:0 auto;padding:32px 22px 64px}.brand{font-weight:800;letter-spacing:.02em;color:#0369a1;text-decoration:none;font-size:1.1rem}.eyebrow{margin-top:42px;color:#0369a1;font-size:.78rem;font-weight:800;letter-spacing:.12em;text-transform:uppercase}h1{font-family:Georgia,serif;font-size:clamp(2rem,5vw,3.2rem);line-height:1.16;letter-spacing:-.025em;margin:12px 0 18px}.meta{color:#42677e;font-size:.95rem}.panel{background:#fff;border:1px solid #c5dfe9;border-radius:18px;padding:24px;margin-top:28px}.panel h2{font:700 1rem system-ui;margin:0 0 12px;color:#0369a1;text-transform:uppercase;letter-spacing:.08em}.abstract{white-space:pre-wrap}.actions{display:flex;flex-wrap:wrap;gap:12px;margin-top:26px}.button{display:inline-flex;align-items:center;justify-content:center;padding:12px 18px;border-radius:999px;background:#0369a1;color:#fff;text-decoration:none;font-weight:700}.secondary{background:#dbeafe;color:#075985}.footer{margin-top:36px;color:#58798c;font-size:.85rem}@media(max-width:560px){.wrap{padding:22px 16px 48px}.panel{padding:18px}}
</style>
</head>
<body>
<main class="wrap">
<a class="brand" href="/">ABSTRACT</a>
<div class="eyebrow">Academic paper</div>
<h1>${escapeHtml(title)}</h1>
<div class="meta">${escapeHtml(authors.join(', ') || 'Author information unavailable')}${date ? ` · ${escapeHtml(date)}` : ''}${journal ? ` · ${escapeHtml(journal)}` : ''}</div>
<section class="panel"><h2>Abstract</h2><div class="abstract">${escapeHtml(abstract)}</div></section>
<div class="actions">
<a class="button" href="/?makale=${encodeURIComponent(id)}">Open in Abstract</a>
<a class="button secondary" href="${escapeHtml(sourceUrl)}" target="_blank" rel="noopener noreferrer">View original record</a>
</div>
<div class="footer">Bibliographic metadata provided by OpenAlex. Abstract is displayed for scholarly discovery.</div>
</main>
</body>
</html>`;

    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', 'public, s-maxage=86400, stale-while-revalidate=604800');
    return res.end(html);
  } catch (error) {
    console.error('Paper SEO page error:', error);
    res.statusCode = 502;
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    return res.end('Makale bilgileri şu anda alınamıyor. Lütfen daha sonra tekrar deneyin.');
  }
}
