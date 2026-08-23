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
  tipoCategoria: string;
}

/** Payload de criação enviado ao backend - campos batem com CategoriaDTO */
export interface CriarCategoriaPayload {
  nome: string;
  tipoCategoria: string;
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

export const categoriesApi = {
  /**
   * Lista todas as categorias do usuário logado.
   * Chama: GET /api/v1/categoria/listar
   */
  async listar(): Promise<BackendCategoria[]> {
    const response = await fetch(`${API_URL}/api/v1/categoria/listar`, {
      headers: authHeaders(),
    });
    if (!response.ok) throw new Error('Erro ao buscar categorias');
    return (await response.json()) as BackendCategoria[];
  },

  /**
   * Cria uma nova categoria no backend enviando o payload puro do formulário.
   * Chama: POST /api/v1/categoria/criarCategoria
   * O backend responde apenas com uma mensagem de confirmação.
   */
  async criar(payload: CriarCategoriaPayload): Promise<void> {
    const response = await fetch(`${API_URL}/api/v1/categoria/criarCategoria`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      const text = await response.text();
      throw new Error(text || 'Erro ao criar categoria');
    }
  },
};
