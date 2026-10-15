import { useState, useEffect, type FormEvent, type ChangeEvent } from 'react'
import { AlertCircle, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useFinance } from '../../finance/useFinance'
import { useToast } from '../../shared/components/Toast'
import { extractErrorMessage } from '../../shared/utils/backendError'
import { formatBRL } from '../../shared/utils/formatters'
import type { CategoryId, Expense, TransactionType } from '../../shared/types'
import { resolveSymbol } from '../../shared/components/CategorySymbol'

interface AddTransactionFormProps {
  isOpen: boolean
  onClose: () => void
  onAdd: (expense: Omit<Expense, 'id'>) => void | Promise<void>
  initialType?: TransactionType
}

export function AddTransactionForm({ isOpen, onClose, onAdd, initialType = 'expense' }: AddTransactionFormProps) {
  const { categories } = useFinance()
  const { showToast, showError } = useToast()
  const [amount, setAmount] = useState('')
  const [name, setName] = useState('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [categoryId, setCategoryId] = useState<CategoryId>('' as CategoryId)
  const [type, setType] = useState<TransactionType>(initialType)
  const [saving, setSaving] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const availableCategories = categories.filter(
    (c) => c.type === type
  )

  useEffect(() => {
    if (isOpen) {
      setType(initialType)
      setSubmitError(null)
    }
  }, [isOpen, initialType])

  // Keep a valid selection: if the current id is not in the visible list
  // (ex.: hardcoded default vs backend cd_id, or list just loaded),
  // auto-select the first available category instead of leaving none selected.
  useEffect(() => {
    if (!isOpen) return
    if (availableCategories.length === 0) {
      if (categoryId !== ('' as CategoryId)) setCategoryId('' as CategoryId)
      return
    }
    if (!availableCategories.some((c) => c.id === categoryId)) {
      setCategoryId(availableCategories[0].id as CategoryId)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, type, categories])

  // Preview ao vivo do payload que será enviado no POST /api/v1/transacao/criar.
  // Mesmo mapeamento do handleSubmit + transacoesApi.criar.
  const previewPayload = (() => {
    const digits = amount.replace(/\D/g, '')
    const valor = digits ? parseInt(digits, 10) / 100 : 0
    let data = date
    const parts = date.split('-')
    if (parts.length === 3 && parts[0] && parts[1] && parts[2]) {
      data = `${parts[2]}/${parts[1]}/${parts[0]}`
    }
    return {
      valor,
      descricao: name,
      data,
      categoria_id: Number(categoryId),
    }
  })()

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!amount || !name || !date) return
    const numericAmount = parseInt(amount.replace(/\D/g, ''), 10) / 100
    if (!numericAmount || numericAmount <= 0) return

    // Client-side guard before hitting the backend, so the user gets
    // immediate feedback instead of "Select a valid category" from the API.
    if (availableCategories.length === 0) {
      const message = `No ${type} categories yet. Create one in Categories first.`
      setSubmitError(message)
      showError(message)
      return
    }
    if (!categoryId || !availableCategories.some((c) => c.id === categoryId)) {
      const message = 'Select a category to continue.'
      setSubmitError(message)
      showError(message)
      return
    }
    if (!Number.isInteger(Number(categoryId))) {
      const message = 'This category is only saved locally. Recreate it in Categories while signed in to sync it, then try again.'
      setSubmitError(message)
      showError(message)
      return
    }

    // POST /api/v1/transacao/criar runs inside onAdd (FinanceContext).
    // Date goes as yyyy-MM-dd and is converted to dd/MM/yyyy there,
    // categoryId is the backend cd_id and is sent as categoria_id direto.
    // On failure the dialog stays open and the backend message is shown
    // inline + as an error toast — nothing is swallowed.
    setSaving(true)
    setSubmitError(null)
    try {
      // Debug: loga no console exatamente o objeto enviado ao backend.
      console.log('[transacao] criando com payload:', previewPayload, 'json:', JSON.stringify(previewPayload))
      await onAdd({ amount: numericAmount, name, date, categoryId, type })
      window.dispatchEvent(new CustomEvent('prisma:celebrate'))
      showToast(
        type === 'income'
          ? `Receita "${name}" registrada: ${formatBRL(numericAmount)}`
          : `"${name}" registrado: ${formatBRL(numericAmount)}`,
      )
      setAmount('')
      setName('')
      setDate(new Date().toISOString().split('T')[0])
      setCategoryId((availableCategories[0]?.id as CategoryId) ?? ('' as CategoryId))
      onClose()
    } catch (err) {
      const message = extractErrorMessage(err, 'Could not save transaction.')
      setSubmitError(message)
      showError(message)
    } finally {
      setSaving(false)
    }
  }

  const handleAmountChange = (e: ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/\D/g, '')
    if (!rawValue) { setAmount(''); return }
    const numberValue = parseInt(rawValue, 10) / 100
    setAmount(new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(numberValue))
  }

  const handleTypeChange = (nextType: TransactionType) => {
    if (nextType === type) return
    setType(nextType)
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose() }}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>New transaction</DialogTitle>
          <DialogDescription>Log income or an expense.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="flex bg-muted p-1 rounded-lg border border-border">
            <button
              type="button"
              onClick={() => handleTypeChange('expense')}
              className={`flex-1 py-2 text-sm font-semibold rounded-md transition-all ${type === 'expense' ? 'bg-destructive/20 text-destructive' : 'text-muted-foreground hover:text-foreground'}`}
            >
              Expense
            </button>
            <button
              type="button"
              onClick={() => handleTypeChange('income')}
              className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${type === 'income' ? 'bg-emerald-400/10 text-emerald-300' : 'text-muted-foreground hover:text-foreground'}`}
            >
              Income
            </button>
          </div>

          <div className="space-y-2">
            <Label>Amount</Label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-medium text-muted-foreground">R$</span>
              <Input
                type="text"
                inputMode="numeric"
                placeholder="0,00"
                value={amount}
                onChange={handleAmountChange}
                className="pl-14 text-3xl font-semibold h-14"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Description</Label>
              <Input
                placeholder="E.g. Bakery"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Date</Label>
              <Input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Category</Label>
            {availableCategories.length === 0 ? (
              <p className="border border-dashed border-edge px-4 py-3 text-sm text-fg-muted">
                No {type} categories yet. Create one in Categories first.
              </p>
            ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2" role="radiogroup" aria-label="Category">
              {availableCategories.map((info) => {
                const selected = categoryId === info.id
                const { Icon: InfoIcon } = resolveSymbol(info.icon, info.name)
                return (
                <button
                  key={info.id}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  aria-pressed={selected}
                  aria-label={`Category ${info.name}${selected ? ', selected' : ''}`}
                  onClick={() => { setCategoryId(info.id as CategoryId); setSubmitError(null) }}
                  className={`flex items-center gap-3 p-3 rounded-xl border transition-all outline-none focus-visible:ring-2 focus-visible:ring-brand ${
                    selected
                      ? 'border-brand bg-brand-soft ring-1 ring-brand/40'
                      : 'border-edge hover:border-brand/40 hover:bg-white/[0.04]'
                  }`}
                >
                  <span className="flex w-8 h-8 rounded-lg shrink-0 items-center justify-center" style={{ backgroundColor: info.color }} aria-hidden>
                    <InfoIcon className="size-4 text-black/75" strokeWidth={2.2} />
                  </span>
                  <span className="text-sm truncate">{info.name}</span>
                  {selected && <Check className="ml-auto size-4 shrink-0 text-brand" strokeWidth={2.4} aria-hidden />}
                </button>
                )
              })}
            </div>
            )}
          </div>

          <DialogFooter className="flex-col gap-3">
            {submitError && (
              <div
                role="alert"
                className="flex w-full items-start gap-2.5 rounded-xl border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm"
              >
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
                <span className="font-medium">{submitError}</span>
              </div>
            )}
            <Button type="submit" className="w-full" disabled={saving}>
              {saving ? 'Saving...' : 'Save transaction'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
