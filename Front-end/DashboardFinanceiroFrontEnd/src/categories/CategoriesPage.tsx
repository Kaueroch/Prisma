import { useState, useMemo } from 'react'
import { useFinance } from '../finance/useFinance'
import type { CategoryId, CategoryKind, CategoryInfo, Expense } from '../shared/types'
import { Plus, ChevronDown, ChevronUp, Trash2, Edit2, Check, X, Tags } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { motion, AnimatePresence } from 'motion/react'
import { formatBRL, formatDateBR } from '../shared/utils/formatters'
import { ConfirmDialog } from '../shared/components/ConfirmDialog'
import { symbolicCategoryColor, SYMBOLIC_CATEGORY_PALETTE } from '../shared/utils/categoryColor'
import { CATEGORY_SYMBOLS, CategorySymbol, symbolicCategorySymbol } from '../shared/components/CategorySymbol'
import { cn } from '@/lib/utils'

/**
 * Extrai uma mensagem legível de um erro do backend.
 * O backend às vezes devolve JSON cru (`{"error":"..."}`) — mostrar isso
 * na tela é ruído; aqui vira uma frase.
 */
function friendlyError(raw: string): string {
  const trimmed = raw.trim()
  if (!trimmed.startsWith('{')) return trimmed
  try {
    const parsed = JSON.parse(trimmed) as Record<string, unknown>
    const message = parsed.error ?? parsed.message
    if (typeof message === 'string' && message) return message
  } catch {
    // JSON inválido: cai no retorno abaixo.
  }
  return 'Não foi possível carregar as categorias.'
}

export function CategoriesPage() {
  const { categories, expenses, addCategory, deleteCategory, updateCategory, loading, categoriesError } = useFinance()
  const [expandedId, setExpandedId] = useState<CategoryId | null>(null)
  const [isAdding, setIsAdding] = useState(false)
  const [newCatName, setNewCatName] = useState('')
  const [newCatType, setNewCatType] = useState<CategoryKind>('expense')
  const [newCatSymbol, setNewCatSymbol] = useState<string>(() => symbolicCategorySymbol('?'))
  const [symbolTouched, setSymbolTouched] = useState(false)
  const [newCatColorOverride, setNewCatColorOverride] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const [editSymbol, setEditSymbol] = useState('')
  const [editType, setEditType] = useState<CategoryKind>('expense')
  const [editColor, setEditColor] = useState<string | null>(null)
  /** Aviso modal no lugar de `alert()`. */
  const [notice, setNotice] = useState<{ title: string; description: string } | null>(null)
  /** Categoria aguardando confirmação de exclusão. */
  const [pendingDelete, setPendingDelete] = useState<CategoryInfo | null>(null)
  const newAutomáticoColor = symbolicCategoryColor(newCatName.trim() || '?')
  const pickSymbol = (id: string) => {
    setNewCatSymbol(id)
    setSymbolTouched(true)
  }
  const handleNewName = (value: string) => {
    setNewCatName(value)
    if (!symbolTouched) setNewCatSymbol(symbolicCategorySymbol(value || '?'))
  }

  const grouped = useMemo(() => expenses.reduce((acc, expense) => {
    if (!acc[expense.categoryId]) {
      acc[expense.categoryId] = { total: 0, items: [] }
    }
    acc[expense.categoryId].total += expense.amount
    acc[expense.categoryId].items.push(expense)
    return acc
  }, {} as Record<CategoryId, { total: number; items: Expense[] }>), [expenses])

  const totalOverall = useMemo(() =>
    expenses.filter(e => e.type === 'expense').reduce((sum, item) => sum + item.amount, 0),
    [expenses]
  )

  // Send the new category to the backend and refresh the list.
  // Color is symbolic and local-only (backend has no color field).
  const handleAdd = async () => {
    if (!newCatName.trim()) return
    if (categories.some(c => c.name.toLowerCase() === newCatName.trim().toLowerCase())) {
      setNotice({ title: 'Nome já usado', description: 'Já existe uma categoria com esse nome.' })
      return
    }
    try {
      await addCategory({
        name: newCatName.trim(),
        color: newCatColorOverride ?? symbolicCategoryColor(newCatName.trim()),
        bgClass: 'bg-white/10',
        textClass: 'text-white',
        icon: newCatSymbol,
        type: newCatType,
      })
      setNewCatName('')
      setNewCatType('expense')
      setNewCatSymbol(symbolicCategorySymbol('?'))
      setSymbolTouched(false)
      setNewCatColorOverride(null)
      setIsAdding(false)
    } catch (err) {
      const message = err instanceof Error ? err.message : ''
      setNotice({ title: 'Não foi possível criar a categoria', description: message || 'Verifique se o backend está rodando.' })
    }
  }

  const handleDelete = async (cat: CategoryInfo) => {
    if ((grouped[cat.id]?.items.length ?? 0) > 0) {
      setNotice({ title: 'Categoria com transações', description: 'Não dá para excluir: essa categoria tem transações vinculadas.' })
      return
    }
    setPendingDelete(cat)
  }

  const confirmDelete = async () => {
    if (!pendingDelete) return
    try {
      await deleteCategory(pendingDelete.id, pendingDelete.name)
    } catch (err) {
      setNotice({ title: 'Não foi possível excluir a categoria', description: err instanceof Error ? err.message : '' })
    } finally {
      setPendingDelete(null)
    }
  }

  const handleSaveEdit = async (id: string) => {
    if (!editName.trim()) return
    if (categories.some(c => c.id !== id && c.name.toLowerCase() === editName.trim().toLowerCase())) {
      setNotice({ title: 'Nome já usado', description: 'Já existe outra categoria com esse nome.' })
      return
    }
    try {
      await updateCategory(id, {
        name: editName.trim(),
        icon: editSymbol,
        type: editType,
        ...(editColor ? { color: editColor } : {}),
      })
      setEditingId(null)
      setEditColor(null)
    } catch (err) {
      const message = err instanceof Error ? err.message : ''
      setNotice({ title: 'Não foi possível salvar', description: message || 'Verifique se o backend está rodando.' })
    }
  }

  return (
    <div className="bg-page-grid flex-1 overflow-y-auto px-4 pt-9 pb-10 sm:px-6 lg:px-10">
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="border border-edge bg-surface p-6">
              <div className="flex items-center gap-4 animate-shimmer">
                <div className="w-12 h-12 bg-surface-raised" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-surface-raised w-24" />
                  <div className="h-3 bg-surface-raised w-16" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {categoriesError && (
        <div className="mb-4 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {friendlyError(categoriesError)} — verifique se o backend (porta 8080) está rodando.
        </div>
      )}
      {!loading && (
        <>
          <header className="mb-7 flex flex-wrap items-end justify-between gap-6">
            <div className="flex flex-col gap-2.5">
              <span className="text-[13px] font-medium text-fg-muted">Organização</span>
              <h1 className="font-display text-3xl leading-tight sm:text-5xl sm:leading-[52px] font-normal tracking-[-0.02em] text-fg">Categorias</h1>
              <p className="text-[15px] text-fg-muted">Organize suas categorias e acompanhe os gastos.</p>
            </div>
            <button
              type="button"
              onClick={() => setIsAdding(true)}
              className="flex items-center gap-2 rounded-lg bg-brand px-5 py-3.5 text-sm font-semibold text-black transition-colors hover:bg-brand-strong"
            >
              <Plus className="h-4 w-4" strokeWidth={2.2} />
              Nova categoria
            </button>
          </header>

          <AnimatePresence>
            {isAdding && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="border border-border rounded-xl p-4 sm:p-5 bg-card flex flex-col gap-4"
              >
                <div className="flex flex-col sm:flex-row items-stretch sm:items-end gap-3 sm:gap-4">
                <div className="flex flex-col gap-2 flex-1">
                  <label htmlFor="new-cat-name" className="text-xs text-muted-foreground font-medium">Nome da categoria</label>
                  <Input
                    id="new-cat-name"
                    value={newCatName}
                    onChange={(e) => handleNewName(e.target.value)}
                    placeholder="Ex.: Viagem"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <span className="text-xs text-muted-foreground font-medium">Cor</span>
                  <div className="flex h-9 items-center gap-2">
                    {SYMBOLIC_CATEGORY_PALETTE.map((c) => {
                      const selected = (newCatColorOverride ?? newAutomáticoColor) === c
                      return (
                        <button
                          key={c}
                          type="button"
                          aria-label={`Cor ${c}`}
                          onClick={() => setNewCatColorOverride(c)}
                          className={`size-6 rounded-full transition-transform hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand ${selected ? 'ring-2 ring-offset-1 ring-offset-[#161310] ring-brand scale-110' : ''}`}
                          style={{ backgroundColor: c }}
                        />
                      )
                    })}
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-xs text-muted-foreground font-medium">Tipo</label>
                  <div className="flex bg-muted p-1 rounded-lg border border-border">
                    {(['expense', 'income'] as CategoryKind[]).map((kind) => (
                      <button
                        key={kind}
                        type="button"
                        onClick={() => setNewCatType(kind)}
                        className={`flex-1 py-1.5 px-2 text-xs font-semibold rounded-md transition-all ${newCatType === kind ? 'bg-accent' : 'text-muted-foreground hover:text-foreground'}`}
                      >
                        {kind === 'expense' ? 'Despesa' : 'Receita'}
                      </button>
                    ))}
                  </div>
                </div>
                <Button onClick={handleAdd}>Criar</Button>
                <Button variant="ghost" onClick={() => setIsAdding(false)}>Cancelar</Button>
                </div>
                <div className="flex flex-col gap-2">
                  <span id="new-cat-symbol-label" className="text-xs text-muted-foreground font-medium">Símbolo</span>
                  <div className="grid grid-cols-6 sm:grid-cols-12 gap-1.5" role="radiogroup" aria-labelledby="new-cat-symbol-label">
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
              </motion.div>
            )}
          </AnimatePresence>

          {categories.length === 0 && !categoriesError ? (
            /* Sem categorias: a tela ficava preta. Agora ela diz o que falta
               e oferece o caminho para resolver. */
            <div className="flex flex-col items-center gap-3 border border-edge bg-surface px-6 py-16 text-center">
              <span className="flex size-12 items-center justify-center rounded-xl bg-brand-soft">
                <Tags className="size-6 text-brand" strokeWidth={1.8} />
              </span>
              <p className="font-display text-lg text-fg">Nenhuma categoria ainda</p>
              <p className="max-w-[380px] text-sm text-fg-muted">
                Categorias dão nome e cor aos seus gastos. Crie a primeira e o painel passa a mostrar para onde o dinheiro foi.
              </p>
              <button
                type="button"
                onClick={() => setIsAdding(true)}
                className="mt-2 flex items-center gap-2 rounded-lg bg-brand px-5 py-3 text-sm font-semibold text-black transition-colors hover:bg-brand-strong"
              >
                <Plus className="h-4 w-4" strokeWidth={2.2} />
                Criar primeira categoria
              </button>
            </div>
          ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {categories.map((cat) => {
              const data = grouped[cat.id] || { total: 0, items: [] }
              const percent = totalOverall > 0 ? Math.round((data.total / totalOverall) * 100) : 0
              const isExpanded = expandedId === cat.id
              const isEditing = editingId === cat.id

              return (
                <div key={cat.id} className="relative">
                  <Card className={cn('overflow-hidden transition-colors duration-150', isExpanded && 'rounded-b-none')}>
                    <CardContent className="p-0">
                      <div className="p-4 sm:p-6 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-0 group">
                        <div className="flex items-center gap-4 flex-1">
                          <CategorySymbol symbol={cat.icon} color={cat.color} name={cat.name} className="w-12 h-12" iconClassName="size-5" />
                          <div className="flex flex-col">
                            <span className="font-medium text-sm sm:text-base flex items-center gap-2">
                              {cat.name}
                              <span className="sm:opacity-0 sm:group-hover:opacity-100 flex items-center gap-1 transition-opacity">
                                <button onClick={(e) => { e.stopPropagation(); setEditName(cat.name); setEditSymbol(cat.icon ?? symbolicCategorySymbol(cat.name)); setEditType(cat.type); setEditColor(cat.color); setEditingId(cat.id) }} className="p-1 text-muted-foreground hover:text-foreground">
                                  <Edit2 className="w-3 h-3" />
                                </button>
                                <button onClick={(e) => {
                                  e.stopPropagation()
                                  handleDelete(cat)
                                }} className="p-1 text-destructive/60 hover:text-destructive">
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </span>
                            </span>
                            <span className="text-muted-foreground text-xs">{data.items.length} {data.items.length === 1 ? 'transação' : 'transações'}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 sm:gap-4 cursor-pointer justify-between sm:justify-end" onClick={() => setExpandedId(isExpanded ? null : cat.id)}>
                          <div className="flex flex-col items-end">
                            <p className="text-lg font-semibold">{formatBRL(data.total)}</p>
                            <span className="text-muted-foreground text-xs">{percent}% do total</span>
                          </div>
                          <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
                            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Edição: painel sobreposto. O card mantém a altura, então os
                      outros cards não se movem enquanto o usuário escolhe. */}
                  <AnimatePresence>
                    {isEditing && (
                      <motion.div
                        initial={{ opacity: 0, y: -6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                        transition={{ duration: 0.18 }}
                        className="absolute inset-x-0 top-0 z-30"
                      >
                        <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4 sm:p-6">
                          <div className="flex items-center gap-4">
                            <CategorySymbol symbol={editSymbol} color={editColor ?? cat.color} name={cat.name} className="w-12 h-12" iconClassName="size-5" />
                            <div className="flex flex-col gap-2.5 flex-1">
                              <div className="flex items-center gap-3 flex-wrap">
                                <Input
                                  value={editName}
                                  onChange={e => setEditName(e.target.value)}
                                  className="w-32"
                                  autoFocus
                                />
                                <div className="flex bg-muted p-0.5 rounded-lg border border-border">
                                  {(['expense', 'income'] as CategoryKind[]).map((kind) => (
                                    <button
                                      key={kind}
                                      type="button"
                                      onClick={() => setEditType(kind)}
                                      className={`px-2 py-1 text-[10px] font-semibold rounded-md transition-colors ${editType === kind ? 'bg-accent' : 'text-muted-foreground hover:text-foreground'}`}
                                    >
                                      {kind === 'expense' ? 'Despesa' : 'Receita'}
                                    </button>
                                  ))}
                                </div>
                                <div className="flex items-center gap-1.5">
                                  {SYMBOLIC_CATEGORY_PALETTE.map((c) => (
                                    <button
                                      key={c}
                                      type="button"
                                      aria-label={`Cor ${c}`}
                                      onClick={() => setEditColor(c)}
                                      className={`size-5 rounded-full transition-transform hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand ${editColor === c ? 'ring-2 ring-offset-1 ring-offset-[#161310] ring-brand scale-110' : ''}`}
                                      style={{ backgroundColor: c }}
                                    />
                                  ))}
                                </div>
                                <Button variant="ghost" size="icon-sm" onClick={() => handleSaveEdit(cat.id)}>
                                  <Check className="w-4 h-4 text-positive" />
                                </Button>
                                <Button variant="ghost" size="icon-sm" onClick={() => { setEditingId(null); setEditColor(null) }}>
                                  <X className="w-4 h-4" />
                                </Button>
                              </div>
                              <div className="grid grid-cols-6 gap-1 sm:grid-cols-12 max-w-[520px]" role="radiogroup" aria-label="Símbolo">
                                {CATEGORY_SYMBOLS.map(({ id, label, Icon }) => {
                                  const selected = editSymbol === id
                                  return (
                                    <button
                                      key={id}
                                      type="button"
                                      role="radio"
                                      aria-checked={selected}
                                      title={label}
                                      aria-label={label}
                                      onClick={() => setEditSymbol(id)}
                                      className={`flex h-8 items-center justify-center rounded-lg border transition-colors outline-none focus-visible:ring-2 focus-visible:ring-brand ${
                                        selected
                                          ? 'border-brand bg-brand-soft ring-1 ring-brand/40'
                                          : 'border-edge hover:border-brand/40 hover:bg-white/[0.04]'
                                      }`}
                                    >
                                      <Icon className={`size-3.5 ${selected ? 'text-brand' : 'text-fg-muted'}`} strokeWidth={2} aria-hidden />
                                    </button>
                                  )
                                })}
                              </div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <AnimatePresence initial={false}>
                    {isExpanded && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.18 }}
                        className="overflow-hidden"
                      >
                        <div className="border border-t-0 border-border bg-card rounded-b-xl">
                          <div className="flex flex-col p-4 gap-2 max-h-64 overflow-y-auto">
                            {data.items.length === 0 ? (
                              <div className="text-center text-muted-foreground text-sm py-4">Sem transações registradas.</div>
                            ) : (
                              data.items.slice().sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(item => (
                                <div key={item.id} className="flex items-center justify-between px-3 py-2.5 rounded-lg border border-border bg-surface">
                                  <div className="flex flex-col">
                                    <span className="text-sm font-medium text-fg">{item.name}</span>
                                    <span className="text-xs text-fg-muted">{formatDateBR(item.date)}</span>
                                  </div>
                                  <span className={`font-semibold text-sm tabular-nums ${item.type === 'income' ? 'text-positive' : 'text-negative'}`}>
                                    {item.type === 'income' ? '+' : '-'}{formatBRL(item.amount)}
                                  </span>
                                </div>
                              ))
                            )}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )
            })}
          </div>
          )}
        </>
      )}

      <ConfirmDialog
        open={notice !== null}
        title={notice?.title ?? ''}
        description={notice?.description ?? ''}
        confirmLabel="Entendi"
        onConfirm={() => setNotice(null)}
        onCancel={() => setNotice(null)}
      />

      <ConfirmDialog
        open={pendingDelete !== null}
        title="Excluir categoria"
        description={`Excluir a categoria "${pendingDelete?.name ?? ''}"? Essa ação não pode ser desfeita.`}
        confirmLabel="Excluir"
        destructive
        onConfirm={confirmDelete}
        onCancel={() => setPendingDelete(null)}
      />
    </div>
  )
}
