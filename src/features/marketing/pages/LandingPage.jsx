import { useLocation } from 'react-router-dom'
import LandingHeader from '../components/LandingHeader'
import LandingHero from '../components/LandingHero'
import LandingFeatures from '../components/LandingFeatures'
import LandingModules from '../components/LandingModules'
import LandingCta from '../components/LandingCta'
import LandingFooter from '../components/LandingFooter'

export default function LandingPage() {
  const location = useLocation()
  const from = location.state?.from
  const authRequired = location.state?.reason === 'auth_required'

  return (
    <div className="flex min-h-screen flex-col bg-surface">
      <LandingHeader from={from} />
      <main className="flex-1">
        <LandingHero authRequired={authRequired} from={from} />
        <LandingFeatures />
        <LandingModules />
        <LandingCta />
      </main>
      <LandingFooter />
    </div>
  )
}
