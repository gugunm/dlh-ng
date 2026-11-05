import { useEffect } from "react";
import {
  BrowserRouter,
  Navigate,
  Outlet,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";
import { Header } from "./components/Header";
import { Footer } from "./components/Footer";
import { ToastProvider } from "./components/Toast";
import { DialogProvider } from "./components/Dialogs";
import { RequestsProvider } from "./hooks/useRequests";
import { AuthProvider, useAuth } from "./hooks/useAuth";
import { WorkflowProvider } from "./hooks/useWorkflow";
import Home from "./pages/Home";
import Masuk from "./pages/Masuk";
import DetailDataset from "./pages/DetailDataset";
import HasilPencarian from "./pages/HasilPencarian";
import DaftarProdusen from "./pages/DaftarProdusen";
import Pemanfaatan from "./pages/Pemanfaatan";

function ScrollToTop() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (!hash) window.scrollTo(0, 0);
  }, [pathname, hash]);
  return null;
}

function Layout() {
  const { authed } = useAuth();
  const location = useLocation();
  if (!authed)
    return (
      <Navigate
        to="/masuk"
        replace
        state={{ from: location.pathname + location.search + location.hash }}
      />
    );
  return (
    <>
      <ScrollToTop />
      <Header />
      <Outlet />
      <Footer />
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <WorkflowProvider>
            <RequestsProvider>
              <DialogProvider>
                <Routes>
                  <Route path="masuk" element={<Masuk />} />
                  <Route element={<Layout />}>
                    <Route index element={<Home />} />
                    <Route path="dataset" element={<HasilPencarian />} />
                    <Route path="dataset/:id" element={<DetailDataset />} />
                    <Route path="produsen" element={<DaftarProdusen />} />
                    <Route path="pemanfaatan" element={<Pemanfaatan />} />
                    <Route
                      path="publikasi"
                      element={
                        <Navigate to="/dataset?jenis=Publikasi" replace />
                      }
                    />
                    <Route
                      path="visualisasi"
                      element={
                        <Navigate to="/dataset?jenis=Visualisasi" replace />
                      }
                    />
                    <Route path="*" element={<Navigate to="/" replace />} />
                  </Route>
                </Routes>
              </DialogProvider>
            </RequestsProvider>
          </WorkflowProvider>
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}
