import { useState } from 'react'
import { useFinance } from '../finance/useFinance'
import type { CategoryId, Expense } from '../shared/types'
import { Grid, Plus, ChevronDown, ChevronUp, Trash2, Edit2, Check, X } from 'lucide-react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { motion, AnimatePresence } from 'motion/react'
import { formatBRL, formatDateBR } from '../shared/utils/formatters'

export function CategoriesPage() {
  const { categories, expenses, addCategory, deleteCategory, updateCategory } = useFinance()
  const [expandedId, setExpandedId] = useState<CategoryId | null>(null)
  const [isAdding, setIsAdding] = useState(false)
  const [newCatName, setNewCatName] = useState('')
  const [newCatColor, setNewCatColor] = useState('#8b5cf6')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')

  const grouped = expenses.reduce((acc, expense) => {
    if (!acc[expense.categoryId]) {
      acc[expense.categoryId] = { total: 0, items: [] }
    }
    acc[expense.categoryId].total += expense.amount
    acc[expense.categoryId].items.push(expense)
    return acc
  }, {} as Record<CategoryId, { total: number; items: Expense[] }>)

  const totalOverall = expenses.reduce((sum, item) => sum + item.amount, 0)

  const handleAdd = () => {
    if (!newCatName.trim()) return
    addCategory({
      name: newCatName.trim(),
      color: newCatColor,
      bgClass: 'bg-white/10',
      textClass: 'text-white'
    })
    setNewCatName('')
    setIsAdding(false)
  }

  const handleSaveEdit = (id: string) => {
    if (!editName.trim()) return
    updateCategory(id, { name: editName.trim() })
    setEditingId(null)
  }

  return (
    <div className="p-6 lg:p-8 max-w-[1400px] mx-auto w-full space-y-6">
      <Card>
        <CardContent className="p-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Despesas por Categoria</h1>
            <p className="text-muted-foreground text-sm mt-1">Gerencie suas categorias e veja seus gastos</p>
          </div>
          <Button onClick={() => setIsAdding(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Nova Categoria
          </Button>
        </CardContent>
      </Card>

      <AnimatePresence>
        {isAdding && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="border border-border rounded-2xl p-5 bg-card flex items-end gap-4"
          >
            <div className="flex flex-col gap-2 flex-1">
              <label className="text-xs text-muted-foreground font-medium">Nome da Categoria</label>
              <Input
                value={newCatName}
                onChange={(e) => setNewCatName(e.target.value)}
                placeholder="Ex: Viagens"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-xs text-muted-foreground font-medium">Cor</label>
              <input
                type="color"
                value={newCatColor}
                onChange={(e) => setNewCatColor(e.target.value)}
                className="h-9 w-12 rounded-lg border border-border bg-transparent cursor-pointer"
              />
            </div>
            <Button onClick={handleAdd}>Criar</Button>
            <Button variant="ghost" onClick={() => setIsAdding(false)}>Cancelar</Button>
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
                <div className="p-6 flex items-center justify-between group">
                  <div className="flex items-center gap-4 flex-1">
                    <div
                      className="w-12 h-12 rounded-2xl flex items-center justify-center"
                      style={{ backgroundColor: cat.color }}
                    >
                      <Grid className="w-5 h-5 text-black" strokeWidth={2.5} />
                    </div>
                    {isEditing ? (
                      <div className="flex items-center gap-2">
                        <Input
                          value={editName}
                          onChange={e => setEditName(e.target.value)}
                          className="w-32"
                          autoFocus
                        />
                        <Button variant="ghost" size="icon-sm" onClick={() => handleSaveEdit(cat.id)}>
                          <Check className="w-4 h-4 text-green-400" />
                        </Button>
                        <Button variant="ghost" size="icon-sm" onClick={() => setEditingId(null)}>
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ) : (
                      <div className="flex flex-col">
                        <span className="font-medium text-base flex items-center gap-2">
                          {cat.name}
                          <span className="opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-opacity">
                            <button onClick={(e) => { e.stopPropagation(); setEditName(cat.name); setEditingId(cat.id) }} className="p-1 text-muted-foreground hover:text-foreground">
                              <Edit2 className="w-3 h-3" />
                            </button>
                            <button onClick={(e) => { e.stopPropagation(); deleteCategory(cat.id) }} className="p-1 text-red-400/60 hover:text-red-400">
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </span>
                        </span>
                        <span className="text-muted-foreground text-xs">{data.items.length} transações</span>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-4 cursor-pointer" onClick={() => setExpandedId(isExpanded ? null : cat.id)}>
                    <div className="flex flex-col items-end">
                      <p className="text-lg font-semibold">{formatBRL(data.total)}</p>
                      <span className="text-muted-foreground text-xs">{percent}% do total</span>
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
                          <div className="text-center text-muted-foreground text-sm py-4">Nenhuma transação registrada.</div>
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
    </div>
  )
}
