import { useEffect, useState } from 'react'
import { ArrowLeftRight, Tags, Target, Settings, LogOut, TrendingUp, LayoutGrid, ChevronsLeft, ChevronsRight, type LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Tab } from '../shared/types'
import { useAuth } from '../auth/AuthContext'
import { getPrefs } from '../shared/services/prefsService'

const STORAGE_KEY = 'prisma_sidebar_expanded'

const NAV: { icon: LucideIcon; label: string; tab: Tab }[] = [
  { icon: LayoutGrid, label: 'Painel', tab: 'home' },
  { icon: ArrowLeftRight, label: 'Transações', tab: 'transactions' },
  { icon: Tags, label: 'Categorias', tab: 'categories' },
  { icon: Target, label: 'Metas', tab: 'goals' },
]

function NavButton({
  icon: Icon,
  label,
  active,
  expanded,
  onClick,
}: {
  icon: LucideIcon
  label: string
  active: boolean
  expanded: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      title={expanded ? undefined : label}
      aria-label={label}
      aria-current={active ? 'page' : undefined}
      onClick={onClick}
      className={cn(
        'relative flex h-11 w-full items-center gap-3 transition-all duration-150 outline-none',
        'focus-visible:ring-2 focus-visible:ring-brand',
        expanded
          ? 'justify-start rounded-xl px-3.5 mx-2 w-[calc(100%-16px)]'
          : 'justify-center rounded-xl mx-auto w-11',
        active
          ? 'bg-brand text-black'
          : 'text-fg-subtle hover:bg-white/[0.04] hover:text-fg',
      )}
    >
      <Icon className="size-5 shrink-0" strokeWidth={1.9} aria-hidden />
      {expanded && (
        <span className="truncate text-sm font-medium">{label}</span>
      )}
    </button>
  )
}

/** Tinta sidebar expansível: 72px só-ícones ↔ 232px com labels. */
export function TintaSidebar({
  active,
  onNavigate,
}: {
  active: Tab
  onNavigate: (tab: Tab) => void
}) {
  const { logout } = useAuth()
  const [expanded, setExpanded] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored !== null) return stored === 'true'
      return getPrefs().sidebarExpanded
    } catch {
      return false
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, String(expanded))
    } catch {
      // ignore (private mode)
    }
  }, [expanded])

  // Acessibilidade: Esc recolhe a sidebar quando expandida.
  useEffect(() => {
    if (!expanded) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setExpanded(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [expanded])

  const toggleLabel = expanded ? 'Recolher menu lateral' : 'Expandir menu lateral'

  return (
    <aside
      aria-label="Menu lateral"
      className={cn(
        'flex shrink-0 flex-col items-stretch gap-7 border-r border-edge bg-[#0d100e] py-5 transition-[width] duration-200 ease-out',
        expanded ? 'w-[232px]' : 'w-[76px] items-center',
      )}
    >
      <div className={cn('flex items-center', expanded ? 'justify-start gap-3 px-4' : 'justify-center')}>
        <div className="group flex size-9 shrink-0 items-center justify-center rounded-xl bg-brand transition-transform duration-200 hover:scale-105" aria-hidden>
          <TrendingUp className="size-4 text-white" strokeWidth={2.6} />
        </div>
        {expanded && (
          <span className="truncate text-base font-bold tracking-tight text-fg">Prisma</span>
        )}
      </div>
      <nav id="tinta-sidebar-nav" aria-label="Navegação principal" className="flex w-full flex-1 flex-col gap-1.5">
        {expanded && (
          <p aria-hidden className="px-4 pb-1 text-[13px] font-medium text-fg-subtle">
            Menu
          </p>
        )}
        {NAV.map(({ icon: Icon, label, tab }) => (
          <div key={tab}>
            <NavButton icon={Icon} label={label} expanded={expanded} active={active === tab} onClick={() => onNavigate(tab)} />
          </div>
        ))}
      </nav>
      <div className="flex w-full flex-col gap-1.5">
        {expanded && (
          <p aria-hidden className="px-4 pb-1 text-[13px] font-medium text-fg-subtle">
            Sistema
          </p>
        )}
        <NavButton
          icon={Settings}
          label="Configurações"
          expanded={expanded}
          active={active === 'profile'}
          onClick={() => onNavigate('profile')}
        />
        <button
          type="button"
          title={expanded ? undefined : 'Sair'}
          aria-label="Sair"
          onClick={logout}
          className={cn(
            'flex h-11 w-full items-center gap-3 text-fg-subtle transition-all duration-150 outline-none hover:bg-white/[0.04] hover:text-fg',
            'focus-visible:ring-2 focus-visible:ring-brand',
            expanded ? 'justify-start rounded-xl px-3.5 mx-2 w-[calc(100%-16px)]' : 'justify-center rounded-xl mx-auto w-11',
          )}
        >
          <LogOut className="size-5 shrink-0" strokeWidth={1.8} aria-hidden />
          {expanded && <span className="truncate text-sm font-medium">Sair</span>}
        </button>
        <div className={cn('mt-4 flex', expanded ? 'justify-end px-3' : 'justify-center')}>
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            aria-expanded={expanded}
            aria-controls="tinta-sidebar-nav"
            aria-label={toggleLabel}
            title={toggleLabel}
            className="flex size-9 items-center justify-center rounded-lg border border-edge text-fg-subtle outline-none transition-colors hover:bg-brand-soft hover:text-brand focus-visible:ring-2 focus-visible:ring-brand"
          >
            {expanded ? (
              <ChevronsLeft className="size-4" aria-hidden />
            ) : (
              <ChevronsRight className="size-4" aria-hidden />
            )}
          </button>
        </div>
      </div>
    </aside>
  )
}
