import type { User } from "../types/user";
import { request } from "./http";

export const authApi = {
  loginWithGoogle: (credential: string) =>
    request<{ token: string; user: User }>("/auth/google", { method: "POST", body: { credential } }),

  getMe: (signal?: AbortSignal) => request<{ user: User }>("/auth/me", { signal }),
};
