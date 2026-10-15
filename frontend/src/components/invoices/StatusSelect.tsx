import { Lock } from "lucide-react";
import type { InvoiceStatus } from "../../types/invoice";
import { capitalize } from "../../utils/format";
import { getStatusOptions, isLocked } from "../../utils/invoice-status";

interface StatusSelectProps {
  value: InvoiceStatus;
  dueDate: string;
  onChange: (status: InvoiceStatus) => void;
  disabled?: boolean;
  label: string;
}

/** Inline status changer, styled like a status badge. Only offers valid next statuses. */
export function StatusSelect({ value, dueDate, onChange, disabled, label }: StatusSelectProps) {
  if (isLocked(value)) {
    return (
      <span className={`badge badge--${value} badge--locked`} title="Paid invoices are locked">
        {capitalize(value)}
        <Lock size={12} aria-label="locked" />
      </span>
    );
  }

  return (
    <select
      className={`status-select badge--${value}`}
      value={value}
      onChange={(event) => onChange(event.target.value as InvoiceStatus)}
      disabled={disabled}
      aria-label={label}
    >
      {getStatusOptions(value, dueDate).map((status) => (
        <option key={status} value={status}>
          {capitalize(status)}
        </option>
      ))}
    </select>
  );
}
