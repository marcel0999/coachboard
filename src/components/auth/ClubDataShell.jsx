import { useEffect, useState } from 'react'
import { Outlet } from 'react-router-dom'
import { AppDataProvider } from '../../context/AppDataContext'
import { LibraryProvider } from '../../context/LibraryContext'
import { useAuth } from '../../context/AuthContext'
import { configureStorageForClubAsync } from '../../storage'
import Spinner from '../ui/Spinner'

export default function ClubDataShell() {
  const { club } = useAuth()
  const [ready, setReady] = useState(false)

  useEffect(() => {
    let cancelled = false

    async function setup() {
      if (!club?.id) return
      await configureStorageForClubAsync(club.id)
      if (!cancelled) setReady(true)
    }

    setReady(false)
    setup()

    return () => {
      cancelled = true
    }
  }, [club?.id])

  if (!club?.id || !ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface">
        <Spinner size="lg" label="Cargando datos del club…" />
      </div>
    )
  }

  return (
    <AppDataProvider key={club.id}>
      <LibraryProvider>
        <Outlet />
      </LibraryProvider>
    </AppDataProvider>
  )
}
