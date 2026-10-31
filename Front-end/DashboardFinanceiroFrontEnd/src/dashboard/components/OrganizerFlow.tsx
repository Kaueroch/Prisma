import { useMemo, useState } from 'react'
import { motion } from 'motion/react'
import { useReducedMotion } from '../../shared/motion/useReducedMotion'
import {
  ArrowRight,
  ChartPie,
  CircleDot,
  Plus,
  Receipt,
} from 'lucide-react'
import { useFinance } from '../../finance/useFinance'
import { useTransactionForm } from '../../finance/TransactionFormContext'
import { formatBRL } from '../../shared/utils/formatters'
import { DURATION, EASE } from '../../shared/motion/tokens'
import { cn } from '@/lib/utils'
import type { Expense, TransactionType } from '../../shared/types'

interface OrganizerFlowProps {
  /** Navega para outra aba (ex.: Categorias). */
  onNavigate?: (tab: 'categories') => void
  /** Lançamentos do período selecionado — os números exibidos seguem o filtro. */
  expenses?: Expense[]
}

/**
 * "Como o Prisma Finance organiza seu dinheiro"
 *
 * Um diagrama do modelo do produto alimentado pelos dados reais do usuário.
 * Não é uma lista de tarefas: cada nó explica um conceito e mostra, de
 * passagem, o que ainda está vazio — o formato do diagrama faz o
 * diagnóstico sem precisar dizer "faça a tarefa X".
 *
 * É uma faixa única: os quatro nós ficam em uma linha e a explicação de um
 * nó abre por baixo, sob demanda.
 *
 * Some quando os quatro elementos estão preenchidos: aí não há mais nada
 * a explicar.
 */
export function OrganizerFlow({ onNavigate, expenses: scopedExpenses }: OrganizerFlowProps) {
  const { expenses: allExpenses, categories } = useFinance()
  const { openTransactionForm } = useTransactionForm()
  const reduce = useReducedMotion()
  const [expanded, setExpanded] = useState<string | null>(null)

  // Os números vêm do período selecionado (igual ao resto do painel); a
  // prontidão dos nós olha o histórico todo, porque ela pergunta "esta peça
  // existe na conta", não "quanto entrou neste mês".
  const scoped = scopedExpenses ?? allExpenses

  const stats = useMemo(() => {
    const income = scoped.filter((e) => e.type === 'income')
    const expense = scoped.filter((e) => e.type === 'expense')
    const spentByCategory = new Set(expense.map((e) => e.categoryId)).size
    return {
      launches: scoped.length,
      totalLaunches: allExpenses.length,
      income: income.reduce((s, e) => s + e.amount, 0),
      expense: expense.reduce((s, e) => s + e.amount, 0),
      categories: categories.length,
      categoriesUsed: spentByCategory,
    }
  }, [scoped, allExpenses, categories])

  const nodes = useMemo(() => [
    {
      key: 'lancamentos',
      step: '01',
      icon: Receipt,
      title: 'Lançamentos',
      concept: 'Receitas e despesas',
      explanation:
        'Todo lance entra aqui primeiro. É o ponto de partida: sem lançamento não há número, e sem número não há análise.',
      ready: stats.totalLaunches > 0,
      detail:
        stats.launches > 0
          ? `${stats.launches} ${stats.launches === 1 ? 'lançamento' : 'lançamentos'}, ${formatBRL(stats.income)} de entrada`
          : 'Nenhum lançamento no período',
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
          ? `${stats.categories} ${stats.categories === 1 ? 'categoria' : 'categorias'}, ${stats.categoriesUsed} em uso`
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
      ready: stats.totalLaunches > 0 && stats.categories > 0,
      detail:
        stats.totalLaunches > 0 && stats.categories > 0
          ? `${stats.categoriesUsed} ${stats.categoriesUsed === 1 ? 'categoria' : 'categorias'} no donut`
          : 'Aguardando lançamentos e categorias',
      action: {
        label: 'Ver o gráfico',
        run: () => undefined,
      },
    },
  ], [stats, onNavigate, openTransactionForm])

  // Todos prontos: não há mais o que explicar.
  if (nodes.every((n) => n.ready)) return null

  const open = nodes.find((n) => n.key === expanded) ?? null
  const readyCount = nodes.filter((n) => n.ready).length

  return (
    <section className="mb-7 border border-edge bg-surface rounded-xl card-glow overflow-hidden" aria-label="Como o Prisma Finance organiza seu dinheiro">
      <div className="flex flex-col lg:flex-row">
        <div className="flex items-start justify-between gap-3 border-b border-edge px-5 py-4 lg:w-[230px] lg:shrink-0 lg:border-b-0 lg:border-r">
          <span className="min-w-0 text-[13px] font-medium text-fg-muted">Como o Prisma Finance organiza seu dinheiro</span>
          <span className="shrink-0 whitespace-nowrap text-[12px] tabular-nums text-fg-subtle">
            {readyCount} de {nodes.length}
          </span>
        </div>

        <ol className="grid flex-1 grid-cols-1 gap-px bg-edge sm:grid-cols-2 xl:grid-cols-4">
          {nodes.map((node, i) => {
            const Icon = node.icon
            const isOpen = expanded === node.key
            return (
              <motion.li
                key={node.key}
                initial={reduce ? false : { opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: reduce ? 0 : DURATION.base, delay: reduce ? 0 : i * 0.06, ease: EASE }}
                className="bg-surface"
              >
                <button
                  type="button"
                  onClick={() => setExpanded(isOpen ? null : node.key)}
                  aria-expanded={isOpen}
                  className="group flex w-full items-center gap-3 px-5 py-4 text-left outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand"
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
                      <span className="truncate text-sm font-semibold text-fg">{node.title}</span>
                    </span>
                    <span className="truncate text-[12px] text-fg-muted">{node.concept}</span>
                  </span>
                </button>
              </motion.li>
            )
          })}
        </ol>
      </div>

      {open && (
        <motion.div
          initial={reduce ? false : { opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          transition={{ duration: reduce ? 0 : DURATION.base, ease: EASE }}
          className="overflow-hidden border-t border-edge"
        >
          <div className="flex flex-col gap-4 px-6 py-5">
            <div className="flex flex-col gap-1.5">
              <span className="text-sm font-semibold text-fg">{open.title}</span>
              <p className="text-[13px] leading-relaxed text-fg-muted">{open.explanation}</p>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <span className="text-[13px] text-fg-subtle">{open.detail}</span>
              <button
                type="button"
                onClick={open.action.run}
                className="group inline-flex items-center gap-1.5 text-[13px] font-medium text-brand transition-colors hover:text-brand-strong"
              >
                <Plus className="size-3.5" strokeWidth={2.2} aria-hidden />
                {open.action.label}
                <ArrowRight
                  className="size-3.5 transition-transform duration-200 group-hover:translate-x-0.5"
                  strokeWidth={2.2}
                  aria-hidden
                />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </section>
  )
}
