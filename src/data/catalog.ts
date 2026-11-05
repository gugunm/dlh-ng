export type ContentType =
  | 'Dataset'
  | 'Visualisasi'
  | 'Artikel'
  | 'Infografis'
  | 'Publikasi'
  | 'Analisis'
  | 'Produk Pengawasan'
  | 'Peta'

export type Sifat = 'Terbuka' | 'Terbatas'

export interface CatalogItem {
  id: string
  title: string
  type: ContentType
  topik: string
  source: string
  sifat: Sifat
  tahun: number
  date: string
  tags: string[]
  description: string
}

export const CONTENT_TYPES: ContentType[] = [
  'Dataset',
  'Visualisasi',
  'Artikel',
  'Infografis',
  'Publikasi',
  'Analisis',
  'Produk Pengawasan',
  'Peta',
]

export const SIFAT_OPTIONS: Sifat[] = ['Terbuka', 'Terbatas']
export const TAHUN_OPTIONS = [2026, 2025, 2024]
export const TOPIK_OPTIONS = [
  'SPIP',
  'Kapabilitas APIP',
  'Keuangan Daerah',
  'Dana Desa',
  'Pengadaan Barang/Jasa',
  'Akuntabilitas Kinerja',
]

const i = (
  id: string,
  title: string,
  type: ContentType,
  topik: string,
  sifat: Sifat,
  tahun: number,
  date: string,
  tags: string[],
  description: string,
  source: string = topik,
): CatalogItem => ({ id, title, type, topik, source, sifat, tahun, date, tags, description })

export const CATALOG: CatalogItem[] = [
  i('spip-pemda-2025', 'Indeks Maturitas SPIP Pemerintah Daerah Tahun 2025', 'Dataset', 'SPIP', 'Terbuka', 2025, '2026-11-05', ['SPIP', 'Maturitas', 'Pemerintah Daerah'], 'Tingkat maturitas penyelenggaraan Sistem Pengendalian Intern Pemerintah (SPIP) pada pemerintah provinsi, kabupaten, dan kota hasil penilaian BPKP.'),
  i('spip-kl-2025', 'Indeks Maturitas SPIP Kementerian/Lembaga Tahun 2025', 'Dataset', 'SPIP', 'Terbuka', 2025, '2026-10-28', ['SPIP', 'Maturitas', 'Kementerian/Lembaga'], 'Hasil penilaian tingkat maturitas penyelenggaraan SPIP pada kementerian dan lembaga beserta nilai indeks setiap unsur.'),
  i('spip-level', 'Daftar Pemerintah Daerah Menurut Tingkat Maturitas SPIP', 'Dataset', 'SPIP', 'Terbuka', 2025, '2026-10-21', ['SPIP', 'Level Maturitas'], 'Pengelompokan pemerintah daerah berdasarkan level maturitas SPIP, dari Rintisan hingga Optimal.'),
  i('spip-pelaporan', 'Hasil Penilaian Pengendalian Intern atas Pelaporan Keuangan', 'Dataset', 'SPIP', 'Terbatas', 2025, '2026-10-14', ['SPIP', 'Pelaporan Keuangan'], 'Rekapitulasi hasil penilaian efektivitas pengendalian intern atas pelaporan keuangan pada instansi pemerintah.'),
  i('spip-terintegrasi', 'Jumlah Instansi yang Menyelenggarakan SPIP Terintegrasi', 'Dataset', 'SPIP', 'Terbuka', 2025, '2026-10-09', ['SPIP Terintegrasi', 'Instansi'], 'Jumlah instansi pemerintah yang telah menerapkan SPIP terintegrasi menurut jenis instansi dan tahun penilaian.'),
  i('spip-rtp', 'Rekapitulasi Rencana Tindak Pengendalian atas Risiko Prioritas', 'Dataset', 'SPIP', 'Terbuka', 2025, '2026-10-02', ['Risiko', 'Rencana Tindak'], 'Rekapitulasi rencana tindak pengendalian atas risiko prioritas hasil penilaian risiko penyelenggaraan SPIP.'),
  i('spip-pembinaan', 'Data Pelaksanaan Pembinaan dan Penguatan SPIP', 'Dataset', 'SPIP', 'Terbuka', 2025, '2026-09-25', ['Pembinaan', 'Penguatan SPIP'], 'Jumlah kegiatan pembinaan dan penguatan penyelenggaraan SPIP kepada instansi pemerintah menurut wilayah.'),
  i('spip-bumd', 'Penilaian Risiko Penyelenggaraan SPIP pada BUMD', 'Dataset', 'SPIP', 'Terbatas', 2025, '2026-09-18', ['BUMD', 'Penilaian Risiko'], 'Hasil penilaian risiko penyelenggaraan SPIP pada badan usaha milik daerah.'),

  i('apip-peta', 'Peta Sebaran Kapabilitas APIP Kementerian/Lembaga dan Pemerintah Daerah', 'Visualisasi', 'Kapabilitas APIP', 'Terbuka', 2026, '2026-11-04', ['Kapabilitas APIP', 'Peta', 'Sebaran'], 'Visualisasi peta sebaran level kapabilitas Aparat Pengawasan Intern Pemerintah (APIP) pada kementerian, lembaga, dan pemerintah daerah.'),
  i('dd-realisasi', 'Realisasi Belanja Dana Desa Menurut Provinsi Tahun 2026', 'Dataset', 'Dana Desa', 'Terbuka', 2026, '2026-11-03', ['Dana Desa', 'Realisasi', 'Provinsi'], 'Realisasi belanja Dana Desa per provinsi menurut bidang penggunaan sampai dengan triwulan III 2026.'),
  i('ak-pupuk', 'BPKP Perkuat Pengawasan Akuntabilitas Penyaluran Subsidi Pupuk', 'Artikel', 'Akuntabilitas Kinerja', 'Terbuka', 2026, '2026-11-03', ['Subsidi Pupuk', 'Pengawasan'], 'Berita pengawasan tentang penguatan akuntabilitas penyaluran subsidi pupuk bersama kementerian dan pemerintah daerah.', 'Berita Pengawasan'),
  i('pbj-ringkasan', 'Ringkasan Pengawasan Pengadaan Barang/Jasa Pemerintah 2026', 'Infografis', 'Pengadaan Barang/Jasa', 'Terbuka', 2026, '2026-10-31', ['Pengadaan', 'Ringkasan'], 'Infografis ringkasan hasil pengawasan pengadaan barang/jasa pemerintah tahun 2026.', 'Pengadaan'),
  i('kd-bumd', 'Hasil Evaluasi Tata Kelola Badan Usaha Milik Daerah (BUMD)', 'Dataset', 'Keuangan Daerah', 'Terbuka', 2026, '2026-10-29', ['BUMD', 'Tata Kelola', 'Evaluasi'], 'Hasil evaluasi tata kelola BUMD pada pemerintah provinsi, kabupaten, dan kota.'),
  i('ak-bansos', 'Analisis Risiko Penyaluran Bantuan Sosial Triwulan III 2026', 'Analisis', 'Akuntabilitas Kinerja', 'Terbatas', 2026, '2026-10-28', ['Bantuan Sosial', 'Analisis Risiko'], 'Analisis risiko penyaluran bantuan sosial berdasarkan data penerima dan realisasi triwulan III 2026.', 'Analisis Risiko'),
  i('ak-kantor', 'Sebaran Kantor Perwakilan BPKP di Seluruh Provinsi', 'Dataset', 'Akuntabilitas Kinerja', 'Terbuka', 2026, '2026-10-27', ['Kelembagaan', 'Perwakilan'], 'Daftar dan koordinat kantor perwakilan BPKP di seluruh provinsi.', 'Kelembagaan'),

  i('spip-2024-pemda', 'Indeks Maturitas SPIP Pemerintah Daerah Tahun 2024', 'Dataset', 'SPIP', 'Terbuka', 2024, '2024-11-12', ['SPIP', 'Maturitas', 'Pemerintah Daerah'], 'Tingkat maturitas penyelenggaraan SPIP pada pemerintah provinsi, kabupaten, dan kota hasil penilaian BPKP tahun 2024.'),
  i('spip-2024-kl', 'Indeks Maturitas SPIP Kementerian/Lembaga Tahun 2024', 'Dataset', 'SPIP', 'Terbuka', 2024, '2024-11-05', ['SPIP', 'Maturitas', 'Kementerian/Lembaga'], 'Hasil penilaian tingkat maturitas penyelenggaraan SPIP pada kementerian dan lembaga tahun 2024.'),
  i('spip-infografis', 'Infografis Capaian Penerapan SPIP 2026', 'Infografis', 'SPIP', 'Terbuka', 2026, '2026-10-20', ['SPIP', 'Capaian'], 'Ringkasan visual capaian penerapan SPIP pada instansi pemerintah tahun 2026.'),
  i('spip-peta', 'Peta Maturitas SPIP Pemerintah Daerah', 'Peta', 'SPIP', 'Terbuka', 2025, '2025-12-10', ['SPIP', 'Peta', 'Maturitas'], 'Peta tematik tingkat maturitas SPIP pemerintah daerah di seluruh Indonesia.'),
  i('spip-panduan', 'Panduan Penyelenggaraan SPIP Terintegrasi', 'Publikasi', 'SPIP', 'Terbuka', 2025, '2025-09-15', ['SPIP Terintegrasi', 'Panduan'], 'Panduan langkah penyelenggaraan SPIP terintegrasi bagi instansi pemerintah.'),
  i('spip-artikel', 'BPKP Dorong Peningkatan Maturitas SPIP di Daerah', 'Artikel', 'SPIP', 'Terbuka', 2026, '2026-09-30', ['SPIP', 'Pembinaan'], 'Berita pembinaan penyelenggaraan SPIP kepada pemerintah daerah.', 'Berita Pengawasan'),
  i('spip-tl-2026', 'Data Tindak Lanjut Hasil Evaluasi SPIP Tahun 2026', 'Dataset', 'SPIP', 'Terbatas', 2026, '2026-10-12', ['SPIP', 'Tindak Lanjut'], 'Status tindak lanjut rekomendasi hasil evaluasi penyelenggaraan SPIP tahun 2026.'),
  i('spip-dasbor', 'Dasbor Perkembangan Maturitas SPIP 2020–2025', 'Visualisasi', 'SPIP', 'Terbuka', 2025, '2025-12-20', ['SPIP', 'Tren', 'Maturitas'], 'Dasbor interaktif perkembangan indeks maturitas SPIP dari tahun 2020 hingga 2025.'),

  i('apip-2025', 'Hasil Penilaian Kapabilitas APIP Tahun 2025', 'Dataset', 'Kapabilitas APIP', 'Terbuka', 2025, '2025-12-02', ['Kapabilitas APIP', 'Penilaian'], 'Level kapabilitas APIP hasil penilaian mandiri dan reviu BPKP tahun 2025.'),
  i('apip-rekap', 'Rekapitulasi Penilaian Kapabilitas APIP', 'Dataset', 'Kapabilitas APIP', 'Terbuka', 2026, '2026-08-14', ['Kapabilitas APIP', 'Rekapitulasi'], 'Rekapitulasi hasil penilaian kapabilitas APIP menurut level dan jenis instansi.'),
  i('apip-provinsi', 'Level Kapabilitas APIP Menurut Provinsi', 'Dataset', 'Kapabilitas APIP', 'Terbuka', 2024, '2024-10-09', ['Kapabilitas APIP', 'Provinsi'], 'Distribusi level kapabilitas APIP pada pemerintah daerah menurut provinsi.'),
  i('apip-profil', 'Profil Auditor dan Jumlah Pegawai APIP', 'Dataset', 'Kapabilitas APIP', 'Terbatas', 2025, '2025-08-21', ['APIP', 'Auditor', 'SDM'], 'Jumlah dan sebaran auditor serta pegawai APIP pada kementerian, lembaga, dan pemerintah daerah.'),
  i('apip-peta-prov', 'Peta Level Kapabilitas APIP Provinsi', 'Peta', 'Kapabilitas APIP', 'Terbuka', 2026, '2026-07-07', ['Kapabilitas APIP', 'Peta'], 'Peta tematik level kapabilitas APIP pada tingkat provinsi.'),

  i('kd-apbd', 'Realisasi APBD Pemerintah Provinsi Tahun 2025', 'Dataset', 'Keuangan Daerah', 'Terbuka', 2025, '2026-03-18', ['APBD', 'Realisasi', 'Provinsi'], 'Realisasi pendapatan dan belanja APBD pemerintah provinsi tahun anggaran 2025.'),
  i('kd-opini', 'Opini Laporan Keuangan Pemerintah Daerah', 'Dataset', 'Keuangan Daerah', 'Terbuka', 2025, '2026-02-10', ['Opini', 'Laporan Keuangan'], 'Opini atas laporan keuangan pemerintah daerah menurut provinsi, kabupaten, dan kota.'),
  i('kd-analisis', 'Analisis Kinerja Keuangan Daerah Triwulan II 2026', 'Analisis', 'Keuangan Daerah', 'Terbuka', 2026, '2026-08-05', ['Keuangan Daerah', 'Kinerja'], 'Analisis kinerja keuangan pemerintah daerah berdasarkan realisasi triwulan II 2026.'),
  i('kd-penyertaan', 'Daftar BUMD dan Status Penyertaan Modal', 'Dataset', 'Keuangan Daerah', 'Terbatas', 2025, '2025-10-17', ['BUMD', 'Penyertaan Modal'], 'Daftar BUMD beserta nilai dan status penyertaan modal pemerintah daerah.'),
  i('kd-ikhtisar', 'Ikhtisar Hasil Pengawasan Keuangan Daerah 2025', 'Produk Pengawasan', 'Keuangan Daerah', 'Terbuka', 2025, '2026-01-22', ['Ikhtisar', 'Pengawasan'], 'Ikhtisar hasil pengawasan atas pengelolaan keuangan daerah tahun 2025.'),

  i('dd-penyaluran', 'Penyaluran Dana Desa Tahap I–III Tahun 2025', 'Dataset', 'Dana Desa', 'Terbuka', 2025, '2025-12-15', ['Dana Desa', 'Penyaluran'], 'Realisasi penyaluran Dana Desa tahap I sampai III menurut kabupaten/kota.'),
  i('dd-kinerja', 'Data Kinerja Pengawasan Dana Desa', 'Dataset', 'Dana Desa', 'Terbuka', 2026, '2026-09-09', ['Dana Desa', 'Pengawasan'], 'Capaian kegiatan pengawasan pengelolaan Dana Desa menurut wilayah.'),
  i('dd-pangan', 'Infografis Penggunaan Dana Desa untuk Ketahanan Pangan', 'Infografis', 'Dana Desa', 'Terbuka', 2025, '2025-11-03', ['Dana Desa', 'Ketahanan Pangan'], 'Ringkasan visual porsi penggunaan Dana Desa untuk program ketahanan pangan.'),
  i('dd-pendampingan', 'Hasil Pendampingan Pengelolaan Keuangan Desa', 'Dataset', 'Dana Desa', 'Terbatas', 2024, '2024-12-04', ['Keuangan Desa', 'Pendampingan'], 'Rekapitulasi hasil pendampingan pengelolaan keuangan desa oleh perwakilan BPKP.'),

  i('pbj-sem1', 'Realisasi Pengawasan Pengadaan Barang/Jasa Semester I 2026', 'Dataset', 'Pengadaan Barang/Jasa', 'Terbuka', 2026, '2026-09-02', ['Pengadaan', 'Realisasi'], 'Realisasi kegiatan pengawasan pengadaan barang/jasa pemerintah semester I 2026.'),
  i('pbj-risiko', 'Paket Pengadaan Berisiko Tinggi Tahun 2025', 'Dataset', 'Pengadaan Barang/Jasa', 'Terbatas', 2025, '2025-11-27', ['Pengadaan', 'Risiko'], 'Daftar paket pengadaan dengan tingkat risiko tinggi hasil pemetaan risiko.'),
  i('pbj-buletin', 'Buletin Pengawasan Pengadaan Edisi Oktober 2026', 'Publikasi', 'Pengadaan Barang/Jasa', 'Terbuka', 2026, '2026-10-14', ['Buletin', 'Pengadaan'], 'Buletin bulanan pengawasan pengadaan barang/jasa pemerintah.'),
  i('pbj-panduan', 'Panduan Reviu Pengadaan Barang/Jasa', 'Produk Pengawasan', 'Pengadaan Barang/Jasa', 'Terbuka', 2024, '2024-08-19', ['Panduan', 'Reviu'], 'Pedoman pelaksanaan reviu pengadaan barang/jasa bagi APIP.'),

  i('ak-audit', 'Rekapitulasi Penugasan Audit Investigatif Tahun 2026', 'Dataset', 'Akuntabilitas Kinerja', 'Terbatas', 2026, '2026-09-30', ['Audit Investigatif', 'Penugasan'], 'Rekapitulasi penugasan audit investigatif menurut jenis penugasan dan unit kerja.'),
  i('ak-akip', 'Nilai Evaluasi AKIP Kementerian/Lembaga 2025', 'Dataset', 'Akuntabilitas Kinerja', 'Terbuka', 2025, '2026-01-30', ['AKIP', 'Evaluasi'], 'Nilai dan predikat evaluasi akuntabilitas kinerja instansi pemerintah.'),
  i('ak-semester', 'Ikhtisar Hasil Pengawasan Semester I 2026', 'Publikasi', 'Akuntabilitas Kinerja', 'Terbuka', 2026, '2026-10-08', ['Ikhtisar', 'Semester I'], 'Ikhtisar hasil pengawasan BPKP semester I tahun 2026.'),
  i('ak-kinerja', 'Infografis Capaian Kinerja BPKP 2025', 'Infografis', 'Akuntabilitas Kinerja', 'Terbuka', 2025, '2026-02-17', ['Kinerja', 'BPKP'], 'Ringkasan visual capaian kinerja BPKP tahun 2025.'),
  i('ak-lakip', 'Laporan Kinerja Instansi Pemerintah 2025', 'Publikasi', 'Akuntabilitas Kinerja', 'Terbuka', 2025, '2026-03-31', ['LAKIP', 'Kinerja'], 'Laporan kinerja instansi pemerintah tahun 2025.'),
]

export const HOME_FEATURED_IDS = [
  'spip-pemda-2025',
  'apip-peta',
  'dd-realisasi',
  'ak-pupuk',
  'pbj-ringkasan',
  'kd-bumd',
  'ak-bansos',
  'ak-kantor',
]

export const itemById = (id: string) => CATALOG.find((c) => c.id === id)
