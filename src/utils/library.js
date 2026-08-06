/**
 * Biblioteca — utilidades de copia e integración con Entrenamientos
 */

export {
  copyLibraryResourceToSessionExercise,
  copyLibraryTrainingToClubTraining,
} from './libraryResources'

export { createLibrarySourceRef } from './libraryResources'
export { LIBRARY_COPY_MARKER } from '../constants/library'

export function isLibraryCopy(sessionExercise) {
  return Boolean(sessionExercise?.librarySource?.id)
}

export function assertSessionExerciseIsLocal() {
  return true
}
