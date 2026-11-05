import type { ReactNode } from 'react'
import type { LucideIcon } from 'lucide-react'
import type { DsStatus, QueueStatus } from '../hooks/useWorkflow'

export function WelcomeBand({
  eyebrow,
  name,
  desc,
  chip,
  actions,
}: {
  eyebrow: string
  name: string
  desc: string
  chip?: ReactNode
  actions: ReactNode
}) {
  return (
    <section className="welcome">
      <div className="welcome__content">
        <div className="welcome__text">
          <div className="eyebrow">
            <span />
            <p>{eyebrow}</p>
          </div>
          <h1>Selamat datang, {name}</h1>
          <p className="welcome__desc">{desc}</p>
          {chip}
        </div>
        <div className="welcome__actions">{actions}</div>
      </div>
      <div className="hero__bar">
        <span />
        <span />
      </div>
    </section>
  )
}

export type Tone = 'neutral' | 'sky' | 'red' | 'green' | 'amber'

export function SummaryCard({
  icon: Icon,
  value,
  label,
  tone,
  onClick,
  pressed,
}: {
  icon: LucideIcon
  value: number | string
  label: string
  tone: Tone
  onClick?: () => void
  pressed?: boolean
}) {
  const inner = (
    <>
      <span className={`sum-card__icon sum-card__icon--${tone}`}>
        <Icon size={22} />
      </span>
      <span className="sum-card__text">
        <strong>{value}</strong>
        <span>{label}</span>
      </span>
    </>
  )
  return onClick ? (
    <button type="button" className={`sum-card${pressed ? ' is-pressed' : ''}`} onClick={onClick} aria-pressed={pressed}>
      {inner}
    </button>
  ) : (
    <div className="sum-card">{inner}</div>
  )
}

const DS_TONE: Record<DsStatus | QueueStatus, string> = {
  Draf: 'neutral',
  'Menunggu Verifikasi': 'sky',
  'Perlu Revisi': 'red',
  Dipublikasikan: 'green',
  Menunggu: 'sky',
  'Sedang Diperiksa': 'amber',
}

export function DsStatusBadge({ status }: { status: DsStatus | QueueStatus }) {
  return <span className={`dstat dstat--${DS_TONE[status]}`}>{status}</span>
}
