import type { ButtonHTMLAttributes, ReactNode } from "react";
import { Spinner } from "./Spinner";

type ButtonVariant = "primary" | "secondary" | "danger" | "ghost";
type ButtonSize = "sm" | "md";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  icon?: ReactNode;
}

export function Button({
  variant = "primary",
  size = "md",
  isLoading = false,
  icon,
  disabled,
  className,
  children,
  type = "button",
  ...rest
}: ButtonProps) {
  const classes = ["btn", `btn--${variant}`, `btn--${size}`, className].filter(Boolean).join(" ");
  return (
    <button type={type} className={classes} disabled={disabled || isLoading} aria-busy={isLoading} {...rest}>
      {isLoading ? <Spinner size={16} /> : icon}
      {children && <span>{children}</span>}
    </button>
  );
}
