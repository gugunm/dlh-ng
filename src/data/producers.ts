export interface Producer {
  id: string
  name: string
  dataset: number
  layanan: number
  pemanfaatan: number
  /** order added to the catalog, higher = newer */
  added: number
  /** keyword used by the "Lihat Dataset" shortcut */
  keyword?: string
}

// [name, dataset, layanan, pemanfaatan, keyword]
const BASE: [string, number, number, number, string?][] = [
  ['Deputi Bidang Pengawasan Penyelenggaraan Keuangan Daerah', 46, 3, 4, 'SPIP'],
  ['Deputi Bidang Investigasi', 18, 0, 1, 'Investigasi'],
  ['Perwakilan BPKP Provinsi Jawa Barat', 12, 0, 2],
  ['Perwakilan BPKP Provinsi Jawa Tengah', 9, 0, 0],
  ['Perwakilan BPKP Provinsi Jawa Timur', 11, 1, 1],
  ['Perwakilan BPKP Provinsi Sumatera Utara', 7, 0, 0],
  ['Perwakilan BPKP Provinsi Sulawesi Selatan', 0, 0, 1],
  ['Perwakilan BPKP Provinsi Bali', 6, 0, 0],
  ['Perwakilan BPKP Provinsi Kalimantan Timur', 5, 0, 1],
  ['Perwakilan BPKP Provinsi Daerah Istimewa Yogyakarta', 4, 0, 0],
  ['Perwakilan BPKP Provinsi Nusa Tenggara Barat', 3, 0, 0],
  ['Perwakilan BPKP Provinsi Sumatera Barat', 3, 0, 0],
  // Not in the design excerpt: added so the list reaches the 38 producers shown in the design.
  ['Perwakilan BPKP Provinsi Aceh', 3, 0, 0],
  ['Perwakilan BPKP Provinsi Riau', 2, 1, 0],
  ['Perwakilan BPKP Provinsi Kepulauan Riau', 2, 0, 0],
  ['Perwakilan BPKP Provinsi Jambi', 2, 0, 1],
  ['Perwakilan BPKP Provinsi Sumatera Selatan', 4, 0, 0],
  ['Perwakilan BPKP Provinsi Bengkulu', 1, 0, 0],
  ['Perwakilan BPKP Provinsi Lampung', 3, 0, 0],
  ['Perwakilan BPKP Provinsi Kepulauan Bangka Belitung', 0, 0, 1],
  ['Perwakilan BPKP Provinsi DKI Jakarta', 8, 1, 2],
  ['Perwakilan BPKP Provinsi Banten', 3, 0, 0],
  ['Perwakilan BPKP Provinsi Kalimantan Barat', 2, 0, 0],
  ['Perwakilan BPKP Provinsi Kalimantan Tengah', 2, 0, 0],
  ['Perwakilan BPKP Provinsi Kalimantan Selatan', 3, 0, 1],
  ['Perwakilan BPKP Provinsi Kalimantan Utara', 1, 0, 0],
  ['Perwakilan BPKP Provinsi Sulawesi Utara', 2, 0, 0],
  ['Perwakilan BPKP Provinsi Sulawesi Tengah', 2, 0, 0],
  ['Perwakilan BPKP Provinsi Sulawesi Tenggara', 1, 0, 0],
  ['Perwakilan BPKP Provinsi Gorontalo', 1, 0, 0],
  ['Perwakilan BPKP Provinsi Sulawesi Barat', 0, 0, 1],
  ['Perwakilan BPKP Provinsi Maluku', 2, 0, 0],
  ['Perwakilan BPKP Provinsi Maluku Utara', 1, 0, 0],
  ['Perwakilan BPKP Provinsi Nusa Tenggara Timur', 2, 0, 0],
  ['Perwakilan BPKP Provinsi Papua', 2, 0, 1],
  ['Perwakilan BPKP Provinsi Papua Barat', 1, 0, 0],
  ['Deputi Bidang Pengawasan Instansi Pemerintah Pusat', 14, 2, 3],
  ['Deputi Bidang Akuntan Negara', 6, 0, 1],
]

export const PRODUCERS: Producer[] = BASE.map(([name, dataset, layanan, pemanfaatan, keyword], i) => ({
  id: `prod-${i + 1}`,
  name,
  dataset,
  layanan,
  pemanfaatan,
  added: BASE.length - i,
  keyword,
}))

export type AssetKey = 'dataset' | 'layanan' | 'pemanfaatan'
export const ASSET_LABEL: Record<AssetKey, string> = {
  dataset: 'Dataset',
  layanan: 'Layanan Data',
  pemanfaatan: 'Pemanfaatan Data',
}
