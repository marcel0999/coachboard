import { useMemo, useState } from 'react'
import Modal from '../ui/Modal'
import Button from '../ui/Button'
import EmptyState from '../ui/EmptyState'
import LibrarySearchBar from './LibrarySearchBar'
import LibraryResourceCard from './LibraryResourceCard'
import { useLibrary } from '../../context/LibraryContext'
import { CONTENT_TYPES } from '../../constants/library'
import { copyLibraryResourceToSessionExercise } from '../../utils/library'
import { Dumbbell } from 'lucide-react'

export default function LibraryPickerModal({ isOpen, onClose, onSelectExercise }) {
  const { getFiltered, isFavorite, toggleFavorite, copyResource, canEditLibrary } = useLibrary()
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('all')
  const [level, setLevel] = useState('all')
  const [intensity, setIntensity] = useState('all')
  const [sortBy, setSortBy] = useState('recent')

  const resources = useMemo(
    () =>
      getFiltered({
        contentType: CONTENT_TYPES.EXERCISE,
        search,
        category,
        level,
        intensity,
        sortBy,
      }),
    [getFiltered, search, category, level, intensity, sortBy],
  )

  async function handleSelect(resource) {
    await copyResource(resource.id)
    onSelectExercise(copyLibraryResourceToSessionExercise(resource))
    onClose()
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Agregar desde Biblioteca"
      description="Seleccioná un ejercicio para copiarlo a tu sesión"
      size="2xl"
    >
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
      />

      <div className="mt-6 max-h-[55vh] overflow-y-auto">
        {resources.length === 0 ? (
          <EmptyState icon={Dumbbell} title="Sin ejercicios" description="Probá otros filtros o creá contenido en Biblioteca." />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {resources.map((resource) => (
              <LibraryResourceCard
                key={resource.id}
                resource={resource}
                isFavorite={isFavorite(resource.id)}
                onToggleFavorite={toggleFavorite}
                onView={() => handleSelect(resource)}
                onCopy={() => handleSelect(resource)}
                onEdit={() => {}}
                onDelete={() => {}}
                canEdit={false}
              />
            ))}
          </div>
        )}
      </div>

      <div className="mt-4 flex justify-end">
        <Button variant="secondary" onClick={onClose}>Cerrar</Button>
      </div>
    </Modal>
  )
}
