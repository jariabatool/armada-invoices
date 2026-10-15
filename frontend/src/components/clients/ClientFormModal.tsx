import { useState, type FormEvent } from "react";
import { clientsApi } from "../../api/clients.api";
import { useToast } from "../../context/toast/useToast";
import type { Client, ClientInput } from "../../types/client";
import { getErrorMessage, getFieldErrors } from "../../utils/errors";
import { Button } from "../ui/Button";
import { FormField } from "../ui/FormField";
import { Modal } from "../ui/Modal";

interface ClientFormModalProps {
  /** Client to edit; omit to create a new one */
  client?: Client;
  onClose: () => void;
  onSaved: () => void;
}

type FieldErrors = Partial<Record<keyof ClientInput, string>>;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validate(values: ClientInput): FieldErrors {
  const errors: FieldErrors = {};
  if (!values.name.trim()) errors.name = "Name is required";
  if (!values.email.trim()) errors.email = "Email is required";
  else if (!EMAIL_PATTERN.test(values.email.trim())) errors.email = "Enter a valid email";
  return errors;
}

export function ClientFormModal({ client, onClose, onSaved }: ClientFormModalProps) {
  const toast = useToast();
  const isEdit = Boolean(client);
  const [values, setValues] = useState<ClientInput>({
    name: client?.name ?? "",
    email: client?.email ?? "",
    company: client?.company ?? "",
  });
  const [errors, setErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const setField = (field: keyof ClientInput, value: string) => {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const validationErrors = validate(values);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    setIsSubmitting(true);
    setFormError(null);
    try {
      if (client) await clientsApi.update(client.id, values);
      else await clientsApi.create(values);
      toast.success(isEdit ? "Client updated" : "Client added");
      onSaved();
    } catch (err) {
      setErrors(getFieldErrors(err));
      setFormError(getErrorMessage(err));
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      title={isEdit ? "Edit client" : "Add client"}
      description={isEdit ? "Update this client’s details." : "Add a client you can send invoices to."}
      onClose={onClose}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" form="client-form" isLoading={isSubmitting}>
            {isEdit ? "Save changes" : "Add client"}
          </Button>
        </>
      }
    >
      <form id="client-form" className="form" onSubmit={handleSubmit} noValidate>
        {formError && (
          <div className="alert alert--error" role="alert">
            {formError}
          </div>
        )}
        <FormField id="client-name" label="Name" error={errors.name} required>
          <input
            id="client-name"
            className="input"
            value={values.name}
            onChange={(event) => setField("name", event.target.value)}
            aria-invalid={Boolean(errors.name)}
            aria-describedby="client-name-message"
            maxLength={100}
            autoComplete="off"
          />
        </FormField>
        <FormField id="client-email" label="Email" error={errors.email} required>
          <input
            id="client-email"
            type="email"
            className="input"
            value={values.email}
            onChange={(event) => setField("email", event.target.value)}
            aria-invalid={Boolean(errors.email)}
            aria-describedby="client-email-message"
            autoComplete="off"
          />
        </FormField>
        <FormField id="client-company" label="Company" error={errors.company} hint="Optional">
          <input
            id="client-company"
            className="input"
            value={values.company}
            onChange={(event) => setField("company", event.target.value)}
            aria-describedby="client-company-message"
            maxLength={100}
            autoComplete="off"
          />
        </FormField>
      </form>
    </Modal>
  );
}
