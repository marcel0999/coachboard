import { useMemo, useState } from 'react'
import { Copy, Pencil, Search, Trash2 } from 'lucide-react'
import Button from '../ui/Button'
import { Input } from '../ui/FormField'
import { BOARD_TYPES } from '../../constants/tacticalBoard'
import { BOARD_MODES } from '../../constants/tacticalBoard'

export default function BoardLibraryPanel({
  savedBoards,
  categories,
  onOpen,
  onDuplicate,
  onRename,
  onDelete,
}) {
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase()
    return savedBoards.filter((board) => {
      if (categoryFilter !== 'all' && board.categoryId !== categoryFilter) return false
      if (typeFilter !== 'all' && board.boardType !== typeFilter) return false
      if (!query) return true
      return (
        board.name.toLowerCase().includes(query) ||
        board.formation.toLowerCase().includes(query)
      )
    })
  }, [savedBoards, search, categoryFilter, typeFilter])

  const handleRename = (board) => {
    const nextName = window.prompt('Nuevo nombre de la pizarra', board.name)
    if (nextName?.trim()) onRename(board.id, nextName.trim())
  }

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
        <input
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Buscar pizarras..."
          className="w-full rounded-xl border border-border py-2 pl-9 pr-3 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
        />
      </div>

      <div className="grid gap-2 sm:grid-cols-2">
        <select
          value={categoryFilter}
          onChange={(event) => setCategoryFilter(event.target.value)}
          className="rounded-xl border border-border px-3 py-2 text-sm"
        >
          <option value="all">Todas las categorías</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
        <select
          value={typeFilter}
          onChange={(event) => setTypeFilter(event.target.value)}
          className="rounded-xl border border-border px-3 py-2 text-sm"
        >
          <option value="all">Todos los tipos</option>
          {BOARD_TYPES.map((type) => (
            <option key={type.id} value={type.id}>
              {type.label}
            </option>
          ))}
        </select>
      </div>

      {filtered.length === 0 ? (
        <p className="py-6 text-center text-sm text-text-secondary">Sin pizarras guardadas.</p>
      ) : (
        <ul className="max-h-80 space-y-2 overflow-y-auto">
          {filtered.map((board) => {
            const category = categories.find((item) => item.id === board.categoryId)
            const typeLabel = BOARD_TYPES.find((item) => item.id === board.boardType)?.label ?? board.boardType
            return (
              <li key={board.id} className="rounded-xl border border-border px-3 py-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-text-primary">{board.name}</p>
                    <p className="text-xs text-text-muted">
                      {board.formation} · {typeLabel}
                      {category ? ` · ${category.name}` : ''}
                    </p>
                    <p className="text-[10px] text-text-muted">
                      {board.mode === BOARD_MODES.CHIPS
                        ? 'Fichas'
                        : board.mode === BOARD_MODES.SQUAD
                          ? 'Plantel'
                          : 'Posiciones'}
                    </p>
                  </div>
                  <div className="flex shrink-0 gap-1">
                    <Button size="sm" variant="ghost" onClick={() => onOpen(board)} title="Abrir">
                      Abrir
                    </Button>
                    <button type="button" onClick={() => onDuplicate(board)} className="rounded p-1 text-text-muted hover:text-accent" title="Duplicar">
                      <Copy className="h-4 w-4" />
                    </button>
                    <button type="button" onClick={() => handleRename(board)} className="rounded p-1 text-text-muted hover:text-accent" title="Renombrar">
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (window.confirm(`¿Eliminar "${board.name}"?`)) onDelete(board.id)
                      }}
                      className="rounded p-1 text-text-muted hover:text-red-400"
                      title="Eliminar"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}

export function SaveBoardForm({ name, boardType, onNameChange, onTypeChange }) {
  return (
    <div className="space-y-3">
      <Input value={name} onChange={(event) => onNameChange(event.target.value)} placeholder="Nombre de la pizarra" />
      <select
        value={boardType}
        onChange={(event) => onTypeChange(event.target.value)}
        className="w-full rounded-xl border border-border px-3 py-2.5 text-sm"
      >
        {BOARD_TYPES.map((type) => (
          <option key={type.id} value={type.id}>
            {type.label}
          </option>
        ))}
      </select>
    </div>
  )
}
