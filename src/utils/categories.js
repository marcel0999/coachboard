import { CATEGORY_FILTER_ALL, DEFAULT_CATEGORY_ID } from '../constants/categories'
import { generateRecordId } from './playerFactory'

export function generateCategoryId() {
  return generateRecordId('cat')
}

export function normalizeCategoryForm(formData) {
  return {
    id: formData.id ?? generateCategoryId(),
    name: formData.name?.trim() ?? '',
    color: formData.color ?? '#3b82f6',
    ageRange: formData.ageRange?.trim() ?? '',
    birthYearFrom:
      formData.birthYearFrom === '' || formData.birthYearFrom == null
        ? null
        : Number(formData.birthYearFrom),
    birthYearTo:
      formData.birthYearTo === '' || formData.birthYearTo == null
        ? null
        : Number(formData.birthYearTo),
    active: formData.active !== false,
    sortOrder: Number(formData.sortOrder ?? 0),
  }
}

export function getActiveCategories(categories) {
  return [...categories]
    .filter((category) => category.active)
    .sort((a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name, 'es'))
}

export function getCategoryById(categories, categoryId) {
  return categories.find((category) => category.id === categoryId) ?? null
}

export function getDefaultCategoryId(categories) {
  const principal = categories.find((category) => category.id === DEFAULT_CATEGORY_ID)
  if (principal?.active) return principal.id
  const firstActive = getActiveCategories(categories)[0]
  return firstActive?.id ?? DEFAULT_CATEGORY_ID
}

export function getEffectiveCategoryId(selectedCategoryId, categories) {
  if (selectedCategoryId && selectedCategoryId !== CATEGORY_FILTER_ALL) {
    return selectedCategoryId
  }
  return getDefaultCategoryId(categories)
}

export function filterByCategory(items, categoryId, field = 'categoryId') {
  if (!categoryId || categoryId === CATEGORY_FILTER_ALL) return items
  return items.filter((item) => item[field] === categoryId)
}

export function filterPlayersByCategory(players, categoryId) {
  return filterByCategory(players, categoryId, 'categoryId')
}

export function filterMatchesByCategory(matches, categoryId) {
  return filterByCategory(matches, categoryId, 'categoryId')
}

export function filterTrainingsByCategory(trainings, categoryId) {
  return filterByCategory(trainings, categoryId, 'categoryId')
}

export function filterStaffByCategory(staff, categoryId) {
  if (!categoryId || categoryId === CATEGORY_FILTER_ALL) return staff
  return staff.filter((member) => (member.categoryIds ?? []).includes(categoryId))
}

export function countPlayersInCategory(players, categoryId) {
  return players.filter((player) => player.categoryId === categoryId).length
}

export function updateCategoryById(categories, categoryId, updates) {
  return categories.map((category) =>
    category.id === categoryId ? { ...category, ...updates } : category,
  )
}

export function sortCategoriesForDisplay(categories) {
  return [...categories].sort(
    (a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name, 'es'),
  )
}

export function buildCategoryOptions(categories, { includeAll = false } = {}) {
  const options = getActiveCategories(categories).map((category) => ({
    value: category.id,
    label: category.name,
    color: category.color,
  }))

  if (includeAll) {
    return [{ value: CATEGORY_FILTER_ALL, label: 'Todas las categorías', color: '#64748b' }, ...options]
  }

  return options
}

export function migrateEntityCategoryId(entity, defaultCategoryId) {
  if (entity.categoryId) return entity
  return { ...entity, categoryId: defaultCategoryId }
}

export function migrateStaffCategoryIds(member, defaultCategoryId, allCategoryIds) {
  if (Array.isArray(member.categoryIds) && member.categoryIds.length > 0) {
    return member
  }
  return { ...member, categoryIds: [defaultCategoryId] }
}
