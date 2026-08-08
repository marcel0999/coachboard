import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

import { ClipboardList, Save } from 'lucide-react'

import Modal from '../ui/Modal'

import Tabs from '../ui/Tabs'

import Button from '../ui/Button'

import Badge from '../ui/Badge'

import MatchInfoTab from './MatchInfoTab'

import SquadSelector from './SquadSelector'

import LineupPitch from './LineupPitch'

import MatchEventsTab from './MatchEventsTab'

import MatchSummaryTab from './MatchSummaryTab'

import StaffSelector from '../staff/StaffSelector'
import ConvocationSummaryModal from '../medico/ConvocationSummaryModal'

import { MATCH_DETAIL_TABS } from '../../constants/matches'

import { formatMatchDateTime, initializeSquad } from '../../utils/matches'
import { createEmptyLineup } from '../../utils/formations'
import { initializeStaffSquad } from '../../utils/staff'

import { getConvocationMedicalSummary } from '../../utils/medicalCenter'



function statusVariant(status) {

  switch (status) {

    case 'Finalizado':

      return 'success'

    case 'En juego':

      return 'warning'

    default:

      return 'default'

  }

}



export default function MatchDetailModal({ isOpen, onClose, match, players, staff, categories = [], onSave, isNew = false }) {

  const [activeTab, setActiveTab] = useState('info')

  const [form, setForm] = useState(match)

  const [showConvocationSummary, setShowConvocationSummary] = useState(false)



  useEffect(() => {

    if (isOpen && match) {

      setForm(match)

      setActiveTab('info')

      setShowConvocationSummary(false)

    }

  }, [isOpen, match])



  if (!match || !form) return null

  const categoryPlayers = players.filter((player) => player.categoryId === form.categoryId)
  const categoryStaff = staff.filter((member) => (member.categoryIds ?? []).includes(form.categoryId))

  const handleFormChange = (nextForm) => {
    if (nextForm.categoryId !== form.categoryId) {
      const categoryPlayerIds = players
        .filter((player) => player.categoryId === nextForm.categoryId)
        .map((player) => player.id)
      const categoryStaffIds = staff
        .filter((member) => (member.categoryIds ?? []).includes(nextForm.categoryId))
        .map((member) => member.id)

      setForm({
        ...nextForm,
        squad: initializeSquad(categoryPlayerIds),
        lineup: createEmptyLineup(nextForm.formation ?? '4-3-3'),
        staffSquad: initializeStaffSquad(categoryStaffIds),
        events: [],
      })
      return
    }

    setForm(nextForm)
  }

  const convocationSummary = getConvocationMedicalSummary(form, categoryPlayers, new Date(), categories)



  const persistMatch = () => {

    onSave(form)

    onClose()

  }



  const handleSave = () => {

    if (!form.categoryId || !form.opponent.trim() || !form.competition.trim() || !form.date) return



    if (convocationSummary.hasIssues) {

      setShowConvocationSummary(true)

      return

    }



    persistMatch()

  }



  return (

    <>

      <Modal

        isOpen={isOpen}

        onClose={onClose}

        title={isNew ? 'Nuevo partido' : `vs ${form.opponent}`}

        description={isNew ? 'Completá la información del encuentro' : formatMatchDateTime(form.date, form.time)}

        size="2xl"

      >

        <div className="mb-4 flex flex-wrap items-center gap-2">

          <Badge variant={statusVariant(form.status)}>{form.status}</Badge>

          <span className="text-sm text-text-secondary">{form.competition}</span>

          <span className="text-sm text-text-muted">· {form.condition}</span>

        </div>



        <Tabs tabs={MATCH_DETAIL_TABS} activeTab={activeTab} onChange={setActiveTab} />



        <div className="pt-5">

          {activeTab === 'info' && (
            <MatchInfoTab match={form} categories={categories} onChange={handleFormChange} />
          )}

          {activeTab === 'squad' && (
            <SquadSelector match={form} players={categoryPlayers} categories={categories} onChange={handleFormChange} />
          )}

          {activeTab === 'staff' && (
            <StaffSelector match={form} staff={categoryStaff} onChange={handleFormChange} />
          )}

          {activeTab === 'lineup' && (
            <>
              <div className="mb-4 flex justify-end">
                <Link
                  to={`/pizarra?matchId=${form.id}`}
                  className="inline-flex items-center gap-2 rounded-lg border border-border bg-surface-elevated px-3 py-2 text-sm font-medium text-accent hover:bg-surface-muted"
                  onClick={onClose}
                >
                  <ClipboardList className="h-4 w-4" />
                  Abrir en Pizarra Táctica
                </Link>
              </div>
              <LineupPitch match={form} players={categoryPlayers} onChange={handleFormChange} />
            </>
          )}

          {activeTab === 'events' && (
            <MatchEventsTab match={form} players={categoryPlayers} onChange={handleFormChange} />
          )}

          {activeTab === 'summary' && <MatchSummaryTab match={form} onChange={handleFormChange} />}

        </div>



        <div className="mt-6 flex flex-col-reverse gap-3 border-t border-border pt-5 sm:flex-row sm:justify-end">

          <Button variant="secondary" onClick={onClose}>Cancelar</Button>

          <Button onClick={handleSave}>

            <Save className="h-4 w-4" />

            Guardar partido

          </Button>

        </div>

      </Modal>



      <ConvocationSummaryModal

        isOpen={showConvocationSummary}

        onClose={() => setShowConvocationSummary(false)}

        onConfirm={() => {

          setShowConvocationSummary(false)

          persistMatch()

        }}

        summary={convocationSummary}

      />

    </>

  )

}

