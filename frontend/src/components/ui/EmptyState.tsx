import type { ReactNode } from "react";

interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  description: string;
  action?: ReactNode;
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="state">
      <div className="state__icon">{icon}</div>
      <h3 className="state__title">{title}</h3>
      <p className="state__text">{description}</p>
      {action}
    </div>
  );
}
