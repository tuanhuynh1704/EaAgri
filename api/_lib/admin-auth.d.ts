export interface AdminSessionPayload {
  sub: string;
  role: string;
  iat: number;
  exp: number;
  jti: string;
}

export interface AdminAuthResult {
  ok: boolean;
  status?: number;
  error?: string;
  method?: "env-admin" | "supabase";
  user?: { id?: string; email?: string; role?: string; sub?: string };
}

export declare function getAdminCredentials(): {
  username: string;
  email: string;
  password: string;
};

export declare function createAdminToken(subject?: string): {
  token: string;
  expiresAt: number;
};

export declare function verifyAdminToken(token: string): AdminSessionPayload | null;

export declare function verifyAdminCredentials(identifier: string, password: string): boolean;

export declare function requireAdmin(req: unknown): Promise<AdminAuthResult>;
