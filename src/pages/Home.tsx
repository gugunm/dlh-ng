import { useAuth } from '../hooks/useAuth'
import Beranda from './Beranda'
import BerandaProdusen from './BerandaProdusen'
import BerandaWalidata from './BerandaWalidata'

export default function Home() {
  const { role } = useAuth()
  if (role === 'Produsen Data') return <BerandaProdusen />
  if (role === 'Walidata') return <BerandaWalidata />
  return <Beranda />
}
