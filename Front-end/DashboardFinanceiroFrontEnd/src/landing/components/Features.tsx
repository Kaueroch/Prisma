import { PieChart, PiggyBank, Target, Users, type LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'
import { Reveal } from './Reveal'
import { features } from '../content'
import { cn } from '../utils'

const iconMap: Record<string, LucideIcon> = {
  chart: PieChart,
  piggy: PiggyBank,
  target: Target,
  users: Users,
}

const contacts = [
  { name: 'Marina Duarte', type: 'Cliente', variant: 'bg-muted text-foreground' },
  { name: 'Studio Vid', type: 'Lead', variant: 'bg-lime-400/10 text-lime-400/90 border border-lime-400/20' },
  { name: 'Andrade & Cia', type: 'Parceiro', variant: 'bg-muted text-foreground border border-border' },
]

function GastosVisual() {
  return (
    <div className="mt-6 flex items-center gap-6 rounded-xl border border-border bg-background p-4">
      <div className="relative h-20 w-20 shrink-0">
        <svg viewBox="0 0 140 140" className="h-full w-full -rotate-90">
          <circle cx="70" cy="70" r="34" fill="none" stroke="#3b82f6" strokeWidth="14" strokeDasharray="72.6 213.6" />
          <circle cx="70" cy="70" r="34" fill="none" stroke="#a3e635" strokeWidth="14" strokeDasharray="47 213.6" strokeDashoffset="-72.6" />
          <circle cx="70" cy="70" r="34" fill="none" stroke="#8b5cf6" strokeWidth="14" strokeDasharray="38.5 213.6" strokeDashoffset="-119.6" />
          <circle cx="70" cy="70" r="34" fill="none" stroke="#f97316" strokeWidth="14" strokeDasharray="55.5 213.6" strokeDashoffset="-158.1" />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center text-xl font-bold">R$</div>
      </div>
      <div className="flex-1 space-y-2">
        {[
          ['Alimentação', '#a3e635', '34%'],
          ['Contas', '#3b82f6', '26%'],
          ['Transporte', '#f97316', '22%'],
          ['Lazer', '#8b5cf6', '18%'],
        ].map(([label, color, pct]) => (
          <div key={label as string} className="flex items-center gap-2 text-[11px]">
            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: color as string }} />
            <span className="text-muted-foreground">{label}</span>
            <span className="ml-auto font-semibold">{pct}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

const budgets = [
  { name: 'Alimentação', spent: 'R$ 1.020,00', limit: 'R$ 1.500,00', pct: 68, tone: 'bg-primary' },
  { name: 'Transporte', spent: 'R$ 875,00', limit: 'R$ 950,00', pct: 92, tone: 'bg-orange-500' },
]

function OrcamentosVisual() {
  return (
    <div className="mt-6 space-y-4 rounded-xl border border-border bg-background p-4">
      {budgets.map((b) => (
        <div key={b.name}>
          <div className="mb-2 flex items-center justify-between text-[11px]">
            <span className="font-medium">{b.name}</span>
            <span className="text-muted-foreground">
              Gasto {b.spent} de {b.limit}
            </span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-muted">
            <div className={cn('h-full rounded-full', b.tone)} style={{ width: `${b.pct}%` }} />
          </div>
          <div className="mt-1 text-right text-[11px] font-semibold">{b.pct}%</div>
        </div>
      ))}
    </div>
  )
}

function MetasVisual() {
  return (
    <div className="mt-6 rounded-xl border border-border bg-background p-4">
      <div className="flex items-center gap-3">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-muted text-muted-foreground">
          <Target className="h-4 w-4" />
        </span>
        <div>
          <p className="text-sm font-semibold">Reserva de emergência</p>
          <p className="text-[11px] text-muted-foreground">Economizando R$ 800/mês</p>
        </div>
      </div>
      <div className="mt-4">
        <div className="mb-2 flex justify-between text-[11px]">
          <span className="text-muted-foreground">Progresso</span>
          <span className="font-semibold">34%</span>
        </div>
        <div className="h-2.5 overflow-hidden rounded-full bg-muted">
          <div className="h-full w-[34%] rounded-full bg-lime-400" />
        </div>
      </div>
      <div className="mt-3 rounded-lg bg-muted/50 px-3 py-2 text-center text-[11px] text-muted-foreground border border-border">
        Faltam <span className="font-semibold text-foreground">8 meses</span> para alcançar
      </div>
    </div>
  )
}

function ContatosVisual() {
  return (
    <div className="mt-6 space-y-2 rounded-xl border border-border bg-background p-4">
      {contacts.map((c) => (
        <div key={c.name} className="flex items-center gap-3 rounded-lg px-2 py-1.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-[10px] font-bold text-muted-foreground">
            {c.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
          </span>
          <span className="text-xs font-medium">{c.name}</span>
          <span className={cn('ml-auto rounded-full px-2 py-0.5 text-[10px] font-medium', c.variant)}>{c.type}</span>
        </div>
      ))}
    </div>
  )
}

export function Features() {
  return (
    <section id="recursos" className="relative border-t border-border">
      <div className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
        <Reveal className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-widest text-lime-400/90">{features.eyebrow}</p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">{features.kicker}</h2>
          <p className="mt-4 text-muted-foreground leading-relaxed">{features.subtitle}</p>
        </Reveal>

        <div className="mt-12 grid grid-cols-1 gap-4 lg:grid-cols-3">
          <Reveal delay={0.05} className="lg:col-span-2">
            <FeatureCard item={features.items[0]} excerpt={<GastosVisual />} />
          </Reveal>
          <Reveal delay={0.1}>
            <FeatureCard item={features.items[1]} excerpt={<OrcamentosVisual />} />
          </Reveal>
          <Reveal delay={0.1}>
            <FeatureCard item={features.items[2]} excerpt={<MetasVisual />} />
          </Reveal>
          <Reveal delay={0.15} className="lg:col-span-2">
            <FeatureCard item={features.items[3]} excerpt={<ContatosVisual />} />
          </Reveal>
        </div>
      </div>
    </section>
  )
}

function FeatureCard({ item, excerpt }: { item: typeof features.items[number]; excerpt: ReactNode }) {
  const Icon = iconMap[item.icon] ?? Target
  return (
    <article className="flex h-full flex-col rounded-2xl border border-border bg-card p-6 transition-colors duration-200 hover:bg-card/80">
      <div className="flex items-center gap-2.5">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-muted">
          <Icon className="h-4.5 w-4.5 text-muted-foreground" />
        </span>
        <span className="text-xs font-medium text-muted-foreground">{item.highlight}</span>
      </div>
      <h3 className="mt-5 text-lg font-semibold tracking-tight">{item.title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.description}</p>
      <div className="mt-auto">{excerpt}</div>
    </article>
  )
}