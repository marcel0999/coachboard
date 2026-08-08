function WindowChrome({ title, children, className = '' }) {
  return (
    <div className={`overflow-hidden rounded-xl border border-white/10 bg-[#0f1419] ${className}`}>
      <div className="flex items-center gap-2 border-b border-white/5 bg-[#121820] px-3 py-2">
        <div className="flex gap-1">
          <span className="h-2 w-2 rounded-full bg-red-500/70" />
          <span className="h-2 w-2 rounded-full bg-amber-400/70" />
          <span className="h-2 w-2 rounded-full bg-emerald-500/70" />
        </div>
        <span className="ml-1 truncate text-[10px] font-medium text-slate-400">{title}</span>
      </div>
      <div className="p-3">{children}</div>
    </div>
  )
}

function DashboardMockup() {
  return (
    <WindowChrome title="Dashboard — Bola Ocho FC" className="landing-window-glow">
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold text-white">Dashboard</p>
            <p className="text-[9px] text-slate-500">Resumen del club · Primera División</p>
          </div>
          <span className="rounded-full bg-accent/20 px-2 py-0.5 text-[8px] font-semibold text-accent">
            En vivo
          </span>
        </div>
        <div className="grid grid-cols-4 gap-1.5">
          {[
            { label: 'Jugadores', value: '28' },
            { label: 'Partidos', value: '12' },
            { label: 'Entrenos', value: '8' },
            { label: 'Lesionados', value: '2' },
          ].map(({ label, value }) => (
            <div key={label} className="rounded-lg border border-white/5 bg-[#151b28] px-2 py-1.5">
              <p className="text-[8px] text-slate-500">{label}</p>
              <p className="text-sm font-bold text-white">{value}</p>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-3 gap-1.5">
          {['Plantel', 'Partidos', 'Pizarra'].map((item) => (
            <div
              key={item}
              className="flex flex-col items-center rounded-lg border border-white/5 bg-[#151b28] py-2"
            >
              <div className="mb-1 h-4 w-4 rounded bg-accent/20" />
              <span className="text-[8px] text-slate-400">{item}</span>
            </div>
          ))}
        </div>
        <div className="rounded-lg border border-white/5 bg-[#151b28] p-2">
          <p className="mb-1.5 text-[8px] font-semibold text-slate-400">Próximos partidos</p>
          <div className="space-y-1">
            {['vs River · Sáb 18:00', 'vs San Lorenzo · Mié 20:30'].map((match) => (
              <div key={match} className="flex items-center gap-2 rounded bg-[#0f1419] px-2 py-1">
                <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                <span className="text-[8px] text-slate-300">{match}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </WindowChrome>
  )
}

function PizarraMockup({ compact = false }) {
  const players = compact
    ? [
        { x: '50%', y: '88%', n: '1' },
        { x: '18%', y: '68%', n: '3' },
        { x: '82%', y: '68%', n: '4' },
        { x: '35%', y: '48%', n: '8' },
        { x: '65%', y: '48%', n: '10' },
        { x: '50%', y: '22%', n: '9' },
      ]
    : [
        { x: '50%', y: '90%', n: '1' },
        { x: '15%', y: '72%', n: '3' },
        { x: '35%', y: '72%', n: '2' },
        { x: '65%', y: '72%', n: '4' },
        { x: '85%', y: '72%', n: '6' },
        { x: '25%', y: '52%', n: '8' },
        { x: '50%', y: '52%', n: '5' },
        { x: '75%', y: '52%', n: '10' },
        { x: '35%', y: '28%', n: '11' },
        { x: '65%', y: '28%', n: '7' },
        { x: '50%', y: '12%', n: '9' },
      ]

  const pitch = (
    <div className="relative aspect-[3/4] w-full overflow-hidden rounded-lg pitch-grass-base">
      <div className="absolute inset-0 pitch-grass-stripes" />
      <div className="absolute inset-2 rounded border border-white/30" />
      <div className="absolute left-1/2 top-1/2 h-8 w-8 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/30" />
      <div className="absolute left-1/2 top-0 h-6 w-12 -translate-x-1/2 border border-t-0 border-white/30" />
      <div className="absolute bottom-0 left-1/2 h-6 w-12 -translate-x-1/2 border border-b-0 border-white/30" />
      {players.map(({ x, y, n }) => (
        <div
          key={n}
          className="absolute flex h-4 w-4 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-accent text-[7px] font-bold text-white shadow-md"
          style={{ left: x, top: y }}
        >
          {n}
        </div>
      ))}
    </div>
  )

  if (compact) {
    return (
      <WindowChrome title="Pizarra táctica" className="landing-window">
        <div className="space-y-2">
          <p className="text-[9px] font-medium text-slate-400">4-3-3 Ofensivo</p>
          {pitch}
        </div>
      </WindowChrome>
    )
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#0f1419] landing-window-glow">
      <div className="flex items-center justify-between border-b border-white/5 bg-[#121820] px-4 py-2.5">
        <div className="flex gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-red-500/70" />
          <span className="h-2.5 w-2.5 rounded-full bg-amber-400/70" />
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-500/70" />
        </div>
        <span className="text-xs font-medium text-slate-400">Pizarra 4-3-3 Ofensivo</span>
        <div className="flex gap-1">
          {['Mover', 'Dibujar', 'Flecha'].map((tool) => (
            <span key={tool} className="rounded bg-accent/15 px-1.5 py-0.5 text-[8px] text-accent">
              {tool}
            </span>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-[140px_1fr] gap-0">
        <div className="space-y-1.5 border-r border-white/5 p-3">
          {['García · 1', 'López · 3', 'Martínez · 8', 'Díaz · 9'].map((name) => (
            <div key={name} className="flex items-center gap-1.5 rounded-lg bg-[#151b28] px-2 py-1">
              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-accent/20 text-[7px] font-bold text-accent">
                {name.split('·')[1]?.trim()}
              </span>
              <span className="truncate text-[8px] text-slate-300">{name.split('·')[0]}</span>
            </div>
          ))}
        </div>
        <div className="p-3">{pitch}</div>
      </div>
    </div>
  )
}

function PlantelMockup() {
  const rows = [
    { num: '1', name: 'García', pos: 'ARQ' },
    { num: '3', name: 'López', pos: 'DEF' },
    { num: '8', name: 'Martínez', pos: 'MED' },
    { num: '9', name: 'Díaz', pos: 'DEL' },
  ]

  return (
    <WindowChrome title="Plantel" className="landing-window">
      <div className="space-y-1.5">
        <p className="text-[9px] font-semibold text-slate-400">Primera División · 28 jugadores</p>
        {rows.map(({ num, name, pos }) => (
          <div key={num} className="flex items-center gap-2 rounded-lg bg-[#151b28] px-2 py-1.5">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-accent text-[8px] font-bold text-white">
              {num}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[9px] font-medium text-white">{name}</p>
              <p className="text-[8px] text-slate-500">{pos}</p>
            </div>
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
          </div>
        ))}
      </div>
    </WindowChrome>
  )
}

export default function LandingProductMockup() {
  return (
    <div className="relative mx-auto w-full max-w-lg lg:max-w-none">
      <div className="landing-float relative z-10">
        <DashboardMockup />
      </div>
      <div className="landing-float-delayed absolute -left-4 top-16 z-0 hidden w-[42%] sm:block lg:-left-8 lg:top-20">
        <PizarraMockup compact />
      </div>
      <div className="landing-float-delayed-2 absolute -right-2 top-24 z-0 hidden w-[38%] sm:block lg:-right-6 lg:top-28">
        <PlantelMockup />
      </div>
    </div>
  )
}

export { PizarraMockup }
