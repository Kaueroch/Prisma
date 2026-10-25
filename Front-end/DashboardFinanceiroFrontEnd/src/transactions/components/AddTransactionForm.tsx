import { useState, useEffect, type FormEvent, type ChangeEvent } from 'react'
import { AlertCircle, Check, X, Loader2 } from 'lucide-react'
import { motion, useAnimationControls, useReducedMotion } from 'motion/react'
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
import { DURATION, EASE } from '../../shared/motion/tokens'
import { cn } from '@/lib/utils'
import type { CategoryId, Expense, TransactionType } from '../../shared/types'
import { resolveSymbol, symbolicCategorySymbol, CATEGORY_SYMBOLS } from '../../shared/components/CategorySymbol'
import { symbolicCategoryColor } from '../../shared/utils/categoryColor'

interface AddTransactionFormProps {
  isOpen: boolean
  onClose: () => void
  onAdd: (expense: Omit<Expense, 'id'>) => void | Promise<void>
  onEdit?: (updates: Omit<Expense, 'id'>) => void | Promise<void>
  initialData?: Expense
  initialType?: TransactionType
}

export function AddTransactionForm({ isOpen, onClose, onAdd, onEdit, initialData, initialType = 'expense' }: AddTransactionFormProps) {
  const isEditing = initialData !== undefined
  const { categories, addCategory } = useFinance()
  const { showToast, showError } = useToast()
  const reduceMotion = useReducedMotion()
  const amountScale = useAnimationControls()
  const [amount, setAmount] = useState('')
  const [name, setName] = useState('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [categoryId, setCategoryId] = useState<CategoryId>('' as CategoryId)
  const [note, setNote] = useState('')
  const [type, setType] = useState<TransactionType>(initialType)
  const [saving, setSaving] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [creatingCategory, setCreatingCategory] = useState(false)
  const [newCatName, setNewCatName] = useState('')
  const [newCatSymbol, setNewCatSymbol] = useState<string>(() => symbolicCategorySymbol('?'))
  const [symbolTouched, setSymbolTouched] = useState(false)
  const [creatingSaving, setCreatingSaving] = useState(false)

  const availableCategories = categories.filter(
    (c) => c.type === type
  )

  useEffect(() => {
    if (isOpen) {
      setSubmitError(null)
      setCreatingCategory(false)
      setNewCatName('')
      setNewCatSymbol(symbolicCategorySymbol('?'))
      setSymbolTouched(false)
      if (initialData) {
        setType(initialData.type)
        setAmount(new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(initialData.amount))
        setName(initialData.name)
        setDate(initialData.date)
        setCategoryId(initialData.categoryId)
        setNote(initialData.note ?? '')
      } else {
        setType(initialType)
        setAmount('')
        setName('')
        setDate(new Date().toISOString().split('T')[0])
        setNote('')
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen])

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

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!amount || !name || !date) return
    const numericAmount = parseInt(amount.replace(/\D/g, ''), 10) / 100
    if (!numericAmount || numericAmount <= 0) return

    // Client-side guard before hitting the backend, so the user gets
    // immediate feedback instead of "Select a valid category" from the API.
    if (availableCategories.length === 0) {
      const message = `Nenhuma categoria de ${type === 'income' ? 'receita' : 'despesa'} ainda. Crie uma em Categorias primeiro.`
      setSubmitError(message)
      showError(message)
      return
    }
    if (!categoryId || !availableCategories.some((c) => c.id === categoryId)) {
      const message = 'Selecione uma categoria para continuar.'
      setSubmitError(message)
      showError(message)
      return
    }
    // O cd_id do banco é numérico. `Number('')` e `Number(null)` dão 0 e
    // passariam como inteiros, então a checagem é sobre o id cru.
    if (!/^\d+$/.test(String(categoryId))) {
      const message = 'Esta categoria só está salva localmente. Recrie-a em Categorias estando logado para sincronizar e tente novamente.'
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
      if (isEditing && onEdit) {
        await onEdit({ amount: numericAmount, name, date, categoryId, type, note })
        showToast(`Transação "${name}" atualizada.`)
      } else {
        await onAdd({ amount: numericAmount, name, date, categoryId, type, note })
        window.dispatchEvent(new CustomEvent('prisma:celebrate'))
        showToast(
          type === 'income'
            ? `Receita "${name}" registrada: ${formatBRL(numericAmount)}`
            : `"${name}" registrado: ${formatBRL(numericAmount)}`,
        )
      }
      setAmount('')
      setName('')
      setDate(new Date().toISOString().split('T')[0])
      setCategoryId((availableCategories[0]?.id as CategoryId) ?? ('' as CategoryId))
      setNote('')
      onClose()
    } catch (err) {
      const message = extractErrorMessage(err, 'Não foi possível salvar a transação.')
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

  // Tick: o valor dá um pulo a cada dígito digitado. A animação é disparada
  // por controls em vez de trocar a key do wrapper — remontar o <Input> a
  // cada tecla tirava o foco do campo no primeiro dígito digitado.
  useEffect(() => {
    if (reduceMotion || !amount) return
    amountScale.start({ scale: [1, 1.02, 1] })
  }, [amount, reduceMotion, amountScale])

  const handleTypeChange = (nextType: TransactionType) => {
    if (nextType === type) return
    setType(nextType)
    setCreatingCategory(false)
    setNewCatName('')
    setNewCatSymbol(symbolicCategorySymbol('?'))
    setSymbolTouched(false)
  }

  const pickSymbol = (id: string) => {
    setNewCatSymbol(id)
    setSymbolTouched(true)
  }
  const handleNewName = (value: string) => {
    setNewCatName(value)
    if (!symbolTouched) setNewCatSymbol(symbolicCategorySymbol(value || '?'))
  }

  const handleCreateCategory = async () => {
    const name = newCatName.trim()
    if (!name) return
    if (availableCategories.some((c) => c.name.toLowerCase() === name.toLowerCase())) {
      const message = 'Já existe uma categoria com esse nome.'
      setSubmitError(message)
      showError(message)
      return
    }
    setCreatingSaving(true)
    setSubmitError(null)
    try {
      const cat = await addCategory({
        name,
        color: symbolicCategoryColor(name),
        bgClass: 'bg-white/10',
        textClass: 'text-white',
        icon: newCatSymbol,
        type,
      })
      setCategoryId(cat.id as CategoryId)
      setNewCatName('')
      setNewCatSymbol(symbolicCategorySymbol('?'))
      setSymbolTouched(false)
      setCreatingCategory(false)
      showToast(`Categoria "${name}" criada.`)
    } catch (err) {
      const message = extractErrorMessage(err, 'Não foi possível criar a categoria.')
      setSubmitError(message)
      showError(message)
    } finally {
      setCreatingSaving(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose() }}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Editar transação' : 'Nova transação'}</DialogTitle>
          <DialogDescription>{isEditing ? 'Altere os campos e salve.' : 'Registre uma receita ou uma despesa.'}</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="relative flex bg-muted p-1 rounded-lg border border-border">
            {/* Pill do tipo ativo: desliza entre Despesa e Receita. */}
            <motion.span
              layoutId="tx-type-pill"
              className={cn(
                'absolute inset-y-1 rounded-md',
                type === 'expense' ? 'left-1 bg-destructive/20' : 'left-1/2 right-1 bg-positive/10',
              )}
              transition={reduceMotion ? { duration: 0 } : { duration: DURATION.base, ease: EASE }}
            />
            <button
              type="button"
              onClick={() => handleTypeChange('expense')}
              className={`relative flex-1 py-2 text-sm font-semibold rounded-md transition-colors ${type === 'expense' ? 'text-destructive' : 'text-muted-foreground hover:text-foreground'}`}
            >
              Despesa
            </button>
            <button
              type="button"
              onClick={() => handleTypeChange('income')}
              className={`relative flex-1 py-2 text-sm font-semibold rounded-lg transition-colors ${type === 'income' ? 'text-positive' : 'text-muted-foreground hover:text-foreground'}`}
            >
              Receita
            </button>
          </div>

          <div className="space-y-2">
            <Label>Valor</Label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-medium text-muted-foreground">R$</span>
              {/* Tick: o valor dá um pulo a cada dígito digitado. */}
              <motion.div
                animate={amountScale}
                initial={reduceMotion ? false : { scale: 1 }}
                transition={{ duration: DURATION.fast, ease: EASE }}
                className="relative"
              >
                <Input
                  type="text"
                  inputMode="numeric"
                  placeholder="0,00"
                  value={amount}
                  onChange={handleAmountChange}
                  className="pl-14 text-3xl font-semibold h-14"
                  required
                />
              </motion.div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Descrição</Label>
              <Input
                placeholder="Ex.: Padaria"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Data</Label>
              <Input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Observação (opcional)</Label>
            <Input
              placeholder="Ex.: Reunião de negócios"
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Categoria</Label>
            {availableCategories.length === 0 && !creatingCategory ? (
              <div className="flex flex-col gap-2">
                <p className="border border-dashed border-edge px-4 py-3 text-sm text-fg-muted">
                  Nenhuma categoria de {type === 'income' ? 'receita' : 'despesa'} ainda.
                </p>
                <button
                  type="button"
                  onClick={() => setCreatingCategory(true)}
                  className="flex items-center justify-center gap-2 rounded-xl border border-dashed border-edge bg-transparent px-4 py-3 text-sm font-medium text-fg-muted transition-all hover:border-brand/40 hover:bg-white/[0.04] hover:text-foreground"
                >
                  + Criar categoria
                </button>
              </div>
            ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2" role="radiogroup" aria-label="Categoria">
              {availableCategories.map((info) => {
                const selected = categoryId === info.id
                const { Icon: InfoIcon } = resolveSymbol(info.icon, info.name)
                // Categoria só existe no cache local (id não numérico) — ela
                // não tem cd_id no banco, então não dá para lançar contra ela.
                const isLocalOnly = !/^\d+$/.test(String(info.id))
                return (
                <motion.button
                  key={info.id}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  aria-pressed={selected}
                  aria-label={`Categoria ${info.name}${isLocalOnly ? ', não sincronizada' : ''}${selected ? ', selecionada' : ''}`}
                  onClick={() => { setCategoryId(info.id as CategoryId); setSubmitError(null) }}
                  animate={selected && !reduceMotion ? { scale: [1, 1.02, 1] } : { scale: 1 }}
                  transition={{ duration: DURATION.base, ease: EASE }}
                  className={`flex flex-col items-stretch gap-1.5 p-3 rounded-xl border transition-colors outline-none focus-visible:ring-2 focus-visible:ring-brand ${
                    selected
                      ? 'border-brand bg-brand-soft ring-1 ring-brand/40'
                      : 'border-edge hover:border-brand/40 hover:bg-white/[0.04]'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <span className="flex w-8 h-8 rounded-lg shrink-0 items-center justify-center" style={{ backgroundColor: info.color }} aria-hidden>
                      <InfoIcon className="size-4 text-black/75" strokeWidth={2.2} />
                    </span>
                    <span className="text-sm truncate">{info.name}</span>
                    {selected && (
                      <motion.span
                        initial={reduceMotion ? false : { scale: 0.4, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: DURATION.base, ease: EASE }}
                        className="ml-auto flex shrink-0"
                      >
                        <Check className="size-4 text-brand" strokeWidth={2.4} aria-hidden />
                      </motion.span>
                    )}
                  </span>
                  {isLocalOnly && (
                    <span
                      title="Só existe neste navegador — recrie a categoria para sincronizar"
                      className="self-start rounded border border-edge px-1.5 py-0.5 text-[10px] font-medium text-fg-subtle"
                    >
                      local
                    </span>
                  )}
                </motion.button>
                )
              })}
              {creatingCategory ? (
                <div className="col-span-2 sm:col-span-3 flex flex-col gap-3">
                  <div className="flex flex-col sm:flex-row items-stretch gap-2">
                    <Input
                      value={newCatName}
                      onChange={(e) => handleNewName(e.target.value)}
                      placeholder="Nome da categoria"
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault()
                          handleCreateCategory()
                        }
                      }}
                    />
                    <Button type="button" onClick={handleCreateCategory} disabled={creatingSaving || !newCatName.trim()}>
                      {creatingSaving ? 'Criando...' : 'Criar'}
                    </Button>
                    <Button type="button" variant="ghost" onClick={() => { setCreatingCategory(false); setNewCatName(''); setNewCatSymbol(symbolicCategorySymbol('?')); setSymbolTouched(false) }}>
                      <X className="size-4" />
                    </Button>
                  </div>
                  <div className="grid grid-cols-6 sm:grid-cols-12 gap-1.5" role="radiogroup" aria-label="Ícone da categoria">
                    {CATEGORY_SYMBOLS.map(({ id, label, Icon }) => {
                      const selected = newCatSymbol === id
                      return (
                        <button
                          key={id}
                          type="button"
                          role="radio"
                          aria-checked={selected}
                          title={label}
                          aria-label={label}
                          onClick={() => pickSymbol(id)}
                          className={`flex h-9 items-center justify-center rounded-lg border transition-all outline-none focus-visible:ring-2 focus-visible:ring-brand ${
                            selected
                              ? 'border-brand bg-brand-soft ring-1 ring-brand/40'
                              : 'border-edge hover:border-brand/40 hover:bg-white/[0.04]'
                          }`}
                        >
                          <Icon className={`size-4 ${selected ? 'text-brand' : 'text-fg-muted'}`} strokeWidth={2} aria-hidden />
                        </button>
                      )
                    })}
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setCreatingCategory(true)}
                  className="flex items-center justify-center gap-2 p-3 rounded-xl border border-dashed border-edge bg-transparent text-sm font-medium text-fg-muted transition-all hover:border-brand/40 hover:bg-white/[0.04] hover:text-foreground"
                >
                  + Criar categoria
                </button>
              )}
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
              {saving ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Salvando...
                </>
              ) : isEditing ? (
                'Salvar alterações'
              ) : (
                'Salvar transação'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
