import { useState, useEffect, type FormEvent, type ChangeEvent } from 'react'
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
import type { CategoryId, Expense, TransactionType } from '../../shared/types'

interface AddExpenseFormProps {
  isOpen: boolean
  onClose: () => void
  onAdd: (expense: Omit<Expense, 'id'>) => void
  initialType?: TransactionType
}

export function AddExpenseForm({ isOpen, onClose, onAdd, initialType = 'expense' }: AddExpenseFormProps) {
  const { categories } = useFinance()
  const [amount, setAmount] = useState('')
  const [name, setName] = useState('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [categoryId, setCategoryId] = useState<CategoryId>('food')
  const [type, setType] = useState<TransactionType>(initialType)

  useEffect(() => {
    if (isOpen) setType(initialType)
  }, [isOpen, initialType])

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (!amount || !name || !date) return
    const numericAmount = parseInt(amount.replace(/\D/g, ''), 10) / 100
    if (!numericAmount || numericAmount <= 0) return

    onAdd({ amount: numericAmount, name, date, categoryId, type })
    setAmount('')
    setName('')
    setDate(new Date().toISOString().split('T')[0])
    setCategoryId('food')
    setType('expense')
    onClose()
  }

  const handleAmountChange = (e: ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/\D/g, '')
    if (!rawValue) { setAmount(''); return }
    const numberValue = parseInt(rawValue, 10) / 100
    setAmount(new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(numberValue))
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose() }}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Nova Transação</DialogTitle>
          <DialogDescription>Registre uma receita ou despesa.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="flex bg-muted p-1 rounded-lg border border-border">
            <button
              type="button"
              onClick={() => setType('expense')}
              className={`flex-1 py-2 text-sm font-semibold rounded-md transition-all ${type === 'expense' ? 'bg-destructive/20 text-destructive' : 'text-muted-foreground hover:text-foreground'}`}
            >
              Despesa
            </button>
            <button
              type="button"
              onClick={() => setType('income')}
              className={`flex-1 py-2 text-sm font-semibold rounded-md transition-all ${type === 'income' ? 'bg-green-500/20 text-green-400' : 'text-muted-foreground hover:text-foreground'}`}
            >
              Receita
            </button>
          </div>

          <div className="space-y-2">
            <Label>Valor</Label>
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
              <Label>Descrição</Label>
              <Input
                placeholder="Ex: Padaria"
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
            <Label>Categoria</Label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {categories.map((info) => (
                <button
                  key={info.id}
                  type="button"
                  onClick={() => setCategoryId(info.id as CategoryId)}
                  className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
                    categoryId === info.id
                      ? 'bg-accent border-border'
                      : 'border-border/50 hover:bg-muted/50'
                  }`}
                >
                  <div className="w-8 h-8 rounded-lg" style={{ backgroundColor: info.color }} />
                  <span className="text-sm">{info.name}</span>
                </button>
              ))}
            </div>
          </div>

          <DialogFooter>
            <Button type="submit" className="w-full">
              Salvar Transação
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
