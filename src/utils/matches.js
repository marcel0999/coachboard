import { createDefaultStatistics } from './playerFactory'
import { formatDateTime } from './localization'

export function generateMatchId() {
  return `match-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
}

export function generateEventId() {
  return `evt-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
}

export function filterMatches(matches, { search, statusFilter }) {
  const query = search.trim().toLowerCase()

  return matches.filter((match) => {
    const matchesStatus = statusFilter === 'all' || match.status === statusFilter
    if (!matchesStatus) return false
    if (!query) return true

    return (
      match.opponent.toLowerCase().includes(query) ||
      match.competition.toLowerCase().includes(query) ||
      match.stadium.toLowerCase().includes(query) ||
      match.city.toLowerCase().includes(query)
    )
  })
}

export function sortMatches(matches, sortBy) {
  const sorted = [...matches]

  sorted.sort((a, b) => {
    switch (sortBy) {
      case 'date-asc':
        return `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`)
      case 'opponent':
        return a.opponent.localeCompare(b.opponent, 'es')
      case 'competition':
        return a.competition.localeCompare(b.competition, 'es')
      case 'date-desc':
      default:
        return `${b.date}${b.time}`.localeCompare(`${a.date}${a.time}`)
    }
  })

  return sorted
}

export function formatMatchResult(match) {
  if (match.goalsFor === '' || match.goalsAgainst === '' || match.goalsFor === null || match.goalsAgainst === null) {
    return '—'
  }
  return `${match.goalsFor} - ${match.goalsAgainst}`
}

export function formatMatchDateTime(date, time, settings) {
  return formatDateTime(date, time, settings)
}

export function initializeSquad(allPlayerIds) {
  return {
    starters: [],
    substitutes: [],
    notCalled: [...allPlayerIds],
  }
}

export function normalizeMatchForm(formData) {
  return {
    ...formData,
    goalsFor: formData.goalsFor === '' ? '' : Number(formData.goalsFor),
    goalsAgainst: formData.goalsAgainst === '' ? '' : Number(formData.goalsAgainst),
    summary: {
      possession: formData.summary?.possession === '' ? '' : Number(formData.summary?.possession ?? ''),
      shots: formData.summary?.shots === '' ? '' : Number(formData.summary?.shots ?? ''),
      corners: formData.summary?.corners === '' ? '' : Number(formData.summary?.corners ?? ''),
      fouls: formData.summary?.fouls === '' ? '' : Number(formData.summary?.fouls ?? ''),
      coachNotes: formData.summary?.coachNotes ?? '',
    },
  }
}

export function getPlayerMatchMinutes(playerId, match) {
  const { squad, events } = match
  const isStarter = squad.starters.includes(playerId)
  const isSub = squad.substitutes.includes(playerId)

  if (!isStarter && !isSub) return 0

  let inMinute = isStarter ? 0 : null
  let outMinute = 90

  events
    .filter((event) => event.type === 'substitution')
    .forEach((event) => {
      if (event.playerOutId === playerId) outMinute = Math.min(outMinute, event.minute)
      if (event.playerInId === playerId) inMinute = event.minute
    })

  if (inMinute === null) return 0
  return Math.max(0, outMinute - inMinute)
}

function calculatePlayerMinutes(playerId, match) {
  return getPlayerMatchMinutes(playerId, match)
}

export function syncPlayerStatisticsFromMatches(players, matches) {
  const finalizedMatches = matches.filter((match) => match.status === 'Finalizado')

  return players.map((player) => {
    const stats = createDefaultStatistics()

    finalizedMatches.forEach((match) => {
      const participated =
        match.squad.starters.includes(player.id) ||
        match.squad.substitutes.includes(player.id)

      if (!participated) return

      stats.matches += 1
      stats.matchIds.push(match.id)
      stats.minutes += calculatePlayerMinutes(player.id, match)

      match.events.forEach((event) => {
        if (event.type === 'goal' && event.playerId === player.id) stats.goals += 1
        if (event.type === 'goal' && event.assistPlayerId === player.id) stats.assists += 1
        if (event.type === 'assist' && event.playerId === player.id) stats.assists += 1
        if (event.type === 'yellow' && event.playerId === player.id) stats.yellowCards += 1
        if (event.type === 'red' && event.playerId === player.id) stats.redCards += 1
      })
    })

    return { ...player, statistics: stats }
  })
}

export function countGoalsFromEvents(events) {
  return events.filter((event) => event.type === 'goal').length
}
