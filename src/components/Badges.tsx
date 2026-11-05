import {
  Database,
  FileText,
  Image as ImageIcon,
  ChartLine,
  Map as MapIcon,
  type LucideIcon,
} from 'lucide-react'
import type { ContentType, Sifat } from '../data/catalog'
import type { RequestStatus } from '../hooks/useRequests'

export const TYPE_ICONS: Record<ContentType, LucideIcon> = {
  Dataset: Database,
  Visualisasi: MapIcon,
  Artikel: FileText,
  Infografis: ImageIcon,
  Publikasi: FileText,
  Analisis: ChartLine,
  'Produk Pengawasan': FileText,
  Peta: MapIcon,
}

export function AccessBadge({ sifat }: { sifat: Sifat }) {
  return (
    <span className={`badge ${sifat === 'Terbuka' ? 'badge--green' : 'badge--red'}`}>{sifat}</span>
  )
}

export function StatusBadge({ status }: { status: RequestStatus }) {
  const tone = status === 'Diproses' ? 'blue' : status === 'Disetujui' ? 'green' : 'red'
  return <span className={`status status--${tone}`}>{status}</span>
}
