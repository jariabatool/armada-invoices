import { useEffect, useRef, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

interface ModalProps {
  title: string;
  description?: string;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
  size?: "sm" | "md";
}

/** Accessible dialog: Esc and backdrop click close it, focus moves inside and is restored on close. */
export function Modal({ title, description, onClose, children, footer, size = "md" }: ModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const previouslyFocused = document.activeElement as HTMLElement | null;
    const firstInput = dialogRef.current?.querySelector<HTMLElement>("input, select, textarea, button:not(.modal__close)");
    (firstInput ?? dialogRef.current)?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    document.body.classList.add("no-scroll");

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.classList.remove("no-scroll");
      previouslyFocused?.focus();
    };
  }, [onClose]);

  return createPortal(
    <div className="modal-backdrop" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <div
        ref={dialogRef}
        className={`modal modal--${size}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        tabIndex={-1}
      >
        <div className="modal__header">
          <div>
            <h2 id="modal-title" className="modal__title">
              {title}
            </h2>
            {description && <p className="modal__description">{description}</p>}
          </div>
          <button type="button" className="modal__close" onClick={onClose} aria-label="Close">
            <X size={18} aria-hidden />
          </button>
        </div>
        <div className="modal__body">{children}</div>
        {footer && <div className="modal__footer">{footer}</div>}
      </div>
    </div>,
    document.body,
  );
}
