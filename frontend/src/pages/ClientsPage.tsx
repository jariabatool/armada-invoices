import { useState } from "react";
import { Plus, Users } from "lucide-react";
import { clientsApi } from "../api/clients.api";
import { useToast } from "../context/toast/useToast";
import { useAsyncData } from "../hooks/useAsyncData";
import type { ClientWithCount } from "../types/client";
import { getErrorMessage } from "../utils/errors";
import { ClientFormModal } from "../components/clients/ClientFormModal";
import { ClientsTable } from "../components/clients/ClientsTable";
import { Button } from "../components/ui/Button";
import { ConfirmDialog } from "../components/ui/ConfirmDialog";
import { EmptyState } from "../components/ui/EmptyState";
import { ErrorState } from "../components/ui/ErrorState";
import { LoadingState } from "../components/ui/LoadingState";
import { PageHeader } from "../components/ui/PageHeader";

type FormState = { mode: "create" } | { mode: "edit"; client: ClientWithCount } | null;

function deleteMessage(client: ClientWithCount): string {
  const count = client._count.invoices;
  const invoices = count === 1 ? "1 invoice" : `${count} invoices`;
  return count > 0
    ? `“${client.name}” and their ${invoices} will be permanently deleted. This can’t be undone.`
    : `“${client.name}” will be permanently deleted. This can’t be undone.`;
}

export function ClientsPage() {
  const toast = useToast();
  const { data, isLoading, error, reload } = useAsyncData(clientsApi.list);
  const [form, setForm] = useState<FormState>(null);
  const [clientToDelete, setClientToDelete] = useState<ClientWithCount | null>(null);

  const clients = data?.items ?? [];
  const openCreate = () => setForm({ mode: "create" });

  const handleSaved = () => {
    setForm(null);
    reload();
  };

  const handleDelete = async () => {
    if (!clientToDelete) return;
    try {
      await clientsApi.remove(clientToDelete.id);
      toast.success("Client deleted");
      setClientToDelete(null);
      reload();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const renderContent = () => {
    if (isLoading && !data) return <LoadingState message="Loading clients…" />;
    if (error) return <ErrorState message={error} onRetry={reload} />;
    if (clients.length === 0) {
      return (
        <EmptyState
          icon={<Users size={22} aria-hidden />}
          title="No clients yet"
          description="Add your first client to start creating invoices."
          action={
            <Button icon={<Plus size={16} aria-hidden />} onClick={openCreate}>
              Add client
            </Button>
          }
        />
      );
    }
    return (
      <ClientsTable
        clients={clients}
        onEdit={(client) => setForm({ mode: "edit", client })}
        onDelete={setClientToDelete}
      />
    );
  };

  return (
    <>
      <PageHeader
        title="Clients"
        description="People and companies you invoice."
        actions={
          <Button icon={<Plus size={16} aria-hidden />} onClick={openCreate}>
            Add client
          </Button>
        }
      />

      <section className="card">{renderContent()}</section>

      {form && (
        <ClientFormModal
          client={form.mode === "edit" ? form.client : undefined}
          onClose={() => setForm(null)}
          onSaved={handleSaved}
        />
      )}

      {clientToDelete && (
        <ConfirmDialog
          title="Delete client?"
          message={deleteMessage(clientToDelete)}
          confirmLabel="Delete client"
          onConfirm={handleDelete}
          onClose={() => setClientToDelete(null)}
        />
      )}
    </>
  );
}
