import PlayerAvatar from '../plantel/PlayerAvatar'
import Badge from '../ui/Badge'
import { statusToVariant } from '../../utils/badgeVariants'
import { getFullName } from '../../utils/players'

export default function PlayerPerformanceCard({ player, profile, onClick }) {
  const stats = profile.statistics

  return (
    <button
      type="button"
      onClick={() => onClick(player)}
      className="flex w-full flex-col rounded-2xl border border-border bg-surface-elevated p-5 text-left shadow-sm transition hover:border-accent/40 hover:shadow-md"
    >
      <div className="flex items-center gap-4">
        <PlayerAvatar player={player} />
        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold text-text-primary">{getFullName(player)}</p>
          <p className="text-sm text-text-secondary">{player.primaryPosition}</p>
          <div className="mt-2">
            <Badge variant={statusToVariant(player.physicalStatus)}>{player.physicalStatus}</Badge>
          </div>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2 border-t border-border-subtle pt-4">
        <div className="text-center">
          <p className="text-lg font-bold text-text-primary">{stats.minutes}</p>
          <p className="text-[10px] text-text-muted">Min</p>
        </div>
        <div className="text-center">
          <p className="text-lg font-bold text-accent">{stats.goals}</p>
          <p className="text-[10px] text-text-muted">Goles</p>
        </div>
        <div className="text-center">
          <p className="text-lg font-bold text-text-primary">{profile.physical.availability}%</p>
          <p className="text-[10px] text-text-muted">Disp.</p>
        </div>
      </div>
    </button>
  )
}
