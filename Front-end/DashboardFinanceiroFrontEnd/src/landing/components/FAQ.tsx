import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { useReducedMotion } from '../../shared/motion/useReducedMotion'
import { Reveal } from './Reveal'
import { faq } from '../content'
import { cn } from '../utils'

export function FAQ() {
  const [open, setOpen] = useState<number | null>(0)
  const reduce = useReducedMotion()

  return (
    <section id="faq" className="border-t border-edge bg-surface">
      <div className="mx-auto w-full max-w-3xl px-4 py-16 sm:px-6 sm:py-24">
        <Reveal className="text-center">
          <p className="eyebrow">{faq.eyebrow}</p>
          <h2 className="mt-3 font-display text-3xl font-semibold tracking-[-0.03em] text-gradient sm:text-4xl">{faq.kicker}</h2>
        </Reveal>

        <div className="mt-12 space-y-3">
          {faq.items.map((item, i) => {
            const isOpen = open === i
return (
              <div key={item.question}>
                <Reveal delay={i * 0.04}>
                  <div className={cn(
                    'overflow-hidden rounded-xl border transition-colors duration-200',
                    isOpen ? 'border-edge bg-surface' : 'border-edge bg-transparent hover:bg-surface',
                  )}>
                    <button
                      type="button"
                      onClick={() => setOpen(isOpen ? null : i)}
                      aria-expanded={isOpen}
                      aria-controls={`faq-panel-${i}`}
                      className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left outline-none focus-visible:ring-2 focus-visible:ring-ring/50 "
                    >
                      <span className="text-sm font-medium sm:text-base">{item.question}</span>
                      <ChevronDown
                        className={cn(
                          'h-4 w-4 shrink-0 text-fg-muted transition-transform duration-200',
                          isOpen && 'rotate-180',
                        )}
                      />
                    </button>
                    <AnimatePresence initial={false}>
                      {isOpen && (
                        <motion.div
                          id={`faq-panel-${i}`}
                          initial={reduce ? false : { height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={reduce ? { height: 0, opacity: 0 } : { height: 0, opacity: 0 }}
                          transition={{ duration: 0.25, ease: 'easeInOut' }}
                          className="overflow-hidden"
                        >
                          <p className="px-5 pb-5 text-sm leading-relaxed text-fg-muted border-t border-edge pt-4">
                            {item.answer}
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </Reveal>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}