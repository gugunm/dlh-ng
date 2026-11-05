import { useState, type FormEvent } from 'react'
import { Link, useLocation, useNavigate, type To } from 'react-router-dom'
import { Bell, ChevronsUpDown, CircleCheck, Database, FilePenLine, House, ListChecks, LogOut, RotateCcw, Search, SquareTerminal, User, type LucideIcon } from 'lucide-react'
import logo from '../assets/bpkp/logo-bpkp.png'
import { usePopover } from '../hooks/usePopover'
import { useDialogs } from './Dialogs'
import { useToast } from './Toast'
import { useRequests } from '../hooks/useRequests'
import { useWorkflow } from '../hooks/useWorkflow'
import { ROLES, USER, useAuth, type Role } from '../hooks/useAuth'

interface NavItem {
  key: string
  label: string
  to: To
  icon?: LucideIcon
}

/** Shared tabs (Beranda … Pemanfaatan Data); the role-specific item sits on the right of the nav bar. */
const SHARED: NavItem[] = [
  { key: 'beranda', label: 'Beranda', to: '/', icon: House },
  { key: 'dataset', label: 'Dataset', to: '/dataset' },
  { key: 'produsen', label: 'Daftar Produsen', to: '/produsen' },
  { key: 'pemanfaatan', label: 'Pemanfaatan Data', to: '/pemanfaatan' },
]

const ROLE_NAV: Record<Role, NavItem> = {
  'Pengguna Data': { key: 'role', label: 'Permohonan Saya', to: { pathname: '/', hash: '#permohonan' }, icon: FilePenLine },
  'Produsen Data': { key: 'role', label: 'Dataset Saya', to: { pathname: '/', hash: '#dataset-saya' }, icon: Database },
  Walidata: { key: 'role', label: 'Verifikasi Data', to: { pathname: '/', hash: '#antrean' }, icon: ListChecks },
}

const CONSOLE_URL = 'https://sitomat-v2.sicabe.com'

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

const ROLE_HASH: Record<Role, string> = {
  'Pengguna Data': '#permohonan',
  'Produsen Data': '#dataset-saya',
  Walidata: '#antrean',
}

function useActiveNav(role: Role): string {
  const { pathname, hash } = useLocation()
  if (pathname === '/') return hash === ROLE_HASH[role] ? 'role' : 'beranda'
  if (pathname.startsWith('/produsen')) return 'produsen'
  if (pathname.startsWith('/pemanfaatan')) return 'pemanfaatan'
  return 'dataset'
}

export function Header() {
  const { role, switchRole, logout } = useAuth()
  const roleNav = ROLE_NAV[role]
  const active = useActiveNav(role)
  const navigate = useNavigate()
  const toast = useToast()
  const dialogs = useDialogs()
  const { reset } = useRequests()
  const workflow = useWorkflow()

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

  const tab = (n: NavItem, isRole = false) => {
    const Icon = n.icon
    const isActive = active === n.key
    return (
      <Link
        key={n.key}
        to={n.to}
        className={`nav-bar__item${isRole ? ' nav-bar__item--role' : ''}${isActive ? ' is-active' : ''}`}
        aria-current={isActive ? 'page' : undefined}
      >
        {Icon && <Icon size={18} aria-hidden="true" />}
        {n.label}
      </Link>
    )
  }

  const chooseRole = (next: Role) => {
    user.close()
    if (next === role) return
    switchRole(next)
    navigate('/')
    toast.show(`Peran diganti menjadi ${next}.`, 'success')
  }

  const signOut = () => {
    user.close()
    logout()
    toast.show('Anda telah keluar.', 'info')
    navigate('/masuk')
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
              <span className="avatar">{USER.initials}</span>
              <span className="user-menu__text">
                <strong>{USER.name}</strong>
                <span>{role}</span>
              </span>
              <ChevronsUpDown size={16} />
            </button>
            {user.open && (
              <div className="popover__panel popover__panel--user popover__panel--role" role="menu">
                <div className="role-profile">
                  <span className="avatar avatar--lg">{USER.initials}</span>
                  <div>
                    <strong>{USER.name}</strong>
                    <span>{USER.unit}</span>
                  </div>
                </div>
                <div className="role-label" id="ganti-peran">
                  GANTI PERAN
                </div>
                <div className="role-list" role="group" aria-labelledby="ganti-peran">
                  {ROLES.map(({ role: r, description, icon: Icon }) => (
                    <button
                      key={r}
                      type="button"
                      role="menuitemradio"
                      aria-checked={r === role}
                      className={`role-item${r === role ? ' is-active' : ''}`}
                      onClick={() => chooseRole(r)}
                    >
                      <span className="role-item__icon">
                        <Icon size={18} />
                      </span>
                      <span className="role-item__text">
                        <strong>{r}</strong>
                        <span>{description}</span>
                      </span>
                      {r === role && (
                        <span className="role-item__badge">
                          <CircleCheck size={13} /> Aktif
                        </span>
                      )}
                    </button>
                  ))}
                </div>
                <hr />
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    user.close()
                    toast.show('Profil belum tersedia pada prototipe ini.', 'info')
                  }}
                >
                  <User size={16} /> Profil Saya
                </button>
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    user.close()
                    if (role !== 'Pengguna Data') switchRole('Pengguna Data')
                    navigate({ pathname: '/', hash: '#permohonan' })
                  }}
                >
                  <FilePenLine size={16} /> Permohonan Saya
                </button>
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    user.close()
                    reset()
                    workflow.reset()
                    toast.show('Data contoh dikembalikan ke awal.', 'info')
                  }}
                >
                  <RotateCcw size={16} /> Atur Ulang Data Contoh
                </button>
                <hr />
                <button type="button" role="menuitem" className="is-danger" onClick={signOut}>
                  <LogOut size={16} /> Keluar
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      <nav className="nav-bar" aria-label="Navigasi utama">
        <div className="nav-bar__inner">
          <div className="nav-bar__left">{SHARED.map((n) => tab(n))}</div>
          <div className="nav-bar__right">
            {tab(roleNav, true)}
            {role === 'Walidata' && (
              <a href={CONSOLE_URL} target="_blank" rel="noopener noreferrer" className="nav-bar__item nav-bar__item--role">
                <SquareTerminal size={18} aria-hidden="true" />
                Console
              </a>
            )}
          </div>
        </div>
      </nav>
    </header>
  )
}
