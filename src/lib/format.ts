const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des']
const MONTHS_LONG = [
  'Januari',
  'Februari',
  'Maret',
  'April',
  'Mei',
  'Juni',
  'Juli',
  'Agustus',
  'September',
  'Oktober',
  'November',
  'Desember',
]

const parts = (iso: string) => {
  const [y, m, d] = iso.slice(0, 10).split('-').map(Number)
  return { y, m: m - 1, d }
}

export const fmtDate = (iso: string) => {
  const { y, m, d } = parts(iso)
  return `${d} ${MONTHS[m]} ${y}`
}

export const fmtDateLong = (iso: string) => {
  const { y, m, d } = parts(iso)
  return `${d} ${MONTHS_LONG[m]} ${y}`
}

export const todayIso = () => {
  const n = new Date()
  const pad = (v: number) => String(v).padStart(2, '0')
  return `${n.getFullYear()}-${pad(n.getMonth() + 1)}-${pad(n.getDate())}`
}

export const addDays = (iso: string, days: number) => {
  const { y, m, d } = parts(iso)
  const n = new Date(y, m, d + days)
  const pad = (v: number) => String(v).padStart(2, '0')
  return `${n.getFullYear()}-${pad(n.getMonth() + 1)}-${pad(n.getDate())}`
}

export const downloadTextFile = (filename: string, content: string, mime = 'text/plain') => {
  const blob = new Blob([content], { type: `${mime};charset=utf-8` })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 500)
}

export const slug = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
