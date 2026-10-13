import { financeService } from '../shared/services/financeService'
import type { Expense } from '../shared/types'

export const TELEGRAM_EVENT = 'prisma:telegram-expense'

const INBOX_KEY = 'prisma_telegram_inbox'

export interface TelegramPayload {
  text: string
  amount: number
  categoryId?: string
  categoryName?: string
}

function readInbox(): Record<string, unknown>[] {
  try {
    return JSON.parse(localStorage.getItem(INBOX_KEY) ?? '[]')
  } catch {
    return []
  }
}

function writeInbox(items: Record<string, unknown>[]) {
  localStorage.setItem(INBOX_KEY, JSON.stringify(items))
}

/**
 * Frontend-only: simula “cada gasto no Telegram aparece no Prisma”.
 * Escreve no mesmo localStorage do FinanceContext e avisa via evento,
 * então o painel atualiza sem reload e sem backend novo.
 */
export const telegramInbox = {
  simulate(payload: TelegramPayload): Expense {
    const expense: Expense = {
      id: financeService.nextExpenseId(),
      amount: payload.amount,
      date: new Date().toISOString().slice(0, 10),
      categoryId: payload.categoryId ?? 'telegram',
      name: payload.text || `Gasto via Telegram ${payload.amount}`,
      type: 'expense',
    }
    const current = financeService.getExpenses()
    financeService.saveExpenses([expense, ...current])
    writeInbox([{ ...payload, id: expense.id, date: expense.date, source: 'telegram-sim', status: 'applied' }, ...readInbox()].slice(0, 50))
    window.dispatchEvent(new CustomEvent(TELEGRAM_EVENT, { detail: expense }))
    return expense
  },

  list() {
    return readInbox()
  },
}
