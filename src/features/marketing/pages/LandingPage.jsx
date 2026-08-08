import { useLocation } from 'react-router-dom'
import LandingHeader from '../components/LandingHeader'
import LandingHero from '../components/LandingHero'
import LandingFeaturesGrid from '../components/LandingFeaturesGrid'
import LandingPitchSection from '../components/LandingPitchSection'
import LandingAudienceSection from '../components/LandingAudienceSection'
import LandingDevicesSection from '../components/LandingDevicesSection'
import LandingCta from '../components/LandingCta'
import LandingFooter from '../components/LandingFooter'

export default function LandingPage() {
  const location = useLocation()
  const from = location.state?.from
  const authRequired = location.state?.reason === 'auth_required'

  return (
    <div className="flex min-h-screen flex-col overflow-x-hidden bg-[#060a12]">
      <LandingHeader from={from} />
      <main className="flex-1">
        <LandingHero authRequired={authRequired} from={from} />
        <LandingFeaturesGrid />
        <LandingPitchSection />
        <LandingAudienceSection />
        <LandingDevicesSection />
        <LandingCta />
      </main>
      <LandingFooter />
    </div>
  )
}
