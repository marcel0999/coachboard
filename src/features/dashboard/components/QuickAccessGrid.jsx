import { ArrowRight } from 'lucide-react'
import { Card } from '../../../components/ui/Card'
import SectionHeader from '../../../components/ui/SectionHeader'
import { ButtonLink } from '../../../components/ui/Button'

export default function QuickAccessGrid({ items }) {
  if (!items.length) return null

  return (
    <Card>
      <SectionHeader title="Accesos rápidos" />
      <div className="grid gap-2 sm:grid-cols-2">
        {items.map((item) => (
          <ButtonLink
            key={item.path}
            to={item.path}
            variant="ghost"
            className="h-auto w-full justify-between rounded-xl border border-slate-200/60 px-4 py-3.5 hover:bg-surface-muted"
          >
            <span className="text-left">
              <span className="block font-semibold text-text-primary">{item.label}</span>
              <span className="block text-xs font-normal text-text-muted">{item.description}</span>
            </span>
            <ArrowRight className="h-4 w-4 shrink-0 text-text-muted" />
          </ButtonLink>
        ))}
      </div>
    </Card>
  )
}
