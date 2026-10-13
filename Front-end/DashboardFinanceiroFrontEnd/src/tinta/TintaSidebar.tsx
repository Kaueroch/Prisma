import { ArrowLeftRight, Tags, Settings, LogOut, TrendingUp, LayoutGrid, type LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Tab } from '../shared/types'
import { useAuth } from '../auth/AuthContext'

const NAV: { icon: LucideIcon; label: string; tab: Tab }[] = [
  { icon: LayoutGrid, label: 'Dashboard', tab: 'home' },
  { icon: ArrowLeftRight, label: 'Transactions', tab: 'transactions' },
  { icon: Tags, label: 'Categories', tab: 'categories' },
]

function NavButton({
  icon: Icon,
  label,
  active,
  onClick,
}: {
  icon: LucideIcon
  label: string
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      aria-current={active ? 'page' : undefined}
      onClick={onClick}
      className={cn(
        'relative flex h-12 w-full items-center justify-center transition-colors duration-150',
        active ? 'bg-brand-soft text-brand' : 'text-fg-subtle hover:text-fg',
      )}
    >
      {active && <span aria-hidden className="absolute inset-y-0 left-0 w-[3px] bg-brand" />}
      <Icon className="size-5" strokeWidth={1.8} />
    </button>
  )
}

/** Tinta 72px sidebar icon-only — ported from money-flow. */
export function TintaSidebar({
  active,
  onNavigate,
}: {
  active: Tab
  onNavigate: (tab: Tab) => void
}) {
  const { logout } = useAuth()
  return (
    <aside className="flex w-[72px] shrink-0 flex-col items-center gap-8 border-r border-edge bg-[#0b0d12] py-6">
      <div className="flex size-7 items-center justify-center bg-brand">
        <TrendingUp className="size-4 text-black" strokeWidth={2.6} />
      </div>
      <nav className="flex w-full flex-1 flex-col">
        {NAV.map(({ icon: Icon, label, tab }) => (
          <div key={tab}>
            <NavButton icon={Icon} label={label} active={active === tab} onClick={() => onNavigate(tab)} />
          </div>
        ))}
      </nav>
      <div className="flex w-full flex-col">
        <NavButton
          icon={Settings}
          label="Settings"
          active={active === 'profile'}
          onClick={() => onNavigate('profile')}
        />
        <button
          type="button"
          title="Sign out"
          aria-label="Sign out"
          onClick={logout}
          className="flex h-12 w-full items-center justify-center text-fg-subtle transition-colors duration-150 hover:text-negative"
        >
          <LogOut className="size-5" strokeWidth={1.8} />
        </button>
      </div>
    </aside>
  )
}
