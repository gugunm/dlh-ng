import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import {
  ArrowRight,
  BadgeCheck,
  BookMarked,
  Building2,
  ChartColumn,
  Database,
  Download,
  FilePenLine,
  FileText,
  House,
  Landmark,
  ListTree,
  Search,
  Share2,
  ShieldCheck,
  ShoppingCart,
  Tags,
  Target,
  type LucideIcon,
} from 'lucide-react'
import { TYPE_ICONS, StatusBadge } from '../components/Badges'
import { Mascot } from '../components/Mascot'
import { useDialogs } from '../components/Dialogs'
import { useToast } from '../components/Toast'
import { CATALOG, CONTENT_TYPES, HOME_FEATURED_IDS, itemById, type CatalogItem } from '../data/catalog'
import { useRequests, type InfoRequest } from '../hooks/useRequests'
import { downloadTextFile, fmtDate, slug } from '../lib/format'

const POPULAR = ['SPIP', 'Kapabilitas APIP', 'Dana Desa', 'Pengadaan']

const STATS: { icon: LucideIcon; value: string; label: string; to?: string }[] = [
  { icon: Database, value: '1.248', label: 'Dataset', to: '/dataset?jenis=Dataset' },
  { icon: FileText, value: '312', label: 'Publikasi', to: '/dataset?jenis=Publikasi' },
  { icon: ChartColumn, value: '64', label: 'Visualisasi', to: '/dataset?jenis=Visualisasi' },
  { icon: Building2, value: '38', label: 'Unit Kerja Produsen Data' },
]

const TOPICS: { icon: LucideIcon; name: string; count: string }[] = [
  { icon: ShieldCheck, name: 'SPIP', count: '214 dataset' },
  { icon: BadgeCheck, name: 'Kapabilitas APIP', count: '96 dataset' },
  { icon: Landmark, name: 'Keuangan Daerah', count: '187 dataset' },
  { icon: House, name: 'Dana Desa', count: '143 dataset' },
  { icon: ShoppingCart, name: 'Pengadaan Barang/Jasa', count: '121 dataset' },
  { icon: Target, name: 'Akuntabilitas Kinerja', count: '158 dataset' },
]

const TABS = ['Semua', ...CONTENT_TYPES] as const
type Tab = (typeof TABS)[number]

const RELEASE_DATASET = [
  ['Indeks Maturitas SPIP Kementerian/Lembaga', '12 November 2026'],
  ['Rekapitulasi Penilaian Kapabilitas APIP', '18 November 2026'],
  ['Realisasi Pengawasan Pengadaan Barang/Jasa Semester II', '24 November 2026'],
  ['Data Kinerja Pengawasan Dana Desa', '30 November 2026'],
]
const RELEASE_DATASET_MORE = [
  ['Data Penilaian Risiko Pengelolaan Dana Desa', '5 Desember 2026'],
  ['Indeks Efektivitas Pengendalian Gratifikasi', '12 Desember 2026'],
]
const RELEASE_PUB = [
  ['Ikhtisar Hasil Pengawasan Semester I 2026', '10 November 2026'],
  ['Buletin Pengawasan Edisi November 2026', '14 November 2026'],
  ['Analisis Kinerja Keuangan Daerah Triwulan III', '20 November 2026'],
  ['Infografis Capaian Penerapan SPIP 2026', '25 November 2026'],
]
const RELEASE_PUB_MORE = [
  ['Laporan Kinerja Pengawasan Tahun 2026', '8 Desember 2026'],
  ['Panduan Penerapan Manajemen Risiko', '15 Desember 2026'],
]

const SDI: {
  key: string
  icon: LucideIcon
  desc: string
  refs: { title: string; desc: string }[]
}[] = [
  {
    key: 'Standar Data',
    icon: BookMarked,
    desc: 'Standar data adalah standar yang mendasari data tertentu, mencakup konsep, definisi, klasifikasi, ukuran, dan satuan agar data dapat dibandingkan dan dipertukarkan antarinstansi.',
    refs: [
      {
        title: 'Peraturan Presiden Nomor 39 Tahun 2019 tentang Satu Data Indonesia',
        desc: 'Dasar hukum penyelenggaraan tata kelola data pemerintah untuk menghasilkan data yang akurat, mutakhir, terpadu, dan dapat dipertanggungjawabkan.',
      },
      {
        title: 'Standar Data Katalog Data BPKP',
        desc: 'Acuan penyusunan konsep, definisi, dan klasifikasi data yang digunakan pada dataset di Katalog Data BPKP.',
      },
    ],
  },
  {
    key: 'Metadata',
    icon: Tags,
    desc: 'Metadata adalah informasi dalam bentuk struktur dan format baku untuk menggambarkan data, menjelaskan data, serta memudahkan pencarian, penggunaan, dan pengelolaan informasi data.',
    refs: [
      {
        title: 'Pedoman Metadata Katalog Data BPKP',
        desc: 'Struktur dan format baku metadata yang diisi produsen data pada setiap dataset di Katalog Data BPKP.',
      },
    ],
  },
  {
    key: 'Kode Referensi',
    icon: ListTree,
    desc: 'Kode referensi adalah tanda berisi karakter yang mengidentifikasi atau mewakili data tertentu secara unik, sehingga data dapat dibedakan dan dikaitkan antarinstansi.',
    refs: [
      {
        title: 'Daftar Kode Referensi Wilayah dan Instansi',
        desc: 'Kode baku provinsi, kabupaten/kota, dan instansi untuk menyeragamkan data antarinstansi.',
      },
    ],
  },
  {
    key: 'Interoperabilitas',
    icon: Share2,
    desc: 'Interoperabilitas data adalah kemampuan data untuk dibagipakaikan antarsistem elektronik yang saling berinteraksi.',
    refs: [
      {
        title: 'Panduan Interoperabilitas Data BPKP',
        desc: 'Ketentuan format dan antarmuka pertukaran data agar dapat dibagipakaikan antarsistem elektronik.',
      },
    ],
  },
]

function ContentCard({ item, onOpen }: { item: CatalogItem; onOpen: (id: string) => void }) {
  const Icon = TYPE_ICONS[item.type]
  return (
    <button type="button" className="card" onClick={() => onOpen(item.id)}>
      <span className="card__thumb">
        <Icon size={48} strokeWidth={1.5} />
      </span>
      <span className="card__body">
        <span className="card__chip">{item.type}</span>
        <span className="card__title">{item.title}</span>
        <span className="card__meta">
          <span>{item.source}</span>
          <span>{fmtDate(item.date)}</span>
        </span>
      </span>
    </button>
  )
}

export default function Beranda() {
  const navigate = useNavigate()
  const location = useLocation()
  const dialogs = useDialogs()
  const toast = useToast()
  const { requests } = useRequests()

  const [q, setQ] = useState('')
  const [tab, setTab] = useState<Tab>('Semua')
  const [moreDataset, setMoreDataset] = useState(false)
  const [morePub, setMorePub] = useState(false)
  const [sdiKey, setSdiKey] = useState(SDI[0].key)

  useEffect(() => {
    if (!location.hash) return
    const el = document.getElementById(location.hash.slice(1))
    if (el) requestAnimationFrame(() => el.scrollIntoView({ behavior: 'smooth', block: 'start' }))
  }, [location.hash, location.key])

  const go = (term: string) => navigate(term ? `/dataset?q=${encodeURIComponent(term)}` : '/dataset')
  const onSearch = (e: FormEvent) => {
    e.preventDefault()
    go(q.trim())
  }

  const cards = useMemo(() => {
    if (tab === 'Semua') return HOME_FEATURED_IDS.map((id) => itemById(id)!).filter(Boolean)
    return CATALOG.filter((c) => c.type === tab)
      .sort((a, b) => b.date.localeCompare(a.date))
      .slice(0, 8)
  }, [tab])

  const requestAction = (r: InfoRequest) => {
    if (r.status === 'Disetujui') {
      const item = itemById(r.itemId)
      if (item) dialogs.downloadItem(item)
    } else dialogs.openStatus(r.id)
  }
  const actionLabel = (r: InfoRequest) =>
    r.status === 'Diproses' ? 'Lihat Status' : r.status === 'Disetujui' ? 'Unduh Data' : 'Lihat Alasan'

  const sdi = SDI.find((s) => s.key === sdiKey) ?? SDI[0]

  const downloadRef = (title: string) => {
    downloadTextFile(`${slug(title)}.txt`, `${title}\n\nBerkas referensi contoh untuk pengujian prototipe UX.`)
    toast.show('Berkas referensi contoh diunduh.', 'info')
  }

  return (
    <main>
      <section className="hero">
        <div className="hero__content">
          <div className="hero__text">
            <div className="eyebrow">
              <span />
              <p>BERANDA · PENGGUNA DATA</p>
            </div>
            <h1>Selamat datang, Sari Wulandari</h1>
            <p className="hero__desc">
              Temukan dataset, publikasi, dan visualisasi pengawasan. Untuk data bersifat terbatas, ajukan
              permohonan informasi dan pantau statusnya di sini.
            </p>
            <form className="hero-search" onSubmit={onSearch} role="search">
              <Search size={20} />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Cari dataset, publikasi, atau visualisasi…"
                aria-label="Kata kunci pencarian"
              />
              <button type="submit" className="btn btn--red btn--lg">
                Cari
              </button>
            </form>
            <div className="popular">
              <span>Pencarian populer:</span>
              {POPULAR.map((p) => (
                <button key={p} type="button" className="chip-dark" onClick={() => go(p)}>
                  {p}
                </button>
              ))}
            </div>
          </div>
          <div className="hero__mascot">
            <Mascot />
          </div>
        </div>
        <div className="hero__stats">
          <div className="stats">
            {STATS.map((s) => {
              const Icon = s.icon
              const inner = (
                <>
                  <span className="stat__icon">
                    <Icon size={20} />
                  </span>
                  <span className="stat__value">{s.value}</span>
                  <span className="stat__label">{s.label}</span>
                </>
              )
              return s.to ? (
                <Link key={s.label} to={s.to} className="stat stat--link">
                  {inner}
                </Link>
              ) : (
                <div key={s.label} className="stat">
                  {inner}
                </div>
              )
            })}
          </div>
        </div>
        <div className="hero__bar">
          <span />
          <span />
        </div>
      </section>

      <section className="section topics">
        <h2 className="section__title">Telusuri Berdasarkan Topik</h2>
        <div className="topics__row">
          {TOPICS.map((t) => {
            const Icon = t.icon
            return (
              <Link key={t.name} to={`/dataset?topik=${encodeURIComponent(t.name)}`} className="topic">
                <span className="topic__icon">
                  <Icon size={24} />
                </span>
                <span className="topic__text">
                  <strong>{t.name}</strong>
                  <span>{t.count}</span>
                </span>
              </Link>
            )
          })}
        </div>
      </section>

      <section className="section latest">
        <div className="section__head">
          <h2 className="section__title">Konten Terbaru</h2>
          <Link
            className="see-all"
            to={tab === 'Semua' ? '/dataset' : `/dataset?jenis=${encodeURIComponent(tab)}`}
          >
            Selengkapnya <ArrowRight size={16} />
          </Link>
        </div>
        <div className="tabs" role="tablist" aria-label="Jenis konten">
          {TABS.map((t) => (
            <button
              key={t}
              type="button"
              role="tab"
              aria-selected={tab === t}
              className={`pill${tab === t ? ' is-active' : ''}`}
              onClick={() => setTab(t)}
            >
              {t}
            </button>
          ))}
        </div>
        <div className="cards" role="tabpanel">
          {cards.map((c) => (
            <ContentCard key={c.id} item={c} onOpen={dialogs.openItem} />
          ))}
        </div>
      </section>

      <section className="section requests" id="permohonan">
        <div className="section__head">
          <div className="title-group">
            <span className="title-bar" />
            <h2 className="section__title">Permohonan Informasi Saya</h2>
          </div>
          <button type="button" className="btn btn--red" onClick={() => dialogs.openRequestForm()}>
            <FilePenLine size={16} /> Ajukan Permohonan Baru
          </button>
        </div>
        <div className="table" role="table" aria-label="Permohonan informasi">
          <div className="table__head" role="row">
            <span role="columnheader">Dataset</span>
            <span role="columnheader" className="col-160">
              Diajukan
            </span>
            <span role="columnheader" className="col-160">
              Status
            </span>
            <span role="columnheader" className="col-140">
              Aksi
            </span>
          </div>
          {requests.length === 0 && (
            <div className="table__empty">
              Belum ada permohonan. Pilih “Ajukan Permohonan Baru” untuk meminta akses data terbatas.
            </div>
          )}
          {requests.map((r) => (
            <div className="table__row" role="row" key={r.id}>
              <span className="table__title" role="cell">
                {r.title}
              </span>
              <span className="table__muted col-160" role="cell">
                {fmtDate(r.date)}
              </span>
              <span className="col-160" role="cell">
                <StatusBadge status={r.status} />
              </span>
              <span className="col-140" role="cell">
                <button type="button" className="link-btn" onClick={() => requestAction(r)}>
                  {actionLabel(r)}
                </button>
              </span>
            </div>
          ))}
        </div>
      </section>

      <section className="section release">
        <div className="title-group">
          <span className="title-bar" />
          <h2 className="section__title">Jadwal Rilis</h2>
        </div>
        <div className="release__tables">
          {[
            { title: 'Dataset', rows: RELEASE_DATASET, more: RELEASE_DATASET_MORE, open: moreDataset, set: setMoreDataset },
            { title: 'Publikasi dan Produk', rows: RELEASE_PUB, more: RELEASE_PUB_MORE, open: morePub, set: setMorePub },
          ].map((t) => (
            <div className="rtable" key={t.title}>
              <div className="rtable__head">
                <h3>{t.title}</h3>
                <span className="badge badge--blue badge--lg">Tahun 2026</span>
              </div>
              <div className="rtable__cols">
                <span>Judul</span>
                <span className="col-160">Jadwal Rilis</span>
              </div>
              {(t.open ? [...t.rows, ...t.more] : t.rows).map(([title, date]) => (
                <div className="rtable__row" key={title}>
                  <span>{title}</span>
                  <span className="col-160 table__muted">{date}</span>
                </div>
              ))}
              <button type="button" className="rtable__foot" aria-expanded={t.open} onClick={() => t.set(!t.open)}>
                {t.open ? 'Lebih sedikit' : 'Selengkapnya'}
                <ArrowRight size={16} className={t.open ? 'is-up' : ''} />
              </button>
            </div>
          ))}
        </div>
      </section>

      <section className="section sdi" id="sdi">
        <h2 className="section__title">Prinsip Satu Data Indonesia</h2>
        <div className="sdi__body">
          <div className="sdi__tabs" role="tablist" aria-orientation="vertical">
            {SDI.map((s) => {
              const Icon = s.icon
              return (
                <button
                  key={s.key}
                  type="button"
                  role="tab"
                  aria-selected={sdiKey === s.key}
                  className={`sdi__tab${sdiKey === s.key ? ' is-active' : ''}`}
                  onClick={() => setSdiKey(s.key)}
                >
                  <Icon size={18} /> {s.key}
                </button>
              )
            })}
          </div>
          <div className="sdi__panel" role="tabpanel">
            <h3>{sdi.key}</h3>
            <p className="sdi__desc">{sdi.desc}</p>
            {sdi.refs.map((r) => (
              <div className="ref-card" key={r.title}>
                <span className="ref-card__icon">
                  <FileText size={22} />
                </span>
                <div className="ref-card__text">
                  <strong>{r.title}</strong>
                  <span>{r.desc}</span>
                </div>
                <button type="button" className="btn btn--outline" onClick={() => downloadRef(r.title)}>
                  <Download size={16} /> Referensi File
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}
