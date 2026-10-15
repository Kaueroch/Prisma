import { useState } from 'react'
import { Send, LogOut, Tags, ArrowRight, ExternalLink, Clock, FlaskConical, SlidersHorizontal, Database, Download, Trash2 } from 'lucide-react'
import { useAuth } from '../auth/AuthContext'
import type { Tab } from '../shared/types'
import { telegramInbox } from '../telegram/TelegramInbox'
import { useFinance } from '../finance/useFinance'
import { getPrefs, savePrefs, exportLocalData, clearLocalData, type Prefs } from '../shared/services/prefsService'

function PrefSwitch({ label, hint, checked, onChange }: { label: string; hint: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="flex w-full items-center justify-between gap-4 py-1 text-left"
    >
      <span className="flex min-w-0 flex-col gap-0.5">
        <span className="text-sm font-medium text-fg">{label}</span>
        <span className="text-xs text-fg-muted">{hint}</span>
      </span>
      <span className={`flex h-6 w-11 shrink-0 items-center rounded-full p-0.5 transition-colors ${checked ? 'justify-end bg-brand' : 'justify-start bg-surface-raised'}`}>
        <span className="size-5 rounded-full bg-white" />
      </span>
    </button>
  )
}

function PrefSegment<T extends string>({ label, options, value, onChange }: { label: string; options: { value: T; label: string }[]; value: T; onChange: (v: T) => void }) {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-sm font-medium text-fg">{label}</span>
      <div className="flex rounded-xl border border-edge bg-surface-raised/50 p-1">
        {options.map((o) => (
          <button
            key={o.value}
            type="button"
            aria-pressed={value === o.value}
            onClick={() => onChange(o.value)}
            className={`flex-1 rounded-lg py-2 text-[13px] font-medium transition-colors ${value === o.value ? 'bg-brand text-white' : 'text-fg-muted hover:text-fg'}`}
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  )
}

export function ProfilePage({ setActiveTab }: { setActiveTab?: (tab: Tab) => void } = {}) {
  const { user, logout } = useAuth()
  const { categories } = useFinance()
  const [link, setLink] = useState<string | null>(null)
  const [simMsg, setSimMsg] = useState<string | null>(null)
  const [prefs, setPrefsState] = useState<Prefs>(() => getPrefs())
  const [nameDraft, setNameDraft] = useState(prefs.displayName)
  const [nameSaved, setNameSaved] = useState(false)

  const updatePrefs = (patch: Partial<Prefs>) => setPrefsState(savePrefs(patch))

  const saveName = () => {
    updatePrefs({ displayName: nameDraft.trim() })
    setNameSaved(true)
    setTimeout(() => setNameSaved(false), 2000)
  }

  const downloadData = () => {
    const blob = new Blob([exportLocalData()], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'prisma-dados.json'
    a.click()
    URL.revokeObjectURL(url)
  }

  const wipeData = () => {
    if (!window.confirm('Apagar todos os dados locais (transações, metas e preferências)? Dá para importar de novo depois.')) return
    clearLocalData()
    window.location.reload()
  }

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

        <section className="flex flex-col gap-5 rounded-xl border border-edge bg-surface p-6 shadow-sm">
          <div className="flex items-start gap-4">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-brand-soft">
              <SlidersHorizontal className="size-5 text-brand" strokeWidth={1.8} />
            </span>
            <div className="flex flex-col gap-1">
              <h2 className="font-display text-2xl font-normal text-fg">Preferências</h2>
              <p className="text-sm text-fg-muted">
                Valem toda vez que você voltar.
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="pref-name" className="text-sm font-medium text-fg">Como te chamo no painel?</label>
            <div className="flex items-center gap-2">
              <input
                id="pref-name"
                placeholder={user?.name || 'Seu nome'}
                value={nameDraft}
                onChange={(e) => setNameDraft(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && saveName()}
                className="h-10 min-w-0 flex-1 rounded-xl border border-edge bg-surface-raised px-3 text-sm text-fg outline-none placeholder:text-fg-subtle focus:border-brand/60"
              />
              <button
                type="button"
                onClick={saveName}
                className="h-10 shrink-0 rounded-xl bg-brand px-4 text-sm font-semibold text-white transition-colors hover:bg-brand-strong"
              >
                {nameSaved ? 'Salvo' : 'Salvar'}
              </button>
            </div>
          </div>

          <PrefSegment
            label="Nova transação abre em"
            value={prefs.defaultTxType}
            onChange={(v) => updatePrefs({ defaultTxType: v })}
            options={[
              { value: 'expense', label: 'Despesa' },
              { value: 'income', label: 'Receita' },
            ]}
          />
          <PrefSegment
            label="Painel e Transações abrem em"
            value={prefs.startMonth}
            onChange={(v) => updatePrefs({ startMonth: v })}
            options={[
              { value: 'current', label: 'Mês atual' },
              { value: 'previous', label: 'Mês passado' },
            ]}
          />

          <div className="flex flex-col divide-y divide-edge">
            <PrefSwitch
              label="Ocultar valores ao abrir"
              hint="O painel começa com os números escondidos."
              checked={prefs.maskByDefault}
              onChange={(v) => updatePrefs({ maskByDefault: v })}
            />
            <PrefSwitch
              label="Sidebar expandida ao abrir"
              hint="Mostra os nomes das telas desde o início."
              checked={prefs.sidebarExpanded}
              onChange={(v) => updatePrefs({ sidebarExpanded: v })}
            />
          </div>
        </section>

        <section className="flex flex-col gap-5 rounded-xl border border-edge bg-surface p-6 shadow-sm">
          <div className="flex items-start gap-4">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-brand-soft">
              <Database className="size-5 text-brand" strokeWidth={1.8} />
            </span>
            <div className="flex flex-col gap-1">
              <h2 className="font-display text-2xl font-normal text-fg">Seus dados</h2>
              <p className="text-sm text-fg-muted">
                Tudo fica no seu navegador. Leve com você ou apague quando quiser.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={downloadData}
              className="flex w-fit items-center gap-2 rounded-xl border border-edge px-5 py-3 text-sm text-fg-muted transition-colors hover:border-brand/40 hover:text-fg"
            >
              <Download className="size-4" strokeWidth={1.8} />
              Exportar dados
            </button>
            <button
              type="button"
              onClick={wipeData}
              className="flex w-fit items-center gap-2 rounded-xl border border-edge px-5 py-3 text-sm text-fg-muted transition-colors hover:border-negative/50 hover:text-negative"
            >
              <Trash2 className="size-4" strokeWidth={1.8} />
              Apagar tudo
            </button>
          </div>
        </section>

        <section className="flex flex-col gap-6 border border-edge bg-surface p-6">
          <div className="flex items-start gap-4">
            <span className="flex size-10 shrink-0 items-center justify-center border border-edge">
              <Send className="size-5 text-fg-muted" strokeWidth={1.8} />
            </span>
            <div className="flex flex-col gap-1">
              <h2 className="font-display text-2xl font-normal text-fg">Telegram</h2>
              <p className="text-sm text-fg-muted">
                Conecte o bot para lançar gastos por mensagem. Cada gasto cai na caixa de entrada e aparece no painel.
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
                Link simulado (só front). O backend de verdade geraria um que expira em 1 minuto.
              </p>
            </div>
          )}
          {simMsg && (
            <div className="border border-brand/40 bg-brand-soft px-4 py-3 text-sm text-fg">{simMsg}</div>
          )}
          <p className="text-[12px] leading-relaxed text-fg-subtle">
            Sem backend novo: a simulação escreve direto no localStorage via telegramInbox. Quando o bot de verdade existir, troque simulate() por polling em /telegram/inbox.
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
