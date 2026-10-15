import { Link } from "react-router";
import { Pencil, Trash2 } from "lucide-react";
import type { Invoice, InvoiceStatus } from "../../types/invoice";
import { formatCurrency, formatDate } from "../../utils/format";
import { StatusSelect } from "./StatusSelect";

interface InvoicesTableProps {
  invoices: Invoice[];
  updatingId: string | null;
  onStatusChange: (invoice: Invoice, status: InvoiceStatus) => void;
  onDelete: (invoice: Invoice) => void;
}

export function InvoicesTable({ invoices, updatingId, onStatusChange, onDelete }: InvoicesTableProps) {
  return (
    <div className="table-wrapper">
      <table className="table">
        <thead>
          <tr>
            <th scope="col">Invoice</th>
            <th scope="col">Client</th>
            <th scope="col" className="table__numeric">
              Amount
            </th>
            <th scope="col">Due date</th>
            <th scope="col">Status</th>
            <th scope="col" className="table__actions">
              <span className="visually-hidden">Actions</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {invoices.map((invoice) => (
            <tr key={invoice.id}>
              <td data-label="Invoice">
                <span className="table__primary">{invoice.title}</span>
              </td>
              <td data-label="Client">
                <div className="table__stack">
                  <span className="table__primary">{invoice.client.name}</span>
                  {invoice.client.company && <span className="table__secondary">{invoice.client.company}</span>}
                </div>
              </td>
              <td data-label="Amount" className="table__numeric">
                {formatCurrency(invoice.amount)}
              </td>
              <td data-label="Due date">{formatDate(invoice.dueDate)}</td>
              <td data-label="Status">
                <StatusSelect
                  value={invoice.status}
                  disabled={updatingId === invoice.id}
                  onChange={(status) => onStatusChange(invoice, status)}
                  label={`Status of ${invoice.title}`}
                />
              </td>
              <td className="table__actions">
                <Link to={`/invoices/${invoice.id}/edit`} className="icon-button" aria-label={`Edit ${invoice.title}`}>
                  <Pencil size={16} aria-hidden />
                </Link>
                <button
                  type="button"
                  className="icon-button icon-button--danger"
                  onClick={() => onDelete(invoice)}
                  aria-label={`Delete ${invoice.title}`}
                >
                  <Trash2 size={16} aria-hidden />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
