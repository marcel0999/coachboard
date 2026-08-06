import { useEffect, useMemo, useState } from 'react'
import { Check, Copy, MailPlus, Shield } from 'lucide-react'
import {
  INVITABLE_ROLES,
  PERMISSION_MODULES,
  ROLE_LABELS,
  USER_ROLES,
} from '../constants/auth'
import Alert from '../components/ui/Alert'
import Badge from '../components/ui/Badge'
import Button from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import PageHeader from '../components/ui/PageHeader'
import SectionHeader from '../components/ui/SectionHeader'
import Spinner from '../components/ui/Spinner'
import { FormField, Input, Select } from '../components/ui/FormField'
import { useAuth } from '../context/AuthContext'
import { resolvePermissions } from '../utils/permissions'

function PermissionEditor({ membership, onSave }) {
  const [draft, setDraft] = useState(() =>
    resolvePermissions(membership.role, membership.permissions),
  )
  const [saved, setSaved] = useState(false)

  const modules = Object.entries(PERMISSION_MODULES).filter(
    ([key]) => key !== 'equipo' && key !== 'ejercicios',
  )

  function toggle(module, field) {
    setDraft((prev) => ({
      ...prev,
      [module]: {
        ...prev[module],
        [field]: !prev[module]?.[field],
        ...(field === 'edit' && !prev[module]?.[field] ? { view: true } : {}),
        ...(field === 'view' && prev[module]?.view ? { edit: false } : {}),
      },
    }))
    setSaved(false)
  }

  async function handleSave() {
    const custom = {}
    const defaults = resolvePermissions(membership.role, null)
  Object.keys(PERMISSION_MODULES).forEach((module) => {
    const base = defaults[module]
    const current = draft[module]
    if (current.view !== base.view || current.edit !== base.edit) {
      custom[module] = { view: current.view, edit: current.edit }
    }
  })
  // Mantener alias legacy sincronizado con Biblioteca
  if (custom.biblioteca) {
    custom.ejercicios = { ...custom.biblioteca }
  }
    await onSave(Object.keys(custom).length > 0 ? custom : null)
    setSaved(true)
  }

  if (membership.role === USER_ROLES.ADMIN) {
    return (
      <p className="text-xs text-text-secondary">
        El administrador tiene acceso completo y no puede modificarse desde aquí.
      </p>
    )
  }

  return (
    <div className="space-y-3">
      <div className="overflow-x-auto rounded-xl border border-slate-200">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-text-secondary">
            <tr>
              <th className="px-4 py-3">Módulo</th>
              <th className="px-4 py-3 text-center">Ver</th>
              <th className="px-4 py-3 text-center">Editar</th>
            </tr>
          </thead>
          <tbody>
            {modules.map(([key, meta]) => (
              <tr key={key} className="border-t border-slate-100">
                <td className="px-4 py-3 font-medium text-text-primary">{meta.label}</td>
                <td className="px-4 py-3 text-center">
                  <input
                    type="checkbox"
                    checked={draft[key]?.view ?? false}
                    onChange={() => toggle(key, 'view')}
                    className="h-4 w-4 rounded border-slate-300 text-accent focus:ring-accent"
                  />
                </td>
                <td className="px-4 py-3 text-center">
                  <input
                    type="checkbox"
                    checked={draft[key]?.edit ?? false}
                    onChange={() => toggle(key, 'edit')}
                    className="h-4 w-4 rounded border-slate-300 text-accent focus:ring-accent"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Button type="button" onClick={handleSave}>
        {saved ? <Check className="h-4 w-4" /> : <Shield className="h-4 w-4" />}
        {saved ? 'Permisos guardados' : 'Guardar permisos'}
      </Button>
    </div>
  )
}

export default function TeamAccess() {
  const {
    club,
    canInvite,
    canManageAccess,
    inviteMember,
    setMemberPermissions,
    refreshTeam,
  } = useAuth()

  const [teamData, setTeamData] = useState({ members: [], invitations: [] })
  const [email, setEmail] = useState('')
  const [role, setRole] = useState(INVITABLE_ROLES[0])
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [copiedToken, setCopiedToken] = useState(null)
  const [loadingTeam, setLoadingTeam] = useState(true)

  useEffect(() => {
    let cancelled = false

    async function loadTeam() {
      setLoadingTeam(true)
      try {
        const data = await refreshTeam()
        if (!cancelled) setTeamData(data)
      } finally {
        if (!cancelled) setLoadingTeam(false)
      }
    }

    loadTeam()
    return () => {
      cancelled = true
    }
  }, [refreshTeam])

  const { members, invitations } = teamData

  const sortedMembers = useMemo(
    () =>
      [...members].sort((a, b) =>
        (ROLE_LABELS[a.membership.role] ?? '').localeCompare(ROLE_LABELS[b.membership.role] ?? ''),
      ),
    [members],
  )

  async function reloadTeam() {
    const data = await refreshTeam()
    setTeamData(data)
  }

  async function handleInvite(event) {
    event.preventDefault()
    setError('')
    setMessage('')
    try {
      const invite = await inviteMember({ email, role })
      setEmail('')
      setMessage('Invitación creada. Compartí el enlace con el integrante.')
      await reloadTeam()
      copyInviteLink(invite.token)
    } catch (inviteError) {
      setError(inviteError.message)
    }
  }

  function copyInviteLink(token) {
    const url = `${window.location.origin}/invitacion/${token}`
    navigator.clipboard.writeText(url).then(() => {
      setCopiedToken(token)
      setTimeout(() => setCopiedToken(null), 2500)
    })
  }

  return (
    <div className="cb-animate-in space-y-6">
      <PageHeader
        title="Accesos del equipo"
        description={`${club?.name ?? 'Club'} · Invitaciones, roles y permisos sincronizados en Supabase`}
      />

      {error && <Alert variant="danger">{error}</Alert>}
      {message && <Alert variant="success">{message}</Alert>}

      {canInvite && (
        <Card>
          <SectionHeader title="Invitar integrante" icon={MailPlus} />
          <form onSubmit={handleInvite} className="grid gap-4 sm:grid-cols-[1fr_auto_auto] sm:items-end">
            <FormField label="Correo electrónico" htmlFor="invite-email">
              <Input
                id="invite-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="integrante@club.com"
              />
            </FormField>
            <FormField label="Rol" htmlFor="invite-role">
              <Select id="invite-role" value={role} onChange={(e) => setRole(e.target.value)}>
                {INVITABLE_ROLES.map((r) => (
                  <option key={r} value={r}>
                    {ROLE_LABELS[r]}
                  </option>
                ))}
              </Select>
            </FormField>
            <Button type="submit">
              <MailPlus className="h-4 w-4" />
              Invitar
            </Button>
          </form>
        </Card>
      )}

      <Card>
        <SectionHeader
          title="Miembros activos"
          description={loadingTeam ? 'Cargando…' : `${sortedMembers.length} integrantes`}
        />
        {loadingTeam ? (
          <div className="flex justify-center py-8">
            <Spinner />
          </div>
        ) : sortedMembers.length === 0 ? (
          <p className="text-sm text-text-secondary">No hay integrantes activos todavía.</p>
        ) : (
          <ul className="space-y-4">
            {sortedMembers.map(({ user, membership }) => (
              <li
                key={membership.id}
                className="rounded-xl border border-slate-200/80 bg-surface-secondary/40 p-5"
              >
                <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-text-primary">{user.fullName}</p>
                    <p className="text-sm text-text-secondary">{user.email}</p>
                  </div>
                  <Badge>{ROLE_LABELS[membership.role]}</Badge>
                </div>
                {canManageAccess ? (
                  <PermissionEditor
                    membership={membership}
                    onSave={async (permissions) => {
                      await setMemberPermissions(membership.id, permissions)
                      await reloadTeam()
                    }}
                  />
                ) : (
                  <p className="text-sm text-text-secondary">
                    Permisos definidos por el Director Técnico o Administrador.
                  </p>
                )}
              </li>
            ))}
          </ul>
        )}
      </Card>

      {invitations.length > 0 && (
        <Card>
          <SectionHeader title="Invitaciones pendientes" />
          <ul className="space-y-2">
            {invitations.map((invite) => (
              <li
                key={invite.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200/80 px-4 py-3"
              >
                <div>
                  <p className="font-medium text-text-primary">{invite.email}</p>
                  <p className="text-sm text-text-secondary">{ROLE_LABELS[invite.role]}</p>
                </div>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => copyInviteLink(invite.token)}
                >
                  {copiedToken === invite.token ? (
                    <Check className="h-3.5 w-3.5 text-accent" />
                  ) : (
                    <Copy className="h-3.5 w-3.5" />
                  )}
                  Copiar enlace
                </Button>
              </li>
            ))}
          </ul>
        </Card>
      )}

      {!canInvite && (
        <Alert variant="info">
          Solo el administrador puede enviar invitaciones al cuerpo técnico.
        </Alert>
      )}
    </div>
  )
}
