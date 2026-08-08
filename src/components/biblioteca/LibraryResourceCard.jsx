import { Clock, Copy, Heart, Star, Users } from 'lucide-react'
import Badge from '../ui/Badge'
import Button from '../ui/Button'
import { SOURCE_TYPE_LABELS, CONTENT_TYPES } from '../../constants/library'

function intensityVariant(intensity) {
  switch (intensity) {
    case 'Alta': return 'danger'
    case 'Media': return 'warning'
    default: return 'success'
  }
}

export default function LibraryResourceCard({
  resource,
  isFavorite,
  onToggleFavorite,
  onView,
  onCopy,
  onEdit,
  onDelete,
  canEdit,
}) {
  const meta = resource.metadata ?? {}
  const coverColor = meta.imageColor ?? 'bg-accent'
  const duration = meta.durationMinutes ?? meta.duration
  const playerRange =
    meta.minPlayers || meta.maxPlayers
      ? `${meta.minPlayers || '—'}-${meta.maxPlayers || '—'}`
      : meta.playerCount
        ? `${meta.playerCount} jug.`
        : null

  return (
    <article className="cb-card group flex flex-col overflow-hidden p-0 transition hover:shadow-md">
      <button
        type="button"
        onClick={() => onView(resource)}
        className="relative aspect-[16/9] w-full overflow-hidden text-left"
      >
        <div className={`absolute inset-0 ${coverColor} opacity-90`} />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
        <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
          {resource.isDemo && <Badge variant="warning">Demo</Badge>}
          <Badge variant="accent">{SOURCE_TYPE_LABELS[resource.sourceType] ?? resource.sourceType}</Badge>
        </div>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            onToggleFavorite(resource.id)
          }}
          className="absolute right-3 top-3 rounded-full bg-surface-elevated/90 p-2 shadow-sm transition hover:scale-105"
          aria-label={isFavorite ? 'Quitar de favoritos' : 'Agregar a favoritos'}
        >
          <Heart
            className={`h-4 w-4 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-text-muted'}`}
          />
        </button>
        <div className="absolute bottom-3 left-3 right-3">
          <p className="font-display text-lg font-bold text-white drop-shadow-sm">{resource.title}</p>
          <p className="mt-0.5 text-xs text-white/80">{resource.category}</p>
        </div>
      </button>

      <div className="flex flex-1 flex-col p-4">
        <p className="line-clamp-2 flex-1 text-sm text-text-secondary">{resource.objective || resource.description}</p>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          {duration && (
            <span className="inline-flex items-center gap-1 text-xs text-text-muted">
              <Clock className="h-3.5 w-3.5" />
              {duration} min
            </span>
          )}
          {meta.intensity && (
            <Badge variant={intensityVariant(meta.intensity)}>{meta.intensity}</Badge>
          )}
          {meta.level && (
            <span className="text-xs text-text-muted">{meta.level}</span>
          )}
          {playerRange && (
            <span className="inline-flex items-center gap-1 text-xs text-text-muted">
              <Users className="h-3.5 w-3.5" />
              {playerRange}
            </span>
          )}
          {(resource.usageCount ?? 0) > 0 && (
            <span className="inline-flex items-center gap-1 text-xs text-text-muted">
              <Star className="h-3.5 w-3.5" />
              {resource.usageCount} usos
            </span>
          )}
        </div>

        <div className="mt-4 flex flex-wrap gap-2 border-t border-border-subtle pt-3">
          <Button size="sm" onClick={() => onCopy(resource)}>
            <Copy className="h-3.5 w-3.5" />
            {resource.contentType === CONTENT_TYPES.TRAINING ? 'Copiar a Entrenamientos' : 'Agregar a sesión'}
          </Button>
          {canEdit && resource.sourceType !== 'official' && (
            <>
              <Button size="sm" variant="secondary" onClick={() => onEdit(resource)}>
                Editar
              </Button>
              <Button size="sm" variant="ghost" onClick={() => onDelete(resource)}>
                Eliminar
              </Button>
            </>
          )}
        </div>
      </div>
    </article>
  )
}
