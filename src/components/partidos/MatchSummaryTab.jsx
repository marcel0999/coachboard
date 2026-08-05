import { FormField, Input, Textarea } from '../ui/FormField'
import { Card } from '../ui/Card'
import { countGoalsFromEvents, formatMatchResult } from '../../utils/matches'

export default function MatchSummaryTab({ match, onChange }) {
  const updateSummary = (field, value) => {
    onChange({
      ...match,
      summary: { ...match.summary, [field]: value },
    })
  }

  const updateResult = (field, value) => {
    onChange({ ...match, [field]: value })
  }

  const goalsFromEvents = countGoalsFromEvents(match.events)

  return (
    <div className="space-y-6">
      <section>
        <h4 className="mb-3 text-sm font-semibold uppercase tracking-wide text-text-secondary">Resultado</h4>
        <div className="grid gap-4 sm:grid-cols-3">
          <FormField label="Goles a favor">
            <Input
              type="number"
              min="0"
              value={match.goalsFor}
              onChange={(e) => updateResult('goalsFor', e.target.value)}
              placeholder="0"
            />
          </FormField>
          <FormField label="Goles en contra">
            <Input
              type="number"
              min="0"
              value={match.goalsAgainst}
              onChange={(e) => updateResult('goalsAgainst', e.target.value)}
              placeholder="0"
            />
          </FormField>
          <Card className="flex items-center justify-center">
            <div className="text-center">
              <p className="text-xs text-text-muted">Marcador</p>
              <p className="text-2xl font-bold text-text-primary">{formatMatchResult(match)}</p>
              {goalsFromEvents > 0 && (
                <p className="mt-1 text-xs text-text-muted">{goalsFromEvents} goles en eventos</p>
              )}
            </div>
          </Card>
        </div>
      </section>

      <section>
        <h4 className="mb-3 text-sm font-semibold uppercase tracking-wide text-text-secondary">Estadísticas del partido</h4>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <FormField label="Posesión (%)">
            <Input type="number" min="0" max="100" value={match.summary.possession} onChange={(e) => updateSummary('possession', e.target.value)} />
          </FormField>
          <FormField label="Tiros">
            <Input type="number" min="0" value={match.summary.shots} onChange={(e) => updateSummary('shots', e.target.value)} />
          </FormField>
          <FormField label="Corners">
            <Input type="number" min="0" value={match.summary.corners} onChange={(e) => updateSummary('corners', e.target.value)} />
          </FormField>
          <FormField label="Faltas">
            <Input type="number" min="0" value={match.summary.fouls} onChange={(e) => updateSummary('fouls', e.target.value)} />
          </FormField>
        </div>
      </section>

      <section>
        <FormField label="Notas del entrenador">
          <Textarea
            rows={5}
            value={match.summary.coachNotes}
            onChange={(e) => updateSummary('coachNotes', e.target.value)}
            placeholder="Análisis táctico, rendimiento colectivo, aspectos a mejorar..."
          />
        </FormField>
      </section>

      {match.status === 'Finalizado' && (
        <div className="rounded-xl border border-accent/20 bg-accent/5 px-4 py-3 text-sm text-accent">
          Al guardar un partido finalizado, las estadísticas de los jugadores convocados se actualizan automáticamente en el Plantel.
        </div>
      )}
    </div>
  )
}
