import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { BrowserRouter } from 'react-router-dom'
import {HelmetProvider} from 'react-helmet-async'

const SafeHelmentprovider= HelmetProvider as any 

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <SafeHelmentprovider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </SafeHelmentprovider>
  </StrictMode>,
)
