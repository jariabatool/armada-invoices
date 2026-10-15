interface SpinnerProps {
  size?: number;
  label?: string;
}

export function Spinner({ size = 20, label }: SpinnerProps) {
  return (
    <span className="spinner" style={{ width: size, height: size }} role={label ? "status" : undefined}>
      {label && <span className="visually-hidden">{label}</span>}
    </span>
  );
}
