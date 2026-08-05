import { MEDICAL_DOCUMENT_TYPES, getMedicalDocumentTypeLabel } from '../constants/medicalCenter'
import { getFullName } from './players'
import { formatDate } from './playerFactory'
import { getCategoryById } from './categories'

function getPlayerCategoryLabel(player, categories = []) {
  const category = getCategoryById(categories, player.categoryId)
  return category?.name ?? 'Sin categoría'
}

function formatCategoryPlayerLabel(player, categories = []) {
  return `${getPlayerCategoryLabel(player, categories)} — ${getFullName(player)}`
}

const PRIORITY = {
  expired: 0,
  critical: 1,
  warning: 2,
  missing: 3,
  injured: 2,
  ok: 4,
}

export function daysUntilExpiry(expiresAt, referenceDate = new Date()) {
  if (!expiresAt) return null

  const expiry = new Date(`${expiresAt}T12:00:00`)
  const reference = new Date(referenceDate)
  reference.setHours(12, 0, 0, 0)

  return Math.ceil((expiry - reference) / (1000 * 60 * 60 * 24))
}

export function getDocumentExpiryStatus(expiresAt, referenceDate = new Date()) {
  const days = daysUntilExpiry(expiresAt, referenceDate)

  if (days === null) {
    return { level: 'missing', variant: 'danger', label: 'Sin documento', days: null }
  }

  if (days < 0) {
    return {
      level: 'expired',
      variant: 'danger',
      label: 'Vencido',
      days,
      daysOverdue: Math.abs(days),
    }
  }

  if (days <= 10) {
    return { level: 'critical', variant: 'danger', label: `${days} días`, days }
  }

  if (days <= 30) {
    return { level: 'warning', variant: 'warning', label: `${days} días`, days }
  }

  return { level: 'ok', variant: 'success', label: 'Al día', days }
}

export function getMedicalDocument(player, type) {
  return (player.medicalDocuments ?? []).find((document) => document.type === type) ?? null
}

export function getPlayerDocumentStatuses(player, referenceDate = new Date()) {
  return MEDICAL_DOCUMENT_TYPES.map((documentType) => {
    const document = getMedicalDocument(player, documentType.value)
    const status = getDocumentExpiryStatus(document?.expiresAt, referenceDate)

    return {
      ...documentType,
      document,
      status,
    }
  })
}

function getWorstDocumentStatus(statuses) {
  return statuses.reduce((worst, current) => {
    if (!worst) return current
    return PRIORITY[current.level] < PRIORITY[worst.level] ? current : worst
  }, null)
}

export function getPlayerGeneralMedicalStatus(player, referenceDate = new Date()) {
  const documentStatuses = getPlayerDocumentStatuses(player, referenceDate)
  const worst = getWorstDocumentStatus(documentStatuses.map((entry) => entry.status))

  if (player.physicalStatus === 'Lesionado') {
    return {
      level: 'injured',
      variant: 'danger',
      label: 'Lesionado',
      documentStatuses,
    }
  }

  if (!worst || worst.level === 'missing') {
    return {
      level: 'missing',
      variant: 'danger',
      label: 'Documentación incompleta',
      documentStatuses,
    }
  }

  if (worst.level === 'expired') {
    return {
      level: 'expired',
      variant: 'danger',
      label: 'Documentación vencida',
      documentStatuses,
    }
  }

  if (worst.level === 'critical' || worst.level === 'warning') {
    return {
      level: worst.level,
      variant: worst.variant,
      label: 'Por vencer',
      documentStatuses,
    }
  }

  return {
    level: 'ok',
    variant: 'success',
    label: 'Al día',
    documentStatuses,
  }
}

export function isPlayerMedicallyCompliant(player, referenceDate = new Date()) {
  const statuses = getPlayerDocumentStatuses(player, referenceDate)
  return statuses.every(
    (entry) => entry.document && entry.status.level === 'ok',
  )
}

export function buildMedicalCenterDashboard(players, referenceDate = new Date()) {
  let expiredDocuments = 0
  let expiringDocuments = 0
  let compliantPlayers = 0
  let injuredPlayers = 0
  let nextExpiry = null

  players.forEach((player) => {
    if (player.physicalStatus === 'Lesionado') {
      injuredPlayers += 1
    }

    if (isPlayerMedicallyCompliant(player, referenceDate)) {
      compliantPlayers += 1
    }

    getPlayerDocumentStatuses(player, referenceDate).forEach(({ document, status }) => {
      if (status.level === 'expired') {
        expiredDocuments += 1
      }

      if (status.level === 'warning' || status.level === 'critical') {
        expiringDocuments += 1
      }

      if (document?.expiresAt && status.days !== null && status.days >= 0) {
        if (!nextExpiry || document.expiresAt < nextExpiry.date) {
          nextExpiry = {
            date: document.expiresAt,
            player,
            type: document.type,
            days: status.days,
          }
        }
      }
    })
  })

  return {
    compliantPlayers,
    expiringDocuments,
    expiredDocuments,
    injuredPlayers,
    nextExpiry,
  }
}

export function buildMedicalAlerts(players, referenceDate = new Date(), categories = []) {
  const alerts = []

  players.forEach((player) => {
    const categoryLabel = getPlayerCategoryLabel(player, categories)

    if (player.physicalStatus === 'Lesionado') {
      alerts.push({
        id: `injury-${player.id}`,
        priority: PRIORITY.injured,
        level: 'injured',
        variant: 'danger',
        player,
        categoryLabel,
        title: `${categoryLabel} — ${getFullName(player)} está lesionado`,
        description: player.notes || 'Estado físico: Lesionado',
      })
    }

    if (player.physicalStatus === 'Suspendido') {
      alerts.push({
        id: `suspended-${player.id}`,
        priority: PRIORITY.expired,
        level: 'suspended',
        variant: 'danger',
        player,
        categoryLabel,
        title: `${categoryLabel} — ${getFullName(player)} está suspendido`,
        description: 'No habilitado para convocatoria',
      })
    }

    getPlayerDocumentStatuses(player, referenceDate).forEach(({ value, label, document, status }) => {
      if (status.level === 'expired') {
        alerts.push({
          id: `expired-${player.id}-${value}`,
          priority: PRIORITY.expired,
          level: 'expired',
          variant: 'danger',
          player,
          categoryLabel,
          documentType: value,
          document,
          title: `${categoryLabel} — ${label} vencido`,
          description: `${getFullName(player)} · vencido hace ${status.daysOverdue} días`,
        })
      } else if (status.level === 'critical' || status.level === 'warning') {
        alerts.push({
          id: `expiring-${player.id}-${value}`,
          priority: PRIORITY[status.level],
          level: status.level,
          variant: status.variant,
          player,
          categoryLabel,
          documentType: value,
          document,
          title: `${categoryLabel} — ${label} por vencer`,
          description: `${getFullName(player)} · vence en ${status.days} días (${formatDate(document?.expiresAt)})`,
        })
      } else if (status.level === 'missing') {
        alerts.push({
          id: `missing-${player.id}-${value}`,
          priority: PRIORITY.missing,
          level: 'missing',
          variant: 'danger',
          player,
          categoryLabel,
          documentType: value,
          title: `${categoryLabel} — ${label} faltante`,
          description: `${getFullName(player)} · sin documento cargado`,
        })
      }
    })
  })

  return alerts.sort((a, b) => a.priority - b.priority)
}

export function buildDashboardMedicalWidget(players, referenceDate = new Date(), categories = []) {
  const dashboard = buildMedicalCenterDashboard(players, referenceDate)
  const alerts = buildMedicalAlerts(players, referenceDate, categories)

  return {
    expiredDocuments: dashboard.expiredDocuments,
    expiringDocuments: dashboard.expiringDocuments,
    injuredPlayers: dashboard.injuredPlayers,
    nextExpiry: dashboard.nextExpiry,
    topAlerts: alerts.slice(0, 5),
  }
}

export function getCalledPlayerIds(match) {
  return [...(match.squad?.starters ?? []), ...(match.squad?.substitutes ?? [])]
}

export function getConvocationMedicalSummary(match, players, referenceDate = new Date(), categories = []) {
  const calledIds = getCalledPlayerIds(match)
  const calledPlayers = players.filter((player) => calledIds.includes(player.id))
  const categoryLabel = getCategoryById(categories, match.categoryId)?.name ?? 'Categoría'

  const habilitados = []
  const proximosVencer = []
  const vencidos = []
  const warnings = []

  calledPlayers.forEach((player) => {
    const playerLabel = formatCategoryPlayerLabel(player, categories)

    if (player.physicalStatus === 'Lesionado') {
      vencidos.push({ player, type: 'injured' })
      warnings.push({
        variant: 'danger',
        message: `${playerLabel} está lesionado y no debería convocarse.`,
      })
      return
    }

    if (player.physicalStatus === 'Suspendido') {
      vencidos.push({ player, type: 'suspended' })
      warnings.push({
        variant: 'danger',
        message: `${playerLabel} está suspendido.`,
      })
      return
    }

    const documentStatuses = getPlayerDocumentStatuses(player, referenceDate)
    const expiredDocs = documentStatuses.filter((entry) => entry.status.level === 'expired')
    const expiringDocs = documentStatuses.filter(
      (entry) => entry.status.level === 'warning' || entry.status.level === 'critical',
    )
    const missingDocs = documentStatuses.filter((entry) => entry.status.level === 'missing')

    if (expiredDocs.length > 0 || missingDocs.length > 0) {
      vencidos.push({ player, expiredDocs, missingDocs })
      expiredDocs.forEach(({ value, status }) => {
        warnings.push({
          variant: 'danger',
          message: `${playerLabel} — ${getMedicalDocumentTypeLabel(value)} vencido hace ${status.daysOverdue} días.`,
        })
      })
      missingDocs.forEach(({ label }) => {
        warnings.push({
          variant: 'danger',
          message: `${playerLabel} — ${label} faltante.`,
        })
      })
    } else if (expiringDocs.length > 0) {
      proximosVencer.push({ player, expiringDocs })
      expiringDocs.forEach(({ label, status }) => {
        warnings.push({
          variant: 'warning',
          message: `${playerLabel} — ${label} vence en ${status.days} días.`,
        })
      })
    } else {
      habilitados.push(player)
    }
  })

  return {
    habilitados,
    proximosVencer,
    vencidos,
    warnings,
    categoryLabel,
    hasIssues: vencidos.length > 0 || proximosVencer.length > 0,
  }
}

export function upsertMedicalDocument(player, documentData) {
  const documents = player.medicalDocuments ?? []
  const exists = documents.some((document) => document.type === documentData.type)

  if (exists) {
    return documents.map((document) =>
      document.type === documentData.type ? { ...document, ...documentData } : document,
    )
  }

  return [...documents, documentData]
}

export function removeMedicalDocument(player, documentId) {
  return (player.medicalDocuments ?? []).filter((document) => document.id !== documentId)
}
