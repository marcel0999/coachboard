import { Copy, Layers, RotateCw, Trash2 } from 'lucide-react'
import { DRAWING_COLORS } from '../../constants/tacticalBoard'

export default function DrawingContextMenu({
  drawing,
  position,
  onDuplicate,
  onDelete,
  onColorChange,
  onRotate,
  onResize,
  onBringFront,
  onSendBack,
  onClose,
}) {
  if (!drawing || !position) return null

  const canRotate = drawing.cx !== undefined || drawing.type === 'rectangle' || drawing.type === 'zone'
  const canResize = drawing.cx !== undefined || drawing.type === 'rectangle' || drawing.type === 'zone'

  return (
    <>
      <div className="fixed inset-0 z-40" onPointerDown={onClose} />
      <div
        className="absolute z-50 flex flex-col gap-1 rounded-xl border border-border bg-surface-elevated p-2 shadow-lg"
        style={{ left: position.x, top: position.y, transform: 'translate(-50%, -120%)' }}
        onPointerDown={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-1">
          <button
            type="button"
            title="Duplicar"
            onClick={onDuplicate}
            className="rounded-lg p-2 text-text-secondary transition hover:bg-surface-muted"
          >
            <Copy className="h-4 w-4" />
          </button>
          <button
            type="button"
            title="Eliminar"
            onClick={onDelete}
            className="rounded-lg p-2 text-red-400 transition hover:bg-danger-subtle"
          >
            <Trash2 className="h-4 w-4" />
          </button>
          {canRotate && (
            <button
              type="button"
              title="Girar 45°"
              onClick={onRotate}
              className="rounded-lg p-2 text-text-secondary transition hover:bg-surface-muted"
            >
              <RotateCw className="h-4 w-4" />
            </button>
          )}
          {canResize && (
            <button
              type="button"
              title="Cambiar tamaño"
              onClick={onResize}
              className="rounded-lg px-2 py-1.5 text-xs font-medium text-text-secondary transition hover:bg-surface-muted"
            >
              Tamaño
            </button>
          )}
          <button
            type="button"
            title="Traer al frente"
            onClick={onBringFront}
            className="rounded-lg p-2 text-text-secondary transition hover:bg-surface-muted"
          >
            <Layers className="h-4 w-4" />
          </button>
          <button
            type="button"
            title="Enviar atrás"
            onClick={() => onSendBack?.()}
            className="rounded-lg p-2 text-text-secondary transition hover:bg-surface-muted"
          >
            <Layers className="h-4 w-4 rotate-180" />
          </button>
        </div>
        <div className="flex items-center gap-1 border-t border-border-subtle pt-1">
          {DRAWING_COLORS.map((color) => (
            <button
              key={color}
              type="button"
              aria-label={`Color ${color}`}
              onClick={() => onColorChange(color)}
              className={[
                'h-5 w-5 rounded-full border-2 transition-transform hover:scale-110',
                drawing.color === color ? 'border-accent ring-1 ring-accent/40' : 'border-white shadow-sm',
              ].join(' ')}
              style={{ backgroundColor: color }}
            />
          ))}
        </div>
      </div>
    </>
  )
}
