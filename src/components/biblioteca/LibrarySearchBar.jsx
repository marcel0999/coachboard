import SearchInput from '../ui/SearchInput'
import FilterPills from '../ui/FilterPills'
import SortSelect from '../ui/SortSelect'
import { EXERCISE_CLASSIFICATIONS, INTENSITY_LEVELS, LEVELS, LIBRARY_SORT_OPTIONS } from '../../constants/library'

export default function LibrarySearchBar({
  search,
  onSearchChange,
  category,
  onCategoryChange,
  level,
  onLevelChange,
  intensity,
  onIntensityChange,
  sortBy,
  onSortChange,
  showCategoryFilter = true,
}) {
  const categoryOptions = [
    { value: 'all', label: 'Todas' },
    ...EXERCISE_CLASSIFICATIONS.map((item) => ({ value: item, label: item })),
  ]

  const levelOptions = [
    { value: 'all', label: 'Todos los niveles' },
    ...LEVELS.map((item) => ({ value: item, label: item })),
  ]

  const intensityOptions = [
    { value: 'all', label: 'Toda intensidad' },
    ...INTENSITY_LEVELS.map((item) => ({ value: item, label: item })),
  ]

  return (
    <div className="space-y-4">
      <SearchInput
        value={search}
        onChange={onSearchChange}
        placeholder="Buscar por nombre, objetivo, etiqueta…"
      />
      <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex flex-col gap-3 lg:flex-row lg:flex-wrap lg:items-center">
          {showCategoryFilter && (
            <FilterPills options={categoryOptions} value={category} onChange={onCategoryChange} size="sm" />
          )}
          <FilterPills options={levelOptions} value={level} onChange={onLevelChange} size="sm" />
          <FilterPills options={intensityOptions} value={intensity} onChange={onIntensityChange} size="sm" />
        </div>
        <SortSelect value={sortBy} onChange={onSortChange} options={LIBRARY_SORT_OPTIONS} />
      </div>
    </div>
  )
}
