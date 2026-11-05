import { useEffect, useRef, useState, type FormEvent } from 'react'
import { useLocation } from 'react-router-dom'
import {
  BellRing,
  Building2,
  CircleCheck,
  Clock,
  FilePenLine,
  FileSpreadsheet,
  Plus,
  TriangleAlert,
  Upload,
} from 'lucide-react'
import { DsStatusBadge, SummaryCard, WelcomeBand } from '../components/RoleBits'
import { Modal } from '../components/Modal'
import { useToast } from '../components/Toast'
import { TOPIK_OPTIONS } from '../data/catalog'
import { USER, useAuth } from '../hooks/useAuth'
import { PRODUCER_BASE, useWorkflow, type DsStatus, type ProducerDataset } from '../hooks/useWorkflow'
import { fmtDate, fmtDateLong } from '../lib/format'

type Dialog =
  | { kind: 'form'; id?: string }
  | { kind: 'upload' }
  | { kind: 'view'; id: string }
  | null

const TABS: ('Semua' | DsStatus)[] = ['Semua', 'Draf', 'Menunggu Verifikasi', 'Perlu Revisi', 'Dipublikasikan']
const ACTION: Record<DsStatus, string> = {
  Dipublikasikan: 'Edit',
  'Perlu Revisi': 'Perbaiki',
  'Menunggu Verifikasi': 'Lihat',
  Draf: 'Lanjutkan',
}
const GUIDES = ['Standar Data', 'Templat Metadata', 'Kode Referensi']
const ROW_LIMIT = 6

function DatasetFormDialog({ id, onClose }: { id?: string; onClose: () => void }) {
  const { datasets, saveDataset } = useWorkflow()
  const toast = useToast()
  const existing = datasets.find((d) => d.id === id)
  const [title, setTitle] = useState(existing?.title ?? '')
  const [topik, setTopik] = useState(existing?.topik ?? TOPIK_OPTIONS[0])
  const [sifat, setSifat] = useState<ProducerDataset['sifat']>(existing?.sifat ?? 'Terbuka')
  const [description, setDescription] = useState(existing?.description ?? '')
  const [errors, setErrors] = useState<{ title?: string; description?: string }>({})
  const [attempted, setAttempted] = useState(false)

  const validate = (forSubmit: boolean) => {
    const e: typeof errors = {}
    if (title.trim().length < 8) e.title = 'Judul dataset minimal 8 karakter.'
    if (forSubmit && description.trim().length < 20) e.description = 'Deskripsi wajib diisi (minimal 20 karakter) sebelum diajukan.'
    setErrors(e)
    setAttempted(true)
    return Object.keys(e).length === 0
  }

  const save = (submit: boolean) => {
    if (!validate(submit)) return
    saveDataset({ id, title: title.trim(), topik, sifat, description: description.trim() }, submit)
    toast.show(
      submit
        ? 'Dataset diajukan ke Walidata untuk diverifikasi.'
        : existing?.status === 'Dipublikasikan'
          ? 'Perubahan dataset disimpan.'
          : 'Draf dataset disimpan.',
      'success',
    )
    onClose()
  }

  const heading = !existing ? 'Tambah Dataset' : existing.status === 'Perlu Revisi' ? 'Perbaiki Dataset' : 'Ubah Dataset'
  const published = existing?.status === 'Dipublikasikan'

  return (
    <Modal
      title={heading}
      onClose={onClose}
      width={600}
      footer={
        <>
          <button type="button" className="btn btn--ghost" onClick={onClose}>
            Batal
          </button>
          <button type="button" className="btn btn--outline" onClick={() => save(false)}>
            {published ? 'Simpan Perubahan' : 'Simpan Draf'}
          </button>
          <button type="button" className="btn btn--red" onClick={() => save(true)}>
            {published ? 'Ajukan Verifikasi Ulang' : 'Ajukan Verifikasi'}
          </button>
        </>
      }
    >
      <form className="form" onSubmit={(e: FormEvent) => e.preventDefault()} noValidate>
        {existing?.status === 'Perlu Revisi' && existing.note && (
          <p className="dlg-note dlg-note--red">
            <strong>Catatan Walidata:</strong> {existing.note}
          </p>
        )}
        <div className="field">
          <label className="field__label" htmlFor="ds-title">
            Judul Dataset
          </label>
          <input
            id="ds-title"
            value={title}
            aria-invalid={!!errors.title}
            onChange={(e) => {
              setTitle(e.target.value)
              if (attempted) setErrors((s) => ({ ...s, title: undefined }))
            }}
            placeholder="Contoh: Realisasi Belanja Dana Desa Tahun 2026"
          />
          {errors.title && (
            <p className="field__error" role="alert">
              {errors.title}
            </p>
          )}
        </div>
        <div className="field-row">
          <div className="field">
            <label className="field__label" htmlFor="ds-topik">
              Topik
            </label>
            <select id="ds-topik" value={topik} onChange={(e) => setTopik(e.target.value)}>
              {[...new Set([...TOPIK_OPTIONS, topik])].map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
          </div>
          <div className="field">
            <label className="field__label" htmlFor="ds-sifat">
              Sifat Data
            </label>
            <select id="ds-sifat" value={sifat} onChange={(e) => setSifat(e.target.value as ProducerDataset['sifat'])}>
              <option>Terbuka</option>
              <option>Terbatas</option>
            </select>
          </div>
        </div>
        <div className="field">
          <label className="field__label" htmlFor="ds-desc">
            Deskripsi
          </label>
          <textarea
            id="ds-desc"
            rows={4}
            value={description}
            aria-invalid={!!errors.description}
            onChange={(e) => {
              setDescription(e.target.value)
              if (attempted) setErrors((s) => ({ ...s, description: undefined }))
            }}
            placeholder="Jelaskan isi, cakupan, dan satuan data."
          />
          {errors.description && (
            <p className="field__error" role="alert">
              {errors.description}
            </p>
          )}
        </div>
      </form>
    </Modal>
  )
}

function UploadDialog({ onClose }: { onClose: () => void }) {
  const { saveDataset } = useWorkflow()
  const toast = useToast()
  const [file, setFile] = useState<File | null>(null)
  const [rows, setRows] = useState<number | null>(null)
  const [error, setError] = useState('')
  const input = useRef<HTMLInputElement>(null)

  const pick = (f: File | undefined) => {
    setError('')
    setRows(null)
    if (!f) return setFile(null)
    if (!/\.(csv|xlsx)$/i.test(f.name)) {
      setFile(null)
      return setError('Format berkas harus CSV atau XLSX.')
    }
    if (f.size > 5 * 1024 * 1024) {
      setFile(null)
      return setError('Ukuran berkas maksimal 5 MB.')
    }
    setFile(f)
    if (/\.csv$/i.test(f.name)) {
      f.text().then((t) => setRows(Math.max(0, t.split(/\r?\n/).filter(Boolean).length - 1)))
    }
  }

  const submit = () => {
    if (!file) return setError('Pilih berkas CSV atau XLSX terlebih dahulu.')
    const title = file.name.replace(/\.(csv|xlsx)$/i, '').replace(/[_-]+/g, ' ').trim()
    saveDataset({ title: title.charAt(0).toUpperCase() + title.slice(1) })
    toast.show('Berkas diunggah dan disimpan sebagai draf dataset.', 'success')
    onClose()
  }

  return (
    <Modal
      title="Unggah Data (CSV / XLSX)"
      onClose={onClose}
      width={520}
      footer={
        <>
          <button type="button" className="btn btn--ghost" onClick={onClose}>
            Batal
          </button>
          <button type="button" className="btn btn--red" onClick={submit}>
            <Upload size={16} /> Unggah &amp; Simpan Draf
          </button>
        </>
      }
    >
      <div className="field">
        <label className="field__label" htmlFor="upload-file">
          Berkas data
        </label>
        <input
          id="upload-file"
          ref={input}
          type="file"
          accept=".csv,.xlsx"
          aria-invalid={!!error}
          onChange={(e) => pick(e.target.files?.[0])}
        />
        <p className="field__hint">Format CSV atau XLSX, maksimal 5 MB. Gunakan templat metadata dari Panduan Produsen Data.</p>
        {error && (
          <p className="field__error" role="alert">
            {error}
          </p>
        )}
      </div>
      {file && (
        <p className="upload-ok" role="status">
          <FileSpreadsheet size={18} />
          <span>
            <strong>{file.name}</strong>
            {rows !== null ? ` — ${rows} baris data terdeteksi` : ''}
          </span>
        </p>
      )}
    </Modal>
  )
}

function ViewDialog({ id, onClose }: { id: string; onClose: () => void }) {
  const { datasets, withdraw } = useWorkflow()
  const toast = useToast()
  const d = datasets.find((x) => x.id === id)
  if (!d) return null
  return (
    <Modal
      title={d.title}
      onClose={onClose}
      width={560}
      footer={
        <>
          <button type="button" className="btn btn--ghost" onClick={onClose}>
            Tutup
          </button>
          {d.status === 'Menunggu Verifikasi' && (
            <button
              type="button"
              className="btn btn--outline"
              onClick={() => {
                withdraw(d.id)
                toast.show('Pengajuan ditarik. Dataset kembali menjadi draf.', 'info')
                onClose()
              }}
            >
              Tarik Pengajuan
            </button>
          )}
        </>
      }
    >
      <div className="dlg-meta">
        <DsStatusBadge status={d.status} />
        <span className={`badge ${d.sifat === 'Terbuka' ? 'badge--green' : 'badge--red'}`}>{d.sifat}</span>
      </div>
      <dl className="dlg-dl">
        <div>
          <dt>Topik</dt>
          <dd>{d.topik}</dd>
        </div>
        <div>
          <dt>Diperbarui</dt>
          <dd>{fmtDateLong(d.date)}</dd>
        </div>
      </dl>
      {d.status === 'Menunggu Verifikasi' && (
        <p className="dlg-note">Dataset sedang menunggu pemeriksaan Walidata. Anda dapat menarik pengajuan untuk mengubahnya.</p>
      )}
      {d.description && <p className="dlg-desc">{d.description}</p>}
    </Modal>
  )
}

export default function BerandaProdusen() {
  const { role } = useAuth()
  const wf = useWorkflow()
  const toast = useToast()
  const location = useLocation()
  const [tab, setTab] = useState<(typeof TABS)[number]>('Semua')
  const [all, setAll] = useState(false)
  const [dialog, setDialog] = useState<Dialog>(null)

  useEffect(() => {
    if (!location.hash) return
    const el = document.getElementById(location.hash.slice(1))
    if (el) window.setTimeout(() => el.scrollIntoView({ behavior: 'smooth', block: 'start' }), 40)
  }, [location.hash, location.key])

  const total = (Object.keys(PRODUCER_BASE) as DsStatus[]).reduce((n, k) => n + wf.producerCounts[k], 0)
  const filtered = wf.datasets.filter((d) => tab === 'Semua' || d.status === tab)
  const rows = all ? filtered : filtered.slice(0, ROW_LIMIT)

  const open = (d: ProducerDataset) =>
    setDialog(d.status === 'Menunggu Verifikasi' ? { kind: 'view', id: d.id } : { kind: 'form', id: d.id })

  const revisions = wf.datasets.filter((d) => d.status === 'Perlu Revisi')
  const dueDraft = wf.datasets.find((d) => d.id === 'pd5' && d.status === 'Draf')
  const metaPending = wf.datasets.find((d) => d.id === 'pd6' && d.status !== 'Dipublikasikan')
  const tasks = [
    ...revisions.map((d) => ({
      key: `r-${d.id}`,
      title: 'Revisi dari Walidata',
      text: `${d.title} — ${d.note ?? 'perlu perbaikan sebelum dapat dipublikasikan.'}`,
      date: d.date,
      d,
    })),
    ...(dueDraft ? [{ key: 'due', title: 'Jatuh tempo pemutakhiran', text: `${dueDraft.title} perlu diperbarui.`, date: '2026-11-30', d: dueDraft }] : []),
    ...(metaPending ? [{ key: 'meta', title: 'Metadata belum lengkap', text: `${metaPending.title}.`, date: '2026-11-01', d: metaPending }] : []),
  ]

  const showTab = (t: (typeof TABS)[number]) => {
    setTab(t)
    setAll(false)
  }
  const jump = (t: (typeof TABS)[number]) => {
    showTab(t)
    document.getElementById('dataset-saya')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <main>
      <WelcomeBand
        eyebrow="BERANDA · PRODUSEN DATA"
        name={USER.name}
        desc="Kelola dataset unit kerja Anda, pantau hasil verifikasi Walidata, dan pastikan data tetap mutakhir sesuai jadwal pemutakhiran."
        chip={
          <p className="welcome__chip">
            <Building2 size={16} /> {USER.unit}
          </p>
        }
        actions={
          <>
            <button type="button" className="btn btn--red btn--lg" onClick={() => setDialog({ kind: 'form' })}>
              <Plus size={18} /> Tambah Dataset
            </button>
            <button type="button" className="btn btn--outline-dark btn--lg" onClick={() => setDialog({ kind: 'upload' })}>
              <Upload size={18} /> Unggah Data (CSV / XLSX)
            </button>
          </>
        }
      />

      <section className="section summary" aria-label="Status dataset">
        <div className="section__head">
          <div className="title-group">
            <span className="title-bar" />
            <h2 className="section__title">Status Dataset Saya</h2>
          </div>
          <span className="summary__total">{total} dataset</span>
        </div>
        <div className="sum-grid">
          <SummaryCard icon={FilePenLine} tone="neutral" value={wf.producerCounts.Draf} label="Draf" onClick={() => jump('Draf')} pressed={tab === 'Draf'} />
          <SummaryCard icon={Clock} tone="sky" value={wf.producerCounts['Menunggu Verifikasi']} label="Menunggu Verifikasi" onClick={() => jump('Menunggu Verifikasi')} pressed={tab === 'Menunggu Verifikasi'} />
          <SummaryCard icon={TriangleAlert} tone="red" value={wf.producerCounts['Perlu Revisi']} label="Perlu Revisi" onClick={() => jump('Perlu Revisi')} pressed={tab === 'Perlu Revisi'} />
          <SummaryCard icon={CircleCheck} tone="green" value={wf.producerCounts.Dipublikasikan} label="Dipublikasikan" onClick={() => jump('Dipublikasikan')} pressed={tab === 'Dipublikasikan'} />
        </div>
      </section>

      <section className="section role-main">
        <div className="role-main__left" id="dataset-saya">
          <div className="title-group">
            <span className="title-bar" />
            <h2 className="section__title">Dataset Saya</h2>
          </div>
          <div className="tabs" role="tablist" aria-label="Filter status">
            {TABS.map((t) => (
              <button key={t} type="button" role="tab" aria-selected={tab === t} className={`pill${tab === t ? ' is-active' : ''}`} onClick={() => showTab(t)}>
                {t}
              </button>
            ))}
          </div>
          <div className="table" role="table" aria-label="Dataset saya">
            <div className="table__head" role="row">
              <span role="columnheader">Judul Dataset</span>
              <span className="col-170" role="columnheader">Status</span>
              <span className="col-110" role="columnheader">Diperbarui</span>
              <span className="col-90" role="columnheader">Aksi</span>
            </div>
            {rows.length === 0 && <div className="table__empty">Tidak ada dataset dengan status “{tab}”.</div>}
            {rows.map((d) => (
              <div className="table__row" role="row" key={d.id}>
                <span className="table__title" role="cell">{d.title}</span>
                <span className="col-170" role="cell">
                  <DsStatusBadge status={d.status} />
                </span>
                <span className="table__muted col-110" role="cell">{fmtDate(d.date)}</span>
                <span className="col-90" role="cell">
                  <button type="button" className="link-btn" onClick={() => open(d)}>
                    {ACTION[d.status]}
                  </button>
                </span>
              </div>
            ))}
          </div>
          {filtered.length > ROW_LIMIT && (
            <button type="button" className="see-all" onClick={() => setAll((v) => !v)}>
              {all ? 'Tampilkan lebih sedikit' : 'Lihat semua dataset saya'}
            </button>
          )}
          {filtered.length <= ROW_LIMIT && tab === 'Semua' && (
            <button type="button" className="see-all" onClick={() => toast.show('Seluruh dataset sudah ditampilkan.', 'info')}>
              Lihat semua dataset saya
            </button>
          )}
        </div>

        <aside className="role-main__right">
          <section className="side-card side-card--surface" aria-label="Perlu tindakan">
            <h3>
              <BellRing size={18} /> Perlu Tindakan
            </h3>
            {tasks.length === 0 ? (
              <p className="side-card__empty">Tidak ada tindakan yang tertunda.</p>
            ) : (
              <ul className="tasks">
                {tasks.map((t) => (
                  <li key={t.key}>
                    <button type="button" onClick={() => open(t.d)}>
                      <strong>{t.title}</strong>
                      <span>{t.text}</span>
                      <em>{fmtDate(t.date)}</em>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </section>
          <section className="side-card" id="panduan" aria-label="Panduan produsen data">
            <h3>Panduan Produsen Data</h3>
            <ul className="guide-links">
              {GUIDES.map((g) => (
                <li key={g}>
                  <button type="button" onClick={() => toast.show(`Dokumen “${g}” belum tersedia pada prototipe ini.`, 'info')}>
                    {g}
                  </button>
                </li>
              ))}
            </ul>
          </section>
        </aside>
      </section>

      {role === 'Produsen Data' && dialog?.kind === 'form' && <DatasetFormDialog key={dialog.id ?? 'new'} id={dialog.id} onClose={() => setDialog(null)} />}
      {dialog?.kind === 'upload' && <UploadDialog onClose={() => setDialog(null)} />}
      {dialog?.kind === 'view' && <ViewDialog id={dialog.id} onClose={() => setDialog(null)} />}
    </main>
  )
}
