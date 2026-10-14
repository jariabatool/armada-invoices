import { createContext } from "react";

export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl: string | null;
}

export interface AuthState {
  user: User | null;
  loading: boolean;
  loginWithGoogle: (credential: string) => Promise<void>;
  logout: () => void;
}

export const AuthContext = createContext<AuthState | null>(null);
