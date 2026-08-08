import PlayerAvatar from '../plantel/PlayerAvatar'
import { getMarkerDisplay } from '../../utils/tacticalBoardState'
import { getPlayerPizarraAlert } from '../../utils/tacticalBoardPlayers'

function alertBorderClass(alert, isSelected) {
  if (alert?.level === 'red') return 'border-red-400 ring-red-200/60'
  if (alert?.level === 'yellow') return 'border-amber-400 ring-amber-200/60'
  if (isSelected) return 'border-yellow-300 ring-yellow-300/50'
  return 'border-white/90 ring-white/20'
}

export default function PitchMarker({
  marker,
  mode,
  playerMap,
  teamColors,
  isSelected,
  isDragging,
  onPointerDown,
}) {
  const display = getMarkerDisplay(marker, mode, playerMap)
  const player = display.player
  const alert = player ? getPlayerPizarraAlert(player) : null

  const primaryColor = teamColors?.primaryColor ?? '#2563eb'
  const numberColor = teamColors?.numberColor ?? '#ffffff'

  const tokenClasses = [
    'pitch-marker-token absolute touch-none select-none',
    isDragging ? 'is-dragging z-40' : isSelected ? 'is-selected z-20' : 'z-10 hover:scale-105',
  ].join(' ')

  const positionStyle = {
    left: `${marker.x}%`,
    top: `${marker.y}%`,
    transform: isDragging ? 'translate(-50%, -50%) scale(1.12)' : 'translate(-50%, -50%)',
  }

  if (mode === 'chips' && player) {
    return (
      <div
        className={tokenClasses}
        style={positionStyle}
        onPointerDown={(event) => onPointerDown(event, marker.id)}
      >
        <div
          className={[
            'flex w-[4.5rem] flex-col items-center overflow-hidden rounded-xl border-2 bg-surface-elevated/95 p-1 shadow-lg backdrop-blur-sm',
            alertBorderClass(alert, isSelected),
            isSelected ? 'ring-4' : 'ring-1',
          ].join(' ')}
          style={{
            boxShadow: isDragging
              ? '0 16px 32px rgba(0,0,0,0.28)'
              : '0 4px 14px rgba(0,0,0,0.18)',
          }}
        >
          <div
            className="w-full rounded-lg px-1 py-0.5 text-center text-[9px] font-bold uppercase tracking-wide"
            style={{ backgroundColor: primaryColor, color: numberColor }}
          >
            #{player.number}
          </div>
          <PlayerAvatar player={player} size="sm" />
          <span className="mt-0.5 max-w-full truncate px-1 text-[9px] font-semibold text-text-primary">
            {player.lastName}
          </span>
        </div>
        {alert && alert.level !== 'ok' && (
          <AlertDot alert={alert} />
        )}
      </div>
    )
  }

  const showName = player && mode === 'squad'
  const label = showName ? (player.lastName?.slice(0, 8) ?? display.secondary) : display.secondary

  return (
    <div
      className={tokenClasses}
      style={positionStyle}
      onPointerDown={(event) => onPointerDown(event, marker.id)}
    >
      <div className="flex flex-col items-center gap-0.5">
        <div
          className={[
            'flex flex-col items-center justify-center rounded-full border-[2.5px] shadow-lg',
            mode === 'squad' ? 'h-[3rem] w-[3rem]' : 'h-[2.625rem] w-[2.625rem]',
            alertBorderClass(alert, isSelected),
            isSelected ? 'ring-4' : 'ring-1',
          ].join(' ')}
          style={{
            background: `linear-gradient(145deg, ${primaryColor} 0%, ${adjustColor(primaryColor, -20)} 100%)`,
            color: numberColor,
            boxShadow: isDragging
              ? '0 14px 28px rgba(0,0,0,0.32), inset 0 1px 0 rgba(255,255,255,0.25)'
              : '0 4px 12px rgba(0,0,0,0.22), inset 0 1px 0 rgba(255,255,255,0.2)',
          }}
        >
          <span className="text-sm font-extrabold leading-none drop-shadow-sm">{display.primary}</span>
          {label && !showName && (
            <span className="mt-0.5 text-[8px] font-semibold leading-none opacity-90">{label}</span>
          )}
        </div>
        {showName && (
          <span className="max-w-[4.5rem] truncate rounded-full bg-slate-900/75 px-1.5 py-0.5 text-[8px] font-semibold text-white shadow-sm backdrop-blur-sm">
            {label}
          </span>
        )}
        {!player && mode !== 'positions' && (
          <span className="max-w-[4rem] truncate text-[8px] font-medium text-white/90 drop-shadow-md">
            {marker.label}
          </span>
        )}
      </div>
      {alert && alert.level !== 'ok' && <AlertDot alert={alert} />}
    </div>
  )
}

function AlertDot({ alert }) {
  return (
    <span
      className={`absolute -right-0.5 -top-0.5 h-3 w-3 rounded-full border-2 border-white shadow ${
        alert.level === 'red' ? 'bg-red-500' : 'bg-amber-400'
      }`}
      title={alert.message}
    />
  )
}

function adjustColor(hex, amount) {
  if (!hex?.startsWith('#') || hex.length < 7) return hex ?? '#2563eb'
  const num = parseInt(hex.slice(1), 16)
  const r = Math.max(0, Math.min(255, ((num >> 16) & 0xff) + amount))
  const g = Math.max(0, Math.min(255, ((num >> 8) & 0xff) + amount))
  const b = Math.max(0, Math.min(255, (num & 0xff) + amount))
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`
}
