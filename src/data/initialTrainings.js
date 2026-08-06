import { createDefaultBlocks, generateTrainingId } from '../utils/trainings'
import { DEFAULT_CATEGORY_ID } from '../constants/categories'

export function createInitialTrainings() {  const monday = '2025-08-04'
  const tuesday = '2025-08-05'
  const thursday = '2025-08-07'
  const saturday = '2025-08-09'

  const baseBlocks = createDefaultBlocks(90)

  return [
    {
      id: 'trn-001',
      categoryId: DEFAULT_CATEGORY_ID,
      date: monday,
      time: '09:00',
      duration: 90,
      field: 'Cancha 1',
      category: 'Físico',
      objective: 'Recuperación activa post-partido',
      load: 'Baja',
      notes: 'Sesión de regeneración.',
      status: 'Finalizado',
      blocks: baseBlocks.map((block, index) => ({
        ...block,
        id: `blk-init-1-${index}`,
        exerciseIds: index === 0 ? ['ex-005'] : index === 5 ? ['ex-010'] : [],
        objective: block.label,
      })),
      players: {
        attendees: ['plr-001', 'plr-002', 'plr-004', 'plr-005', 'plr-007', 'plr-008', 'plr-009', 'plr-010', 'plr-011', 'plr-012', 'plr-013', 'plr-015', 'plr-016', 'plr-017', 'plr-019', 'plr-020', 'plr-021', 'plr-022'],
        absent: ['plr-018'],
        injured: ['plr-003', 'plr-014'],
        differentiated: [{ playerId: 'plr-006', work: 'Trabajo individual', notes: 'Suspensión' }],
      },
      loadControl: [],
      summary: {
        totalDuration: 90,
        playerCount: 18,
        averageLoad: 4.2,
        exercisesUsed: ['Activación articular', 'Vuelta a la calma + estiramientos'],
        finalNotes: 'Buena respuesta del grupo. Carga controlada.',
      },
    },
    {
      id: 'trn-002',
      categoryId: DEFAULT_CATEGORY_ID,
      date: tuesday,
      time: '10:00',
      duration: 105,
      field: 'Cancha 2',
      category: 'Táctico',
      objective: 'Pressing alto y salida limpia',
      load: 'Media',
      notes: 'Preparación vs Deportivo Norte.',
      status: 'Programado',
      blocks: createDefaultBlocks(105).map((block, index) => ({
        ...block,
        id: `blk-init-2-${index}`,
        exerciseIds: index === 2 ? ['ex-001'] : index === 3 ? ['ex-007', 'ex-008'] : index === 4 ? ['ex-003'] : [],
      })),
      players: {
        attendees: [],
        absent: [],
        injured: [],
        differentiated: [],
      },
      loadControl: [],
      summary: { totalDuration: 0, playerCount: 0, averageLoad: 0, exercisesUsed: [], finalNotes: '' },
    },
    {
      id: 'trn-003',
      categoryId: DEFAULT_CATEGORY_ID,
      date: thursday,
      time: '09:30',
      duration: 90,
      field: 'Cancha 1',
      category: 'Técnico',
      objective: 'Finalización y transiciones',
      load: 'Alta',
      notes: '',
      status: 'Programado',
      blocks: createDefaultBlocks(90),
      players: { attendees: [], absent: [], injured: [], differentiated: [] },
      loadControl: [],
      summary: { totalDuration: 0, playerCount: 0, averageLoad: 0, exercisesUsed: [], finalNotes: '' },
    },
    {
      id: 'trn-004',
      categoryId: DEFAULT_CATEGORY_ID,
      date: saturday,
      time: '08:00',
      duration: 60,
      field: 'Cancha auxiliar',
      category: 'Pre-partido',
      objective: 'Activación pre-partido',
      load: 'Baja',
      notes: 'Víspera de partido vs Unión del Sur.',
      status: 'Programado',
      blocks: createDefaultBlocks(60),
      players: { attendees: [], absent: [], injured: [], differentiated: [] },
      loadControl: [],
      summary: { totalDuration: 0, playerCount: 0, averageLoad: 0, exercisesUsed: [], finalNotes: '' },
    },
  ]
}

export function createEmptyTraining(date = '', categoryId = DEFAULT_CATEGORY_ID) {
  return {
    id: generateTrainingId(),
    categoryId,
    name: '',
    date,
    time: '',
    duration: 90,
    field: '',
    category: 'Mixto',
    objective: '',
    intensity: 'Media',
    load: 'Media',
    playerCount: '',
    observations: '',
    notes: '',
    status: 'Programado',
    blocks: [],
    sessionExercises: [],
    players: {
      attendees: [],
      absent: [],
      injured: [],
      differentiated: [],
    },
    loadControl: [],
    staffIds: [],
    summary: {
      totalDuration: 0,
      playerCount: 0,
      averageLoad: 0,
      exercisesUsed: [],
      finalNotes: '',
    },
  }
}
