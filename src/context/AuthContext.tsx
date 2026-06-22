import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  clearAuthSession,
  fetchCurrentUser,
  getStoredAccessToken,
  getStoredUser,
  loginWithCredentials,
  logoutUser,
  registerAccount,
  type AuthLoginResult,
  type AuthUser,
  type RegisterPayload,
} from "@/lib/api/auth";

type AuthContextValue = {
  user: AuthUser | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<AuthLoginResult>;
  register: (payload: RegisterPayload) => Promise<AuthLoginResult>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<AuthUser | null>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => getStoredUser());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const token = getStoredAccessToken();
    if (!token) {
      setLoading(false);
      return;
    }
    fetchCurrentUser()
      .then((u) => {
        if (!cancelled) setUser(u);
      })
      .catch(() => {
        if (!cancelled) {
          clearAuthSession();
          setUser(null);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const result = await loginWithCredentials(email, password);
    setUser(result.user);
    return result;
  }, []);

  const register = useCallback(async (payload: RegisterPayload) => {
    const result = await registerAccount(payload);
    setUser(result.user);
    return result;
  }, []);

  const logout = useCallback(async () => {
    await logoutUser();
    setUser(null);
  }, []);

  const refreshUser = useCallback(async () => {
    const token = getStoredAccessToken();
    if (!token) {
      setUser(null);
      return null;
    }
    try {
      const u = await fetchCurrentUser();
      setUser(u);
      return u;
    } catch {
      clearAuthSession();
      setUser(null);
      return null;
    }
  }, []);

  const value = useMemo(
    () => ({
      user,
      loading,
      isAuthenticated: Boolean(user),
      login,
      register,
      logout,
      refreshUser,
    }),
    [user, loading, login, register, logout, refreshUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

/** First name for greetings / nav labels. */
export function userDisplayName(user: AuthUser | null | undefined): string {
  if (!user) return "";
  const n = user.name?.trim();
  if (n) return n.split(/\s+/)[0] ?? n;
  return user.email.split("@")[0] ?? "Member";
}
