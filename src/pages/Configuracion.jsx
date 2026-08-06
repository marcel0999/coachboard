import { useRef, useState } from 'react'
import {
  Cloud,
  Database,
  Download,
  Globe,
  RefreshCw,
  Upload,
} from 'lucide-react'
import { Card } from '../components/ui/Card'
import PageHeader from '../components/ui/PageHeader'
import Button from '../components/ui/Button'
import SectionHeader from '../components/ui/SectionHeader'
import Alert from '../components/ui/Alert'
import ConfirmModal from '../components/ui/ConfirmModal'
import { FormField, Input, Select } from '../components/ui/FormField'
import { useAppData } from '../context/AppDataContext'
import { useAuth } from '../context/AuthContext'
import { importLegacyLocalStorageManually } from '../services/supabase/migrationService'
import { hasLegacyLocalStorageData } from '../services/legacy/localStorageImport'
import {
  DEFAULT_CLUB_SETTINGS,
  SUPPORTED_CURRENCIES,
} from '../config/localization'

const isDev = import.meta.env.DEV

export default function Configuracion() {
  const { club } = useAuth()
  const {
    players,
    matches,
    trainings,
    clubSettings,
    updateClubSettings,
    loadReport,
    saveError,
    exportBackup,
    importBackupJson,
    loadDemoData,
    clearUserData,
    runDiagnostics,
    reloadFromStorage,
  } = useAppData()

  const fileInputRef = useRef(null)
  const [message, setMessage] = useState('')
  const [confirmDemo, setConfirmDemo] = useState(false)
  const [confirmClear, setConfirmClear] = useState(false)
  const [confirmLegacyImport, setConfirmLegacyImport] = useState(false)
  const [isImporting, setIsImporting] = useState(false)

  const settings = clubSettings ?? DEFAULT_CLUB_SETTINGS
  const canImportLegacy = Boolean(club?.id && hasLegacyLocalStorageData())

  const handleExport = () => {
    const json = exportBackup()
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = `coachboard-backup-${new Date().toISOString().slice(0, 10)}.json`
    anchor.click()
    URL.revokeObjectURL(url)
    setMessage('Copia de seguridad exportada desde Supabase.')
  }

  const handleImportFile = async (event) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      const text = await file.text()
      await importBackupJson(text)
      setMessage('Copia importada y guardada en Supabase.')
    } catch (error) {
      setMessage(`Error al importar: ${error.message}`)
    } finally {
      event.target.value = ''
    }
  }

  const handleLoadDemo = async () => {
    try {
      await loadDemoData()
      setConfirmDemo(false)
      setMessage('Datos de demostración cargados (solo desarrollo).')
    } catch (error) {
      setMessage(error.message)
    }
  }

  const handleLegacyImport = async () => {
    if (!club?.id) return
    setIsImporting(true)
    try {
      await importLegacyLocalStorageManually(club.id)
      await reloadFromStorage()
      setConfirmLegacyImport(false)
      setMessage('Datos legacy importados manualmente a Supabase.')
    } catch (error) {
      setMessage(`Importación legacy: ${error.message}`)
    } finally {
      setIsImporting(false)
    }
  }

  const handleDiagnostics = () => {
    runDiagnostics()
    setMessage('Diagnóstico ejecutado. Revisá la consola del navegador (F12).')
  }

  const updateSetting = (field, value) => {
    updateClubSettings({ [field]: value })
    setMessage('Configuración del club actualizada en Supabase.')
  }

  return (
    <div className="cb-animate-in">
      <PageHeader
        title="Configuración"
        description="Club, localización y copias de seguridad — Supabase es la única fuente de verdad"
      />

      {saveError && (
        <Alert variant="danger" className="mb-6" title="Error al guardar en Supabase">
          <p>{saveError.message}</p>
          <Button className="mt-3" variant="secondary" size="sm" onClick={() => reloadFromStorage()}>
            Reintentar sincronización
          </Button>
        </Alert>
      )}

      <Card className="mb-6">
        <SectionHeader title="Persistencia Supabase" icon={Cloud} />
        <dl className="grid gap-2 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-text-secondary">Club ID (permanente)</dt>
            <dd className="font-mono text-xs font-medium break-all">{club?.id ?? '—'}</dd>
          </div>
          <div>
            <dt className="text-text-secondary">Fuente de datos</dt>
            <dd className="font-medium">Supabase PostgreSQL</dd>
          </div>
        </dl>
        <p className="mt-3 text-xs text-text-muted">
          Los datos se sincronizan entre dispositivos, navegadores y dominios que usen el mismo
          proyecto Supabase y la misma cuenta.
        </p>
      </Card>

      <Card className="mb-6">
        <SectionHeader
          title="Configuración del club"
          description="Valores predeterminados para nuevos registros. Uruguay es la configuración inicial."
          icon={Globe}
        />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <FormField label="País">
            <Input value={settings.country} onChange={(e) => updateSetting('country', e.target.value)} />
          </FormField>
          <FormField label="Moneda">
            <Select value={settings.currency} onChange={(e) => updateSetting('currency', e.target.value)}>
              {SUPPORTED_CURRENCIES.map((currency) => (
                <option key={currency.code} value={currency.code}>{currency.name} ({currency.code})</option>
              ))}
            </Select>
          </FormField>
          <FormField label="Zona horaria">
            <Input value={settings.timezone} onChange={(e) => updateSetting('timezone', e.target.value)} />
          </FormField>
          <FormField label="Formato de fecha">
            <Input value={settings.dateFormat} onChange={(e) => updateSetting('dateFormat', e.target.value)} />
          </FormField>
          <FormField label="Prefijo telefónico">
            <Input value={settings.phonePrefix} onChange={(e) => updateSetting('phonePrefix', e.target.value)} />
          </FormField>
          <FormField label="Nacionalidad predeterminada">
            <Input value={settings.defaultNationality} onChange={(e) => updateSetting('defaultNationality', e.target.value)} />
          </FormField>
          <FormField label="Asociación / federación">
            <Input value={settings.footballAssociation} onChange={(e) => updateSetting('footballAssociation', e.target.value)} />
          </FormField>
          <FormField label="Organización deportiva">
            <Input value={settings.sportsOrganization} onChange={(e) => updateSetting('sportsOrganization', e.target.value)} />
          </FormField>
        </div>
      </Card>

      {loadReport && (
        <Card className="mb-6">
          <SectionHeader title="Última carga desde Supabase" icon={Database} />
          <dl className="grid gap-2 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-text-secondary">Jugadores</dt>
              <dd className="font-medium">{loadReport.counts?.players ?? players.length}</dd>
            </div>
            <div>
              <dt className="text-text-secondary">Partidos</dt>
              <dd className="font-medium">{loadReport.counts?.matches ?? matches.length}</dd>
            </div>
            <div>
              <dt className="text-text-secondary">Entrenamientos</dt>
              <dd className="font-medium">{loadReport.counts?.trainings ?? trainings.length}</dd>
            </div>
            <div>
              <dt className="text-text-secondary">Migración de esquema</dt>
              <dd className="font-medium">
                {loadReport.migrated
                  ? `v${loadReport.fromVersion} → v${loadReport.toVersion}`
                  : 'Sin cambios'}
              </dd>
            </div>
          </dl>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <SectionHeader title="Copia de seguridad JSON" description="Exportá o importá el estado completo del club. La importación escribe directamente en Supabase." />
          <div className="flex flex-col gap-3">
            <Button onClick={handleExport}>
              <Download className="h-4 w-4" />
              Exportar JSON
            </Button>
            <Button variant="secondary" onClick={() => fileInputRef.current?.click()}>
              <Upload className="h-4 w-4" />
              Importar JSON a Supabase
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept="application/json,.json"
              className="hidden"
              onChange={handleImportFile}
            />
            <Button variant="secondary" onClick={handleDiagnostics}>
              <RefreshCw className="h-4 w-4" />
              Ejecutar diagnóstico (consola)
            </Button>
            <Button variant="secondary" onClick={() => reloadFromStorage()}>
              <RefreshCw className="h-4 w-4" />
              Recargar desde Supabase
            </Button>
          </div>
        </Card>

        <Card>
          <SectionHeader
            title="Vaciar datos operativos"
            description="Elimina jugadores, partidos, entrenamientos, staff y ejercicios del club en Supabase. Las categorías se conservan."
          />
          <Button variant="danger" onClick={() => setConfirmClear(true)}>
            Vaciar datos del club
          </Button>
        </Card>
      </div>

      {canImportLegacy && (
        <Card className="mt-6 border-amber-200 bg-amber-50">
          <h2 className="mb-2 text-base font-semibold text-amber-900">Importación legacy (manual)</h2>
          <p className="mb-4 text-sm text-amber-800">
            Se detectaron datos antiguos en localStorage de este navegador. Podés importarlos una sola
            vez a Supabase. No sobrescribe datos existentes en la nube.
          </p>
          <Button variant="secondary" onClick={() => setConfirmLegacyImport(true)} disabled={isImporting}>
            {isImporting ? 'Importando…' : 'Importar datos legacy a Supabase'}
          </Button>
        </Card>
      )}

      {isDev && (
        <Card className="mt-6 border-dashed border-slate-300">
          <h2 className="mb-2 text-base font-semibold text-text-primary">Datos de demostración (solo DEV)</h2>
          <p className="mb-4 text-sm text-text-secondary">
            Carga manual de jugadores, partidos y entrenamientos de ejemplo. Solo disponible en
            desarrollo local — nunca en producción.
          </p>
          <Button variant="danger" onClick={() => setConfirmDemo(true)}>
            Cargar datos de demostración
          </Button>
        </Card>
      )}

      {message && <Alert variant="success" className="mt-4">{message}</Alert>}

      <ConfirmModal
        isOpen={confirmClear}
        onClose={() => setConfirmClear(false)}
        onConfirm={() => {
          clearUserData()
          setConfirmClear(false)
          setMessage('Datos operativos vaciados en Supabase. Las categorías se mantienen.')
        }}
        title="Vaciar datos del club"
        message="Se eliminarán jugadores, partidos, entrenamientos, staff y ejercicios. Las categorías se conservan. ¿Continuar?"
        confirmLabel="Vaciar"
        variant="danger"
      />

      {isDev && (
        <ConfirmModal
          isOpen={confirmDemo}
          onClose={() => setConfirmDemo(false)}
          onConfirm={handleLoadDemo}
          title="Cargar datos de demostración"
          message="Esto reemplazará el estado actual con datos de ejemplo y los guardará en Supabase. ¿Continuar?"
          confirmLabel="Sí, cargar demo"
          variant="danger"
        />
      )}

      <ConfirmModal
        isOpen={confirmLegacyImport}
        onClose={() => setConfirmLegacyImport(false)}
        onConfirm={handleLegacyImport}
        title="Importar datos legacy"
        message="Se importarán los datos de localStorage de este navegador a Supabase. Solo funciona si el club no tiene datos operativos en la nube. ¿Continuar?"
        confirmLabel="Importar"
        variant="danger"
      />
    </div>
  )
}
