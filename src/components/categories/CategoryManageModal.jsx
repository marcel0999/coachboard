import { useEffect, useMemo, useState } from 'react'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import Modal from '../ui/Modal'
import Button from '../ui/Button'
import ConfirmModal from '../ui/ConfirmModal'
import { FormField, Input, Select } from '../ui/FormField'
import Badge from '../ui/Badge'
import {
  CATEGORY_COLORS,
  EMPTY_CATEGORY,
} from '../../constants/categories'
import {
  countPlayersInCategory,
  getActiveCategories,
  sortCategoriesForDisplay,
} from '../../utils/categories'

function CategoryForm({ form, errors, onChange }) {
  const update = (field, value) => onChange({ ...form, [field]: value })

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <FormField label="Nombre" htmlFor="cat-name" required error={errors.name} className="sm:col-span-2">
        <Input
          id="cat-name"
          value={form.name}
          onChange={(e) => update('name', e.target.value)}
          placeholder="Ej: Sub 18"
        />
      </FormField>
      <FormField label="Color identificador" htmlFor="cat-color">
        <div className="flex flex-wrap gap-2">
          {CATEGORY_COLORS.map((color) => (
            <button
              key={color}
              type="button"
              onClick={() => update('color', color)}
              className={`h-8 w-8 rounded-full border-2 transition ${
                form.color === color ? 'border-slate-900 scale-110' : 'border-transparent'
              }`}
              style={{ backgroundColor: color }}
              aria-label={`Color ${color}`}
            />
          ))}
        </div>
      </FormField>
      <FormField label="Rango de edades" htmlFor="cat-age-range">
        <Input
          id="cat-age-range"
          value={form.ageRange}
          onChange={(e) => update('ageRange', e.target.value)}
          placeholder="Ej: 2010-2012 o Sub 16"
        />
      </FormField>
      <FormField label="Año nacimiento desde" htmlFor="cat-year-from">
        <Input
          id="cat-year-from"
          type="number"
          min="1980"
          max="2030"
          value={form.birthYearFrom}
          onChange={(e) => update('birthYearFrom', e.target.value)}
          placeholder="Ej: 2010"
        />
      </FormField>
      <FormField label="Año nacimiento hasta" htmlFor="cat-year-to">
        <Input
          id="cat-year-to"
          type="number"
          min="1980"
          max="2030"
          value={form.birthYearTo}
          onChange={(e) => update('birthYearTo', e.target.value)}
          placeholder="Ej: 2012"
        />
      </FormField>
      <FormField label="Estado" htmlFor="cat-active">
        <Select
          id="cat-active"
          value={form.active ? 'active' : 'inactive'}
          onChange={(e) => update('active', e.target.value === 'active')}
        >
          <option value="active">Activa</option>
          <option value="inactive">Inactiva</option>
        </Select>
      </FormField>
    </div>
  )
}

export default function CategoryManageModal({
  isOpen,
  onClose,
  categories,
  players,
  onSaveCategory,
  onDeleteCategory,
}) {
  const [editingCategory, setEditingCategory] = useState(null)
  const [form, setForm] = useState(EMPTY_CATEGORY)
  const [errors, setErrors] = useState({})
  const [deletingCategory, setDeletingCategory] = useState(null)
  const [deleteMode, setDeleteMode] = useState('move')
  const [moveTargetId, setMoveTargetId] = useState('')

  const sortedCategories = useMemo(
    () => sortCategoriesForDisplay(categories),
    [categories],
  )

  const activeCategories = useMemo(
    () => getActiveCategories(categories),
    [categories],
  )

  useEffect(() => {
    if (!isOpen) {
      setEditingCategory(null)
      setForm(EMPTY_CATEGORY)
      setErrors({})
      setDeletingCategory(null)
    }
  }, [isOpen])

  const openCreate = () => {
    setEditingCategory(null)
    setForm({ ...EMPTY_CATEGORY, sortOrder: categories.length + 1 })
    setErrors({})
  }

  const openEdit = (category) => {
    setEditingCategory(category)
    setForm({
      name: category.name,
      color: category.color,
      ageRange: category.ageRange,
      birthYearFrom: category.birthYearFrom ?? '',
      birthYearTo: category.birthYearTo ?? '',
      active: category.active,
      sortOrder: category.sortOrder,
    })
    setErrors({})
  }

  const validate = () => {
    const nextErrors = {}
    if (!form.name.trim()) nextErrors.name = 'El nombre es obligatorio'
    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  const handleSave = () => {
    if (!validate()) return
    onSaveCategory(form, editingCategory)
    setEditingCategory(null)
    setForm(EMPTY_CATEGORY)
    setErrors({})
  }

  const handleOpenDelete = (category) => {
    setDeletingCategory(category)
    const alternatives = activeCategories.filter((item) => item.id !== category.id)
    setMoveTargetId(alternatives[0]?.id ?? '')
    setDeleteMode('move')
  }

  const handleConfirmDelete = () => {
    if (!deletingCategory) return
    onDeleteCategory(deletingCategory.id, {
      movePlayersToCategoryId: deleteMode === 'move' ? moveTargetId : null,
      deleteAllData: deleteMode === 'delete-all',
    })
    setDeletingCategory(null)
  }

  const playersInDeletingCategory = deletingCategory
    ? countPlayersInCategory(players, deletingCategory.id)
    : 0

  const moveTargets = activeCategories.filter(
    (category) => category.id !== deletingCategory?.id,
  )

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title="Administrar categorías"
        description="Creá, editá o desactivá las categorías del club"
        size="xl"
      >
        <div className="mb-6 flex justify-end">
          <Button type="button" size="sm" onClick={openCreate}>
            <Plus className="h-4 w-4" />
            Nueva categoría
          </Button>
        </div>

        {(editingCategory || form.name || !sortedCategories.length) && (
          <div className="mb-6 rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <h3 className="mb-4 text-sm font-semibold text-text-primary">
              {editingCategory ? `Editar ${editingCategory.name}` : 'Nueva categoría'}
            </h3>
            <CategoryForm form={form} errors={errors} onChange={setForm} />
            <div className="mt-4 flex justify-end gap-2">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => {
                  setEditingCategory(null)
                  setForm(EMPTY_CATEGORY)
                  setErrors({})
                }}
              >
                Cancelar
              </Button>
              <Button type="button" size="sm" onClick={handleSave}>
                {editingCategory ? 'Guardar cambios' : 'Crear categoría'}
              </Button>
            </div>
          </div>
        )}

        <div className="space-y-2">
          {sortedCategories.map((category) => {
            const playerCount = countPlayersInCategory(players, category.id)
            return (
              <div
                key={category.id}
                className="flex flex-col gap-3 rounded-xl border border-slate-200 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex items-center gap-3">
                  <span
                    className="h-4 w-4 shrink-0 rounded-full"
                    style={{ backgroundColor: category.color }}
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-text-primary">{category.name}</p>
                      {!category.active && <Badge variant="default">Inactiva</Badge>}
                    </div>
                    <p className="text-xs text-text-secondary">
                      {category.ageRange || 'Sin rango definido'} · {playerCount} jugador
                      {playerCount === 1 ? '' : 'es'}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button type="button" variant="secondary" size="sm" onClick={() => openEdit(category)}>
                    <Pencil className="h-4 w-4" />
                    Editar
                  </Button>
                  <Button type="button" variant="danger" size="sm" onClick={() => handleOpenDelete(category)}>
                    <Trash2 className="h-4 w-4" />
                    Eliminar
                  </Button>
                </div>
              </div>
            )
          })}
        </div>
      </Modal>

      <ConfirmModal
        isOpen={Boolean(deletingCategory)}
        onClose={() => setDeletingCategory(null)}
        onConfirm={handleConfirmDelete}
        title={`Eliminar ${deletingCategory?.name ?? 'categoría'}`}
        confirmLabel="Eliminar categoría"
        variant="danger"
        message={
          deletingCategory ? (
            <div className="space-y-4 text-left">
              <p>
                Esta categoría tiene{' '}
                <strong>{playersInDeletingCategory}</strong> jugador
                {playersInDeletingCategory === 1 ? '' : 'es'}.
              </p>
              {playersInDeletingCategory > 0 ? (
                <>
                  <FormField label="¿Qué hacer con los jugadores?">
                    <Select
                      value={deleteMode}
                      onChange={(e) => setDeleteMode(e.target.value)}
                    >
                      <option value="move">Mover a otra categoría</option>
                      <option value="delete-all">Eliminar todos los datos de los jugadores</option>
                    </Select>
                  </FormField>
                  {deleteMode === 'move' && (
                    <FormField label="Categoría destino">
                      <Select
                        value={moveTargetId}
                        onChange={(e) => setMoveTargetId(e.target.value)}
                      >
                        {moveTargets.map((category) => (
                          <option key={category.id} value={category.id}>
                            {category.name}
                          </option>
                        ))}
                      </Select>
                    </FormField>
                  )}
                  {deleteMode === 'delete-all' && (
                    <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
                      Se eliminarán permanentemente los jugadores y sus referencias en partidos,
                      entrenamientos y demás módulos.
                    </p>
                  )}
                </>
              ) : (
                <p>La categoría no tiene jugadores. ¿Confirmás la eliminación?</p>
              )}
            </div>
          ) : (
            ''
          )
        }
      />
    </>
  )
}
