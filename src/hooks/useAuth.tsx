import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { BadgeCheck, Database, Search, type LucideIcon } from 'lucide-react'

export type Role = 'Walidata' | 'Produsen Data' | 'Pengguna Data'

export const ROLES: { role: Role; description: string; icon: LucideIcon }[] = [
  { role: 'Walidata', description: 'Verifikasi dan validasi data', icon: BadgeCheck },
  { role: 'Produsen Data', description: 'Kelola, unggah, dan perbarui dataset unit kerja', icon: Database },
  { role: 'Pengguna Data', description: 'Cari dataset dan ajukan permohonan informasi', icon: Search },
]

export const USER = {
  name: 'Sari Wulandari',
  initials: 'SW',
  unit: 'Deputi Bidang Pengawasan Penyelenggaraan Keuangan Daerah',
}

const KEY = 'dlh-katalog-auth-v1'

interface AuthState {
  authed: boolean
  role: Role
}

const load = (): AuthState => {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) {
      const p = JSON.parse(raw) as AuthState
      if (ROLES.some((r) => r.role === p.role)) return { authed: !!p.authed, role: p.role }
    }
  } catch {
    /* storage unavailable */
  }
  return { authed: true, role: 'Pengguna Data' }
}

interface AuthApi extends AuthState {
  login: () => void
  logout: () => void
  switchRole: (role: Role) => void
}

const AuthContext = createContext<AuthApi | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>(load)

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(state))
    } catch {
      /* storage unavailable */
    }
  }, [state])

  const login = useCallback(() => setState((s) => ({ ...s, authed: true })), [])
  const logout = useCallback(() => setState((s) => ({ ...s, authed: false })), [])
  const switchRole = useCallback((role: Role) => setState((s) => ({ ...s, role })), [])

  const api = useMemo(() => ({ ...state, login, logout, switchRole }), [state, login, logout, switchRole])
  return <AuthContext.Provider value={api}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
