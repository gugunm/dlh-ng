import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { addDays, todayIso } from '../lib/format'

export type RequestStatus = 'Diproses' | 'Disetujui' | 'Ditolak'

export interface InfoRequest {
  id: string
  no: string
  itemId: string
  title: string
  date: string
  status: RequestStatus
  producer?: string
  purpose?: string
  unit?: string
  reason?: string
  bentuk?: string
  /** Time of day the request was submitted, e.g. "09:14". */
  time?: string
  /** Display text for when PPID verified the request. */
  verifiedAt?: string
  /** Expected response date while the request is in progress. */
  eta?: string
  decidedAt?: string
}

const STORAGE_KEY = 'dlh-katalog-requests-v2'

const DEP_INVESTIGASI = 'Deputi Bidang Investigasi'
const DEP_KEUDA = 'Deputi Bidang Pengawasan Penyelenggaraan Keuangan Daerah'
const CSV = 'Salinan digital (CSV)'
const REJECT_DETAIL =
  'Tujuan penggunaan data belum dijelaskan secara rinci. Ajukan kembali dengan menyebutkan kegiatan, unit kerja, dan periode penggunaan data.'

const SEED: InfoRequest[] = [
  {
    id: 'req-seed-1',
    no: 'PI-2026-0187',
    itemId: 'ak-audit',
    title: 'Rekapitulasi Penugasan Audit Investigatif Tahun 2026',
    date: '2026-11-03',
    time: '09:14',
    verifiedAt: '4 Nov 2026, 11:02',
    eta: '2026-11-17',
    status: 'Diproses',
    producer: DEP_INVESTIGASI,
    purpose: 'Bahan analisis untuk penelitian tata kelola pengawasan',
    bentuk: CSV,
  },
  {
    id: 'req-seed-2',
    no: 'PI-2026-0151',
    itemId: 'spip-pelaporan',
    title: 'Hasil Penilaian Pengendalian Intern atas Pelaporan Keuangan',
    date: '2026-10-14',
    time: '10:20',
    verifiedAt: '15 Okt 2026, 09:40',
    decidedAt: '22 Okt 2026',
    status: 'Disetujui',
    producer: DEP_KEUDA,
    purpose: 'Penyusunan kertas kerja reviu pelaporan keuangan daerah',
    bentuk: CSV,
  },
  {
    id: 'req-seed-3',
    no: 'PI-2026-0132',
    itemId: 'spip-bumd',
    title: 'Penilaian Risiko Penyelenggaraan SPIP pada BUMD',
    date: '2026-09-28',
    time: '14:05',
    verifiedAt: '29 Sep 2026, 10:12',
    decidedAt: '6 Okt 2026',
    status: 'Ditolak',
    producer: DEP_KEUDA,
    purpose: 'Bahan kajian',
    bentuk: CSV,
    reason: REJECT_DETAIL,
  },
  {
    id: 'req-seed-4',
    no: 'PI-2026-0118',
    itemId: 'inv-jumlah',
    title: 'Jumlah Penugasan Audit Investigatif Menurut Jenis Instansi',
    date: '2026-09-12',
    time: '08:47',
    verifiedAt: '14 Sep 2026, 13:20',
    decidedAt: '21 Sep 2026',
    status: 'Disetujui',
    producer: DEP_INVESTIGASI,
    purpose: 'Penyusunan profil penugasan investigatif per jenis instansi',
    bentuk: CSV,
  },
  {
    id: 'req-seed-5',
    no: 'PI-2026-0097',
    itemId: 'inv-s1',
    title: 'Rekapitulasi Hasil Audit Investigatif Semester I 2026',
    date: '2026-08-25',
    time: '11:32',
    verifiedAt: '26 Agu 2026, 09:05',
    decidedAt: '2 Sep 2026',
    status: 'Disetujui',
    producer: DEP_INVESTIGASI,
    purpose: 'Bahan laporan kinerja pengawasan semester I',
    bentuk: CSV,
  },
  {
    id: 'req-seed-6',
    no: 'PI-2026-0083',
    itemId: 'inv-kerugian',
    title: 'Rekapitulasi Penghitungan Kerugian Keuangan Negara',
    date: '2026-08-07',
    time: '15:18',
    verifiedAt: '10 Agu 2026, 10:44',
    decidedAt: '18 Agu 2026',
    status: 'Ditolak',
    producer: DEP_INVESTIGASI,
    purpose: 'Bahan analisis',
    bentuk: CSV,
    reason: REJECT_DETAIL,
  },
  {
    id: 'req-seed-7',
    no: 'PI-2026-0061',
    itemId: 'inv-tl',
    title: 'Perkembangan Tindak Lanjut Hasil Audit Investigatif',
    date: '2026-07-15',
    time: '09:51',
    verifiedAt: '16 Jul 2026, 14:10',
    decidedAt: '24 Jul 2026',
    status: 'Disetujui',
    producer: DEP_INVESTIGASI,
    purpose: 'Pemantauan tindak lanjut rekomendasi hasil audit',
    bentuk: CSV,
  },
  {
    id: 'req-seed-8',
    no: 'PI-2026-0048',
    itemId: 'apip-profil',
    title: 'Profil Auditor dan Jumlah Pegawai APIP',
    date: '2026-06-22',
    time: '10:03',
    verifiedAt: '23 Jun 2026, 11:15',
    decidedAt: '1 Jul 2026',
    status: 'Disetujui',
    purpose: 'Analisis kebutuhan pengembangan kompetensi auditor',
    bentuk: CSV,
  },
  {
    id: 'req-seed-9',
    no: 'PI-2026-0039',
    itemId: 'kd-penyertaan',
    title: 'Daftar BUMD dan Status Penyertaan Modal',
    date: '2026-05-19',
    time: '13:26',
    verifiedAt: '20 Mei 2026, 09:30',
    decidedAt: '28 Mei 2026',
    status: 'Disetujui',
    purpose: 'Bahan evaluasi tata kelola BUMD',
    bentuk: CSV,
  },
  {
    id: 'req-seed-10',
    no: 'PI-2026-0027',
    itemId: 'dd-pendampingan',
    title: 'Hasil Pendampingan Pengelolaan Keuangan Desa',
    date: '2026-04-08',
    time: '08:58',
    verifiedAt: '9 Apr 2026, 10:21',
    decidedAt: '17 Apr 2026',
    status: 'Disetujui',
    purpose: 'Penyusunan bahan pembinaan pengelolaan keuangan desa',
    bentuk: CSV,
  },
  {
    id: 'req-seed-11',
    no: 'PI-2026-0016',
    itemId: 'apip-rekap',
    title: 'Rekapitulasi Penilaian Kapabilitas APIP',
    date: '2026-03-03',
    time: '14:40',
    verifiedAt: '4 Mar 2026, 09:12',
    decidedAt: '12 Mar 2026',
    status: 'Disetujui',
    purpose: 'Bahan pemetaan kapabilitas APIP daerah',
    bentuk: CSV,
  },
  {
    id: 'req-seed-12',
    no: 'PI-2026-0009',
    itemId: 'kd-analisis',
    title: 'Analisis Kinerja Keuangan Daerah Triwulan II 2026',
    date: '2026-02-11',
    time: '11:07',
    verifiedAt: '12 Feb 2026, 13:35',
    decidedAt: '20 Feb 2026',
    status: 'Disetujui',
    purpose: 'Bahan paparan rapat koordinasi pengawasan',
    bentuk: CSV,
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

const nextNo = (list: InfoRequest[]) => {
  const year = new Date().getFullYear()
  const top = list.reduce((max, r) => Math.max(max, Number(r.no.split('-')[2]) || 0), 0)
  return `PI-${year}-${String(top + 1).padStart(4, '0')}`
}

interface RequestsApi {
  requests: InfoRequest[]
  add: (input: { itemId: string; title: string; purpose: string; unit: string }) => InfoRequest
  forItem: (itemId: string) => InfoRequest | undefined
  cancel: (id: string) => void
  reset: () => void
}

const RequestsContext = createContext<RequestsApi | null>(null)

export function RequestsProvider({ children }: { children: ReactNode }) {
  const [requests, setRequests] = useState<InfoRequest[]>(load)
  const requestsRef = useRef(requests)
  requestsRef.current = requests

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(requests))
    } catch {
      /* storage unavailable */
    }
  }, [requests])

  const add = useCallback<RequestsApi['add']>((input) => {
    const now = new Date()
    const date = todayIso()
    const req: InfoRequest = {
      id: `req-${Date.now()}`,
      no: nextNo(requestsRef.current),
      itemId: input.itemId,
      title: input.title,
      date,
      time: `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`,
      eta: addDays(date, 14),
      status: 'Diproses',
      purpose: input.purpose,
      unit: input.unit,
      bentuk: CSV,
    }
    setRequests((l) => [req, ...l])
    return req
  }, [])

  const cancel = useCallback((id: string) => setRequests((l) => l.filter((r) => r.id !== id)), [])

  const forItem = useCallback(
    (itemId: string) => requests.find((r) => r.itemId === itemId),
    [requests],
  )

  const reset = useCallback(() => setRequests(SEED), [])

  const api = useMemo(() => ({ requests, add, forItem, cancel, reset }), [requests, add, forItem, cancel, reset])
  return <RequestsContext.Provider value={api}>{children}</RequestsContext.Provider>
}

export const useRequests = () => {
  const ctx = useContext(RequestsContext)
  if (!ctx) throw new Error('useRequests must be used inside RequestsProvider')
  return ctx
}
