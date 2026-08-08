import {
  Circle,
  Goal,
  Hexagon,
  Minus,
  Redo2,
  Square,
  Trash2,
  Triangle,
  Undo2,
  User,
} from 'lucide-react'
import { DRAG_FROM_TOOLBAR } from '../../constants/tacticalBoard'
import { PRIMARY_TOOLS } from './TacticalPitchToolbar'

const ELEMENTS = [
  { id: 'cone', label: 'Cono', icon: Triangle },
  { id: 'ball', label: 'Pelota', icon: Circle },
  { id: 'mini-goal', label: 'Mini arco', icon: Goal },
  { id: 'pole', label: 'Arco', icon: Goal },
  { id: 'bib', label: 'Peto', icon: Square },
  { id: 'hurdle', label: 'Valla', icon: Hexagon },
  { id: 'mannequin', label: 'Maniquí', icon: User },
]

export default function TacticalElementsPanel({
  activeTool,
  onToolChange,
  onClear,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
}) {
  return (
    <aside className="hidden w-[220px] shrink-0 flex-col gap-4 overflow-y-auto border-l border-border/60 bg-surface-card p-3 xl:flex">
      <div>
        <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-text-muted">Herramientas</p>
        <div className="grid gap-1.5">
          {PRIMARY_TOOLS.map(({ id, short, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => onToolChange(id)}
              className={[
                'flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium transition',
                activeTool === id
                  ? 'bg-accent text-white'
                  : 'bg-surface-muted text-text-secondary hover:text-text-primary',
              ].join(' ')}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {short}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-text-muted">Elementos</p>
        <div className="grid grid-cols-3 gap-1.5">
          {ELEMENTS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              draggable
              onDragStart={(event) => {
                event.dataTransfer.setData(DRAG_FROM_TOOLBAR, id)
                event.dataTransfer.effectAllowed = 'copy'
              }}
              onClick={() => onToolChange(id)}
              className={[
                'flex flex-col items-center justify-center gap-1 rounded-lg border px-1 py-2.5 text-[10px] font-medium transition',
                activeTool === id
                  ? 'border-accent bg-accent-subtle text-accent'
                  : 'border-border/60 bg-surface-muted text-text-secondary hover:border-accent/40',
              ].join(' ')}
            >
              <Icon className="h-4 w-4" />
              {label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-text-muted">Acciones</p>
        <div className="grid gap-1.5">
          <button
            type="button"
            onClick={onClear}
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-border/60 bg-surface-muted px-3 py-2 text-xs font-medium text-text-secondary hover:text-red-400"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Limpiar todo
          </button>
          <button
            type="button"
            onClick={onUndo}
            disabled={!canUndo}
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-border/60 bg-surface-muted px-3 py-2 text-xs font-medium text-text-secondary hover:text-text-primary disabled:opacity-40"
          >
            <Undo2 className="h-3.5 w-3.5" />
            Deshacer
          </button>
          <button
            type="button"
            onClick={onRedo}
            disabled={!canRedo}
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-border/60 bg-surface-muted px-3 py-2 text-xs font-medium text-text-secondary hover:text-text-primary disabled:opacity-40"
          >
            <Redo2 className="h-3.5 w-3.5" />
            Rehacer
          </button>
        </div>
      </div>
    </aside>
  )
}
