import React, { createContext, useCallback, useContext, useMemo, useState } from 'react'
import type { TransactionType } from '../shared/types'

interface TransactionFormContextType {
  isOpen: boolean
  initialType: TransactionType
  openTransactionForm: (initialType?: TransactionType) => void
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

  const openTransactionForm = useCallback((transactionType: TransactionType = 'expense') => {
    setInitialType(transactionType)
    setIsOpen(true)
  }, [])

  const closeTransactionForm = useCallback(() => {
    setIsOpen(false)
  }, [])

  const value = useMemo(() => ({
    isOpen,
    initialType,
    openTransactionForm,
    closeTransactionForm,
  }), [isOpen, initialType, openTransactionForm, closeTransactionForm])

  return (
    <TransactionFormContext.Provider value={value}>
      {children}
    </TransactionFormContext.Provider>
  )
}
