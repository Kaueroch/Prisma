import { ArrowDownRight, ArrowUpRight, Eye, Plus } from 'lucide-react'
import type { ReactNode } from 'react'
import { symbolicCategoryColor } from '../../shared/utils/categoryColor'

// Prévia estática do painel: mesmos títulos e blocos da HomePage atual.
const CIRCUMFERENCE = 2 * Math.PI * 40

const gastos = [
  { name: 'Moradia', amount: 'R$ 1.889,30', value: 58 },
  { name: 'Alimentação', amount: 'R$ 747,70', value: 23 },
  { name: 'Transporte', amount: 'R$ 242,40', value: 7 },
  { name: 'Lazer', amount: 'R$ 235,80', value: 7 },
  { name: 'Saúde', amount: 'R$ 145,00', value: 5 },
].map((g) => ({ ...g, color: symbolicCategoryColor(g.name) }))

const segments = gastos.reduce<{ dash: number; offset: number; color: string }[]>((acc, g) => {
  const offset = acc.length ? acc[acc.length - 1].offset - acc[acc.length - 1].dash : 0
  acc.push({ dash: (g.value / 100) * CIRCUMFERENCE, offset, color: g.color })
  return acc
}, [])

const recentes = [
  { name: 'Restaurante', category: 'Alimentação', type: 'expense', amount: '-R$ 86,50' },
  { name: 'Padaria', category: 'Alimentação', type: 'expense', amount: '-R$ 48,90' },
  { name: 'Site institucional', category: 'Freelance', type: 'income', amount: '+R$ 1.350,00' },
  { name: 'Combustível', category: 'Transporte', type: 'expense', amount: '-R$ 210,00' },
]

function windowFrame(children: ReactNode) {
  return (
    <div className="relative">
      <div className="absolute -inset-4 bg-brand/[0.06] blur-2xl" aria-hidden />
      <div className="relative border border-edge bg-surface overflow-hidden rounded-xl card-glow">
        <div className="flex items-center gap-2 border-b border-edge px-4 py-3 bg-surface">
          <span className="h-2.5 w-2.5 bg-zinc-700" />
          <span className="h-2.5 w-2.5 bg-zinc-700" />
          <span className="h-2.5 w-2.5 bg-zinc-700" />
          <div className="mx-auto flex items-center gap-2 border border-edge bg-surface px-3 py-1 text-[12px] text-fg-subtle rounded-lg">
            <span className="h-1 w-1 bg-zinc-600" />
            app.prismafinance.com.br/painel
          </div>
        </div>
        {children}
      </div>
    </div>
  )
}

export function DashboardMockup() {
  return windowFrame(
    <div className="space-y-3 bg-canvas p-4 sm:p-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[11px] font-medium text-fg-muted">Domingo, 25 de outubro</p>
          <div className="mt-1 flex items-center gap-2">
            <p className="font-display text-2xl tracking-[-0.02em] text-fg">Olá, Ana</p>
            <span className="flex h-6 w-6 items-center justify-center rounded-lg border border-edge text-fg-muted">
              <Eye className="h-3 w-3" />
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex h-7 items-center gap-1 rounded-lg bg-brand px-3 text-[11px] font-medium text-black">
            <Plus className="h-3 w-3" /> Receita
          </span>
          <span className="inline-flex h-7 items-center gap-1 rounded-lg border border-edge bg-surface px-3 text-[11px] font-medium text-fg">
            <Plus className="h-3 w-3" /> Despesa
          </span>
        </div>
      </div>

      <div className="border border-edge bg-surface p-4 rounded-lg">
        <div className="flex items-center justify-between text-[11px]">
          <span className="font-medium text-fg-muted">Saldo atual</span>
          <span className="text-fg-subtle">13 transações</span>
        </div>
        <p className="mt-4 font-display text-3xl font-medium tracking-[-0.02em] tabular-nums">R$ 3.289,80</p>
        <p className="mt-1 text-[11px] text-fg-subtle">Receitas menos gastos no período</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="border border-edge bg-surface p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-fg-muted">Receitas</span>
            <ArrowUpRight className="h-3.5 w-3.5 text-positive" />
          </div>
          <p className="mt-2 text-lg font-semibold tracking-tight text-positive tabular-nums">R$ 6.550,00</p>
        </div>
        <div className="border border-edge bg-surface p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-fg-muted">Gastos</span>
            <ArrowDownRight className="h-3.5 w-3.5 text-negative" />
          </div>
          <p className="mt-2 text-lg font-semibold tracking-tight text-negative tabular-nums">R$ 3.260,20</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-5">
        <div className="border border-edge bg-surface p-4 md:col-span-2 rounded-xl card-glow">
          <p className="text-[11px] font-medium text-fg-muted">Gastos por categoria</p>
          <p className="text-sm text-fg">Para onde foi o dinheiro</p>
          <div className="mt-3 flex items-center justify-center">
            <div className="relative h-[128px] w-[128px]">
              <svg viewBox="0 0 140 140" className="h-full w-full -rotate-90">
                {segments.map((s) => (
                  <circle
                    key={s.color + s.offset}
                    cx="70"
                    cy="70"
                    r="40"
                    fill="none"
                    stroke={s.color}
                    strokeWidth="10"
                    strokeDasharray={`${s.dash} ${CIRCUMFERENCE}`}
                    strokeDashoffset={s.offset}
                  />
                ))}
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-[9px] text-fg-subtle">Total</span>
                <span className="text-[10px] font-semibold tabular-nums">R$ 3.260,20</span>
              </div>
            </div>
          </div>
          <div className="mt-3 space-y-1.5">
            {gastos.slice(0, 4).map((g) => (
              <div key={g.name} className="flex items-center gap-2 text-[11px]">
                <span className="h-2 w-2" style={{ backgroundColor: g.color }} />
                <span className="text-fg-muted">{g.name}</span>
                <span className="ml-auto font-medium tabular-nums">{g.value}%</span>
              </div>
            ))}
          </div>
        </div>

        <div className="border border-edge bg-surface md:col-span-3 rounded-xl card-glow overflow-hidden">
          <div className="border-b border-edge px-4 py-3">
            <p className="text-[11px] font-medium text-fg-muted">Movimento</p>
            <p className="text-sm text-fg">Transações recentes</p>
          </div>
          <div>
            {recentes.map((t, i) => (
              <div key={t.name} className={`flex items-center gap-3 px-4 py-2.5 ${i > 0 ? 'border-t border-edge/60' : ''}`}>
                <span className="h-2 w-2 shrink-0" style={{ backgroundColor: symbolicCategoryColor(t.category) }} />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-xs font-medium">{t.name}</span>
                  <span className="block truncate text-[10px] text-fg-subtle">{t.category}</span>
                </span>
                <span className={`text-xs font-semibold tabular-nums ${t.type === 'income' ? 'text-positive' : 'text-fg'}`}>{t.amount}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>,
  )
}
