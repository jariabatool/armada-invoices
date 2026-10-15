interface LogoProps {
  /** Show the "Armada" wordmark next to the mark */
  withText?: boolean;
  inverted?: boolean;
}

export function Logo({ withText = true, inverted = false }: LogoProps) {
  return (
    <span className={`logo${inverted ? " logo--inverted" : ""}`}>
      <svg className="logo__mark" viewBox="0 0 32 32" aria-hidden>
        <rect width="32" height="32" rx="8" fill="currentColor" />
        <path d="M9 22.5 16 8l7 14.5h-3.4L16 15l-3.6 7.5Z" fill="var(--logo-accent)" />
        <path d="M13.2 19.6h5.6" stroke="var(--logo-accent)" strokeWidth="2" strokeLinecap="round" />
      </svg>
      {withText && (
        <span className="logo__text">
          Armada <span className="logo__sub">Invoices</span>
        </span>
      )}
    </span>
  );
}
