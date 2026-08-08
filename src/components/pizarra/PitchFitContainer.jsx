import { useEffect, useRef, useState } from 'react'

const PITCH_ASPECT = {
  'full-vertical': 68 / 105,
  'full-horizontal': 105 / 68,
  'half-offensive': 68 / 52,
  'half-defensive': 68 / 52,
  third: 68 / 35,
  'blank-lines': 68 / 105,
  whiteboard: 68 / 105,
}

/** Escala la cancha para ocupar todo el espacio del contenedor padre manteniendo aspect ratio. */
export default function PitchFitContainer({ pitchType = 'full-vertical', children, className = '' }) {
  const wrapperRef = useRef(null)
  const [size, setSize] = useState({ width: 0, height: 0 })

  useEffect(() => {
    const wrapper = wrapperRef.current
    if (!wrapper) return

    const ratio = PITCH_ASPECT[pitchType] ?? PITCH_ASPECT['full-vertical']

    const update = () => {
      const parent = wrapper.parentElement
      if (!parent) return

      const availW = parent.clientWidth
      const availH = parent.clientHeight
      if (availW <= 0 || availH <= 0) return

      let width = availW
      let height = width / ratio

      if (height > availH) {
        height = availH
        width = height * ratio
      }

      setSize({ width: Math.floor(width), height: Math.floor(height) })
    }

    update()
    const ro = new ResizeObserver(update)
    ro.observe(wrapper.parentElement ?? wrapper)
    window.addEventListener('resize', update)
    return () => {
      ro.disconnect()
      window.removeEventListener('resize', update)
    }
  }, [pitchType])

  return (
    <div ref={wrapperRef} className={`flex h-full w-full items-center justify-center ${className}`}>
      <div
        className="pitch-fit-inner transition-[width,height] duration-200 ease-out"
        style={{
          width: size.width > 0 ? size.width : '100%',
          height: size.height > 0 ? size.height : '100%',
          maxWidth: '100%',
          maxHeight: '100%',
        }}
      >
        {children}
      </div>
    </div>
  )
}
