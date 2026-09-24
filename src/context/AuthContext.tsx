import React, { createContext, useContext, useEffect, useState } from "react";
// import { User } from "@supabase/supabase-js";
import { supabase } from "../utils/supabase/client";
import type { User } from "@supabase/supabase-js";

interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  role: "SA" | "user";
  created_at: string;
}

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  authError: string | null;
  loginAdminEnv: (identifier: string, pass: string) => boolean;
}

const ADMIN_USER_ENV = (import.meta.env.VITE_ADMIN_USERNAME || "admin").toLowerCase().trim();
const ADMIN_EMAIL_ENV = (import.meta.env.VITE_ADMIN_EMAIL || "admin@eaagri.vn").toLowerCase().trim();
const ADMIN_PASSWORD_ENV = import.meta.env.VITE_ADMIN_PASSWORD || "admin@123";

// Admin session: stored with the build it was created on and an expiry, so it
// ends automatically after a new deploy or after ADMIN_SESSION_TTL_MS.
const ADMIN_SESSION_KEY = "eaagri_admin_session";
const BUILD_ID_KEY = "eaagri_build_id";
const BUILD_ID: string = import.meta.env.VITE_BUILD_ID || "dev";
const ADMIN_SESSION_TTL_MS = 8 * 60 * 60 * 1000; // 8 hours

const saveAdminSession = () => {
  localStorage.setItem(
    ADMIN_SESSION_KEY,
    JSON.stringify({ buildId: BUILD_ID, expiresAt: Date.now() + ADMIN_SESSION_TTL_MS })
  );
};

const hasValidAdminSession = (): boolean => {
  try {
    const raw = localStorage.getItem(ADMIN_SESSION_KEY);
    if (!raw) return false;
    const { buildId, expiresAt } = JSON.parse(raw) as { buildId?: string; expiresAt?: number };
    const valid = buildId === BUILD_ID && typeof expiresAt === "number" && Date.now() < expiresAt;
    if (!valid) localStorage.removeItem(ADMIN_SESSION_KEY);
    return valid;
  } catch {
    // Old "true" flag or corrupted value
    localStorage.removeItem(ADMIN_SESSION_KEY);
    return false;
  }
};

const clearSupabaseStorage = () => {
  try {
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith("sb-") || key.includes("supabase.auth.token")) {
        localStorage.removeItem(key);
      }
    });
    Object.keys(sessionStorage).forEach((key) => {
      if (key.startsWith("sb-") || key.includes("supabase.auth.token")) {
        sessionStorage.removeItem(key);
      }
    });
  } catch (_) {}
};

// New deploy detected: drop every stored session before anything reads it
const isNewBuild = (() => {
  try {
    const previous = localStorage.getItem(BUILD_ID_KEY);
    localStorage.setItem(BUILD_ID_KEY, BUILD_ID);
    if (previous !== null && previous !== BUILD_ID) {
      localStorage.removeItem(ADMIN_SESSION_KEY);
      clearSupabaseStorage();
      return true;
    }
  } catch (_) {}
  return false;
})();

const ADMIN_MOCK_USER: User = {
  id: "eaagri-admin-sa-master",
  email: ADMIN_EMAIL_ENV,
  app_metadata: { provider: "email", role: "SA" },
  user_metadata: { full_name: "Super Admin EaAgri", role: "SA" },
  aud: "authenticated",
  created_at: "2026-01-01T00:00:00.000Z",
} as User;

const ADMIN_MOCK_PROFILE: Profile = {
  id: "eaagri-admin-sa-master",
  email: ADMIN_EMAIL_ENV,
  full_name: "Super Admin EaAgri",
  role: "SA",
  created_at: "2026-01-01T00:00:00.000Z",
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const loginAdminEnv = (identifier: string, pass: string): boolean => {
    const inputId = identifier.toLowerCase().trim();
    if (
      (inputId === ADMIN_USER_ENV || inputId === ADMIN_EMAIL_ENV || inputId === "admin" || inputId === "admin@eaagri.vn") &&
      pass === ADMIN_PASSWORD_ENV
    ) {
      saveAdminSession();
      setUser(ADMIN_MOCK_USER);
      setProfile(ADMIN_MOCK_PROFILE);
      setAuthError(null);
      setLoading(false);
      return true;
    }
    return false;
  };

  const fetchProfile = async (userId: string) => {
    try {
      console.log("AuthContext: Fetching profile for user ID:", userId);
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (error) {
        console.error("AuthContext: Error fetching user profile from database:", error.message, error);
        setAuthError(`${error.message} (Code: ${error.code || 'unknown'})`);
        setProfile(null);
      } else {
        console.log("AuthContext: Profile successfully fetched:", data);
        setProfile(data as Profile);
        setAuthError(null);
      }
    } catch (err: any) {
      console.error("AuthContext: Unexpected exception fetching profile:", err);
      setAuthError(err.message || "Unexpected error");
      setProfile(null);
    }
  };

  const refreshProfile = async () => {
    if (hasValidAdminSession()) {
      setProfile(ADMIN_MOCK_PROFILE);
      return;
    }
    if (user) {
      await fetchProfile(user.id);
    }
  };

  useEffect(() => {
    // Also end the Supabase session server-side after a new deploy
    if (isNewBuild) {
      supabase.auth.signOut({ scope: "local" }).catch(() => {});
    }

    // 0. Check local admin session first
    if (hasValidAdminSession()) {
      setUser(ADMIN_MOCK_USER);
      setProfile(ADMIN_MOCK_PROFILE);
      setLoading(false);
      return;
    }

    // 1. Check current session from Supabase
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setUser(session.user);
        fetchProfile(session.user.id).finally(() => setLoading(false));
      } else {
        setUser(null);
        setProfile(null);
        setLoading(false);
      }
    });

    // 2. Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (hasValidAdminSession()) {
          return;
        }
        if (session) {
          setUser(session.user);
          await fetchProfile(session.user.id);
        } else {
          setUser(null);
          setProfile(null);
        }
        setLoading(false);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    setLoading(true);
    localStorage.removeItem(ADMIN_SESSION_KEY);
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.warn("AuthContext: Supabase signOut returned error, forcing local session clear:", err);
    } finally {
      clearSupabaseStorage();

      setUser(null);
      setProfile(null);
      setAuthError(null);
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, signOut, refreshProfile, authError, loginAdminEnv }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
