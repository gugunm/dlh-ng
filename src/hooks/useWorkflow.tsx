import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { todayIso } from '../lib/format'
import { USER } from './useAuth'

export type DsStatus = 'Draf' | 'Menunggu Verifikasi' | 'Perlu Revisi' | 'Dipublikasikan'
export type QueueStatus = 'Menunggu' | 'Sedang Diperiksa'

export interface ProducerDataset {
  id: string
  title: string
  status: DsStatus
  date: string
  topik: string
  sifat: 'Terbuka' | 'Terbatas'
  description?: string
  note?: string
}

export interface QueueItem {
  id: string
  title: string
  producer: string
  date: string
  status: QueueStatus
  datasetId?: string
}

interface State {
  datasets: ProducerDataset[]
  queue: QueueItem[]
  revisions: number
  approvals: number
}

const KD = 'Deputi Bidang Pengawasan Penyelenggaraan Keuangan Daerah'
const INV = 'Deputi Bidang Investigasi'

const SEED: State = {
  datasets: [
    { id: 'pd1', title: 'Indeks Maturitas SPIP Pemerintah Daerah Tahun 2025', status: 'Dipublikasikan', date: '2026-10-20', topik: 'SPIP', sifat: 'Terbuka' },
    { id: 'pd2', title: 'Hasil Evaluasi Tata Kelola Badan Usaha Milik Daerah (BUMD)', status: 'Perlu Revisi', date: '2026-11-02', topik: 'Keuangan Daerah', sifat: 'Terbuka', note: 'Isian satuan dan klasifikasi data belum lengkap.' },
    { id: 'pd3', title: 'Realisasi Belanja Dana Desa Menurut Provinsi Tahun 2026', status: 'Menunggu Verifikasi', date: '2026-11-03', topik: 'Dana Desa', sifat: 'Terbuka' },
    { id: 'pd4', title: 'Sebaran Kantor Perwakilan BPKP di Seluruh Provinsi', status: 'Dipublikasikan', date: '2026-10-27', topik: 'Akuntabilitas Kinerja', sifat: 'Terbuka' },
    { id: 'pd5', title: 'Data Kinerja Pengawasan Dana Desa', status: 'Draf', date: '2026-11-04', topik: 'Dana Desa', sifat: 'Terbuka' },
    { id: 'pd6', title: 'Rekapitulasi Rencana Tindak Pengendalian atas Risiko Prioritas', status: 'Menunggu Verifikasi', date: '2026-10-30', topik: 'SPIP', sifat: 'Terbuka' },
    { id: 'pd7', title: 'Indeks Maturitas SPIP Kementerian/Lembaga Tahun 2025', status: 'Dipublikasikan', date: '2026-10-28', topik: 'SPIP', sifat: 'Terbuka' },
    { id: 'pd8', title: 'Daftar Pemerintah Daerah Menurut Tingkat Maturitas SPIP', status: 'Dipublikasikan', date: '2026-10-21', topik: 'SPIP', sifat: 'Terbuka' },
    { id: 'pd9', title: 'Hasil Penilaian Pengendalian Intern atas Pelaporan Keuangan', status: 'Dipublikasikan', date: '2026-10-14', topik: 'SPIP', sifat: 'Terbatas' },
  ],
  queue: [
    { id: 'q1', title: 'Realisasi Belanja Dana Desa Menurut Provinsi Tahun 2026', producer: KD, date: '2026-11-03', status: 'Menunggu', datasetId: 'pd3' },
    { id: 'q2', title: 'Rekapitulasi Rencana Tindak Pengendalian atas Risiko Prioritas', producer: KD, date: '2026-10-30', status: 'Menunggu', datasetId: 'pd6' },
    { id: 'q3', title: 'Rekapitulasi Penugasan Audit Investigatif Tahun 2026', producer: INV, date: '2026-10-29', status: 'Sedang Diperiksa' },
    { id: 'q4', title: 'Jumlah Penugasan Audit Investigatif Menurut Jenis Instansi', producer: INV, date: '2026-10-28', status: 'Menunggu' },
    { id: 'q5', title: 'Daftar Pemerintah Daerah Menurut Tingkat Maturitas SPIP', producer: KD, date: '2026-10-27', status: 'Menunggu' },
    { id: 'q6', title: 'Perkembangan Tindak Lanjut Hasil Audit Investigatif', producer: INV, date: '2026-10-26', status: 'Sedang Diperiksa' },
  ],
  revisions: 0,
  approvals: 0,
}

/** Totals shown in the design; the visible sample rows move these up and down. */
export const PRODUCER_BASE: Record<DsStatus, number> = {
  Draf: 2,
  'Menunggu Verifikasi': 5,
  'Perlu Revisi': 3,
  Dipublikasikan: 34,
}
export const WALIDATA_BASE = { Menunggu: 9, 'Sedang Diperiksa': 3, revisi: 7, bulanIni: 18 }

const STORAGE_KEY = 'dlh-katalog-workflow-v1'

const load = (): State => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw) as State
  } catch {
    /* storage unavailable */
  }
  return SEED
}

const countBy = <T,>(list: T[], pick: (t: T) => string) => {
  const out: Record<string, number> = {}
  list.forEach((t) => {
    const k = pick(t)
    out[k] = (out[k] ?? 0) + 1
  })
  return out
}

interface WorkflowApi extends State {
  producerCounts: Record<DsStatus, number>
  walidataCounts: { Menunggu: number; 'Sedang Diperiksa': number; revisi: number; bulanIni: number }
  saveDataset: (input: Partial<ProducerDataset> & { title: string }, submit?: boolean) => string
  withdraw: (id: string) => void
  startReview: (queueId: string) => void
  decide: (queueId: string, decision: 'approve' | 'revise', note?: string) => void
  reset: () => void
}

const WorkflowContext = createContext<WorkflowApi | null>(null)

export function WorkflowProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<State>(load)

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    } catch {
      /* storage unavailable */
    }
  }, [state])

  const saveDataset = useCallback<WorkflowApi['saveDataset']>((input, submit = false) => {
    const id = input.id ?? `pd-${Date.now()}`
    setState((s) => {
      const existing = s.datasets.find((d) => d.id === id)
      const status: DsStatus = submit ? 'Menunggu Verifikasi' : (input.status ?? existing?.status ?? 'Draf')
      const next: ProducerDataset = {
        id,
        title: input.title,
        topik: input.topik ?? existing?.topik ?? 'SPIP',
        sifat: input.sifat ?? existing?.sifat ?? 'Terbuka',
        description: input.description ?? existing?.description,
        note: submit ? undefined : (input.note ?? existing?.note),
        status,
        date: todayIso(),
      }
      const datasets = existing ? s.datasets.map((d) => (d.id === id ? next : d)) : [next, ...s.datasets]
      let queue = s.queue.filter((q) => q.datasetId !== id)
      if (status === 'Menunggu Verifikasi') {
        queue = [
          { id: `q-${id}`, title: next.title, producer: USER.unit, date: todayIso(), status: 'Menunggu', datasetId: id },
          ...queue,
        ]
      }
      return { ...s, datasets, queue }
    })
    return id
  }, [])

  const withdraw = useCallback((id: string) => {
    setState((s) => ({
      ...s,
      datasets: s.datasets.map((d) => (d.id === id ? { ...d, status: 'Draf', date: todayIso() } : d)),
      queue: s.queue.filter((q) => q.datasetId !== id),
    }))
  }, [])

  const startReview = useCallback((queueId: string) => {
    setState((s) => ({
      ...s,
      queue: s.queue.map((q) => (q.id === queueId && q.status === 'Menunggu' ? { ...q, status: 'Sedang Diperiksa' } : q)),
    }))
  }, [])

  const decide = useCallback<WorkflowApi['decide']>((queueId, decision, note) => {
    setState((s) => {
      const item = s.queue.find((q) => q.id === queueId)
      if (!item) return s
      const datasets = s.datasets.map((d) =>
        d.id === item.datasetId
          ? decision === 'approve'
            ? { ...d, status: 'Dipublikasikan' as DsStatus, date: todayIso(), note: undefined }
            : { ...d, status: 'Perlu Revisi' as DsStatus, date: todayIso(), note }
          : d,
      )
      return {
        ...s,
        datasets,
        queue: s.queue.filter((q) => q.id !== queueId),
        approvals: s.approvals + (decision === 'approve' ? 1 : 0),
        revisions: s.revisions + (decision === 'revise' ? 1 : 0),
      }
    })
  }, [])

  const reset = useCallback(() => setState(SEED), [])

  const api = useMemo<WorkflowApi>(() => {
    const seedDs = countBy(SEED.datasets, (d) => d.status)
    const curDs = countBy(state.datasets, (d) => d.status)
    const producerCounts = Object.fromEntries(
      (Object.keys(PRODUCER_BASE) as DsStatus[]).map((k) => [
        k,
        Math.max(0, PRODUCER_BASE[k] + (curDs[k] ?? 0) - (seedDs[k] ?? 0)),
      ]),
    ) as Record<DsStatus, number>
    const seedQ = countBy(SEED.queue, (q) => q.status)
    const curQ = countBy(state.queue, (q) => q.status)
    const walidataCounts = {
      Menunggu: Math.max(0, WALIDATA_BASE.Menunggu + (curQ.Menunggu ?? 0) - (seedQ.Menunggu ?? 0)),
      'Sedang Diperiksa': Math.max(
        0,
        WALIDATA_BASE['Sedang Diperiksa'] + (curQ['Sedang Diperiksa'] ?? 0) - (seedQ['Sedang Diperiksa'] ?? 0),
      ),
      revisi: WALIDATA_BASE.revisi + state.revisions,
      bulanIni: WALIDATA_BASE.bulanIni + state.approvals,
    }
    return { ...state, producerCounts, walidataCounts, saveDataset, withdraw, startReview, decide, reset }
  }, [state, saveDataset, withdraw, startReview, decide, reset])

  return <WorkflowContext.Provider value={api}>{children}</WorkflowContext.Provider>
}

export const useWorkflow = () => {
  const ctx = useContext(WorkflowContext)
  if (!ctx) throw new Error('useWorkflow must be used inside WorkflowProvider')
  return ctx
}
