import { useState, type FormEvent, type ChangeEvent } from 'react'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useFinance } from '../../finance/useFinance'
import type { Budget, CategoryId } from '../../shared/types'

interface AddBudgetFormProps {
  isOpen: boolean
  onClose: () => void
  onAdd: (budget: Omit<Budget, 'id'>) => void
}

export function AddBudgetForm({ isOpen, onClose, onAdd }: AddBudgetFormProps) {
  const { categories } = useFinance()
  const [amount, setAmount] = useState('')
  const [categoryId, setCategoryId] = useState<CategoryId>('food')

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (!amount) return
    const numericAmount = parseInt(amount.replace(/\D/g, ''), 10) / 100
    if (!numericAmount || numericAmount <= 0) return
    onAdd({ amount: numericAmount, categoryId })
    setAmount('')
    setCategoryId('food')
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
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Criar Orçamento</DialogTitle>
          <DialogDescription>Defina um limite mensal para uma categoria.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label>Limite Mensal (R$)</Label>
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

          <div className="space-y-2">
            <Label>Categoria</Label>
            <Select value={categoryId} onValueChange={(v) => setCategoryId(v as CategoryId)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {categories.filter(c => c.id !== 'salary').map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button type="submit" className="w-full">Salvar Orçamento</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
