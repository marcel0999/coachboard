import { Clock, Plus } from 'lucide-react'
import Badge from '../components/ui/Badge'
import Button from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import PageHeader from '../components/ui/PageHeader'
import SearchInput from '../components/ui/SearchInput'
import SectionHeader from '../components/ui/SectionHeader'
import { FormField, Select } from '../components/ui/FormField'
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
    <div className="cb-animate-in">
      <PageHeader
        title="Ejercicios"
        description="Biblioteca compartida con el módulo de Entrenamientos"
        action={
          <Button>
            <Plus className="h-4 w-4" />
            Nuevo ejercicio
          </Button>
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
        <SectionHeader title="Biblioteca de ejercicios" />
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="flex-1">
            <SearchInput placeholder="Buscar ejercicios…" />
          </div>
          <FormField label="Tipo" className="sm:w-48">
            <Select defaultValue="">
              <option value="">Todas las categorías</option>
              <option value="posesion">Posesión</option>
              <option value="transicion">Transición</option>
              <option value="tactica">Táctica</option>
              <option value="finalizacion">Finalización</option>
            </Select>
          </FormField>
        </div>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        {exercises.map((exercise) => (
          <Card key={exercise.id} hover className="flex flex-col">
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
