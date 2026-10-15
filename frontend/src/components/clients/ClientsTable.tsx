import { Pencil, Trash2 } from "lucide-react";
import type { ClientWithCount } from "../../types/client";
import { Avatar } from "../ui/Avatar";

interface ClientsTableProps {
  clients: ClientWithCount[];
  onEdit: (client: ClientWithCount) => void;
  onDelete: (client: ClientWithCount) => void;
}

export function ClientsTable({ clients, onEdit, onDelete }: ClientsTableProps) {
  return (
    <div className="table-wrapper">
      <table className="table">
        <thead>
          <tr>
            <th scope="col">Client</th>
            <th scope="col">Email</th>
            <th scope="col">Company</th>
            <th scope="col" className="table__numeric">
              Invoices
            </th>
            <th scope="col" className="table__actions">
              <span className="visually-hidden">Actions</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {clients.map((client) => (
            <tr key={client.id}>
              <td data-label="Client">
                <span className="table__identity">
                  <Avatar name={client.name} size={32} />
                  <span className="table__primary">{client.name}</span>
                </span>
              </td>
              <td data-label="Email">
                <a href={`mailto:${client.email}`} className="table__link">
                  {client.email}
                </a>
              </td>
              <td data-label="Company">{client.company ?? <span className="table__muted">—</span>}</td>
              <td data-label="Invoices" className="table__numeric">
                {client._count.invoices}
              </td>
              <td className="table__actions">
                <button
                  type="button"
                  className="icon-button"
                  onClick={() => onEdit(client)}
                  aria-label={`Edit ${client.name}`}
                >
                  <Pencil size={16} aria-hidden />
                </button>
                <button
                  type="button"
                  className="icon-button icon-button--danger"
                  onClick={() => onDelete(client)}
                  aria-label={`Delete ${client.name}`}
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
