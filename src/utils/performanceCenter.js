import { calculateAge, getFullName } from './players'
import { getPlayerMatchMinutes } from './matches'
import { TEAM_NAME } from '../constants/performance'
import { getLocaleTag } from '../config/localization'

function getWeekKey(dateStr) {
  const date = new Date(dateStr)
  const monday = new Date(date)
  const day = monday.getDay()
  const diff = day === 0 ? -6 : 1 - day
  monday.setDate(monday.getDate() + diff)
  return monday.toISOString().slice(0, 10)
}


function formatWeekLabel(weekKey) {
  const date = new Date(weekKey)
  return date.toLocaleDateString(getLocaleTag(), { day: 'numeric', month: 'short' })
}

function eventTypeLabel(type) {
  const labels = {
    goal: 'Gol',
    assist: 'Asistencia',
    substitution: 'Cambio',
    yellow: 'Tarjeta amarilla',
    red: 'Tarjeta roja',
    injury: 'Lesión',
  }
  return labels[type] ?? type
}

export function buildPlayerPerformanceProfile(player, matches, trainings) {
  const playerId = player.id
  const finalizedMatches = matches.filter((match) => match.status === 'Finalizado')
  const finalizedTrainings = trainings.filter((training) => training.status === 'Finalizado')
  const allTrainings = trainings.filter((training) => training.status !== 'En curso')

  const participatedMatches = finalizedMatches.filter(
    (match) =>
      match.squad.starters.includes(playerId) ||
      match.squad.substitutes.includes(playerId),
  )

  const starts = participatedMatches.filter((match) =>
    match.squad.starters.includes(playerId),
  ).length

  const stats = player.statistics ?? {
    matches: 0,
    minutes: 0,
    goals: 0,
    assists: 0,
    yellowCards: 0,
    redCards: 0,
    matchIds: [],
  }

  const medicalHistory = [...(player.medicalHistory ?? [])].sort(
    (a, b) => new Date(b.date) - new Date(a.date),
  )

  const activeInjuries = medicalHistory.filter(
    (record) => record.status === 'Activo' || record.status === 'En tratamiento',
  )

  const lastInjury = medicalHistory[0] ?? null

  const trainingsAttended = finalizedTrainings.filter((training) =>
    training.players.attendees.includes(playerId),
  )

  const trainingsMissed = finalizedTrainings.filter(
    (training) =>
      training.players.absent.includes(playerId) ||
      training.players.injured.includes(playerId),
  )

  const scheduledTrainings = allTrainings.filter(
    (training) =>
      training.players.attendees.includes(playerId) ||
      training.players.absent.includes(playerId) ||
      training.players.injured.includes(playerId),
  )

  const availabilityPercent = scheduledTrainings.length
    ? Math.round((trainingsAttended.length / scheduledTrainings.length) * 100)
    : 100

  const matchMinutesChart = participatedMatches.map((match) => ({
    label: `vs ${match.opponent}`,
    value: getPlayerMatchMinutes(playerId, match),
    date: match.date,
  }))

  const weeklyLoadMap = {}
  finalizedTrainings.forEach((training) => {
    const entry = training.loadControl?.find((item) => item.playerId === playerId)
    if (!entry || !training.date) return
    const weekKey = getWeekKey(training.date)
    weeklyLoadMap[weekKey] = (weeklyLoadMap[weekKey] ?? 0) + (entry.totalLoad || 0)
  })

  const weeklyLoadChart = Object.entries(weeklyLoadMap)
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-6)
    .map(([weekKey, value]) => ({
      label: formatWeekLabel(weekKey),
      value,
    }))

  const weeklyTrainingMap = {}
  finalizedTrainings.forEach((training) => {
    if (!training.date) return
    const weekKey = getWeekKey(training.date)
    if (!weeklyTrainingMap[weekKey]) {
      weeklyTrainingMap[weekKey] = { attended: 0, missed: 0 }
    }
    if (training.players.attendees.includes(playerId)) {
      weeklyTrainingMap[weekKey].attended += 1
    } else if (
      training.players.absent.includes(playerId) ||
      training.players.injured.includes(playerId)
    ) {
      weeklyTrainingMap[weekKey].missed += 1
    }
  })

  const trainingParticipationChart = Object.entries(weeklyTrainingMap)
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-6)
    .flatMap(([weekKey, data]) => [
      { label: `${formatWeekLabel(weekKey)} ✓`, value: data.attended, group: weekKey },
      { label: `${formatWeekLabel(weekKey)} ✗`, value: data.missed, group: weekKey },
    ])

  const participationChart = Object.entries(weeklyTrainingMap)
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-6)
    .map(([weekKey, data]) => ({
      label: formatWeekLabel(weekKey),
      value: data.attended + data.missed > 0
        ? Math.round((data.attended / (data.attended + data.missed)) * 100)
        : 0,
    }))

  const coachNotes = finalizedTrainings
    .filter(
      (training) =>
        training.players.attendees.includes(playerId) &&
        training.summary?.finalNotes,
    )
    .map((training) => ({
      date: training.date,
      text: training.summary.finalNotes,
      context: training.category,
    }))
    .sort((a, b) => new Date(b.date) - new Date(a.date))

  const differentiatedWork = trainings
    .flatMap((training) =>
      (training.players.differentiated ?? [])
        .filter((entry) => entry.playerId === playerId)
        .map((entry) => ({
          date: training.date,
          work: entry.work,
          notes: entry.notes,
        })),
    )
    .filter((entry) => entry.work || entry.notes)

  const timeline = []

  trainingsAttended.forEach((training) => {
    timeline.push({
      id: `tr-att-${training.id}`,
      date: training.date,
      type: 'training',
      title: 'Entrenamiento asistido',
      description: `${training.category} · ${training.objective || training.field}`,
      sortDate: training.date,
    })
  })

  trainingsMissed.forEach((training) => {
    timeline.push({
      id: `tr-miss-${training.id}`,
      date: training.date,
      type: 'training-missed',
      title: 'Entrenamiento perdido',
      description: `${training.category} · ${training.players.injured.includes(playerId) ? 'Lesionado' : 'Ausente'}`,
      sortDate: training.date,
    })
  })

  participatedMatches.forEach((match) => {
    const minutes = getPlayerMatchMinutes(playerId, match)
    const isStarter = match.squad.starters.includes(playerId)
    timeline.push({
      id: `match-${match.id}`,
      date: match.date,
      type: 'match',
      title: `Partido vs ${match.opponent}`,
      description: `${isStarter ? 'Titular' : 'Suplente'} · ${minutes} min · ${match.goalsFor}-${match.goalsAgainst}`,
      sortDate: match.date,
    })

    match.events.forEach((event) => {
      const involved =
        event.playerId === playerId ||
        event.assistPlayerId === playerId ||
        event.playerOutId === playerId ||
        event.playerInId === playerId

      if (!involved) return

      let description = `${event.minute}'`
      if (event.type === 'substitution') {
        if (event.playerInId === playerId) description = `Entrada ${event.minute}'`
        if (event.playerOutId === playerId) description = `Salida ${event.minute}'`
      }
      if (event.notes) description += ` · ${event.notes}`

      timeline.push({
        id: `evt-${event.id}-${playerId}`,
        date: match.date,
        type: event.type,
        title: eventTypeLabel(event.type),
        description,
        sortDate: match.date,
      })
    })
  })

  medicalHistory.forEach((record) => {
    timeline.push({
      id: `med-${record.id}`,
      date: record.date,
      type: 'injury',
      title: record.injury,
      description: `${record.bodyZone} · ${record.daysOff} días · ${record.status}${record.notes ? ` · ${record.notes}` : ''}`,
      sortDate: record.date,
    })
  })

  if (player.notes) {
    timeline.push({
      id: `notes-${playerId}`,
      date: player.birthDate || '2000-01-01',
      type: 'observation',
      title: 'Observaciones del plantel',
      description: player.notes,
      sortDate: player.birthDate || '2000-01-01',
    })
  }

  differentiatedWork.forEach((entry, index) => {
    timeline.push({
      id: `diff-${playerId}-${index}`,
      date: entry.date,
      type: 'observation',
      title: 'Trabajo diferenciado',
      description: `${entry.work}${entry.notes ? ` · ${entry.notes}` : ''}`,
      sortDate: entry.date,
    })
  })

  timeline.sort((a, b) => new Date(b.sortDate) - new Date(a.sortDate))

  const matchCount = stats.matches || participatedMatches.length
  const averages = {
    minutesPerMatch: matchCount ? Math.round((stats.minutes / matchCount) * 10) / 10 : 0,
    goalsPerMatch: matchCount ? Math.round((stats.goals / matchCount) * 100) / 100 : 0,
    assistsPerMatch: matchCount ? Math.round((stats.assists / matchCount) * 100) / 100 : 0,
    cardsPerMatch: matchCount
      ? Math.round(((stats.yellowCards + stats.redCards) / matchCount) * 100) / 100
      : 0,
  }

  return {
    summary: {
      photo: player.photo,
      name: getFullName(player),
      age: calculateAge(player.birthDate),
      position: player.primaryPosition,
      status: player.physicalStatus,
      team: TEAM_NAME,
      number: player.number,
    },
    physical: {
      activeInjuries,
      lastInjury,
      daysOffLastInjury: lastInjury?.daysOff ?? 0,
      trainingsAttended: trainingsAttended.length,
      trainingsMissed: trainingsMissed.length,
      availability: availabilityPercent,
      physicalStatus: player.physicalStatus,
    },
    statistics: {
      matches: stats.matches,
      starts,
      minutes: stats.minutes,
      goals: stats.goals,
      assists: stats.assists,
      yellowCards: stats.yellowCards,
      redCards: stats.redCards,
      averages,
    },
    charts: {
      matchMinutes: matchMinutesChart,
      weeklyLoad: weeklyLoadChart,
      trainingParticipation: trainingParticipationChart,
      participation: participationChart,
    },
    evolution: {
      weight: player.weight,
      height: player.height,
      observations: player.notes,
      coachNotes,
    },
    timeline,
  }
}

export function sortPlayersForPerformance(players, sortBy) {
  const sorted = [...players]
  sorted.sort((a, b) => {
    switch (sortBy) {
      case 'minutes':
        return (b.statistics?.minutes ?? 0) - (a.statistics?.minutes ?? 0)
      case 'goals':
        return (b.statistics?.goals ?? 0) - (a.statistics?.goals ?? 0)
      case 'position':
        return a.primaryPosition.localeCompare(b.primaryPosition, 'es')
      case 'age': {
        const ageA = calculateAge(a.birthDate) ?? 0
        const ageB = calculateAge(b.birthDate) ?? 0
        return ageA - ageB
      }
      case 'name':
      default:
        return getFullName(a).localeCompare(getFullName(b), 'es')
    }
  })
  return sorted
}

export function buildAllPerformanceProfiles(players, matches, trainings) {
  return Object.fromEntries(
    players.map((player) => [
      player.id,
      buildPlayerPerformanceProfile(player, matches, trainings),
    ]),
  )
}
