import type { ReactNode } from "react";

interface FormFieldProps {
  id: string;
  label: string;
  error?: string;
  hint?: string;
  required?: boolean;
  children: ReactNode;
}

/** Label + control + hint/error. The control should use `id` and `aria-describedby={`${id}-message`}`. */
export function FormField({ id, label, error, hint, required, children }: FormFieldProps) {
  return (
    <div className={`field${error ? " field--invalid" : ""}`}>
      <label htmlFor={id} className="field__label">
        {label}
        {required && (
          <span className="field__required" aria-hidden>
            *
          </span>
        )}
      </label>
      {children}
      {(error || hint) && (
        <p id={`${id}-message`} className={error ? "field__error" : "field__hint"}>
          {error ?? hint}
        </p>
      )}
    </div>
  );
}
