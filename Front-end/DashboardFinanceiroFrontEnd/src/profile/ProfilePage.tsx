import { useState } from 'react'
import { Send, LogOut, Tags, ArrowRight, ExternalLink, Clock, FlaskConical } from 'lucide-react'
import { useAuth } from '../auth/AuthContext'
import type { Tab } from '../shared/types'
import { telegramInbox } from '../telegram/TelegramInbox'
import { useFinance } from '../finance/useFinance'

export function ProfilePage({ setActiveTab }: { setActiveTab?: (tab: Tab) => void } = {}) {
  const { user, logout } = useAuth()
  const { categories } = useFinance()
  const [link, setLink] = useState<string | null>(null)
  const [simMsg, setSimMsg] = useState<string | null>(null)

  const initials = user?.name?.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2) || 'U'

  function handleGenerate() {
    // Frontend-only: generate a simulated deep link. The real backend would issue
    // POST /owner/telegram-invite as in money-flow.
    const fake = `https://t.me/PrismaBot?start=${Math.random().toString(36).slice(2, 10)}`
    setLink(fake)
  }

  function handleSimulate() {
    const cat = categories[0]
    const res = telegramInbox.simulate({
      text: 'Coffee 12',
      amount: 12,
      categoryId: cat?.id,
      categoryName: cat?.name,
    })
    setSimMsg(`Gasto "${res.name}" de ${res.amount} chegou pela caixa do Telegram e já está no painel.`)
    setActiveTab?.('home')
  }

  return (
    <main className="bg-page-grid flex-1 overflow-y-auto px-4 pt-9 pb-10 sm:px-6 lg:px-10">
      <header className="mb-7 flex flex-col gap-2.5">
        <span className="text-[13px] font-medium text-fg-muted">Preferências</span>
        <h1 className="font-display text-5xl leading-[52px] font-normal tracking-[-0.02em] text-fg">Configurações</h1>
        <p className="text-[15px] text-fg-muted">Conecte seus serviços à sua conta Prisma.</p>
      </header>

      <div className="flex max-w-xl flex-col gap-6">
        <section className="flex flex-col gap-6 rounded-xl border border-edge bg-surface p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <span className="flex size-12 items-center justify-center rounded-xl bg-brand font-display text-lg font-bold text-white">
              {initials}
            </span>
            <div className="flex flex-col">
              <span className="font-display text-xl text-fg">{user?.name || 'User'}</span>
              <span className="text-xs text-fg-subtle">{user?.email || ''}</span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setActiveTab?.('categories')}
            className="flex w-fit items-center gap-2 border border-edge px-5 py-3 text-sm text-fg-muted transition-colors hover:border-brand/40 hover:text-fg"
          >
            <Tags className="size-4" strokeWidth={1.8} />
            Gerenciar categorias
          </button>
        </section>

        <section className="flex flex-col gap-6 border border-edge bg-surface p-6">
          <div className="flex items-start gap-4">
            <span className="flex size-10 shrink-0 items-center justify-center border border-edge">
              <Send className="size-5 text-fg-muted" strokeWidth={1.8} />
            </span>
            <div className="flex flex-col gap-1">
              <h2 className="font-display text-2xl font-normal text-fg">Telegram</h2>
              <p className="text-sm text-fg-muted">
                Link the bot to log expenses by message. Each expense lands in the inbox and shows up in the dashboard.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={handleGenerate}
              className="flex w-fit items-center gap-2.5 rounded-lg bg-brand px-5 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-brand-strong"
            >
              Conectar Telegram
              <ArrowRight className="size-4" strokeWidth={2.2} />
            </button>
            <button
              type="button"
              onClick={handleSimulate}
              className="flex w-fit items-center gap-2 border border-edge px-5 py-3.5 text-sm text-fg-muted transition-colors hover:border-brand/40 hover:text-fg"
            >
              <FlaskConical className="size-4" strokeWidth={1.8} />
              Simular gasto do bot
            </button>
          </div>

          {link && (
            <div className="flex flex-col gap-3 border border-edge bg-surface-raised px-5 py-4">
              <a href={link} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 break-all text-sm font-medium text-data hover:underline">
                <ExternalLink className="size-4 shrink-0" strokeWidth={1.8} />
                {link}
              </a>
              <p className="flex items-center gap-2 text-xs text-fg-subtle">
                <Clock className="size-3.5 shrink-0" strokeWidth={1.8} />
                Simulated link (frontend-only). The real backend would generate one expiring in 1 minute.
              </p>
            </div>
          )}
          {simMsg && (
            <div className="border border-brand/40 bg-brand-soft px-4 py-3 text-sm text-fg">{simMsg}</div>
          )}
          <p className="text-[12px] leading-relaxed text-fg-subtle">
            No new backend: the simulation writes directly to localStorage via telegramInbox. When the real bot exists, swap simulate() for polling /telegram/inbox.
          </p>
        </section>

        <section className="flex flex-col border border-edge bg-surface">
          <button
            type="button"
            onClick={logout}
            className="flex w-full items-center gap-4 p-5 transition-colors hover:bg-white/[0.03]"
          >
            <span className="flex size-10 items-center justify-center border border-negative/40">
              <LogOut className="size-5 text-negative" strokeWidth={1.8} />
            </span>
            <span className="flex-1 text-left font-medium text-negative">Sair</span>
          </button>
        </section>
      </div>
    </main>
  )
}
