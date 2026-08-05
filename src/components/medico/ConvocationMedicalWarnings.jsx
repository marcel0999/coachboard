import { AlertTriangle } from 'lucide-react'
import { getConvocationMedicalSummary } from '../../utils/medicalCenter'

export default function ConvocationMedicalWarnings({ match, players, categories = [] }) {
  const summary = getConvocationMedicalSummary(match, players, new Date(), categories)

  if (summary.warnings.length === 0) {
    return null
  }

  return (
    <div className="mt-4 space-y-2">
      {summary.warnings.map((warning) => (
        <div
          key={warning.message}
          className={`flex items-start gap-2 rounded-xl border px-4 py-3 text-sm ${
            warning.variant === 'danger'
              ? 'border-red-200 bg-red-50 text-red-800'
              : 'border-amber-200 bg-amber-50 text-amber-900'
          }`}
        >
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{warning.message}</span>
        </div>
      ))}
    </div>
  )
}
