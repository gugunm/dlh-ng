import { useState, type FormEvent } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { ArrowLeft, ArrowRight, Eye, EyeOff, Info, KeyRound, Lock, LoaderCircle, User } from 'lucide-react'
import whiteLogo from '../assets/bpkp/bpkp-putih-hd.png'
import logo from '../assets/bpkp/logo-bpkp.png'
import hadir from '../assets/bpkp/hadir-bermanfaat.png'
import { useToast } from '../components/Toast'
import { ROLES, useAuth, type Role } from '../hooks/useAuth'

const REMEMBER_KEY = 'dlh-katalog-remember-v1'
const readRemembered = () => {
  try {
    return localStorage.getItem(REMEMBER_KEY) ?? ''
  } catch {
    return ''
  }
}

const ROLE_COPY: Record<Role, string> = {
  Walidata: 'Verifikasi dan validasi data serta pembinaan standar data',
  'Produsen Data': 'Kelola, unggah, dan perbarui dataset unit kerja',
  'Pengguna Data': 'Cari dataset dan ajukan permohonan informasi',
}

export default function Masuk() {
  const { authed, role, login, switchRole } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const toast = useToast()

  const remembered = readRemembered()
  const [id, setId] = useState(remembered)
  const [pw, setPw] = useState('')
  const [show, setShow] = useState(false)
  const [remember, setRemember] = useState(!!remembered)
  const [errors, setErrors] = useState<{ id?: string; pw?: string }>({})
  const [busy, setBusy] = useState<'form' | 'sso' | null>(null)

  const from = (location.state as { from?: string } | null)?.from ?? '/'
  if (authed && !busy) return <Navigate to={from} replace />

  const finish = (how: 'form' | 'sso') => {
    setBusy(how)
    window.setTimeout(() => {
      try {
        if (how === 'form' && remember) localStorage.setItem(REMEMBER_KEY, id.trim())
        else localStorage.removeItem(REMEMBER_KEY)
      } catch {
        /* storage unavailable */
      }
      login()
      toast.show(`Selamat datang, Sari Wulandari. Anda masuk sebagai ${role}.`, 'success')
      navigate(from, { replace: true })
    }, 650)
  }

  const submit = (e: FormEvent) => {
    e.preventDefault()
    const next: typeof errors = {}
    if (!id.trim()) next.id = 'Masukkan NIP atau email dinas Anda.'
    else if (!/^\d{18}$/.test(id.trim()) && !/^\S+@\S+\.\S+$/.test(id.trim()))
      next.id = 'Gunakan NIP 18 digit atau alamat email dinas yang valid.'
    if (!pw) next.pw = 'Masukkan kata sandi Anda.'
    else if (pw.length < 6) next.pw = 'Kata sandi minimal 6 karakter.'
    setErrors(next)
    if (Object.keys(next).length === 0) finish('form')
  }

  return (
    <div className="login">
      <aside className="login__brand">
        <div className="login__brand-top">
          <img src={whiteLogo} alt="BPKP" className="login__white-logo" />
          <div className="login__copy">
            <div className="eyebrow">
              <span />
              <p>KATALOG DATA BPKP</p>
            </div>
            <h2>Akses data pengawasan yang akurat dan akuntabel</h2>
            <p className="login__lead">
              Masuk dengan akun Anda untuk mengakses Katalog Data sesuai peran: Walidata, Produsen Data, atau
              Pengguna Data.
            </p>
          </div>
          <ul className="login__roles" aria-label="Pilih peran untuk masuk">
            {ROLES.map(({ role: r, icon: Icon }) => (
              <li key={r}>
                <button
                  type="button"
                  className={`login-role${r === role ? ' is-active' : ''}`}
                  aria-pressed={r === role}
                  onClick={() => switchRole(r)}
                >
                  <span className="login-role__icon">
                    <Icon size={20} />
                  </span>
                  <span>
                    <strong>{r}</strong>
                    <span>{ROLE_COPY[r]}</span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
        <div className="login__brand-bottom">
          <img src={hadir} alt="Hadir Bermanfaat" className="login__hadir" />
          <p>© 2026 Badan Pengawasan Keuangan dan Pembangunan</p>
        </div>
        <div className="login__bar" aria-hidden="true">
          <span />
          <span />
        </div>
      </aside>

      <main className="login__panel">
        <div className="login__top">
          <Link to="/" aria-label="Katalog Data BPKP">
            <img src={logo} alt="BPKP" className="login__logo" />
          </Link>
          <button
            type="button"
            className="login__back"
            onClick={() => toast.show('Panduan pengguna belum tersedia pada prototipe ini.', 'info')}
          >
            <ArrowLeft size={16} /> Panduan Pengguna
          </button>
        </div>

        <form className="login__form" onSubmit={submit} noValidate aria-label="Formulir masuk">
          <div className="login__heading">
            <h1>Masuk</h1>
            <p>Gunakan akun Katalog Data BPKP Anda untuk melanjutkan.</p>
            <p className="login__as">
              Peran: <strong>{role}</strong>
            </p>
          </div>

          <div className="field login__role-select">
            <label className="field__label" htmlFor="login-role">
              Masuk sebagai
            </label>
            <select id="login-role" value={role} onChange={(e) => switchRole(e.target.value as Role)}>
              {ROLES.map((r) => (
                <option key={r.role}>{r.role}</option>
              ))}
            </select>
          </div>

          <div className="field">
            <label className="field__label" htmlFor="login-id">
              NIP atau Email Dinas
            </label>
            <div className={`login-input${errors.id ? ' is-invalid' : ''}`}>
              <User size={18} />
              <input
                id="login-id"
                autoComplete="username"
                placeholder="Masukkan NIP atau email dinas"
                value={id}
                aria-invalid={!!errors.id}
                aria-describedby={errors.id ? 'login-id-err' : undefined}
                onChange={(e) => {
                  setId(e.target.value)
                  if (errors.id) setErrors((s) => ({ ...s, id: undefined }))
                }}
              />
            </div>
            {errors.id && (
              <p className="field__error" id="login-id-err" role="alert">
                {errors.id}
              </p>
            )}
          </div>

          <div className="field">
            <label className="field__label" htmlFor="login-pw">
              Kata Sandi
            </label>
            <div className={`login-input${errors.pw ? ' is-invalid' : ''}`}>
              <Lock size={18} />
              <input
                id="login-pw"
                type={show ? 'text' : 'password'}
                autoComplete="current-password"
                placeholder="Masukkan kata sandi"
                value={pw}
                aria-invalid={!!errors.pw}
                aria-describedby={errors.pw ? 'login-pw-err' : undefined}
                onChange={(e) => {
                  setPw(e.target.value)
                  if (errors.pw) setErrors((s) => ({ ...s, pw: undefined }))
                }}
              />
              <button
                type="button"
                className="login-input__eye"
                aria-label={show ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
                aria-pressed={show}
                onClick={() => setShow((v) => !v)}
              >
                {show ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.pw && (
              <p className="field__error" id="login-pw-err" role="alert">
                {errors.pw}
              </p>
            )}
          </div>

          <div className="login__row">
            <label className="check">
              <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} />
              Ingat saya
            </label>
            <button
              type="button"
              className="link-btn"
              onClick={() => toast.show('Tautan atur ulang kata sandi dikirim ke email dinas Anda (simulasi).', 'info')}
            >
              Lupa kata sandi?
            </button>
          </div>

          <button type="submit" className="btn btn--red btn--lg login__submit" disabled={busy !== null}>
            {busy === 'form' ? (
              <>
                <LoaderCircle size={18} className="spin" /> Memproses…
              </>
            ) : (
              <>
                Masuk <ArrowRight size={18} />
              </>
            )}
          </button>

          <div className="login__or">
            <span>atau</span>
          </div>

          <button
            type="button"
            className="btn btn--outline btn--lg login__submit"
            disabled={busy !== null}
            onClick={() => finish('sso')}
          >
            {busy === 'sso' ? (
              <>
                <LoaderCircle size={18} className="spin" /> Menghubungkan…
              </>
            ) : (
              <>
                <KeyRound size={18} /> Masuk dengan SSO
              </>
            )}
          </button>

          <p className="login__help">
            <Info size={16} />
            <span>
              Belum memiliki akun? Hubungi administrator unit kerja Anda atau <a href="mailto:humas@bpkp.go.id">humas@bpkp.go.id</a>.
            </span>
          </p>
        </form>
      </main>
    </div>
  )
}
