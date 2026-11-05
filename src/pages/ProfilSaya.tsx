import { useEffect, useState, type FormEvent, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  BadgeCheck,
  Building2,
  Camera,
  CircleCheck,
  KeyRound,
  Laptop,
  Lock,
  LogOut,
  Plus,
  Repeat,
  Save,
  ShieldCheck,
  SlidersHorizontal,
  Smartphone,
  User,
  type LucideIcon,
} from 'lucide-react'
import { Breadcrumb, SelectBox } from '../components/ListBits'
import { Modal } from '../components/Modal'
import { useToast } from '../components/Toast'
import { ROLES, USER, useAuth, type Role } from '../hooks/useAuth'
import { fmtDateLong, todayIso } from '../lib/format'

const KEY = 'dlh-katalog-profil-v1'

type Notif = 'status' | 'dataset' | 'weekly'
type Lang = 'id' | 'en'

interface Prefs {
  phone: string
  lang: Lang
  notif: Record<Notif, boolean>
  twoFactor: boolean
  passwordDate: string
  otherSession: boolean
}

const DEFAULTS: Prefs = {
  phone: USER.phone,
  lang: 'id',
  notif: { status: true, dataset: false, weekly: true },
  twoFactor: true,
  passwordDate: '2026-08-12',
  otherSession: true,
}

const load = (): Prefs => {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) return { ...DEFAULTS, ...(JSON.parse(raw) as Partial<Prefs>) }
  } catch {
    /* storage unavailable */
  }
  return DEFAULTS
}

const SECTIONS: { id: string; label: string; icon: LucideIcon }[] = [
  { id: 'akun', label: 'Informasi Akun', icon: User },
  { id: 'peran', label: 'Peran & Hak Akses', icon: BadgeCheck },
  { id: 'preferensi', label: 'Preferensi', icon: SlidersHorizontal },
  { id: 'keamanan', label: 'Keamanan', icon: ShieldCheck },
]

const ROLE_ORDER: Role[] = ['Pengguna Data', 'Produsen Data', 'Walidata']
const ROLE_INFO: Record<Role, { description: string; scope: string; assigned: string }> = {
  'Pengguna Data': {
    description: 'Cari dataset dan ajukan permohonan informasi',
    scope: 'Akses umum dan permohonan data terbatas',
    assigned: 'Ditetapkan 12 Jan 2026',
  },
  'Produsen Data': {
    description: 'Kelola, unggah, dan perbarui dataset unit kerja',
    scope: USER.unit,
    assigned: 'Ditetapkan 12 Jan 2026',
  },
  Walidata: {
    description: 'Verifikasi dan validasi data serta pembinaan standar data',
    scope: 'Seluruh dataset di Katalog Data',
    assigned: 'Ditetapkan 3 Mar 2026',
  },
}

const NOTIFICATIONS: { key: Notif; title: string; description: string }[] = [
  { key: 'status', title: 'Status permohonan informasi', description: 'Kirim email saat status permohonan berubah.' },
  {
    key: 'dataset',
    title: 'Dataset baru dari produsen',
    description: 'Beritahu saya saat produsen yang saya ikuti merilis dataset.',
  },
  {
    key: 'weekly',
    title: 'Ringkasan mingguan',
    description: 'Ringkasan dataset dan pemanfaatan data terbaru setiap Senin.',
  },
]

const LANGS: { value: Lang; label: string }[] = [
  { value: 'id', label: 'Bahasa Indonesia' },
  { value: 'en', label: 'English' },
]

const phoneError = (value: string) => {
  const v = value.trim()
  if (!v) return 'Masukkan nomor telepon Anda.'
  if (!/^[+\d][\d\s-]*$/.test(v)) return 'Gunakan angka, spasi, atau tanda hubung.'
  const digits = v.replace(/\D/g, '').length
  return digits < 10 || digits > 15 ? 'Nomor telepon terdiri dari 10–15 digit.' : ''
}

function Section({
  id,
  icon: Icon,
  title,
  description,
  children,
}: {
  id: string
  icon: LucideIcon
  title: string
  description: string
  children: ReactNode
}) {
  return (
    <section className="prof-section" id={id} aria-labelledby={`${id}-title`}>
      <div className="prof-section__head">
        <span className="prof-section__icon">
          <Icon size={20} aria-hidden="true" />
        </span>
        <div>
          <h2 id={`${id}-title`}>{title}</h2>
          <p>{description}</p>
        </div>
      </div>
      {children}
    </section>
  )
}

function LockedField({ label, value }: { label: string; value: string }) {
  return (
    <div className="prof-field">
      <span className="prof-field__label">{label}</span>
      <div className="prof-input prof-input--locked" role="textbox" aria-readonly="true" aria-label={label}>
        <span>{value}</span>
        <Lock size={14} aria-hidden="true" />
      </div>
    </div>
  )
}

function Toggle({ checked, label, onChange }: { checked: boolean; label: string; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      className={`prof-toggle${checked ? ' is-on' : ''}`}
      onClick={() => onChange(!checked)}
    >
      <span />
    </button>
  )
}

function PasswordDialog({ onClose, onSaved }: { onClose: () => void; onSaved: () => void }) {
  const [current, setCurrent] = useState('')
  const [next, setNext] = useState('')
  const [confirm, setConfirm] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const errors = {
    current: current ? '' : 'Masukkan kata sandi saat ini.',
    next: next.length >= 8 ? '' : 'Kata sandi baru minimal 8 karakter.',
    confirm: confirm === next ? '' : 'Konfirmasi kata sandi tidak sama.',
  }
  const showErr = (k: keyof typeof errors) =>
    submitted && errors[k] ? (
      <span className="field__error" role="alert">
        {errors[k]}
      </span>
    ) : null

  const submit = (e: FormEvent) => {
    e.preventDefault()
    setSubmitted(true)
    if (Object.values(errors).every((v) => !v)) onSaved()
  }

  return (
    <Modal title="Ubah Kata Sandi" onClose={onClose} width={480}>
      <form className="form" onSubmit={submit} noValidate>
        <label className="field">
          <span className="field__label">Kata sandi saat ini</span>
          <input
            type="password"
            autoComplete="current-password"
            value={current}
            onChange={(e) => setCurrent(e.target.value)}
            aria-invalid={submitted && !!errors.current}
          />
          {showErr('current')}
        </label>
        <label className="field">
          <span className="field__label">Kata sandi baru</span>
          <input
            type="password"
            autoComplete="new-password"
            value={next}
            onChange={(e) => setNext(e.target.value)}
            aria-invalid={submitted && !!errors.next}
          />
          {showErr('next')}
        </label>
        <label className="field">
          <span className="field__label">Ulangi kata sandi baru</span>
          <input
            type="password"
            autoComplete="new-password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            aria-invalid={submitted && !!errors.confirm}
          />
          {showErr('confirm')}
        </label>
        <div className="form__actions">
          <button type="button" className="btn btn--ghost" onClick={onClose}>
            Batal
          </button>
          <button type="submit" className="btn btn--red">
            <KeyRound size={16} aria-hidden="true" /> Simpan Kata Sandi
          </button>
        </div>
      </form>
    </Modal>
  )
}

export default function ProfilSaya() {
  const { role, switchRole, logout } = useAuth()
  const navigate = useNavigate()
  const toast = useToast()

  const [prefs, setPrefs] = useState<Prefs>(load)
  const [phone, setPhone] = useState(prefs.phone)
  const [phoneErr, setPhoneErr] = useState('')
  const [active, setActive] = useState(SECTIONS[0].id)
  const [dialog, setDialog] = useState<'password' | 'signout' | null>(null)

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(prefs))
    } catch {
      /* storage unavailable */
    }
  }, [prefs])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const hit = entries.find((e) => e.isIntersecting)
        if (hit) setActive(hit.target.id)
      },
      { rootMargin: '-25% 0px -70% 0px' },
    )
    SECTIONS.forEach((s) => {
      const el = document.getElementById(s.id)
      if (el) observer.observe(el)
    })
    return () => observer.disconnect()
  }, [])

  const update = (next: Partial<Prefs>) => setPrefs((p) => ({ ...p, ...next }))
  const dirty = phone !== prefs.phone

  const goTo = (id: string) => {
    setActive(id)
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const cancelPhone = () => {
    setPhone(prefs.phone)
    setPhoneErr('')
  }

  const saveAccount = (e: FormEvent) => {
    e.preventDefault()
    const err = phoneError(phone)
    setPhoneErr(err)
    if (err) return
    const value = phone.trim()
    setPhone(value)
    update({ phone: value })
    toast.show('Perubahan profil disimpan.', 'success')
  }

  const chooseRole = (next: Role) => {
    switchRole(next)
    toast.show(`Peran diganti menjadi ${next}.`, 'success')
  }

  const setNotif = (key: Notif, value: boolean) => {
    update({ notif: { ...prefs.notif, [key]: value } })
    toast.show('Preferensi pemberitahuan disimpan.', 'info')
  }

  const setTwoFactor = (value: boolean) => {
    update({ twoFactor: value })
    toast.show(value ? 'Verifikasi dua langkah diaktifkan.' : 'Verifikasi dua langkah dinonaktifkan.', 'info')
  }

  const passwordSaved = () => {
    update({ passwordDate: todayIso() })
    setDialog(null)
    toast.show('Kata sandi berhasil diubah (simulasi).', 'success')
  }

  const signOutAll = () => {
    setDialog(null)
    logout()
    toast.show('Anda telah keluar dari semua perangkat.', 'info')
    navigate('/masuk')
  }

  return (
    <main className="list-page prof-page">
      <Breadcrumb current="Profil Saya" />
      <h1 className="prof-title">Profil Saya</h1>

      <section className="prof-card" aria-label="Ringkasan profil">
        <span className="prof-avatar" aria-hidden="true">
          {USER.initials}
        </span>
        <div className="prof-card__info">
          <h2>{USER.name}</h2>
          <p>
            {USER.position} · {USER.unit}
          </p>
          <ul className="prof-chips" aria-label="Peran Anda">
            {ROLE_ORDER.map((r) => (
              <li key={r} className={`prof-chip${r === role ? ' is-active' : ''}`}>
                {r === role && <CircleCheck size={13} aria-hidden="true" />}
                {r === role ? `${r} · Aktif` : r}
              </li>
            ))}
          </ul>
        </div>
        <button
          type="button"
          className="prof-btn"
          onClick={() => toast.show('Ubah foto belum tersedia pada prototipe ini.', 'info')}
        >
          <Camera size={16} aria-hidden="true" /> Ubah Foto
        </button>
      </section>

      <div className="prof-main">
        <nav className="prof-menu" aria-label="Bagian profil">
          {SECTIONS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              className={`prof-menu__item${active === id ? ' is-active' : ''}`}
              aria-current={active === id ? 'true' : undefined}
              onClick={() => goTo(id)}
            >
              <Icon size={18} aria-hidden="true" />
              {label}
            </button>
          ))}
        </nav>

        <div className="prof-sections">
          <Section
            id="akun"
            icon={User}
            title="Informasi Akun"
            description="Data kepegawaian bersumber dari unit SDM dan tidak dapat diubah di sini."
          >
            <form className="prof-form" onSubmit={saveAccount} noValidate>
              <div className="prof-grid">
                <LockedField label="Nama Lengkap" value={USER.name} />
                <LockedField label="NIP" value={USER.nip} />
                <LockedField label="Email Dinas" value={USER.email} />
                <div className="prof-field">
                  <label className="prof-field__label" htmlFor="prof-phone">
                    Nomor Telepon
                  </label>
                  <input
                    id="prof-phone"
                    className="prof-input"
                    type="tel"
                    autoComplete="tel"
                    value={phone}
                    aria-invalid={!!phoneErr}
                    aria-describedby={phoneErr ? 'prof-phone-err' : undefined}
                    onChange={(e) => {
                      setPhone(e.target.value)
                      if (phoneErr) setPhoneErr('')
                    }}
                  />
                  {phoneErr && (
                    <span className="field__error" id="prof-phone-err" role="alert">
                      {phoneErr}
                    </span>
                  )}
                </div>
                <LockedField label="Jabatan" value={USER.position} />
                <LockedField label="Unit Kerja" value={USER.unit} />
              </div>
              <div className="prof-form__actions">
                <button type="button" className="btn btn--ghost prof-cancel" disabled={!dirty} onClick={cancelPhone}>
                  Batalkan
                </button>
                <button type="submit" className="btn btn--red" disabled={!dirty}>
                  <Save size={16} aria-hidden="true" /> Simpan Perubahan
                </button>
              </div>
            </form>
          </Section>

          <Section
            id="peran"
            icon={BadgeCheck}
            title="Peran & Hak Akses"
            description="Peran ditetapkan oleh administrator. Anda dapat berganti peran kapan saja dari menu pengguna."
          >
            <div className="prof-roles">
              {ROLE_ORDER.map((r) => {
                const info = ROLE_INFO[r]
                const Icon = ROLES.find((x) => x.role === r)!.icon
                const isActive = r === role
                return (
                  <div key={r} className={`prof-role${isActive ? ' is-active' : ''}`}>
                    <span className="prof-role__icon">
                      <Icon size={22} aria-hidden="true" />
                    </span>
                    <div className="prof-role__text">
                      <strong>{r}</strong>
                      <p>{info.description}</p>
                      <div className="prof-role__meta">
                        <span className="prof-role__scope">
                          <Building2 size={13} aria-hidden="true" /> {info.scope}
                        </span>
                        <span>{info.assigned}</span>
                      </div>
                    </div>
                    {isActive ? (
                      <span className="prof-role__badge">
                        <CircleCheck size={13} aria-hidden="true" /> Aktif sekarang
                      </span>
                    ) : (
                      <button type="button" className="prof-btn prof-btn--sm" onClick={() => chooseRole(r)}>
                        <Repeat size={14} aria-hidden="true" /> Ganti ke peran ini
                      </button>
                    )}
                  </div>
                )
              })}
            </div>
            <button
              type="button"
              className="prof-link"
              onClick={() => toast.show('Permintaan dikirim ke administrator (simulasi).', 'info')}
            >
              <Plus size={16} aria-hidden="true" /> Ajukan penambahan peran ke administrator
            </button>
          </Section>

          <Section
            id="preferensi"
            icon={SlidersHorizontal}
            title="Preferensi"
            description="Atur bahasa dan pemberitahuan yang Anda terima."
          >
            <div className="prof-row prof-row--plain">
              <div className="prof-row__text">
                <strong>Bahasa</strong>
              </div>
              <SelectBox
                className="prof-select"
                label="Bahasa"
                value={prefs.lang}
                onChange={(v) => {
                  update({ lang: v })
                  toast.show('Preferensi bahasa disimpan (simulasi).', 'info')
                }}
                options={LANGS}
              />
            </div>
            {NOTIFICATIONS.map((n) => (
              <div className="prof-row" key={n.key}>
                <div className="prof-row__text">
                  <strong>{n.title}</strong>
                  <p>{n.description}</p>
                </div>
                <Toggle checked={prefs.notif[n.key]} label={n.title} onChange={(v) => setNotif(n.key, v)} />
              </div>
            ))}
          </Section>

          <Section
            id="keamanan"
            icon={ShieldCheck}
            title="Keamanan"
            description="Kelola kata sandi, verifikasi dua langkah, dan perangkat yang sedang masuk."
          >
            <div className="prof-row prof-row--plain">
              <div className="prof-row__text">
                <strong>Kata sandi</strong>
                <p>Terakhir diubah {fmtDateLong(prefs.passwordDate)}</p>
              </div>
              <button type="button" className="prof-btn" onClick={() => setDialog('password')}>
                <KeyRound size={15} aria-hidden="true" /> Ubah Kata Sandi
              </button>
            </div>
            <div className="prof-row">
              <div className="prof-row__text">
                <strong>Verifikasi dua langkah</strong>
                <p>{prefs.twoFactor ? 'Aktif melalui aplikasi autentikator.' : 'Belum aktif.'}</p>
              </div>
              <Toggle checked={prefs.twoFactor} label="Verifikasi dua langkah" onChange={setTwoFactor} />
            </div>
            <div className="prof-sessions">
              <h3>Perangkat yang sedang masuk</h3>
              <div className="prof-session">
                <Laptop size={22} aria-hidden="true" />
                <div className="prof-session__text">
                  <strong>MacBook · Chrome</strong>
                  <span>Jakarta · Aktif sekarang</span>
                </div>
                <span className="status status--green">Sesi ini</span>
              </div>
              {prefs.otherSession && (
                <div className="prof-session">
                  <Smartphone size={22} aria-hidden="true" />
                  <div className="prof-session__text">
                    <strong>iPhone · Safari</strong>
                    <span>Jakarta · Terakhir aktif 4 Nov 2026</span>
                  </div>
                  <button
                    type="button"
                    className="prof-signout-link"
                    aria-label="Keluarkan iPhone · Safari"
                    onClick={() => {
                      update({ otherSession: false })
                      toast.show('Perangkat iPhone · Safari dikeluarkan.', 'info')
                    }}
                  >
                    Keluarkan
                  </button>
                </div>
              )}
            </div>
            <button type="button" className="prof-btn prof-btn--red" onClick={() => setDialog('signout')}>
              <LogOut size={15} aria-hidden="true" /> Keluar dari Semua Perangkat
            </button>
          </Section>
        </div>
      </div>

      {dialog === 'password' && <PasswordDialog onClose={() => setDialog(null)} onSaved={passwordSaved} />}
      {dialog === 'signout' && (
        <Modal
          title="Keluar dari Semua Perangkat"
          onClose={() => setDialog(null)}
          width={480}
          footer={
            <>
              <button type="button" className="btn btn--ghost" onClick={() => setDialog(null)}>
                Batal
              </button>
              <button type="button" className="btn btn--red" onClick={signOutAll}>
                <LogOut size={16} aria-hidden="true" /> Keluar
              </button>
            </>
          }
        >
          <p className="req-confirm">Anda akan keluar dari semua perangkat, termasuk perangkat ini.</p>
        </Modal>
      )}
    </main>
  )
}
