import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { BookOpen, Plus } from 'lucide-react'
import PageHeader from '../components/ui/PageHeader'
import Button from '../components/ui/Button'
import Alert from '../components/ui/Alert'
import Spinner from '../components/ui/Spinner'
import EmptyState from '../components/ui/EmptyState'
import ConfirmModal from '../components/ui/ConfirmModal'
import LibrarySectionNav from '../components/biblioteca/LibrarySectionNav'
import LibrarySearchBar from '../components/biblioteca/LibrarySearchBar'
import LibraryResourceCard from '../components/biblioteca/LibraryResourceCard'
import LibraryComingSoon from '../components/biblioteca/LibraryComingSoon'
import ExerciseResourceModal from '../components/biblioteca/ExerciseResourceModal'
import TrainingResourceModal from '../components/biblioteca/TrainingResourceModal'
import { useLibrary } from '../context/LibraryContext'
import { useAppData, useCategoryScope } from '../context/AppDataContext'
import {
  CONTENT_TYPES,
  SOURCE_TYPES,
  getSectionById,
  isResourceEditable,
} from '../constants/library'
import { copyLibraryTrainingToClubTraining } from '../utils/libraryResources'
import { toDateKey } from '../utils/trainings'
import { useAuth } from '../context/AuthContext'

export default function Biblioteca() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { saveTraining } = useAppData()
  const { effectiveCategoryId } = useCategoryScope()
  const {
    loading,
    error,
    canEditLibrary,
    getFiltered,
    saveResource,
    deleteResource,
    toggleFavorite,
    copyResource,
    isFavorite,
    createEmptyExercise,
    createEmptyTraining,
    reload,
  } = useLibrary()

  const [activeSection, setActiveSection] = useState('exercises')
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('all')
  const [level, setLevel] = useState('all')
  const [intensity, setIntensity] = useState('all')
  const [sortBy, setSortBy] = useState('recent')
  const [editingResource, setEditingResource] = useState(null)
  const [viewingResource, setViewingResource] = useState(null)
  const [deletingResource, setDeletingResource] = useState(null)
  const [copyTrainingResource, setCopyTrainingResource] = useState(null)
  const [message, setMessage] = useState('')

  const section = getSectionById(activeSection)

  const filters = useMemo(() => {
    const base = { search, category, level, intensity, sortBy, favoriteIds: undefined, userId: user?.id }

    if (activeSection === 'exercises') {
      return { ...base, contentType: CONTENT_TYPES.EXERCISE }
    }
    if (activeSection === 'trainings') {
      return { ...base, contentType: CONTENT_TYPES.TRAINING }
    }
    if (activeSection === 'favorites') {
      return { ...base, favoritesOnly: true }
    }
    if (activeSection === 'my-content') {
      return { ...base, myContentOnly: true }
    }
    return base
  }, [activeSection, search, category, level, intensity, sortBy, user?.id])

  const resources = useMemo(() => getFiltered(filters), [getFiltered, filters])

  const comingSoonSections = ['microcycles', 'planning', 'season', 'videos', 'documents']

  function handleNewResource() {
    if (activeSection === 'trainings') {
      setEditingResource(createEmptyTraining({ sourceType: SOURCE_TYPES.USER }))
    } else {
      setEditingResource(createEmptyExercise({ sourceType: SOURCE_TYPES.USER }))
    }
  }

  async function handleSaveResource(resource) {
    const payload = resource.id?.startsWith('demo')
      ? { ...resource, id: undefined }
      : resource
    const saved = await saveResource(payload)
    setMessage(`${saved.title} guardado en Biblioteca`)
    setEditingResource(null)
    setViewingResource(null)
    await reload()
    return saved
  }

  async function handleCopy(resource) {
    await copyResource(resource.id)

    if (resource.contentType === CONTENT_TYPES.TRAINING) {
      setCopyTrainingResource(resource)
      return
    }

    setMessage(`"${resource.title}" listo para agregar a un entrenamiento desde la pestaña Ejercicios`)
  }

  async function confirmCopyTraining() {
    if (!copyTrainingResource) return
    const training = copyLibraryTrainingToClubTraining(copyTrainingResource, {
      categoryId: effectiveCategoryId,
      date: toDateKey(new Date()),
    })
    saveTraining(training)
    setCopyTrainingResource(null)
    setMessage(`"${training.name}" copiado a Mis Entrenamientos`)
    navigate('/entrenamientos')
  }

  async function handleDelete() {
    if (!deletingResource) return
    await deleteResource(deletingResource.id)
    setDeletingResource(null)
    setMessage('Contenido eliminado')
  }

  const showSearch = !comingSoonSections.includes(activeSection)
  const canCreate =
    canEditLibrary &&
    (activeSection === 'exercises' || activeSection === 'trainings' || activeSection === 'my-content')

  return (
    <div className="cb-animate-in">
      <PageHeader
        title="Biblioteca"
        description="Centro de contenidos de CoachBoard · ejercicios, entrenamientos y recursos para toda la temporada"
        action={
          canCreate ? (
            <Button onClick={handleNewResource}>
              <Plus className="h-4 w-4" />
              Nuevo contenido
            </Button>
          ) : null
        }
      />

      {message && <Alert variant="success" className="mb-4">{message}</Alert>}
      {error && (
        <Alert variant="warning" className="mb-4" title="Modo demostración">
          {error} — Se muestran ejemplos de demostración mientras se aplica la migración Supabase.
        </Alert>
      )}

      <div className="mb-6">
        <LibrarySectionNav activeSection={activeSection} onChange={setActiveSection} />
      </div>

      {comingSoonSections.includes(activeSection) ? (
        <LibraryComingSoon sectionLabel={section.label} />
      ) : (
        <>
          {showSearch && (
            <div className="cb-card mb-6 p-5">
              <LibrarySearchBar
                search={search}
                onSearchChange={setSearch}
                category={category}
                onCategoryChange={setCategory}
                level={level}
                onLevelChange={setLevel}
                intensity={intensity}
                onIntensityChange={setIntensity}
                sortBy={sortBy}
                onSortChange={setSortBy}
                showCategoryFilter={activeSection !== 'trainings'}
              />
            </div>
          )}

          {loading ? (
            <div className="flex justify-center py-20">
              <Spinner size="lg" label="Cargando Biblioteca…" />
            </div>
          ) : resources.length === 0 ? (
            <EmptyState
              icon={BookOpen}
              title="Sin contenido en esta sección"
              description="Creá tu primer recurso o ajustá los filtros de búsqueda."
              action={
                canCreate ? (
                  <Button onClick={handleNewResource}>
                    <Plus className="h-4 w-4" />
                    Crear contenido
                  </Button>
                ) : null
              }
            />
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {resources.map((resource) => (
                <LibraryResourceCard
                  key={resource.id}
                  resource={resource}
                  isFavorite={isFavorite(resource.id)}
                  onToggleFavorite={toggleFavorite}
                  onView={setViewingResource}
                  onCopy={handleCopy}
                  onEdit={setEditingResource}
                  onDelete={setDeletingResource}
                  canEdit={isResourceEditable(resource, user?.id, canEditLibrary)}
                />
              ))}
            </div>
          )}
        </>
      )}

      <ExerciseResourceModal
        isOpen={
          (editingResource?.contentType === CONTENT_TYPES.EXERCISE ||
            viewingResource?.contentType === CONTENT_TYPES.EXERCISE) &&
          Boolean(editingResource || viewingResource)
        }
        resource={
          editingResource?.contentType === CONTENT_TYPES.EXERCISE
            ? editingResource
            : viewingResource?.contentType === CONTENT_TYPES.EXERCISE
              ? viewingResource
              : null
        }
        onClose={() => {
          setEditingResource(null)
          setViewingResource(null)
        }}
        onSave={handleSaveResource}
        canEdit={Boolean(editingResource?.contentType === CONTENT_TYPES.EXERCISE) && canEditLibrary}
      />

      <TrainingResourceModal
        isOpen={
          (editingResource?.contentType === CONTENT_TYPES.TRAINING ||
            viewingResource?.contentType === CONTENT_TYPES.TRAINING) &&
          Boolean(editingResource || viewingResource)
        }
        resource={
          editingResource?.contentType === CONTENT_TYPES.TRAINING
            ? editingResource
            : viewingResource?.contentType === CONTENT_TYPES.TRAINING
              ? viewingResource
              : null
        }
        onClose={() => {
          setEditingResource(null)
          setViewingResource(null)
        }}
        onSave={handleSaveResource}
        canEdit={Boolean(editingResource?.contentType === CONTENT_TYPES.TRAINING) && canEditLibrary}
      />

      <ConfirmModal
        isOpen={Boolean(copyTrainingResource)}
        onClose={() => setCopyTrainingResource(null)}
        onConfirm={confirmCopyTraining}
        title="Copiar entrenamiento completo"
        message={`¿Copiar "${copyTrainingResource?.title}" a Mis Entrenamientos? Se creará una copia editable independiente del original.`}
        confirmLabel="Copiar a Entrenamientos"
      />

      <ConfirmModal
        isOpen={Boolean(deletingResource)}
        onClose={() => setDeletingResource(null)}
        onConfirm={handleDelete}
        title="Eliminar contenido"
        message={`¿Eliminar "${deletingResource?.title}" de la Biblioteca? Esta acción no se puede deshacer.`}
        confirmLabel="Eliminar"
        variant="danger"
      />
    </div>
  )
}
