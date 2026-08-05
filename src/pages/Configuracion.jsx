import { useMemo, useRef, useState } from 'react'
import {
  AlertTriangle,
  Database,
  Download,
  Globe,
  RefreshCw,
  Upload,
  HardDriveDownload,
} from 'lucide-react'
import { Card } from '../components/ui/Card'
import PageHeader from '../components/ui/PageHeader'
import Button from '../components/ui/Button'
import ConfirmModal from '../components/ui/ConfirmModal'
import { FormField, Input, Select } from '../components/ui/FormField'
import { useAppData } from '../context/AppDataContext'
import { hasUserData } from '../storage/userDataFlag'
import {
  DEFAULT_CLUB_SETTINGS,
  SUPPORTED_CURRENCIES,
} from '../config/localization'

export default function Configuracion() {
  const {
    players,
    matches,
    trainings,
    staff,
    clubSettings,
    updateClubSettings,
    backups,
    loadReport,
    exportBackup,
    importBackupJson,
    restoreBackup,
    loadDemoData,
    clearUserData,
    runDiagnostics,
    reloadFromStorage,
  } = useAppData()

  const fileInputRef = useRef(null)
  const [message, setMessage] = useState('')
  const [confirmDemo, setConfirmDemo] = useState(false)
  const [confirmRestore, setConfirmRestore] = useState(null)
  const [confirmClear, setConfirmClear] = useState(false)

  const settings = clubSettings ?? DEFAULT_CLUB_SETTINGS

  const isSeed = useMemo(
    () => hasUserData() && players.length >= 20,
    [players.length],
  )

  const handleExport = () => {
    const json = exportBackup()
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = `coachboard-backup-${new Date().toISOString().slice(0, 10)}.json`
    anchor.click()
    URL.revokeObjectURL(url)
    setMessage('Copia de seguridad exportada.')
  }

  const handleImportFile = async (event) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      const text = await file.text()
      importBackupJson(text)
      setMessage('Copia importada correctamente. Recargá la página si no ves los cambios.')
    } catch (error) {
      setMessage(`Error al importar: ${error.message}`)
    } finally {
      event.target.value = ''
    }
  }

  const handleRestore = (backupKey) => {
    restoreBackup(backupKey)
    setConfirmRestore(null)
    setMessage(`Backup restaurado: ${backupKey}`)
  }

  const handleLoadDemo = () => {
    loadDemoData()
    setConfirmDemo(false)
    setMessage('Datos de demostración cargados manualmente.')
  }

  const handleDiagnostics = () => {
    runDiagnostics()
    setMessage('Diagnóstico ejecutado. Revisá la consola del navegador (F12).')
  }

  const updateSetting = (field, value) => {
    updateClubSettings({ [field]: value })
    setMessage('Configuración del club actualizada.')
  }

  return (
    <div>
      <PageHeader
        title="Configuración"
        description="Club, localización, copias de seguridad y recuperación de datos"
      />

      <Card className="mb-6">
        <div className="mb-4 flex items-center gap-2">
          <Globe className="h-5 w-5 text-accent" />
          <h2 className="text-base font-semibold text-text-primary">Configuración del club</h2>
        </div>
        <p className="mb-4 text-sm text-text-secondary">
          Valores predeterminados para nuevos registros. Uruguay es la configuración inicial.
        </p>
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

      {isSeed && (
        <Card className="mb-6 border-amber-200 bg-amber-50">
          <div className="flex gap-3">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
            <div>
              <p className="font-semibold text-amber-900">Datos de demostración detectados</p>
              <p className="mt-1 text-sm text-amber-800">
                El plantel actual coincide con los jugadores demo precargados. Si tenías datos reales,
                revisá los backups disponibles abajo o importá una copia JSON previa.
              </p>
              <Button
                className="mt-3"
                variant="secondary"
                size="sm"
                onClick={() => setConfirmClear(true)}
              >
                Vaciar datos demo y dejar plantel en cero
              </Button>
            </div>
          </div>
        </Card>
      )}

      {loadReport && (
        <Card className="mb-6">
          <div className="mb-3 flex items-center gap-2">
            <Database className="h-5 w-5 text-accent" />
            <h2 className="text-base font-semibold text-text-primary">Última carga</h2>
          </div>
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
              <dt className="text-text-secondary">Migración</dt>
              <dd className="font-medium">
                {loadReport.migrated
                  ? `v${loadReport.fromVersion} → v${loadReport.toVersion}`
                  : 'Sin cambios'}
              </dd>
            </div>
            {loadReport.preserved && (
              <div className="sm:col-span-2 text-xs text-green-700">
                Registros preservados: jugadores {loadReport.preserved.players ? '✓' : '✗'},
                partidos {loadReport.preserved.matches ? '✓' : '✗'},
                entrenamientos {loadReport.preserved.trainings ? '✓' : '✗'}
              </div>
            )}
          </dl>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <h2 className="mb-4 text-base font-semibold text-text-primary">Copia de seguridad</h2>
          <div className="flex flex-col gap-3">
            <Button onClick={handleExport}>
              <Download className="h-4 w-4" />
              Exportar JSON
            </Button>
            <Button variant="secondary" onClick={() => fileInputRef.current?.click()}>
              <Upload className="h-4 w-4" />
              Importar JSON
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
              <HardDriveDownload className="h-4 w-4" />
              Recargar desde almacenamiento
            </Button>
          </div>
        </Card>

        <Card>
          <h2 className="mb-4 text-base font-semibold text-text-primary">Backups automáticos</h2>
          {backups.length === 0 ? (
            <p className="text-sm text-text-secondary">
              No hay backups automáticos todavía. Se crean antes de cada migración de esquema.
            </p>
          ) : (
            <ul className="space-y-2">
              {backups.map((backup) => (
                <li
                  key={backup.key}
                  className="flex items-center justify-between rounded-xl border border-slate-200 px-3 py-2 text-sm"
                >
                  <div>
                    <p className="font-medium text-text-primary">{backup.key}</p>
                    <p className="text-xs text-text-muted">
                      {backup.meta?.createdAt ?? '—'} ·{' '}
                      {backup.state?.players?.length ?? 0} jugadores
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => setConfirmRestore(backup.key)}
                  >
                    Restaurar
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      <Card className="mt-6">
        <h2 className="mb-2 text-base font-semibold text-text-primary">Datos de demostración</h2>
        <p className="mb-4 text-sm text-text-secondary">
          Carga manual de jugadores, partidos y entrenamientos de ejemplo. Requiere confirmación.
          Nunca se ejecuta automáticamente.
        </p>
        <Button variant="danger" onClick={() => setConfirmDemo(true)}>
          Cargar datos de demostración
        </Button>
      </Card>

      {message && (
        <p className="mt-4 text-sm text-text-secondary">{message}</p>
      )}

      <ConfirmModal
        isOpen={confirmClear}
        onClose={() => setConfirmClear(false)}
        onConfirm={() => {
          clearUserData()
          setConfirmClear(false)
          setMessage('Plantel, partidos y entrenamientos vaciados. Las categorías se mantienen.')
        }}
        title="Vaciar datos demo"
        message="Se eliminarán jugadores, partidos, entrenamientos, staff y ejercicios del estado actual. Las categorías se conservan. ¿Continuar?"
        confirmLabel="Vaciar"
        variant="danger"
      />

      <ConfirmModal
        isOpen={confirmDemo}
        onClose={() => setConfirmDemo(false)}
        onConfirm={handleLoadDemo}
        title="Cargar datos de demostración"
        message="Esto reemplazará el estado actual con jugadores, partidos y entrenamientos de ejemplo. ¿Continuar?"
        confirmLabel="Sí, cargar demo"
        variant="danger"
      />

      <ConfirmModal
        isOpen={Boolean(confirmRestore)}
        onClose={() => setConfirmRestore(null)}
        onConfirm={() => handleRestore(confirmRestore)}
        title="Restaurar backup"
        message={`¿Restaurar el estado desde ${confirmRestore}? El estado actual será reemplazado.`}
        confirmLabel="Restaurar"
        variant="danger"
      />
    </div>
  )
}
