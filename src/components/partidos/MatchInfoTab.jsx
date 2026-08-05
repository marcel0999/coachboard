import { FormField, Input, Select, Textarea } from '../ui/FormField'
import { COMPETITION_ORGANIZATIONS, COMPETITION_TYPES, MATCH_CONDITIONS, MATCH_STATUSES } from '../../constants/matches'
import { getActiveCategories } from '../../utils/categories'

export default function MatchInfoTab({ match, categories = [], onChange }) {
  const update = (field, value) => onChange({ ...match, [field]: value })
  const activeCategories = getActiveCategories(categories)

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <FormField label="Categoría del plantel" htmlFor="categoryId" required className="sm:col-span-2">
        <Select
          id="categoryId"
          value={match.categoryId ?? ''}
          onChange={(e) => update('categoryId', e.target.value)}
        >
          <option value="">Seleccionar categoría</option>
          {activeCategories.map((category) => (
            <option key={category.id} value={category.id}>{category.name}</option>
          ))}
        </Select>
      </FormField>
      <FormField label="Rival" htmlFor="opponent" required>
        <Input id="opponent" value={match.opponent} onChange={(e) => update('opponent', e.target.value)} placeholder="Ej: Nacional" />
      </FormField>
      <FormField label="Organización" htmlFor="competitionOrganization">
        <Select
          id="competitionOrganization"
          value={match.competitionOrganization ?? ''}
          onChange={(e) => update('competitionOrganization', e.target.value)}
        >
          <option value="">—</option>
          {COMPETITION_ORGANIZATIONS.map((org) => (
            <option key={org} value={org}>{org}</option>
          ))}
        </Select>
      </FormField>
      <FormField label="Tipo de competición" htmlFor="competitionType">
        <Select
          id="competitionType"
          value={match.competitionType ?? ''}
          onChange={(e) => update('competitionType', e.target.value)}
        >
          <option value="">—</option>
          {COMPETITION_TYPES.map((type) => (
            <option key={type} value={type}>{type}</option>
          ))}
        </Select>
      </FormField>
      <FormField label="Competencia" htmlFor="competition" required className="sm:col-span-2">
        <Input id="competition" value={match.competition} onChange={(e) => update('competition', e.target.value)} placeholder="Ej: Campeonato Uruguayo, Copa OFI" />
      </FormField>
      <FormField label="Fecha" htmlFor="date" required>
        <Input id="date" type="date" value={match.date} onChange={(e) => update('date', e.target.value)} />
      </FormField>
      <FormField label="Hora" htmlFor="time">
        <Input id="time" type="time" value={match.time} onChange={(e) => update('time', e.target.value)} />
      </FormField>
      <FormField label="Estadio" htmlFor="stadium">
        <Input id="stadium" value={match.stadium} onChange={(e) => update('stadium', e.target.value)} placeholder="Nombre del estadio" />
      </FormField>
      <FormField label="Ciudad" htmlFor="city">
        <Input id="city" value={match.city} onChange={(e) => update('city', e.target.value)} placeholder="Ej: Montevideo, Maldonado" />
      </FormField>
      <FormField label="Condición" htmlFor="condition">
        <Select id="condition" value={match.condition} onChange={(e) => update('condition', e.target.value)}>
          {MATCH_CONDITIONS.map((item) => (
            <option key={item} value={item}>{item}</option>
          ))}
        </Select>
      </FormField>
      <FormField label="Estado del partido" htmlFor="status">
        <Select id="status" value={match.status} onChange={(e) => update('status', e.target.value)}>
          {MATCH_STATUSES.map((item) => (
            <option key={item} value={item}>{item}</option>
          ))}
        </Select>
      </FormField>
      <FormField label="Árbitro" htmlFor="referee">
        <Input id="referee" value={match.referee} onChange={(e) => update('referee', e.target.value)} placeholder="Árbitro principal" />
      </FormField>
      <FormField label="Clima" htmlFor="weather">
        <Input id="weather" value={match.weather} onChange={(e) => update('weather', e.target.value)} placeholder="Ej: Soleado, 20°C" />
      </FormField>
      <FormField label="Observaciones" htmlFor="notes" className="sm:col-span-2">
        <Textarea id="notes" value={match.notes} onChange={(e) => update('notes', e.target.value)} rows={3} placeholder="Notas previas al partido..." />
      </FormField>
    </div>
  )
}
