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
 * Frontend-only: simulate "each Telegram expense shows up in Prisma".
 * Write to the same FinanceContext localStorage and notify via event,
 * so the dashboard updates with no reload and no new backend.
 */
export const telegramInbox = {
  simulate(payload: TelegramPayload): Expense {
    const expense: Expense = {
      id: financeService.nextExpenseId(),
      amount: payload.amount,
      date: new Date().toISOString().slice(0, 10),
      categoryId: payload.categoryId ?? 'telegram',
      name: payload.text || `Expense via Telegram ${payload.amount}`,
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
