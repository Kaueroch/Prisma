import { useEffect, useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { CategoryInfo } from '../shared/types'

export interface GoalModalState {
  /** create = escolhe categoria; edit = categoria fixa */
  mode: 'create' | 'edit'
  categoryId: string
  categoryName: string
  value: string
}

interface GoalModalProps {
  state: GoalModalState | null
  categories: CategoryInfo[]
  onClose: () => void
  onSave: (categoryId: string, value: number) => void
}

function parseValue(raw: string): number {
  return parseFloat(raw.replace(/\./g, '').replace(',', '.'))
}

/** Modal centralizado para criar ou editar meta (mesmo padrão do formulário de transação). */
export function GoalModal({ state, categories, onClose, onSave }: GoalModalProps) {
  const [categoryId, setCategoryId] = useState('')
  const [value, setValue] = useState('')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (state) {
      setCategoryId(state.categoryId)
      setValue(state.value)
      setError(null)
    }
  }, [state])

  const freeCats = categories.filter((c) => c.type === 'expense')
  const isEdit = state?.mode === 'edit'

  const save = () => {
    const parsed = parseValue(value)
    if (!categoryId) {
      setError('Escolha uma categoria.')
      return
    }
    if (!Number.isFinite(parsed) || parsed <= 0) {
      setError('Informe um valor maior que zero.')
      return
    }
    onSave(categoryId, Math.round(parsed * 100) / 100)
    onClose()
  }

  return (
    <Dialog open={state !== null} onOpenChange={(open) => { if (!open) onClose() }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Editar meta' : 'Nova meta'}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? `Teto mensal de gastos para ${state?.categoryName}.`
              : 'Escolha a categoria e o teto de gastos do mês.'}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="goal-modal-cat">Categoria</Label>
            {isEdit ? (
              <p className="flex h-10 items-center rounded-xl border border-edge bg-surface-raised px-3 text-sm font-medium text-fg">
                {state?.categoryName}
              </p>
            ) : (
              <select
                id="goal-modal-cat"
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="h-10 rounded-xl border border-edge bg-surface-raised px-3 text-sm text-fg outline-none focus:border-brand/60"
              >
                <option value="">Escolher…</option>
                {freeCats.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="goal-modal-val">Teto mensal (R$)</Label>
            <Input
              id="goal-modal-val"
              inputMode="decimal"
              placeholder="300,00"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && save()}
            />
          </div>

          {error && <p role="alert" className="text-sm font-medium text-negative">{error}</p>}
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={save}>Salvar meta</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
