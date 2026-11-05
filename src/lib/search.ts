import { CATALOG, type CatalogItem } from '../data/catalog'

export type SortKey = 'terbaru' | 'terlama' | 'judul' | 'relevan'

export interface Filters {
  q: string
  jenis: string[]
  sifat: string[]
  topik: string[]
  tahun: string[]
  sort: SortKey
  page: number
}

export type FacetKey = 'jenis' | 'sifat' | 'topik' | 'tahun'

export const PAGE_SIZE = 8

export const SORT_LABELS: Record<SortKey, string> = {
  terbaru: 'Terbaru',
  terlama: 'Terlama',
  judul: 'Judul A–Z',
  relevan: 'Relevansi',
}

const norm = (s: string) => s.toLowerCase()

const haystack = (it: CatalogItem) =>
  norm([it.title, it.description, it.tags.join(' '), it.topik, it.source, it.type].join(' '))

export const relevance = (it: CatalogItem, q: string) => {
  const tokens = norm(q).split(/\s+/).filter(Boolean)
  const title = norm(it.title)
  const tags = norm(it.tags.join(' '))
  let score = 0
  for (const t of tokens) {
    if (title.includes(t)) score += 3
    if (tags.includes(t)) score += 2
    if (norm(it.topik).includes(t)) score += 1
  }
  if (norm(q).trim() && title === norm(q).trim()) score += 10
  return score
}

const matchesQuery = (it: CatalogItem, q: string) => {
  const tokens = norm(q).split(/\s+/).filter(Boolean)
  if (!tokens.length) return true
  const h = haystack(it)
  return tokens.every((t) => h.includes(t))
}

const valueOf = (it: CatalogItem, key: FacetKey): string => {
  switch (key) {
    case 'jenis':
      return it.type
    case 'sifat':
      return it.sifat
    case 'topik':
      return it.topik
    case 'tahun':
      return String(it.tahun)
  }
}

const matchesFacets = (it: CatalogItem, f: Filters, skip?: FacetKey) => {
  const keys: FacetKey[] = ['jenis', 'sifat', 'topik', 'tahun']
  return keys.every((k) => {
    if (k === skip) return true
    const sel = f[k]
    return sel.length === 0 || sel.includes(valueOf(it, k))
  })
}

export const runSearch = (f: Filters) => {
  const list = CATALOG.filter((it) => matchesQuery(it, f.q) && matchesFacets(it, f))
  const sorted = [...list]
  if (f.sort === 'terbaru') sorted.sort((a, b) => b.date.localeCompare(a.date))
  else if (f.sort === 'terlama') sorted.sort((a, b) => a.date.localeCompare(b.date))
  else if (f.sort === 'judul') sorted.sort((a, b) => a.title.localeCompare(b.title, 'id'))
  else
    sorted.sort(
      (a, b) => relevance(b, f.q) - relevance(a, f.q) || b.date.localeCompare(a.date),
    )
  return sorted
}

export const facetCounts = (f: Filters, key: FacetKey) => {
  const counts: Record<string, number> = {}
  for (const it of CATALOG) {
    if (!matchesQuery(it, f.q) || !matchesFacets(it, f, key)) continue
    const v = valueOf(it, key)
    counts[v] = (counts[v] ?? 0) + 1
  }
  return counts
}

export const pageList = (current: number, total: number): (number | '…')[] => {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)
  const set = new Set<number>([1, total, current - 1, current, current + 1])
  if (current <= 3) [2, 3].forEach((n) => set.add(n))
  if (current >= total - 2) [total - 1, total - 2].forEach((n) => set.add(n))
  const nums = [...set].filter((n) => n >= 1 && n <= total).sort((a, b) => a - b)
  const out: (number | '…')[] = []
  nums.forEach((n, idx) => {
    if (idx > 0 && n - nums[idx - 1] > 1) out.push('…')
    out.push(n)
  })
  return out
}

export const parseFilters = (sp: URLSearchParams): Filters => {
  const sortRaw = sp.get('sort') as SortKey | null
  const q = sp.get('q') ?? ''
  const sort: SortKey =
    sortRaw && sortRaw in SORT_LABELS && (sortRaw !== 'relevan' || q) ? sortRaw : 'terbaru'
  const page = Math.max(1, parseInt(sp.get('page') ?? '1', 10) || 1)
  return {
    q,
    jenis: sp.getAll('jenis'),
    sifat: sp.getAll('sifat'),
    topik: sp.getAll('topik'),
    tahun: sp.getAll('tahun'),
    sort,
    page,
  }
}

export const buildParams = (f: Partial<Filters>) => {
  const sp = new URLSearchParams()
  if (f.q) sp.set('q', f.q)
  ;(['jenis', 'sifat', 'topik', 'tahun'] as FacetKey[]).forEach((k) =>
    (f[k] ?? []).forEach((v) => sp.append(k, v)),
  )
  if (f.sort && f.sort !== 'terbaru') sp.set('sort', f.sort)
  if (f.page && f.page > 1) sp.set('page', String(f.page))
  return sp
}
