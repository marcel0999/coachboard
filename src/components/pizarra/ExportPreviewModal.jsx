import { useEffect, useRef, useState } from 'react'
import Modal from '../ui/Modal'
import Button from '../ui/Button'
import { FormField, Input } from '../ui/FormField'
import { exportBoardAsJpg, exportBoardAsPdf, exportBoardAsPng } from '../../utils/tacticalBoardExport'

export default function ExportPreviewModal({
  isOpen,
  onClose,
  exportElement,
  defaultTitle,
  categoryName,
  formation,
  onExportComplete,
}) {
  const previewRef = useRef(null)
  const [title, setTitle] = useState(defaultTitle)
  const [includeClub, setIncludeClub] = useState(true)
  const [includeCategory, setIncludeCategory] = useState(true)
  const [includeDate, setIncludeDate] = useState(true)
  const [includeStaff, setIncludeStaff] = useState(true)
  const [includeBench, setIncludeBench] = useState(true)
  const [observations, setObservations] = useState('')
  const [exporting, setExporting] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setTitle(defaultTitle)
    }
  }, [isOpen, defaultTitle])

  useEffect(() => {
    if (!isOpen || !exportElement || !previewRef.current) return
    previewRef.current.innerHTML = ''
    const clone = exportElement.cloneNode(true)
    clone.style.transform = 'scale(0.45)'
    clone.style.transformOrigin = 'top left'
    clone.style.width = `${exportElement.offsetWidth}px`
    previewRef.current.appendChild(clone)
  }, [isOpen, exportElement, title, includeClub, includeCategory, includeDate, includeStaff, includeBench, observations])

  const buildOptions = () => ({
    title,
    categoryName: includeCategory ? categoryName : null,
    formation: includeCategory ? formation : null,
    date: includeDate ? new Date().toLocaleDateString('es-UY') : null,
    includeClub,
    includeStaff,
    includeBench,
    observations,
  })

  const handleExport = async (format) => {
    if (!exportElement) return
    setExporting(true)
    try {
      const options = buildOptions()
      const filename = `${title}.${format}`
      if (format === 'png') await exportBoardAsPng(exportElement, filename, options)
      if (format === 'jpg') await exportBoardAsJpg(exportElement, filename, options)
      if (format === 'pdf') await exportBoardAsPdf(exportElement, filename, options)
      onExportComplete?.()
    } finally {
      setExporting(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Vista previa de exportación" size="xl">
      <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
        <div className="overflow-auto rounded-xl border border-slate-200 bg-slate-50 p-4">
          <div ref={previewRef} className="min-h-[200px] origin-top-left" />
        </div>

        <div className="space-y-4">
          <FormField label="Título">
            <Input value={title} onChange={(event) => setTitle(event.target.value)} />
          </FormField>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={includeClub} onChange={(e) => setIncludeClub(e.target.checked)} />
            Incluir nombre del club
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={includeCategory} onChange={(e) => setIncludeCategory(e.target.checked)} />
            Incluir categoría y formación
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={includeDate} onChange={(e) => setIncludeDate(e.target.checked)} />
            Incluir fecha
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={includeStaff} onChange={(e) => setIncludeStaff(e.target.checked)} />
            Incluir staff técnico
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={includeBench} onChange={(e) => setIncludeBench(e.target.checked)} />
            Incluir suplentes
          </label>
          <textarea
            value={observations}
            onChange={(event) => setObservations(event.target.value)}
            rows={3}
            placeholder="Observaciones..."
            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
          />

          <div className="flex flex-wrap gap-2">
            <Button disabled={exporting} onClick={() => handleExport('png')}>PNG</Button>
            <Button disabled={exporting} variant="secondary" onClick={() => handleExport('jpg')}>JPG</Button>
            <Button disabled={exporting} variant="secondary" onClick={() => handleExport('pdf')}>PDF</Button>
          </div>
        </div>
      </div>
    </Modal>
  )
}
