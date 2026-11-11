/**
 * Minimal server-side Supabase REST client for admin-only operations.
 *
 * The public anon key must NOT be able to read visitor PII after the RLS
 * migration. Env-admin sessions are not Supabase Auth users, so destructive
 * and read operations from the admin dashboard have to run through the
 * service role key on the server instead of the browser client.
 */
export function getSupabaseAdminConfig() {
  const url = String(process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || "")
    .trim()
    .replace(/\/$/, "");
  const key = String(
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY || ""
  ).trim();

  if (!url || !key) return null;
  return { url, key };
}

export function isSupabaseAdminConfigured() {
  return Boolean(getSupabaseAdminConfig());
}

/**
 * @param {string} resource PostgREST path including the query string.
 * @param {{method?: string, body?: any, headers?: Record<string, string>}} [options]
 */
export async function supabaseAdminFetch(resource, options = {}) {
  const config = getSupabaseAdminConfig();
  if (!config) {
    return {
      ok: false,
      configured: false,
      status: 0,
      data: null,
      count: null,
      error: "Supabase service role key is not configured",
    };
  }

  const headers = {
    apikey: config.key,
    Authorization: `Bearer ${config.key}`,
    Accept: "application/json",
    ...(options.body !== undefined ? { "Content-Type": "application/json" } : {}),
    ...(options.headers || {}),
  };

  try {
    const response = await fetch(`${config.url}/rest/v1/${resource}`, {
      method: options.method || "GET",
      headers,
      body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
    });

    const text = await response.text();
    let data = null;
    if (text) {
      try {
        data = JSON.parse(text);
      } catch {
        data = text;
      }
    }

    const contentRange = response.headers.get("content-range") || "";
    const countMatch = contentRange.match(/\/(\d+)$/);

    return {
      ok: response.ok,
      configured: true,
      status: response.status,
      data,
      count: countMatch ? Number(countMatch[1]) : null,
      error: response.ok
        ? null
        : data?.message || data?.error || text || `Supabase HTTP ${response.status}`,
    };
  } catch (error) {
    return {
      ok: false,
      configured: true,
      status: 0,
      data: null,
      count: null,
      error: error?.message || "Supabase request failed",
    };
  }
}

/**
 * Delete rows by primary key in small batches so the URL never grows too long.
 * @param {string} table
 * @param {string[]} ids
 */
export async function deleteSupabaseRowsByIds(table, ids) {
  const uniqueIds = [...new Set((ids || []).filter(Boolean).map(String))];
  let deleted = 0;

  for (let index = 0; index < uniqueIds.length; index += 40) {
    const batch = uniqueIds.slice(index, index + 40);
    const result = await supabaseAdminFetch(
      `${table}?id=in.(${batch.join(",")})`,
      { method: "DELETE", headers: { Prefer: "count=exact" } }
    );
    if (result.ok) deleted += result.count ?? batch.length;
  }

  return deleted;
}

/** PostgREST refuses an unfiltered DELETE; this filter matches every real row. */
export function allRowsFilter() {
  return "id=neq.00000000-0000-0000-0000-000000000000";
}
