import { LANDING_FEATURES } from '../constants'

export default function LandingFeatures() {
  return (
    <section className="border-t border-slate-200/60 bg-white px-6 py-20">
      <div className="mx-auto max-w-5xl">
        <div className="mb-12 text-center">
          <p className="text-label text-accent">Por qué CoachBoard</p>
          <h2 className="mt-2 font-display text-3xl font-bold text-text-primary">
            Hecho para entrenadores, no para planillas
          </h2>
        </div>
        <div className="grid gap-6 sm:grid-cols-3">
          {LANDING_FEATURES.map(({ icon: Icon, title, text }, index) => (
            <div
              key={title}
              className={`rounded-2xl border border-slate-200/70 bg-surface-muted/50 p-6 cb-animate-slide-up cb-stagger-${index + 1}`}
            >
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-accent-subtle text-accent">
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="font-display font-semibold text-text-primary">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-text-secondary">{text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
