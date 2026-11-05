import { useEffect } from 'react'
import { BrowserRouter, Navigate, Outlet, Route, Routes, useLocation } from 'react-router-dom'
import { Header } from './components/Header'
import { Footer } from './components/Footer'
import { ToastProvider } from './components/Toast'
import { DialogProvider } from './components/Dialogs'
import { RequestsProvider } from './hooks/useRequests'
import Beranda from './pages/Beranda'
import HasilPencarian from './pages/HasilPencarian'

function ScrollToTop() {
  const { pathname, hash } = useLocation()
  useEffect(() => {
    if (!hash) window.scrollTo(0, 0)
  }, [pathname, hash])
  return null
}

function Layout() {
  return (
    <>
      <ScrollToTop />
      <Header />
      <Outlet />
      <Footer />
    </>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <RequestsProvider>
          <DialogProvider>
            <Routes>
              <Route element={<Layout />}>
                <Route index element={<Beranda />} />
                <Route path="dataset" element={<HasilPencarian />} />
                <Route path="publikasi" element={<Navigate to="/dataset?jenis=Publikasi" replace />} />
                <Route path="visualisasi" element={<Navigate to="/dataset?jenis=Visualisasi" replace />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Route>
            </Routes>
          </DialogProvider>
        </RequestsProvider>
      </ToastProvider>
    </BrowserRouter>
  )
}
