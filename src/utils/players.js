import { normalizeDocumentField } from './localization'

export function getFullName(player) {
  return `${player.firstName} ${player.lastName}`.trim()
}

export function getInitials(player) {
  const first = player.firstName?.[0] ?? ''
  const last = player.lastName?.[0] ?? ''
  return `${first}${last}`.toUpperCase() || '?'
}

export function calculateAge(birthDate) {
  if (!birthDate) return null
  const today = new Date()
  const birth = new Date(birthDate)
  let age = today.getFullYear() - birth.getFullYear()
  const monthDiff = today.getMonth() - birth.getMonth()
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age -= 1
  }
  return age
}

export function generatePlayerId() {
  return `plr-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
}

export function filterPlayers(players, { search, statusFilter }) {
  const query = search.trim().toLowerCase()

  return players.filter((player) => {
    const matchesStatus =
      statusFilter === 'all' || player.physicalStatus === statusFilter

    if (!matchesStatus) return false
    if (!query) return true

    const fullName = getFullName(player).toLowerCase()
    const number = String(player.number)
    const position = player.primaryPosition.toLowerCase()

    return (
      fullName.includes(query) ||
      number.includes(query) ||
      position.includes(query) ||
      player.email.toLowerCase().includes(query)
    )
  })
}

export function sortPlayers(players, sortBy) {
  const sorted = [...players]

  sorted.sort((a, b) => {
    switch (sortBy) {
      case 'age': {
        const ageA = calculateAge(a.birthDate) ?? 0
        const ageB = calculateAge(b.birthDate) ?? 0
        return ageA - ageB
      }
      case 'position':
        return a.primaryPosition.localeCompare(b.primaryPosition, 'es')
      case 'name':
      default:
        return getFullName(a).localeCompare(getFullName(b), 'es')
    }
  })

  return sorted
}

export function normalizePlayerForm(formData) {
  return {
    ...formData,
    document: normalizeDocumentField(formData.document, formData.documentType),
    documentType: formData.documentType ?? '',
    estimatedValueCurrency: formData.estimatedValueCurrency ?? 'UYU',
    height: formData.height === '' ? '' : Number(formData.height),
    weight: formData.weight === '' ? '' : Number(formData.weight),
    number: formData.number === '' ? '' : Number(formData.number),
    estimatedValue:
      formData.estimatedValue === '' ? '' : Number(formData.estimatedValue),
    medicalHistory: formData.medicalHistory ?? [],
    documents: formData.documents ?? [],
    statistics: formData.statistics ?? {
      matches: 0,
      minutes: 0,
      goals: 0,
      assists: 0,
      yellowCards: 0,
      redCards: 0,
      matchIds: [],
    },
  }
}

export function updatePlayerById(players, playerId, updates) {
  return players.map((player) =>
    player.id === playerId ? { ...player, ...updates } : player,
  )
}
