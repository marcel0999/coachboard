import { useState } from 'react'
import Modal from '../ui/Modal'
import Tabs from '../ui/Tabs'
import { PERFORMANCE_SECTIONS } from '../../constants/performance'
import PerformanceDashboardSections, { PerformanceHeader } from './PerformanceDashboardSections'

export default function PlayerPerformanceModal({ isOpen, onClose, player, profile }) {
  const [activeSection, setActiveSection] = useState('summary')

  if (!player || !profile) return null

  const handleClose = () => {
    setActiveSection('summary')
    onClose()
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Centro de Rendimiento"
      description={`Dashboard de ${profile.summary.name}`}
      size="2xl"
    >
      <div className="mb-4 rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-xs text-blue-800">
        Datos generados automáticamente desde Plantel, Partidos, Entrenamientos e Historial Médico. Sin duplicación.
      </div>

      <PerformanceHeader player={player} profile={profile} />

      <div className="mt-6">
        <Tabs tabs={PERFORMANCE_SECTIONS} activeTab={activeSection} onChange={setActiveSection} />
        <div className="pt-5">
          <PerformanceDashboardSections profile={profile} activeSection={activeSection} />
        </div>
      </div>
    </Modal>
  )
}
