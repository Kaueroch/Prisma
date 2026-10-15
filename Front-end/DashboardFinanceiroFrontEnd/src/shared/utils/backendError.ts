/**
 * Normalize any thrown value into a human-readable message for the UI.
 *
 * The backend (GlobalExceptionHandler) answers errors as plain text
 * (e.g. "Please enter the date correctly"), but Spring/network failures
 * can surface as JSON bodies, HTML whitelabel pages, or fetch TypeErrors.
 * This helper always extracts something displayable — never "[object Object]"
 * and never an empty string.
 */
export function extractErrorMessage(err: unknown, fallback: string): string {
  const raw = err instanceof Error ? err.message : typeof err === 'string' ? err : '';

  const trimmed = raw.trim();
  if (!trimmed) return fallback;

  // Network failure: fetch throws a TypeError with no useful body.
  if (/failed to fetch|networkerror|load failed|network request failed/i.test(trimmed)) {
    return 'Could not reach the backend. Check if it is running and try again.';
  }

  // Spring may answer with a JSON problem body — pull the readable field.
  if (trimmed.startsWith('{')) {
    try {
      const parsed = JSON.parse(trimmed) as Record<string, unknown>;
      const candidate = parsed.message ?? parsed.detail ?? parsed.title ?? parsed.error;
      if (typeof candidate === 'string' && candidate.trim()) return candidate.trim();
    } catch {
      // Not JSON after all — fall through to the raw text.
    }
  }

  // HTML whitelabel error page — never show markup to the user.
  if (trimmed.startsWith('<')) {
    return fallback;
  }

  return trimmed;
}
