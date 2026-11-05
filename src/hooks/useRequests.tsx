import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { todayIso } from '../lib/format'

export type RequestStatus = 'Diproses' | 'Disetujui' | 'Ditolak'

export interface InfoRequest {
  id: string
  itemId: string
  title: string
  date: string
  status: RequestStatus
  purpose?: string
  unit?: string
  reason?: string
}

const STORAGE_KEY = 'dlh-katalog-requests-v1'

const SEED: InfoRequest[] = [
  {
    id: 'req-seed-1',
    itemId: 'ak-audit',
    title: 'Rekapitulasi Penugasan Audit Investigatif Tahun 2026',
    date: '2026-11-03',
    status: 'Diproses',
  },
  {
    id: 'req-seed-2',
    itemId: 'spip-pelaporan',
    title: 'Hasil Penilaian Pengendalian Intern atas Pelaporan Keuangan',
    date: '2026-10-14',
    status: 'Disetujui',
  },
  {
    id: 'req-seed-3',
    itemId: 'spip-bumd',
    title: 'Penilaian Risiko Penyelenggaraan SPIP pada BUMD',
    date: '2026-09-28',
    status: 'Ditolak',
    reason:
      'Tujuan penggunaan data belum dijelaskan secara rinci. Ajukan kembali dengan menyebutkan kegiatan, unit kerja, dan periode penggunaan data.',
  },
]

const load = (): InfoRequest[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw) as InfoRequest[]
  } catch {
    /* storage unavailable */
  }
  return SEED
}

interface RequestsApi {
  requests: InfoRequest[]
  add: (input: { itemId: string; title: string; purpose: string; unit: string }) => InfoRequest
  forItem: (itemId: string) => InfoRequest | undefined
  reset: () => void
}

const RequestsContext = createContext<RequestsApi | null>(null)

export function RequestsProvider({ children }: { children: ReactNode }) {
  const [requests, setRequests] = useState<InfoRequest[]>(load)

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(requests))
    } catch {
      /* storage unavailable */
    }
  }, [requests])

  const add = useCallback<RequestsApi['add']>((input) => {
    const req: InfoRequest = {
      id: `req-${Date.now()}`,
      itemId: input.itemId,
      title: input.title,
      date: todayIso(),
      status: 'Diproses',
      purpose: input.purpose,
      unit: input.unit,
    }
    setRequests((l) => [req, ...l])
    return req
  }, [])

  const forItem = useCallback(
    (itemId: string) => requests.find((r) => r.itemId === itemId),
    [requests],
  )

  const reset = useCallback(() => setRequests(SEED), [])

  const api = useMemo(() => ({ requests, add, forItem, reset }), [requests, add, forItem, reset])
  return <RequestsContext.Provider value={api}>{children}</RequestsContext.Provider>
}

export const useRequests = () => {
  const ctx = useContext(RequestsContext)
  if (!ctx) throw new Error('useRequests must be used inside RequestsProvider')
  return ctx
}
