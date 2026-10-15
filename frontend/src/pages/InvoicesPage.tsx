import { useCallback, useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router";
import { FileText, Plus } from "lucide-react";
import { invoicesApi } from "../api/invoices.api";
import { useToast } from "../context/toast/useToast";
import { useAsyncData } from "../hooks/useAsyncData";
import { INVOICE_STATUSES, type Invoice, type InvoiceStatus, type InvoiceStatusFilter } from "../types/invoice";
import { capitalize } from "../utils/format";
import { getErrorMessage } from "../utils/errors";
import { InvoicesTable } from "../components/invoices/InvoicesTable";
import { StatusFilterTabs } from "../components/invoices/StatusFilterTabs";
import { ConfirmDialog } from "../components/ui/ConfirmDialog";
import { EmptyState } from "../components/ui/EmptyState";
import { ErrorState } from "../components/ui/ErrorState";
import { LoadingState } from "../components/ui/LoadingState";
import { PageHeader } from "../components/ui/PageHeader";
import { Pagination } from "../components/ui/Pagination";

const PAGE_SIZE = 10;

function parseStatus(value: string | null): InvoiceStatusFilter {
  return INVOICE_STATUSES.includes(value as InvoiceStatus) ? (value as InvoiceStatus) : "all";
}

function parsePage(value: string | null): number {
  const page = Number(value);
  return Number.isInteger(page) && page > 0 ? page : 1;
}

export function InvoicesPage() {
  const toast = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const status = parseStatus(searchParams.get("status"));
  const page = parsePage(searchParams.get("page"));

  const fetchInvoices = useCallback(
    (signal: AbortSignal) => invoicesApi.list({ status, page, pageSize: PAGE_SIZE }, signal),
    [status, page],
  );
  const { data, isLoading, error, reload, setData } = useAsyncData(fetchInvoices);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [invoiceToDelete, setInvoiceToDelete] = useState<Invoice | null>(null);

  /** Filter and page live in the URL, so they survive refresh and the back button. */
  const updateParams = (next: { status?: InvoiceStatusFilter; page?: number }) => {
    const nextStatus = next.status ?? status;
    const nextPage = next.page ?? page;
    const params = new URLSearchParams();
    if (nextStatus !== "all") params.set("status", nextStatus);
    if (nextPage > 1) params.set("page", String(nextPage));
    setSearchParams(params);
  };

  // If the page in the URL no longer exists (e.g. after deleting its last invoice), go to the last page
  const lastPage = data?.totalPages;
  useEffect(() => {
    if (lastPage === undefined || page <= lastPage) return;
    setSearchParams(
      (current) => {
        const params = new URLSearchParams(current);
        if (lastPage > 1) params.set("page", String(lastPage));
        else params.delete("page");
        return params;
      },
      { replace: true },
    );
  }, [lastPage, page, setSearchParams]);

  const handleStatusChange = async (invoice: Invoice, nextStatus: InvoiceStatus) => {
    setUpdatingId(invoice.id);
    try {
      const updated = await invoicesApi.updateStatus(invoice.id, nextStatus);
      toast.success(`“${invoice.title}” marked as ${nextStatus}`);
      if (status !== "all" && nextStatus !== status) {
        reload(); // it no longer matches the current filter
      } else {
        setData((current) => ({
          ...current,
          items: current.items.map((item) => (item.id === updated.id ? updated : item)),
        }));
      }
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDelete = async () => {
    if (!invoiceToDelete) return;
    try {
      await invoicesApi.remove(invoiceToDelete.id);
      toast.success("Invoice deleted");
      setInvoiceToDelete(null);
      reload();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const renderContent = () => {
    if (isLoading && !data) return <LoadingState message="Loading invoices…" />;
    if (error) return <ErrorState message={error} onRetry={reload} />;
    if (!data || data.items.length === 0) {
      return status === "all" ? (
        <EmptyState
          icon={<FileText size={22} aria-hidden />}
          title="No invoices yet"
          description="Create your first invoice to start tracking payments."
          action={
            <Link to="/invoices/new" className="btn btn--primary btn--md">
              <Plus size={16} aria-hidden />
              <span>New invoice</span>
            </Link>
          }
        />
      ) : (
        <EmptyState
          icon={<FileText size={22} aria-hidden />}
          title={`No ${status} invoices`}
          description={`You don’t have any invoices marked as ${capitalize(status).toLowerCase()}.`}
        />
      );
    }
    return (
      <>
        <div className={isLoading ? "is-refreshing" : undefined}>
          <InvoicesTable
            invoices={data.items}
            updatingId={updatingId}
            onStatusChange={handleStatusChange}
            onDelete={setInvoiceToDelete}
          />
        </div>
        <Pagination
          page={data.page}
          pageSize={data.pageSize}
          total={data.total}
          totalPages={data.totalPages}
          onPageChange={(nextPage) => updateParams({ page: nextPage })}
        />
      </>
    );
  };

  return (
    <>
      <PageHeader
        title="Invoices"
        description="Create, track and update the status of your invoices."
        actions={
          <Link to="/invoices/new" className="btn btn--primary btn--md">
            <Plus size={16} aria-hidden />
            <span>New invoice</span>
          </Link>
        }
      />

      <section className="card">
        <div className="card__toolbar">
          <StatusFilterTabs value={status} onChange={(nextStatus) => updateParams({ status: nextStatus, page: 1 })} />
        </div>
        {renderContent()}
      </section>

      {invoiceToDelete && (
        <ConfirmDialog
          title="Delete invoice?"
          message={`“${invoiceToDelete.title}” will be permanently deleted. This can’t be undone.`}
          confirmLabel="Delete invoice"
          onConfirm={handleDelete}
          onClose={() => setInvoiceToDelete(null)}
        />
      )}
    </>
  );
}
