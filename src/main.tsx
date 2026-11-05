import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@fontsource/montserrat/400.css'
import '@fontsource/montserrat/500.css'
import '@fontsource/montserrat/600.css'
import '@fontsource/montserrat/700.css'
import '@fontsource/montserrat/800.css'
import './styles/base.css'
import './styles/layout.css'
import './styles/palette.css'
import './styles/home.css'
import './styles/search.css'
import './styles/detail.css'
import './styles/roles.css'
import './styles/masuk.css'
import './styles/lists.css'
import './styles/permohonan.css'
import './styles/profil.css'
import App from './App'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
