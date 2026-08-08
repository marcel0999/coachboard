import { useState } from 'react'
import { Building2, ChevronDown } from 'lucide-react'
import Badge from '../../../components/ui/Badge'
import { ROLE_LABELS } from '../../../constants/auth'

export default function ClubSelector({ club, userClubs, roleLabel, onSwitchClub, switching }) {
  const clubs = userClubs.length ? userClubs : club ? [{ club, role: roleLabel }] : []
  const [open, setOpen] = useState(false)

  async function handleChange(event) {
    const nextClubId = event.target.value
    if (!nextClubId || nextClubId === club?.id || !onSwitchClub) return
    setOpen(false)
    await onSwitchClub(nextClubId)
  }

  return (
    <div className="rounded-2xl border border-border/60 bg-surface-card p-4 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent-subtle text-accent">
            <Building2 className="h-5 w-5" />
          </div>
          <div>
            <p className="text-label text-accent">Club activo</p>
            <p className="font-display text-lg font-bold text-text-primary">
              {switching ? 'Cambiando club…' : (club?.name ?? 'Sin club')}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="accent" dot>
            {roleLabel ?? 'Miembro'}
          </Badge>
          {clubs.length > 1 && onSwitchClub && (
            <label className="relative inline-flex items-center">
              <span className="sr-only">Seleccionar club</span>
              <select
                value={club?.id ?? ''}
                onChange={handleChange}
                disabled={switching}
                onFocus={() => setOpen(true)}
                onBlur={() => setOpen(false)}
                className="appearance-none rounded-xl border border-border/60 bg-surface-muted py-1.5 pl-3 pr-8 text-xs font-medium text-text-secondary focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
              >
                {clubs.map((entry) => (
                  <option key={entry.club.id} value={entry.club.id}>
                    {entry.club.name} · {ROLE_LABELS[entry.role] ?? entry.role ?? 'Miembro'}
                  </option>
                ))}
              </select>
              <ChevronDown
                className={`pointer-events-none absolute right-2 h-3.5 w-3.5 text-text-muted transition ${open ? 'rotate-180' : ''}`}
              />
            </label>
          )}
        </div>
      </div>
    </div>
  )
}
