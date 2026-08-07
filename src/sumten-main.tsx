import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import SumTenApp from './SumTenApp.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <SumTenApp />
  </StrictMode>,
)
