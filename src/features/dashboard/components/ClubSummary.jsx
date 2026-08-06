import { Shield, Users, UsersRound } from 'lucide-react'
import { StatCard } from '../../../components/ui/Card'

export default function ClubSummary({ stats, loadingTeams }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <StatCard label="Jugadores" value={stats.players} sublabel="En plantel" icon={Users} accent />
      <StatCard
        label="Equipos"
        value={loadingTeams ? '…' : stats.teams}
        sublabel="Tabla teams"
        icon={UsersRound}
      />
      <StatCard label="Disponibles" value={stats.available} sublabel="Listos para entrenar" icon={Shield} />
      <StatCard label="Staff" value={stats.staff} sublabel="Cuerpo técnico" icon={Users} />
    </div>
  )
}
