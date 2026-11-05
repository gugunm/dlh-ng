import { useState } from 'react'
import { Link } from 'react-router-dom'
import { MapPin, Phone, Mail, ShieldCheck, PhoneCall, ChevronDown } from 'lucide-react'
import whiteLogo from '../assets/bpkp/bpkp-putih-hd.png'
import hadir from '../assets/bpkp/hadir-bermanfaat.png'
import { useToast } from './Toast'

export function Footer() {
  const toast = useToast()
  const [sitemap, setSitemap] = useState(false)
  const soon = (label: string) => toast.show(`${label} belum tersedia pada prototipe ini.`, 'info')

  return (
    <footer className="footer">
      <div className="footer__sitemap">
        <button
          type="button"
          className="footer__sitemap-gray"
          aria-expanded={sitemap}
          onClick={() => setSitemap((v) => !v)}
        >
          Peta Situs
          <ChevronDown size={16} className={sitemap ? 'is-flipped' : ''} />
        </button>
        <span className="footer__sitemap-red" />
      </div>
      {sitemap && (
        <div className="footer__sitemap-panel">
          <Link to="/">Beranda</Link>
          <Link to="/dataset">Dataset</Link>
          <Link to="/produsen">Daftar Produsen</Link>
          <Link to="/pemanfaatan">Pemanfaatan Data</Link>
          <Link to="/dataset?jenis=Publikasi">Publikasi</Link>
          <Link to="/dataset?jenis=Visualisasi">Visualisasi</Link>
          <Link to="/permohonan">Permohonan Saya</Link>
          <Link to={{ pathname: '/', hash: '#sdi' }}>Prinsip Satu Data Indonesia</Link>
        </div>
      )}

      <div className="footer__body">
        <div className="footer__cols">
          <div className="footer__brand">
            <img src={whiteLogo} alt="BPKP" className="footer__logo" />
            <img src={hadir} alt="Hadir dan bermanfaat" className="footer__hadir" />
          </div>
          <div className="footer__org">
            <h3>Badan Pengawasan Keuangan dan Pembangunan</h3>
            <p>
              <MapPin size={16} /> Jl. Pramuka No. 33 Jakarta Timur, 13120
            </p>
            <p>
              <Phone size={16} /> (021) 85910031, Faksimile (021) 85910030
            </p>
            <p>
              <Mail size={16} /> <a href="mailto:humas@bpkp.go.id">humas@bpkp.go.id</a>
            </p>
            <p>
              <ShieldCheck size={16} />{' '}
              <button type="button" className="footer__link" onClick={() => soon('Kebijakan Privasi')}>
                Kebijakan Privasi
              </button>
            </p>
          </div>
          <div className="footer__links">
            <h4>Katalog Data</h4>
            <Link to="/dataset">Dataset</Link>
            <Link to="/produsen">Daftar Produsen</Link>
            <Link to="/pemanfaatan">Pemanfaatan Data</Link>
            <Link to="/dataset?jenis=Publikasi">Publikasi</Link>
            <Link to="/dataset?jenis=Visualisasi">Visualisasi</Link>
            <button type="button" className="footer__link" onClick={() => soon('Panduan Pengguna')}>
              Panduan Pengguna
            </button>
            <button type="button" className="footer__link" onClick={() => soon('Permohonan Informasi (PPID)')}>
              Permohonan Informasi (PPID)
            </button>
          </div>
        </div>
        <hr />
        <div className="footer__bottom">
          <div>
            <p>Media Komunikasi, Informasi, dan Pengetahuan Pengawas Internal Pemerintah</p>
            <p>© 2026 Badan Pengawasan Keuangan dan Pembangunan</p>
          </div>
          <button type="button" className="footer__complaint" onClick={() => soon('Kanal Pengaduan')}>
            <PhoneCall size={22} /> Kanal Pengaduan
          </button>
        </div>
      </div>
    </footer>
  )
}
