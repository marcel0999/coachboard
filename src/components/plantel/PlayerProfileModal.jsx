import { useEffect, useState } from 'react'
import { Pencil } from 'lucide-react'
import Modal from '../ui/Modal'
import Tabs from '../ui/Tabs'
import Button from '../ui/Button'
import Badge from '../ui/Badge'
import { statusToVariant } from '../../utils/badgeVariants'
import PlayerAvatar from './PlayerAvatar'
import GeneralTab from './profile/GeneralTab'
import MedicalHistoryTab from './profile/MedicalHistoryTab'
import PlayerMedicalTab from '../medico/PlayerMedicalTab'
import StatisticsTab from './profile/StatisticsTab'
import DocumentsTab from './profile/DocumentsTab'
import { PROFILE_TABS } from '../../constants/playerProfile'
import { getCategoryById } from '../../utils/categories'
import { getFullName } from '../../utils/players'

export default function PlayerProfileModal({
  isOpen,
  onClose,
  player,
  categories = [],
  onUpdate,
  onEdit,
  initialTab = 'general',
}) {
  const [activeTab, setActiveTab] = useState(initialTab)

  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab)
    }
  }, [isOpen, initialTab, player?.id])

  if (!player) return null

  const handleUpdate = (updates) => {
    onUpdate(player.id, updates)
  }

  const handleClose = () => {
    setActiveTab('general')
    onClose()
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={getFullName(player)}
      description={`Ficha completa · Dorsal ${player.number} · ${player.primaryPosition} · ${getCategoryById(categories, player.categoryId)?.name ?? 'Sin categoría'}`}
      size="2xl"
    >
      <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <PlayerAvatar player={player} size="md" />
          <div>
            <Badge variant={statusToVariant(player.physicalStatus)}>
              {player.physicalStatus}
            </Badge>
          </div>
        </div>
        <Button variant="secondary" size="sm" onClick={() => onEdit(player)}>
          <Pencil className="h-4 w-4" />
          Editar jugador
        </Button>
      </div>

      <Tabs tabs={PROFILE_TABS} activeTab={activeTab} onChange={setActiveTab} />

      <div className="pt-5">
        {activeTab === 'general' && <GeneralTab player={player} />}
        {activeTab === 'medical' && (
          <MedicalHistoryTab player={player} onUpdate={handleUpdate} />
        )}
        {activeTab === 'medicalCenter' && (
          <PlayerMedicalTab player={player} categories={categories} onUpdate={handleUpdate} />
        )}
        {activeTab === 'stats' && <StatisticsTab player={player} />}
        {activeTab === 'documents' && (
          <DocumentsTab player={player} onUpdate={handleUpdate} />
        )}
      </div>
    </Modal>
  )
}
