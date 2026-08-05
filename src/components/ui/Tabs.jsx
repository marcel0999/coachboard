export default function Tabs({ tabs, activeTab, onChange }) {
  return (
    <div className="border-b border-slate-200">
      <nav className="-mb-px flex gap-1 overflow-x-auto" aria-label="Pestañas">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onChange(tab.id)}
              className={[
                'shrink-0 border-b-2 px-4 py-3 text-sm font-medium transition',
                isActive
                  ? 'border-accent text-accent'
                  : 'border-transparent text-text-secondary hover:border-slate-300 hover:text-text-primary',
              ].join(' ')}
            >
              {tab.label}
            </button>
          )
        })}
      </nav>
    </div>
  )
}
