import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Info, Plus, Search } from 'lucide-react'
import { Breadcrumb, Pager, SelectBox } from '../components/ListBits'
import { Modal } from '../components/Modal'
import { useToast } from '../components/Toast'
import { USER } from '../hooks/useAuth'
import { fmtDate, todayIso } from '../lib/format'
import { SEED_USAGES, USAGE_ICONS, WILAYAH_OPTIONS, type Usage, type Wilayah } from '../data/pemanfaatan'

const KEY = 'dlh-katalog-pemanfaatan-v1'
const SIZES = [10, 20, 50]
const ALL = ''

interface Stored {
  extra: Usage[]
  archived: Record<string, boolean>
}
const load = (): Stored => {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) return JSON.parse(raw) as Stored
  } catch {
    /* storage unavailable */
  }
  return { extra: [], archived: {} }
}

type Sort = 'terbaru' | 'terlama' | 'judul'
const SORTS: { value: Sort; label: string }[] = [
  { value: 'terbaru', label: 'Terbaru diperbarui' },
  { value: 'terlama', label: 'Terlama diperbarui' },
  { value: 'judul', label: 'Judul A–Z' },
]

function Hint({ text }: { text: string }) {
  return (
    <span className="hint" title={text} aria-label={text} role="img" tabIndex={0}>
      <Info size={14} />
    </span>
  )
}

export default function Pemanfaatan() {
  const [params, setParams] = useSearchParams()
  const navigate = useNavigate()
  const toast = useToast()
  const [store, setStore] = useState<Stored>(load)
  const [open, setOpen] = useState<Usage | null>(null)
  const [adding, setAdding] = useState(false)

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(store))
    } catch {
      /* storage unavailable */
    }
  }, [store])

  const all = useMemo(
    () =>
      [...store.extra, ...SEED_USAGES].map((u) => ({
        ...u,
        archived: u.id in store.archived ? store.archived[u.id] : !!u.archived,
      })),
    [store],
  )

  const q = params.get('q') ?? ''
  const penulis = params.get('penulis') ?? ALL
  const topik = params.get('topik') ?? ALL
  const wilayah = params.get('wilayah') ?? ALL
  const arsip = params.get('arsip') === '1'
  const sort = (SORTS.some((s) => s.value === params.get('sort')) ? params.get('sort') : 'terbaru') as Sort
  const size = SIZES.includes(Number(params.get('size'))) ? Number(params.get('size')) : 20
  const pageParam = Math.max(1, Number(params.get('page')) || 1)

  const patch = (next: Record<string, string | null>, resetPage = true) => {
    const p = new URLSearchParams(params)
    for (const [k, v] of Object.entries(next)) {
      if (v === null || v === '') p.delete(k)
      else p.set(k, v)
    }
    if (resetPage) p.delete('page')
    setParams(p, { replace: k0(next) })
  }
  // typing in the search box should not pile up history entries
  const k0 = (n: Record<string, string | null>) => 'q' in n

  const authors = useMemo(() => [...new Set(all.map((u) => u.author))].sort((a, b) => a.localeCompare(b, 'id')), [all])
  const topics = useMemo(
    () => [...new Set(all.map((u) => u.topik).filter((t): t is string => !!t))].sort((a, b) => a.localeCompare(b, 'id')),
    [all],
  )

  const list = useMemo(() => {
    const needle = q.trim().toLowerCase()
    const out = all.filter(
      (u) =>
        (arsip || !u.archived) &&
        (!needle || u.title.toLowerCase().includes(needle) || u.description.toLowerCase().includes(needle)) &&
        (!penulis || u.author === penulis) &&
        (!topik || u.topik === topik) &&
        (!wilayah || u.wilayah === wilayah),
    )
    if (sort === 'terbaru') out.sort((a, b) => b.date.localeCompare(a.date))
    else if (sort === 'terlama') out.sort((a, b) => a.date.localeCompare(b.date))
    else out.sort((a, b) => a.title.localeCompare(b.title, 'id'))
    return out
  }, [all, q, penulis, topik, wilayah, arsip, sort])

  const pages = Math.max(1, Math.ceil(list.length / size))
  const page = Math.min(pageParam, pages)
  const view = list.slice((page - 1) * size, page * size)
  const filtered = !!(q || penulis || topik || wilayah || arsip)

  const setArchived = (u: Usage, value: boolean) => {
    setStore((s) => ({ ...s, archived: { ...s.archived, [u.id]: value } }))
    setOpen(null)
    toast.show(value ? 'Pemanfaatan data diarsipkan' : 'Pemanfaatan data dipulihkan')
  }

  const add = (u: Usage) => {
    setStore((s) => ({ ...s, extra: [u, ...s.extra] }))
    setAdding(false)
    setParams(new URLSearchParams())
    toast.show('Pemanfaatan data ditambahkan')
  }

  return (
    <main className="list-page">
      <Breadcrumb current="Pemanfaatan Data" />
      <div className="list-head">
        <div className="list-title">
          <h1>Pemanfaatan Data</h1>
          <p>
            Kumpulan dasbor, visualisasi, dan analisis yang disusun dari dataset pada Katalog Data BPKP untuk
            mendukung pengawasan dan pengambilan keputusan.
          </p>
        </div>
        <button type="button" className="btn btn--red btn--lg" onClick={() => setAdding(true)}>
          <Plus size={18} /> Tambah Pemanfaatan Data
        </button>
      </div>

      <section className="list-card filter-card" aria-label="Filter">
        <label className="input-box">
          <Search size={18} aria-hidden="true" />
          <input
            value={q}
            onChange={(e) => patch({ q: e.target.value })}
            placeholder="Cari pemanfaatan data"
            aria-label="Cari pemanfaatan data"
          />
        </label>
        <div className="filter-grid">
          <label className="filter">
            <span className="filter__label">
              Penulis <Hint text="Unit kerja yang menyusun pemanfaatan data" />
            </span>
            <SelectBox
              label="Penulis"
              value={penulis}
              onChange={(v) => patch({ penulis: v })}
              options={[{ value: ALL, label: 'Semua penulis' }, ...authors.map((a) => ({ value: a, label: a }))]}
            />
          </label>
          <label className="filter">
            <span className="filter__label">
              Topik <Hint text="Tema utama pemanfaatan data" />
            </span>
            <SelectBox
              label="Topik"
              value={topik}
              onChange={(v) => patch({ topik: v })}
              options={[{ value: ALL, label: 'Semua topik' }, ...topics.map((t) => ({ value: t, label: t }))]}
            />
          </label>
          <label className="filter">
            <span className="filter__label">
              Wilayah <Hint text="Cakupan wilayah pemanfaatan data" />
            </span>
            <SelectBox
              label="Wilayah"
              value={wilayah}
              onChange={(v) => patch({ wilayah: v })}
              options={[{ value: ALL, label: 'Semua wilayah' }, ...WILAYAH_OPTIONS.map((w) => ({ value: w, label: w }))]}
            />
          </label>
        </div>
        <label className="check">
          <input type="checkbox" checked={arsip} onChange={(e) => patch({ arsip: e.target.checked ? '1' : null })} />
          <span>Tampilkan pemanfaatan data yang diarsipkan</span>
        </label>
      </section>

      <div className="result-bar">
        <strong aria-live="polite">{list.length} hasil</strong>
        <label className="sort-box">
          <span>Urutkan</span>
          <SelectBox label="Urutkan" value={sort} onChange={(v) => patch({ sort: v === 'terbaru' ? null : v }, false)} options={SORTS} />
        </label>
      </div>

      {view.length === 0 ? (
        <div className="empty">
          <h2>Pemanfaatan data tidak ditemukan</h2>
          <p>Coba ubah kata kunci atau atur ulang filter.</p>
          {filtered && (
            <div className="empty__actions">
              <button type="button" className="btn btn--primary" onClick={() => setParams(new URLSearchParams())}>
                Atur ulang filter
              </button>
            </div>
          )}
        </div>
      ) : (
        <ul className="usage-list">
          {view.map((u) => {
            const Icon = USAGE_ICONS[u.icon]
            return (
              <li key={u.id}>
                <button type="button" className={`usage${u.archived ? ' is-archived' : ''}`} onClick={() => setOpen(u)}>
                  <span className="usage__main">
                    <span className="usage__meta">
                      {fmtDate(u.date)} · {u.author}
                      {u.archived && <span className="usage__arch">Diarsipkan</span>}
                    </span>
                    <strong className="usage__title">{u.title}</strong>
                    <span className="usage__desc">{u.description}</span>
                    <span className="usage__chips">
                      {u.topik && <span className="chip">{u.topik}</span>}
                      <span className="chip chip--plain">{u.wilayah}</span>
                    </span>
                  </span>
                  <span className="usage__thumb" aria-hidden="true">
                    <Icon size={34} />
                    <span className="usage__badge">Pemanfaatan Data</span>
                  </span>
                </button>
              </li>
            )
          })}
        </ul>
      )}

      <Pager
        page={page}
        pages={pages}
        total={list.length}
        size={size}
        onPage={(n) => patch({ page: n === 1 ? null : String(n) }, false)}
        onSize={(s) => patch({ size: s === 20 ? null : String(s) })}
        sizes={SIZES}
      />

      <div className="list-back">
        <button type="button" className="btn btn--outline" onClick={() => navigate('/')}>
          Kembali
        </button>
      </div>

      {open && (
        <Modal
          title={open.title}
          onClose={() => setOpen(null)}
          footer={
            <>
              <button type="button" className="btn btn--ghost" onClick={() => setOpen(null)}>
                Tutup
              </button>
              <button
                type="button"
                className={`btn ${open.archived ? 'btn--primary' : 'btn--outline'}`}
                onClick={() => setArchived(open, !open.archived)}
              >
                {open.archived ? 'Pulihkan' : 'Arsipkan'}
              </button>
            </>
          }
        >
          <p className="dlg-date">
            {fmtDate(open.date)} · {open.author}
          </p>
          <p className="dlg-desc">{open.description}</p>
          <dl className="dlg-dl">
            <dt>Topik</dt>
            <dd>{open.topik ?? '—'}</dd>
            <dt>Wilayah</dt>
            <dd>{open.wilayah}</dd>
            <dt>Status</dt>
            <dd>{open.archived ? 'Diarsipkan' : 'Aktif'}</dd>
          </dl>
        </Modal>
      )}

      {adding && <AddModal topics={topics} onClose={() => setAdding(false)} onSave={add} />}
    </main>
  )
}

function AddModal({ topics, onClose, onSave }: { topics: string[]; onClose: () => void; onSave: (u: Usage) => void }) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [topik, setTopik] = useState('')
  const [wilayah, setWilayah] = useState<Wilayah>('Nasional')
  const [errors, setErrors] = useState<{ title?: string; description?: string }>({})

  const submit = (e: FormEvent) => {
    e.preventDefault()
    const err: typeof errors = {}
    if (title.trim().length < 5) err.title = 'Judul minimal 5 karakter.'
    if (description.trim().length < 10) err.description = 'Deskripsi minimal 10 karakter.'
    setErrors(err)
    if (Object.keys(err).length) return
    onSave({
      id: `pm-u-${Date.now()}`,
      title: title.trim(),
      description: description.trim(),
      topik: topik.trim() || undefined,
      wilayah,
      date: todayIso(),
      author: USER.unit,
      icon: 'dashboard',
      mine: true,
    })
  }

  return (
    <Modal
      title="Tambah Pemanfaatan Data"
      onClose={onClose}
      footer={
        <>
          <button type="button" className="btn btn--ghost" onClick={onClose}>
            Batal
          </button>
          <button type="submit" form="form-pemanfaatan" className="btn btn--red">
            Simpan
          </button>
        </>
      }
    >
      <form id="form-pemanfaatan" className="form" onSubmit={submit} noValidate>
        <div className="field">
          <label className="field__label" htmlFor="pm-title">Judul</label>
          <input id="pm-title" value={title} onChange={(e) => setTitle(e.target.value)} aria-invalid={!!errors.title} />
          {errors.title && <span className="field__error">{errors.title}</span>}
        </div>
        <div className="field">
          <label className="field__label" htmlFor="pm-desc">Deskripsi</label>
          <textarea id="pm-desc" rows={4} value={description} onChange={(e) => setDescription(e.target.value)} aria-invalid={!!errors.description} />
          {errors.description && <span className="field__error">{errors.description}</span>}
        </div>
        <div className="field">
          <label className="field__label" htmlFor="pm-topik">Topik (opsional)</label>
          <input id="pm-topik" list="pm-topik-list" value={topik} onChange={(e) => setTopik(e.target.value)} />
          <datalist id="pm-topik-list">
            {topics.map((t) => (
              <option key={t} value={t} />
            ))}
          </datalist>
        </div>
        <div className="field">
          <label className="field__label" htmlFor="pm-wilayah">Wilayah</label>
          <select id="pm-wilayah" value={wilayah} onChange={(e) => setWilayah(e.target.value as Wilayah)}>
            {WILAYAH_OPTIONS.map((w) => (
              <option key={w}>{w}</option>
            ))}
          </select>
        </div>
      </form>
    </Modal>
  )
}
