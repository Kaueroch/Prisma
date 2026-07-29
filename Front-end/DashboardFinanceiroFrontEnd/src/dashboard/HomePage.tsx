import { useState, useMemo } from 'react'
import { ArrowDownLeft, ArrowUpRight, Plus, Calendar, Download, MoreHorizontal, CheckCircle2, ChevronDown } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useFinance } from '../finance/useFinance'
import { formatBRL, formatDateBR } from '../shared/utils/formatters'
import { AddExpenseForm } from '../transactions/components/AddExpenseForm'
import { DonutChart } from './components/DonutChart'
import type { Tab, TransactionType } from '../shared/types'

interface HomePageProps {
  setActiveTab?: (tab: Tab) => void;
}

export function HomePage({ setActiveTab }: HomePageProps = {}) {
  const { totalIncome, totalExpense, balance, expenses, categories, addExpense, contacts } = useFinance()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalType, setModalType] = useState<TransactionType>('income')

  const recentActivity = useMemo(() => {
    return [...expenses].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 6)
  }, [expenses])

  const chartData = useMemo(() => {
    const expenseByCategory: Record<string, { name: string; value: number; color: string }> = {}
    expenses.filter(e => e.type === 'expense').forEach(e => {
      const cat = categories.find(c => c.id === e.categoryId)
      const name = cat?.name || 'Sem categoria'
      if (!expenseByCategory[name]) {
        expenseByCategory[name] = { name, value: 0, color: cat?.color || '#666' }
      }
      expenseByCategory[name].value += e.amount
    })
    return Object.values(expenseByCategory)
  }, [expenses, categories])

  return (
    <div className="p-6 lg:p-8 gap-6 flex flex-col max-w-[1400px] mx-auto w-full">
      <div className="bg-gradient-to-r from-purple-600 to-purple-900 rounded-3xl p-8 flex flex-col md:flex-row justify-between items-start md:items-center border border-purple-500/30 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 blur-[80px] rounded-full pointer-events-none" />
        <div className="flex flex-col gap-2 z-10">
          <span className="text-white/80 font-medium">Saldo Atual</span>
          <div className="flex items-center gap-4">
            <h1 className="text-5xl font-bold tracking-tight">{formatBRL(balance)}</h1>
            <button className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-all">
              <ChevronDown className="w-4 h-4 text-white" />
            </button>
          </div>
          <div className="flex items-center gap-3 mt-6">
            <Button
              onClick={() => { setModalType('income'); setIsModalOpen(true) }}
              className="bg-white text-purple-900 hover:bg-white/90 rounded-full"
            >
              <ArrowDownLeft className="mr-2 h-4 w-4" />
              Receber
            </Button>
            <Button
              onClick={() => { setModalType('expense'); setIsModalOpen(true) }}
              variant="secondary"
              className="rounded-full bg-white/20 text-white hover:bg-white/30 border-0"
            >
              <ArrowUpRight className="mr-2 h-4 w-4" />
              Transferir
            </Button>
            <Button variant="ghost" size="icon" className="rounded-full bg-white/20 text-white hover:bg-white/30">
              <MoreHorizontal className="h-5 w-5" />
            </Button>
          </div>
        </div>
        <div className="flex flex-col items-end gap-4 mt-8 md:mt-0 z-10">
          <div className="flex items-center gap-2 bg-black/20 rounded-full p-1 border border-white/10">
            <Button variant="ghost" size="sm" className="rounded-full text-white/80 text-xs">
              <Calendar className="mr-1 h-3 w-3" />
              Este Mês
            </Button>
            <Button variant="secondary" size="sm" className="rounded-full bg-white/20 text-white text-xs">
              <Download className="mr-1 h-3 w-3" />
              Exportar
            </Button>
          </div>
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
            <p className="text-muted-foreground text-xs mt-1 font-medium">Referente a este mês</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center gap-3 pb-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
              <ArrowUpRight className="w-5 h-5 text-purple-500 rotate-45" />
            </div>
            <div className="text-sm text-muted-foreground font-medium">Economia (Líquido)</div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatBRL(totalIncome - totalExpense)}</div>
            <p className="text-purple-400 text-xs mt-1 font-medium">Disponível para Metas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center gap-3 pb-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
              <Calendar className="w-5 h-5 text-blue-500" />
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
