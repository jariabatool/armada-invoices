import { Link } from "react-router";
import { Compass } from "lucide-react";
import { EmptyState } from "../components/ui/EmptyState";

export function NotFoundPage() {
  return (
    <div className="card">
      <EmptyState
        icon={<Compass size={22} aria-hidden />}
        title="Page not found"
        description="The page you’re looking for doesn’t exist or has moved."
        action={
          <Link to="/invoices" className="btn btn--primary btn--md">
            <span>Go to invoices</span>
          </Link>
        }
      />
    </div>
  );
}
