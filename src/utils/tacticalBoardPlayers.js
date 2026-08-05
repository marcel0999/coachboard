import { getFullName } from './players'
import { getPlayerGeneralMedicalStatus } from './medicalCenter'

export function getPlayerPizarraAlert(player) {
  if (player.physicalStatus === 'Lesionado') {
    return { level: 'red', message: 'Lesionado' }
  }
  if (player.physicalStatus === 'Suspendido') {
    return { level: 'red', message: 'Suspendido' }
  }

  const medical = getPlayerGeneralMedicalStatus(player)
  if (medical.level === 'expired' || medical.level === 'missing') {
    return { level: 'red', message: medical.label }
  }
  if (medical.level === 'critical' || medical.level === 'warning') {
    return { level: 'yellow', message: medical.label }
  }

  return { level: 'ok', message: null }
}

export function groupPlayersForPizarra(players, search = '') {
  const query = search.trim().toLowerCase()
  const filtered = players.filter((player) => {
    if (!query) return true
    const fullName = getFullName(player).toLowerCase()
    return (
      fullName.includes(query) ||
      String(player.number).includes(query) ||
      player.primaryPosition.toLowerCase().includes(query)
    )
  })

  const groups = {
    available: [],
    injured: [],
    suspended: [],
    medical: [],
  }

  filtered.forEach((player) => {
    const alert = getPlayerPizarraAlert(player)
    if (player.physicalStatus === 'Lesionado') {
      groups.injured.push({ player, alert })
    } else if (player.physicalStatus === 'Suspendido') {
      groups.suspended.push({ player, alert })
    } else if (alert.level === 'red') {
      groups.medical.push({ player, alert })
    } else {
      groups.available.push({ player, alert })
    }
  })

  return groups
}

export function autoAssignPlayersToMarkers(markers, players) {
  const pool = [...players]
  const used = new Set()

  const pick = (predicate) => {
    const index = pool.findIndex((player) => !used.has(player.id) && predicate(player))
    if (index < 0) {
      const fallback = pool.findIndex((player) => !used.has(player.id))
      if (fallback < 0) return null
      const player = pool[fallback]
      used.add(player.id)
      return player
    }
    const player = pool[index]
    used.add(player.id)
    return player
  }

  return markers.map((marker) => {
    if (marker.playerId) return marker

    let player = null
    if (marker.slotId === 'gk' || marker.label === 'ARQ') {
      player = pick((p) => p.primaryPosition === 'Arquero')
    }
    if (!player) {
      player = pick(() => true)
    }

    if (!player) return marker

    return {
      ...marker,
      playerId: player.id,
      label: String(player.number),
    }
  })
}
