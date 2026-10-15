import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { authApi } from "../../api/auth.api";
import { onUnauthorized } from "../../api/http";
import { tokenStorage } from "../../api/token-storage";
import type { User } from "../../types/user";
import { AuthContext, type AuthContextValue, type AuthStatus } from "./auth-context";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [status, setStatus] = useState<AuthStatus>(() => (tokenStorage.get() ? "loading" : "unauthenticated"));

  const logout = useCallback(() => {
    tokenStorage.clear();
    setUser(null);
    setStatus("unauthenticated");
  }, []);

  // Restore the session from a stored token
  useEffect(() => {
    if (!tokenStorage.get()) return;
    const controller = new AbortController();
    authApi
      .getMe(controller.signal)
      .then(({ user }) => {
        setUser(user);
        setStatus("authenticated");
      })
      .catch((err: unknown) => {
        if (err instanceof DOMException && err.name === "AbortError") return;
        logout();
      });
    return () => controller.abort();
  }, [logout]);

  // Any 401 from the API (expired token) signs the user out
  useEffect(() => onUnauthorized(logout), [logout]);

  const loginWithGoogle = useCallback(async (credential: string) => {
    const { token, user } = await authApi.loginWithGoogle(credential);
    tokenStorage.set(token);
    setUser(user);
    setStatus("authenticated");
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({ user, status, loginWithGoogle, logout }),
    [user, status, loginWithGoogle, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
