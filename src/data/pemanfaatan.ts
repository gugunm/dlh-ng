import type { LucideIcon } from 'lucide-react'
import { ChartColumn, ChartLine, ChartPie, LayoutDashboard, Map as MapIcon, Table2 } from 'lucide-react'

export type Wilayah = 'Nasional' | 'Provinsi' | 'Kabupaten/Kota'
export const WILAYAH_OPTIONS: Wilayah[] = ['Nasional', 'Provinsi', 'Kabupaten/Kota']

export type UsageIcon = 'dashboard' | 'column' | 'line' | 'pie' | 'map' | 'table'
export const USAGE_ICONS: Record<UsageIcon, LucideIcon> = {
  dashboard: LayoutDashboard,
  column: ChartColumn,
  line: ChartLine,
  pie: ChartPie,
  map: MapIcon,
  table: Table2,
}

export interface Usage {
  id: string
  title: string
  /** ISO date of last change */
  date: string
  author: string
  description: string
  topik?: string
  wilayah: Wilayah
  icon: UsageIcon
  archived?: boolean
  /** added by the user in this browser */
  mine?: boolean
}

const KD = 'Deputi Bidang Pengawasan Penyelenggaraan Keuangan Daerah'
const INV = 'Deputi Bidang Investigasi'
const P = (s: string) => `Perwakilan BPKP Provinsi ${s}`

// The first seven cards are the ones in the design.
const FROM_DESIGN: Usage[] = [
  {
    id: 'pm-1',
    title: 'Dasbor Peta Maturitas SPIP Pemerintah Daerah',
    date: '2026-11-04',
    author: KD,
    description:
      'Dasbor interaktif yang memetakan tingkat maturitas penyelenggaraan SPIP pemerintah daerah berdasarkan dataset Indeks Maturitas SPIP Pemerintah Daerah.',
    topik: 'Pengendalian Intern',
    wilayah: 'Nasional',
    icon: 'dashboard',
  },
  {
    id: 'pm-2',
    title: 'Pemantau Realisasi Dana Desa per Provinsi',
    date: '2026-10-28',
    author: P('Jawa Barat'),
    description:
      'Visualisasi realisasi belanja dana desa menurut provinsi untuk membantu pemantauan pengawasan keuangan desa.',
    topik: 'Keuangan Desa',
    wilayah: 'Provinsi',
    icon: 'column',
  },
  {
    id: 'pm-3',
    title: 'Analisis Risiko Penyaluran Bantuan Sosial',
    date: '2026-10-15',
    author: P('Jawa Timur'),
    description:
      'Analisis risiko penyaluran bantuan sosial per triwulan untuk mendukung penentuan prioritas pengawasan.',
    wilayah: 'Provinsi',
    icon: 'line',
  },
  {
    id: 'pm-4',
    title: 'Perkembangan Tindak Lanjut Hasil Audit Investigatif',
    date: '2026-10-09',
    author: INV,
    description: 'Dasbor ringkas perkembangan tindak lanjut hasil audit investigatif menurut jenis instansi.',
    topik: 'Investigasi',
    wilayah: 'Nasional',
    icon: 'pie',
  },
  {
    id: 'pm-5',
    title: 'Peta Sebaran Kapabilitas APIP',
    date: '2026-09-30',
    author: P('Bali'),
    description: 'Peta tematik level kapabilitas APIP kementerian, lembaga, dan pemerintah daerah.',
    topik: 'Kapabilitas APIP',
    wilayah: 'Nasional',
    icon: 'map',
  },
  {
    id: 'pm-6',
    title: 'Analisis Pengadaan Barang/Jasa Pemerintah per Sektor',
    date: '2026-09-18',
    author: P('Sumatera Utara'),
    description: 'Ringkasan hasil pengawasan pengadaan barang/jasa pemerintah menurut sektor dan semester.',
    topik: 'Pengadaan',
    wilayah: 'Provinsi',
    icon: 'table',
  },
  {
    id: 'pm-7',
    title: 'Ringkasan Evaluasi Tata Kelola BUMD',
    date: '2026-09-02',
    author: P('Kalimantan Timur'),
    description: 'Dasbor hasil evaluasi tata kelola badan usaha milik daerah beserta tindak lanjut rekomendasinya.',
    topik: 'Keuangan Daerah',
    wilayah: 'Provinsi',
    icon: 'dashboard',
  },
]

// Sample content that is NOT in the design: fills the list up to the "42 hasil" shown there.
const KINDS: [string, string, UsageIcon][] = [
  ['Dasbor', 'dasbor interaktif', 'dashboard'],
  ['Peta', 'peta tematik', 'map'],
  ['Analisis', 'analisis', 'line'],
  ['Pemantau', 'visualisasi pemantauan', 'column'],
  ['Ringkasan', 'ringkasan tabel', 'table'],
  ['Profil', 'profil proporsi', 'pie'],
]
const SUBJECTS: [string, string, string?, Wilayah?][] = [
  ['Kepatuhan Penyampaian LHP Pemerintah Daerah', P('Jawa Tengah'), 'Pengendalian Intern', 'Kabupaten/Kota'],
  ['Level Kapabilitas APIP Kabupaten/Kota', P('Sumatera Barat'), 'Kapabilitas APIP', 'Kabupaten/Kota'],
  ['Serapan Anggaran Belanja Modal', KD, 'Keuangan Daerah', 'Provinsi'],
  ['Penyaluran Dana Bantuan Operasional Sekolah', P('Sulawesi Selatan'), undefined, 'Provinsi'],
  ['Tingkat Penyelesaian Temuan Pengawasan', P('Daerah Istimewa Yogyakarta'), 'Akuntabilitas Kinerja', 'Provinsi'],
  ['Realisasi Pendapatan Asli Daerah', KD, 'Keuangan Daerah', 'Kabupaten/Kota'],
  ['Paket Pengadaan Barang/Jasa Strategis', P('DKI Jakarta'), 'Pengadaan', 'Provinsi'],
  ['Risiko Penyaluran Dana Desa', P('Nusa Tenggara Barat'), 'Keuangan Desa', 'Kabupaten/Kota'],
  ['Penugasan Audit Investigatif Menurut Wilayah', INV, 'Investigasi', 'Provinsi'],
  ['Kinerja Penyerapan Anggaran Kementerian/Lembaga', 'Deputi Bidang Pengawasan Instansi Pemerintah Pusat', 'Akuntabilitas Kinerja', 'Nasional'],
  ['Indeks Efektivitas Pengendalian Gratifikasi', P('Aceh'), 'Pengendalian Intern', 'Nasional'],
  ['Pemutakhiran Data Aset Daerah', P('Riau'), 'Keuangan Daerah', 'Provinsi'],
  ['Evaluasi Kinerja Instansi Pemerintah', 'Deputi Bidang Pengawasan Instansi Pemerintah Pusat', 'Akuntabilitas Kinerja', 'Nasional'],
  ['Sebaran Unit Penyelenggara SPIP Terintegrasi', KD, 'Pengendalian Intern', 'Nasional'],
  ['Tren Temuan Pengadaan Barang/Jasa', P('Lampung'), 'Pengadaan', 'Provinsi'],
  ['Pengelolaan Keuangan Badan Layanan Umum Daerah', P('Banten'), 'Keuangan Daerah', 'Provinsi'],
  ['Pemetaan Risiko Korupsi Sektor Pelayanan Publik', INV, 'Investigasi', 'Nasional'],
  ['Kualitas Laporan Keuangan Pemerintah Daerah', P('Sumatera Selatan'), 'Keuangan Daerah', 'Kabupaten/Kota'],
  ['Pemanfaatan Dana Alokasi Khusus', P('Kalimantan Selatan'), undefined, 'Kabupaten/Kota'],
  ['Kesiapan Implementasi Satu Data Pemerintah Daerah', 'Deputi Bidang Akuntan Negara', undefined, 'Provinsi'],
  ['Realisasi Pengawasan Dana Desa Semester I', P('Jawa Barat'), 'Keuangan Desa', 'Kabupaten/Kota'],
  ['Hasil Penilaian Risiko Instansi Pemerintah', KD, 'Pengendalian Intern', 'Nasional'],
  ['Efektivitas Pengendalian Intern BUMN', 'Deputi Bidang Akuntan Negara', 'Pengendalian Intern', 'Nasional'],
  ['Sebaran Temuan Pengawasan Menurut Jenis', P('Kalimantan Tengah'), undefined, 'Provinsi'],
  ['Rencana Aksi Perbaikan Tata Kelola Daerah', P('Jambi'), 'Akuntabilitas Kinerja', 'Provinsi'],
  ['Progres Pembangunan Infrastruktur Strategis', P('Papua'), undefined, 'Provinsi'],
  ['Jadwal Pemutakhiran Dataset Unit Kerja', KD, undefined, 'Nasional'],
  ['Capaian Indikator Kinerja Utama Pengawasan', 'Deputi Bidang Pengawasan Instansi Pemerintah Pusat', 'Akuntabilitas Kinerja', 'Nasional'],
  ['Kapabilitas APIP Menurut Provinsi', P('Sulawesi Utara'), 'Kapabilitas APIP', 'Provinsi'],
  ['Kepatuhan Pelaporan Gratifikasi', P('Maluku'), 'Pengendalian Intern', 'Provinsi'],
  ['Ketepatan Waktu Penyampaian Laporan Keuangan', P('Gorontalo'), 'Keuangan Daerah', 'Kabupaten/Kota'],
  ['Pengawasan Belanja Barang dan Jasa Daerah', P('Kepulauan Riau'), 'Pengadaan', 'Provinsi'],
  ['Penyelesaian Kerugian Negara Menurut Sektor', INV, 'Investigasi', 'Nasional'],
  ['Pengaduan Masyarakat dan Tindak Lanjutnya', P('Nusa Tenggara Timur'), undefined, 'Provinsi'],
  ['Kualitas Perencanaan Anggaran Daerah', P('Bengkulu'), 'Keuangan Daerah', 'Provinsi'],
  ['Prototipe Dasbor Pemantauan Subsidi Energi', P('Jawa Timur'), undefined, 'Nasional'],
  ['Rekap Penilaian Mandiri SPIP Versi Lama', KD, 'Pengendalian Intern', 'Nasional'],
  ['Peta Aset Daerah Tahun 2024', P('Sumatera Utara'), 'Keuangan Daerah', 'Provinsi'],
]
const ARCHIVED_COUNT = 3 // the last generated items are archived

const addDays = (iso: string, days: number) => {
  const d = new Date(`${iso}T00:00:00Z`)
  d.setUTCDate(d.getUTCDate() - days)
  return d.toISOString().slice(0, 10)
}

const GENERATED: Usage[] = SUBJECTS.map(([subject, author, topik, wilayah], i) => {
  const [prefix, phrase, icon] = KINDS[i % KINDS.length]
  return {
    id: `pm-${i + 8}`,
    title: `${prefix} ${subject}`,
    date: addDays('2026-08-26', i * 6),
    author,
    description: `Contoh ${phrase} ${subject.toLowerCase()} yang disusun dari dataset pada Katalog Data BPKP untuk mendukung pemantauan dan pengambilan keputusan pengawasan.`,
    topik,
    wilayah: wilayah ?? 'Nasional',
    icon,
    archived: i >= SUBJECTS.length - ARCHIVED_COUNT ? true : undefined,
  }
})

export const SEED_USAGES: Usage[] = [...FROM_DESIGN, ...GENERATED]
