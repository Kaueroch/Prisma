import { createContext, useState, useEffect, useMemo, type ReactNode } from 'react';
import { Expense, CategoryInfo, CategoryKind } from '../shared/types';
import { financeService } from '../shared/services/financeService';
import { categoriesApi, getLoggedUserId } from '../shared/services/categoriesApi';
import { symbolicCategoryColor } from '../shared/utils/categoryColor';
import { symbolicCategorySymbol } from '../shared/components/CategorySymbol';
import { transacoesApi } from '../shared/services/transacoesApi';

interface FinanceContextType {
  expenses: Expense[];
  categories: CategoryInfo[];
  loading: boolean;
  categoriesError: string | null;
  addExpense: (expense: Omit<Expense, 'id'>) => Promise<void>;
  addCategory: (category: Omit<CategoryInfo, 'id'>) => Promise<void>;
  updateCategory: (id: string, category: Partial<CategoryInfo>) => Promise<void>;
  deleteCategory: (id: string, nome?: string) => Promise<void>;
  totalIncome: number;
  totalExpense: number;
  balance: number;
}

export const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

interface FinanceProviderProps {
  children: ReactNode;
}

export function FinanceProvider({ children }: FinanceProviderProps) {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [categories, setCategories] = useState<CategoryInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoriesError, setCategoriesError] = useState<string | null>(null);

  useEffect(() => {
    function onTelegram(e: Event) {
      const expense = (e as CustomEvent).detail as Expense
      if (!expense?.id) return
      setExpenses((prev) => (prev.some((x) => x.id === expense.id) ? prev : [expense, ...prev]))
    }
    window.addEventListener('prisma:telegram-expense', onTelegram)
    return () => window.removeEventListener('prisma:telegram-expense', onTelegram)
  }, [])

  useEffect(() => {
    const loadData = async () => {
      setExpenses(financeService.getExpenses());
      setCategoriesError(null);

      // Load categories from the backend; fall back to localStorage on failure
      try {
        const userId = getLoggedUserId();
        const backendCategories = await categoriesApi.listar(userId);
        const mapped = backendCategories.map((c) => ({
          // Use the cd_id from the database, never a fabricated id here.
          // Color and symbol are symbolic and local-only (backend has no such fields).
          id: String(c.id),
          name: c.nome,
          color: symbolicCategoryColor(c.nome),
          bgClass: 'bg-white/10',
          textClass: 'text-white',
          icon: symbolicCategorySymbol(c.nome),
          type: (c.tipoCategoria === 'Despesas' ? 'expense' : 'income') as CategoryKind,
        }));
        setCategories(mapped);
      } catch (err) {
        console.warn('Could not load categories from the backend, using localStorage:', err);
        setCategories(financeService.getCategories());
        setCategoriesError(err instanceof Error ? err.message : 'Não foi possível carregar as categorias do backend.');
      }

      setLoading(false);
    };
    loadData();
  }, []);

  const handleAddExpense = async (newExpense: Omit<Expense, 'id'>) => {
    // 1. Persist in the backend first: POST /api/v1/transacao/criar.
    // The payload mapping (valor/descricao/data dd/MM/yyyy/categoria_id direto)
    // follows the TransacaoDTO record contract.
    try {
      await transacoesApi.criar({
        valor: newExpense.amount,
        descricao: newExpense.name,
        data: newExpense.date,
        categoriaId: newExpense.categoryId,
      });
    } catch (err) {
      console.error( 'Não foi possível criar a transação no backend:', err);
      throw err instanceof Error ? err : new Error( 'Não foi possível criar a transação.');
    }

    // 2. Only mirror locally after the database confirms the creation,
    // so the UI never lies about state (same pattern as categories).
    const expense: Expense = {
      ...newExpense,
      id: financeService.nextExpenseId(),
    };
    setExpenses((prev) => {
      const updated = [expense, ...prev];
      financeService.saveExpenses(updated);
      return updated;
    });
  };

  // Add a new category by sending it to the backend via API
  const handleAddCategory = async (newCategory: Omit<CategoryInfo, 'id'>) => {
    try {
      // Get the logged-in user UUID (JWT "sub" claim) to link the category
      const userId = getLoggedUserId();
      if (!userId) {
        throw new Error('Session expired. Please sign in again to create a category.');
      }

      // Map the frontend type (expense/income) to the backend format (Despesas/Receita)
      const tipoCategoria = newCategory.type === 'expense' ? 'Despesas' : 'Receita';

      // The database returns its generated cd_id, which is the id used in later requests
      const categoriaId = await categoriesApi.criar({ nome: newCategory.name, tipoCategoria, userId });

      const category: CategoryInfo = {
        ...newCategory,
        id: String(categoriaId),
      };

      setCategories((prev) => {
        const updated = [category, ...prev];
        financeService.saveCategories(updated);
        return updated;
      });
    } catch (err) {
      console.error('Could not create category in the backend:', err);
      throw err;
    }
  };

  // Update a category: send object + id to the backend and only update the
  // local list after the database confirms the change.
  // Local-only ids (ex.: "food", UUID) are never sent as ?id=NaN:
  // they update only localStorage.
  const handleUpdateCategory = async (id: string, updates: Partial<CategoryInfo>): Promise<void> => {
    const numericId = Number(id);
    const isBackendId = Number.isInteger(numericId);

    if (!isBackendId) {
      setCategories((prev) => {
        const updated = prev.map(c => c.id === id ? { ...c, ...updates } : c);
        financeService.saveCategories(updated);
        return updated;
      });
      return;
    }

    try {
      const existing = categories.find(c => c.id === id);
      const nome = updates.name ?? existing?.name ?? '';
      const kind = updates.type ?? existing?.type;

      // Map the frontend type (expense/income) to the backend format (Despesas/Receita)
      const tipoCategoria = kind === 'expense' ? 'Despesas' : 'Receita';

      // Only send the id (query, same as delete) plus the editable fields.
      // No userId here: owner validation happens via the JWT token in the backend.
      await categoriesApi.atualizar(numericId, {
        id: numericId,
        nome,
        tipoCategoria,
      });
    } catch (err) {
      console.error(`Could not update category (cd_id: ${id}) in the backend:`, err);
      throw err instanceof Error ? err : new Error( 'Não foi possível atualizar a categoria.');
    }

    setCategories((prev) => {
      const updated = prev.map(c => c.id === id ? { ...c, ...updates } : c);
      financeService.saveCategories(updated);
      return updated;
    });
  };

  // Delete a category: send the cd_id to the backend and only remove it locally
  // after the database confirms the deletion, so the UI never lies about state.
  // Local-only ids are removed locally without calling DELETE ?id=NaN.
  const handleDeleteCategory = async (id: string, nome?: string): Promise<void> => {
    const numericId = Number(id);
    const isBackendId = Number.isInteger(numericId);

    if (!isBackendId) {
      setCategories((prev) => {
        const updated = prev.filter(c => c.id !== id);
        financeService.saveCategories(updated);
        return updated;
      });
      return;
    }

    try {
      await categoriesApi.deletar(numericId);
    } catch (err) {
      console.error(`Could not delete "${nome ?? id}" in the backend (cd_id: ${id}).`, err);
      throw err instanceof Error ? err : new Error( 'Não foi possível excluir a categoria.');
    }

    setCategories((prev) => {
      const updated = prev.filter(c => c.id !== id);
      financeService.saveCategories(updated);
      return updated;
    });
  };

  const incomes = useMemo(() => expenses.filter(e => e.type === 'income'), [expenses]);
  const outcomes = useMemo(() => expenses.filter(e => e.type === 'expense'), [expenses]);

  const totalIncome = useMemo(() => incomes.reduce((sum, item) => sum + item.amount, 0), [incomes]);
  const totalExpense = useMemo(() => outcomes.reduce((sum, item) => sum + item.amount, 0), [outcomes]);
  const balance = useMemo(() => totalIncome - totalExpense, [totalIncome, totalExpense]);

  const value = useMemo(() => ({
    expenses, categories, loading, categoriesError,
    addExpense: handleAddExpense,
    addCategory: handleAddCategory,
    updateCategory: handleUpdateCategory,
    deleteCategory: handleDeleteCategory,
    totalIncome, totalExpense, balance
  }), [expenses, categories, loading, categoriesError, totalIncome, totalExpense, balance]);

  return (
    <FinanceContext.Provider value={value}>
      {children}
    </FinanceContext.Provider>
  );
}