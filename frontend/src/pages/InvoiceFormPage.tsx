import { useCallback, useState, type FormEvent } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { ArrowLeft, Lock, Users } from "lucide-react";
import { clientsApi } from "../api/clients.api";
import { invoicesApi } from "../api/invoices.api";
import { useToast } from "../context/toast/useToast";
import { useAsyncData } from "../hooks/useAsyncData";
import type { ClientWithCount } from "../types/client";
import type { Invoice, InvoiceStatus } from "../types/invoice";
import { capitalize } from "../utils/format";
import { getErrorMessage, getFieldErrors } from "../utils/errors";
import { ALLOWED_TRANSITIONS, INITIAL_STATUSES, isLocked, resolveStatus } from "../utils/invoice-status";
import { Button } from "../components/ui/Button";
import { EmptyState } from "../components/ui/EmptyState";
import { ErrorState } from "../components/ui/ErrorState";
import { FormField } from "../components/ui/FormField";
import { LoadingState } from "../components/ui/LoadingState";
import { PageHeader } from "../components/ui/PageHeader";

interface FormValues {
  clientId: string;
  title: string;
  amount: string;
  dueDate: string;
  status: InvoiceStatus;
}

type FieldErrors = Partial<Record<keyof FormValues, string>>;

const MAX_AMOUNT = 99_999_999.99;

function toFormValues(invoice: Invoice | null): FormValues {
  return {
    clientId: invoice?.clientId ?? "",
    title: invoice?.title ?? "",
    amount: invoice ? String(invoice.amount) : "",
    dueDate: invoice?.dueDate ?? "",
    status: invoice?.status ?? "draft",
  };
}

function validate(values: FormValues, currentStatus: InvoiceStatus | null): FieldErrors {
  const errors: FieldErrors = {};
  const amount = Number(values.amount);
  if (!values.clientId) errors.clientId = "Select a client";
  if (!values.title.trim()) errors.title = "Title is required";
  if (!values.amount.trim()) errors.amount = "Amount is required";
  else if (!Number.isFinite(amount) || amount <= 0) errors.amount = "Amount must be greater than 0";
  else if (amount > MAX_AMOUNT) errors.amount = "Amount is too large";
  if (!values.dueDate) errors.dueDate = "Due date is required";
  const resolution = resolveStatus(values.status, values.dueDate, currentStatus);
  if (!resolution.ok) errors.status = resolution.error;
  return errors;
}

/** Explains an automatic status change (e.g. sent → overdue) before saving. */
function getStatusNote(values: FormValues, currentStatus: InvoiceStatus | null): string | undefined {
  const resolution = resolveStatus(values.status, values.dueDate, currentStatus);
  if (!resolution.ok || resolution.status === values.status) return undefined;
  return resolution.status === "overdue"
    ? "The due date has passed, so this invoice will be saved as overdue."
    : "The due date is no longer past, so this invoice will be saved as sent.";
}

export function InvoiceFormPage() {
  const { id } = useParams();
  const isEdit = Boolean(id);

  const fetchFormData = useCallback(
    async (signal: AbortSignal) => {
      const [clients, invoice] = await Promise.all([
        clientsApi.list(signal),
        id ? invoicesApi.get(id, signal) : Promise.resolve(null),
      ]);
      return { clients: clients.items, invoice };
    },
    [id],
  );
  const { data, isLoading, error, reload } = useAsyncData(fetchFormData);

  const title = isEdit ? "Edit invoice" : "New invoice";
  const backLink = (
    <Link to="/invoices" className="back-link">
      <ArrowLeft size={16} aria-hidden /> Back to invoices
    </Link>
  );

  const renderContent = () => {
    if (isLoading) return <LoadingState message={isEdit ? "Loading invoice…" : "Loading clients…"} />;
    if (error || !data) return <ErrorState message={error ?? "Something went wrong"} onRetry={reload} />;
    if (data.clients.length === 0) {
      return (
        <EmptyState
          icon={<Users size={22} aria-hidden />}
          title="Add a client first"
          description="Every invoice belongs to a client. Add one, then come back to create your invoice."
          action={
            <Link to="/clients" className="btn btn--primary btn--md">
              <span>Go to clients</span>
            </Link>
          }
        />
      );
    }
    if (data.invoice && isLocked(data.invoice.status)) {
      return (
        <EmptyState
          icon={<Lock size={22} aria-hidden />}
          title="This invoice is paid"
          description="Paid invoices are locked and can’t be edited. You can still delete it from the invoices list."
          action={
            <Link to="/invoices" className="btn btn--secondary btn--md">
              <span>Back to invoices</span>
            </Link>
          }
        />
      );
    }
    return <InvoiceForm key={id ?? "new"} clients={data.clients} invoice={data.invoice} />;
  };

  return (
    <>
      {backLink}
      <PageHeader
        title={title}
        description={isEdit ? "Update the invoice details below." : "Fill in the details to create an invoice."}
      />
      <section className="card card--form">{renderContent()}</section>
    </>
  );
}

interface InvoiceFormProps {
  clients: ClientWithCount[];
  invoice: Invoice | null;
}

function InvoiceForm({ clients, invoice }: InvoiceFormProps) {
  const navigate = useNavigate();
  const toast = useToast();
  const [values, setValues] = useState<FormValues>(() => toFormValues(invoice));
  const [errors, setErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const currentStatus = invoice?.status ?? null;
  const statusOptions = invoice ? [invoice.status, ...ALLOWED_TRANSITIONS[invoice.status]] : INITIAL_STATUSES;
  const statusNote = getStatusNote(values, currentStatus);

  const setField = <K extends keyof FormValues>(field: K, value: FormValues[K]) => {
    setValues((current) => ({ ...current, [field]: value }));
    // The due date affects which statuses are valid, so it also clears a status error
    setErrors((current) => ({ ...current, [field]: undefined, ...(field === "dueDate" && { status: undefined }) }));
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const validationErrors = validate(values, currentStatus);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    const input = { ...values, title: values.title.trim(), amount: Number(values.amount) };
    setIsSubmitting(true);
    setFormError(null);
    try {
      if (invoice) await invoicesApi.update(invoice.id, input);
      else await invoicesApi.create(input);
      toast.success(invoice ? "Invoice updated" : "Invoice created");
      navigate("/invoices");
    } catch (err) {
      setErrors(getFieldErrors(err));
      setFormError(getErrorMessage(err));
      setIsSubmitting(false);
    }
  };

  return (
    <form className="form" onSubmit={handleSubmit} noValidate>
      {formError && (
        <div className="alert alert--error" role="alert">
          {formError}
        </div>
      )}

      <FormField id="invoice-client" label="Client" error={errors.clientId} required>
        <select
          id="invoice-client"
          className="input"
          value={values.clientId}
          onChange={(event) => setField("clientId", event.target.value)}
          aria-invalid={Boolean(errors.clientId)}
          aria-describedby="invoice-client-message"
        >
          <option value="" disabled>
            Select a client
          </option>
          {clients.map((client) => (
            <option key={client.id} value={client.id}>
              {client.company ? `${client.name} — ${client.company}` : client.name}
            </option>
          ))}
        </select>
      </FormField>

      <FormField id="invoice-title" label="Title" error={errors.title} required>
        <input
          id="invoice-title"
          className="input"
          value={values.title}
          onChange={(event) => setField("title", event.target.value)}
          placeholder="e.g. Website redesign"
          maxLength={200}
          aria-invalid={Boolean(errors.title)}
          aria-describedby="invoice-title-message"
        />
      </FormField>

      <div className="form__row">
        <FormField id="invoice-amount" label="Amount (USD)" error={errors.amount} required>
          <div className="input-group">
            <span className="input-group__addon" aria-hidden>
              $
            </span>
            <input
              id="invoice-amount"
              className="input"
              type="number"
              inputMode="decimal"
              min="0.01"
              step="0.01"
              value={values.amount}
              onChange={(event) => setField("amount", event.target.value)}
              placeholder="0.00"
              aria-invalid={Boolean(errors.amount)}
              aria-describedby="invoice-amount-message"
            />
          </div>
        </FormField>

        <FormField id="invoice-due-date" label="Due date" error={errors.dueDate} required>
          <input
            id="invoice-due-date"
            className="input"
            type="date"
            value={values.dueDate}
            onChange={(event) => setField("dueDate", event.target.value)}
            aria-invalid={Boolean(errors.dueDate)}
            aria-describedby="invoice-due-date-message"
          />
        </FormField>
      </div>

      <FormField
        id="invoice-status"
        label="Status"
        error={errors.status}
        hint={statusNote ?? (invoice ? undefined : "New invoices start as draft or sent.")}
      >
        <select
          id="invoice-status"
          className="input"
          value={values.status}
          onChange={(event) => setField("status", event.target.value as InvoiceStatus)}
          aria-invalid={Boolean(errors.status)}
          aria-describedby="invoice-status-message"
        >
          {statusOptions.map((status) => (
            <option key={status} value={status}>
              {capitalize(status)}
            </option>
          ))}
        </select>
      </FormField>

      <div className="form__actions">
        <Button variant="secondary" onClick={() => navigate("/invoices")} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button type="submit" isLoading={isSubmitting}>
          {invoice ? "Save changes" : "Create invoice"}
        </Button>
      </div>
    </form>
  );
}
