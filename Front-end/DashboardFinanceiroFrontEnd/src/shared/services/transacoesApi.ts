/**
 * transacoesApi - HTTP client for the backend (Spring Boot)
 *
 * Endpoint used by the "New transaction" button:
 *   - POST /api/v1/transacao/criar → Create a new transaction
 *
 * Auth: uses the Bearer JWT token stored in localStorage (key: prisma_auth_token).
 * The backend secures this route (anyRequest().authenticated()), so the token
 * is mandatory — same pattern as categoriesApi.
 *
 * Backend contract (TransacaoDTO.java record):
 *   - valor:       number (BigDecimal, vl_valor, not null)
 *   - descricao:   string (ds_descricao, not null, not blank)
 *   - data:        string (dt_dataGasto, not null, format "dd/MM/yyyy")
 *   - categoria_id: number (FK categoria_id, Integer — id direto, sem objeto)
 *
 * Example JSON the backend expects:
 *   {
 *     "valor": 150.75,
 *     "descricao": "Padaria",
 *     "data": "14/10/2026",
 *     "categoria_id": 3
 *   }
 */

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8080';

/** localStorage key where the logged-in user JWT is stored */
const TOKEN_STORAGE_KEY = 'prisma_auth_token';

/** Payload in backend shape (matches TransacaoDTO record field names) */
export interface CriarTransacaoPayload {
  valor: number;
  descricao: string;
  /** Date in "dd/MM/yyyy" — the only format Transacao.converteStringToDate parses */
  data: string;
  categoria_id: number;
}

/** Friendly input from the transaction form (date comes as yyyy-MM-dd from <input type="date">) */
export interface NovaTransacaoInput {
  valor: number;
  descricao: string;
  /** Date as "yyyy-MM-dd" (HTML date input value) */
  data: string;
  categoriaId: string | number;
}

/** Convert "yyyy-MM-dd" → "dd/MM/yyyy" as required by Transacao.java */
export function toBackendDate(isoDate: string): string {
  const [year, month, day] = isoDate.split('-');
  if (!year || !month || !day) {
    throw new Error(`Invalid date "${isoDate}". Expected format yyyy-MM-dd.`);
  }
  return `${day}/${month}/${year}`;
}

/** Read an error response body as a displayable message (never HTML, never blank). */
async function readErrorBody(response: Response): Promise<string> {
  let text = '';
  try {
    text = (await response.text()).trim();
  } catch {
    return '';
  }
  if (!text) return '';
  // Spring problem-detail JSON — extract the readable field.
  if (text.startsWith('{')) {
    try {
      const parsed = JSON.parse(text) as Record<string, unknown>;
      const candidate = parsed.message ?? parsed.detail ?? parsed.title ?? parsed.error;
      if (typeof candidate === 'string' && candidate.trim()) return candidate.trim();
      return '';
    } catch {
      return text;
    }
  }
  // HTML whitelabel page — never show markup to the user.
  if (text.startsWith('<')) return '';
  // Cap verbose stack traces so the UI stays readable.
  return text.length > 300 ? `${text.slice(0, 300)}…` : text;
}

function defaultErrorForStatus(status: number): string {
  if (status === 401 || status === 403) return 'Session expired. Please sign in again.';
  if (status === 404) return 'Endpoint not found (POST /api/v1/transacao/criar).';
  if (status >= 500) return 'Backend failed to create the transaction. Check the backend logs.';
  return 'Could not create transaction. Check the fields and try again.';
}

/** Read the stored JWT from localStorage for auth */
function getToken(): string | null {
  return localStorage.getItem(TOKEN_STORAGE_KEY);
}

/** Build the auth headers for HTTP requests */
function authHeaders(): Record<string, string> {
  const token = getToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export const transacoesApi = {
  /**
   * Create a transaction in the backend.
   * Calls: POST /api/v1/transacao/criar
   *
   * The backend answers with plain text ("Transacao Criada."), not JSON,
   * so the response is read with response.text().
   */
  async criar(input: NovaTransacaoInput): Promise<string> {
    const payload: CriarTransacaoPayload = {
      valor: input.valor,
      descricao: input.descricao,
      data: toBackendDate(input.data),
      categoria_id: Number(input.categoriaId),
    };

    // Debug: mostra exatamente o que será enviado no POST.
    // Abra o DevTools (F12 → Console) para inspecionar antes do fetch.
    console.groupCollapsed('[transacao] POST /api/v1/transacao/criar — payload');
    console.log('input (form):', input);
    console.log('payload (backend):', payload);
    console.log('json:', JSON.stringify(payload));
    console.log('url:', `${API_URL}/api/v1/transacao/criar`);
    console.groupEnd();

    if (!Number.isFinite(payload.valor) || payload.valor <= 0) {
      throw new Error('Enter an amount greater than zero.');
    }
    if (!payload.descricao.trim()) {
      throw new Error('Enter a description.');
    }
    if (!Number.isFinite(payload.categoria_id)) {
      throw new Error('Select a valid category.');
    }

    let response: Response;
    try {
      response = await fetch(`${API_URL}/api/v1/transacao/criar`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify(payload),
      });
    } catch {
      throw new Error(`Could not reach the backend at ${API_URL}. Is it running?`);
    }

    if (!response.ok) {
      const backendMessage = await readErrorBody(response);
      throw new Error(backendMessage || defaultErrorForStatus(response.status));
    }
    return response.text();
  },
};
