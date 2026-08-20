/**
 * categoriesApi - Serviço de chamadas HTTP para o backend (Spring Boot)
 *
 * Endpoints disponíveis:
 *   - GET  /api/v1/categoria/listar         → Lista todas as categorias do usuário
 *   - POST /api/v1/categoria/criarCategoria  → Cria uma nova categoria
 *
 * Autenticação: Usa Bearer token JWT salvo no localStorage (chave: prisma_auth_token)
 */

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8080';

/** Interface que representa uma categoria retornada pelo backend */
export interface BackendCategoria {
  id: number;        // ID numérico gerado pelo backend
  nome: string;      // Nome da categoria (ex: "Alimentação")
  tipoCategoria: string; // Tipo: "Despesa" ou "Receita"
}

/** Busca o token JWT salvo no localStorage para autenticação */
function getToken(): string | null {
  return localStorage.getItem('prisma_auth_token');
}

/** Monta os headers de autenticação para as requisições HTTP */
function authHeaders(): Record<string, string> {
  const token = getToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

/** Converte o tipo do frontend ("expense"/"income") para o formato do backend ("Despesa"/"Receita") */
function traduzirTipo(tipo: string): string {
  if (tipo === 'expense') return 'Despesa';
  if (tipo === 'income') return 'Receita';
  return tipo;
}

export const categoriesApi = {
  /**
   * Lista todas as categorias do usuário logado.
   * Chama: GET /api/v1/categoria/listar
   * Retorna: Array de BackendCategoria com tipoCategoria traduzido
   */
  async listar(): Promise<BackendCategoria[]> {
    const response = await fetch(`${API_URL}/api/v1/categoria/listar`, {
      headers: authHeaders(),
    });
    if (!response.ok) throw new Error('Erro ao buscar categorias');
    const data: BackendCategoria[] = await response.json();
    return data.map(c => ({ ...c, tipoCategoria: traduzirTipo(c.tipoCategoria) }));
  },

  /**
   * Cria uma nova categoria no backend.
   * Chama: POST /api/v1/categoria/criarCategoria
   * @param nome - Nome da categoria (ex: "Transporte")
   * @param tipoCategoria - Tipo: "Despesa" ou "Receita"
   * Retorna: A categoria criada com o ID gerado pelo backend
   */
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
