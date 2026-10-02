import { createContext, useState, useEffect, useMemo, type ReactNode } from 'react';
import { Expense, CategoryInfo, CategoryKind } from '../shared/types';
import { financeService } from '../shared/services/financeService';
import { categoriesApi, getLoggedUserId } from '../shared/services/categoriesApi';

interface FinanceContextType {
  expenses: Expense[];
  categories: CategoryInfo[];
  loading: boolean;
  addExpense: (expense: Omit<Expense, 'id'>) => void;
  addCategory: (category: Omit<CategoryInfo, 'id'>) => void;
  updateCategory: (id: string, category: Partial<CategoryInfo>) => void;
  deleteCategory: (id: string) => void;
  totalIncome: number;
  totalExpense: number;
  balance: number;
}

export const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

interface FinanceProviderProps {
  children: ReactNode;
}

/** Gera um id estável para categorias cujo id não vem do backend */
function buildCategoryId(
  userId: string | null | undefined,
  nome: string,
  tipoCategoria: string,
  index: number
): string {
  const slug = `${nome}-${tipoCategoria}`
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return `${userId ?? 'local'}-${slug || `categoria-${index}`}`;
}

export function FinanceProvider({ children }: FinanceProviderProps) {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [categories, setCategories] = useState<CategoryInfo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setExpenses(financeService.getExpenses());

      // Carrega categorias do backend; se falhar, usa dados do localStorage
      try {
        const userId = getLoggedUserId();
        const backendCategories = await categoriesApi.listar(userId);
        const mapped = backendCategories.map((c, index) => ({
          // O DTO de listagem do backend não traz "id", então geramos um id estável
          // a partir de userId + nome + tipo para evitar chaves duplicadas no React.
          id: c.id != null
            ? String(c.id)
            : buildCategoryId(c.userId ?? userId, c.nome, c.tipoCategoria, index),
          name: c.nome,
          color: '#8b5cf6',
          bgClass: 'bg-white/10',
          textClass: 'text-white',
          type: (c.tipoCategoria === 'Despesas' ? 'expense' : 'income') as CategoryKind,
        }));
        setCategories(mapped);
      } catch (err) {
        console.warn('Erro ao buscar categorias do backend, usando localStorage:', err);
        setCategories(financeService.getCategories());
      }

      setLoading(false);
    };
    loadData();
  }, []);

  const handleAddExpense = (newExpense: Omit<Expense, 'id'>) => {
    const expense: Expense = {
      ...newExpense,
      id: Math.random().toString(36).substring(7),
    };
    setExpenses((prev) => {
      const updated = [expense, ...prev];
      financeService.saveExpenses(updated);
      return updated;
    });
  };

  // Adiciona uma nova categoria, enviando para o backend via API
  const handleAddCategory = async (newCategory: Omit<CategoryInfo, 'id'>) => {
    try {
      // Recupera o UUID do usuário logado (claim "sub" do JWT) para vincular a categoria
      const userId = getLoggedUserId();
      if (!userId) {
        throw new Error('Sessão expirada. Faça login novamente para criar uma categoria.');
      }

      // Mapeia o tipo do frontend (expense/income) para o formato do backend (Despesa/Receita)
      const tipoCategoria = newCategory.type === 'expense' ? 'Despesas' : 'Receita';
      await categoriesApi.criar({ nome: newCategory.name, tipoCategoria, userId });

      const category: CategoryInfo = {
        ...newCategory,
        // Usa o mesmo id gerado na leitura da lista para o card não "pular" ao recarregar
        id: buildCategoryId(userId, newCategory.name, tipoCategoria, 0),
      };

      setCategories((prev) => {
        const updated = [category, ...prev];
        financeService.saveCategories(updated);
        return updated;
      });
    } catch (err) {
      console.error('Erro ao criar categoria no backend:', err);
      throw err;
    }
  };

  // Atualiza uma categoria existente (apenas localmente, sem backend)
  const handleUpdateCategory = (id: string, updates: Partial<CategoryInfo>) => {
    setCategories((prev) => {
      const updated = prev.map(c => c.id === id ? { ...c, ...updates } : c);
      financeService.saveCategories(updated);
      return updated;
    });
  };

  // Remove uma categoria pelo ID (apenas localmente, sem backend)
  const handleDeleteCategory = (id: string) => {
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
    expenses, categories, loading,
    addExpense: handleAddExpense,
    addCategory: handleAddCategory,
    updateCategory: handleUpdateCategory,
    deleteCategory: handleDeleteCategory,
    totalIncome, totalExpense, balance
  }), [expenses, categories, loading, totalIncome, totalExpense, balance]);

  return (
    <FinanceContext.Provider value={value}>
      {children}
    </FinanceContext.Provider>
  );
}