import { Link } from 'react-router-dom'
import { ChevronDown, ChevronRight } from 'lucide-react'
import { pageList } from '../lib/search'

export function Breadcrumb({ current }: { current: string }) {
  return (
    <nav className="breadcrumb" aria-label="Breadcrumb">
      <Link to="/">Beranda</Link>
      <ChevronRight size={14} />
      <span aria-current="page">{current}</span>
    </nav>
  )
}

/** Native select drawn like the design's bordered dropdown. */
export function SelectBox<T extends string>({
  value,
  onChange,
  options,
  label,
  id,
  className = '',
}: {
  value: T
  onChange: (v: T) => void
  options: { value: T; label: string }[]
  label: string
  id?: string
  className?: string
}) {
  return (
    <span className={`select-box ${className}`}>
      <select id={id} value={value} aria-label={label} onChange={(e) => onChange(e.target.value as T)}>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <ChevronDown size={16} aria-hidden="true" />
    </span>
  )
}

export function Pager({
  page,
  pages,
  onPage,
  total,
  size,
  onSize,
  sizes = [10, 20, 50],
}: {
  page: number
  pages: number
  onPage: (p: number) => void
  total: number
  size: number
  onSize: (s: number) => void
  sizes?: number[]
}) {
  return (
    <div className="pager">
      <span className="pager__count" aria-live="polite">
        {total} hasil
      </span>
      <nav className="pager__pages" aria-label="Halaman">
        {pageList(page, pages).map((p, i) =>
          p === '…' ? (
            <span key={`g${i}`} className="pager__page pager__page--gap">
              …
            </span>
          ) : (
            <button
              key={p}
              type="button"
              className={`pager__page${p === page ? ' is-active' : ''}`}
              aria-current={p === page ? 'page' : undefined}
              aria-label={`Halaman ${p}`}
              onClick={() => onPage(p)}
            >
              {p}
            </button>
          ),
        )}
      </nav>
      <label className="pager__size">
        <span>Tampilkan</span>
        <SelectBox
          label="Jumlah per halaman"
          value={String(size)}
          onChange={(v) => onSize(Number(v))}
          options={sizes.map((s) => ({ value: String(s), label: String(s) }))}
        />
      </label>
    </div>
  )
}
