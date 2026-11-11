export const ADMIN_SESSION_KEY = "eaagri_admin_session";

export interface StoredAdminSession {
  token?: string;
  expiresAt?: number;
  buildId?: string;
}

export function readAdminSession(): StoredAdminSession | null {
  try {
    const raw = localStorage.getItem(ADMIN_SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoredAdminSession;
    return parsed && typeof parsed === "object" ? parsed : null;
  } catch {
    return null;
  }
}

export function writeAdminSession(session: StoredAdminSession): void {
  localStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(session));
}

export function removeAdminSession(): void {
  localStorage.removeItem(ADMIN_SESSION_KEY);
}

/**
 * Returns the server-signed admin token when the local session is still valid.
 * Used by visitorTracker to authenticate destructive API calls.
 */
export function getAdminToken(): string | null {
  const session = readAdminSession();
  if (!session?.token) return null;
  if (typeof session.expiresAt !== "number" || Date.now() >= session.expiresAt) {
    removeAdminSession();
    return null;
  }
  return session.token;
}
