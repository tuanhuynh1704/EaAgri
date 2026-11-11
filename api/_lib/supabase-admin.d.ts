export interface SupabaseAdminFetchOptions {
  method?: string;
  body?: unknown;
  headers?: Record<string, string>;
}

export interface SupabaseAdminFetchResult {
  ok: boolean;
  configured: boolean;
  status: number;
  data: unknown;
  count: number | null;
  error: string | null;
}

export declare function getSupabaseAdminConfig(): { url: string; key: string } | null;

export declare function isSupabaseAdminConfigured(): boolean;

export declare function supabaseAdminFetch(
  resource: string,
  options?: SupabaseAdminFetchOptions
): Promise<SupabaseAdminFetchResult>;

export declare function deleteSupabaseRowsByIds(table: string, ids: string[]): Promise<number>;

export declare function allRowsFilter(): string;
