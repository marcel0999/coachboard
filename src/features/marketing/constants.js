import {
  Activity,
  BookOpen,
  CalendarDays,
  ClipboardList,
  HeartPulse,
  LayoutDashboard,
  Monitor,
  Smartphone,
  Tablet,
  UserCog,
  Users,
} from 'lucide-react'

export const LANDING_NAV = [
  { label: 'Producto', href: '#producto' },
  { label: 'Funciones', href: '#funciones' },
  { label: 'Para entrenadores', href: '#entrenadores' },
  { label: 'Para clubes', href: '#clubes' },
]

export const LANDING_HERO_BADGES = [
  'Para entrenadores',
  'Para clubes',
  'Para cuerpos técnicos',
]

export const LANDING_MODULES = [
  {
    icon: Users,
    title: 'Plantel',
    text: 'Jugadores, categorías, posiciones, fichas y estadísticas.',
  },
  {
    icon: CalendarDays,
    title: 'Entrenamientos',
    text: 'Planificá sesiones y organizá tu semana.',
  },
  {
    icon: ClipboardList,
    title: 'Pizarra táctica',
    text: 'Diseñá sistemas, movimientos y ejercicios.',
  },
  {
    icon: LayoutDashboard,
    title: 'Partidos',
    text: 'Convocatorias, titulares, resultados y seguimiento.',
  },
  {
    icon: HeartPulse,
    title: 'Área médica',
    text: 'Lesiones, estados, controles y alertas.',
  },
  {
    icon: Activity,
    title: 'Rendimiento',
    text: 'Datos y seguimiento del rendimiento deportivo.',
  },
  {
    icon: UserCog,
    title: 'Cuerpo técnico',
    text: 'Organizá roles y accesos del staff.',
  },
  {
    icon: BookOpen,
    title: 'Biblioteca',
    text: 'Guardá ejercicios y contenidos de entrenamiento.',
  },
]

export const LANDING_PITCH_POINTS = [
  'Formaciones tácticas',
  'Jugadores arrastrables',
  'Elementos de entrenamiento',
  'Guardado de pizarras',
  'Biblioteca táctica',
]

export const LANDING_AUDIENCE = [
  {
    id: 'entrenadores',
    title: 'Entrenadores',
    text: 'Tu cuerpo técnico, tu metodología y tu planificación siempre con vos.',
    benefits: ['Planificación semanal', 'Plantel', 'Tácticas', 'Ejercicios', 'Partidos'],
  },
  {
    id: 'clubes',
    title: 'Clubes',
    text: 'Una estructura deportiva organizada desde juveniles hasta Primera.',
    benefits: ['Múltiples categorías', 'Jugadores', 'Médicos', 'Cuerpos técnicos', 'Permisos y accesos'],
  },
]

export const LANDING_DEVICES = [
  { icon: Monitor, label: 'Web' },
  { icon: Tablet, label: 'Tablet' },
  { icon: Smartphone, label: 'Móvil' },
]

export const LANDING_FOOTER_LINKS = [
  { label: 'Producto', href: '#producto' },
  { label: 'Funciones', href: '#funciones' },
  { label: 'Entrenadores', href: '#entrenadores' },
  { label: 'Clubes', href: '#clubes' },
  { label: 'Privacidad', href: '#privacidad' },
  { label: 'Términos', href: '#terminos' },
]
