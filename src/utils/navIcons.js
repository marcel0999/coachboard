import { LayoutDashboard, Users, ClipboardList, Dumbbell, Trophy, CalendarDays, Activity, HeartPulse, UserCog, Settings } from 'lucide-react'

const ICON_MAP = {
  '/': LayoutDashboard,
  '/plantel': Users,
  '/partidos': Trophy,
  '/entrenamientos': CalendarDays,
  '/rendimiento': Activity,
  '/medico': HeartPulse,
  '/staff': UserCog,
  '/pizarra': ClipboardList,
  '/ejercicios': Dumbbell,
  '/configuracion': Settings,
}

export function getNavIcon(path) {
  return ICON_MAP[path] ?? LayoutDashboard
}
