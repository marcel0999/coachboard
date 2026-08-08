import { getMarkerDisplay } from '../../utils/tacticalBoardState'
import { getPlayerPizarraAlert } from '../../utils/tacticalBoardPlayers'
import { getFullName } from '../../utils/players'
import { DEFAULT_DISPLAY_OPTIONS } from '../../constants/tacticalBoard'

function alertBorderClass(alert, isSelected) {
  if (alert?.level === 'red') return 'border-red-400 ring-red-500/30'
  if (alert?.level === 'yellow') return 'border-amber-400 ring-amber-500/30'
  if (isSelected) return 'border-yellow-300 ring-yellow-400/40'
  return 'border-white/90 ring-white/25'
}

export default function PitchMarker({
  marker,
  mode,
  playerMap,
  teamColors,
  isSelected,
  isDragging,
  onPointerDown,
  displayOptions = DEFAULT_DISPLAY_OPTIONS,
}) {
  const display = getMarkerDisplay(marker, mode, playerMap)
  const player = display.player
  const alert = player ? getPlayerPizarraAlert(player) : null

  const primaryColor = teamColors?.primaryColor ?? '#10b981'
  const numberColor = teamColors?.numberColor ?? '#ffffff'
  const positionLabel = marker.label || player?.primaryPosition || display.secondary

  const tokenClasses = [
    'pitch-marker-token absolute touch-none select-none',
    isDragging ? 'is-dragging z-40' : isSelected ? 'is-selected z-20' : 'z-10 hover:scale-105',
  ].join(' ')

  const positionStyle = {
    left: `${marker.x}%`,
    top: `${marker.y}%`,
    transform: isDragging ? 'translate(-50%, -50%) scale(1.08)' : 'translate(-50%, -50%)',
  }

  const showNumber = displayOptions.showNumbers !== false
  const showName = displayOptions.showNames !== false && player && mode !== 'positions'
  const showPosition = displayOptions.showPositions !== false

  if (mode === 'chips' && player) {
    return (
      <div
        className={tokenClasses}
        style={positionStyle}
        onPointerDown={(event) => onPointerDown(event, marker.id)}
      >
        <div
          className={[
            'flex w-[5rem] flex-col items-center overflow-hidden rounded-xl border-2 bg-surface-card/95 p-1.5 shadow-lg backdrop-blur-sm',
            alertBorderClass(alert, isSelected),
            isSelected ? 'ring-4' : 'ring-1',
          ].join(' ')}
        >
          {showNumber && (
            <div
              className="flex h-9 w-9 items-center justify-center rounded-full text-sm font-extrabold shadow-md"
              style={{ backgroundColor: primaryColor, color: numberColor }}
            >
              {player.number}
            </div>
          )}
          {showName && (
            <span className="mt-1 max-w-full truncate px-0.5 text-center text-[9px] font-semibold leading-tight text-text-primary">
              {getFullName(player)}
            </span>
          )}
          {showPosition && (
            <span className="text-[8px] font-bold uppercase text-text-muted">{positionLabel}</span>
          )}
        </div>
        {alert && alert.level !== 'ok' && <AlertDot alert={alert} />}
      </div>
    )
  }

  return (
    <div
      className={tokenClasses}
      style={positionStyle}
      onPointerDown={(event) => onPointerDown(event, marker.id)}
    >
      <div className="flex flex-col items-center gap-0.5">
        {showNumber && (
          <div
            className={[
              'flex h-10 w-10 flex-col items-center justify-center rounded-full border-[2.5px] shadow-lg sm:h-11 sm:w-11',
              alertBorderClass(alert, isSelected),
              isSelected ? 'ring-4' : 'ring-1',
            ].join(' ')}
            style={{
              background: `linear-gradient(145deg, ${primaryColor} 0%, ${adjustColor(primaryColor, -25)} 100%)`,
              color: numberColor,
              boxShadow: isDragging
                ? '0 14px 28px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.25)'
                : '0 4px 14px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.2)',
            }}
          >
            <span className="text-base font-extrabold leading-none drop-shadow-sm sm:text-lg">
              {player ? player.number : display.primary}
            </span>
          </div>
        )}

        {showName && player && (
          <span className="max-w-[6rem] truncate rounded-md bg-black/70 px-1.5 py-0.5 text-center text-[10px] font-semibold leading-tight text-white shadow-sm backdrop-blur-sm">
            {getFullName(player)}
          </span>
        )}

        {showPosition && (
          <span className="text-[9px] font-bold uppercase tracking-wide text-white/90 drop-shadow-md">
            {positionLabel}
          </span>
        )}

        {!player && mode === 'positions' && !showNumber && (
          <div
            className={[
              'flex h-9 w-9 items-center justify-center rounded-full border-2 border-white/80 bg-black/30 text-[10px] font-bold text-white shadow-md',
              isSelected ? 'ring-4 ring-yellow-400/40' : '',
            ].join(' ')}
          >
            {display.secondary}
          </div>
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
  if (!hex?.startsWith('#') || hex.length < 7) return hex ?? '#10b981'
  const num = parseInt(hex.slice(1), 16)
  const r = Math.max(0, Math.min(255, ((num >> 16) & 0xff) + amount))
  const g = Math.max(0, Math.min(255, ((num >> 8) & 0xff) + amount))
  const b = Math.max(0, Math.min(255, (num & 0xff) + amount))
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`
}
