import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type FormEvent,
  type ReactNode,
} from 'react'
import { useNavigate } from 'react-router-dom'
import { Calendar, CircleCheck, Clock, Download, FilePenLine, Circle } from 'lucide-react'
import { Modal } from './Modal'
import { AccessBadge, StatusBadge } from './Badges'
import { useToast } from './Toast'
import { CATALOG, itemById, type CatalogItem } from '../data/catalog'
import { useRequests, type InfoRequest } from '../hooks/useRequests'
import { downloadTextFile, fmtDate, fmtDateLong, slug } from '../lib/format'

type Dialog =
  | { kind: 'item'; id: string }
  | { kind: 'form'; itemId?: string }
  | { kind: 'status'; id: string }
  | null

interface DialogApi {
  openItem: (id: string) => void
  openRequestForm: (itemId?: string) => void
  openStatus: (requestId: string) => void
  downloadItem: (item: CatalogItem) => void
  close: () => void
}

const DialogContext = createContext<DialogApi | null>(null)

export const useDialogs = () => {
  const ctx = useContext(DialogContext)
  if (!ctx) throw new Error('useDialogs must be used inside DialogProvider')
  return ctx
}

export function DialogProvider({ children }: { children: ReactNode }) {
  const [dialog, setDialog] = useState<Dialog>(null)
  const toast = useToast()

  const close = useCallback(() => setDialog(null), [])
  const downloadItem = useCallback(
    (item: CatalogItem) => {
      const csv = [
        'atribut,nilai',
        `judul,"${item.title}"`,
        `jenis,${item.type}`,
        `topik,${item.topik}`,
        `tahun,${item.tahun}`,
        `sifat,${item.sifat}`,
        'catatan,"Berkas contoh untuk pengujian prototipe UX"',
      ].join('\n')
      downloadTextFile(`${slug(item.title)}.csv`, csv, 'text/csv')
      toast.show('Berkas contoh diunduh.', 'info')
    },
    [toast],
  )

  const api = useMemo<DialogApi>(
    () => ({
      openItem: (id) => setDialog({ kind: 'item', id }),
      openRequestForm: (itemId) => setDialog({ kind: 'form', itemId }),
      openStatus: (id) => setDialog({ kind: 'status', id }),
      downloadItem,
      close,
    }),
    [downloadItem, close],
  )

  return (
    <DialogContext.Provider value={api}>
      {children}
      {dialog?.kind === 'item' && <ItemDialog id={dialog.id} />}
      {dialog?.kind === 'form' && <RequestFormDialog itemId={dialog.itemId} />}
      {dialog?.kind === 'status' && <StatusDialog id={dialog.id} />}
    </DialogContext.Provider>
  )
}

function ItemDialog({ id }: { id: string }) {
  const item = itemById(id)
  const { close, openRequestForm, openStatus, downloadItem } = useDialogs()
  const { forItem } = useRequests()
  const navigate = useNavigate()
  if (!item) return null
  const req = item.sifat === 'Terbatas' ? forItem(item.id) : undefined

  const searchTag = (tag: string) => {
    close()
    navigate(`/dataset?q=${encodeURIComponent(tag)}`)
  }

  let actions: ReactNode
  if (item.sifat === 'Terbuka' || req?.status === 'Disetujui') {
    actions = (
      <button type="button" className="btn btn--primary" onClick={() => downloadItem(item)}>
        <Download size={16} /> Unduh Data
      </button>
    )
  } else if (req?.status === 'Diproses') {
    actions = (
      <button type="button" className="btn btn--outline" onClick={() => openStatus(req.id)}>
        <Clock size={16} /> Lihat Status Permohonan
      </button>
    )
  } else if (req?.status === 'Ditolak') {
    actions = (
      <>
        <button type="button" className="btn btn--outline" onClick={() => openStatus(req.id)}>
          Lihat Alasan
        </button>
        <button type="button" className="btn btn--red" onClick={() => openRequestForm(item.id)}>
          <FilePenLine size={16} /> Ajukan Ulang
        </button>
      </>
    )
  } else {
    actions = (
      <button type="button" className="btn btn--red" onClick={() => openRequestForm(item.id)}>
        <FilePenLine size={16} /> Ajukan Permohonan
      </button>
    )
  }

  return (
    <Modal
      title={item.title}
      onClose={close}
      width={640}
      footer={
        <>
          <button type="button" className="btn btn--ghost" onClick={close}>
            Tutup
          </button>
          {actions}
        </>
      }
    >
      <div className="dlg-meta">
        <span className="badge badge--blue">{item.type}</span>
        <AccessBadge sifat={item.sifat} />
        <span className="dlg-date">
          <Calendar size={14} /> {fmtDate(item.date)}
        </span>
      </div>
      <p className="dlg-desc">{item.description}</p>
      {item.sifat === 'Terbatas' && !req && (
        <p className="dlg-note">
          Data ini bersifat terbatas. Ajukan permohonan informasi untuk memperoleh akses.
        </p>
      )}
      <dl className="dlg-dl">
        <div>
          <dt>Topik</dt>
          <dd>{item.topik}</dd>
        </div>
        <div>
          <dt>Sumber</dt>
          <dd>{item.source}</dd>
        </div>
        <div>
          <dt>Tahun data</dt>
          <dd>{item.tahun}</dd>
        </div>
        <div>
          <dt>Tanggal rilis</dt>
          <dd>{fmtDateLong(item.date)}</dd>
        </div>
      </dl>
      <div className="tags">
        {item.tags.map((t) => (
          <button key={t} type="button" className="tag" onClick={() => searchTag(t)}>
            {t}
          </button>
        ))}
      </div>
    </Modal>
  )
}

function RequestFormDialog({ itemId }: { itemId?: string }) {
  const { close } = useDialogs()
  const { requests, add } = useRequests()
  const toast = useToast()
  const navigate = useNavigate()

  const options = useMemo(() => {
    const blocked = new Set(
      requests.filter((r) => r.status !== 'Ditolak').map((r) => r.itemId),
    )
    return CATALOG.filter((c) => c.sifat === 'Terbatas' && (!blocked.has(c.id) || c.id === itemId))
  }, [requests, itemId])

  const [selected, setSelected] = useState(itemId && options.some((o) => o.id === itemId) ? itemId : '')
  const [unit, setUnit] = useState('')
  const [purpose, setPurpose] = useState('')
  const [agree, setAgree] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const errors = {
    selected: selected ? '' : 'Pilih dataset yang akan dimohonkan.',
    unit: unit.trim() ? '' : 'Isi unit kerja atau instansi Anda.',
    purpose:
      purpose.trim().length >= 20 ? '' : 'Jelaskan tujuan penggunaan data minimal 20 karakter.',
    agree: agree ? '' : 'Centang pernyataan untuk melanjutkan.',
  }
  const valid = Object.values(errors).every((e) => !e)

  const onSubmit = (e: FormEvent) => {
    e.preventDefault()
    setSubmitted(true)
    if (!valid) return
    const item = itemById(selected)
    if (!item) return
    add({ itemId: item.id, title: item.title, purpose: purpose.trim(), unit: unit.trim() })
    close()
    toast.show('Permohonan diajukan. Pantau statusnya di “Permohonan Informasi Saya”.')
    navigate({ pathname: '/', hash: '#permohonan' })
  }

  const showErr = (k: keyof typeof errors) =>
    submitted && errors[k] ? (
      <span className="field__error" role="alert">
        {errors[k]}
      </span>
    ) : null

  return (
    <Modal title="Ajukan Permohonan Informasi" onClose={close} width={600}>
      <form className="form" onSubmit={onSubmit} noValidate>
        <label className="field">
          <span className="field__label">Dataset terbatas</span>
          <select
            value={selected}
            onChange={(e) => setSelected(e.target.value)}
            aria-invalid={submitted && !!errors.selected}
          >
            <option value="">Pilih dataset…</option>
            {options.map((o) => (
              <option key={o.id} value={o.id}>
                {o.title}
              </option>
            ))}
          </select>
          {showErr('selected')}
        </label>
        <label className="field">
          <span className="field__label">Unit kerja / instansi</span>
          <input
            value={unit}
            onChange={(e) => setUnit(e.target.value)}
            placeholder="Contoh: Inspektorat Provinsi DKI Jakarta"
            aria-invalid={submitted && !!errors.unit}
          />
          {showErr('unit')}
        </label>
        <label className="field">
          <span className="field__label">Tujuan penggunaan data</span>
          <textarea
            rows={4}
            value={purpose}
            onChange={(e) => setPurpose(e.target.value)}
            placeholder="Jelaskan kegiatan, periode, dan manfaat penggunaan data."
            aria-invalid={submitted && !!errors.purpose}
          />
          <span className="field__hint">{purpose.trim().length} karakter</span>
          {showErr('purpose')}
        </label>
        <label className="check">
          <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} />
          <span>Saya menyatakan data hanya digunakan sesuai tujuan di atas.</span>
        </label>
        {showErr('agree')}
        <div className="form__actions">
          <button type="button" className="btn btn--ghost" onClick={close}>
            Batal
          </button>
          <button type="submit" className="btn btn--red">
            <FilePenLine size={16} /> Kirim Permohonan
          </button>
        </div>
      </form>
    </Modal>
  )
}

function StatusDialog({ id }: { id: string }) {
  const { requests } = useRequests()
  const { close, openRequestForm, downloadItem } = useDialogs()
  const req: InfoRequest | undefined = requests.find((r) => r.id === id)
  if (!req) return null
  const item = itemById(req.itemId)

  const steps: { label: string; note: string; state: 'done' | 'current' | 'todo' }[] = [
    { label: 'Permohonan diajukan', note: fmtDateLong(req.date), state: 'done' },
    {
      label: 'Verifikasi unit produsen data',
      note: req.status === 'Diproses' ? 'Sedang berlangsung' : 'Selesai',
      state: req.status === 'Diproses' ? 'current' : 'done',
    },
    {
      label: req.status === 'Ditolak' ? 'Permohonan ditolak' : 'Keputusan permohonan',
      note:
        req.status === 'Diproses'
          ? 'Menunggu verifikasi'
          : req.status === 'Disetujui'
            ? 'Disetujui — data dapat diunduh'
            : 'Lihat alasan di bawah',
      state: req.status === 'Diproses' ? 'todo' : 'done',
    },
  ]

  return (
    <Modal
      title={req.status === 'Ditolak' ? 'Alasan Penolakan' : 'Status Permohonan'}
      onClose={close}
      footer={
        <>
          <button type="button" className="btn btn--ghost" onClick={close}>
            Tutup
          </button>
          {req.status === 'Disetujui' && item && (
            <button type="button" className="btn btn--primary" onClick={() => downloadItem(item)}>
              <Download size={16} /> Unduh Data
            </button>
          )}
          {req.status === 'Ditolak' && (
            <button type="button" className="btn btn--red" onClick={() => openRequestForm(req.itemId)}>
              <FilePenLine size={16} /> Ajukan Ulang
            </button>
          )}
        </>
      }
    >
      <p className="dlg-title">{req.title}</p>
      <div className="dlg-meta">
        <StatusBadge status={req.status} />
        <span className="dlg-date">
          <Calendar size={14} /> Diajukan {fmtDate(req.date)}
        </span>
      </div>
      <ol className="timeline">
        {steps.map((s) => (
          <li key={s.label} className={`timeline__step timeline__step--${s.state}`}>
            <span className="timeline__dot">
              {s.state === 'done' ? (
                <CircleCheck size={18} />
              ) : s.state === 'current' ? (
                <Clock size={18} />
              ) : (
                <Circle size={18} />
              )}
            </span>
            <div>
              <strong>{s.label}</strong>
              <span>{s.note}</span>
            </div>
          </li>
        ))}
      </ol>
      {req.status === 'Ditolak' && req.reason && <p className="dlg-note dlg-note--red">{req.reason}</p>}
      {req.purpose && (
        <dl className="dlg-dl dlg-dl--single">
          <div>
            <dt>Tujuan penggunaan</dt>
            <dd>{req.purpose}</dd>
          </div>
        </dl>
      )}
    </Modal>
  )
}
