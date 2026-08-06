import {
  CalendarDays,
  ClipboardList,
  LayoutDashboard,
  Library,
  Shield,
  Users,
  Zap,
} from 'lucide-react'

export const LANDING_FEATURES = [
  {
    icon: Shield,
    title: 'Acceso seguro',
    text: 'Autenticación Supabase, roles por club y datos aislados entre organizaciones.',
  },
  {
    icon: Users,
    title: 'Cuerpo técnico conectado',
    text: 'Invitaciones, permisos granulares y trabajo colaborativo en tiempo real.',
  },
  {
    icon: Zap,
    title: 'Siempre sincronizado',
    text: 'Misma información en notebook, tablet y celular — sin archivos sueltos.',
  },
]

export const LANDING_MODULES = [
  { icon: LayoutDashboard, label: 'Dashboard', status: 'MVP' },
  { icon: Users, label: 'Plantel', status: 'MVP' },
  { icon: Library, label: 'Biblioteca', status: 'MVP' },
  { icon: ClipboardList, label: 'Pizarra táctica', status: 'MVP' },
  { icon: CalendarDays, label: 'Planificador', status: 'Próximo' },
]

export const LANDING_STATS = [
  { value: '1', label: 'Plataforma unificada' },
  { value: '100%', label: 'En la nube' },
  { value: 'RLS', label: 'Seguridad por club' },
]
