import type { IncomingMessage, ServerResponse } from 'node:http';

export default async function handler(_req: IncomingMessage, res: ServerResponse) {
  try {
    const params = new URLSearchParams({
      filter: 'has_abstract:true,type:article',
      sort: 'cited_by_count:desc',
      'per-page': '100',
      select: 'id'
    });
    const response = await fetch(`https://api.openalex.org/works?${params.toString()}`, {
      headers: { 'Accept': 'application/json' }
    });
    if (!response.ok) throw new Error(`OpenAlex HTTP ${response.status}`);

    const data = await response.json();
    const urls = (data.results || [])
      .map((work: { id?: string }) => String(work.id || '').split('/').pop() || '')
      .filter((id: string) => /^W\d{3,15}$/.test(id));

    const entries = [
      '  <url><loc>https://abstractk.vercel.app/</loc></url>',
      ...urls.map((id: string) => `  <url><loc>https://abstractk.vercel.app/paper/${id}</loc></url>`)
    ];
    const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries.join('\n')}\n</urlset>`;

    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/xml; charset=utf-8');
    res.setHeader('Cache-Control', 'public, s-maxage=43200, stale-while-revalidate=86400');
    return res.end(xml);
  } catch (error) {
    console.error('Sitemap generation error:', error);
    res.statusCode = 502;
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    return res.end('Sitemap şu anda oluşturulamıyor.');
  }
}
