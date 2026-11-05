import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Building2, ChevronRight, Search } from 'lucide-react'
import { Breadcrumb, Pager, SelectBox } from '../components/ListBits'
import { Modal } from '../components/Modal'
import { ASSET_LABEL, PRODUCERS, type AssetKey, type Producer } from '../data/producers'

type Tab = 'semua' | AssetKey
type Sort = 'terbaru' | 'nama' | 'aset'

// Totals as shown on the design's tabs.
const TABS: { key: Tab; label: string }[] = [
  { key: 'semua', label: 'Semua' },
  { key: 'dataset', label: 'Dataset (107)' },
  { key: 'layanan', label: 'Layanan Data (8)' },
  { key: 'pemanfaatan', label: 'Pemanfaatan Data (42)' },
]
const SORTS: { value: Sort; label: string }[] = [
  { value: 'terbaru', label: 'Terbaru ditambahkan' },
  { value: 'nama', label: 'Nama A–Z' },
  { value: 'aset', label: 'Aset terbanyak' },
]
const SIZES = [10, 20, 50]
const BADGE: Record<AssetKey, string> = { dataset: 'blue', layanan: 'green', pemanfaatan: 'red' }

const total = (p: Producer) => p.dataset + p.layanan + p.pemanfaatan

function AssetBadges({ p }: { p: Producer }) {
  return (
    <>
      {(['dataset', 'layanan', 'pemanfaatan'] as AssetKey[]).map(
        (k) =>
          p[k] > 0 && (
            <span key={k} className={`asset asset--${BADGE[k]}`}>
              {ASSET_LABEL[k]} ({p[k]})
            </span>
          ),
      )}
    </>
  )
}

export default function DaftarProdusen() {
  const [params, setParams] = useSearchParams()
  const navigate = useNavigate()
  const [open, setOpen] = useState<Producer | null>(null)

  const q = params.get('q') ?? ''
  const tab = (TABS.some((t) => t.key === params.get('aset')) ? params.get('aset') : 'semua') as Tab
  const sort = (SORTS.some((s) => s.value === params.get('sort')) ? params.get('sort') : 'terbaru') as Sort
  const size = SIZES.includes(Number(params.get('size'))) ? Number(params.get('size')) : 20
  const pageParam = Math.max(1, Number(params.get('page')) || 1)

  const [draft, setDraft] = useState(q)
  useEffect(() => setDraft(q), [q])

  const patch = (next: Record<string, string | null>, resetPage = true) => {
    const p = new URLSearchParams(params)
    for (const [k, v] of Object.entries(next)) {
      if (v === null || v === '') p.delete(k)
      else p.set(k, v)
    }
    if (resetPage) p.delete('page')
    setParams(p)
  }

  const list = useMemo(() => {
    const needle = q.trim().toLowerCase()
    const out = PRODUCERS.filter(
      (p) => (!needle || p.name.toLowerCase().includes(needle)) && (tab === 'semua' || p[tab] > 0),
    )
    if (sort === 'terbaru') out.sort((a, b) => b.added - a.added)
    else if (sort === 'nama') out.sort((a, b) => a.name.localeCompare(b.name, 'id'))
    else out.sort((a, b) => total(b) - total(a) || a.name.localeCompare(b.name, 'id'))
    return out
  }, [q, tab, sort])

  const pages = Math.max(1, Math.ceil(list.length / size))
  const page = Math.min(pageParam, pages)
  const view = list.slice((page - 1) * size, page * size)

  const submit = (e: FormEvent) => {
    e.preventDefault()
    patch({ q: draft.trim() })
  }

  return (
    <main className="list-page">
      <Breadcrumb current="Daftar Produsen" />
      <div className="list-title">
        <h1>Daftar Produsen</h1>
        <p>
          Produsen Data adalah unit kerja yang menghasilkan data pengawasan dan membagikannya melalui Katalog Data
          BPKP agar dapat dimanfaatkan bersama.
        </p>
      </div>

      <form className="list-card list-search" onSubmit={submit} role="search">
        <label className="input-box">
          <Search size={18} aria-hidden="true" />
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Cari produsen data"
            aria-label="Cari produsen data"
          />
        </label>
        <button type="submit" className="btn btn--red btn--lg">
          Cari
        </button>
      </form>

      <div className="filter-row">
        <div className="seg" role="tablist" aria-label="Jenis aset">
          {TABS.map((t) => (
            <button
              key={t.key}
              type="button"
              role="tab"
              aria-selected={tab === t.key}
              className={`seg__tab${tab === t.key ? ' is-active' : ''}`}
              onClick={() => patch({ aset: t.key === 'semua' ? null : t.key })}
            >
              {t.label}
            </button>
          ))}
        </div>
        <label className="sort-box">
          <span>Urutkan</span>
          <SelectBox label="Urutkan" value={sort} onChange={(v) => patch({ sort: v === 'terbaru' ? null : v }, false)} options={SORTS} />
        </label>
      </div>

      {view.length === 0 ? (
        <div className="empty">
          <h2>Produsen tidak ditemukan</h2>
          <p>Coba ubah kata kunci atau pilih jenis aset lain.</p>
          <div className="empty__actions">
            <button type="button" className="btn btn--primary" onClick={() => setParams(new URLSearchParams())}>
              Hapus pencarian
            </button>
          </div>
        </div>
      ) : (
        <ul className="producer-list">
          {view.map((p) => (
            <li key={p.id}>
              <button type="button" className="producer" onClick={() => setOpen(p)}>
                <span className="producer__icon">
                  <Building2 size={22} />
                </span>
                <span className="producer__text">
                  <strong>{p.name}</strong>
                  <span className="producer__assets">
                    <span className="producer__assets-label">Aset</span>
                    <span className="producer__badges">
                      <AssetBadges p={p} />
                    </span>
                  </span>
                </span>
                <ChevronRight size={20} aria-hidden="true" />
              </button>
            </li>
          ))}
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

      {open && (
        <Modal
          title={open.name}
          onClose={() => setOpen(null)}
          width={560}
          footer={
            <>
              <button type="button" className="btn btn--ghost" onClick={() => setOpen(null)}>
                Tutup
              </button>
              <button
                type="button"
                className="btn btn--primary"
                onClick={() => navigate(open.keyword ? `/dataset?q=${encodeURIComponent(open.keyword)}` : '/dataset')}
              >
                Lihat Dataset
              </button>
            </>
          }
        >
          <p className="dlg-desc">
            Aset yang dibagikan produsen ini melalui Katalog Data BPKP.
          </p>
          <div className="producer__badges producer__badges--modal">
            <AssetBadges p={open} />
          </div>
          <p className="dlg-note">Halaman profil produsen belum tersedia pada prototipe ini.</p>
        </Modal>
      )}
    </main>
  )
}
