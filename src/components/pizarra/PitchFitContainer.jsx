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

/** Escala el campo para que quepa completo en pantalla (~15–20 % más compacto). */
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

      const parentW = parent.clientWidth
      const viewportH = window.innerHeight
      const maxH = Math.min(viewportH * 0.52, 480)
      const maxW = parentW * 0.84

      let width = maxW
      let height = width / ratio

      if (height > maxH) {
        height = maxH
        width = height * ratio
      }

      setSize({ width: Math.round(width), height: Math.round(height) })
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
    <div ref={wrapperRef} className={`flex w-full justify-center ${className}`}>
      <div
        className="pitch-fit-inner transition-[width,height] duration-200 ease-out"
        style={{
          width: size.width > 0 ? size.width : '100%',
          height: size.height > 0 ? size.height : undefined,
          maxWidth: '100%',
        }}
      >
        {children}
      </div>
    </div>
  )
}
