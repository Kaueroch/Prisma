import { useMemo } from 'react'
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { CHART } from './chartColors'
import { formatBRL } from '../shared/utils/formatters'
import type { Expense } from '../shared/types'

function monthLabel(month: string) {
  const d = new Date(`${month}-01T00:00:00`)
  const label = d.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '')
  return label.charAt(0).toUpperCase() + label.slice(1)
}

export function IncomeExpenseTinta({ expenses }: { expenses: Expense[] }) {
  const data = useMemo(() => {
    const now = new Date()
    const out: { month: string; income: number; expense: number }[] = []
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
      out.push({ month: key, income: 0, expense: 0 })
    }
    for (const e of expenses) {
      const d = new Date(e.date)
      const adj = e.date.length === 10 ? new Date(d.getTime() + d.getTimezoneOffset() * 60000) : d
      const key = `${adj.getFullYear()}-${String(adj.getMonth() + 1).padStart(2, '0')}`
      const bucket = out.find((b) => b.month === key)
      if (!bucket) continue
      if (e.type === 'income') bucket.income += e.amount
      else bucket.expense += e.amount
    }
    return out
  }, [expenses])

  if (data.every((d) => d.income === 0 && d.expense === 0)) {
    return (
      <section className="flex h-full flex-col gap-5 border border-edge bg-surface p-6">
        <span className="text-[13px] font-medium text-fg-muted">Comparison</span>
        <h2 className="font-display text-2xl font-normal text-fg">Income and spending</h2>
        <div className="flex min-h-56 flex-1 flex-col items-center justify-center gap-2 border border-dashed border-edge px-6 text-center">
          <p className="text-sm text-fg-muted">No activity in the last 6 months.</p>
          <p className="text-xs text-fg-subtle">Log an entry or simulate one via the Telegram bot.</p>
        </div>
      </section>
    )
  }

  return (
    <section className="flex h-full flex-col gap-5 border border-edge bg-surface p-6">
      <div className="flex items-end justify-between gap-4">
        <div className="flex flex-col gap-1.5">
          <span className="text-[13px] font-medium text-fg-muted">Comparison</span>
          <h2 className="font-display text-2xl font-normal text-fg">Income and spending</h2>
        </div>
        <div className="flex gap-4 text-[12px] text-fg-muted">
          <span className="flex items-center gap-1.5">
            <span className="size-2 bg-data" /> Income
          </span>
          <span className="flex items-center gap-1.5">
            <span className="size-2 bg-negative" /> Expense
          </span>
        </div>
      </div>
      <div className="min-h-[264px] flex-1">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 8, right: 0, bottom: 0, left: 0 }} barSize={28} barGap={6}>
            <CartesianGrid stroke={CHART.grid} strokeDasharray="3 4" vertical={false} />
            <XAxis dataKey="month" tickLine={false} axisLine={{ stroke: 'rgba(255,255,255,0.2)' }} height={32} interval={0} tick={{ fontFamily: 'Geist Variable, system-ui, sans-serif', fontSize: 12, fill: CHART.axis }} tickFormatter={(v: string) => monthLabel(v)} />
            <YAxis tickLine={false} axisLine={false} width={40} tick={{ fontFamily: 'Geist Variable, system-ui, sans-serif', fontSize: 12, fill: CHART.axis }} tickFormatter={(v: number) => (Math.abs(v) >= 1000 ? `${Math.round(v / 1000)}k` : String(v))} />
            <Tooltip
              cursor={{ fill: 'rgba(255,255,255,0.04)' }}
              contentStyle={{ background: CHART.surface, border: `1px solid ${CHART.edge}`, borderRadius: 0, fontSize: 12 }}
              labelFormatter={(label) => monthLabel(String(label))}
              formatter={(value, name) => [formatBRL(Number(value)), name === 'income' ? 'Income' : 'Expense']}
            />
            <Bar dataKey="income" fill={CHART.income} radius={0} />
            <Bar dataKey="expense" fill={CHART.expense} radius={0} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  )
}
