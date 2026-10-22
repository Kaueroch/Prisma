import { useMemo, useState } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import {
  ArrowRight,
  ChartPie,
  CircleDot,
  Plus,
  Receipt,
  Target,
} from 'lucide-react'
import { useFinance } from '../../finance/useFinance'
import { useTransactionForm } from '../../finance/TransactionFormContext'
import { formatBRL } from '../../shared/utils/formatters'
import { getGoals } from '../../shared/services/goalsService'
import { AnimatedNumber } from '../../shared/motion/AnimatedNumber'
import { DURATION, EASE } from '../../shared/motion/tokens'
import { cn } from '@/lib/utils'
import type { TransactionType } from '../../shared/types'

interface OrganizerFlowProps {
  /** Navega para outra aba (ex.: Categorias, Metas). */
  onNavigate?: (tab: 'categories' | 'goals') => void
}

/**
 * "Como o Prisma organiza seu dinheiro"
 *
 * Um diagrama do modelo do produto alimentado pelos dados reais do usuário.
 * Não é uma lista de tarefas: cada nó explica um conceito e mostra, de
 * passagem, o que ainda está vazio — o formato do diagrama faz o
 * diagnóstico sem precisar dizer "faça a tarefa X".
 *
 * Some quando os quatro elementos estão preenchidos: aí não há mais nada
 * a explicar.
 */
export function OrganizerFlow({ onNavigate }: OrganizerFlowProps) {
  const { expenses, categories } = useFinance()
  const { openTransactionForm } = useTransactionForm()
  const reduce = useReducedMotion()
  const [expanded, setExpanded] = useState<string | null>(null)

  const stats = useMemo(() => {
    const income = expenses.filter((e) => e.type === 'income')
    const expense = expenses.filter((e) => e.type === 'expense')
    const spentByCategory = new Set(expense.map((e) => e.categoryId)).size
    return {
      launches: expenses.length,
      income: income.reduce((s, e) => s + e.amount, 0),
      expense: expense.reduce((s, e) => s + e.amount, 0),
      categories: categories.length,
      categoriesUsed: spentByCategory,
    }
  }, [expenses, categories])

  // As metas são locais (goalsService), então contam direto do storage.
  const goalsCount = useMemo(() => Object.keys(getGoals()).length, [expenses, categories])

  const nodes = useMemo(() => [
    {
      key: 'lancamentos',
      step: '01',
      icon: Receipt,
      title: 'Lançamentos',
      concept: 'Receitas e despesas',
      explanation:
        'Todo lance entra aqui primeiro. É o ponto de partida: sem lançamento não há número, e sem número não há análise.',
      ready: stats.launches > 0,
      detail:
        stats.launches > 0
          ? `${stats.launches} ${stats.launches === 1 ? 'lançamento' : 'lançamentos'} · ${formatBRL(stats.income)} de entrada`
          : 'Nenhum lançamento ainda',
      action: {
        label: 'Registrar receita',
        run: () => openTransactionForm('income' as TransactionType),
      },
    },
    {
      key: 'categorias',
      step: '02',
      icon: CircleDot,
      title: 'Categorias',
      concept: 'Nome e cor dos gastos',
      explanation:
        'Categorias dão identidade aos gastos. É o que transforma um número solto em algo que dá para ler.',
      ready: stats.categories > 0,
      detail:
        stats.categories > 0
          ? `${stats.categories} ${stats.categories === 1 ? 'categoria' : 'categorias'} · ${stats.categoriesUsed} em uso`
          : 'Nenhuma categoria ainda',
      action: {
        label: 'Criar categoria',
        run: () => onNavigate?.('categories'),
      },
    },
    {
      key: 'grafico',
      step: '03',
      icon: ChartPie,
      title: 'O gráfico',
      concept: 'Para onde foi o dinheiro',
      explanation:
        'Com lançamentos e categorias, o painel divide o mês por categoria e mostra onde o dinheiro realmente foi.',
      ready: stats.launches > 0 && stats.categories > 0,
      detail:
        stats.launches > 0 && stats.categories > 0
          ? `${stats.categoriesUsed} ${stats.categoriesUsed === 1 ? 'categoria' : 'categorias'} no donut`
          : 'Aguardando lançamentos e categorias',
      action: {
        label: 'Ver o gráfico',
        run: () => undefined,
      },
    },
    {
      key: 'metas',
      step: '04',
      icon: Target,
      title: 'Metas',
      concept: 'Teto por categoria',
      explanation:
        'Uma meta é o quanto você pode gastar numa categoria antes de passar do ponto. Ela transforma o gráfico em uma decisão.',
      ready: goalsCount > 0,
      detail:
        goalsCount > 0
          ? `${goalsCount} ${goalsCount === 1 ? 'meta definida' : 'metas definidas'}`
          : 'Nenhuma meta definida',
      action: {
        label: 'Definir meta',
        run: () => onNavigate?.('goals'),
      },
    },
  ], [stats, goalsCount, onNavigate, openTransactionForm])

  // Todos prontos: não há mais o que explicar.
  if (nodes.every((n) => n.ready)) return null

  return (
    <section className="mb-7 border border-edge bg-surface" aria-label="Como o Prisma organiza seu dinheiro">
      <header className="flex flex-wrap items-baseline justify-between gap-3 border-b border-edge px-6 py-5">
        <div className="flex flex-col gap-1">
          <span className="text-[13px] font-medium text-fg-muted">Como o Prisma organiza seu dinheiro</span>
          <p className="text-sm text-fg-subtle">
            Quatro peças. Cada uma só existe depois que a anterior existe.
          </p>
        </div>
        <span className="text-[12px] tabular-nums text-fg-subtle">
          {nodes.filter((n) => n.ready).length} de {nodes.length}
        </span>
      </header>

      <ol className="grid grid-cols-1 gap-px bg-edge sm:grid-cols-2 xl:grid-cols-4">
        {nodes.map((node, i) => {
          const Icon = node.icon
          const isOpen = expanded === node.key
          return (
            <motion.li
              key={node.key}
              initial={reduce ? false : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: reduce ? 0 : DURATION.base, delay: reduce ? 0 : i * 0.06, ease: EASE }}
              className="flex flex-col gap-3 bg-surface p-5"
            >
              <button
                type="button"
                onClick={() => setExpanded(isOpen ? null : node.key)}
                aria-expanded={isOpen}
                className="group flex items-start gap-3 text-left outline-none focus-visible:ring-2 focus-visible:ring-brand rounded-lg"
              >
                <span
                  className={cn(
                    'flex size-8 shrink-0 items-center justify-center border transition-colors duration-200',
                    node.ready
                      ? 'border-brand/40 bg-brand-soft text-brand'
                      : 'border-edge text-fg-subtle',
                    !node.ready && 'animate-pulse',
                  )}
                >
                  <Icon className="size-4" strokeWidth={1.8} aria-hidden />
                </span>
                <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <span className="flex items-center gap-2">
                    <span className="text-[11px] tabular-nums text-fg-subtle">{node.step}</span>
                    <span className="text-sm font-semibold text-fg">{node.title}</span>
                  </span>
                  <span className="text-[12px] text-fg-muted">{node.concept}</span>
                </span>
              </button>

              <p className="text-[13px] leading-relaxed text-fg-muted">{node.detail}</p>

              {isOpen && (
                <motion.div
                  initial={reduce ? false : { opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  transition={{ duration: reduce ? 0 : DURATION.base, ease: EASE }}
                  className="overflow-hidden"
                >
                  <p className="text-[13px] leading-relaxed text-fg-subtle">{node.explanation}</p>
                  {node.action.run && (
                    <button
                      type="button"
                      onClick={node.action.run}
                      className="mt-3 inline-flex items-center gap-1.5 text-[13px] font-medium text-brand transition-colors hover:text-brand-strong"
                    >
                      <Plus className="size-3.5" strokeWidth={2.2} aria-hidden />
                      {node.action.label}
                      <ArrowRight
                        className="size-3.5 transition-transform duration-200 group-hover:translate-x-0.5"
                        strokeWidth={2.2}
                        aria-hidden
                      />
                    </button>
                  )}
                </motion.div>
              )}
            </motion.li>
          )
        })}
      </ol>

      <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-edge px-6 py-4">
        <p className="text-[12px] text-fg-subtle">
          O painel se completa conforme você usa. Nada aqui é obrigatório.
        </p>
        <AnimatedNumber
          value={stats.expense}
          format={formatBRL}
          className="text-[12px] tabular-nums text-fg-muted"
        />
      </footer>
    </section>
  )
}
