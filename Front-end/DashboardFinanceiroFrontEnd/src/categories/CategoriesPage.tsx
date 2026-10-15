import { useState, useMemo } from 'react'
import { useFinance } from '../finance/useFinance'
import type { CategoryId, CategoryKind, CategoryInfo, Expense } from '../shared/types'
import { Plus, ChevronDown, ChevronUp, Trash2, Edit2, Check, X } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { motion, AnimatePresence } from 'motion/react'
import { formatBRL, formatDateBR } from '../shared/utils/formatters'
import { symbolicCategoryColor } from '../shared/utils/categoryColor'
import { CATEGORY_SYMBOLS, CategorySymbol, symbolicCategorySymbol } from '../shared/components/CategorySymbol'

export function CategoriesPage() {
  const { categories, expenses, addCategory, deleteCategory, updateCategory, loading } = useFinance()
  const [expandedId, setExpandedId] = useState<CategoryId | null>(null)
  const [isAdding, setIsAdding] = useState(false)
  const [newCatName, setNewCatName] = useState('')
  const [newCatType, setNewCatType] = useState<CategoryKind>('expense')
  const [newCatSymbol, setNewCatSymbol] = useState<string>(() => symbolicCategorySymbol('?'))
  const [symbolTouched, setSymbolTouched] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const [editSymbol, setEditSymbol] = useState('')
  const [editType, setEditType] = useState<CategoryKind>('expense')
  const newAutoColor = symbolicCategoryColor(newCatName.trim() || '?')
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
      alert('A category with this name already exists.')
      return
    }
    try {
      await addCategory({
        name: newCatName.trim(),
        color: symbolicCategoryColor(newCatName.trim()),
        bgClass: 'bg-white/10',
        textClass: 'text-white',
        icon: newCatSymbol,
        type: newCatType,
      })
      setNewCatName('')
      setNewCatType('expense')
      setNewCatSymbol(symbolicCategorySymbol('?'))
      setSymbolTouched(false)
      setIsAdding(false)
    } catch (err) {
      const message = err instanceof Error ? err.message : ''
      alert(message || 'Could not create category. Check that the backend is running.')
    }
  }

  const handleDelete = async (cat: CategoryInfo) => {
    if ((grouped[cat.id]?.items.length ?? 0) > 0) {
      alert('Cannot delete this category because it has associated transactions.')
      return
    }
    if (!window.confirm(`Are you sure you want to delete the category "${cat.name}"?`)) return

    try {
      await deleteCategory(cat.id, cat.name)
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Could not delete category.')
    }
  }

  const handleSaveEdit = async (id: string) => {
    if (!editName.trim()) return
    if (categories.some(c => c.id !== id && c.name.toLowerCase() === editName.trim().toLowerCase())) {
      alert('Another category with this name already exists.')
      return
    }
    try {
      await updateCategory(id, { name: editName.trim(), icon: editSymbol, type: editType })
      setEditingId(null)
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Could not update category. Check that the backend is running.')
    }
  }

  return (
    <div className="bg-page-grid flex-1 overflow-y-auto px-4 pt-9 pb-10 sm:px-6 lg:px-10">
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="border border-edge bg-surface p-6">
              <div className="flex items-center gap-4 animate-pulse">
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

      {!loading && (
        <>
          <header className="mb-7 flex flex-wrap items-end justify-between gap-6">
            <div className="flex flex-col gap-2.5">
              <span className="text-[13px] font-medium text-fg-muted">Organization</span>
              <h1 className="font-display text-5xl leading-[52px] font-normal tracking-[-0.02em] text-fg">Categories</h1>
              <p className="text-[15px] text-fg-muted">Manage your categories and review your spending.</p>
            </div>
            <button
              type="button"
              onClick={() => setIsAdding(true)}
              className="flex items-center gap-2 rounded-lg bg-brand px-5 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-brand-strong"
            >
              <Plus className="h-4 w-4" strokeWidth={2.2} />
              New category
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
                  <label htmlFor="new-cat-name" className="text-xs text-muted-foreground font-medium">Category name</label>
                  <Input
                    id="new-cat-name"
                    value={newCatName}
                    onChange={(e) => handleNewName(e.target.value)}
                    placeholder="E.g. Travel"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <span className="text-xs text-muted-foreground font-medium">Symbol color</span>
                  <span className="flex h-9 items-center gap-2 rounded-lg border border-edge bg-white/[0.02] px-3" title="Color is assigned automatically">
                    <span className="h-5 w-5 rounded-md" style={{ backgroundColor: newAutoColor }} aria-hidden />
                    <span className="text-xs text-fg-muted">Auto</span>
                  </span>
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-xs text-muted-foreground font-medium">Used for</label>
                  <div className="flex bg-muted p-1 rounded-lg border border-border">
                    {(['expense', 'income'] as CategoryKind[]).map((kind) => (
                      <button
                        key={kind}
                        type="button"
                        onClick={() => setNewCatType(kind)}
                        className={`flex-1 py-1.5 px-2 text-xs font-semibold rounded-md transition-all ${newCatType === kind ? 'bg-accent' : 'text-muted-foreground hover:text-foreground'}`}
                      >
                        {kind === 'expense' ? 'Expense' : 'Income'}
                      </button>
                    ))}
                  </div>
                </div>
                <Button onClick={handleAdd}>Create</Button>
                <Button variant="ghost" onClick={() => setIsAdding(false)}>Cancel</Button>
                </div>
                <div className="flex flex-col gap-2">
                  <span id="new-cat-symbol-label" className="text-xs text-muted-foreground font-medium">Symbol</span>
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {categories.map((cat) => {
              const data = grouped[cat.id] || { total: 0, items: [] }
              const percent = totalOverall > 0 ? Math.round((data.total / totalOverall) * 100) : 0
              const isExpanded = expandedId === cat.id
              const isEditing = editingId === cat.id

              return (
                <Card key={cat.id} className="overflow-hidden">
                  <CardContent className="p-0">
                    <div className="p-4 sm:p-6 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-0 group">
                      <div className="flex items-center gap-4 flex-1">
                        <CategorySymbol symbol={isEditing ? editSymbol : cat.icon} color={cat.color} name={cat.name} className="w-12 h-12" iconClassName="size-5" />
                        {isEditing ? (
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
                                  className={`px-2 py-1 text-[10px] font-semibold rounded-md transition-all ${editType === kind ? 'bg-accent' : 'text-muted-foreground hover:text-foreground'}`}
                                >
                                  {kind === 'expense' ? 'Expense' : 'Income'}
                                </button>
                              ))}
                            </div>
                            <Button variant="ghost" size="icon-sm" onClick={() => handleSaveEdit(cat.id)}>
                              <Check className="w-4 h-4 text-emerald-300" />
                            </Button>
                            <Button variant="ghost" size="icon-sm" onClick={() => setEditingId(null)}>
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                          <div className="grid grid-cols-6 gap-1 max-w-[280px]" role="radiogroup" aria-label="Symbol">
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
                                  className={`flex h-8 items-center justify-center rounded-lg border transition-all outline-none focus-visible:ring-2 focus-visible:ring-brand ${
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
                        ) : (
                          <div className="flex flex-col">
                            <span className="font-medium text-sm sm:text-base flex items-center gap-2">
                              {cat.name}
                              <span className="sm:opacity-0 sm:group-hover:opacity-100 flex items-center gap-1 transition-opacity">
                                <button onClick={(e) => { e.stopPropagation(); setEditName(cat.name); setEditSymbol(cat.icon ?? symbolicCategorySymbol(cat.name)); setEditType(cat.type); setEditingId(cat.id) }} className="p-1 text-muted-foreground hover:text-foreground">
                                  <Edit2 className="w-3 h-3" />
                                </button>
                                <button onClick={(e) => {
                                  e.stopPropagation()
                                  handleDelete(cat)
                                }} className="p-1 text-red-400/60 hover:text-red-400">
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </span>
                            </span>
                            <span className="text-muted-foreground text-xs">{data.items.length} transactions</span>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-3 sm:gap-4 cursor-pointer justify-between sm:justify-end" onClick={() => setExpandedId(isExpanded ? null : cat.id)}>
                        <div className="flex flex-col items-end">
                          <p className="text-lg font-semibold">{formatBRL(data.total)}</p>
                          <span className="text-muted-foreground text-xs">{percent}% of total</span>
                        </div>
                        <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
                          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </div>
                      </div>
                    </div>

                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="border-t border-border"
                        >
                          <div className="flex flex-col p-4 gap-3 max-h-64 overflow-y-auto bg-muted/20">
                            {data.items.length === 0 ? (
                              <div className="text-center text-muted-foreground text-sm py-4">No transactions recorded.</div>
                            ) : (
                              data.items.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(item => (
                                <div key={item.id} className="flex items-center justify-between p-3 rounded-xl bg-card border border-border">
                                  <div className="flex flex-col">
                                    <span className="text-sm font-medium">{item.name}</span>
                                    <span className="text-xs text-muted-foreground">{formatDateBR(item.date)}</span>
                                  </div>
                                  <span className="font-medium text-sm">{formatBRL(item.amount)}</span>
                                </div>
                              ))
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}
