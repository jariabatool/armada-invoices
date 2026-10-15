import { createContext } from "react";

export type ToastVariant = "success" | "error";

export interface Toast {
  id: number;
  message: string;
  variant: ToastVariant;
}

export interface ToastContextValue {
  success: (message: string) => void;
  error: (message: string) => void;
}

export const ToastContext = createContext<ToastContextValue | null>(null);
