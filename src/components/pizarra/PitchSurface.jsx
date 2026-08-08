const PITCH_STYLES = {
  'full-vertical': {
    aspect: '68/105',
    variant: 'grass',
    showLines: true,
    clip: null,
  },
  'full-horizontal': {
    aspect: '105/68',
    variant: 'grass',
    showLines: true,
    clip: null,
    horizontal: true,
  },
  'half-offensive': {
    aspect: '68/52',
    variant: 'grass',
    showLines: true,
    clip: 'top',
  },
  'half-defensive': {
    aspect: '68/52',
    variant: 'grass',
    showLines: true,
    clip: 'bottom',
  },
  third: {
    aspect: '68/35',
    variant: 'grass',
    showLines: true,
    clip: 'middle',
  },
  'blank-lines': {
    aspect: '68/105',
    variant: 'grass',
    showLines: false,
    clip: null,
  },
  whiteboard: {
    aspect: '68/105',
    variant: 'whiteboard',
    showLines: false,
    clip: null,
  },
}

function PitchFieldSvg({ horizontal, whiteboard }) {
  const stroke = whiteboard ? '#cbd5e1' : 'rgba(255,255,255,0.95)'
  const strokeWidth = whiteboard ? 0.2 : 0.24
  const fill = whiteboard ? '#f8fafc' : 'none'
  const goalStroke = whiteboard ? '#94a3b8' : 'rgba(255,255,255,0.85)'

  if (horizontal) {
    return (
      <svg
        className="pointer-events-none absolute inset-0 h-full w-full"
        viewBox="0 0 105 68"
        preserveAspectRatio="none"
        aria-hidden
      >
        <rect x="2" y="2" width="101" height="64" fill={fill} stroke={stroke} strokeWidth={strokeWidth} />
        <line x1="52.5" y1="2" x2="52.5" y2="66" stroke={stroke} strokeWidth={strokeWidth * 0.85} />
        <circle cx="52.5" cy="34" r="9.15" fill="none" stroke={stroke} strokeWidth={strokeWidth} />
        <circle cx="52.5" cy="34" r="0.5" fill={stroke} />
        <rect x="2" y="13.84" width="16.5" height="40.32" fill="none" stroke={stroke} strokeWidth={strokeWidth} />
        <rect x="2" y="24.84" width="5.5" height="18.32" fill="none" stroke={stroke} strokeWidth={strokeWidth} />
        <circle cx="11" cy="34" r="0.5" fill={stroke} />
        <rect x="86.5" y="13.84" width="16.5" height="40.32" fill="none" stroke={stroke} strokeWidth={strokeWidth} />
        <rect x="97.5" y="24.84" width="5.5" height="18.32" fill="none" stroke={stroke} strokeWidth={strokeWidth} />
        <circle cx="94" cy="34" r="0.5" fill={stroke} />
        <path d="M 18.5 13.84 A 9.15 9.15 0 0 1 18.5 58.16" fill="none" stroke={stroke} strokeWidth={strokeWidth * 0.85} />
        <path d="M 86.5 13.84 A 9.15 9.15 0 0 0 86.5 58.16" fill="none" stroke={stroke} strokeWidth={strokeWidth * 0.85} />
        <rect x="2" y="30" width="1.2" height="8" fill="none" stroke={goalStroke} strokeWidth={0.15} />
        <rect x="101.8" y="30" width="1.2" height="8" fill="none" stroke={goalStroke} strokeWidth={0.15} />
        <path d="M 2 2 L 2.8 2.8 M 103 2 L 102.2 2.8 M 2 66 L 2.8 65.2 M 103 66 L 102.2 65.2" stroke={stroke} strokeWidth={0.12} fill="none" />
      </svg>
    )
  }

  return (
    <svg
      className="pointer-events-none absolute inset-0 h-full w-full"
      viewBox="0 0 68 105"
      preserveAspectRatio="none"
      aria-hidden
    >
      <rect x="2" y="2" width="64" height="101" fill={fill} stroke={stroke} strokeWidth={strokeWidth} />
      <line x1="2" y1="52.5" x2="66" y2="52.5" stroke={stroke} strokeWidth={strokeWidth * 0.85} />
      <circle cx="34" cy="52.5" r="9.15" fill="none" stroke={stroke} strokeWidth={strokeWidth} />
      <circle cx="34" cy="52.5" r="0.5" fill={stroke} />
      {/* Área propia (abajo) */}
      <rect x="13.84" y="86.5" width="40.32" height="16.5" fill="none" stroke={stroke} strokeWidth={strokeWidth} />
      <rect x="24.84" y="95.5" width="18.32" height="5.5" fill="none" stroke={stroke} strokeWidth={strokeWidth} />
      <circle cx="34" cy="94" r="0.5" fill={stroke} />
      <path d="M 13.84 90.35 A 9.15 9.15 0 0 0 54.16 90.35" fill="none" stroke={stroke} strokeWidth={strokeWidth * 0.85} />
      {/* Área rival (arriba) */}
      <rect x="13.84" y="2" width="40.32" height="16.5" fill="none" stroke={stroke} strokeWidth={strokeWidth} />
      <rect x="24.84" y="2" width="18.32" height="5.5" fill="none" stroke={stroke} strokeWidth={strokeWidth} />
      <circle cx="34" cy="11" r="0.5" fill={stroke} />
      <path d="M 13.84 14.65 A 9.15 9.15 0 0 1 54.16 14.65" fill="none" stroke={stroke} strokeWidth={strokeWidth * 0.85} />
      {/* Arcos */}
      <rect x="30.5" y="103.2" width="7" height="1.5" fill="none" stroke={goalStroke} strokeWidth={0.18} rx="0.2" />
      <rect x="30.5" y="0.3" width="7" height="1.5" fill="none" stroke={goalStroke} strokeWidth={0.18} rx="0.2" />
      {/* Esquinas */}
      <path d="M 2 2 Q 2 5 5 2" fill="none" stroke={stroke} strokeWidth={0.14} />
      <path d="M 66 2 Q 63 2 66 5" fill="none" stroke={stroke} strokeWidth={0.14} />
      <path d="M 2 103 Q 2 100 5 103" fill="none" stroke={stroke} strokeWidth={0.14} />
      <path d="M 66 103 Q 63 103 66 100" fill="none" stroke={stroke} strokeWidth={0.14} />
    </svg>
  )
}

function GrassTexture() {
  return (
    <>
      <div className="pitch-grass-base absolute inset-0" />
      <div className="pitch-grass-stripes absolute inset-0" />
      <div className="pitch-grass-vignette absolute inset-0" />
    </>
  )
}

export default function PitchSurface({ pitchType = 'full-vertical', children, className = '' }) {
  const config = PITCH_STYLES[pitchType] ?? PITCH_STYLES['full-vertical']
  const whiteboard = config.variant === 'whiteboard'

  return (
    <div
      className={[
        'pitch-surface relative h-full w-full touch-none overflow-hidden rounded-lg',
        whiteboard ? 'bg-surface-muted' : '',
        className,
      ].join(' ')}
      style={{ aspectRatio: config.aspect.replace('/', ' / ') }}
    >
      {!whiteboard && <GrassTexture />}
      {config.showLines && (
        <PitchFieldSvg horizontal={config.horizontal} whiteboard={whiteboard} />
      )}
      <div className="relative z-[1] h-full w-full">{children}</div>
    </div>
  )
}

export function PitchZoomContainer({ zoom = 1, panX = 0, panY = 0, children, onWheel }) {
  return (
    <div className="overflow-auto rounded-2xl" onWheel={onWheel}>
      <div
        style={{
          transform: `scale(${zoom}) translate(${panX}px, ${panY}px)`,
          transformOrigin: 'center center',
          transition: 'transform 0.15s ease-out',
        }}
      >
        {children}
      </div>
    </div>
  )
}
