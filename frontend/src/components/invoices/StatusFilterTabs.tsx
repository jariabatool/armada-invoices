import { INVOICE_STATUSES, type InvoiceStatusFilter } from "../../types/invoice";
import { capitalize } from "../../utils/format";

const FILTERS: InvoiceStatusFilter[] = ["all", ...INVOICE_STATUSES];

interface StatusFilterTabsProps {
  value: InvoiceStatusFilter;
  onChange: (value: InvoiceStatusFilter) => void;
}

export function StatusFilterTabs({ value, onChange }: StatusFilterTabsProps) {
  return (
    <div className="tabs" role="tablist" aria-label="Filter invoices by status">
      {FILTERS.map((filter) => (
        <button
          key={filter}
          type="button"
          role="tab"
          aria-selected={value === filter}
          className={`tabs__tab${value === filter ? " is-active" : ""}`}
          onClick={() => onChange(filter)}
        >
          {filter !== "all" && <span className={`dot dot--${filter}`} aria-hidden />}
          {capitalize(filter)}
        </button>
      ))}
    </div>
  );
}
