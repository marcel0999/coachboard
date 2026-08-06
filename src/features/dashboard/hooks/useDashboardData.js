import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '../../../context/AuthContext'
import { useCategoryScope } from '../../../context/AppDataContext'
import { canViewModule } from '../../../utils/permissions'
import { formatMatchDateTime } from '../../../utils/matches'
import { fetchClubTeams, fetchUserActiveClubs } from '../../../services/supabase/teamsService'

export function useDashboardData() {
  const { club, role, membership, roleLabel, switchClub } = useAuth()
  const {
    scopedPlayers,
    scopedMatches,
    scopedTrainings,
    scopedStaff,
    categories,
    selectedCategoryId,
    isAllCategories,
    setSelectedCategoryId,
  } = useCategoryScope()

  const [teams, setTeams] = useState([])
  const [userClubs, setUserClubs] = useState([])
  const [loadingTeams, setLoadingTeams] = useState(true)
  const [teamsError, setTeamsError] = useState(null)
  const [switchingClub, setSwitchingClub] = useState(false)

  useEffect(() => {
    if (!club?.id) return undefined
    let cancelled = false

    async function load() {
      setLoadingTeams(true)
      setTeamsError(null)
      try {
        const [teamsRows, clubsRows] = await Promise.all([
          fetchClubTeams(club.id),
          fetchUserActiveClubs(),
        ])
        if (!cancelled) {
          setTeams(teamsRows)
          setUserClubs(clubsRows)
        }
      } catch (error) {
        if (!cancelled) setTeamsError(error.message)
      } finally {
        if (!cancelled) setLoadingTeams(false)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [club?.id])

  const stats = useMemo(() => {
    const upcomingMatches = [...scopedMatches]
      .filter((m) => m.status === 'Programado')
      .sort((a, b) => `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`))

    const todayKey = new Date().toISOString().slice(0, 10)
    const upcomingTrainings = [...scopedTrainings]
      .filter((t) => t.date >= todayKey)
      .sort((a, b) => a.date.localeCompare(b.date))

    return {
      players: scopedPlayers.length,
      teams: teams.length,
      staff: scopedStaff.length,
      available: scopedPlayers.filter((p) => p.physicalStatus === 'Disponible').length,
      injured: scopedPlayers.filter((p) => p.physicalStatus === 'Lesionado').length,
      nextMatch: upcomingMatches[0] ?? null,
      nextTrainings: upcomingTrainings.slice(0, 3),
      upcomingMatches: upcomingMatches.slice(0, 3),
    }
  }, [scopedPlayers, scopedMatches, scopedTrainings, scopedStaff.length, teams.length])

  const quickAccess = useMemo(() => {
    const items = [
      { module: 'plantel', label: 'Plantel', path: '/plantel', description: 'Jugadores y fichas' },
      { module: 'entrenamientos', label: 'Entrenamientos', path: '/entrenamientos', description: 'Planificación' },
      { module: 'partidos', label: 'Partidos', path: '/partidos', description: 'Calendario y resultados' },
      { module: 'pizarra', label: 'Pizarra', path: '/pizarra', description: 'Táctica y formaciones' },
      { module: 'biblioteca', label: 'Biblioteca', path: '/biblioteca', description: 'Ejercicios del club' },
      { module: 'staff', label: 'Staff', path: '/staff', description: 'Cuerpo técnico' },
      { module: 'medico', label: 'Centro médico', path: '/medico', description: 'Documentación' },
      { module: 'configuracion', label: 'Configuración', path: '/configuracion', description: 'Club y preferencias' },
    ]

    return items.filter((item) =>
      canViewModule(role, membership?.permissions, item.module),
    )
  }, [role, membership?.permissions])

  const isEmptyClub =
    stats.players === 0 && stats.teams === 0 && scopedMatches.length === 0 && scopedTrainings.length === 0

  const handleSwitchClub = async (clubId) => {
    if (!switchClub) return
    setSwitchingClub(true)
    try {
      await switchClub(clubId)
    } finally {
      setSwitchingClub(false)
    }
  }

  return {
    club,
    role,
    roleLabel,
    membership,
    teams,
    userClubs,
    loadingTeams,
    teamsError,
    stats,
    quickAccess,
    isEmptyClub,
    categories,
    selectedCategoryId,
    isAllCategories,
    setSelectedCategoryId,
    scopedPlayers,
    formatMatchDateTime,
    handleSwitchClub,
    switchingClub,
  }
}
