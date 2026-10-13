import { ArrowDownLeft, ArrowUpRight, CheckCircle2, Minus, Plus, Wallet } from 'lucide-react'
import type { ReactNode } from 'react'

const stats = [
  { label: 'Receitas Totais', value: 'R$ 8.400,00', accent: 'text-data', icon: ArrowDownLeft, chip: 'bg-brand-soft text-data', note: 'Em dia' },
  { label: 'Despesas Totais', value: 'R$ 4.200,00', accent: 'text-orange-400', icon: ArrowUpRight, chip: 'bg-orange-500/10 text-orange-400', note: 'agosto 2026' },
  { label: 'Economia (Líquido)', value: 'R$ 4.200,00', accent: '', icon: Wallet, chip: 'bg-surface-raised text-fg', note: 'Diferença do mês' },
]

const donut = [
  { label: 'Alimentação', value: 34, color: '#a3e635', amount: 'R$ 1.428,00' },
  { label: 'Contas', value: 26, color: '#3b82f6', amount: 'R$ 1.092,00' },
  { label: 'Transporte', value: 22, color: '#f97316', amount: 'R$ 924,00' },
  { label: 'Lazer', value: 18, color: '#8b5cf6', amount: 'R$ 756,00' },
]

const segments = [
  { dash: 72.6, offset: 0, color: '#a3e635' },
  { dash: 47, offset: -72.6, color: '#f97316' },
  { dash: 55.5, offset: -119.6, color: '#3b82f6' },
  { dash: 38.5, offset: -175.1, color: '#8b5cf6' },
]

const activity = [
  { name: 'Freelance design', type: 'income', category: 'Salário', color: '#a3e635', amount: '+R$ 2.400,00' },
  { name: 'Supermercado', type: 'expense', category: 'Alimentação', color: '#a3e635', amount: '-R$ 486,90' },
  { name: 'Combustível', type: 'expense', category: 'Transporte', color: '#f97316', amount: '-R$ 210,00' },
  { name: 'Aluguel', type: 'expense', category: 'Contas', color: '#3b82f6', amount: '-R$ 1.250,00' },
]

function windowFrame(children: ReactNode) {
  return (
    <div className="relative">
      <div className="absolute -inset-4 bg-brand/[0.06] blur-2xl" aria-hidden />
      <div className="relative border border-edge bg-surface overflow-hidden">
        <div className="flex items-center gap-2 border-b border-edge px-4 py-3 bg-[#0b0d12]">
          <span className="h-2.5 w-2.5 bg-zinc-700" />
          <span className="h-2.5 w-2.5 bg-zinc-700" />
          <span className="h-2.5 w-2.5 bg-zinc-700" />
          <div className="mx-auto flex items-center gap-2 border border-edge bg-surface px-3 py-1 font-mono text-[11px] text-fg-subtle">
            <span className="h-1 w-1 bg-zinc-600" />
            app.prisma.com.br/dashboard
          </div>
        </div>
        {children}
      </div>
    </div>
  )
}

export function DashboardMockup() {
  return windowFrame(
    <div className="space-y-4 p-4 sm:p-5">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2  border border-edge bg-surface p-1">
          <span className="flex h-6 w-6 items-center justify-center  text-fg-muted"><Minus className="h-3.5 w-3.5" /></span>
          <span className="px-2 text-[11px] font-medium text-fg-muted">agosto 2026</span>
          <span className="flex h-6 w-6 items-center justify-center  text-fg-muted"><Plus className="h-3.5 w-3.5" /></span>
        </div>
        <div className="flex items-center gap-2 text-[11px] text-fg-muted">
          <span>Saldo:</span>
          <span className="font-semibold text-data">R$ 4.200,00</span>
        </div>
      </div>

      <div className=" border border-edge bg-surface p-5">
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-wider text-fg-muted">Saldo Atual</p>
            <p className="mt-1 text-3xl font-bold tracking-tight">R$ 4.200,00</p>
            <div className="mt-3 flex items-center gap-2">
              <span className="inline-flex h-7 items-center gap-1  bg-brand px-3 text-[11px] font-medium text-black">
                <ArrowDownLeft className="h-3 w-3" /> Nova Receita
              </span>
              <span className="inline-flex h-7 items-center gap-1  bg-secondary px-3 text-[11px] font-medium text-secondary-foreground">
                <ArrowUpRight className="h-3 w-3" /> Nova Despesa
              </span>
            </div>
          </div>
          <div className="flex h-14 w-14 items-center justify-center  border border-edge bg-surface">
            <Wallet className="h-6 w-6 text-zinc-300" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {stats.map((s, i) => (
          <div
            key={s.label}
            className={` border border-edge bg-surface p-4 ${i === 2 ? 'col-span-2' : ''}`}
          >
            <div className="flex items-center gap-2.5">
              <span className="flex h-8 w-8 items-center justify-center  bg-surface-raised">
                <s.icon className={s.accent || 'text-fg'} />
              </span>
              <span className="text-[11px] font-medium text-fg-muted leading-tight">{s.label}</span>
            </div>
            <p className="mt-3 text-lg font-bold tracking-tight">{s.value}</p>
            <p className="mt-0.5 text-[11px] font-medium text-fg-muted">{s.note}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-5">
        <div className=" border border-edge bg-surface md:col-span-3">
          <div className="flex items-center justify-between border-b border-edge px-4 py-3">
            <span className="text-sm font-semibold">Atividade Recente</span>
            <span className="text-[11px] text-fg-muted">Ver todas</span>
          </div>
          <div>
            {activity.map((t, i) => (
              <div key={t.name} className={`flex items-center gap-3 px-4 py-2.5 ${i > 0 ? 'border-t border-edge/60' : ''}`}>
                <span className={`flex h-7 w-7 shrink-0 items-center justify-center  ${t.type === 'income' ? 'bg-brand-soft text-data' : 'bg-surface-raised text-fg-muted'}`}>
                  {t.type === 'income' ? <ArrowDownLeft className="h-3.5 w-3.5" /> : <ArrowUpRight className="h-3.5 w-3.5" />}
                </span>
                <span className="min-w-0 flex-1 truncate text-xs font-medium">{t.name}</span>
                <span className="hidden items-center gap-1.5 sm:flex">
                  <span className="h-2 w-2 " style={{ backgroundColor: t.color }} />
                  <span className="text-[11px] text-fg-muted">{t.category}</span>
                </span>
                <span className={`text-xs font-semibold ${t.type === 'income' ? 'text-data' : ''}`}>{t.amount}</span>
                <span className="hidden items-center gap-1  border border-lime-400/20 bg-brand-soft px-2 py-0.5 text-[10px] font-medium text-data lg:flex">
                  <CheckCircle2 className="h-3 w-3" /> Concluído
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className=" border border-edge bg-surface p-4 md:col-span-2">
          <p className="text-sm font-semibold">Gastos por Categoria</p>
          <div className="mt-2 flex items-center justify-center">
            <div className="relative h-[132px] w-[132px]">
              <svg viewBox="0 0 140 140" className="h-full w-full -rotate-90">
                {segments.map((s, i) => (
                  <circle
                    key={i}
                    cx="70"
                    cy="70"
                    r="34"
                    fill="none"
                    stroke={s.color}
                    strokeWidth="12"
                    strokeDasharray={`${s.dash} 213.6`}
                    strokeDashoffset={s.offset}
                  />
                ))}
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <Wallet className="h-5 w-5 text-zinc-300" />
              </div>
            </div>
          </div>
          <div className="mt-2 space-y-1.5">
            {donut.map((d) => (
              <div key={d.label} className="flex items-center gap-2 text-[11px]">
                <span className="h-2 w-2 " style={{ backgroundColor: d.color }} />
                <span className="text-fg-muted">{d.label}</span>
                <span className="ml-auto font-medium">{d.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>,
  )
}