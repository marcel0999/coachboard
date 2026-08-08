export const ZOOM_LEVELS = [0.8, 0.9, 1.0, 1.1, 1.2, 1.3]

export const DEFAULT_DISPLAY_OPTIONS = {
  showNames: true,
  showNumbers: true,
  showPositions: true,
}

export const BOARD_MODES = {
  POSITIONS: 'positions',
  SQUAD: 'squad',
  CHIPS: 'chips',
}

export const PITCH_TYPES = [
  { id: 'full-vertical', label: 'Cancha completa vertical' },
  { id: 'full-horizontal', label: 'Cancha completa horizontal' },
  { id: 'half-offensive', label: 'Media cancha ofensiva' },
  { id: 'half-defensive', label: 'Media cancha defensiva' },
  { id: 'third', label: 'Un tercio de cancha' },
  { id: 'blank-lines', label: 'Cancha sin líneas' },
  { id: 'whiteboard', label: 'Fondo blanco táctico' },
]

export const BOARD_TYPES = [
  { id: 'lineup', label: 'Alineación' },
  { id: 'set-piece', label: 'Pelota quieta' },
  { id: 'high-press', label: 'Presión alta' },
  { id: 'defensive-block', label: 'Bloque defensivo' },
  { id: 'offensive-transition', label: 'Transición ofensiva' },
  { id: 'defensive-transition', label: 'Transición defensiva' },
  { id: 'build-up', label: 'Salida desde el fondo' },
  { id: 'exercise', label: 'Ejercicio' },
  { id: 'match', label: 'Partido' },
  { id: 'other', label: 'Otro' },
]

export const DEFAULT_BOARD_TEMPLATES = [
  { name: 'Alineación titular', formation: '4-3-3', boardType: 'lineup' },
  { name: 'Presión alta', formation: '4-1-4-1', boardType: 'high-press' },
  { name: 'Salida desde el fondo', formation: '4-2-3-1', boardType: 'build-up' },
  { name: 'Bloque defensivo', formation: '5-4-1', boardType: 'defensive-block' },
  { name: 'Pelota quieta', formation: '4-4-2', boardType: 'set-piece' },
  { name: 'Transiciones', formation: '4-2-4', boardType: 'offensive-transition' },
]

export const DRAWING_TOOLS = [
  { id: 'select', label: 'Seleccionar' },
  { id: 'arrow', label: 'Flecha recta' },
  { id: 'arrow-curve', label: 'Flecha curva' },
  { id: 'line', label: 'Línea continua' },
  { id: 'line-dashed', label: 'Línea punteada' },
  { id: 'freehand', label: 'Línea libre' },
  { id: 'circle', label: 'Círculo' },
  { id: 'rectangle', label: 'Rectángulo' },
  { id: 'zone', label: 'Zona sombreada' },
  { id: 'text', label: 'Texto' },
  { id: 'cone', label: 'Cono' },
  { id: 'ball', label: 'Pelota' },
  { id: 'pole', label: 'Pica' },
  { id: 'hurdle', label: 'Valla' },
  { id: 'ring', label: 'Aro' },
  { id: 'mini-goal', label: 'Mini arco' },
  { id: 'mannequin', label: 'Maniquí' },
  { id: 'ladder', label: 'Escalera' },
  { id: 'bib', label: 'Peto' },
  { id: 'eraser', label: 'Borrador' },
]

export const DRAWING_COLORS = ['#ffffff', '#fbbf24', '#ef4444', '#3b82f6', '#22c55e', '#111827']

export const DRAG_FROM_TOOLBAR = 'application/x-coachboard-tool'

export const DEFAULT_TEAM = {
  name: 'Propio',
  primaryColor: '#2563eb',
  secondaryColor: '#ffffff',
  numberColor: '#ffffff',
  shield: null,
  visible: true,
}

export const DEFAULT_RIVAL_TEAM = {
  name: 'Rival',
  primaryColor: '#dc2626',
  secondaryColor: '#ffffff',
  numberColor: '#ffffff',
  shield: null,
  visible: false,
}
