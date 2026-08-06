import { generateRecordId } from './playerFactory'

export function createFreeMarkerAt(point, playerId, playerLabel) {
  return {
    id: generateRecordId('marker'),
    slotId: null,
    label: playerLabel,
    x: point.x,
    y: point.y,
    playerId,
    onPitch: true,
    team: 'own',
  }
}
