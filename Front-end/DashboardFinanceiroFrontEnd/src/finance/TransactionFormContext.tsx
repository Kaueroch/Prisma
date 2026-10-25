import React, { createContext, useCallback, useContext, useMemo, useState } from 'react'
import type { Expense, TransactionType } from '../shared/types'
import { getPrefs } from '../shared/services/prefsService'

interface TransactionFormContextType {
  isOpen: boolean
  initialType: TransactionType
  editingExpense: Expense | undefined
  openTransactionForm: (initialType?: TransactionType) => void
  openEditForm: (expense: Expense) => void
  closeTransactionForm: () => void
}

const TransactionFormContext = createContext<TransactionFormContextType | undefined>(undefined)

export function useTransactionForm() {
  const context = useContext(TransactionFormContext)
  if (!context) {
    throw new Error('useTransactionForm must be used within a TransactionFormProvider')
  }
  return context
}

export function TransactionFormProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)
  const [initialType, setInitialType] = useState<TransactionType>('expense')
  const [editingExpense, setEditingExpense] = useState<Expense | undefined>(undefined)

  const openTransactionForm = useCallback((transactionType?: TransactionType) => {
    setEditingExpense(undefined)
    setInitialType(transactionType ?? getPrefs().defaultTxType)
    setIsOpen(true)
  }, [])

  const openEditForm = useCallback((expense: Expense) => {
    setEditingExpense(expense)
    setInitialType(expense.type)
    setIsOpen(true)
  }, [])

  const closeTransactionForm = useCallback(() => {
    setIsOpen(false)
    setEditingExpense(undefined)
  }, [])

  const value = useMemo(() => ({
    isOpen,
    initialType,
    editingExpense,
    openTransactionForm,
    openEditForm,
    closeTransactionForm,
  }), [isOpen, initialType, editingExpense, openTransactionForm, openEditForm, closeTransactionForm])

  return (
    <TransactionFormContext.Provider value={value}>
      {children}
    </TransactionFormContext.Provider>
  )
}
