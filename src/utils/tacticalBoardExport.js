import html2canvas from 'html2canvas'
import { jsPDF } from 'jspdf'

async function captureElement(element) {
  return html2canvas(element, {
    backgroundColor: '#ffffff',
    scale: 2,
    useCORS: true,
  })
}

function buildHeaderLines(options = {}) {
  const lines = []
  if (options.title) lines.push(options.title)
  if (options.includeClub && options.clubName) lines.push(options.clubName)
  if (options.categoryName) lines.push(`Categoría: ${options.categoryName}`)
  if (options.formation) lines.push(`Formación: ${options.formation}`)
  if (options.date) lines.push(`Fecha: ${options.date}`)
  if (options.observations) lines.push(`Observaciones: ${options.observations}`)
  return lines
}

export async function exportBoardAsPng(element, filename = 'pizarra-tactica.png', options = {}) {
  const canvas = await captureElement(element)
  const link = document.createElement('a')
  link.download = filename
  link.href = canvas.toDataURL('image/png')
  link.click()
}

export async function exportBoardAsJpg(element, filename = 'pizarra-tactica.jpg', options = {}) {
  const canvas = await captureElement(element)
  const link = document.createElement('a')
  link.download = filename
  link.href = canvas.toDataURL('image/jpeg', 0.92)
  link.click()
}

export async function exportBoardAsPdf(
  element,
  filename = 'pizarra-tactica.pdf',
  title = 'Pizarra Táctica',
  options = {},
) {
  const canvas = await captureElement(element)
  const imgData = canvas.toDataURL('image/png')
  const headerLines = buildHeaderLines({ title, ...options })
  const headerHeight = 24 + headerLines.length * 16
  const orientation = canvas.width >= canvas.height ? 'landscape' : 'portrait'
  const pdf = new jsPDF({
    orientation,
    unit: 'px',
    format: [canvas.width, canvas.height + headerHeight],
  })

  pdf.setFontSize(14)
  headerLines.forEach((line, index) => {
    pdf.text(line, 24, 24 + index * 16)
  })

  pdf.addImage(imgData, 'PNG', 0, headerHeight, canvas.width, canvas.height)
  pdf.save(filename)
}
