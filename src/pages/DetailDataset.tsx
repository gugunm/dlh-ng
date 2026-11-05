import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  ArrowDown,
  ArrowUp,
  Braces,
  Building2,
  ChartColumn,
  ChevronRight,
  Clock,
  Download,
  FilePenLine,
  Info,
  Lock,
  Mail,
  Search,
  Share2,
  Table2,
} from 'lucide-react'
import { AccessBadge, TYPE_ICONS } from '../components/Badges'
import { Modal } from '../components/Modal'
import { useDialogs } from '../components/Dialogs'
import { useToast } from '../components/Toast'
import { CATALOG, itemById, type CatalogItem } from '../data/catalog'
import { tableFor } from '../data/tables'
import { useRequests } from '../hooks/useRequests'
import { downloadTextFile, fmtDate, fmtDateLong, slug } from '../lib/format'
import { pageList } from '../lib/search'

const PRODUCER_KD = 'Deputi Bidang Pengawasan Penyelenggaraan Keuangan Daerah'
const producerOf = (item: CatalogItem) => (item.source === 'Investigasi' ? 'Deputi Bidang Investigasi' : PRODUCER_KD)

const META_OVERRIDES: Record<string, { dibuat: string; diperbarui: string; topik?: string }> = {
  'spip-pemda-2025': { dibuat: '2025-10-03', diperbarui: '2026-10-20' },
  'ak-audit': { dibuat: '2025-10-02', diperbarui: '2026-10-20', topik: 'Investigasi' },
}

const PAGE_SIZES = [10, 25, 50]

function LevelBadge({ value }: { value: string }) {
  const n = Number(value.match(/Level (\d)/)?.[1])
  const tone = n >= 4 ? 'green' : n === 3 ? 'blue' : 'red'
  return <span className={`badge badge--${tone}`}>{value}</span>
}

function DataExplorer({ item }: { item: CatalogItem }) {
  const table = useMemo(() => tableFor(item), [item])
  const [tab, setTab] = useState<'tabel' | 'grafik'>('tabel')
  const [filters, setFilters] = useState<string[]>(() => table.columns.map(() => ''))
  const [sort, setSort] = useState<{ col: number; dir: 1 | -1 } | null>(null)
  const [size, setSize] = useState(10)
  const [page, setPage] = useState(1)

  const rows = useMemo(() => {
    let out = table.rows.filter((r) => filters.every((f, i) => !f || r[i].toLowerCase().includes(f.toLowerCase())))
    if (sort) {
      const { col, dir } = sort
      out = [...out].sort((a, b) => a[col].localeCompare(b[col], 'id', { numeric: true }) * dir)
    }
    return out
  }, [table, filters, sort])

  const pages = Math.max(1, Math.ceil(rows.length / size))
  const cur = Math.min(page, pages)
  const start = (cur - 1) * size
  const view = rows.slice(start, start + size)

  const chart = useMemo(() => {
    const counts = new Map<string, number>()
    rows.forEach((r) => counts.set(r[table.chartCol], (counts.get(r[table.chartCol]) ?? 0) + 1))
    return [...counts.entries()].sort((a, b) => a[0].localeCompare(b[0], 'id', { numeric: true }))
  }, [rows, table])
  const max = Math.max(1, ...chart.map((c) => c[1]))

  const setFilter = (i: number, v: string) => {
    setFilters((f) => f.map((x, k) => (k === i ? v : x)))
    setPage(1)
  }
  const toggleSort = (i: number) =>
    setSort((s) => (!s || s.col !== i ? { col: i, dir: 1 } : s.dir === 1 ? { col: i, dir: -1 } : null))

  const hasFilter = filters.some(Boolean)

  return (
    <section className="dtl-data" id="data" aria-label="Data">
      <div className="dtl-tabs" role="tablist">
        <button type="button" role="tab" aria-selected={tab === 'tabel'} className={tab === 'tabel' ? 'is-active' : ''} onClick={() => setTab('tabel')}>
          <Table2 size={16} /> Tabel
        </button>
        <button type="button" role="tab" aria-selected={tab === 'grafik'} className={tab === 'grafik' ? 'is-active' : ''} onClick={() => setTab('grafik')}>
          <ChartColumn size={16} /> Grafik
        </button>
      </div>

      {tab === 'tabel' ? (
        <div role="tabpanel" className="dtl-panel">
          <div className="dtl-panel__head">
            <h2>Tabel Dinamis</h2>
            <p>Ketik pada kolom filter untuk menyaring data</p>
          </div>
          <div className="dtl-table-wrap">
            <table className="dtl-table">
              <thead>
                <tr>
                  {table.columns.map((c, i) => (
                    <th key={c.key} style={c.width ? { width: c.width } : undefined} aria-sort={sort?.col === i ? (sort.dir === 1 ? 'ascending' : 'descending') : 'none'}>
                      <button type="button" onClick={() => toggleSort(i)}>
                        {c.label}
                        {sort?.col === i && (sort.dir === 1 ? <ArrowUp size={13} /> : <ArrowDown size={13} />)}
                      </button>
                    </th>
                  ))}
                </tr>
                <tr className="dtl-table__filters">
                  {table.columns.map((c, i) => (
                    <th key={c.key}>
                      <label>
                        <Search size={13} />
                        <input value={filters[i]} onChange={(e) => setFilter(i, e.target.value)} placeholder="Filter" aria-label={`Filter ${c.label}`} />
                      </label>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {view.map((r, ri) => (
                  <tr key={start + ri}>
                    {r.map((cell, ci) => (
                      <td key={ci}>{ci === table.badgeCol ? <LevelBadge value={cell} /> : cell}</td>
                    ))}
                  </tr>
                ))}
                {view.length === 0 && (
                  <tr>
                    <td colSpan={table.columns.length} className="dtl-table__empty">
                      Tidak ada data yang cocok dengan filter.{' '}
                      {hasFilter && (
                        <button type="button" className="link-btn" onClick={() => setFilters(table.columns.map(() => ''))}>
                          Hapus filter
                        </button>
                      )}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="dtl-foot">
            <p aria-live="polite">
              {rows.length === 0
                ? 'Menampilkan 0 data'
                : `Menampilkan ${start + 1} sampai ${start + view.length} dari ${rows.length} data`}
            </p>
            <label className="dtl-size">
              <span>Tampilkan</span>
              <select
                value={size}
                onChange={(e) => {
                  setSize(Number(e.target.value))
                  setPage(1)
                }}
              >
                {PAGE_SIZES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </label>
            <nav className="pagination dtl-pagination" aria-label="Halaman data">
              {pageList(cur, pages).map((p, i) =>
                p === '…' ? (
                  <span key={`g${i}`} className="page page--gap">…</span>
                ) : (
                  <button key={p} type="button" className={`page${p === cur ? ' is-active' : ''}`} aria-current={p === cur ? 'page' : undefined} onClick={() => setPage(p)}>
                    {p}
                  </button>
                ),
              )}
            </nav>
          </div>
        </div>
      ) : (
        <div role="tabpanel" className="dtl-panel">
          <div className="dtl-panel__head">
            <h2>{table.chartTitle}</h2>
            <p>Berdasarkan {rows.length} data{hasFilter ? ' hasil filter' : ''}</p>
          </div>
          {chart.length === 0 ? (
            <p className="dtl-table__empty">Tidak ada data untuk ditampilkan.</p>
          ) : (
            <ul className="dtl-chart">
              {chart.map(([label, n]) => (
                <li key={label}>
                  <span className="dtl-chart__label">{label}</span>
                  <span className="dtl-chart__track">
                    <span className="dtl-chart__bar" style={{ width: `${(n / max) * 100}%` }} />
                  </span>
                  <span className="dtl-chart__value">{n}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </section>
  )
}

export default function DetailDataset() {
  const { id = '' } = useParams()
  const item = itemById(id)
  const toast = useToast()
  const { downloadItem, openRequestForm, openStatus } = useDialogs()
  const { forItem } = useRequests()
  const [json, setJson] = useState(false)

  useEffect(() => {
    if (item) document.title = `${item.title} — Katalog Data BPKP`
    return () => {
      document.title = 'Katalog Data BPKP'
    }
  }, [item])

  if (!item) {
    return (
      <main className="dtl-missing">
        <h1>Dataset tidak ditemukan</h1>
        <p>Tautan yang Anda buka tidak cocok dengan dataset mana pun di katalog.</p>
        <Link to="/dataset" className="btn btn--red">
          Telusuri Dataset
        </Link>
      </main>
    )
  }

  const req = item.sifat === 'Terbatas' ? forItem(item.id) : undefined
  const unlocked = item.sifat === 'Terbuka' || req?.status === 'Disetujui'
  const isDataset = item.type === 'Dataset'
  const table = tableFor(item)
  const meta = META_OVERRIDES[item.id]
  const dibuat = meta?.dibuat ?? `${item.tahun - 1}-10-03`
  const diperbarui = meta?.diperbarui ?? item.date
  const topik = meta?.topik ?? item.topik
  const producer = producerOf(item)
  const Icon = TYPE_ICONS[item.type]

  const related = [
    ...CATALOG.filter((c) => c.id !== item.id && c.source === item.source),
    ...CATALOG.filter((c) => c.id !== item.id && c.source !== item.source && c.topik === item.topik),
    ...CATALOG.filter((c) => c.id !== item.id && c.topik !== item.topik && c.type === item.type),
  ].slice(0, 4)

  const share = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
      toast.show('Tautan dataset disalin ke papan klip.', 'success')
    } catch {
      toast.show(`Salin tautan dari bilah alamat: ${window.location.href}`, 'info')
    }
  }

  const jsonText = JSON.stringify(
    {
      id: item.id,
      judul: item.title,
      jenis: item.type,
      sifat: item.sifat,
      topik,
      sumber_data: producer,
      diperbarui,
      kolom: table.columns.map((c) => ({ nama: c.key, deskripsi: c.desc })),
      contoh_data: unlocked ? table.rows.slice(0, 3).map((r) => Object.fromEntries(table.columns.map((c, i) => [c.key, r[i]]))) : [],
    },
    null,
    2,
  )

  const metaRows: [string, string, string?][] = [
    ['Metadata Dibuat', fmtDateLong(dibuat)],
    ['Metadata Diperbarui', fmtDateLong(diperbarui)],
    ['Sumber Data', producer],
    ['Jadwal Pemutakhiran', '1 Tahun Sekali'],
    ['Klasifikasi Data', unlocked ? (item.sifat === 'Terbuka' ? 'Data Terbuka' : 'Data Terbatas') : '-'],
    ['Ukuran', unlocked && isDataset ? table.unit : '-'],
    ['Satuan', unlocked && isDataset ? table.satuan : '-'],
    ['Kontak', 'humas@bpkp.go.id'],
    ['Sifat Data', item.sifat, item.sifat === 'Terbuka' ? 'is-green' : 'is-red'],
  ]

  let requestButton
  if (req?.status === 'Diproses') {
    requestButton = (
      <button type="button" className="btn btn--outline btn--lg" onClick={() => openStatus(req.id)}>
        <Clock size={18} /> Lihat Status Permohonan
      </button>
    )
  } else {
    requestButton = (
      <button type="button" className="btn btn--red btn--lg" onClick={() => openRequestForm(item.id)}>
        <FilePenLine size={18} /> {req?.status === 'Ditolak' ? 'Ajukan Ulang Permohonan' : 'Ajukan Permohonan Informasi'}
      </button>
    )
  }

  return (
    <main className="dtl">
      <section className="dtl-band">
        <nav className="breadcrumb" aria-label="Breadcrumb">
          <Link to="/">Beranda</Link>
          <ChevronRight size={14} />
          <Link to="/dataset">Dataset</Link>
          <ChevronRight size={14} />
          <span aria-current="page">{item.title}</span>
        </nav>
        <div className="dtl-band__row">
          <div className="dtl-band__text">
            <div className="dtl-badges">
              <span className="badge badge--blue badge--lg">
                <Icon size={14} /> {item.type}
              </span>
              <AccessBadge sifat={item.sifat} />
            </div>
            <h1>{item.title}</h1>
            <p className="dtl-producer">
              <Building2 size={16} /> {producer}
            </p>
            <p className="dtl-desc">{item.description}</p>
          </div>
          <div className="dtl-actions">
            {unlocked && (
              <button type="button" className="btn btn--red btn--lg" onClick={() => downloadItem(item)}>
                <Download size={18} /> Unduh Sekarang
              </button>
            )}
            {unlocked && isDataset && (
              <button type="button" className="btn btn--outline btn--lg" onClick={() => setJson(true)}>
                <Braces size={18} /> Lihat JSON
              </button>
            )}
            <button type="button" className="btn btn--outline btn--lg" onClick={share}>
              <Share2 size={18} /> Bagikan
            </button>
          </div>
        </div>
      </section>

      <section className="dtl-details">
        <div className="dtl-komponen">
          <h2 className="dtl-h">
            <span className="title-bar" /> Komponen Data
          </h2>
          <ul className="dtl-komponen__list">
            {table.columns.map((c) => (
              <li key={c.key}>
                <code>{c.key}</code>
                <span>{c.desc}</span>
              </li>
            ))}
          </ul>
          <div className="dtl-taglist">
            <span>Topik:</span>
            <Link className="tag" to={`/dataset?topik=${encodeURIComponent(item.topik)}`}>
              {topik}
            </Link>
          </div>
          <div className="dtl-taglist">
            <span>Tag:</span>
            {item.tags.map((t) => (
              <Link key={t} className="tag" to={`/dataset?q=${encodeURIComponent(t)}`}>
                {t}
              </Link>
            ))}
          </div>
        </div>

        <aside className="dtl-meta" aria-label="Metadata">
          <h2>
            <Info size={18} /> Metadata
          </h2>
          <dl>
            {metaRows.map(([k, v, tone]) => (
              <div key={k}>
                <dt>{k}</dt>
                <dd className={tone}>{v}</dd>
              </div>
            ))}
          </dl>
        </aside>
      </section>

      {unlocked && isDataset && <DataExplorer key={item.id} item={item} />}

      {unlocked && !isDataset && (
        <section className="dtl-data">
          <div className="dtl-panel dtl-panel--note">
            <h2>Pratinjau tidak tersedia</h2>
            <p>Konten berjenis {item.type} dapat diunduh melalui tombol “Unduh Sekarang”.</p>
          </div>
        </section>
      )}

      {!unlocked && (
        <section className="dtl-data">
          <div className="dtl-restricted" role="note">
            <span className="dtl-restricted__icon">
              <Lock size={34} />
            </span>
            <h2>Dataset bersifat terbatas</h2>
            <p>
              {req?.status === 'Diproses'
                ? 'Permohonan Anda sedang diproses. Dataset akan dapat diakses setelah permohonan disetujui.'
                : 'Dataset bersifat terbatas tidak dapat ditampilkan. Apabila membutuhkan dataset ini, ajukan permohonan informasi melalui tautan berikut.'}
            </p>
            {requestButton}
            <p className="dtl-restricted__ppid">
              <Mail size={15} /> Layanan informasi publik (PPID): <a href="mailto:ppid.pusat@bpkp.go.id">ppid.pusat@bpkp.go.id</a>
            </p>
          </div>
        </section>
      )}

      {related.length > 0 && (
        <section className="dtl-related">
          <h2 className="dtl-h">
            <span className="title-bar" /> Dataset Terkait
          </h2>
          <div className="cards">
            {related.map((c) => {
              const I = TYPE_ICONS[c.type]
              return (
                <Link key={c.id} to={`/dataset/${c.id}`} className="card">
                  <span className="card__thumb">
                    <I size={48} strokeWidth={1.5} />
                  </span>
                  <span className="card__body">
                    <span className="card__chip">{c.type}</span>
                    <span className="card__title">{c.title}</span>
                    <span className="card__meta">
                      <span>{c.source}</span>
                      <span>{fmtDate(c.date)}</span>
                    </span>
                  </span>
                </Link>
              )
            })}
          </div>
        </section>
      )}

      {json && (
        <Modal
          title="Metadata & contoh data (JSON)"
          onClose={() => setJson(false)}
          width={680}
          footer={
            <>
              <button type="button" className="btn btn--ghost" onClick={() => setJson(false)}>
                Tutup
              </button>
              <button
                type="button"
                className="btn btn--primary"
                onClick={() => {
                  downloadTextFile(`${slug(item.title)}.json`, jsonText, 'application/json')
                  toast.show('Berkas JSON diunduh.', 'info')
                }}
              >
                <Download size={16} /> Unduh JSON
              </button>
            </>
          }
        >
          <pre className="dtl-json">{jsonText}</pre>
        </Modal>
      )}
    </main>
  )
}
