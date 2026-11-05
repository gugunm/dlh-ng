import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import {
  BookMarked,
  Building2,
  CircleCheck,
  Hourglass,
  ListChecks,
  ShieldCheck,
  TriangleAlert,
} from 'lucide-react'
import { DsStatusBadge, SummaryCard, WelcomeBand } from '../components/RoleBits'
import { Modal } from '../components/Modal'
import { useToast } from '../components/Toast'
import { USER } from '../hooks/useAuth'
import { useWorkflow, type QueueItem, type QueueStatus } from '../hooks/useWorkflow'
import { fmtDate } from '../lib/format'

type Tab = 'Semua' | QueueStatus

const COMPLIANCE: [string, number][] = [
  ['Metadata lengkap', 92],
  ['Sesuai standar data', 87],
  ['Kode referensi terpetakan', 78],
  ['Interoperabilitas (API tersedia)', 64],
]
const SDI = ['Standar Data', 'Metadata', 'Kode Referensi', 'Interoperabilitas']
const CHECKS = ['Metadata lengkap', 'Sesuai standar data', 'Kode referensi terpetakan', 'Interoperabilitas (API tersedia)']
const ROW_LIMIT = 6

function ReviewDialog({ item, onClose }: { item: QueueItem; onClose: () => void }) {
  const { decide } = useWorkflow()
  const toast = useToast()
  const [checked, setChecked] = useState<boolean[]>(CHECKS.map(() => false))
  const [note, setNote] = useState('')
  const [error, setError] = useState('')
  const all = checked.every(Boolean)

  const revise = () => {
    if (note.trim().length < 10) return setError('Tuliskan catatan revisi (minimal 10 karakter) untuk Produsen Data.')
    decide(item.id, 'revise', note.trim())
    toast.show('Dataset dikembalikan ke Produsen Data untuk direvisi.', 'info')
    onClose()
  }
  const approve = () => {
    decide(item.id, 'approve')
    toast.show('Dataset diverifikasi dan dipublikasikan.', 'success')
    onClose()
  }

  return (
    <Modal
      title="Periksa Dataset"
      onClose={onClose}
      width={600}
      footer={
        <>
          <button type="button" className="btn btn--ghost" onClick={onClose}>
            Tutup
          </button>
          <button type="button" className="btn btn--outline" onClick={revise}>
            Minta Revisi
          </button>
          <button type="button" className="btn btn--red" disabled={!all} onClick={approve} title={all ? undefined : 'Centang seluruh butir pemeriksaan terlebih dahulu'}>
            Setujui &amp; Publikasikan
          </button>
        </>
      }
    >
      <h3 className="review-title">{item.title}</h3>
      <dl className="dlg-dl">
        <div>
          <dt>Produsen Data</dt>
          <dd>{item.producer}</dd>
        </div>
        <div>
          <dt>Diajukan</dt>
          <dd>{fmtDate(item.date)}</dd>
        </div>
      </dl>
      <fieldset className="review-checks">
        <legend>Butir pemeriksaan</legend>
        {CHECKS.map((c, i) => (
          <label className="check" key={c}>
            <input
              type="checkbox"
              checked={checked[i]}
              onChange={(e) => setChecked((s) => s.map((v, k) => (k === i ? e.target.checked : v)))}
            />
            {c}
          </label>
        ))}
      </fieldset>
      <div className="field">
        <label className="field__label" htmlFor="rev-note">
          Catatan untuk Produsen Data
        </label>
        <textarea
          id="rev-note"
          rows={3}
          value={note}
          aria-invalid={!!error}
          placeholder="Wajib diisi bila meminta revisi."
          onChange={(e) => {
            setNote(e.target.value)
            setError('')
          }}
        />
        {error && (
          <p className="field__error" role="alert">
            {error}
          </p>
        )}
      </div>
    </Modal>
  )
}

export default function BerandaWalidata() {
  const wf = useWorkflow()
  const toast = useToast()
  const location = useLocation()
  const [tab, setTab] = useState<Tab>('Semua')
  const [all, setAll] = useState(false)
  const [reviewId, setReviewId] = useState<string | null>(null)

  useEffect(() => {
    if (!location.hash) return
    const el = document.getElementById(location.hash.slice(1))
    if (el) window.setTimeout(() => el.scrollIntoView({ behavior: 'smooth', block: 'start' }), 40)
  }, [location.hash, location.key])

  const c = wf.walidataCounts
  const totalQueue = c.Menunggu + c['Sedang Diperiksa']
  const filtered = wf.queue.filter((q) => tab === 'Semua' || q.status === tab)
  const rows = all ? filtered : filtered.slice(0, ROW_LIMIT)
  const reviewItem = wf.queue.find((q) => q.id === reviewId)

  const go = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  const periksa = (q: QueueItem) => {
    wf.startReview(q.id)
    setReviewId(q.id)
  }
  const tabs: [Tab, string][] = [
    ['Semua', `Semua (${totalQueue})`],
    ['Menunggu', `Menunggu (${c.Menunggu})`],
    ['Sedang Diperiksa', `Sedang Diperiksa (${c['Sedang Diperiksa']})`],
  ]

  return (
    <main>
      <WelcomeBand
        eyebrow="BERANDA · WALIDATA"
        name={USER.name}
        desc="Verifikasi dan validasi dataset dari Produsen Data, serta pastikan standar data, metadata, dan kode referensi diterapkan secara konsisten."
        actions={
          <>
            <button type="button" className="btn btn--red btn--lg" onClick={() => go('antrean')}>
              <ListChecks size={18} /> Buka Antrean Verifikasi
            </button>
            <button type="button" className="btn btn--outline-dark btn--lg" onClick={() => go('standar')}>
              <BookMarked size={18} /> Kelola Standar &amp; Metadata
            </button>
          </>
        }
      />

      <section className="section summary" aria-label="Ringkasan verifikasi">
        <div className="section__head">
          <div className="title-group">
            <span className="title-bar" />
            <h2 className="section__title">Ringkasan Verifikasi</h2>
          </div>
          <span className="summary__total">1.248 dataset dalam katalog</span>
        </div>
        <div className="sum-grid">
          <SummaryCard icon={Hourglass} tone="sky" value={totalQueue} label="Menunggu Verifikasi" onClick={() => { setTab('Semua'); setAll(false); go('antrean') }} />
          <SummaryCard icon={TriangleAlert} tone="red" value={c.revisi} label="Perlu Revisi dari Produsen" />
          <SummaryCard icon={CircleCheck} tone="green" value={c.bulanIni} label="Dipublikasikan Bulan Ini" />
          <SummaryCard icon={Building2} tone="neutral" value={38} label="Produsen Data Aktif" />
        </div>
      </section>

      <section className="section role-main">
        <div className="role-main__left" id="antrean">
          <div className="title-group">
            <span className="title-bar" />
            <h2 className="section__title">Antrean Verifikasi</h2>
          </div>
          <div className="tabs" role="tablist" aria-label="Filter antrean">
            {tabs.map(([t, label]) => (
              <button key={t} type="button" role="tab" aria-selected={tab === t} className={`pill${tab === t ? ' is-active' : ''}`} onClick={() => { setTab(t); setAll(false) }}>
                {label}
              </button>
            ))}
          </div>
          <div className="table" role="table" aria-label="Antrean verifikasi">
            <div className="table__head" role="row">
              <span role="columnheader">Judul Dataset</span>
              <span className="col-190" role="columnheader">Produsen Data</span>
              <span className="col-90" role="columnheader">Diajukan</span>
              <span className="col-150" role="columnheader">Status</span>
              <span className="col-70" role="columnheader">Aksi</span>
            </div>
            {rows.length === 0 && <div className="table__empty">Antrean kosong. Tidak ada dataset yang menunggu pemeriksaan.</div>}
            {rows.map((q) => (
              <div className="table__row" role="row" key={q.id}>
                <span className="table__title" role="cell">{q.title}</span>
                <span className="table__muted col-190" role="cell">{q.producer}</span>
                <span className="table__muted col-90" role="cell">{fmtDate(q.date).replace(/ \d{4}$/, '')}</span>
                <span className="col-150" role="cell">
                  <DsStatusBadge status={q.status} />
                </span>
                <span className="col-70" role="cell">
                  <button type="button" className="link-btn" onClick={() => periksa(q)}>
                    Periksa
                  </button>
                </span>
              </div>
            ))}
          </div>
          <button
            type="button"
            className="see-all"
            onClick={() => (filtered.length > ROW_LIMIT ? setAll((v) => !v) : toast.show('Seluruh antrean sudah ditampilkan.', 'info'))}
          >
            {all ? 'Tampilkan lebih sedikit' : 'Lihat seluruh antrean'}
          </button>
        </div>

        <aside className="role-main__right" id="standar">
          <section className="side-card" aria-label="Kepatuhan dataset terbit">
            <h3>
              <ShieldCheck size={18} /> Kepatuhan Dataset Terbit
            </h3>
            <ul className="bars">
              {COMPLIANCE.map(([label, v]) => (
                <li key={label}>
                  <div>
                    <span>{label}</span>
                    <strong>{v}%</strong>
                  </div>
                  <span className="bars__track" role="progressbar" aria-valuenow={v} aria-valuemin={0} aria-valuemax={100} aria-label={label}>
                    <span style={{ width: `${v}%` }} />
                  </span>
                </li>
              ))}
            </ul>
          </section>
          <section className="side-card side-card--surface" aria-label="Kelola Satu Data Indonesia">
            <h3>Kelola Prinsip Satu Data Indonesia</h3>
            <ul className="guide-links">
              {SDI.map((g) => (
                <li key={g}>
                  <button type="button" onClick={() => toast.show(`Halaman “${g}” belum tersedia pada prototipe ini.`, 'info')}>
                    {g}
                  </button>
                </li>
              ))}
            </ul>
          </section>
        </aside>
      </section>

      {reviewItem && <ReviewDialog key={reviewItem.id} item={reviewItem} onClose={() => setReviewId(null)} />}
    </main>
  )
}
