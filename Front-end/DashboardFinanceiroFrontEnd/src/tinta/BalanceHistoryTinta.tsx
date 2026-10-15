import { useMemo } from 'react'
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { CHART } from './chartColors'
import { formatBRL } from '../shared/utils/formatters'
import type { Expense } from '../shared/types'

function dayKey(iso: string) {
  return iso.slice(0, 10)
}

/** Build the daily series for the month from local expenses (no backend). */
export function buildDailySeries(expenses: Expense[], month: number, year: number) {
  const map = new Map<string, number>()
  for (const e of expenses) {
    const d = new Date(e.date)
    const adj = e.date.length === 10 ? new Date(d.getTime() + d.getTimezoneOffset() * 60000) : d
    if (adj.getMonth() !== month || adj.getFullYear() !== year) continue
    const key = dayKey(adj.toISOString())
    const signed = e.type === 'income' ? e.amount : -e.amount
    map.set(key, (map.get(key) ?? 0) + signed)
  }
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  let running = 0
  const out: { date: string; net: number }[] = []
  for (let day = 1; day <= daysInMonth; day++) {
    const key = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    running += map.get(key) ?? 0
    out.push({ date: key, net: running })
  }
  return out
}

const AXIS_TICK = { fontFamily: 'Geist Variable, system-ui, sans-serif', fontSize: 12, fill: CHART.axis }

export function BalanceHistoryTinta({ expenses, month, year }: { expenses: Expense[]; month: number; year: number }) {
  const filled = useMemo(() => buildDailySeries(expenses, month, year), [expenses, month, year])
  const periodNet = filled.length ? filled[filled.length - 1].net : 0
  const lastIndex = filled.length - 1

  return (
    <section className="flex h-full min-h-[300px] flex-col gap-4 border border-edge bg-surface p-6">
      <div className="flex items-end justify-between gap-4">
        <div className="flex flex-col gap-1.5">
          <span className="text-[13px] font-medium text-fg-muted">Evolução</span>
          <h2 className="font-display text-2xl font-normal tracking-[-0.02em] text-fg">Histórico do saldo</h2>
        </div>
        <span className={`text-xs tabular-nums ${periodNet < 0 ? 'text-negative' : 'text-data'}`}>
          {periodNet < 0 ? '−' : '+'}
          {formatBRL(Math.abs(periodNet))} no mês
        </span>
      </div>
      <div className="min-h-44 flex-1">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={filled} margin={{ top: 8, right: 20, bottom: 0, left: 0 }}>
            <CartesianGrid stroke={CHART.grid} strokeDasharray="3 4" vertical={false} />
            <XAxis
              dataKey="date"
              tick={AXIS_TICK}
              tickLine={false}
              axisLine={false}
              minTickGap={32}
              tickFormatter={(v: string) => {
                const d = new Date(`${v}T00:00:00`)
                return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }).replace('.', '')
              }}
            />
            <YAxis
              tick={AXIS_TICK}
              tickLine={false}
              axisLine={false}
              width={44}
              tickFormatter={(v: number) => (Math.abs(v) >= 1000 ? `${(v / 1000).toFixed(1).replace('.0', '')}k` : String(v))}
            />
            <Tooltip
              cursor={{ stroke: CHART.edge }}
              contentStyle={{ background: CHART.surface, border: `1px solid ${CHART.edge}`, borderRadius: 0, fontSize: 12 }}
              labelStyle={{ fontFamily: 'Geist Variable, system-ui, sans-serif', color: CHART.axis, marginBottom: 4 }}
              itemStyle={{ color: '#fff' }}
              formatter={(value) => [formatBRL(Number(value)), 'Saldo']}
            />
            <Area
              type="monotone"
              dataKey="net"
              name="Saldo"
              stroke={CHART.brand}
              fill={CHART.brand}
              fillOpacity={0.12}
              strokeWidth={2.5}
              dot={(props: { cx?: number; cy?: number; index?: number }) =>
                props.index === lastIndex && props.cx != null && props.cy != null ? (
                  <rect key="last" x={props.cx - 4} y={props.cy - 4} width={8} height={8} fill={CHART.brand} />
                ) : (
                  <g key={props.index} />
                )
              }
              activeDot={{ r: 0 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </section>
  )
}
