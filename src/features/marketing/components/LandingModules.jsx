import { LANDING_MODULES } from '../constants'

export default function LandingModules() {
  return (
    <section className="border-t border-slate-200/60 bg-surface px-6 py-20">
      <div className="mx-auto max-w-5xl">
        <div className="mb-12 text-center">
          <p className="text-label text-accent">Roadmap MVP</p>
          <h2 className="mt-2 font-display text-3xl font-bold text-text-primary">
            Todo lo que tu club necesita, en un solo lugar
          </h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {LANDING_MODULES.map(({ icon: Icon, label, status }) => (
            <div
              key={label}
              className="flex items-center gap-4 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm"
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#0a0f1a] text-accent">
                <Icon className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-text-primary">{label}</p>
                <p className="text-xs text-text-muted">{status}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
