export function statusToVariant(status) {
  switch (status) {
    case 'Disponible':
      return 'success'
    case 'Lesionado':
      return 'danger'
    case 'Suspendido':
    case 'Suspensión':
      return 'warning'
    default:
      return 'default'
  }
}
