import { Lock } from 'lucide-react'
import { LIBRARY_SECTIONS } from '../../constants/library'

export default function LibrarySectionNav({ activeSection, onChange }) {
  return (
    <nav className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin">
      {LIBRARY_SECTIONS.map((section) => {
        const isActive = activeSection === section.id
        return (
          <button
            key={section.id}
            type="button"
            onClick={() => onChange(section.id)}
            className={[
              'flex shrink-0 items-center gap-1.5 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all',
              isActive
                ? 'bg-accent text-white shadow-sm shadow-accent/20'
                : 'bg-surface-elevated text-text-secondary ring-1 ring-slate-200/70 hover:text-text-primary hover:ring-slate-300',
              !section.available && !isActive ? 'opacity-80' : '',
            ].join(' ')}
          >
            {section.label}
            {!section.available && (
              <Lock className="h-3 w-3 opacity-60" aria-hidden />
            )}
          </button>
        )
      })}
    </nav>
  )
}
