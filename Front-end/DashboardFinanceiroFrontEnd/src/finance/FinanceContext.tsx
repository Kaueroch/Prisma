import { createContext, useState, useEffect, useMemo, type ReactNode } from 'react';
import { Expense, CategoryInfo, CategoryKind } from '../shared/types';
import { financeService } from '../shared/services/financeService';
import { categoriesApi, getLoggedUserId } from '../shared/services/categoriesApi';

interface FinanceContextType {
  expenses: Expense[];
  categories: CategoryInfo[];
  loading: boolean;
  addExpense: (expense: Omit<Expense, 'id'>) => void;
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

  useEffect(() => {
    const loadData = async () => {
      setExpenses(financeService.getExpenses());

      // Carrega categorias do backend; se falhar, usa dados do localStorage
      try {
        const userId = getLoggedUserId();
        const backendCategories = await categoriesApi.listar(userId);
        const mapped = backendCategories.map((c) => ({
          // Usa o cd_id que veio do banco, nunca um id fabricado aqui
          id: String(c.id),
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
      id: financeService.nextExpenseId(),
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

      // O banco devolve o cd_id gerado por ele, que é o id usado nas próximas requisições
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
      console.error('Erro ao criar categoria no backend:', err);
      throw err;
    }
  };

  // Atualiza uma categoria: envia objeto + id ao backend e só atualiza a
  // lista local depois que o banco confirmar a alteração
  const handleUpdateCategory = async (id: string, updates: Partial<CategoryInfo>): Promise<void> => {
    try {
      const existing = categories.find(c => c.id === id);
      const nome = updates.name ?? existing?.name ?? '';
      const kind = updates.type ?? existing?.type;

      // Mapeia o tipo do frontend (expense/income) para o formato do backend (Despesas/Receita)
      const tipoCategoria = kind === 'expense' ? 'Despesas' : 'Receita';

      // Envia apenas o id (query, igual ao deletar) e os campos que podem ser alterados.
      // O userId não vai aqui: a validação de dono é feita pelo token JWT no backend.
      await categoriesApi.atualizar(Number(id), {
        id: Number(id),
        nome,
        tipoCategoria,
      });
    } catch (err) {
      console.error(`Erro ao atualizar categoria (cd_id: ${id}) no backend:`, err);
      throw err instanceof Error ? err : new Error('Erro ao atualizar categoria.');
    }

    setCategories((prev) => {
      const updated = prev.map(c => c.id === id ? { ...c, ...updates } : c);
      financeService.saveCategories(updated);
      return updated;
    });
  };

  // Remove uma categoria: envia o cd_id ao backend e só tira da lista local
  // depois que o banco confirmar a exclusão, para a tela não mentir sobre o estado
  const handleDeleteCategory = async (id: string, nome?: string): Promise<void> => {
    try {
      await categoriesApi.deletar(Number(id));
    } catch (err) {
      console.error(`Erro ao excluir "${nome ?? id}" no backend (cd_id: ${id}).`, err);
      throw err instanceof Error ? err : new Error('Erro ao excluir categoria.');
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