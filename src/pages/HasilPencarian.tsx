import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import {
  Calendar,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Search,
  SearchX,
  SlidersHorizontal,
  X,
} from 'lucide-react'
import { AccessBadge, TYPE_ICONS } from '../components/Badges'
import { useDialogs } from '../components/Dialogs'
import { CONTENT_TYPES, SIFAT_OPTIONS, TAHUN_OPTIONS, TOPIK_OPTIONS } from '../data/catalog'
import { usePopover } from '../hooks/usePopover'
import { fmtDate } from '../lib/format'
import {
  PAGE_SIZE,
  SORT_LABELS,
  buildParams,
  facetCounts,
  pageList,
  parseFilters,
  runSearch,
  type FacetKey,
  type Filters,
  type SortKey,
} from '../lib/search'

const GROUPS: { key: FacetKey; title: string; options: string[] }[] = [
  { key: 'jenis', title: 'Jenis Konten', options: CONTENT_TYPES },
  { key: 'sifat', title: 'Sifat Data', options: SIFAT_OPTIONS },
  { key: 'topik', title: 'Topik', options: TOPIK_OPTIONS },
  { key: 'tahun', title: 'Tahun', options: TAHUN_OPTIONS.map(String) },
]

export default function HasilPencarian() {
  const [sp, setSp] = useSearchParams()
  const filters = useMemo(() => parseFilters(sp), [sp])
  const dialogs = useDialogs()
  const sortPop = usePopover()
  const topRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const [draft, setDraft] = useState(filters.q)
  const [filtersOpen, setFiltersOpen] = useState(false)
  useEffect(() => setDraft(filters.q), [filters.q])

  const update = (patch: Partial<Filters>, keepPage = false) => {
    const next = { ...filters, ...patch }
    if (!keepPage && !('page' in patch)) next.page = 1
    setSp(buildParams(next))
  }

  const results = useMemo(() => runSearch(filters), [filters])
  const total = results.length
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))
  const page = Math.min(filters.page, totalPages)
  const visible = results.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  useEffect(() => {
    document.title = filters.q ? `${filters.q} — Hasil Pencarian · Katalog Data` : 'Dataset · Katalog Data'
  }, [filters.q])

  const toggle = (key: FacetKey, value: string) => {
    const cur = filters[key]
    update({ [key]: cur.includes(value) ? cur.filter((v) => v !== value) : [...cur, value] })
  }

  const submit = (e: FormEvent) => {
    e.preventDefault()
    update({ q: draft.trim() })
  }

  const clearQuery = () => {
    setDraft('')
    update({ q: '' })
    inputRef.current?.focus()
  }

  const reset = () => update({ jenis: [], sifat: [], topik: [], tahun: [] })

  const goPage = (p: number) => {
    if (p < 1 || p > totalPages || p === page) return
    update({ page: p }, true)
    topRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const counts = useMemo(
    () => Object.fromEntries(GROUPS.map((g) => [g.key, facetCounts(filters, g.key)])),
    [filters],
  )

  const active: { key: FacetKey; value: string; label: string }[] = [
    ...filters.jenis.map((v) => ({ key: 'jenis' as const, value: v, label: v })),
    ...filters.topik.map((v) => ({ key: 'topik' as const, value: v, label: `Topik: ${v}` })),
    ...filters.tahun.map((v) => ({ key: 'tahun' as const, value: v, label: `Tahun: ${v}` })),
    ...filters.sifat.map((v) => ({ key: 'sifat' as const, value: v, label: v })),
  ]

  const countLabel =
    filters.jenis.length === 1 ? `${total} ${filters.jenis[0]} ditemukan` : `${total} Konten ditemukan`

  const sortKeys = (Object.keys(SORT_LABELS) as SortKey[]).filter((k) => k !== 'relevan' || filters.q)

  return (
    <main>
      <section className="search-band">
        <nav className="breadcrumb" aria-label="Breadcrumb">
          <Link to="/">Beranda</Link>
          <ChevronRight size={14} />
          <Link to="/dataset">Dataset</Link>
          <ChevronRight size={14} />
          <span aria-current="page">Hasil Pencarian</span>
        </nav>
        <form className="band-search" onSubmit={submit} role="search">
          <Search size={20} />
          <input
            ref={inputRef}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Cari dataset, publikasi, atau visualisasi…"
            aria-label="Kata kunci pencarian"
          />
          {draft && (
            <button type="button" className="band-search__clear" aria-label="Hapus kata kunci" onClick={clearQuery}>
              <X size={16} />
            </button>
          )}
          <button type="submit" className="btn btn--red btn--lg">
            Cari
          </button>
        </form>
      </section>

      <div className="search-main" ref={topRef}>
        <aside className="filters" aria-label="Filter">
          <div className="filters__head">
            <h2>
              <SlidersHorizontal size={18} /> Filter
            </h2>
            <button type="button" className="reset" onClick={reset} disabled={!active.length}>
              Atur ulang
            </button>
          </div>
          <button
            type="button"
            className="filters__toggle"
            aria-expanded={filtersOpen}
            onClick={() => setFiltersOpen((v) => !v)}
          >
            <SlidersHorizontal size={16} /> {filtersOpen ? 'Sembunyikan filter' : 'Tampilkan filter'}
            {active.length > 0 && <span className="filters__count">{active.length}</span>}
          </button>
          <div className={`filters__groups${filtersOpen ? ' is-open' : ''}`}>
            {GROUPS.map((g) => (
              <fieldset key={g.key} className="group">
                <legend>{g.title}</legend>
                {g.options.map((opt) => {
                  const checked = filters[g.key].includes(opt)
                  const n = counts[g.key][opt] ?? 0
                  return (
                    <label key={opt} className={`option${checked ? ' is-checked' : ''}${n === 0 && !checked ? ' is-empty' : ''}`}>
                      <input type="checkbox" checked={checked} onChange={() => toggle(g.key, opt)} />
                      <span className="option__box">{checked && <Check size={12} strokeWidth={3} />}</span>
                      <span className="option__label">{opt}</span>
                      <span className="option__count">{n}</span>
                    </label>
                  )
                })}
              </fieldset>
            ))}
          </div>
        </aside>

        <section className="results" aria-live="polite">
          <div className="results__head">
            <div>
              <h1>{countLabel}</h1>
              <p>{filters.q ? <>untuk kata kunci “{filters.q}”</> : 'menampilkan seluruh katalog'}</p>
            </div>
            <div className="popover" ref={sortPop.ref}>
              <button
                type="button"
                className="sort"
                aria-haspopup="listbox"
                aria-expanded={sortPop.open}
                onClick={sortPop.toggle}
              >
                <span>Urutkan:</span>
                <strong>{SORT_LABELS[filters.sort]}</strong>
                <ChevronDown size={16} />
              </button>
              {sortPop.open && (
                <ul className="popover__panel popover__panel--sort" role="listbox">
                  {sortKeys.map((k) => (
                    <li key={k}>
                      <button
                        type="button"
                        role="option"
                        aria-selected={filters.sort === k}
                        className={filters.sort === k ? 'is-active' : ''}
                        onClick={() => {
                          sortPop.close()
                          update({ sort: k })
                        }}
                      >
                        {SORT_LABELS[k]}
                        {filters.sort === k && <Check size={14} />}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {active.length > 0 && (
            <div className="active-filters">
              {active.map((a) => (
                <span className="active-chip" key={`${a.key}-${a.value}`}>
                  {a.label}
                  <button type="button" aria-label={`Hapus filter ${a.label}`} onClick={() => toggle(a.key, a.value)}>
                    <X size={14} />
                  </button>
                </span>
              ))}
              {active.length > 1 && (
                <button type="button" className="link-btn" onClick={reset}>
                  Hapus semua
                </button>
              )}
            </div>
          )}

          {visible.length === 0 ? (
            <div className="empty">
              <SearchX size={40} />
              <h2>Tidak ada hasil yang cocok</h2>
              <p>Coba kata kunci lain atau kurangi filter yang dipilih.</p>
              <div className="empty__actions">
                {active.length > 0 && (
                  <button type="button" className="btn btn--outline" onClick={reset}>
                    Atur ulang filter
                  </button>
                )}
                {filters.q && (
                  <button type="button" className="btn btn--primary" onClick={clearQuery}>
                    Hapus kata kunci
                  </button>
                )}
              </div>
            </div>
          ) : (
            visible.map((it) => {
              const Icon = TYPE_ICONS[it.type]
              return (
                <article className="result" key={it.id}>
                  <span className="result__thumb" aria-hidden="true">
                    <Icon size={34} strokeWidth={1.6} />
                  </span>
                  <div className="result__body">
                    <h2>
                      <button type="button" className="result__title" onClick={() => dialogs.openItem(it.id)}>
                        {it.title}
                      </button>
                    </h2>
                    <div className="tags">
                      {it.tags.map((t) => (
                        <button
                          key={t}
                          type="button"
                          className="tag"
                          onClick={() => update({ q: t })}
                          title={`Cari “${t}”`}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                    <p>{it.description}</p>
                    <div className="result__meta">
                      <span className="badge badge--blue">{it.type}</span>
                      <AccessBadge sifat={it.sifat} />
                      <span className="result__date">
                        <Calendar size={14} /> {fmtDate(it.date)}
                      </span>
                    </div>
                  </div>
                </article>
              )
            })
          )}

          {totalPages > 1 && (
            <nav className="pagination" aria-label="Halaman hasil">
              <button
                type="button"
                className="page"
                aria-label="Halaman sebelumnya"
                disabled={page === 1}
                onClick={() => goPage(page - 1)}
              >
                <ChevronLeft size={16} />
              </button>
              {pageList(page, totalPages).map((p, idx) =>
                p === '…' ? (
                  <span key={`gap-${idx}`} className="page page--gap">
                    …
                  </span>
                ) : (
                  <button
                    key={p}
                    type="button"
                    className={`page${p === page ? ' is-active' : ''}`}
                    aria-current={p === page ? 'page' : undefined}
                    onClick={() => goPage(p)}
                  >
                    {p}
                  </button>
                ),
              )}
              <button
                type="button"
                className="page"
                aria-label="Halaman berikutnya"
                disabled={page === totalPages}
                onClick={() => goPage(page + 1)}
              >
                <ChevronRight size={16} />
              </button>
            </nav>
          )}
        </section>
      </div>
    </main>
  )
}
