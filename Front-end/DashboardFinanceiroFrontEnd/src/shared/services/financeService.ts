import { Expense } from '../types';
import { CATEGORIES } from '../constants';

const EXPENSES_STORAGE_KEY = 'finance_dashboard_expenses';
const EXPENSE_SEQUENCE_KEY = 'finance_dashboard_expense_seq';

export const financeService = {
  getExpenses(): Expense[] {
    const data = localStorage.getItem(EXPENSES_STORAGE_KEY);
    if (!data) return [];
    try { return JSON.parse(data); } catch { return []; }
  },

  saveExpenses(expenses: Expense[]): void {
    localStorage.setItem(EXPENSES_STORAGE_KEY, JSON.stringify(expenses));
  },

  /**
   * Devolve o id da próxima despesa, sequencial e persistente.
   * O contador vive no localStorage e só cresce, então dois registros nunca
   * recebem o mesmo id - e nenhum id é gerado por sorteio.
   */
  nextExpenseId(): string {
    const atual = Number(localStorage.getItem(EXPENSE_SEQUENCE_KEY)) || 0;
    const proximo = atual + 1;
    localStorage.setItem(EXPENSE_SEQUENCE_KEY, String(proximo));
    return String(proximo);
  },

  getCategories(): import('../types').CategoryInfo[] {
    const data = localStorage.getItem('finance_dashboard_categories');
    if (!data) return [];
    try {
      const stored = JSON.parse(data) as import('../types').CategoryInfo[];
      const migrated = stored.map((c) => ({
        ...c,
        type: c.type ?? this.defaultCategoryType(c.id),
      }));
      if (migrated.some((c, i) => c.type !== stored[i]?.type)) {
        this.saveCategories(migrated);
      }
      return migrated;
    } catch { return []; }
  },

  defaultCategoryType(id: string): import('../types').CategoryKind {
    const known = CATEGORIES[id as keyof typeof CATEGORIES];
    return known?.type ?? 'expense';
  },

  saveCategories(categories: import('../types').CategoryInfo[]): void {
    localStorage.setItem('finance_dashboard_categories', JSON.stringify(categories));
  }
};