/**
 * categoriesApi - Serviço de chamadas HTTP para o backend (Spring Boot)
 *
 * Endpoints disponíveis:
 *   - GET  /api/v1/categoria/listar         → Lista todas as categorias do usuário
 *   - POST /api/v1/categoria/criarCategoria  → Cria uma nova categoria
 *
 * Autenticação: Usa Bearer token JWT salvo no localStorage (chave: prisma_auth_token)
 */

import { getUserIdFromToken } from '../utils/token';

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8080';

/** Chave do localStorage onde o token JWT do usuário logado é salvo */
const TOKEN_STORAGE_KEY = 'prisma_auth_token';

/** Interface que representa uma categoria retornada pelo backend */
export interface BackendCategoria {
  id?: number | null;   // ID numérico (o DTO de listagem do backend não o expõe)
  nome: string;         // Nome da categoria (ex: "Alimentação")
  tipoCategoria: string;
  userId?: string | null;
}

/** Payload de criação enviado ao backend - campos batem com CategoriaDTO */
export interface CriarCategoriaPayload {
  nome: string;
  tipoCategoria: string;
  userId: string;    // UUID do usuário logado (claim "sub" do JWT)
}

/** Busca o token JWT salvo no localStorage para autenticação */
function getToken(): string | null {
  return localStorage.getItem(TOKEN_STORAGE_KEY);
}

/** Recupera o ID (UUID) do usuário logado a partir do token JWT salvo */
export function getLoggedUserId(): string | null {
  return getUserIdFromToken(getToken());
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
   * Chama: GET /api/v1/categoria/listar?userId={uuid}
   * O endpoint exige o userId como query param, então enviamos o UUID extraído do JWT.
   */
  async listar(userId?: string | null): Promise<BackendCategoria[]> {
    const query = userId ? `?userId=${encodeURIComponent(userId)}` : '';
    const response = await fetch(`${API_URL}/api/v1/categoria/listar${query}`, {
      headers: authHeaders(),
    });
    if (!response.ok) {
      const text = await response.text();
      throw new Error(text || 'Erro ao buscar categorias');
    }
    const data = await response.json();
    if (!Array.isArray(data)) {
      throw new Error('Resposta inesperada do backend ao buscar categorias.');
    }
    return data as BackendCategoria[];
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
