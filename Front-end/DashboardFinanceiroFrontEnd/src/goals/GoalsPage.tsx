import { useState } from 'react'
import { Target, Plus } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { useFinance } from '../finance/useFinance'
import { formatBRL } from '../shared/utils/formatters'
import { AddGoalForm } from './components/AddGoalForm'

export function GoalsPage() {
  const { goals, addGoal } = useFinance()
  const [isFormOpen, setIsFormOpen] = useState(false)

  const getProgress = (saved: number, target: number) => {
    if (target === 0) return 0
    return Math.min(Math.max((saved / target) * 100, 0), 100)
  }

  const getMonthsLeft = (saved: number, target: number, monthly: number) => {
    if (monthly <= 0) return Infinity
    const remaining = target - saved
    if (remaining <= 0) return 0
    return Math.ceil(remaining / monthly)
  }

  return (
    <div className="p-6 lg:p-8 max-w-[1400px] mx-auto w-full space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Metas</h1>
          <p className="text-muted-foreground text-sm mt-1">Acompanhe seus objetivos financeiros.</p>
        </div>
        <Button onClick={() => setIsFormOpen(true)}>
          <Plus className="mr-2 h-5 w-5" />
          Nova Meta
        </Button>
      </div>

      {goals.length === 0 ? (
        <Card>
          <CardContent className="py-16 flex flex-col items-center justify-center gap-4 text-center">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
              <Target className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-xl font-medium mb-1">Nenhuma meta definida</h2>
              <p className="text-muted-foreground max-w-sm">
                Comece criando uma meta financeira para acompanhar sua jornada rumo aos seus objetivos.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {goals.map(goal => {
            const progress = getProgress(goal.savedAmount, goal.targetAmount)
            const monthsLeft = getMonthsLeft(goal.savedAmount, goal.targetAmount, goal.monthlySavings)
            const isCompleted = goal.savedAmount >= goal.targetAmount

            return (
              <Card key={goal.id}>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center border border-purple-500/20">
                      <Target className="w-5 h-5" />
                    </div>
                    <div>
                      <CardTitle className="text-base">{goal.name}</CardTitle>
                      <p className="text-muted-foreground text-xs">
                        Economizando {formatBRL(goal.monthlySavings)}/mês
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-muted-foreground">Progresso</span>
                      <span className="font-medium">{progress.toFixed(1)}%</span>
                    </div>
                    <Progress
                      value={progress}
                      className={`h-2.5 ${isCompleted ? '[&>div]:bg-green-500' : '[&>div]:bg-purple-500'}`}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
                    <div>
                      <span className="text-muted-foreground text-xs block mb-1">Guardado</span>
                      <span className="font-semibold">{formatBRL(goal.savedAmount)}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground text-xs block mb-1">Objetivo</span>
                      <span className="font-semibold text-muted-foreground">{formatBRL(goal.targetAmount)}</span>
                    </div>
                  </div>

                  {!isCompleted && monthsLeft !== Infinity && (
                    <div className="bg-muted/50 rounded-xl px-4 py-3 text-sm text-muted-foreground text-center border border-border">
                      Faltam <span className="text-foreground font-medium">{monthsLeft} {monthsLeft === 1 ? 'mês' : 'meses'}</span> para alcançar.
                    </div>
                  )}
                  {!isCompleted && monthsLeft === Infinity && (
                    <div className="bg-muted/50 rounded-xl px-4 py-3 text-sm text-muted-foreground text-center border border-border">
                      Defina um valor mensal para calcular o prazo.
                    </div>
                  )}
                  {isCompleted && (
                    <div className="bg-green-500/10 text-green-400 border border-green-500/20 rounded-xl px-4 py-3 text-sm font-medium text-center">
                      Meta Alcançada!
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      <AddGoalForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onAdd={addGoal}
      />
    </div>
  )
}
