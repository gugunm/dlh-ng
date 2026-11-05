import { useMemo, useRef, useState, type ReactNode } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  ArrowDownUp,
  Building2,
  Calendar,
  Check,
  ChevronLeft,
  ChevronRight,
  CircleCheck,
  CircleX,
  Download,
  Eye,
  FilePenLine,
  Files,
  Hourglass,
  Mail,
  MessageSquareWarning,
  Search,
  X,
  type LucideIcon,
} from 'lucide-react'
import { StatusBadge } from '../components/Badges'
import { useDialogs } from '../components/Dialogs'
import { Breadcrumb, SelectBox } from '../components/ListBits'
import { Modal } from '../components/Modal'
import { useToast } from '../components/Toast'
import { itemById } from '../data/catalog'
import { useRequests, type InfoRequest, type RequestStatus } from '../hooks/useRequests'
import { addDays, fmtDate, fmtDateLong, todayIso } from '../lib/format'
import { pageList } from '../lib/search'

const PER_PAGE = 7
const CONTACT_EMAIL = 'ppid.pusat@bpkp.go.id'

type Tab = 'Semua' | RequestStatus
const TABS: Tab[] = ['Semua', 'Diproses', 'Disetujui', 'Ditolak']

type Period = 'semua' | '30' | '90' | '365'
const PERIODS: { value: Period; label: string }[] = [
  { value: 'semua', label: 'Semua periode' },
  { value: '30', label: '30 hari terakhir' },
  { value: '90', label: '90 hari terakhir' },
  { value: '365', label: '1 tahun terakhir' },
]

type Sort = 'terbaru' | 'terlama'
const SORTS: { value: Sort; label: string }[] = [
  { value: 'terbaru', label: 'Terbaru' },
  { value: 'terlama', label: 'Terlama' },
]

const ACTIONS: Record<RequestStatus, { label: string; icon: LucideIcon }> = {
  Diproses: { label: 'Lihat Status', icon: Eye },
  Disetujui: { label: 'Unduh Data', icon: Download },
  Ditolak: { label: 'Lihat Alasan', icon: MessageSquareWarning },
}

const producerOf = (r: InfoRequest) => r.producer ?? itemById(r.itemId)?.source ?? 'Produsen Data'

type StepState = 'done' | 'current' | 'todo' | 'rejected'
interface Step {
  title: string
  note: string
  state: StepState
}

const stepsFor = (r: InfoRequest): Step[] => {
  const decided = r.status !== 'Diproses'
  const verified = decided || !!r.verifiedAt
  const processing: StepState = decided ? 'done' : verified ? 'current' : 'todo'
  const decisionNote = decided ? (r.decidedAt ?? 'Selesai') : r.eta ? `Perkiraan ${fmtDate(r.eta)}` : 'Menunggu proses'
  return [
    { title: 'Diajukan', note: `${fmtDate(r.date)}${r.time ? `, ${r.time}` : ''}`, state: 'done' },
    {
      title: 'Diverifikasi',
      note: r.verifiedAt ?? (decided ? 'Selesai' : 'Menunggu verifikasi PPID'),
      state: verified ? 'done' : 'current',
    },
    {
      title: 'Diproses Produsen Data',
      note: decided ? 'Selesai' : verified ? `Menunggu tanggapan ${producerOf(r)}` : 'Menunggu verifikasi',
      state: processing,
    },
    {
      title: decided ? r.status : 'Keputusan',
      note: decisionNote,
      state: r.status === 'Disetujui' ? 'done' : r.status === 'Ditolak' ? 'rejected' : 'todo',
    },
  ]
}

function Summary({ icon: Icon, tone, value, label }: { icon: LucideIcon; tone: string; value: number; label: string }) {
  return (
    <div className="req-stat">
      <span className={`req-stat__icon req-stat__icon--${tone}`}>
        <Icon size={22} aria-hidden="true" />
      </span>
      <span className="req-stat__text">
        <strong>{value}</strong>
        <span>{label}</span>
      </span>
    </div>
  )
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="req-field">
      <dt>{label}</dt>
      <dd>{children}</dd>
    </div>
  )
}

function Timeline({ steps }: { steps: Step[] }) {
  return (
    <ol className="req-tl">
      {steps.map((s) => (
        <li key={s.title} className={`req-tl__step req-tl__step--${s.state}`}>
          <span className="req-tl__dot">
            {s.state === 'done' && <Check size={14} aria-hidden="true" />}
            {s.state === 'rejected' && <X size={14} aria-hidden="true" />}
          </span>
          <div className="req-tl__text">
            <strong>{s.title}</strong>
            <span>{s.note}</span>
          </div>
        </li>
      ))}
    </ol>
  )
}

function Detail({ req, onCancel }: { req: InfoRequest; onCancel: () => void }) {
  const dialogs = useDialogs()
  const item = itemById(req.itemId)
  const terbatas = item?.sifat !== 'Terbuka'
  const mail = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(`Permohonan ${req.no}`)}`

  return (
    <section className="req-detail" aria-label="Detail permohonan">
      <div className="req-detail__head">
        <h2>Detail Permohonan</h2>
        <span className="req-chip">{req.no}</span>
      </div>

      <div className="req-detail__dataset">
        <h3>{req.title}</h3>
        <p className="req-detail__producer">
          <Building2 size={14} aria-hidden="true" /> {producerOf(req)}
        </p>
        <div className="req-detail__badges">
          <StatusBadge status={req.status} />
          <span className={`status status--${terbatas ? 'red' : 'green'}`}>Data {terbatas ? 'Terbatas' : 'Terbuka'}</span>
        </div>
      </div>

      <dl className="req-fields">
        <Field label="Tanggal Diajukan">{fmtDateLong(req.date)}</Field>
        <Field label="Tujuan Penggunaan">{req.purpose ?? '—'}</Field>
        <Field label="Bentuk Data">{req.bentuk ?? '—'}</Field>
        {req.status === 'Diproses' ? (
          <Field label="Perkiraan Tanggapan">{req.eta ? fmtDateLong(req.eta) : '—'}</Field>
        ) : (
          <Field label="Tanggal Keputusan">{req.decidedAt ?? '—'}</Field>
        )}
      </dl>

      {req.status === 'Ditolak' && req.reason && <p className="dlg-note dlg-note--red">{req.reason}</p>}

      <div className="req-detail__timeline">
        <h3>Status Permohonan</h3>
        <Timeline steps={stepsFor(req)} />
      </div>

      <div className="req-detail__actions">
        {req.status === 'Diproses' && (
          <button type="button" className="req-btn req-btn--red" onClick={onCancel}>
            <CircleX size={16} aria-hidden="true" /> Batalkan Permohonan
          </button>
        )}
        {req.status === 'Disetujui' && item && (
          <button type="button" className="req-btn req-btn--solid" onClick={() => dialogs.downloadItem(item)}>
            <Download size={16} aria-hidden="true" /> Unduh Data
          </button>
        )}
        {req.status === 'Ditolak' && (
          <button type="button" className="req-btn req-btn--solid" onClick={() => dialogs.openRequestForm(req.itemId)}>
            <FilePenLine size={16} aria-hidden="true" /> Ajukan Ulang
          </button>
        )}
        <a className="req-btn req-btn--blue" href={mail}>
          <Mail size={16} aria-hidden="true" /> Hubungi Pemilik Data
        </a>
      </div>
    </section>
  )
}

export default function PermohonanSaya() {
  const [params, setParams] = useSearchParams()
  const dialogs = useDialogs()
  const toast = useToast()
  const { requests, cancel } = useRequests()
  const [cancelling, setCancelling] = useState<InfoRequest | null>(null)
  const detailRef = useRef<HTMLDivElement>(null)

  const q = params.get('q') ?? ''
  const tab = (TABS.find((t) => t === params.get('status')) ?? 'Semua') as Tab
  const period = (PERIODS.find((p) => p.value === params.get('periode'))?.value ?? 'semua') as Period
  const sort: Sort = params.get('sort') === 'terlama' ? 'terlama' : 'terbaru'

  const patch = (next: Record<string, string | null>, resetPage = true) => {
    const p = new URLSearchParams(params)
    for (const [k, v] of Object.entries(next)) {
      if (v === null || v === '') p.delete(k)
      else p.set(k, v)
    }
    if (resetPage) p.delete('page')
    setParams(p, { replace: 'q' in next || ('id' in next && !('page' in next)) })
  }

  /** Requests matching the search and period; the status tabs split this set. */
  const scoped = useMemo(() => {
    const term = q.trim().toLowerCase()
    const from = period === 'semua' ? '' : addDays(todayIso(), -Number(period))
    return requests.filter(
      (r) =>
        r.date >= from && (!term || r.no.toLowerCase().includes(term) || r.title.toLowerCase().includes(term)),
    )
  }, [requests, q, period])

  const filtered = useMemo(() => {
    const dir = sort === 'terbaru' ? -1 : 1
    return scoped
      .filter((r) => tab === 'Semua' || r.status === tab)
      .sort((a, b) => dir * a.date.localeCompare(b.date))
  }, [scoped, tab, sort])

  const count = (list: InfoRequest[], s: RequestStatus) => list.filter((r) => r.status === s).length
  const tabCount = (t: Tab) => (t === 'Semua' ? scoped.length : count(scoped, t))

  const pages = Math.max(1, Math.ceil(filtered.length / PER_PAGE))
  const page = Math.min(pages, Math.max(1, Number(params.get('page')) || 1))
  const start = (page - 1) * PER_PAGE
  const visible = filtered.slice(start, start + PER_PAGE)

  const selected = filtered.find((r) => r.id === params.get('id')) ?? visible[0]

  const select = (r: InfoRequest) => patch({ id: r.id }, false)
  const goToPage = (p: number) => patch({ page: String(p), id: null }, false)
  const runAction = (r: InfoRequest) => {
    if (r.status === 'Disetujui') {
      const item = itemById(r.itemId)
      if (item) dialogs.downloadItem(item)
      return
    }
    detailRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
  }

  const confirmCancel = () => {
    if (!cancelling) return
    cancel(cancelling.id)
    toast.show(`Permohonan ${cancelling.no} dibatalkan.`, 'info')
    setCancelling(null)
    patch({ id: null })
  }

  const hasFilters = !!q || period !== 'semua' || tab !== 'Semua'

  return (
    <main className="list-page req-page">
      <Breadcrumb current="Permohonan Saya" />

      <div className="list-head req-head">
        <div className="req-head__text">
          <h1>Permohonan Saya</h1>
          <p>Pantau status permohonan informasi untuk dataset bersifat terbatas dan unduh data yang telah disetujui.</p>
        </div>
        <button type="button" className="btn btn--red btn--lg" onClick={() => dialogs.openRequestForm()}>
          <FilePenLine size={18} aria-hidden="true" /> Ajukan Permohonan Baru
        </button>
      </div>

      <section className="req-stats" aria-label="Ringkasan permohonan">
        <Summary icon={Files} tone="plain" value={requests.length} label="Total Permohonan" />
        <Summary icon={Hourglass} tone="blue" value={count(requests, 'Diproses')} label="Sedang Diproses" />
        <Summary icon={CircleCheck} tone="green" value={count(requests, 'Disetujui')} label="Disetujui" />
        <Summary icon={CircleX} tone="red" value={count(requests, 'Ditolak')} label="Ditolak" />
      </section>

      <div className="req-main">
        <div className="req-column">
          <section className="req-toolbar" aria-label="Filter permohonan">
            <div className="req-toolbar__row">
              <label className="input-box req-search">
                <Search size={18} aria-hidden="true" />
                <input
                  value={q}
                  onChange={(e) => patch({ q: e.target.value })}
                  placeholder="Cari nomor permohonan atau judul dataset"
                  aria-label="Cari nomor permohonan atau judul dataset"
                />
              </label>
              <span className="req-select">
                <Calendar size={16} aria-hidden="true" />
                <SelectBox
                  label="Periode"
                  value={period}
                  onChange={(v) => patch({ periode: v === 'semua' ? null : v })}
                  options={PERIODS}
                />
              </span>
              <span className="req-select">
                <ArrowDownUp size={16} aria-hidden="true" />
                <SelectBox
                  label="Urutkan"
                  value={sort}
                  onChange={(v) => patch({ sort: v === 'terbaru' ? null : v })}
                  options={SORTS}
                />
              </span>
            </div>
            <div className="req-tabs" role="group" aria-label="Status permohonan">
              {TABS.map((t) => (
                <button
                  key={t}
                  type="button"
                  className={`req-tab${t === tab ? ' is-active' : ''}`}
                  aria-pressed={t === tab}
                  onClick={() => patch({ status: t === 'Semua' ? null : t })}
                >
                  {t} ({tabCount(t)})
                </button>
              ))}
            </div>
          </section>

          <div className="req-table-wrap">
            <div className="req-table" role="table" aria-label="Daftar permohonan">
              <div className="req-row req-row--head" role="row">
                <span role="columnheader">No. Permohonan</span>
                <span role="columnheader">Dataset</span>
                <span role="columnheader">Diajukan</span>
                <span role="columnheader">Status</span>
                <span role="columnheader">Aksi</span>
              </div>
              {visible.length === 0 && (
                <div className="req-empty">
                  {requests.length === 0 ? (
                    'Belum ada permohonan. Pilih “Ajukan Permohonan Baru” untuk meminta akses data terbatas.'
                  ) : (
                    <>
                      Tidak ada permohonan yang cocok dengan pencarian atau filter Anda.
                      {hasFilters && (
                        <button
                          type="button"
                          className="link-btn"
                          onClick={() => setParams(new URLSearchParams(), { replace: true })}
                        >
                          Hapus filter
                        </button>
                      )}
                    </>
                  )}
                </div>
              )}
              {visible.map((r) => {
                const action = ACTIONS[r.status]
                const isSelected = selected?.id === r.id
                return (
                  <div
                    key={r.id}
                    className={`req-row${isSelected ? ' is-selected' : ''}`}
                    role="row"
                    onClick={() => select(r)}
                  >
                    <span role="cell">
                      <button type="button" className="req-no" aria-current={isSelected ? 'true' : undefined}>
                        {r.no}
                      </button>
                    </span>
                    <span className="req-dataset" role="cell">
                      <strong>{r.title}</strong>
                      <span>{producerOf(r)}</span>
                    </span>
                    <span className="table__muted" role="cell">
                      {fmtDate(r.date)}
                    </span>
                    <span role="cell">
                      <StatusBadge status={r.status} />
                    </span>
                    <span role="cell">
                      <button type="button" className="req-action" onClick={() => runAction(r)}>
                        <action.icon size={14} aria-hidden="true" /> {action.label}
                      </button>
                    </span>
                  </div>
                )
              })}
            </div>
          </div>

          {filtered.length > 0 && (
            <div className="req-pager">
              <span aria-live="polite">
                Menampilkan {start + 1}–{start + visible.length} dari {filtered.length} permohonan
              </span>
              <nav className="req-pager__pages" aria-label="Halaman">
                <button
                  type="button"
                  className="req-pager__arrow"
                  aria-label="Halaman sebelumnya"
                  disabled={page === 1}
                  onClick={() => goToPage(page - 1)}
                >
                  <ChevronLeft size={18} />
                </button>
                {pageList(page, pages).map((p, i) =>
                  p === '…' ? (
                    <span key={`gap-${i}`} className="req-pager__gap">
                      …
                    </span>
                  ) : (
                    <button
                      key={p}
                      type="button"
                      className={`req-pager__page${p === page ? ' is-active' : ''}`}
                      aria-label={`Halaman ${p}`}
                      aria-current={p === page ? 'page' : undefined}
                      onClick={() => goToPage(p)}
                    >
                      {p}
                    </button>
                  ),
                )}
                <button
                  type="button"
                  className="req-pager__arrow"
                  aria-label="Halaman berikutnya"
                  disabled={page === pages}
                  onClick={() => goToPage(page + 1)}
                >
                  <ChevronRight size={18} />
                </button>
              </nav>
            </div>
          )}
        </div>

        <div className="req-aside" ref={detailRef}>
          {selected ? (
            <Detail req={selected} onCancel={() => setCancelling(selected)} />
          ) : (
            <section className="req-detail req-detail--empty">Pilih permohonan untuk melihat detailnya.</section>
          )}
        </div>
      </div>

      {cancelling && (
        <Modal
          title="Batalkan Permohonan"
          onClose={() => setCancelling(null)}
          footer={
            <>
              <button type="button" className="btn btn--ghost" onClick={() => setCancelling(null)}>
                Kembali
              </button>
              <button type="button" className="btn btn--red" onClick={confirmCancel}>
                <CircleX size={16} aria-hidden="true" /> Batalkan Permohonan
              </button>
            </>
          }
        >
          <p className="dlg-title">{cancelling.title}</p>
          <p className="req-confirm">
            Permohonan {cancelling.no} akan dibatalkan dan dihapus dari daftar Anda. Tindakan ini tidak dapat diurungkan.
          </p>
        </Modal>
      )}
    </main>
  )
}
