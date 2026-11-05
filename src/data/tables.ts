import type { CatalogItem } from './catalog'

export interface DataColumn {
  key: string
  label: string
  desc: string
  width?: number
}

export interface DataTable {
  columns: DataColumn[]
  rows: string[][]
  /** column shown as a coloured badge */
  badgeCol?: number
  /** column the "Grafik" tab groups by */
  chartCol: number
  chartTitle: string
  unit: string
  satuan: string
}

const hashStr = (s: string) => {
  let h = 2166136261
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

const LEVELS = ['', 'Level 1 – Rintisan', 'Level 2 – Berkembang', 'Level 3 – Terdefinisi', 'Level 4 – Terkelola dan Terukur', 'Level 5 – Optimum']

// [provinsi, pemerintah daerah, jenis, fixed level (design rows)]
const PEMDA: [string, string, string, number?][] = [
  ['Jawa Barat', 'Pemerintah Provinsi Jawa Barat', 'Provinsi', 3],
  ['Jawa Tengah', 'Pemerintah Provinsi Jawa Tengah', 'Provinsi', 3],
  ['Jawa Timur', 'Pemerintah Provinsi Jawa Timur', 'Provinsi', 4],
  ['Sumatera Utara', 'Pemerintah Kota Medan', 'Kota', 3],
  ['Sulawesi Selatan', 'Pemerintah Kota Makassar', 'Kota', 3],
  ['Bali', 'Pemerintah Kabupaten Badung', 'Kabupaten', 4],
  ['Kalimantan Timur', 'Pemerintah Kota Balikpapan', 'Kota', 3],
  ['Daerah Istimewa Yogyakarta', 'Pemerintah Kabupaten Sleman', 'Kabupaten', 4],
  ['DKI Jakarta', 'Pemerintah Provinsi DKI Jakarta', 'Provinsi'],
  ['Banten', 'Pemerintah Provinsi Banten', 'Provinsi'],
  ['Aceh', 'Pemerintah Provinsi Aceh', 'Provinsi'],
  ['Sumatera Barat', 'Pemerintah Kota Padang', 'Kota'],
  ['Riau', 'Pemerintah Kota Pekanbaru', 'Kota'],
  ['Kepulauan Riau', 'Pemerintah Kota Batam', 'Kota'],
  ['Jambi', 'Pemerintah Kota Jambi', 'Kota'],
  ['Sumatera Selatan', 'Pemerintah Kota Palembang', 'Kota'],
  ['Lampung', 'Pemerintah Kota Bandar Lampung', 'Kota'],
  ['Bengkulu', 'Pemerintah Provinsi Bengkulu', 'Provinsi'],
  ['Jawa Barat', 'Pemerintah Kota Bandung', 'Kota'],
  ['Jawa Barat', 'Pemerintah Kabupaten Bogor', 'Kabupaten'],
  ['Jawa Tengah', 'Pemerintah Kota Semarang', 'Kota'],
  ['Jawa Tengah', 'Pemerintah Kabupaten Banyumas', 'Kabupaten'],
  ['Jawa Timur', 'Pemerintah Kota Surabaya', 'Kota'],
  ['Jawa Timur', 'Pemerintah Kabupaten Malang', 'Kabupaten'],
  ['Nusa Tenggara Barat', 'Pemerintah Kota Mataram', 'Kota'],
  ['Nusa Tenggara Timur', 'Pemerintah Kota Kupang', 'Kota'],
  ['Kalimantan Barat', 'Pemerintah Kota Pontianak', 'Kota'],
  ['Kalimantan Tengah', 'Pemerintah Kota Palangka Raya', 'Kota'],
  ['Kalimantan Selatan', 'Pemerintah Kota Banjarmasin', 'Kota'],
  ['Kalimantan Utara', 'Pemerintah Kabupaten Bulungan', 'Kabupaten'],
  ['Sulawesi Utara', 'Pemerintah Kota Manado', 'Kota'],
  ['Sulawesi Tengah', 'Pemerintah Kota Palu', 'Kota'],
  ['Sulawesi Tenggara', 'Pemerintah Kota Kendari', 'Kota'],
  ['Gorontalo', 'Pemerintah Provinsi Gorontalo', 'Provinsi'],
  ['Sulawesi Barat', 'Pemerintah Kabupaten Mamuju', 'Kabupaten'],
  ['Maluku', 'Pemerintah Kota Ambon', 'Kota'],
  ['Maluku Utara', 'Pemerintah Kota Ternate', 'Kota'],
  ['Papua', 'Pemerintah Kota Jayapura', 'Kota'],
  ['Papua Barat', 'Pemerintah Kabupaten Manokwari', 'Kabupaten'],
  ['Bali', 'Pemerintah Kota Denpasar', 'Kota'],
  ['Sumatera Utara', 'Pemerintah Kabupaten Deli Serdang', 'Kabupaten'],
  ['Sulawesi Selatan', 'Pemerintah Kabupaten Gowa', 'Kabupaten'],
  ['Kalimantan Timur', 'Pemerintah Kabupaten Kutai Kartanegara', 'Kabupaten'],
  ['Daerah Istimewa Yogyakarta', 'Pemerintah Kota Yogyakarta', 'Kota'],
  ['Banten', 'Pemerintah Kota Tangerang', 'Kota'],
  ['Lampung', 'Pemerintah Kabupaten Lampung Selatan', 'Kabupaten'],
  ['Riau', 'Pemerintah Kabupaten Kampar', 'Kabupaten'],
  ['Jambi', 'Pemerintah Kabupaten Muaro Jambi', 'Kabupaten'],
  ['Aceh', 'Pemerintah Kota Banda Aceh', 'Kota'],
  ['Sumatera Barat', 'Pemerintah Kabupaten Agam', 'Kabupaten'],
  ['Nusa Tenggara Timur', 'Pemerintah Kabupaten Manggarai', 'Kabupaten'],
  ['Papua', 'Pemerintah Provinsi Papua', 'Provinsi'],
  ['Maluku', 'Pemerintah Provinsi Maluku', 'Provinsi'],
  ['Sulawesi Utara', 'Pemerintah Kabupaten Minahasa', 'Kabupaten'],
  ['Kalimantan Barat', 'Pemerintah Kabupaten Kubu Raya', 'Kabupaten'],
  ['Sumatera Selatan', 'Pemerintah Kabupaten Ogan Ilir', 'Kabupaten'],
  ['Bengkulu', 'Pemerintah Kota Bengkulu', 'Kota'],
  ['Kepulauan Riau', 'Pemerintah Kabupaten Bintan', 'Kabupaten'],
  ['Jawa Barat', 'Pemerintah Kota Bekasi', 'Kota'],
  ['Jawa Tengah', 'Pemerintah Kabupaten Sukoharjo', 'Kabupaten'],
]

const spip = (): DataTable => {
  const rows: string[][] = []
  const n = PEMDA.length
  for (let i = 0; i < 229; i++) {
    const [prov, name, jenis, fixed] = PEMDA[i % n]
    const periode = 2025 - Math.floor(i / n)
    const level = periode === 2025 && fixed ? fixed : 2 + (hashStr(`${name}${periode}`) % 4)
    rows.push([String(periode), prov, name, jenis, LEVELS[level]])
  }
  return {
    columns: [
      { key: 'periode_data', label: 'PERIODE_DATA', desc: 'Periode data, diperbarui setahun sekali', width: 120 },
      { key: 'provinsi', label: 'PROVINSI', desc: 'Provinsi tempat pemerintah daerah berada', width: 210 },
      { key: 'pemerintah_daerah', label: 'PEMERINTAH_DAERAH', desc: 'Nama pemerintah daerah yang dinilai' },
      { key: 'jenis_pemda', label: 'JENIS_PEMDA', desc: 'Jenis pemerintah daerah: provinsi, kabupaten, atau kota', width: 130 },
      { key: 'level_maturitas', label: 'LEVEL_MATURITAS', desc: 'Level maturitas SPIP hasil penilaian (1–5)', width: 250 },
    ],
    rows,
    badgeCol: 4,
    chartCol: 4,
    chartTitle: 'Sebaran level maturitas SPIP',
    unit: '229 baris',
    satuan: 'Level (1–5)',
  }
}

const audit = (): DataTable => {
  const JENIS = ['Audit investigatif', 'Audit penghitungan kerugian negara', 'Pemberian keterangan ahli']
  const INSTANSI = ['Pemerintah Provinsi', 'Pemerintah Kabupaten/Kota', 'Kementerian/Lembaga', 'BUMN/BUMD', 'Desa']
  const rows = Array.from({ length: 36 }, (_, i) => [
    `PENG-${String(2026)}-${String(i + 1).padStart(3, '0')}`,
    JENIS[hashStr(`j${i}`) % JENIS.length],
    INSTANSI[hashStr(`i${i}`) % INSTANSI.length],
  ])
  return {
    columns: [
      { key: 'nomor_penugasan', label: 'NOMOR_PENUGASAN', desc: 'Nomor penugasan audit investigatif', width: 200 },
      { key: 'jenis_penugasan', label: 'JENIS_PENUGASAN', desc: 'Jenis penugasan audit investigatif' },
      { key: 'instansi', label: 'INSTANSI', desc: 'Instansi yang menjadi objek penugasan', width: 260 },
    ],
    rows,
    chartCol: 2,
    chartTitle: 'Penugasan menurut instansi',
    unit: '36 baris',
    satuan: 'Penugasan',
  }
}

const generic = (item: CatalogItem): DataTable => {
  const prov = [...new Set(PEMDA.map((p) => p[0]))]
  const rows: string[][] = []
  for (const periode of [item.tahun, item.tahun - 1]) {
    prov.forEach((p) => {
      const v = 40 + (hashStr(`${item.id}${p}${periode}`) % 5600) / 100
      rows.push([String(periode), p, v.toFixed(2).replace('.', ',')])
    })
  }
  return {
    columns: [
      { key: 'periode_data', label: 'PERIODE_DATA', desc: 'Periode data', width: 140 },
      { key: 'provinsi', label: 'PROVINSI', desc: 'Provinsi', width: 260 },
      { key: 'nilai', label: 'NILAI', desc: 'Nilai indikator menurut provinsi' },
    ],
    rows,
    chartCol: 0,
    chartTitle: 'Jumlah baris menurut periode data',
    unit: `${rows.length} baris`,
    satuan: 'Persen',
  }
}

const cache = new Map<string, DataTable>()
export const tableFor = (item: CatalogItem): DataTable => {
  let t = cache.get(item.id)
  if (!t) {
    t = item.id === 'spip-pemda-2025' ? spip() : item.id === 'ak-audit' ? audit() : generic(item)
    cache.set(item.id, t)
  }
  return t
}
