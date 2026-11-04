import { FilterState, Paper, TaxonomyNode } from '../types';
import { FIELDS, TAXONOMY_NODES } from '../constants/taxonomy';

const API = "https://api.openalex.org";
const SEL = "id,doi,title,publication_year,publication_date,language,type,authorships,primary_location,cited_by_count,referenced_works_count,abstract_inverted_index,primary_topic,topics,keywords,open_access";

export const normalizeString = (s: string) =>
  s.toLocaleLowerCase("tr").normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/ı/g, "i");

export const hasAncestorSelected = (node: TaxonomyNode, sel: Set<string>): boolean => {
  for (let p = node.parent; p; p = p.parent) {
    if (sel.has(p.id)) return true;
  }
  return false;
};

export const getEffectiveNodes = (sel: Set<string>): TaxonomyNode[] => {
  return [...sel]
    .map(id => TAXONOMY_NODES[id])
    .filter(node => node && !hasAncestorSelected(node, sel));
};

export const countSelectedChildren = (node: TaxonomyNode, sel: Set<string>): number => {
  return node.children.reduce((acc, c) => {
    return acc + (sel.has(c.id) ? 1 : 0) + countSelectedChildren(c, sel);
  }, 0);
};

export const decompressAbstract = (invertedIndex: Record<string, number[]> | null | undefined): string => {
  if (!invertedIndex) return "";
  const words: string[] = [];
  for (const word in invertedIndex) {
    for (const pos of invertedIndex[word]) {
      words[pos] = word;
    }
  }
  return words.join(" ").replace(/\s+/g, " ").trim();
};

// Yıl girişlerini temizler: sadece 4 haneli yıllar kabul edilir, from > to ise yer değiştirir.
export function normalizeYears(fromRaw: string, toRaw: string): { from: string; to: string } {
  const parse = (v: string) => {
    const n = parseInt(String(v).trim(), 10);
    return Number.isFinite(n) && n >= 1000 && n <= 9999 ? n : null;
  };
  let from = parse(fromRaw);
  let to = parse(toRaw);
  if (from !== null && to !== null && from > to) [from, to] = [to, from];
  return { from: from === null ? "" : String(from), to: to === null ? "" : String(to) };
}

export function getBaseFilter(f: FilterState): string[] {
  const parts = ["has_abstract:true", "type:article"];
  if (f.en) parts.push("language:en");
  const { from, to } = normalizeYears(f.from, f.to);
  if (from || to) {
    const fromYear = from || "1900";
    const toYear = to || String(new Date().getFullYear());
    parts.push(
      fromYear === toYear
        ? `publication_year:${fromYear}`
        : `publication_year:${fromYear}-${toYear}`
    );
  }
  if (f.authorId) parts.push(`authorships.author.id:${f.authorId}`);
  if (f.journalId) parts.push(`primary_location.source.id:${f.journalId}`);
  return parts;
}

interface TierQuery {
  c: [string, (number | string)[]][];
  q: string[];
}

function generateAlternatives(nodes: TaxonomyNode[], solo: boolean): TierQuery[] {
  const alts: TierQuery[] = [];
  const qs: string[] = [];
  const sc: Record<string, (number | string)[]> = {};

  nodes.forEach(n => {
    const t = n.s && (n.s.u ? "u" : "f");
    const v = n.s && (n.s.u || n.s.f);
    if (n.s && !n.q && t && v) {
      if (solo) {
        (sc[t] = sc[t] || []).push(v);
      } else {
        alts.push({ c: [[t, [v]]], q: [] });
      }
    } else if (n.s && t && v && n.q) {
      alts.push({ c: [[t, [v]]], q: [n.q] });
    } else if (n.q) {
      qs.push(n.q);
    }
  });

  for (const t in sc) {
    alts.push({ c: [[t, [...new Set(sc[t])]]], q: [] });
  }
  if (qs.length) {
    alts.push({ c: [], q: [qs.join(" OR ")] });
  }
  return alts;
}

function buildFilterString(baseFilters: string[], p: TierQuery, multi: boolean): string {
  const key = multi ? "topics" : "primary_topic";
  // Aynı filtre anahtarı birden fazla kez yazılırsa OpenAlex bunu güvenilir şekilde AND yapmaz.
  // Bu yüzden aynı anahtarın değerlerini "+" ile (AND) tek filtrede birleştiriyoruz.
  const byKey = new Map<string, string[]>();
  p.c.forEach(([t, v]) => {
    const subfieldOrField = t === "u" ? "subfield" : "field";
    const k = `${key}.${subfieldOrField}.id`;
    const list = byKey.get(k) || [];
    const val = v.join("|");
    if (!list.includes(val)) list.push(val);
    byKey.set(k, list);
  });
  const conditions: string[] = [];
  byKey.forEach((vals, k) => conditions.push(`${k}:${vals.join("+")}`));
  if (p.q.length) {
    const qStr = p.q.map(x => `(${x})`).join(" AND ");
    conditions.push("title_and_abstract.search:" + encodeURIComponent(qStr));
  }
  return [...baseFilters, ...conditions].join(",");
}

export interface SearchTier {
  fs: string[];
  kind: "all" | "part" | "one" | "any";
  label?: string;
}

function combinations<T>(items: T[], size: number): T[][] {
  const result: T[][] = [];
  const visit = (start: number, chosen: T[]) => {
    if (chosen.length === size) {
      result.push([...chosen]);
      return;
    }
    for (let i = start; i <= items.length - (size - chosen.length); i++) {
      chosen.push(items[i]);
      visit(i + 1, chosen);
      chosen.pop();
    }
  };
  visit(0, []);
  return result;
}

export function buildSearchTiers(filter: FilterState): SearchTier[] {
  const baseParts = getBaseFilter(filter);
  const effective = getEffectiveNodes(filter.sel);
  const groupsByRoot = new Map<TaxonomyNode, TaxonomyNode[]>();

  effective.forEach(node => {
    const root = node.root || node;
    if (!groupsByRoot.has(root)) groupsByRoot.set(root, []);
    groupsByRoot.get(root)!.push(node);
  });

  const groups = [...groupsByRoot.values()];
  if (!groups.length) {
    return [{ fs: [baseParts.join(",")], kind: "any" }];
  }

  const labels = groups.map(nodes =>
    nodes.length > 1 ? nodes.map(node => node.label).join(" + ") : nodes[0].label
  );
  const alternatives = groups.map(nodes => generateAlternatives(nodes, false));

  const makeTier = (indices: number[]): SearchTier | null => {
    let combinationsForQuery: TierQuery[][] = [[]];

    for (const index of indices) {
      const options = alternatives[index];
      if (!options.length) return null;
      combinationsForQuery = combinationsForQuery.flatMap(existing =>
        options.map(option => [...existing, option])
      );
    }

    const uniqueFilters = [...new Set(combinationsForQuery.map(series =>
      buildFilterString(
        baseParts,
        {
          c: series.flatMap(item => item.c),
          q: series.flatMap(item => item.q)
        },
        true
      )
    ))];

    if (!uniqueFilters.length) return null;
    // Bir alt kümedeki farklı taksonomi sorguları için makul bir istek üst sınırı.
    // Alt kümelerin kendisi atlanmaz; yalnızca aynı kümenin alternatif sorguları sınırlandırılır.
    return {
      fs: uniqueFilters.slice(0, 12),
      kind: indices.length === groups.length ? "all" : indices.length === 1 ? "one" : "part",
      label: indices.map(index => labels[index]).join(" × ")
    };
  };

  const tiers: SearchTier[] = [];
  // Önce bütün seçili alanların kesişimi; sonuç yoksa birer alan eksilterek
  // tüm olası alt kümeleri büyükten küçüğe dener. Böylece 2, 3 veya daha fazla
  // alan seçimi aynı kuralla ele alınır; hiçbir tekil alan erken aşamada atlanmaz.
  for (let size = groups.length; size >= 1; size--) {
    for (const subset of combinations(groups.map((_, index) => index), size)) {
      const tier = makeTier(subset);
      if (tier) tiers.push(tier);
    }
  }

  return tiers.length ? tiers : [{ fs: [baseParts.join(",")], kind: "any" }];
}
export async function fetchWorks(filterStr: string, count: number): Promise<any[]> {
  const seed = Math.floor(Math.random() * 1e6);
  let res = await fetch(`${API}/works?filter=${filterStr}&sample=${count}&seed=${seed}&per_page=${count}&select=${SEL}`);

  if (!res.ok && filterStr.includes("title_and_abstract.search")) {
    const match = filterStr.match(/title_and_abstract\.search:([^,]*)/);
    const rest = filterStr.replace(/,?title_and_abstract\.search:[^,]*/, "");
    if (match) {
      const page = 1 + Math.floor(Math.random() * 4);
      // buildFilterString arama ifadesini zaten encodeURIComponent ile kodlar; çift kodlamayı
      // önlemek için önce çözüp sonra tek sefer kodluyoruz (özel karakterler sorguyu bozamaz).
      let term = match[1];
      try { term = decodeURIComponent(term); } catch { /* zaten düz metin */ }
      res = await fetch(`${API}/works?filter=${rest}&search=${encodeURIComponent(term)}&page=${page}&per_page=${count}&select=${SEL}`);
    }
  }

  if (!res.ok) {
    throw new Error(`OpenAlex HTTP ${res.status}`);
  }
  const json = await res.json();
  return json.results || [];
}

/** Bağlantı olarak yalnızca http(s) adreslerine izin verir (javascript: vb. şemaları engeller). */
export function safeLink(raw: unknown, fallback = ""): string {
  if (typeof raw !== "string") return fallback;
  try {
    const u = new URL(raw);
    return u.protocol === "https:" || u.protocol === "http:" ? u.href : fallback;
  } catch {
    return fallback;
  }
}

/** "https://openalex.org/W123" -> "W123" */
export function shortWorkId(id: string): string {
  return String(id || "").split("/").pop() || "";
}

/** OpenAlex iş kimliği (W + rakamlar). Paylaşım bağlantılarından gelen değeri doğrulamak için. */
export const WORK_ID_RE = /^W\d{3,15}$/;

export function workToPaper(w: any, crossLabel?: string): Paper {
  const abstractText = decompressAbstract(w.abstract_inverted_index);
  const fieldId = (w.primary_topic?.field?.id || "").split("/").pop();
  const authorships = (w.authorships || []).slice(0, 20);
  const total = (w.authorships || []).length;

  return {
    id: w.id,
    link: safeLink(w.doi, safeLink(w.id, "https://openalex.org")),
    title: w.title,
    abs: abstractText,
    year: w.publication_year,
    date: w.publication_date,
    lang: w.language,
    type: w.type,
    journal: w.primary_location?.source?.display_name || "Dergi bilgisi yok",
    pub: w.primary_location?.source?.host_organization_name || "",
    authors: authorships.slice(0, 3).map((a: any) => a.author?.display_name).filter(Boolean).join(", ") +
      (total > 3 ? ` ve ${total - 3} kişi daha` : ""),
    au: authorships.map((a: any) => ({
      n: a.author?.display_name || "",
      i: (a.institutions || []).slice(0, 2).map((x: any) => x.display_name).join(", ")
    })),
    field: FIELDS[fieldId] || w.primary_topic?.field?.display_name || "Alan belirtilmemiş",
    sub: w.primary_topic?.subfield?.display_name || "",
    kw: (w.keywords || []).slice(0, 8).map((k: any) => k.display_name),
    tp: (w.topics || []).slice(0, 4).map((t: any) => t.display_name),
    cites: w.cited_by_count || 0,
    refs: w.referenced_works_count || 0,
    oa: w.open_access?.oa_status || "",
    cross: crossLabel
  };
}

export function parseWorksToPapers(
  rawList: any[],
  seenIds: Set<string>,
  tier: SearchTier
): { papers: Paper[]; addedCount: number } {
  const papers: Paper[] = [];
  let addedCount = 0;

  for (const w of rawList) {
    const abstractText = decompressAbstract(w.abstract_inverted_index);
    if (!w.title || abstractText.length < 75 || seenIds.has(w.id)) continue;
    seenIds.add(w.id);
    addedCount++;
    papers.push(workToPaper(w, tier.kind === "all" ? tier.label : undefined));
  }

  return { papers, addedCount };
}

/** Paylaşılan bağlantıdaki tek bir makaleyi getirir. Bulunamazsa null döner. */
export async function fetchWorkById(shortId: string): Promise<Paper | null> {
  if (!WORK_ID_RE.test(shortId)) return null;
  try {
    const ctl = new AbortController();
    const timer = setTimeout(() => ctl.abort(), 12000);
    const res = await fetch(`${API}/works/${shortId}?select=${SEL}`, { signal: ctl.signal });
    clearTimeout(timer);
    if (!res.ok) return null;
    const w = await res.json();
    if (!w || !w.title) return null;
    return workToPaper(w);
  } catch {
    return null;
  }
}

export async function resolveEntity(kind: "authors" | "sources", query: string): Promise<{ id: string; name: string | null }> {
  const requested = query.trim();
  if (!requested) return { id: "", name: "" };

  try {
    const perPage = kind === "authors" ? 100 : 25;
    const res = await fetch(
      `${API}/${kind}?search=${encodeURIComponent(requested)}&per-page=${perPage}&select=id,display_name`
    );
    if (!res.ok) return { id: "", name: null };

    const json = await res.json();
    const candidates: Array<{ id: string; display_name: string }> = json.results || [];
    if (kind === "authors") {
      // Yazar araması tek bir kişiyi çözümlememeli. "Ahmet" gibi kısmi sorgularda
      // OpenAlex'in eşleşen yazarlarının tamamını OR filtresiyle birlikte kullan.
      const ids = [...new Set(candidates
        .filter(item => item.id && item.display_name)
        .map(item => item.id.split("/").pop())
        .filter((id): id is string => Boolean(id)))];
      return ids.length
        ? { id: ids.join("|"), name: requested }
        : { id: "", name: null };
    }

    // Dergide yanlış bir kaynağa sessizce yönelmemek için tam/tekil eşleşme kullan.
    const wanted = normalizeString(requested).replace(/[^a-z0-9 ]/g, " ").replace(/\\s+/g, " ").trim();
    const normalized = candidates.map(item => ({
      item,
      name: normalizeString(item.display_name || "").replace(/[^a-z0-9 ]/g, " ").replace(/\\s+/g, " ").trim()
    }));
    const exact = normalized.find(candidate => candidate.name === wanted);
    const partial = normalized.filter(candidate =>
      candidate.name.includes(wanted) || wanted.includes(candidate.name)
    );
    const match = exact || (partial.length === 1 ? partial[0] : null);

    return match
      ? { id: match.item.id.split("/").pop() || "", name: match.item.display_name }
      : { id: "", name: null };
  } catch {
    return { id: "", name: null };
  }
}
