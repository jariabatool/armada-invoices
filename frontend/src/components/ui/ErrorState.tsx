import { AlertTriangle, RotateCw } from "lucide-react";
import { Button } from "./Button";

interface ErrorStateProps {
  message: string;
  onRetry?: () => void;
}

export function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <div className="state" role="alert">
      <div className="state__icon state__icon--danger">
        <AlertTriangle size={22} aria-hidden />
      </div>
      <h3 className="state__title">Couldn’t load data</h3>
      <p className="state__text">{message}</p>
      {onRetry && (
        <Button variant="secondary" icon={<RotateCw size={16} aria-hidden />} onClick={onRetry}>
          Try again
        </Button>
      )}
    </div>
  );
}
