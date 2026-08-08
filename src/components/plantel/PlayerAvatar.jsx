import { getInitials } from '../../utils/players'

const AVATAR_COLORS = [
  'bg-emerald-500',
  'bg-blue-500',
  'bg-violet-500',
  'bg-amber-500',
  'bg-rose-500',
  'bg-cyan-500',
  'bg-indigo-500',
  'bg-teal-500',
]

function getColorClass(id) {
  const hash = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
  return AVATAR_COLORS[hash % AVATAR_COLORS.length]
}

export default function PlayerAvatar({ player, size = 'md' }) {
  const sizeClass = {
    sm: 'h-9 w-9 text-xs',
    md: 'h-11 w-11 text-sm',
    lg: 'h-20 w-20 text-xl',
  }[size] ?? 'h-11 w-11 text-sm'

  if (player.photo) {
    return (
      <img
        src={player.photo}
        alt={player.firstName}
        className={`${sizeClass} shrink-0 rounded-full object-cover ring-2 ring-border shadow-sm`}
      />
    )
  }

  return (
    <div
      className={`${sizeClass} ${getColorClass(player.id)} flex shrink-0 items-center justify-center rounded-full font-semibold text-white ring-2 ring-border shadow-sm`}
      aria-hidden="true"
    >
      {getInitials(player)}
    </div>
  )
}
