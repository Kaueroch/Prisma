import { createContext, useState, useEffect, useMemo, useRef, type ReactNode } from 'react';
import { Expense, CategoryInfo, CategoryKind } from '../shared/types';
import { financeService } from '../shared/services/financeService';
import { categoriesApi, getLoggedUserId, type BackendCategoria } from '../shared/services/categoriesApi';
import { symbolicCategoryColor } from '../shared/utils/categoryColor';
import { symbolicCategorySymbol } from '../shared/components/CategorySymbol';
import { transacoesApi, type BackendTransacao } from '../shared/services/transacoesApi';

interface FinanceContextType {
  expenses: Expense[];
  categories: CategoryInfo[];
  loading: boolean;
  categoriesError: string | null;
  addExpense: (expense: Omit<Expense, 'id'>) => Promise<void>;
  updateExpense: (id: string, updates: Omit<Expense, 'id'>) => Promise<void>;
  deleteExpense: (id: string) => Promise<void>;
  addCategory: (category: Omit<CategoryInfo, 'id'>) => Promise<CategoryInfo>;
  updateCategory: (id: string, category: Partial<CategoryInfo>) => Promise<void>;
  deleteCategory: (id: string, nome?: string) => Promise<void>;
  totalIncome: number;
  totalExpense: number;
  balance: number;
}

export const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

/** "dd/MM/yyyy" (banco) → "yyyy-MM-dd" (formato interno do front). */
function toIsoDate(backendDate: string): string {
  const parts = backendDate.split('/');
  if (parts.length !== 3) return backendDate;
  const [day, month, year] = parts;
  return `${year}-${month}-${day}`;
}

/** Converte a transação do back-end para o formato interno do front. */
function toExpense(t: BackendTransacao): Expense {
  return {
    // O id é o cd_id do banco — o mesmo que o front usa para referenciar.
    id: String(t.id),
    amount: Number(t.valor),
    name: t.descricao,
    date: toIsoDate(t.data),
    categoryId: t.categoria_id != null ? String(t.categoria_id) : '',
    type: t.categoria_tipo === 'Receita' ? 'income' : 'expense',
    note: t.observacao ?? undefined,
  };
}

/**
 * Chave de equivalência entre um lançamento do cache local e um do banco.
 * Mesmo valor, descrição e data = o mesmo lançamento.
 */
function sameExpense(a: Expense, b: Expense): boolean {
  return (
    a.name.trim() === b.name.trim() &&
    Math.abs(a.amount - b.amount) < 0.01 &&
    a.date === b.date
  );
}

/**
 * Envia ao back-end os lançamentos que existem só no cache local.
 *
 * Só sobe o que tem categoria válida do banco (cd_id numérico) — lançamento
 * com categoria local ("food", UUID) não tem como ser gravado, e por isso
 * continua apenas no cache.
 */
async function pushMissingToBackend(
  cached: Expense[],
  fromBackend: Expense[],
  backendCategories: BackendCategoria[] | null,
): Promise<Expense[]> {
  if (cached.length === 0) return fromBackend;

  const validCategoryIds = new Set(
    (backendCategories ?? []).map((c) => String(c.id)),
  );

  const missing = cached.filter((c) => {
    if (fromBackend.some((b) => sameExpense(b, c))) return false;
    return validCategoryIds.has(c.categoryId);
  });

  if (missing.length === 0) return fromBackend;

  const sent: Expense[] = [];
  for (const expense of missing) {
    try {
      const id = await transacoesApi.criar({
        valor: expense.amount,
        descricao: expense.name,
        data: expense.date,
        categoriaId: expense.categoryId,
        observacao: expense.note,
      });
      sent.push({ ...expense, id: String(id) });
    } catch (err) {
      // Falhou ao sincronizar: mantém no cache e tenta de novo na próxima carga.
      console.warn('Não foi possível sincronizar um lançamento local:', err);
      sent.push(expense);
    }
  }

  return [...sent, ...fromBackend];
}

const CAT_COLORS_KEY = 'prisma_cat_colors_v1'

function loadCatColors(): Record<string, string> {
  try {
    const raw = localStorage.getItem(CAT_COLORS_KEY)
    return raw ? (JSON.parse(raw) as Record<string, string>) : {}
  } catch { return {} }
}

function saveCatColor(id: string, color: string) {
  try {
    const map = loadCatColors()
    map[id] = color
    localStorage.setItem(CAT_COLORS_KEY, JSON.stringify(map))
  } catch {}
}

interface FinanceProviderProps {
  children: ReactNode;
}

export function FinanceProvider({ children }: FinanceProviderProps) {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [categories, setCategories] = useState<CategoryInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoriesError, setCategoriesError] = useState<string | null>(null);
  /**
   * Garante que a carga inicial rode uma única vez.
   *
   * Em StrictMode (dev) o effect é montado duas vezes e as duas cargas
   * assíncronas ficam em paralelo: as duas veriam o mesmo cache e
   * enviariam o mesmo lançamento local para o banco duas vezes.
   */
  const loadedRef = useRef(false);

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
    if (loadedRef.current) return;
    loadedRef.current = true;

    const loadData = async () => {
      setCategoriesError(null);

      // Load categories from the backend; fall back to localStorage on failure
      let backendCategories: BackendCategoria[] | null = null;
      try {
        const userId = getLoggedUserId();
        backendCategories = await categoriesApi.listar(userId);
        const colorOverrides = loadCatColors()
        const mapped = backendCategories.map((c) => ({
          // Use the cd_id from the database, never a fabricated id here.
          // Color and symbol are symbolic and local-only (backend has no such fields).
          id: String(c.id),
          name: c.nome,
          color: colorOverrides[String(c.id)] ?? symbolicCategoryColor(c.nome),
          bgClass: 'bg-white/10',
          textClass: 'text-white',
          icon: symbolicCategorySymbol(c.nome),
          type: (c.tipoCategoria === 'Despesas' ? 'expense' : 'income') as CategoryKind,
        }));
        setCategories(mapped);
        // Cache local: só para o caso do back-end ficar fora do ar.
        financeService.saveCategories(mapped);
      } catch (err) {
        console.warn('Could not load categories from the backend, using localStorage:', err);
        setCategories(financeService.getCategories());
        setCategoriesError(err instanceof Error ? err.message : 'Não foi possível carregar as categorias do backend.');
      }

      // Load transactions from the backend — it is the source of truth.
      // The localStorage copy is only a cache for when the API is down.
      const cached = financeService.getExpenses();
      try {
        const backendExpenses = await transacoesApi.listar();
        const mapped = backendExpenses.map(toExpense);
        // Anything still cached that the backend does not know about is
        // offered to the backend, so nothing the user already recorded is
        // lost when the API comes back up.
        const merged = await pushMissingToBackend(cached, mapped, backendCategories);
        setExpenses(merged);
        financeService.saveExpenses(merged);
      } catch (err) {
        console.warn('Could not load transactions from the backend, using localStorage:', err);
        setExpenses(cached);
      }

      setLoading(false);
    };
    loadData();
  }, []);

  const handleAddExpense = async (newExpense: Omit<Expense, 'id'>) => {
    // 1. Persist in the backend first: POST /api/v1/transacao/criar.
    // The payload mapping (valor/descricao/data dd/MM/yyyy/categoria_id direto)
    // follows the TransacaoDTO record contract.
    let createdId: number;
    try {
      createdId = await transacoesApi.criar({
        valor: newExpense.amount,
        descricao: newExpense.name,
        data: newExpense.date,
        categoriaId: newExpense.categoryId,
        observacao: newExpense.note,
      });
    } catch (err) {
      console.error( 'Não foi possível criar a transação no backend:', err);
      throw err instanceof Error ? err : new Error( 'Não foi possível criar a transação.');
    }

    // 2. Only mirror locally after the database confirms the creation,
    // so the UI never lies about state (same pattern as categories).
    // The id is the cd_id generated by the database — not a local counter —
    // so the cache and the database always agree.
    const expense: Expense = {
      ...newExpense,
      id: String(createdId),
      note: newExpense.note,
    };
    setExpenses((prev) => {
      const updated = [expense, ...prev];
      financeService.saveExpenses(updated);
      return updated;
    });
  };

  // Edita a transação: chama PUT no backend e só atualiza o estado local
  // após a confirmação. IDs não-numéricos (locais) atualizam só o localStorage.
  const handleUpdateExpense = async (id: string, updates: Omit<Expense, 'id'>): Promise<void> => {
    const numericId = Number(id);
    const isBackendId = Number.isInteger(numericId);

    if (!isBackendId) {
      setExpenses((prev) => {
        const updated = prev.map(e => e.id === id ? { ...e, ...updates } : e);
        financeService.saveExpenses(updated);
        return updated;
      });
      return;
    }

    try {
      await transacoesApi.atualizar(numericId, {
        valor: updates.amount,
        descricao: updates.name,
        data: updates.date,
        categoriaId: updates.categoryId,
        observacao: updates.note,
      });
    } catch (err) {
      console.error(`Não foi possível atualizar a transação (cd_id: ${id}) no backend.`, err);
      throw err instanceof Error ? err : new Error('Não foi possível atualizar a transação.');
    }

    setExpenses((prev) => {
      const updated = prev.map(e => e.id === id ? { ...e, ...updates } : e);
      financeService.saveExpenses(updated);
      return updated;
    });
  };

  // Exclui a transação: chama DELETE no backend e só remove do estado local
  // após a confirmação. IDs não-numéricos (locais) são removidos diretamente.
  const handleDeleteExpense = async (id: string): Promise<void> => {
    const numericId = Number(id);
    const isBackendId = Number.isInteger(numericId);

    if (!isBackendId) {
      setExpenses((prev) => {
        const updated = prev.filter(e => e.id !== id);
        financeService.saveExpenses(updated);
        return updated;
      });
      return;
    }

    try {
      await transacoesApi.deletar(numericId);
    } catch (err) {
      console.error(`Não foi possível excluir a transação (cd_id: ${id}) no backend.`, err);
      throw err instanceof Error ? err : new Error('Não foi possível excluir a transação.');
    }

    setExpenses((prev) => {
      const updated = prev.filter(e => e.id !== id);
      financeService.saveExpenses(updated);
      return updated;
    });
  };

  // Add a new category by sending it to the backend via API
  const handleAddCategory = async (newCategory: Omit<CategoryInfo, 'id'>): Promise<CategoryInfo> => {
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

      if (newCategory.color !== symbolicCategoryColor(newCategory.name)) {
        saveCatColor(String(categoriaId), newCategory.color)
      }

      const category: CategoryInfo = {
        ...newCategory,
        id: String(categoriaId),
      };

      setCategories((prev) => {
        const updated = [category, ...prev];
        financeService.saveCategories(updated);
        return updated;
      });
      return category;
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

    if (updates.color) {
      const existing = categories.find(c => c.id === id)
      if (updates.color !== symbolicCategoryColor(updates.name ?? existing?.name ?? '')) {
        saveCatColor(id, updates.color)
      }
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
    updateExpense: handleUpdateExpense,
    deleteExpense: handleDeleteExpense,
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