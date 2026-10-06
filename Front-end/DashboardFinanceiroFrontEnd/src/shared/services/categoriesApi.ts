/**
 * categoriesApi - Serviço de chamadas HTTP para o backend (Spring Boot)
 *
 * Endpoints disponíveis:
 *   - GET    /api/v1/categoria/listar              → Lista todas as categorias do usuário
 *   - POST   /api/v1/categoria/criarCategoria       → Cria uma nova categoria
 *   - PUT    /api/v1/categoria/atualizarLista?id={id} → Atualiza nome/tipo pelo cd_id
 *   - DELETE /api/v1/categoria/deletar?id={id}      → Exclui uma categoria pelo cd_id
 *
 * Autenticação: Usa Bearer token JWT salvo no localStorage (chave: prisma_auth_token)
 */

import { getUserIdFromToken } from '../utils/token';

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8080';

/** Chave do localStorage onde o token JWT do usuário logado é salvo */
const TOKEN_STORAGE_KEY = 'prisma_auth_token';

/** Interface que representa uma categoria retornada pelo backend */
export interface BackendCategoria {
  id: number;           // cd_id real gerado pelo banco
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

/** Payload de atualização - apenas os campos alteráveis + o id da categoria (CategoriaDTO) */
export interface AtualizarCategoriaPayload {
  id: number;
  nome: string;
  tipoCategoria: string;
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
   * Cria uma nova categoria no backend e devolve o cd_id gerado pelo banco.
   * Chama: POST /api/v1/categoria/criarCategoria
   */
  async criar(payload: CriarCategoriaPayload): Promise<number> {
    const response = await fetch(`${API_URL}/api/v1/categoria/criarCategoria`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      const text = await response.text();
      throw new Error(text || 'Erro ao criar categoria');
    }
    const data = await response.json();
    return Number(data.id);
  },

  /**
   * Atualiza uma categoria existente enviando um objeto (nome/tipo) e o id.
   * Chama: PUT /api/v1/categoria/atualizarLista?id={categoriaId}
   *
   * O id vai na query (igual ao deletar) e o objeto com os campos
   * alteráveis vai no corpo da requisição.
   */
  async atualizar(categoriaId: number, payload: AtualizarCategoriaPayload): Promise<void> {
    const response = await fetch(
      `${API_URL}/api/v1/categoria/atualizarLista?id=${encodeURIComponent(String(categoriaId))}`,
      {
        method: 'PUT',
        headers: authHeaders(),
        body: JSON.stringify(payload),
      },
    );
    if (!response.ok) {
      const text = await response.text();
      throw new Error(text || 'Erro ao atualizar categoria');
    }
  },

  /**
   * Exclui uma categoria pelo cd_id real e devolve o registro removido.
   * Chama: DELETE /api/v1/categoria/deletar?id={categoriaId}
   *
   * O dono da categoria é validado no backend pelo token JWT, então aqui
   * enviamos apenas o id - nunca o objeto inteiro nem um id fabricado.
   */
  async deletar(categoriaId: number): Promise<BackendCategoria> {
    const response = await fetch(
      `${API_URL}/api/v1/categoria/deletar?id=${encodeURIComponent(String(categoriaId))}`,
      {
        method: 'DELETE',
        headers: authHeaders(),
      },
    );
    if (!response.ok) {
      const text = await response.text();
      throw new Error(text || 'Erro ao excluir categoria');
    }
    return (await response.json()) as BackendCategoria;
  },
};
