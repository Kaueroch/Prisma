import { ArrowRight, Check, CirclePlay } from 'lucide-react'
import { Button } from '../ui/Button'
import { DashboardMockup } from './DashboardMockup'
import { Reveal } from './Reveal'
import { hero, statStrip } from '../content'
import { motion } from 'motion/react'

export function Hero() {
  return (
    <section id="inicio" className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div className="absolute -top-32 left-1/2 h-[520px] w-[720px] -translate-x-1/2 rounded-full bg-brand/[0.05] blur-[130px]" />
        <div className="absolute right-[-10%] top-1/3 h-[420px] w-[420px] rounded-full bg-white/[0.02] blur-[120px]" />
        <div className="absolute bottom-[-20%] left-[-10%] h-[460px] w-[460px] rounded-full bg-white/[0.02] blur-[120px]" />
      </div>

      <div className="relative mx-auto w-full max-w-6xl px-4 pt-16 pb-14 sm:px-6 sm:pt-24 sm:pb-20">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-10">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          >
            <span className="eyebrow">{hero.badge}</span>

            <h1 className="mt-6 font-display text-5xl font-normal leading-[52px] tracking-[-0.02em] text-fg sm:text-6xl">
              {hero.titleTop}
              <br />
              <span className="text-fg-muted">{hero.titleAccent}</span>
            </h1>

            <p className="mt-5 max-w-md text-[15px] leading-relaxed text-fg-muted">
              {hero.subtitle}
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Button href={hero.ctaHref} size="lg">
                {hero.primaryCta}
                <ArrowRight className="h-4 w-4" />
              </Button>
              <Button href="#recursos" variant="outline" size="lg">
                <CirclePlay className="h-4 w-4" />
                {hero.secondaryCta}
              </Button>
            </div>

            <p className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-1 text-[13px] text-fg-subtle">
              <Check className="h-3.5 w-3.5 text-brand" />
              {hero.trustLine.map((item) => (
                <span key={item} className="flex items-center gap-1.5">
                  {item}
                </span>
              ))}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 32, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.15, ease: 'easeOut' }}
          >
            <DashboardMockup />
          </motion.div>
        </div>

        <Reveal delay={0.2} className="mt-16">
          <dl className="grid grid-cols-2 gap-px overflow-hidden border border-edge bg-edge md:grid-cols-4">
            {statStrip.map((s) => (
              <div key={s.label} className="flex flex-col gap-1 bg-surface px-6 py-5">
                <dt className="order-2 text-[13px] text-fg-subtle">{s.label}</dt>
                <dd className="order-1 font-display text-xl font-medium tracking-tight text-fg tabular-nums">{s.value}</dd>
              </div>
            ))}
          </dl>
        </Reveal>
      </div>
    </section>
  )
}