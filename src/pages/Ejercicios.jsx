import { Clock, Filter, Plus } from 'lucide-react'
import Badge from '../components/ui/Badge'
import { Card } from '../components/ui/Card'
import PageHeader from '../components/ui/PageHeader'
import CategorySelector from '../components/categories/CategorySelector'
import { useAppData, useCategoryScope } from '../context/AppDataContext'

function intensityVariant(intensity) {
  switch (intensity) {
    case 'Alta':
      return 'danger'
    case 'Media':
      return 'warning'
    default:
      return 'success'
  }
}

export default function Ejercicios() {
  const { exercises } = useAppData()
  const { categories, selectedCategoryId, setSelectedCategoryId } = useCategoryScope()

  return (
    <div>
      <PageHeader
        title="Ejercicios"
        description="Biblioteca compartida con el módulo de Entrenamientos"
        action={
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white transition hover:bg-accent-hover"
          >
            <Plus className="h-4 w-4" />
            Nuevo ejercicio
          </button>
        }
      />

      <Card className="mb-6">
        <CategorySelector
          categories={categories}
          value={selectedCategoryId}
          onChange={setSelectedCategoryId}
          includeAll
        />
        <p className="mt-3 text-sm text-text-secondary">
          La biblioteca de ejercicios es compartida por todo el club. El selector define el contexto activo del resto de módulos.
        </p>
      </Card>

      <Card className="mb-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Filter className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
            <input
              type="search"
              placeholder="Buscar ejercicios..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-accent focus:bg-white focus:ring-2 focus:ring-accent/20"
            />
          </div>
          <select className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/20">
            <option value="">Todas las categorías</option>
            <option value="posesion">Posesión</option>
            <option value="transicion">Transición</option>
            <option value="tactica">Táctica</option>
            <option value="finalizacion">Finalización</option>
          </select>
        </div>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        {exercises.map((exercise) => (
          <Card key={exercise.id} className="flex flex-col">
            <div className="mb-3 flex items-start gap-4">
              <div className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-xl ${exercise.imageColor} text-xl font-bold text-white`}>
                {exercise.category[0]}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-base font-semibold text-text-primary">{exercise.title}</h3>
                    <p className="mt-1 text-sm text-text-secondary">{exercise.category}</p>
                  </div>
                  <Badge variant={intensityVariant(exercise.intensity)}>{exercise.intensity}</Badge>
                </div>
                <p className="mt-2 text-xs text-accent">{exercise.objective}</p>
              </div>
            </div>

            <p className="flex-1 text-sm leading-relaxed text-text-secondary">{exercise.description}</p>

            <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4">
              <span className="inline-flex items-center gap-1.5 text-xs text-text-muted">
                <Clock className="h-3.5 w-3.5" />
                {exercise.duration} min
              </span>
              <span className="text-xs text-text-muted">Usado en Entrenamientos</span>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
