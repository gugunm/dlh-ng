import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowRight,
  ChartColumn,
  Database,
  FilePenLine,
  House,
  Search,
  User,
  Users,
  type LucideIcon,
} from 'lucide-react'
import { TYPE_ICONS } from './Badges'
import { runSearch } from '../lib/search'

const POPULAR = ['SPIP', 'Kapabilitas APIP', 'Dana Desa', 'Pengadaan']
const MAX_RESULTS = 6

const PAGES: { label: string; to: string; icon: LucideIcon }[] = [
  { label: 'Beranda', to: '/', icon: House },
  { label: 'Dataset', to: '/dataset', icon: Database },
  { label: 'Daftar Produsen', to: '/produsen', icon: Users },
  { label: 'Pemanfaatan Data', to: '/pemanfaatan', icon: ChartColumn },
  { label: 'Permohonan Saya', to: '/permohonan', icon: FilePenLine },
  { label: 'Profil Saya', to: '/profil', icon: User },
]

interface Row {
  id: string
  icon: LucideIcon
  title: string
  meta?: string
  restricted?: boolean
  to: string
}

interface Group {
  label: string
  rows: Row[]
}

const searchUrl = (q: string) => `/dataset?q=${encodeURIComponent(q)}`

const buildGroups = (query: string): Group[] => {
  const q = query.trim()
  const pageRow = (p: (typeof PAGES)[number]): Row => ({ id: `page-${p.to}`, icon: p.icon, title: p.label, to: p.to })

  if (!q) {
    return [
      {
        label: 'Pencarian Populer',
        rows: POPULAR.map((p) => ({ id: `pop-${p}`, icon: Search, title: p, to: searchUrl(p) })),
      },
      { label: 'Buka Halaman', rows: PAGES.map(pageRow) },
    ]
  }

  const results = runSearch({ q, jenis: [], sifat: [], topik: [], tahun: [], sort: 'relevan', page: 1 })
  const tokens = q.toLowerCase().split(/\s+/)
  const pages = PAGES.filter((p) => tokens.every((t) => p.label.toLowerCase().includes(t)))

  const groups: Group[] = []
  if (results.length > 0) {
    groups.push({
      label: 'Pencarian',
      rows: [{ id: 'all', icon: ArrowRight, title: `Lihat semua hasil untuk “${q}”`, meta: `${results.length} konten`, to: searchUrl(q) }],
    })
    groups.push({
      label: 'Konten',
      rows: results.slice(0, MAX_RESULTS).map((it) => ({
        id: `item-${it.id}`,
        icon: TYPE_ICONS[it.type],
        title: it.title,
        meta: `${it.type} · ${it.topik} · ${it.tahun}`,
        restricted: it.sifat === 'Terbatas',
        to: `/dataset/${it.id}`,
      })),
    })
  }
  if (pages.length > 0) groups.push({ label: 'Buka Halaman', rows: pages.map(pageRow) })
  return groups
}

export function SearchPalette({ onClose }: { onClose: () => void }) {
  const navigate = useNavigate()
  const input = useRef<HTMLInputElement>(null)
  const [query, setQuery] = useState('')
  const [activeIndex, setActiveIndex] = useState(0)

  const groups = useMemo(() => buildGroups(query), [query])
  const rows = useMemo(() => groups.flatMap((g) => g.rows), [groups])
  const active = rows[activeIndex]

  useEffect(() => {
    const prev = document.activeElement as HTMLElement | null
    const overflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    input.current?.focus()
    return () => {
      document.body.style.overflow = overflow
      prev?.focus?.()
    }
  }, [])

  useEffect(() => {
    if (active) document.getElementById(active.id)?.scrollIntoView({ block: 'nearest' })
  }, [active])

  const run = (row: Row | undefined) => {
    if (!row) return
    onClose()
    navigate(row.to)
  }

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.nativeEvent.isComposing) return
    if (e.key === 'Escape') {
      e.preventDefault()
      onClose()
    } else if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault()
      if (rows.length === 0) return
      const step = e.key === 'ArrowDown' ? 1 : -1
      setActiveIndex((i) => (i + step + rows.length) % rows.length)
    } else if (e.key === 'Enter') {
      e.preventDefault()
      run(active)
    } else if (e.key === 'Tab') {
      // The input is the only stop: results are reached with the arrow keys.
      e.preventDefault()
    }
  }

  let rowIndex = -1

  return (
    <div className="palette-backdrop" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="palette" role="dialog" aria-modal="true" aria-label="Pencarian">
        <div className="palette__input">
          <Search size={20} aria-hidden="true" />
          <input
            ref={input}
            role="combobox"
            aria-expanded="true"
            aria-controls="palette-list"
            aria-autocomplete="list"
            aria-activedescendant={active?.id}
            aria-label="Cari dataset, publikasi, visualisasi, atau halaman"
            placeholder="Cari dataset, publikasi, atau visualisasi…"
            autoComplete="off"
            spellCheck={false}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              setActiveIndex(0)
            }}
            onKeyDown={onKeyDown}
          />
        </div>

        <div className="palette__list" id="palette-list" role="listbox" aria-label="Hasil pencarian">
          {rows.length === 0 && (
            <p className="palette__empty" role="status">
              Tidak ada hasil untuk “{query.trim()}”.
            </p>
          )}
          {groups.map((g) => (
            <div key={g.label} role="group" aria-label={g.label}>
              <p className="palette__group" aria-hidden="true">
                {g.label}
              </p>
              {g.rows.map((row) => {
                rowIndex += 1
                const index = rowIndex
                const isActive = index === activeIndex
                return (
                  <div
                    key={row.id}
                    id={row.id}
                    role="option"
                    aria-selected={isActive}
                    className={`palette__row${isActive ? ' is-active' : ''}`}
                    onMouseMove={() => setActiveIndex(index)}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => run(row)}
                  >
                    <span className="palette__icon">
                      <row.icon size={16} aria-hidden="true" />
                    </span>
                    <span className="palette__text">
                      <strong>{row.title}</strong>
                      {row.meta && <span>{row.meta}</span>}
                    </span>
                    {row.restricted && <span className="status status--red">Terbatas</span>}
                  </div>
                )
              })}
            </div>
          ))}
        </div>

        <div className="palette__foot" aria-hidden="true">
          <span>
            <kbd className="kbd kbd--sm">↑</kbd>
            <kbd className="kbd kbd--sm">↓</kbd> Pilih
          </span>
          <span>
            <kbd className="kbd kbd--sm">↵</kbd> Buka
          </span>
          <span>
            <kbd className="kbd kbd--sm">esc</kbd> Tutup
          </span>
        </div>
      </div>
    </div>
  )
}
