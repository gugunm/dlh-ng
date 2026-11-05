import { useState, type FormEvent } from 'react'
import { Link, useLocation, useNavigate, type To } from 'react-router-dom'
import { Bell, ChevronsUpDown, LogOut, Menu, Search, X, FilePenLine, Download, Settings, RotateCcw } from 'lucide-react'
import logo from '../assets/bpkp/logo-bpkp.png'
import { usePopover } from '../hooks/usePopover'
import { useDialogs } from './Dialogs'
import { useToast } from './Toast'
import { useRequests } from '../hooks/useRequests'

type NavKey = 'beranda' | 'dataset' | 'publikasi' | 'visualisasi' | 'permohonan'

const NAV: { key: NavKey; label: string; to: To }[] = [
  { key: 'beranda', label: 'Beranda', to: '/' },
  { key: 'dataset', label: 'Dataset', to: '/dataset' },
  { key: 'publikasi', label: 'Publikasi', to: '/dataset?jenis=Publikasi' },
  { key: 'visualisasi', label: 'Visualisasi', to: '/dataset?jenis=Visualisasi' },
  { key: 'permohonan', label: 'Permohonan Saya', to: { pathname: '/', hash: '#permohonan' } },
]

const POPULAR = ['SPIP', 'Kapabilitas APIP', 'Dana Desa', 'Pengadaan']

const NOTIFICATIONS = [
  {
    id: 'n1',
    title: 'Dataset baru dirilis',
    text: 'Indeks Maturitas SPIP Pemerintah Daerah Tahun 2025',
    date: '5 Nov 2026',
    target: { kind: 'item', id: 'spip-pemda-2025' },
  },
  {
    id: 'n2',
    title: 'Permohonan sedang diproses',
    text: 'Rekapitulasi Penugasan Audit Investigatif Tahun 2026',
    date: '3 Nov 2026',
    target: { kind: 'status', id: 'req-seed-1' },
  },
  {
    id: 'n3',
    title: 'Permohonan disetujui',
    text: 'Hasil Penilaian Pengendalian Intern atas Pelaporan Keuangan',
    date: '14 Okt 2026',
    target: { kind: 'status', id: 'req-seed-2' },
  },
] as const

function useActiveNav(): NavKey {
  const { pathname, hash, search } = useLocation()
  if (pathname === '/') return hash === '#permohonan' ? 'permohonan' : 'beranda'
  const jenis = new URLSearchParams(search).getAll('jenis')
  if (jenis.length === 1 && jenis[0] === 'Publikasi') return 'publikasi'
  if (jenis.length === 1 && jenis[0] === 'Visualisasi') return 'visualisasi'
  return 'dataset'
}

export function Header() {
  const active = useActiveNav()
  const navigate = useNavigate()
  const toast = useToast()
  const dialogs = useDialogs()
  const { reset } = useRequests()

  const menu = usePopover()
  const search = usePopover()
  const bell = usePopover()
  const user = usePopover()

  const [query, setQuery] = useState('')
  const [read, setRead] = useState<Set<string>>(new Set())
  const unread = NOTIFICATIONS.filter((n) => !read.has(n.id)).length

  const submitSearch = (e: FormEvent) => {
    e.preventDefault()
    const q = query.trim()
    search.close()
    navigate(q ? `/dataset?q=${encodeURIComponent(q)}` : '/dataset')
  }

  const runPopular = (q: string) => {
    search.close()
    navigate(`/dataset?q=${encodeURIComponent(q)}`)
  }

  const openNotification = (n: (typeof NOTIFICATIONS)[number]) => {
    setRead((s) => new Set(s).add(n.id))
    bell.close()
    if (n.target.kind === 'item') dialogs.openItem(n.target.id)
    else dialogs.openStatus(n.target.id)
  }

  return (
    <header className="header">
      <div className="header__inner">
        <Link to="/" className="brand" aria-label="Katalog Data — Beranda">
          <img src={logo} alt="" className="brand__logo" />
          <span className="brand__divider" />
          <span className="brand__text">
            <strong>Katalog Data</strong>
            <span>Badan Pengawasan Keuangan dan Pembangunan</span>
          </span>
        </Link>

        <nav className="nav" aria-label="Navigasi utama">
          {NAV.map((n) => (
            <Link
              key={n.key}
              to={n.to}
              className={`nav__link${active === n.key ? ' is-active' : ''}`}
              aria-current={active === n.key ? 'page' : undefined}
            >
              {n.label}
            </Link>
          ))}
        </nav>

        <div className="actions">
          <div className="popover search-pop" ref={search.ref}>
            <button
              type="button"
              className="round-btn"
              aria-label="Cari"
              aria-expanded={search.open}
              onClick={search.toggle}
            >
              <Search size={18} />
            </button>
            {search.open && (
              <div className="popover__panel popover__panel--search">
                <form onSubmit={submitSearch} className="quick-search">
                  <Search size={18} />
                  <input
                    autoFocus
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Cari dataset, publikasi, atau visualisasi…"
                    aria-label="Kata kunci"
                  />
                  <button type="submit" className="btn btn--red btn--sm">
                    Cari
                  </button>
                </form>
                <div className="quick-search__popular">
                  <span>Pencarian populer:</span>
                  {POPULAR.map((p) => (
                    <button key={p} type="button" className="chip-light" onClick={() => runPopular(p)}>
                      {p}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="popover" ref={bell.ref}>
            <button
              type="button"
              className="round-btn"
              aria-label={`Notifikasi${unread ? `, ${unread} belum dibaca` : ''}`}
              aria-expanded={bell.open}
              onClick={bell.toggle}
            >
              <Bell size={18} />
              {unread > 0 && <span className="round-btn__dot" />}
            </button>
            {bell.open && (
              <div className="popover__panel popover__panel--bell">
                <div className="popover__head">
                  <strong>Notifikasi</strong>
                  <button
                    type="button"
                    className="link-btn"
                    disabled={unread === 0}
                    onClick={() => setRead(new Set(NOTIFICATIONS.map((n) => n.id)))}
                  >
                    Tandai semua dibaca
                  </button>
                </div>
                <ul className="notif">
                  {NOTIFICATIONS.map((n) => (
                    <li key={n.id}>
                      <button
                        type="button"
                        className={`notif__item${read.has(n.id) ? '' : ' is-unread'}`}
                        onClick={() => openNotification(n)}
                      >
                        <span className="notif__title">{n.title}</span>
                        <span className="notif__text">{n.text}</span>
                        <span className="notif__date">{n.date}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div className="popover" ref={user.ref}>
            <button
              type="button"
              className="user-menu"
              aria-haspopup="menu"
              aria-expanded={user.open}
              onClick={user.toggle}
            >
              <span className="avatar">SW</span>
              <span className="user-menu__text">
                <strong>Sari Wulandari</strong>
                <span>Pengguna Data</span>
              </span>
              <ChevronsUpDown size={16} />
            </button>
            {user.open && (
              <div className="popover__panel popover__panel--user" role="menu">
                <Link to={{ pathname: '/', hash: '#permohonan' }} role="menuitem" onClick={user.close}>
                  <FilePenLine size={16} /> Permohonan Saya
                </Link>
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    user.close()
                    toast.show('Riwayat unduhan belum tersedia pada prototipe ini.', 'info')
                  }}
                >
                  <Download size={16} /> Riwayat Unduhan
                </button>
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    user.close()
                    toast.show('Pengaturan akun belum tersedia pada prototipe ini.', 'info')
                  }}
                >
                  <Settings size={16} /> Pengaturan Akun
                </button>
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    user.close()
                    reset()
                    toast.show('Data contoh permohonan dikembalikan ke awal.', 'info')
                  }}
                >
                  <RotateCcw size={16} /> Atur Ulang Data Contoh
                </button>
                <hr />
                <button
                  type="button"
                  role="menuitem"
                  className="is-danger"
                  onClick={() => {
                    user.close()
                    toast.show('Anda telah keluar (simulasi).', 'info')
                  }}
                >
                  <LogOut size={16} /> Keluar
                </button>
              </div>
            )}
          </div>

          <div className="popover header__burger" ref={menu.ref}>
            <button
              type="button"
              className="round-btn"
              aria-label="Menu"
              aria-expanded={menu.open}
              onClick={menu.toggle}
            >
              {menu.open ? <X size={18} /> : <Menu size={18} />}
            </button>
            {menu.open && (
              <div className="popover__panel popover__panel--menu" role="menu">
                {NAV.map((n) => (
                  <Link
                    key={n.key}
                    to={n.to}
                    role="menuitem"
                    className={active === n.key ? 'is-active' : ''}
                    onClick={menu.close}
                  >
                    {n.label}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
