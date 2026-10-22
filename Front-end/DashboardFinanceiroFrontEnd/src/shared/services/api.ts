/**
 * Configuração de API compartilhada.
 *
 * Antes cada serviço tinha sua própria cópia de `API_URL`, `getToken()` e
 * `authHeaders()` — quatro lugares para lembrar de atualizar, e foi
 * exatamente assim que a porta do `.env` (8081) divergiu do back-end (8080).
 *
 * A porta canônica é 8080: é a do `server.port`, a do docker-compose
 * (`8080:8080`) e a do README.
 */

export const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8080';

/** localStorage key where the logged-in user JWT is stored */
const TOKEN_STORAGE_KEY = 'prisma_auth_token';

/** Read the stored JWT from localStorage for auth */
export function getToken(): string | null {
  return localStorage.getItem(TOKEN_STORAGE_KEY);
}

/** Build the auth headers for HTTP requests */
export function authHeaders(): Record<string, string> {
  const token = getToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

/**
 * Read an error response body as a displayable message (never HTML, never blank).
 *
 * The back-end answers errors as plain text, or as Spring's problem-detail
 * JSON (`{"error": "..."}`), or as the whitelabel HTML page.
 */
export async function readErrorBody(response: Response): Promise<string> {
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
