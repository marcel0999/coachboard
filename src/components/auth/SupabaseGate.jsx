import { isSupabaseConfigured } from '../../lib/supabase'
import Logo from '../layout/Logo'

export default function SupabaseGate({ children }) {
  if (isSupabaseConfigured) {
    return children
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface px-6">
      <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <Logo compact />
        <h1 className="mt-6 text-xl font-bold text-text-primary">Configuración requerida</h1>
        <p className="mt-3 text-sm leading-relaxed text-text-secondary">
          CoachBoard utiliza <strong>Supabase</strong> como base de datos y sistema de autenticación.
          Para ejecutar la aplicación, configurá las variables de entorno:
        </p>
        <pre className="mt-4 overflow-x-auto rounded-xl bg-slate-900 p-4 text-xs text-slate-100">
{`VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu-anon-key`}
        </pre>
        <p className="mt-4 text-sm text-text-secondary">
          Consultá <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs">SUPABASE_SETUP.md</code>{' '}
          para el schema SQL, políticas RLS y pasos de deploy en Vercel.
        </p>
      </div>
    </div>
  )
}
