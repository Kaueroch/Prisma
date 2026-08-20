import { createContext, useState, useEffect, useMemo, type ReactNode, type Dispatch, type SetStateAction } from 'react';
import { Expense, Budget, CategoryInfo, Goal, Contact, Deal, CategoryKind } from '../shared/types';
import { financeService } from '../shared/services/financeService';
import { categoriesApi } from '../shared/services/categoriesApi';

interface FinanceContextType {
  expenses: Expense[];
  budgets: Budget[];
  categories: CategoryInfo[];
  goals: Goal[];
  contacts: Contact[];
  deals: Deal[];
  loading: boolean;
  addGoal: (goal: Omit<Goal, 'id'>) => void;
  addExpense: (expense: Omit<Expense, 'id'>) => void;
  addBudget: (budget: Omit<Budget, 'id'>) => void;
  setBudgets: Dispatch<SetStateAction<Budget[]>>;
  addCategory: (category: Omit<CategoryInfo, 'id'>) => void;
  updateCategory: (id: string, category: Partial<CategoryInfo>) => void;
  deleteCategory: (id: string) => void;
  addContact: (contact: Omit<Contact, 'id' | 'createdAt'>) => void;
  updateContact: (id: string, contact: Partial<Contact>) => void;
  deleteContact: (id: string) => void;
  addDeal: (deal: Omit<Deal, 'id' | 'createdAt'>) => void;
  updateDeal: (id: string, deal: Partial<Deal>) => void;
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
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [categories, setCategories] = useState<CategoryInfo[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setExpenses(financeService.getExpenses());
      setBudgets(financeService.getBudgets());
      setGoals(financeService.getGoals());
      setContacts(financeService.getContacts());
      setDeals(financeService.getDeals());

      // Carrega categorias do backend; se falhar, usa dados do localStorage
      try {
        const backendCategories = await categoriesApi.listar();
        console.log('Categorias do backend:', backendCategories);
        const mapped = backendCategories.map(c => ({
          id: String(c.id),
          name: c.nome,
          color: '#8b5cf6',
          bgClass: 'bg-white/10',
          textClass: 'text-white',
          type: c.tipoCategoria as CategoryKind,
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

  const handleAddBudget = (newBudget: Omit<Budget, 'id'>) => {
    const newBudgetEntry: Budget = {
      ...newBudget,
      id: Math.random().toString(36).substring(7)
    };
    setBudgets((prev) => {
      const filtered = prev.filter((b) => b.categoryId !== newBudgetEntry.categoryId);
      const updated = [...filtered, newBudgetEntry];
      financeService.saveBudgets(updated);
      return updated;
    });
  };

  const handleSetBudgets = (action: SetStateAction<Budget[]>) => {
    setBudgets((prev) => {
      const next = typeof action === 'function' ? action(prev) : action;
      financeService.saveBudgets(next);
      return next;
    });
  };

  // Adiciona uma nova categoria, enviando para o backend via API
  const handleAddCategory = async (newCategory: Omit<CategoryInfo, 'id'>) => {
    try {
      // Mapeia o tipo do frontend (expense/income) para o formato do backend (Despesa/Receita)
      const tipoBackend = newCategory.type === 'expense' ? 'Despesa' : 'Receita';
      const criada = await categoriesApi.criar(newCategory.name, tipoBackend);

      // Converte a resposta do backend para o formato do frontend
      const category: CategoryInfo = {
        id: String(criada.id),
        name: criada.nome,
        color: newCategory.color,
        bgClass: newCategory.bgClass,
        textClass: newCategory.textClass,
        type: newCategory.type,
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

  const handleAddGoal = (newGoal: Omit<Goal, 'id'>) => {
    const goal: Goal = {
      ...newGoal,
      id: Math.random().toString(36).substring(7),
    };
    setGoals((prev) => {
      const updated = [...prev, goal];
      financeService.saveGoals(updated);
      return updated;
    });
  };

  const handleAddContact = (newContact: Omit<Contact, 'id' | 'createdAt'>) => {
    const contact: Contact = {
      ...newContact,
      id: Math.random().toString(36).substring(7),
      createdAt: new Date().toISOString(),
    };
    setContacts((prev) => {
      const updated = [...prev, contact];
      financeService.saveContacts(updated);
      return updated;
    });
  };

  const handleUpdateContact = (id: string, updates: Partial<Contact>) => {
    setContacts((prev) => {
      const updated = prev.map(c => c.id === id ? { ...c, ...updates } : c);
      financeService.saveContacts(updated);
      return updated;
    });
  };

  const handleDeleteContact = (id: string) => {
    setContacts((prev) => {
      const updated = prev.filter(c => c.id !== id);
      financeService.saveContacts(updated);
      return updated;
    });
  };

  const handleAddDeal = (newDeal: Omit<Deal, 'id' | 'createdAt'>) => {
    const deal: Deal = {
      ...newDeal,
      id: Math.random().toString(36).substring(7),
      createdAt: new Date().toISOString(),
    };
    setDeals((prev) => {
      const updated = [...prev, deal];
      financeService.saveDeals(updated);
      return updated;
    });
  };

  const handleUpdateDeal = (id: string, updates: Partial<Deal>) => {
    setDeals((prev) => {
      const updated = prev.map(d => d.id === id ? { ...d, ...updates } : d);
      financeService.saveDeals(updated);
      return updated;
    });
  };

  const incomes = useMemo(() => expenses.filter(e => e.type === 'income'), [expenses]);
  const outcomes = useMemo(() => expenses.filter(e => e.type === 'expense'), [expenses]);

  const totalIncome = useMemo(() => incomes.reduce((sum, item) => sum + item.amount, 0), [incomes]);
  const totalExpense = useMemo(() => outcomes.reduce((sum, item) => sum + item.amount, 0), [outcomes]);
  const balance = useMemo(() => totalIncome - totalExpense, [totalIncome, totalExpense]);

  const value = useMemo(() => ({
    expenses, budgets, categories, goals, contacts, deals, loading,
    addGoal: handleAddGoal,
    addExpense: handleAddExpense,
    addBudget: handleAddBudget,
    setBudgets: handleSetBudgets,
    addCategory: handleAddCategory,
    updateCategory: handleUpdateCategory,
    deleteCategory: handleDeleteCategory,
    addContact: handleAddContact,
    updateContact: handleUpdateContact,
    deleteContact: handleDeleteContact,
    addDeal: handleAddDeal,
    updateDeal: handleUpdateDeal,
    totalIncome, totalExpense, balance
  }), [expenses, budgets, categories, goals, contacts, deals, loading, totalIncome, totalExpense, balance]);

  return (
    <FinanceContext.Provider value={value}>
      {children}
    </FinanceContext.Provider>
  );
}
