import { StrictMode } from 'react'

import { createRoot } from 'react-dom/client'

import { BrowserRouter } from 'react-router-dom'

import SupabaseGate from './components/auth/SupabaseGate.jsx'
import AppErrorBoundary from './components/ui/AppErrorBoundary.jsx'

import { AuthProvider } from './context/AuthContext.jsx'

import App from './App.jsx'

import './index.css'



createRoot(document.getElementById('root')).render(

  <StrictMode>

    <AppErrorBoundary>

      <SupabaseGate>

        <BrowserRouter>

          <AuthProvider>

            <App />

          </AuthProvider>

        </BrowserRouter>

      </SupabaseGate>

    </AppErrorBoundary>

  </StrictMode>,

)

