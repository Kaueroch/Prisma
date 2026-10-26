import {
  Briefcase,
  Car,
  Gamepad2,
  GraduationCap,
  HeartPulse,
  House,
  Plane,
  Receipt,
  ShoppingBag,
  ShoppingCart,
  Tag,
  UtensilsCrossed,
  type LucideIcon,
} from 'lucide-react'
import { cn } from '@/lib/utils'

/**
 * Category symbols — user-chosen, frontend-only (the backend CategoriaDTO
 * has no symbol field, so this is never part of any payload).
 */

export interface CategorySymbolOption {
  id: string
  label: string
  Icon: LucideIcon
}

export const CATEGORY_SYMBOLS: CategorySymbolOption[] = [
  { id: 'food', label: 'Comida', Icon: UtensilsCrossed },
  { id: 'groceries', label: 'Mercado', Icon: ShoppingCart },
  { id: 'transport', label: 'Transporte', Icon: Car },
  { id: 'home', label: 'Casa', Icon: House },
  { id: 'bills', label: 'Contas', Icon: Receipt },
  { id: 'health', label: 'Saúde', Icon: HeartPulse },
  { id: 'leisure', label: 'Lazer', Icon: Gamepad2 },
  { id: 'travel', label: 'Viagem', Icon: Plane },
  { id: 'shopping', label: 'Compras', Icon: ShoppingBag },
  { id: 'education', label: 'Educação', Icon: GraduationCap },
  { id: 'work', label: 'Trabalho', Icon: Briefcase },
  { id: 'other', label: 'Outros', Icon: Tag },
]

const byId = new Map(CATEGORY_SYMBOLS.map((s) => [s.id, s]))

/** Stable fallback derived from the name, for categories saved before symbols existed. */
export function symbolicCategorySymbol(name: string): string {
  const key = name.trim().toLowerCase() || '?'
  let hash = 0
  for (let i = 0; i < key.length; i++) {
    hash = (hash * 31 + key.charCodeAt(i)) >>> 0
  }
  return CATEGORY_SYMBOLS[hash % CATEGORY_SYMBOLS.length].id
}

/** Resolve a stored symbol id (or legacy name) to its option. */
export function resolveSymbol(id?: string, fallbackName = '?'): CategorySymbolOption {
  return byId.get(id ?? '') ?? byId.get(symbolicCategorySymbol(fallbackName))!
}

/** Avatar box: solid category color with a dark symbol. */
export function CategorySymbol({
  symbol,
  color,
  name,
  className,
  iconClassName,
}: {
  symbol?: string
  color: string
  name?: string
  className?: string
  iconClassName?: string
}) {
  const { Icon } = resolveSymbol(symbol, name)
  return (
    <span
      className={cn('flex items-center justify-center rounded-xl shrink-0', className)}
      style={{ backgroundColor: color }}
      aria-hidden
    >
      <Icon className={cn('text-black/75', iconClassName)} strokeWidth={2.2} />
    </span>
  )
}
