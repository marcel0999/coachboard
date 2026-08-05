import { getStaffFullName, getStaffInitials } from '../../utils/staff'

const AVATAR_COLORS = [
  'bg-violet-500',
  'bg-blue-500',
  'bg-emerald-500',
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

export default function StaffAvatar({ member, size = 'md' }) {
  const sizeClass = {
    sm: 'h-9 w-9 text-xs',
    md: 'h-11 w-11 text-sm',
    lg: 'h-16 w-16 text-base',
  }[size] ?? 'h-11 w-11 text-sm'

  const fullName = getStaffFullName(member)

  if (member.photo) {
    return (
      <img
        src={member.photo}
        alt={fullName}
        className={`${sizeClass} shrink-0 rounded-full object-cover ring-2 ring-white shadow-sm`}
      />
    )
  }

  return (
    <div
      className={`${sizeClass} flex shrink-0 items-center justify-center rounded-full font-bold text-white ring-2 ring-white shadow-sm ${getColorClass(member.id)}`}
    >
      {getStaffInitials(member)}
    </div>
  )
}
