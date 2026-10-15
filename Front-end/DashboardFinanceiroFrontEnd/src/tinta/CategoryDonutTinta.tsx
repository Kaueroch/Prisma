import { useMemo } from 'react'
import { ChartPie } from 'lucide-react'
import { Cell, Pie, PieChart, ResponsiveContainer } from 'recharts'
import { CATEGORY_PALETTE, OTHERS_COLOR, categoryColor } from './chartColors'
import { formatBRL } from '../shared/utils/formatters'

export interface DonutSlice {
  name: string
  value: number
  color: string
  muted?: boolean
}

function toSlices(data: { name: string; value: number }[]): DonutSlice[] {
  const sorted = [...data].sort((a, b) => b.value - a.value)
  if (sorted.length <= CATEGORY_PALETTE.length + 1) {
    return sorted.map((d, i) => ({ ...d, color: categoryColor(i) }))
  }
  const head = sorted.slice(0, CATEGORY_PALETTE.length)
  const tail = sorted.slice(CATEGORY_PALETTE.length)
  return [
    ...head.map((d, i) => ({ ...d, color: categoryColor(i) })),
    {
      name: `Other · ${tail.length}`,
      value: tail.reduce((acc, d) => acc + d.value, 0),
      color: OTHERS_COLOR,
      muted: true,
    },
  ]
}

export function CategoryDonutTinta({ data, loading = false }: { data: { name: string; value: number }[]; loading?: boolean }) {
  const slices = useMemo(() => toSlices(data), [data])
  const total = useMemo(() => data.reduce((acc, d) => acc + d.value, 0), [data])

  return (
    <section className="flex flex-col gap-6 border border-edge bg-surface p-6">
      <div className="flex flex-col gap-1.5">
        <span className="text-[13px] font-medium text-fg-muted">Gastos por categoria</span>
        <h2 className="font-display text-2xl font-normal tracking-[-0.02em] text-fg">
          Para onde foi o dinheiro
        </h2>
      </div>
      {loading ? (
        <div className="flex items-center gap-12">
          <div className="size-[200px] shrink-0 animate-pulse rounded-full bg-surface-raised" />
          <div className="flex flex-1 flex-col gap-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-5 animate-pulse bg-surface-raised" />
            ))}
          </div>
        </div>
      ) : slices.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-12 text-center">
          <span className="flex size-12 items-center justify-center rounded-2xl bg-brand-soft">
            <ChartPie className="size-6 text-brand" strokeWidth={1.8} />
          </span>
          <p className="font-display text-lg text-fg">Sem gastos por aqui</p>
          <p className="max-w-[260px] text-sm text-fg-muted">Quando você registrar uma despesa, o gráfico ganha vida.</p>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-12 sm:flex-row">
          <div className="relative size-[200px] shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={slices}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={70}
                  outerRadius={100}
                  startAngle={90}
                  endAngle={-270}
                  paddingAngle={1.5}
                  stroke="none"
                  isAnimationActive
                >
                  {slices.map((s) => (
                    <Cell key={s.name} fill={s.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-0.5">
              <span className="text-[12px] text-fg-subtle">Total</span>
              <span className="font-display text-xl font-medium tracking-[-0.02em] tabular-nums text-fg">
                {formatBRL(total)}
              </span>
            </div>
          </div>
          <ul className="flex w-full flex-1 flex-col">
            {slices.map((s, i) => {
              const pct = total > 0 ? (s.value / total) * 100 : 0
              return (
                <li
                  key={s.name}
                  className={`flex h-[30px] items-center gap-3 ${i < slices.length - 1 ? 'border-b border-white/6' : ''}`}
                >
                  <span className="size-2 shrink-0" style={{ backgroundColor: s.color }} />
                  <span className={`min-w-0 flex-1 truncate text-sm ${s.muted ? 'text-fg-muted' : 'text-fg'}`}>
                    {s.name}
                  </span>
                  <span className="w-12 shrink-0 text-right text-xs text-fg-subtle tabular-nums">{pct.toFixed(0)}%</span>
                  <span className="w-28 shrink-0 text-right font-display text-sm font-medium tabular-nums text-fg">
                    {formatBRL(s.value)}
                  </span>
                </li>
              )
            })}
          </ul>
        </div>
      )}
    </section>
  )
}
