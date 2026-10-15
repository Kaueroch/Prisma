import { useState, useMemo } from 'react'
import { Search, ChevronDown, ChevronUp, ChevronLeft, ChevronRight, Plus } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
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
import { formatBRL, formatDateBR, formatMonthYear, getCurrentMonth, isSameMonth } from '../shared/utils/formatters'
import type { CategoryId, MonthFilter } from '../shared/types'

export function TransactionsPage() {
  const { expenses, categories } = useFinance()
  const { openTransactionForm } = useTransactionForm()
  const [searchQuery, setSearchQuery] = useState('')
  const [filterCategory, setFilterCategory] = useState<CategoryId | 'all'>('all')
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all')
  const [expandedId, setExpandedId] = useState<CategoryId | null>(null)
  const [selectedMonth, setSelectedMonth] = useState<MonthFilter>(getCurrentMonth())

  const goToPrevMonth = () => {
    setSelectedMonth(prev => {
      if (prev.month === 0) return { month: 11, year: prev.year - 1 }
      return { month: prev.month - 1, year: prev.year }
    })
  }

  const goToNextMonth = () => {
    setSelectedMonth(prev => {
      if (prev.month === 11) return { month: 0, year: prev.year + 1 }
      return { month: prev.month + 1, year: prev.year }
    })
  }

  const categoryGroups = useMemo(() => {
    const filtered = expenses.filter(e => {
      const matchSearch = e.name.toLowerCase().includes(searchQuery.toLowerCase())
      const matchCat = filterCategory === 'all' || e.categoryId === filterCategory
      const matchType = filterType === 'all' || e.type === filterType
      const matchMonth = isSameMonth(e.date, selectedMonth.month, selectedMonth.year)
      return matchSearch && matchCat && matchType && matchMonth
    })

    const groups: Record<string, { total: number; maxExpense: typeof filtered[0] | null; items: typeof filtered }> = {}

    for (const expense of filtered) {
      if (!groups[expense.categoryId]) {
        groups[expense.categoryId] = { total: 0, maxExpense: null, items: [] }
      }
      const group = groups[expense.categoryId]
      group.total += expense.amount
      group.items.push(expense)
      if (!group.maxExpense || expense.amount > group.maxExpense.amount) {
        group.maxExpense = expense
      }
    }

    Object.values(groups).forEach(g => {
      g.items.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    })

    return Object.entries(groups).map(([id, data]) => ({
      id: id as CategoryId,
      ...data
    })).sort((a, b) => b.total - a.total)
  }, [expenses, searchQuery, filterCategory, filterType, selectedMonth])

  return (
    <div className="bg-page-grid flex-1 overflow-y-auto px-4 pt-9 pb-10 sm:px-6 lg:px-10">
      <div className="mb-7 flex flex-wrap items-end justify-between gap-6">
        <div className="flex flex-col gap-2.5">
          <span className="text-[13px] font-medium text-fg-muted">Activity</span>
          <h1 className="font-display text-5xl leading-[52px] font-normal tracking-[-0.02em] text-fg">Transactions</h1>
          <p className="text-[15px] text-fg-muted">All your financial activity in one place.</p>
        </div>
        <button
          type="button"
          onClick={() => openTransactionForm()}
          className="flex items-center gap-2 rounded-lg bg-brand px-5 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-brand-strong"
        >
          <Plus className="h-4 w-4" strokeWidth={2.2} />
          New transaction
        </button>
      </div>

      <div className="mb-6 flex flex-col md:flex-row gap-3">
        <div className="flex-1 relative border border-edge bg-surface">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-fg-subtle" />
          <Input
            placeholder="Search transactions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 rounded-lg border-0 bg-transparent text-fg placeholder:text-fg-subtle focus-visible:ring-0"
          />
        </div>
        <div className="flex gap-4">
          <Select value={filterCategory} onValueChange={(v) => setFilterCategory(v as CategoryId | 'all')}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              {categories.map((c) => (
                <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={filterType} onValueChange={(v) => setFilterType(v as 'all' | 'income' | 'expense')}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="income">Income</SelectItem>
              <SelectItem value="expense">Expenses</SelectItem>
            </SelectContent>
          </Select>
          <div className="flex items-center gap-1 bg-surface p-1 border border-edge">
            <Button variant="ghost" size="icon-sm" onClick={goToPrevMonth} className="rounded-lg">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-xs px-2 min-w-[120px] text-center text-fg-muted capitalize tabular-nums">
              {formatMonthYear(selectedMonth.month, selectedMonth.year)}
            </span>
            <Button variant="ghost" size="icon-sm" onClick={goToNextMonth} className="rounded-lg">
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {categoryGroups.length === 0 ? (
        <div className="flex flex-col items-center gap-2 border border-dashed border-edge px-6 py-12 text-center">
          <p className="text-sm text-fg-muted">No transactions found.</p>
          <p className="text-xs text-fg-subtle">Adjust the filters or log a new one.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-start">
          {categoryGroups.map(({ id, total, maxExpense, items }) => {
            const catInfo = categories.find(c => c.id === id) || { name: 'Unknown', color: '#666', icon: 'other' as const }
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
                    {isExpanded ? (
                      <ChevronUp className="w-5 h-5 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-muted-foreground" />
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold tracking-tight mb-3">
                    {formatBRL(total)}
                  </div>
                  <div className="flex flex-col gap-1 text-sm text-muted-foreground">
                    {maxExpense && (
                      <p className="truncate">
                        Largest expense:{' '}
                        <span className="font-medium text-foreground/60">
                          {formatBRL(maxExpense.amount)}
                        </span>{' '}
                        ({maxExpense.name})
                      </p>
                    )}
                    <p>{items.length} {items.length === 1 ? 'transaction' : 'transactions'}</p>
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
                              <span className={`text-sm font-medium ${expense.type === 'income' ? 'text-emerald-300' : ''}`}>
                                {expense.type === 'income' ? '+' : '-'}{formatBRL(expense.amount)}
                              </span>
                            </div>
                            <span className="text-[12px] text-muted-foreground">
                              {formatDateBR(expense.date, { day: '2-digit', month: 'short' })}
                            </span>
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
