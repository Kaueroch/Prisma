import { useMemo, useState } from 'react'
import { ChartPie } from 'lucide-react'
import { Cell, Pie, PieChart, ResponsiveContainer, Sector, Tooltip } from 'recharts'
import { AnimatePresence, motion } from 'motion/react'
import { CATEGORY_PALETTE, OTHERS_COLOR, categoryColor } from './chartColors'
import { formatBRL } from '../shared/utils/formatters'
import { AnimatedNumber } from '../shared/motion/AnimatedNumber'
import { DURATION, EASE } from '../shared/motion/tokens'

export interface DonutSlice {
  name: string
  value: number
  color: string
  muted?: boolean
}

interface DonutDatum {
  name: string
  value: number
  /** Cor da categoria — a mesma usada nas listas e cartões. */
  color?: string
}

function toSlices(data: DonutDatum[]): DonutSlice[] {
  const sorted = [...data].sort((a, b) => b.value - a.value)
  // A cor vem da própria categoria (hash do nome), então a mesma categoria
  // tem a mesma cor no donut, na lista de transações e no cartão.
  const withColor = (d: DonutDatum, i: number): DonutSlice => ({
    ...d,
    color: d.color ?? categoryColor(i),
  })

  if (sorted.length <= CATEGORY_PALETTE.length + 1) {
    return sorted.map(withColor)
  }
  const head = sorted.slice(0, CATEGORY_PALETTE.length)
  const tail = sorted.slice(CATEGORY_PALETTE.length)
  return [
    ...head.map(withColor),
    {
      name: `Other · ${tail.length}`,
      value: tail.reduce((acc, d) => acc + d.value, 0),
      color: OTHERS_COLOR,
      muted: true,
    },
  ]
}

export function CategoryDonutTinta({ data, loading = false }: { data: DonutDatum[]; loading?: boolean }) {
  const slices = useMemo(() => toSlices(data), [data])
  const total = useMemo(() => data.reduce((acc, d) => acc + d.value, 0), [data])
  /** Índice da fatia em foco — sincroniza o hover entre a fatia e a legenda. */
  const [activeIndex, setActiveIndex] = useState<number | null>(null)

  return (
    <section className="flex flex-col gap-6 border border-edge bg-surface p-6">
      <div className="flex flex-col gap-1.5">
        <span className="text-[13px] font-medium text-fg-muted">Gastos por categoria</span>
        <h2 className="font-display text-2xl font-normal tracking-[-0.02em] text-fg break-words">
          Para onde foi o dinheiro
        </h2>
      </div>
      {loading ? (
        <div className="flex items-center gap-12">
          <div className="size-[200px] shrink-0 animate-shimmer rounded-full bg-surface-raised" />
          <div className="flex flex-1 flex-col gap-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-5 animate-shimmer bg-surface-raised" />
            ))}
          </div>
        </div>
      ) : slices.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-12 text-center">
          <span className="flex size-12 items-center justify-center rounded-2xl bg-brand-soft">
            <ChartPie className="size-6 text-brand" strokeWidth={1.8} />
          </span>
          <p className="font-display text-lg text-fg">Nenhum gasto neste mês</p>
          <p className="max-w-[260px] text-sm text-fg-muted">Registre uma despesa para ver o gráfico.</p>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-12 sm:flex-row">
          <div className="relative size-[200px] shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Tooltip cursor={false} content={() => null} />
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
                  animationDuration={400}
                  onMouseEnter={(_: unknown, index: number) => setActiveIndex(index)}
                  onMouseLeave={() => setActiveIndex(null)}
                  shape={(props: unknown) => {
                    const p = props as {
                      cx: number
                      cy: number
                      innerRadius: number
                      outerRadius: number
                      startAngle: number
                      endAngle: number
                      fill: string
                      index: number
                    }
                    const isActive = activeIndex === p.index
                    const isDimmed = activeIndex !== null && !isActive
                    return (
                      <g>
                        {/* Fatia base — escurece quando outra está em foco. */}
                        <Sector
                          cx={p.cx}
                          cy={p.cy}
                          innerRadius={p.innerRadius}
                          outerRadius={p.outerRadius}
                          startAngle={p.startAngle}
                          endAngle={p.endAngle}
                          fill={p.fill}
                          stroke="none"
                          style={{
                            opacity: isDimmed ? 0.35 : 1,
                            transition: 'opacity 150ms cubic-bezier(0.16, 1, 0.3, 1)',
                          }}
                        />
                        {/* Fatia expandida: entra por opacidade, o que dá a
                            sensação de a fatia "crescer" para fora. */}
                        <Sector
                          cx={p.cx}
                          cy={p.cy}
                          innerRadius={p.innerRadius}
                          outerRadius={p.outerRadius + 6}
                          startAngle={p.startAngle}
                          endAngle={p.endAngle}
                          fill={p.fill}
                          stroke="none"
                          style={{
                            opacity: isActive ? 1 : 0,
                            transition: 'opacity 150ms cubic-bezier(0.16, 1, 0.3, 1)',
                          }}
                        />
                      </g>
                    )
                  }}
                >
                  {slices.map((s) => (
                    <Cell key={s.name} fill={s.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            {/* Centro: mostra o total ou, em hover, a categoria em foco. */}
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-0.5 px-6 text-center">
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={activeIndex === null ? 'total' : `slice-${activeIndex}`}
                  className="flex flex-col items-center gap-0.5"
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: DURATION.fast, ease: EASE }}
                >
                  <span className="truncate text-[12px] text-fg-subtle">
                    {activeIndex === null ? 'Total' : slices[activeIndex]?.name}
                  </span>
                  <span className="font-display text-xl font-medium tracking-[-0.02em] tabular-nums text-fg">
                    {activeIndex === null ? (
                      <AnimatedNumber value={total} format={formatBRL} />
                    ) : (
                      formatBRL(slices[activeIndex]?.value ?? 0)
                    )}
                  </span>
                  {activeIndex !== null && total > 0 && (
                    <span className="text-[11px] text-fg-subtle tabular-nums">
                      {(((slices[activeIndex]?.value ?? 0) / total) * 100).toFixed(0)}% do total
                    </span>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
          {/* min-w-0: sem isso a legenda trava na soma das colunas fixas
              (% + valor) e transborda a borda do card em tela estreita. */}
          <ul className="flex min-w-0 flex-1 flex-col">
            {slices.map((s, i) => {
              const pct = total > 0 ? (s.value / total) * 100 : 0
              const isActive = activeIndex === i
              const isDimmed = activeIndex !== null && !isActive
              return (
                <li
                  key={s.name}
                  onMouseEnter={() => setActiveIndex(i)}
                  onMouseLeave={() => setActiveIndex(null)}
                  className={`flex h-[30px] cursor-default items-center gap-3 transition-opacity duration-150 ${
                    isDimmed ? 'opacity-45' : 'opacity-100'
                  } ${i < slices.length - 1 ? 'border-b border-white/6' : ''}`}
                >
                  <span
                    className="size-2 shrink-0 transition-transform duration-150"
                    style={{ backgroundColor: s.color, transform: isActive ? 'scale(1.35)' : 'scale(1)' }}
                  />
                  <span className={`min-w-0 flex-1 truncate text-sm ${s.muted ? 'text-fg-muted' : 'text-fg'}`}>
                    {s.name}
                  </span>
                  <span className="w-10 shrink-0 text-right text-xs text-fg-subtle tabular-nums sm:w-12">{pct.toFixed(0)}%</span>
                  <span className="w-24 shrink-0 text-right font-display text-sm font-medium tabular-nums text-fg sm:w-28">
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
