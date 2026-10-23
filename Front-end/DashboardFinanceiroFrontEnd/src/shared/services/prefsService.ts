import type { MonthFilter, TransactionType } from '../types'

/** Preferências do usuário: carregadas a cada visita (localStorage). */

const STORAGE_KEY = 'prisma_prefs_v1'

export interface Prefs {
  /** Nome exibido na saudação do painel (vazio = usa o nome da conta). */
  displayName: string
  /** Painel abre com os valores ocultos. */
  maskByDefault: boolean
  /** Sidebar abre expandida. */
  sidebarExpanded: boolean
  /** Tipo pré-selecionado ao abrir o formulário sem contexto. */
  defaultTxType: TransactionType
  /** Mês inicial das telas: atual ou anterior. */
  startMonth: 'current' | 'previous'
}

const DEFAULTS: Prefs = {
  displayName: '',
  maskByDefault: false,
  sidebarExpanded: false,
  defaultTxType: 'expense',
  startMonth: 'current',
}

export function getPrefs(): Prefs {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { ...DEFAULTS }
    return { ...DEFAULTS, ...(JSON.parse(raw) as Partial<Prefs>) }
  } catch {
    return { ...DEFAULTS }
  }
}

export function savePrefs(patch: Partial<Prefs>): Prefs {
  const next = { ...getPrefs(), ...patch }
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  } catch {
    // ignore (private mode)
  }
  return next
}

/** Mês inicial respeitando a preferência (usado no Painel e em Transações). */
export function initialMonthFilter(): MonthFilter {
  const now = new Date()
  if (getPrefs().startMonth === 'previous') {
    if (now.getMonth() === 0) return { month: 11, year: now.getFullYear() - 1 }
    return { month: now.getMonth() - 1, year: now.getFullYear() }
  }
  return { month: now.getMonth(), year: now.getFullYear() }
}

/** Chaves de dados locais (exportar/apagar nas Configurações). */
const DATA_KEYS = [
  'finance_dashboard_expenses',
  'finance_dashboard_categories',
  'prisma_goals_v1',
  'prisma_prefs_v1',
  'prisma:mask',
  'prisma_sidebar_expanded',
]

export function exportLocalData(): string {
  const dump: Record<string, unknown> = {}
  for (const key of DATA_KEYS) {
    const raw = localStorage.getItem(key)
    if (raw === null) continue
    try {
      dump[key] = JSON.parse(raw)
    } catch {
      dump[key] = raw
    }
  }
  return JSON.stringify({ app: 'prisma-finance', exportedAt: new Date().toISOString(), data: dump }, null, 2)
}

export function clearLocalData(): void {
  for (const key of DATA_KEYS) localStorage.removeItem(key)
}
