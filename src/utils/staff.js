import { generateRecordId } from './playerFactory'
import { daysUntilExpiry, getDocumentExpiryStatus } from './medicalCenter'
import { normalizeDocumentField } from './localization'

export function getStaffFullName(member) {
  if (!member) return ''
  const composed = `${member.firstName ?? ''} ${member.lastName ?? ''}`.trim()
  return composed || member.name?.trim() || ''
}

export function generateStaffId() {
  return generateRecordId('staff')
}

export function splitStaffName(name = '') {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return { firstName: '', lastName: '' }
  if (parts.length === 1) return { firstName: parts[0], lastName: '' }
  return { firstName: parts[0], lastName: parts.slice(1).join(' ') }
}

export function normalizeStaffForm(formData) {
  const firstName = formData.firstName?.trim() ?? ''
  const lastName = formData.lastName?.trim() ?? ''
  const name = getStaffFullName({ ...formData, firstName, lastName })

  return {
    ...formData,
    photo: formData.photo ?? null,
    firstName,
    lastName,
    name,
    birthDate: formData.birthDate ?? '',
    documentId: normalizeDocumentField(formData.documentId, formData.documentType),
    documentType: formData.documentType ?? '',
    nationality: formData.nationality?.trim() ?? '',
    phone: formData.phone?.trim() ?? '',
    email: formData.email?.trim() ?? '',
    address: formData.address?.trim() ?? '',
    addressCountry: formData.addressCountry?.trim() ?? '',
    addressDepartment: formData.addressDepartment?.trim() ?? '',
    addressCity: formData.addressCity?.trim() ?? '',
    addressStreet: formData.addressStreet?.trim() ?? '',
    addressPostalCode: formData.addressPostalCode?.trim() ?? '',
    role: formData.role ?? '',
    secondaryRole: formData.secondaryRole ?? '',
    licenseNumber: formData.licenseNumber?.trim() ?? formData.license?.trim() ?? '',
    licenseIssuer: formData.licenseIssuer ?? '',
    licenseLevel: formData.licenseLevel ?? '',
    licenseName: formData.licenseName?.trim() ?? '',
    licenseType: formData.licenseType ?? '',
    licenseIssueDate: formData.licenseIssueDate ?? '',
    licenseIssueCountry: formData.licenseIssueCountry?.trim() ?? '',
    licenseExpiry: formData.licenseExpiry ?? '',
    license: formData.licenseNumber?.trim() ?? formData.license?.trim() ?? '',
    startDate: formData.startDate ?? '',
    specialty: formData.specialty?.trim() ?? '',
    status: formData.status ?? 'Activo',
    notes: formData.notes?.trim() ?? '',
    categoryIds: formData.categoryIds ?? [],
    documents: formData.documents ?? [],
  }
}

export function migrateStaffMemberRecord(member, defaultCategoryId) {
  const split = splitStaffName(member.name ?? '')
  const categoryIds = Array.isArray(member.categoryIds) ? member.categoryIds : []

  return normalizeStaffForm({
    ...member,
    firstName: member.firstName ?? split.firstName,
    lastName: member.lastName ?? split.lastName,
    birthDate: member.birthDate ?? '',
    documentId: member.documentId ?? '',
    nationality: member.nationality ?? '',
    address: member.address ?? '',
    secondaryRole: member.secondaryRole ?? '',
    licenseNumber: member.licenseNumber ?? member.license ?? '',
    licenseType: member.licenseType ?? '',
    licenseExpiry: member.licenseExpiry ?? '',
    status: member.status ?? 'Activo',
    documents: member.documents ?? [],
    categoryIds:
      categoryIds.length > 0
        ? categoryIds
        : defaultCategoryId
          ? [defaultCategoryId]
          : [],
  })
}

export function updateStaffById(staff, staffId, updates) {
  return staff.map((member) =>
    member.id === staffId ? normalizeStaffForm({ ...member, ...updates }) : member,
  )
}

export function filterStaff(staff, { search, roleFilter, statusFilter, categoryFilter }) {
  const query = search.trim().toLowerCase()

  return staff.filter((member) => {
    const matchesRole = roleFilter === 'all' || member.role === roleFilter
    const matchesStatus = statusFilter === 'all' || member.status === statusFilter
    const matchesCategory =
      !categoryFilter ||
      categoryFilter === 'all' ||
      (member.categoryIds ?? []).includes(categoryFilter)

    if (!matchesRole || !matchesStatus || !matchesCategory) return false
    if (!query) return true

    const fullName = getStaffFullName(member).toLowerCase()
    return (
      fullName.includes(query) ||
      member.role.toLowerCase().includes(query) ||
      member.secondaryRole?.toLowerCase().includes(query) ||
      member.specialty.toLowerCase().includes(query) ||
      member.email.toLowerCase().includes(query) ||
      member.licenseNumber?.toLowerCase().includes(query) ||
      member.documentId?.toLowerCase().includes(query)
    )
  })
}

export function sortStaff(staff, sortBy) {
  const sorted = [...staff]

  sorted.sort((a, b) => {
    switch (sortBy) {
      case 'role':
        return a.role.localeCompare(b.role, 'es')
      case 'startDate':
        return (b.startDate || '').localeCompare(a.startDate || '')
      case 'status':
        return a.status.localeCompare(b.status, 'es')
      case 'name':
      default:
        return getStaffFullName(a).localeCompare(getStaffFullName(b), 'es')
    }
  })

  return sorted
}

export function initializeStaffSquad(allStaffIds) {
  return {
    called: [],
    notCalled: [...allStaffIds],
  }
}

export function ensureStaffSquad(staffSquad, allStaffIds) {
  const called = (staffSquad?.called ?? []).filter((id) => allStaffIds.includes(id))
  const known = new Set([...called, ...(staffSquad?.notCalled ?? [])])
  const notCalled = [
    ...(staffSquad?.notCalled ?? []).filter((id) => allStaffIds.includes(id) && !called.includes(id)),
    ...allStaffIds.filter((id) => !known.has(id)),
  ]

  return { called, notCalled }
}

export function reconcileStaffInMatches(staffMember, matches) {
  const categoryIds = staffMember.categoryIds ?? []

  return matches.map((match) => {
    const belongs = categoryIds.includes(match.categoryId)
    const called = match.staffSquad?.called ?? []
    const notCalled = match.staffSquad?.notCalled ?? []
    const isPresent = called.includes(staffMember.id) || notCalled.includes(staffMember.id)

    if (belongs && !isPresent) {
      return {
        ...match,
        staffSquad: {
          called,
          notCalled: [...notCalled, staffMember.id],
        },
      }
    }

    if (!belongs && isPresent) {
      return removeStaffFromMatch(match, staffMember.id)
    }

    return match
  })
}

export function removeStaffFromMatch(match, staffId) {
  return {
    ...match,
    staffSquad: {
      called: (match.staffSquad?.called ?? []).filter((id) => id !== staffId),
      notCalled: (match.staffSquad?.notCalled ?? []).filter((id) => id !== staffId),
    },
  }
}

export function removeStaffFromTraining(training, staffId) {
  return {
    ...training,
    staffIds: (training.staffIds ?? []).filter((id) => id !== staffId),
  }
}

export function getStaffInitials(member) {
  const fullName = getStaffFullName(member)
  return fullName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase() || '?'
}

export function buildStaffParticipation(staffId, matches = [], trainings = []) {
  const matchHistory = matches
    .filter((match) => (match.staffSquad?.called ?? []).includes(staffId))
    .map((match) => ({
      id: match.id,
      type: 'match',
      date: match.date,
      label: `vs ${match.opponent}`,
      competition: match.competition,
      categoryId: match.categoryId,
    }))

  const trainingHistory = trainings
    .filter((training) => (training.staffIds ?? []).includes(staffId))
    .map((training) => ({
      id: training.id,
      type: 'training',
      date: training.date,
      label: training.title ?? training.objective ?? 'Entrenamiento',
      categoryId: training.categoryId,
    }))

  return [...matchHistory, ...trainingHistory].sort((a, b) =>
    `${b.date}`.localeCompare(`${a.date}`),
  )
}

export function getStaffLicenseStatus(member, referenceDate = new Date()) {
  if (!member.licenseExpiry) {
    return { level: 'missing', variant: 'default', label: 'Sin vencimiento cargado', days: null }
  }
  return getDocumentExpiryStatus(member.licenseExpiry, referenceDate)
}

export function buildStaffAlerts(staff, referenceDate = new Date()) {
  const alerts = []

  staff.forEach((member) => {
    if (member.status === 'Inactivo') return

    const licenseStatus = getStaffLicenseStatus(member, referenceDate)
    if (licenseStatus.level === 'expired' || licenseStatus.level === 'critical') {
      alerts.push({
        id: `staff-license-${member.id}`,
        member,
        level: licenseStatus.level,
        variant: 'danger',
        title: `${getStaffFullName(member)} · licencia ${licenseStatus.label.toLowerCase()}`,
        description: member.licenseExpiry
          ? `Vence el ${member.licenseExpiry}`
          : 'Licencia sin fecha de vencimiento',
      })
    } else if (licenseStatus.level === 'warning') {
      alerts.push({
        id: `staff-license-warning-${member.id}`,
        member,
        level: licenseStatus.level,
        variant: 'warning',
        title: `${getStaffFullName(member)} · licencia por vencer`,
        description: `Vence en ${licenseStatus.days} días`,
      })
    }

    ;(member.documents ?? []).forEach((document) => {
      const status = getDocumentExpiryStatus(document.expiresAt, referenceDate)
      if (status.level === 'expired' || status.level === 'critical' || status.level === 'warning') {
        alerts.push({
          id: `staff-doc-${member.id}-${document.id}`,
          member,
          document,
          level: status.level,
          variant: status.variant,
          title: `${getStaffFullName(member)} · ${document.type}`,
          description: status.label,
        })
      }
    })
  })

  return alerts
}

export function buildStaffDashboardWidget(staff, referenceDate = new Date()) {
  const alerts = buildStaffAlerts(staff, referenceDate)
  return {
    total: staff.length,
    active: staff.filter((member) => member.status === 'Activo').length,
    expiredLicenses: alerts.filter((alert) => alert.level === 'expired').length,
    expiringLicenses: alerts.filter((alert) => alert.level === 'warning' || alert.level === 'critical').length,
    topAlerts: alerts.slice(0, 5),
  }
}

export function upsertStaffDocument(member, documentData) {
  const documents = member.documents ?? []
  const exists = documents.some((document) => document.id === documentData.id)

  if (exists) {
    return documents.map((document) =>
      document.id === documentData.id ? { ...document, ...documentData } : document,
    )
  }

  return [...documents, documentData]
}

export function removeStaffDocument(member, documentId) {
  return (member.documents ?? []).filter((document) => document.id !== documentId)
}

export function createStaffDocument(type, data = {}) {
  return {
    id: generateRecordId('sdoc'),
    type,
    issuedAt: data.issuedAt ?? '',
    expiresAt: data.expiresAt ?? '',
    fileName: data.fileName ?? null,
    mimeType: data.mimeType ?? null,
    dataUrl: data.dataUrl ?? null,
    notes: data.notes ?? '',
  }
}
