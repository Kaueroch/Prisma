import { useState, useMemo } from 'react'
import { Search, ChevronDown, ChevronUp, Grid, ChevronLeft, ChevronRight, Plus } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
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
  }, [expenses, searchQuery, filterCategory, filterType])

  return (
    <div className="p-6 lg:p-8 max-w-[1400px] mx-auto w-full space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Transações</h1>
          <p className="text-muted-foreground text-sm mt-1">Toda a sua atividade financeira centralizada em um só lugar.</p>
        </div>
        <Button onClick={() => openTransactionForm()}>
          <Plus className="mr-2 h-4 w-4" />
          Nova Transação
        </Button>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar transação..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex gap-4">
          <Select value={filterCategory} onValueChange={(v) => setFilterCategory(v as CategoryId | 'all')}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Categoria" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              {categories.map((c) => (
                <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={filterType} onValueChange={(v) => setFilterType(v as 'all' | 'income' | 'expense')}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="income">Receitas</SelectItem>
              <SelectItem value="expense">Despesas</SelectItem>
            </SelectContent>
          </Select>
          <div className="flex items-center gap-1 bg-muted rounded-lg p-1 border border-border">
            <Button variant="ghost" size="icon-sm" onClick={goToPrevMonth}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm font-medium px-2 min-w-[120px] text-center">
              {formatMonthYear(selectedMonth.month, selectedMonth.year)}
            </span>
            <Button variant="ghost" size="icon-sm" onClick={goToNextMonth}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {categoryGroups.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            Nenhuma transação encontrada.
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-start">
          {categoryGroups.map(({ id, total, maxExpense, items }) => {
            const catInfo = categories.find(c => c.id === id) || { name: 'Desconhecido', color: '#666' }
            const isExpanded = expandedId === id
            const isIncome = items[0]?.type === 'income'

            return (
              <Card
                key={id}
                className={`cursor-pointer transition-all ${isExpanded ? 'ring-1 ring-ring' : ''}`}
                onClick={() => setExpandedId(isExpanded ? null : id)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center"
                        style={{ backgroundColor: `${catInfo.color}20` }}
                      >
                        <Grid className="w-5 h-5" style={{ color: catInfo.color }} strokeWidth={2.5} />
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
                        Maior gasto:{' '}
                        <span className="font-medium text-foreground/60">
                          {formatBRL(maxExpense.amount)}
                        </span>{' '}
                        ({maxExpense.name})
                      </p>
                    )}
                    <p>{items.length} transaç{items.length === 1 ? 'ão' : 'ões'}</p>
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
                              <span className={`text-sm font-medium ${expense.type === 'income' ? 'text-lime-400/90' : ''}`}>
                                {expense.type === 'income' ? '+' : '-'}{formatBRL(expense.amount)}
                              </span>
                            </div>
                            <span className="text-[11px] text-muted-foreground uppercase tracking-wider">
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
