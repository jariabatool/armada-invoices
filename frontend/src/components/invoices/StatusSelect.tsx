import { INVOICE_STATUSES, type InvoiceStatus } from "../../types/invoice";
import { capitalize } from "../../utils/format";

interface StatusSelectProps {
  value: InvoiceStatus;
  onChange: (status: InvoiceStatus) => void;
  disabled?: boolean;
  label: string;
}

/** Inline status changer, styled like a status badge. */
export function StatusSelect({ value, onChange, disabled, label }: StatusSelectProps) {
  return (
    <select
      className={`status-select badge--${value}`}
      value={value}
      onChange={(event) => onChange(event.target.value as InvoiceStatus)}
      disabled={disabled}
      aria-label={label}
    >
      {INVOICE_STATUSES.map((status) => (
        <option key={status} value={status}>
          {capitalize(status)}
        </option>
      ))}
    </select>
  );
}
