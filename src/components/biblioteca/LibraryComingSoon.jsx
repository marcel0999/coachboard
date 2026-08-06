import { Sparkles } from 'lucide-react'
import EmptyState from '../ui/EmptyState'

export default function LibraryComingSoon({ sectionLabel }) {
  return (
    <EmptyState
      icon={Sparkles}
      title={`${sectionLabel} — Próximamente`}
      description="Esta sección está preparada en la arquitectura de Biblioteca. En la próxima etapa podrás gestionar microciclos, planificaciones, videos y documentos desde aquí."
      className="py-20"
    />
  )
}
