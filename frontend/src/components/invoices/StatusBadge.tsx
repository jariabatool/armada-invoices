import type { InvoiceStatus } from "../../types/invoice";
import { capitalize } from "../../utils/format";

export function StatusBadge({ status }: { status: InvoiceStatus }) {
  return <span className={`badge badge--${status}`}>{capitalize(status)}</span>;
}
