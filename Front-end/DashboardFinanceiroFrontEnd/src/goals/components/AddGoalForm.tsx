import { useState, type FormEvent } from 'react'
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
import type { Goal } from '../../shared/types'

interface AddGoalFormProps {
  isOpen: boolean
  onClose: () => void
  onAdd: (goal: Omit<Goal, 'id'>) => void
}

export function AddGoalForm({ isOpen, onClose, onAdd }: AddGoalFormProps) {
  const [name, setName] = useState('')
  const [targetAmount, setTargetAmount] = useState('')
  const [monthlySavings, setMonthlySavings] = useState('')
  const [savedAmount, setSavedAmount] = useState('')

  const parseCurrency = (val: string) => parseInt(val.replace(/\D/g, '') || '0', 10) / 100
  const formatValue = (val: string) => {
    const rawValue = val.replace(/\D/g, '')
    if (!rawValue) return ''
    return new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(parseInt(rawValue, 10) / 100)
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    const targetAmt = parseCurrency(targetAmount)
    const monthlyAmt = parseCurrency(monthlySavings)
    const savedAmt = parseCurrency(savedAmount)
    if (!name || targetAmt <= 0 || monthlyAmt <= 0) return

    onAdd({ name, targetAmount: targetAmt, monthlySavings: monthlyAmt, savedAmount: savedAmt })
    setName('')
    setTargetAmount('')
    setMonthlySavings('')
    setSavedAmount('')
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose() }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Nova Meta</DialogTitle>
          <DialogDescription>Defina um objetivo financeiro para acompanhar.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>O que você quer comprar/alcançar?</Label>
            <Input value={name} onChange={e => setName(e.target.value)} placeholder="Ex: Carro Novo, Viagem..." required />
          </div>
          <div className="space-y-2">
            <Label>Valor total da meta</Label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">R$</span>
              <Input type="text" inputMode="numeric" required value={targetAmount} onChange={e => setTargetAmount(formatValue(e.target.value))} placeholder="0,00" className="pl-10" />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Quanto você guarda por mês?</Label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">R$</span>
              <Input type="text" inputMode="numeric" required value={monthlySavings} onChange={e => setMonthlySavings(formatValue(e.target.value))} placeholder="0,00" className="pl-10" />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Valor já guardado (Opcional)</Label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">R$</span>
              <Input type="text" inputMode="numeric" value={savedAmount} onChange={e => setSavedAmount(formatValue(e.target.value))} placeholder="0,00" className="pl-10" />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" className="w-full">Salvar Meta</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
