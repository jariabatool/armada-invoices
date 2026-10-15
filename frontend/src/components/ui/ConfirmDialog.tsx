import { useState } from "react";
import { Button } from "./Button";
import { Modal } from "./Modal";

interface ConfirmDialogProps {
  title: string;
  message: string;
  confirmLabel?: string;
  onConfirm: () => Promise<void>;
  onClose: () => void;
}

/** Confirmation for destructive actions. Stays open while `onConfirm` runs. */
export function ConfirmDialog({ title, message, confirmLabel = "Delete", onConfirm, onClose }: ConfirmDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleConfirm = async () => {
    setIsSubmitting(true);
    try {
      await onConfirm();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      title={title}
      size="sm"
      onClose={isSubmitting ? () => undefined : onClose}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleConfirm} isLoading={isSubmitting}>
            {confirmLabel}
          </Button>
        </>
      }
    >
      <p className="modal__text">{message}</p>
    </Modal>
  );
}
