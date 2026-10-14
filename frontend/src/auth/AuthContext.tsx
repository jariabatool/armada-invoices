import { useCallback, useEffect, useState, type ReactNode } from "react";
import { api, tokenStore } from "../lib/api";
import { AuthContext, type User } from "./context";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(() => Boolean(tokenStore.get()));

  // Restore the session from a stored token on first load
  useEffect(() => {
    if (!tokenStore.get()) return;
    api<{ user: User }>("/auth/me")
      .then(({ user }) => setUser(user))
      .catch(() => tokenStore.clear())
      .finally(() => setLoading(false));
  }, []);

  const loginWithGoogle = useCallback(async (credential: string) => {
    const { token, user } = await api<{ token: string; user: User }>("/auth/google", {
      method: "POST",
      body: JSON.stringify({ credential }),
    });
    tokenStore.set(token);
    setUser(user);
  }, []);

  const logout = useCallback(() => {
    tokenStore.clear();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, loginWithGoogle, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
