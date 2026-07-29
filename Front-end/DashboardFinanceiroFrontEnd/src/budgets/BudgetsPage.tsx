import { useState } from 'react'
import { Plus, Grid } from 'lucide-react'
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
          <CardContent className="py-12 text-center text-muted-foreground">
            Nenhum orçamento definido. Clique em "Criar Orçamento" para começar.
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

            return (
              <Card key={b.id || b.categoryId}>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4 mb-4">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                      style={{ backgroundColor: `${catInfo.color}20` }}
                    >
                      <Grid className="w-5 h-5" style={{ color: catInfo.color }} strokeWidth={2.5} />
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
