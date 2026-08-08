import { LANDING_MODULES } from '../constants'

export default function LandingFeaturesGrid() {
  return (
    <section id="funciones" className="border-t border-white/5 bg-[#0a0e14] px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mx-auto mb-14 max-w-3xl text-center">
          <p className="text-label text-accent">Funciones</p>
          <h2 className="mt-3 font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Todo tu equipo. Toda tu información. Una sola plataforma.
          </h2>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {LANDING_MODULES.map(({ icon: Icon, title, text }, index) => (
            <article
              key={title}
              className={`group rounded-2xl border border-white/10 bg-surface-card p-6 landing-card-hover cb-animate-slide-up cb-stagger-${(index % 3) + 1}`}
            >
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-accent/10 text-accent transition group-hover:bg-accent/15">
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="font-display text-base font-semibold text-white">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-400">{text}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
