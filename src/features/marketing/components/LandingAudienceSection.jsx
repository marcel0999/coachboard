import { Check } from 'lucide-react'
import { LANDING_AUDIENCE } from '../constants'

export default function LandingAudienceSection() {
  return (
    <section className="border-t border-white/5 bg-[#0a0e14] px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-2">
        {LANDING_AUDIENCE.map(({ id, title, text, benefits }) => (
          <article
            key={id}
            id={id}
            className="rounded-2xl border border-white/10 bg-gradient-to-br from-surface-card to-[#0f1419] p-8 landing-card-hover"
          >
            <h3 className="font-display text-2xl font-bold text-white">{title}</h3>
            <p className="mt-3 text-base leading-relaxed text-slate-400">{text}</p>

            <ul className="mt-6 space-y-2">
              {benefits.map((benefit) => (
                <li key={benefit} className="flex items-center gap-2.5 text-sm text-slate-300">
                  <Check className="h-4 w-4 shrink-0 text-accent" />
                  {benefit}
                </li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </section>
  )
}
