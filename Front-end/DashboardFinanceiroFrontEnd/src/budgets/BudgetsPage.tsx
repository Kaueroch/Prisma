import { useState } from 'react'
import { Plus, Grid, Utensils, Car, ShoppingCart, Zap, MoreHorizontal, Briefcase, PiggyBank } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { useFinance } from '../finance/useFinance'
import { formatBRL } from '../shared/utils/formatters'
import { AddBudgetForm } from './components/AddBudgetForm'

export function BudgetsPage() {
  const { expenses, budgets, categories, addBudget } = useFinance()
  const [isModalOpen, setIsModalOpen] = useState(false)

  return (
    <div className="p-6 lg:p-8 max-w-[1400px] mx-auto w-full space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Orçamentos</h1>
          <p className="text-muted-foreground text-sm mt-1">Acompanhe seus limites de gastos por categoria.</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)}>
          <Plus className="mr-2 h-5 w-5" />
          Criar Orçamento
        </Button>
      </div>

      {budgets.length === 0 ? (
        <Card>
          <CardContent className="py-16 flex flex-col items-center justify-center gap-4 text-center">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
              <PiggyBank className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-xl font-medium mb-1 text-foreground">Nenhum orçamento</h2>
              <p className="text-muted-foreground max-w-sm">
                Defina limites mensais por categoria para controlar seus gastos.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {budgets.map(b => {
            const catInfo = categories.find(c => c.id === b.categoryId) || { name: 'Desconhecido', color: '#666' }
            const spent = expenses
              .filter(e => e.categoryId === b.categoryId && e.type === 'expense')
              .reduce((sum, e) => sum + e.amount, 0)
            const percent = Math.min(100, Math.round((spent / b.amount) * 100)) || 0
            const isOver = spent > b.amount

            const categoryIcon = (() => {
              const icons: Record<string, typeof Grid> = { food: Utensils, transport: Car, shopping: ShoppingCart, bills: Zap, other: MoreHorizontal, salary: Briefcase }
              return icons[b.categoryId] || Grid
            })()
            const CatIcon = categoryIcon

            return (
              <Card key={b.id || b.categoryId}>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4 mb-4">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                      style={{ backgroundColor: `${catInfo.color}20` }}
                    >
                      <CatIcon className="w-5 h-5" style={{ color: catInfo.color }} strokeWidth={2.5} />
                    </div>
                    <div className="flex flex-col flex-1 min-w-0">
                      <span className="font-medium text-base truncate">{catInfo.name}</span>
                      <span className="text-muted-foreground text-xs mt-0.5">
                        Gasto {formatBRL(spent)} de {formatBRL(b.amount)}
                      </span>
                    </div>
                    <span className={`text-xl font-bold tracking-tight shrink-0 ${isOver ? 'text-destructive' : ''}`}>
                      {percent}%
                    </span>
                  </div>
                  <Progress
                    value={percent}
                    className={`h-2 ${isOver ? '[&>div]:bg-destructive' : ''}`}
                  />
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      <AddBudgetForm
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAdd={addBudget}
      />
    </div>
  )
}
