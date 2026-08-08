import { useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import Button from '../ui/Button'
import Badge from '../ui/Badge'
import ConfirmModal from '../ui/ConfirmModal'
import { FormField, Input, Select, Textarea } from '../ui/FormField'
import { EVENT_TYPES } from '../../constants/matches'
import { generateEventId } from '../../utils/matches'
import { getFullName } from '../../utils/players'

const EMPTY_EVENT = {
  type: 'goal',
  playerId: '',
  assistPlayerId: '',
  playerOutId: '',
  playerInId: '',
  minute: '',
  notes: '',
}

function eventLabel(type) {
  return EVENT_TYPES.find((item) => item.value === type)?.label ?? type
}

function eventVariant(type) {
  switch (type) {
    case 'goal':
      return 'success'
    case 'red':
      return 'danger'
    case 'yellow':
      return 'warning'
    default:
      return 'default'
  }
}

export default function MatchEventsTab({ match, players, onChange }) {
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(EMPTY_EVENT)
  const [deletingEvent, setDeletingEvent] = useState(null)

  const calledPlayers = players.filter(
    (player) =>
      match.squad.starters.includes(player.id) ||
      match.squad.substitutes.includes(player.id),
  )

  const getPlayerName = (id) => {
    const player = players.find((item) => item.id === id)
    return player ? getFullName(player) : '—'
  }

  const handleSave = (event) => {
    event.preventDefault()
    if (!form.minute) return

    const newEvent = {
      id: generateEventId(),
      type: form.type,
      minute: Number(form.minute),
      notes: form.notes,
      ...(form.type === 'goal' && {
        playerId: form.playerId,
        assistPlayerId: form.assistPlayerId || null,
      }),
      ...(form.type === 'assist' && { playerId: form.playerId }),
      ...(form.type === 'substitution' && {
        playerOutId: form.playerOutId,
        playerInId: form.playerInId,
      }),
      ...(['yellow', 'red', 'injury'].includes(form.type) && { playerId: form.playerId }),
    }

    onChange({ ...match, events: [...match.events, newEvent] })
    setForm(EMPTY_EVENT)
    setShowForm(false)
  }

  const handleDelete = () => {
    if (!deletingEvent) return
    onChange({
      ...match,
      events: match.events.filter((event) => event.id !== deletingEvent.id),
    })
    setDeletingEvent(null)
  }

  const renderEventDescription = (event) => {
    switch (event.type) {
      case 'goal':
        return `${getPlayerName(event.playerId)}${event.assistPlayerId ? ` (Asist: ${getPlayerName(event.assistPlayerId)})` : ''}`
      case 'assist':
        return getPlayerName(event.playerId)
      case 'substitution':
        return `${getPlayerName(event.playerOutId)} → ${getPlayerName(event.playerInId)}`
      case 'yellow':
      case 'red':
      case 'injury':
        return getPlayerName(event.playerId)
      default:
        return ''
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-text-secondary">{match.events.length} eventos registrados</p>
        {!showForm && (
          <Button size="sm" onClick={() => setShowForm(true)}>
            <Plus className="h-4 w-4" />
            Registrar evento
          </Button>
        )}
      </div>

      {showForm && (
        <form onSubmit={handleSave} className="rounded-2xl border border-border bg-surface-muted p-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <FormField label="Tipo de evento">
              <Select value={form.type} onChange={(e) => setForm({ ...EMPTY_EVENT, type: e.target.value })}>
                {EVENT_TYPES.map((item) => (
                  <option key={item.value} value={item.value}>{item.label}</option>
                ))}
              </Select>
            </FormField>
            <FormField label="Minuto" required>
              <Input type="number" min="0" max="120" value={form.minute} onChange={(e) => setForm({ ...form, minute: e.target.value })} />
            </FormField>

            {form.type === 'goal' && (
              <>
                <FormField label="Goleador">
                  <Select value={form.playerId} onChange={(e) => setForm({ ...form, playerId: e.target.value })}>
                    <option value="">Seleccionar</option>
                    {calledPlayers.map((player) => (
                      <option key={player.id} value={player.id}>{getFullName(player)}</option>
                    ))}
                  </Select>
                </FormField>
                <FormField label="Asistencia (opcional)">
                  <Select value={form.assistPlayerId} onChange={(e) => setForm({ ...form, assistPlayerId: e.target.value })}>
                    <option value="">Sin asistencia</option>
                    {calledPlayers.map((player) => (
                      <option key={player.id} value={player.id}>{getFullName(player)}</option>
                    ))}
                  </Select>
                </FormField>
              </>
            )}

            {form.type === 'assist' && (
              <FormField label="Jugador" className="sm:col-span-2">
                <Select value={form.playerId} onChange={(e) => setForm({ ...form, playerId: e.target.value })}>
                  <option value="">Seleccionar</option>
                  {calledPlayers.map((player) => (
                    <option key={player.id} value={player.id}>{getFullName(player)}</option>
                  ))}
                </Select>
              </FormField>
            )}

            {form.type === 'substitution' && (
              <>
                <FormField label="Sale">
                  <Select value={form.playerOutId} onChange={(e) => setForm({ ...form, playerOutId: e.target.value })}>
                    <option value="">Seleccionar</option>
                    {calledPlayers.map((player) => (
                      <option key={player.id} value={player.id}>{getFullName(player)}</option>
                    ))}
                  </Select>
                </FormField>
                <FormField label="Entra">
                  <Select value={form.playerInId} onChange={(e) => setForm({ ...form, playerInId: e.target.value })}>
                    <option value="">Seleccionar</option>
                    {calledPlayers.map((player) => (
                      <option key={player.id} value={player.id}>{getFullName(player)}</option>
                    ))}
                  </Select>
                </FormField>
              </>
            )}

            {['yellow', 'red', 'injury'].includes(form.type) && (
              <FormField label="Jugador" className="sm:col-span-2">
                <Select value={form.playerId} onChange={(e) => setForm({ ...form, playerId: e.target.value })}>
                  <option value="">Seleccionar</option>
                  {calledPlayers.map((player) => (
                    <option key={player.id} value={player.id}>{getFullName(player)}</option>
                  ))}
                </Select>
              </FormField>
            )}

            <FormField label="Observaciones" className="sm:col-span-2">
              <Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={2} />
            </FormField>
          </div>
          <div className="mt-4 flex justify-end gap-2">
            <Button type="button" variant="secondary" size="sm" onClick={() => setShowForm(false)}>Cancelar</Button>
            <Button type="submit" size="sm">Agregar evento</Button>
          </div>
        </form>
      )}

      <div className="space-y-2">
        {[...match.events].sort((a, b) => a.minute - b.minute).map((event) => (
          <div key={event.id} className="flex items-center justify-between rounded-xl border border-border bg-surface-elevated px-4 py-3">
            <div className="flex items-center gap-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-surface-muted text-xs font-bold text-text-primary">
                {event.minute}'
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <Badge variant={eventVariant(event.type)}>{eventLabel(event.type)}</Badge>
                  <span className="text-sm font-medium text-text-primary">{renderEventDescription(event)}</span>
                </div>
                {event.notes && <p className="mt-0.5 text-xs text-text-muted">{event.notes}</p>}
              </div>
            </div>
            <button
              type="button"
              onClick={() => setDeletingEvent(event)}
              className="rounded-lg p-2 text-red-400 hover:bg-danger-subtle"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}
        {match.events.length === 0 && !showForm && (
          <p className="py-8 text-center text-sm text-text-muted">Sin eventos registrados</p>
        )}
      </div>

      <ConfirmModal
        isOpen={Boolean(deletingEvent)}
        onClose={() => setDeletingEvent(null)}
        onConfirm={handleDelete}
        title="Eliminar evento"
        message="¿Eliminar este evento del partido?"
        confirmLabel="Eliminar"
        variant="danger"
      />
    </div>
  )
}
