import { isErrorEnvelope, type ErrorCode } from '../contracts/generated';

/**
 * A refused admin API request, read from the backend's single error envelope
 * `{ success: false, error: { code, message, details? } }` (contracts/generated.ts).
 * Pages show `message`; structured context the backend used to put at the top level
 * (retry hints, broadcast counts, ...) now lives in `details`.
 */
export class AdminApiError extends Error {
  readonly code: ErrorCode | (string & {});
  readonly details: unknown;
  readonly status: number;

  constructor(init: { code: string; message: string; details?: unknown; status: number }) {
    super(init.message);
    this.name = 'AdminApiError';
    this.code = init.code;
    this.details = init.details;
    this.status = init.status;
  }
}

/**
 * Thrown for a 403: the admin is signed in but their role lacks the permission the
 * endpoint requires (RBAC). The session is left intact.
 */
export class PermissionDeniedError extends AdminApiError {
  constructor(init: { code?: string; message: string; details?: unknown }) {
    super({ code: init.code ?? 'FORBIDDEN', message: init.message, details: init.details, status: 403 });
    this.name = 'PermissionDeniedError';
  }
}

/**
 * Turn a non-OK response body into the error to throw. `body` is whatever parsed
 * (null when the body was not JSON); a non-envelope body falls back to `fallback`.
 */
export function toAdminApiError(status: number, body: unknown, fallback: string): AdminApiError {
  const envelope = isErrorEnvelope(body) ? body.error : null;
  if (status === 403) {
    const detail = envelope?.message;
    return new PermissionDeniedError({
      code: envelope?.code,
      message: detail ? `You don't have permission to do this. ${detail}` : "You don't have permission to do this.",
      details: envelope?.details,
    });
  }
  return new AdminApiError({
    code: envelope?.code ?? 'UNKNOWN_ERROR',
    message: envelope?.message || fallback,
    details: envelope?.details,
    status,
  });
}

/** The text to show for any caught error: the envelope message when there is one. */
export function errorMessage(error: unknown, fallback: string): string {
  if (error instanceof Error && error.message) return error.message;
  if (isErrorEnvelope(error)) return error.error.message || fallback;
  return fallback;
}

/** The envelope's `details` as a record, or {} when absent/not an object. */
export function errorDetails(error: unknown): Record<string, unknown> {
  const details = error instanceof AdminApiError ? error.details : isErrorEnvelope(error) ? error.error.details : undefined;
  return details && typeof details === 'object' ? (details as Record<string, unknown>) : {};
}
