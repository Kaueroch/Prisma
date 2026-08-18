const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8080';

export interface BackendCategoria {
  id: number;
  nome: string;
  tipoCategoria: string;
}

function getToken(): string | null {
  return localStorage.getItem('prisma_auth_token');
}

function authHeaders(): Record<string, string> {
  const token = getToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

function traduzirTipo(tipo: string): string {
  if (tipo === 'expense') return 'Despesa';
  if (tipo === 'income') return 'Receita';
  return tipo;
}

export const categoriesApi = {
  async listar(): Promise<BackendCategoria[]> {
    const response = await fetch(`${API_URL}/api/v1/categoria/listar`, {
      headers: authHeaders(),
    });
    if (!response.ok) throw new Error('Erro ao buscar categorias');
    const data: BackendCategoria[] = await response.json();
    return data.map(c => ({ ...c, tipoCategoria: traduzirTipo(c.tipoCategoria) }));
  },

  async criar(nome: string, tipoCategoria: string): Promise<BackendCategoria> {
    const response = await fetch(`${API_URL}/api/v1/categoria/criarCategoria`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({ nome, tipoCategoria }),
    });
    if (!response.ok) {
      const text = await response.text();
      throw new Error(text || 'Erro ao criar categoria');
    }
    const data: BackendCategoria = await response.json();
    return { ...data, tipoCategoria: traduzirTipo(data.tipoCategoria) };
  },
};
