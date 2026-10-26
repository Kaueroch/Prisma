import { PieChart, Tags, Plus, type LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import { Reveal } from './Reveal'
import { features } from '../content'

const iconMap: Record<string, LucideIcon> = {
  chart: PieChart,
  tags: Tags,
  plus: Plus,
}

const categorias = [
  { name: 'Alimentação', amount: 'R$ 1.428,00', color: '#8fbf9f' },
  { name: 'Contas', amount: 'R$ 1.092,00', color: '#7ea8d8' },
  { name: 'Transporte', amount: 'R$ 924,00', color: '#d8a36c' },
  { name: 'Lazer', amount: 'R$ 756,00', color: '#a88cc8' },
]

function GastosVisual() {
  const reduce = useReducedMotion()
  // Cada segmento "se desenha" quando a seção entra na viewport: o dash
  // cresce de zero até o comprimento final. Animar `pathLength` não serviria
  // aqui — ele conflita com o `strokeDasharray` já calculado.
  const segments = [
    { dash: 72.6, offset: 0, color: '#7ea8d8' },
    { dash: 47, offset: -72.6, color: '#8fbf9f' },
    { dash: 38.5, offset: -119.6, color: '#a88cc8' },
    { dash: 55.5, offset: -158.1, color: '#d8a36c' },
  ]

  return (
    <div className="mt-6 flex items-center gap-6  border border-edge bg-surface p-4">
      <div className="relative h-20 w-20 shrink-0">
        <svg viewBox="0 0 140 140" className="h-full w-full -rotate-90">
          {segments.map((s, i) => (
            <motion.circle
              key={s.color}
              cx="70"
              cy="70"
              r="34"
              fill="none"
              stroke={s.color}
              strokeWidth="14"
              strokeDashoffset={s.offset}
              initial={reduce ? false : { strokeDasharray: `0 213.6` }}
              whileInView={{ strokeDasharray: `${s.dash} 213.6` }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: reduce ? 0 : 0.6, delay: reduce ? 0 : i * 0.12, ease: 'easeOut' }}
            />
          ))}
        </svg>
        <div className="absolute inset-0 flex items-center justify-center text-xl font-bold">R$</div>
      </div>
      <div className="flex-1 space-y-2">
        {[
          ['Alimentação', '#8fbf9f', '34%'],
          ['Contas', '#7ea8d8', '26%'],
          ['Transporte', '#d8a36c', '22%'],
          ['Lazer', '#a88cc8', '18%'],
        ].map(([label, color, pct], i) => (
          <motion.div
            key={label as string}
            className="flex items-center gap-2 text-[11px]"
            initial={reduce ? false : { opacity: 0, x: -6 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: reduce ? 0 : 0.4, delay: reduce ? 0 : 0.3 + i * 0.06, ease: 'easeOut' }}
          >
            <span className="h-2 w-2 " style={{ backgroundColor: color as string }} />
            <span className="text-fg-muted">{label}</span>
            <span className="ml-auto font-semibold">{pct}</span>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

function CategoriasVisual() {
  return (
    <div className="mt-6 space-y-3  border border-edge bg-surface p-4">
      {categorias.map((c) => (
        <div key={c.name} className="flex items-center gap-3">
          <span className="h-8 w-8 " style={{ backgroundColor: c.color }} />
          <span className="text-xs font-medium">{c.name}</span>
          <span className="ml-auto text-[11px] text-fg-muted">{c.amount}</span>
        </div>
      ))}
    </div>
  )
}

const registro = [
  { name: 'Padaria', amount: 'R$ 18,90', category: 'Alimentação', color: '#8fbf9f' },
  { name: 'Combustível', amount: 'R$ 210,00', category: 'Transporte', color: '#d8a36c' },
]

function RegistroVisual() {
  return (
    <div className="mt-6  border border-edge bg-surface p-4">
      <div className="mb-3 flex items-center gap-2">
        <span className="flex flex-1 items-center gap-1.5  border border-edge bg-surface px-3 py-2 text-[11px] text-fg-muted">
          <Plus className="h-3 w-3" /> Nova despesa
        </span>
        <span className="bg-brand-soft px-2.5 py-2 text-[11px] font-medium text-fg">-R$ 0,00</span>
      </div>
      <div className="space-y-2">
        {registro.map((r) => (
          <div key={r.name} className="flex items-center gap-2  bg-muted/40 px-3 py-2 border border-edge/60">
            <span className="h-2 w-2 " style={{ backgroundColor: r.color }} />
            <span className="text-[11px] font-medium">{r.name}</span>
            <span className="ml-auto text-[11px] text-fg-muted">{r.category}</span>
            <span className="text-[11px] font-semibold">{r.amount}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export function Features() {
  return (
    <section id="recursos" className="relative border-t border-edge">
      <div className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
        <Reveal className="max-w-2xl">
          <p className="eyebrow">{features.eyebrow}</p>
          <h2 className="mt-3 font-display text-3xl font-normal tracking-[-0.02em] text-fg sm:text-4xl">{features.kicker}</h2>
          <p className="mt-4 text-fg-muted leading-relaxed">{features.subtitle}</p>
        </Reveal>

        <div className="mt-12 grid grid-cols-1 gap-4 lg:grid-cols-3">
          <Reveal delay={0.05} className="lg:col-span-2">
            <FeatureCard item={features.items[0]} excerpt={<GastosVisual />} />
          </Reveal>
          <Reveal delay={0.1}>
            <FeatureCard item={features.items[1]} excerpt={<CategoriasVisual />} />
          </Reveal>
          <Reveal delay={0.05}>
            <FeatureCard item={features.items[2]} excerpt={<RegistroVisual />} />
          </Reveal>
        </div>
      </div>
    </section>
  )
}

function FeatureCard({ item, excerpt }: { item: typeof features.items[number]; excerpt: ReactNode }) {
  const Icon = iconMap[item.icon] ?? Tags
  const reduce = useReducedMotion()
  return (
    <motion.article
      whileHover={reduce ? undefined : { y: -4 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className="group flex h-full flex-col border border-edge bg-surface p-6 transition-colors duration-200 hover:border-brand/40"
    >
      <div className="flex items-center gap-2.5">
        <span className="flex h-9 w-9 items-center justify-center bg-muted transition-colors duration-200 group-hover:bg-brand-soft">
          <Icon className="h-4.5 w-4.5 text-fg-muted transition-colors duration-200 group-hover:text-brand" />
        </span>
        <span className="text-xs font-medium text-fg-muted">{item.highlight}</span>
      </div>
      <h3 className="mt-5 font-display text-lg font-medium text-fg">{item.title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-fg-muted">{item.description}</p>
      <div className="mt-auto">{excerpt}</div>
    </motion.article>
  )
}