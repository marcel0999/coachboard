import { LANDING_DEVICES } from '../constants'

function DeviceFrame({ type, children }) {
  const frames = {
    laptop: 'w-full max-w-md rounded-xl border border-white/10 bg-[#0f1419] p-3 shadow-2xl',
    tablet: 'w-36 rounded-2xl border-4 border-[#1a2234] bg-[#0f1419] p-2 shadow-xl sm:w-44',
    phone: 'w-24 rounded-[1.25rem] border-4 border-[#1a2234] bg-[#0f1419] p-1.5 shadow-xl sm:w-28',
  }

  return <div className={frames[type]}>{children}</div>
}

export default function LandingDevicesSection() {
  return (
    <section className="relative overflow-hidden border-t border-white/5 bg-[#060a12] px-4 py-20 sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(59,130,246,0.05),transparent_65%)]" />

      <div className="relative mx-auto max-w-7xl">
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <p className="text-label text-accent">Multidispositivo</p>
          <h2 className="mt-3 font-display text-3xl font-bold text-white sm:text-4xl">
            CoachBoard donde estés.
          </h2>
          <p className="mt-4 text-base leading-relaxed text-slate-400">
            Entrá desde el vestuario, la cancha, tu casa o mientras viajás. Solo necesitás internet.
          </p>
        </div>

        <div className="mx-auto flex max-w-3xl flex-col items-center gap-8">
          <div className="flex w-full items-end justify-center gap-4 sm:gap-8">
            <DeviceFrame type="phone">
              <div className="aspect-[9/16] overflow-hidden rounded-[0.85rem] bg-[#151b28]">
                <div className="border-b border-white/5 px-2 py-1.5">
                  <p className="text-[7px] font-semibold text-white">CoachBoard</p>
                </div>
                <div className="space-y-1 p-2">
                  {['Dashboard', 'Plantel', 'Pizarra'].map((item) => (
                    <div key={item} className="rounded bg-[#0f1419] px-1.5 py-1 text-[6px] text-slate-400">
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            </DeviceFrame>

            <DeviceFrame type="laptop">
              <div className="aspect-[16/10] overflow-hidden rounded-lg bg-[#151b28]">
                <div className="flex items-center gap-2 border-b border-white/5 px-3 py-2">
                  <div className="flex gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-red-500/70" />
                    <span className="h-1.5 w-1.5 rounded-full bg-amber-400/70" />
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500/70" />
                  </div>
                  <span className="text-[9px] text-slate-500">coachboard.app/dashboard</span>
                </div>
                <div className="grid grid-cols-4 gap-2 p-3">
                  {[1, 2, 3, 4].map((n) => (
                    <div key={n} className="rounded bg-[#0f1419] p-2">
                      <div className="mb-1 h-2 w-2 rounded bg-accent/30" />
                      <div className="h-1.5 w-full rounded bg-white/5" />
                    </div>
                  ))}
                </div>
              </div>
            </DeviceFrame>

            <DeviceFrame type="tablet">
              <div className="aspect-[3/4] overflow-hidden rounded-xl bg-[#151b28]">
                <div className="border-b border-white/5 px-2 py-1.5">
                  <p className="text-[8px] font-semibold text-white">Pizarra</p>
                </div>
                <div className="relative m-2 aspect-[3/4] overflow-hidden rounded pitch-grass-base">
                  <div className="absolute inset-0 pitch-grass-stripes opacity-50" />
                </div>
              </div>
            </DeviceFrame>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6">
            {LANDING_DEVICES.map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-2 text-sm text-slate-400">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/5">
                  <Icon className="h-4 w-4 text-accent" />
                </div>
                <span className="font-medium">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
