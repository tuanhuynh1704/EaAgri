/**
 * Extract a human-readable message from an unknown thrown value.
 * Useful because Supabase returns plain objects with a `message` field,
 * while fetch/throw paths produce real Error instances.
 */
export function getErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof Error && error.message) return error.message;

  if (typeof error === "string" && error.trim()) return error;

  if (error && typeof error === "object" && "message" in error) {
    const message = (error as { message?: unknown }).message;
    if (typeof message === "string" && message.trim()) return message;
  }

  return fallback;
}
