import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import Launch from './components/launch/launch.tsx' 
import { BrowserRouter } from 'react-router-dom'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
     <Launch/>
    </BrowserRouter>
  </StrictMode>,
)
