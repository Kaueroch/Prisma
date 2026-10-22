import { useState, useMemo } from 'react'
import { Search, ChevronDown, ChevronUp, ChevronLeft, ChevronRight, Plus, ReceiptText } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { resolveSymbol } from '../shared/components/CategorySymbol'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { motion, AnimatePresence } from 'motion/react'
import { useFinance } from '../finance/useFinance'
import { useTransactionForm } from '../finance/TransactionFormContext'
import { formatBRL, formatDateBR, matchesMonthFilter, formatMonthFilter } from '../shared/utils/formatters'
import { initialMonthFilter } from '../shared/services/prefsService'
import type { CategoryId, MonthFilter, Expense } from '../shared/types'

export function TransactionsPage() {
  const { expenses, categories } = useFinance()
  const { openTransactionForm } = useTransactionForm()
  const [searchQuery, setSearchQuery] = useState('')
  const [filterCategory, setFilterCategory] = useState<CategoryId | 'all'>('all')
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all')
  const [selectedMonth, setSelectedMonth] = useState<MonthFilter>(initialMonthFilter)
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [expandedId, setExpandedId] = useState<CategoryId | null>(null)
  const [expandedTxId, setExpandedTxId] = useState<string | null>(null)

  const goToPrevMonth = () => {
    setSelectedMonth(prev => {
      if (prev.month === 0) return { month: 11, year: prev.year - 1, all: false }
      return { month: prev.month - 1, year: prev.year, all: false }
    })
  }

  const goToNextMonth = () => {
    setSelectedMonth(prev => {
      if (prev.month === 11) return { month: 0, year: prev.year + 1, all: false }
      return { month: prev.month + 1, year: prev.year, all: false }
    })
  }

  const categoryGroups = useMemo(() => {
    const filtered = expenses.filter(e => {
      const matchSearch = e.name.toLowerCase().includes(searchQuery.toLowerCase())
      const matchCat = filterCategory === 'all' || e.categoryId === filterCategory
      const matchType = filterType === 'all' || e.type === filterType
      const matchMonth = matchesMonthFilter(e.date, selectedMonth)
      return matchSearch && matchCat && matchType && matchMonth
    })

    const groups: Record<string, { total: number; items: typeof filtered }> = {}

    for (const expense of filtered) {
      if (!groups[expense.categoryId]) {
        groups[expense.categoryId] = { total: 0, items: [] }
      }
      const group = groups[expense.categoryId]
      group.total += expense.amount
      group.items.push(expense)
    }

    Object.values(groups).forEach(g => {
      g.items.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    })

    return Object.entries(groups).map(([id, data]) => ({
      id: id as CategoryId,
      ...data,
    })).sort((a, b) => b.total - a.total)
  }, [expenses, searchQuery, filterCategory, filterType, selectedMonth])

  return (
    <div className="bg-page-grid flex-1 overflow-y-auto px-4 pt-9 pb-10 sm:px-6 lg:px-10">
      <div className="mb-7 flex flex-wrap items-end justify-between gap-6">
        <div className="flex flex-col gap-2.5">
          <span className="text-[13px] font-medium text-fg-muted">Atividade</span>
          <h1 className="font-display text-3xl leading-tight sm:text-5xl sm:leading-[52px] font-normal tracking-[-0.02em] text-fg">Transações</h1>
          <p className="text-[15px] text-fg-muted">Toda a sua movimentação em um só lugar.</p>
        </div>
        <button
          type="button"
          onClick={() => openTransactionForm()}
          className="flex items-center gap-2 rounded-lg bg-brand px-5 py-3.5 text-sm font-semibold text-black transition-colors hover:bg-brand-strong"
        >
          <Plus className="h-4 w-4" strokeWidth={2.2} />
          Nova transação
        </button>
      </div>

      {/* Filtros */}
      <div className="mb-6 flex flex-col gap-3">
        <div className="flex flex-col gap-3">
          <div className="relative h-9 border border-edge bg-surface">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-fg-subtle" />
            <Input
              placeholder="Buscar transações..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-full pl-9 rounded-lg border-0 bg-transparent text-fg placeholder:text-fg-subtle focus-visible:ring-0"
            />
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShowAdvanced(v => !v)}
          className="flex items-center gap-2 text-sm font-medium text-fg-muted hover:text-fg self-start"
        >
          {showAdvanced ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          Filtros avançados
        </button>

        <AnimatePresence>
          {showAdvanced && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="flex flex-col gap-3 overflow-hidden"
            >
              <Select value={filterCategory} onValueChange={(v) => setFilterCategory(v as CategoryId | 'all')}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Categoria">
                    {(value: string) => value === 'all' ? 'Todas as categorias' : (categories.find((c) => c.id === value)?.name || value)}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as categorias</SelectItem>
                  {categories.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={filterType} onValueChange={(v) => setFilterType(v as 'all' | 'income' | 'expense')}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Tipo">
                    {(value: string) => value === 'all' ? 'Todos os tipos' : value === 'income' ? 'Receitas' : 'Despesas'}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os tipos</SelectItem>
                  <SelectItem value="income">Receitas</SelectItem>
                  <SelectItem value="expense">Despesas</SelectItem>
                </SelectContent>
              </Select>

              <div className="flex flex-col items-stretch gap-2 bg-surface p-2 border border-edge">
                <div className="flex items-center justify-center gap-1">
                  {!selectedMonth.all && (
                    <Button variant="ghost" size="icon-sm" onClick={goToPrevMonth} className="rounded-lg">
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                  )}
                  <span className="text-xs px-2 min-w-[120px] text-center text-fg-muted capitalize tabular-nums">
                    {formatMonthFilter(selectedMonth)}
                  </span>
                  {!selectedMonth.all && (
                    <Button variant="ghost" size="icon-sm" onClick={goToNextMonth} className="rounded-lg">
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedMonth(prev => prev.all
                    ? { month: new Date().getMonth(), year: new Date().getFullYear(), all: false }
                    : { ...prev, all: true })}
                  className={`rounded-lg border px-3 py-1.5 text-[11px] font-semibold transition-colors ${
                    selectedMonth.all
                      ? 'border-brand bg-brand-soft text-brand'
                      : 'border-edge bg-transparent text-fg-muted hover:border-brand/40 hover:text-fg'
                  }`}
                >
                  {selectedMonth.all ? 'Por mês' : 'Todos'}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {categoryGroups.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-edge bg-surface/50 px-6 py-14 text-center">
          <span className="flex size-12 items-center justify-center rounded-2xl bg-brand-soft">
            <ReceiptText className="size-6 text-brand" strokeWidth={1.8} />
          </span>
          <p className="font-display text-xl text-fg">Nada por aqui ainda</p>
          <p className="max-w-xs text-sm text-fg-muted">Ajuste os filtros ou registre sua primeira transação do mês.</p>
          <button
            type="button"
            onClick={() => openTransactionForm()}
            className="mt-1 flex items-center gap-2 rounded-xl bg-brand px-5 py-2.5 text-sm font-semibold text-black transition-colors hover:bg-brand-strong"
          >
            <Plus className="size-4" strokeWidth={2.2} />
            Registrar transação
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-start">
          {categoryGroups.map(({ id, total, items }) => {
            const catInfo = categories.find(c => c.id === id) || { name: 'Sem categoria', color: '#666', icon: 'other' as const }
            const isExpanded = expandedId === id
            const { Icon: CatIcon } = resolveSymbol('icon' in catInfo ? catInfo.icon : undefined, catInfo.name)

            return (
              <Card
                key={id}
                className={`cursor-pointer rounded-xl border-edge bg-surface transition-colors ${isExpanded ? 'ring-1 ring-brand/40' : ''}`}
                onClick={() => setExpandedId(isExpanded ? null : id)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center"
                        style={{ backgroundColor: `${catInfo.color}20` }}
                      >
                        <CatIcon className="w-5 h-5" style={{ color: catInfo.color }} strokeWidth={2.2} aria-hidden />
                      </div>
                      <span className="font-semibold">{catInfo.name}</span>
                    </div>
                    <span className="flex items-center gap-1 text-xs font-medium text-muted-foreground">
                      {isExpanded ? 'Ver menos' : 'Ver mais'}
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </span>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold tracking-tight mb-3">
                    {formatBRL(total)}
                  </div>
                  <div className="flex flex-col gap-1 text-sm text-muted-foreground">
                    <p>{items.length} {items.length === 1 ? 'transação' : 'transações'}</p>
                  </div>
                </CardContent>

                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="border-t border-border overflow-hidden"
                    >
                      <div className="p-4 flex flex-col gap-3 max-h-72 overflow-y-auto bg-muted/20">
                        {items.map(expense => (
                          <div key={expense.id} className="flex flex-col gap-0.5">
                            <div className="flex items-start justify-between">
                              <span className="text-sm font-medium">{expense.name}</span>
                              <span className={`text-sm font-medium ${expense.type === 'income' ? 'text-positive' : 'text-negative'}`}>
                                {expense.type === 'income' ? '+' : '-'}{formatBRL(expense.amount)}
                              </span>
                            </div>
                            <span className="text-[12px] text-muted-foreground">
                              {formatDateBR(expense.date, { day: '2-digit', month: 'short' })}
                            </span>
                            {expense.note && (
                              <span className="text-[12px] text-fg-muted italic">
                                Obs.: {expense.note}
                              </span>
                            )}
                            <button
                              type="button"
                              onClick={(e) => { e.stopPropagation(); setExpandedTxId(expandedTxId === expense.id ? null : expense.id) }}
                              className="mt-1 self-start text-[11px] font-semibold text-brand hover:underline"
                            >
                              Ver detalhes
                            </button>
                            <AnimatePresence>
                              {expandedTxId === expense.id && (
                                <motion.div
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: 'auto', opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  transition={{ duration: 0.2 }}
                                  className="mt-2 rounded-lg border border-edge bg-surface p-3 text-sm"
                                >
                                  <div className="flex justify-between gap-4">
                                    <span className="text-muted-foreground">Tipo</span>
                                    <span className="font-medium">{expense.type === 'income' ? 'Receita' : 'Despesa'}</span>
                                  </div>
                                  <div className="flex justify-between gap-4">
                                    <span className="text-muted-foreground">Data</span>
                                    <span className="font-medium">{formatDateBR(expense.date)}</span>
                                  </div>
                                  <div className="flex justify-between gap-4">
                                    <span className="text-muted-foreground">Categoria</span>
                                    <span className="font-medium">{catInfo.name}</span>
                                  </div>
                                  {expense.note && (
                                    <div className="flex flex-col gap-1 mt-2">
                                      <span className="text-muted-foreground">Observação</span>
                                      <span className="font-medium">{expense.note}</span>
                                    </div>
                                  )}
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}