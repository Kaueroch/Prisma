import { useState, useMemo } from 'react'
import { ArrowDownLeft, ArrowUpRight, Download, CheckCircle2, ChevronLeft, ChevronRight, Wallet, Users } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useFinance } from '../finance/useFinance'
import { formatBRL, formatDateBR, formatMonthYear, getCurrentMonth, isSameMonth } from '../shared/utils/formatters'
import { AddExpenseForm } from '../transactions/components/AddExpenseForm'
import { DonutChart } from './components/DonutChart'
import type { Tab, TransactionType, MonthFilter } from '../shared/types'

interface HomePageProps {
  setActiveTab?: (tab: Tab) => void;
}

export function HomePage({ setActiveTab }: HomePageProps = {}) {
  const { expenses, categories, addExpense, contacts } = useFinance()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalType, setModalType] = useState<TransactionType>('income')
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

  const filteredExpenses = useMemo(() => {
    return expenses.filter(e => isSameMonth(e.date, selectedMonth.month, selectedMonth.year))
  }, [expenses, selectedMonth])

  const filteredIncomes = useMemo(() => filteredExpenses.filter(e => e.type === 'income'), [filteredExpenses])
  const filteredOutcomes = useMemo(() => filteredExpenses.filter(e => e.type === 'expense'), [filteredExpenses])

  const totalIncome = useMemo(() => filteredIncomes.reduce((sum, item) => sum + item.amount, 0), [filteredIncomes])
  const totalExpense = useMemo(() => filteredOutcomes.reduce((sum, item) => sum + item.amount, 0), [filteredOutcomes])
  const balance = totalIncome - totalExpense

  const recentActivity = useMemo(() => {
    return [...filteredExpenses].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 6)
  }, [filteredExpenses])

  const chartData = useMemo(() => {
    const expenseByCategory: Record<string, { name: string; value: number; color: string }> = {}
    filteredOutcomes.forEach(e => {
      const cat = categories.find(c => c.id === e.categoryId)
      const name = cat?.name || 'Sem categoria'
      if (!expenseByCategory[name]) {
        expenseByCategory[name] = { name, value: 0, color: cat?.color || '#666' }
      }
      expenseByCategory[name].value += e.amount
    })
    return Object.values(expenseByCategory)
  }, [filteredOutcomes, categories])

  return (
    <div className="p-6 lg:p-8 gap-6 flex flex-col max-w-[1400px] mx-auto w-full">
      <div className="bg-card rounded-2xl p-6 flex flex-col md:flex-row justify-between items-start md:items-center border border-border relative overflow-hidden">
        <div className="flex flex-col gap-1">
          <span className="text-muted-foreground text-xs font-medium uppercase tracking-wider">Saldo Atual</span>
          <h1 className="text-4xl font-bold tracking-tight">{formatBRL(balance)}</h1>
          <div className="flex items-center gap-2 mt-4">
            <Button
              onClick={() => { setModalType('income'); setIsModalOpen(true) }}
              size="sm"
              className="rounded-full h-8"
            >
              <ArrowDownLeft className="mr-1.5 h-3.5 w-3.5" />
              Receber
            </Button>
            <Button
              onClick={() => { setModalType('expense'); setIsModalOpen(true) }}
              variant="secondary"
              size="sm"
              className="rounded-full h-8"
            >
              <ArrowUpRight className="mr-1.5 h-3.5 w-3.5" />
              Transferir
            </Button>
          </div>
        </div>
        <div className="flex items-center gap-2 mt-4 md:mt-0">
          <div className="flex items-center gap-1 bg-muted rounded-lg p-0.5 border border-border">
            <Button variant="ghost" size="icon-xs" onClick={goToPrevMonth}>
              <ChevronLeft className="h-3.5 w-3.5" />
            </Button>
            <span className="text-xs font-medium px-2 min-w-[110px] text-center text-muted-foreground">
              {formatMonthYear(selectedMonth.month, selectedMonth.year)}
            </span>
            <Button variant="ghost" size="icon-xs" onClick={goToNextMonth}>
              <ChevronRight className="h-3.5 w-3.5" />
            </Button>
          </div>
          <Button variant="ghost" size="icon-sm" className="rounded-lg">
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center gap-3 pb-3">
            <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center">
              <ArrowDownLeft className="w-5 h-5 text-green-500" />
            </div>
            <div className="text-sm text-muted-foreground font-medium">Receitas Totais</div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatBRL(totalIncome)}</div>
            <p className="text-green-400 text-xs mt-1 font-medium flex items-center gap-1">
              <ArrowUpRight className="w-3 h-3" />
              Em dia
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center gap-3 pb-3">
            <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center">
              <ArrowUpRight className="w-5 h-5 text-orange-500" />
            </div>
            <div className="text-sm text-muted-foreground font-medium">Despesas Totais</div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatBRL(totalExpense)}</div>
            <p className="text-muted-foreground text-xs mt-1 font-medium">{formatMonthYear(selectedMonth.month, selectedMonth.year)}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center gap-3 pb-3">
            <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center">
              <Wallet className="w-5 h-5 text-foreground" />
            </div>
            <div className="text-sm text-muted-foreground font-medium">Economia (Líquido)</div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatBRL(totalIncome - totalExpense)}</div>
            <p className="text-muted-foreground text-xs mt-1 font-medium">Disponível para Metas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center gap-3 pb-3">
            <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center">
              <Users className="w-5 h-5 text-foreground" />
            </div>
            <div className="text-sm text-muted-foreground font-medium">Contatos</div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{contacts.length}</div>
            <p className="text-muted-foreground text-xs mt-1 font-medium">
              {contacts.filter(c => c.type === 'client').length} clientes
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Atividade Recente</CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setActiveTab?.('transactions')}
              className="text-xs"
            >
              Ver todas
            </Button>
          </CardHeader>
          <CardContent>
            {recentActivity.length === 0 ? (
              <div className="py-8 text-center text-muted-foreground">
                Nenhuma transação recente encontrada.
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead>Categoria</TableHead>
                    <TableHead className="text-right">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentActivity.map((transaction) => {
                    const isIncome = transaction.type === 'income'
                    const catInfo = categories.find(c => c.id === transaction.categoryId)
                    return (
                      <TableRow key={transaction.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isIncome ? 'bg-green-500/10' : 'bg-muted'}`}>
                              {isIncome
                                ? <ArrowDownLeft className="w-3.5 h-3.5 text-green-500" />
                                : <ArrowUpRight className="w-3.5 h-3.5 text-muted-foreground" />}
                            </div>
                            <span className="font-medium text-sm">{transaction.name}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-muted-foreground">{formatDateBR(transaction.date)}</TableCell>
                        <TableCell className="font-medium">
                          {isIncome ? '+' : '-'}{formatBRL(transaction.amount)}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {catInfo && <div className="w-2 h-2 rounded-full" style={{ backgroundColor: catInfo.color }} />}
                            <span className="text-muted-foreground text-sm">{catInfo?.name || 'Sem categoria'}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <Badge variant="secondary" className="bg-green-500/10 text-green-400 border-green-500/20">
                            <CheckCircle2 className="w-3 h-3 mr-1" />
                            Concluído
                          </Badge>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Gastos por Categoria</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[280px]">
              <DonutChart data={chartData} />
            </div>
          </CardContent>
        </Card>
      </div>

      <AddExpenseForm
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAdd={addExpense}
        initialType={modalType}
      />
    </div>
  )
}
