import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

/** Page numbers to show, e.g. [1, "…", 4, 5, 6, "…", 12]. */
function getPageItems(page: number, totalPages: number): (number | "ellipsis")[] {
  if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
  const pages = new Set([1, totalPages, page - 1, page, page + 1]);
  const sorted = [...pages].filter((p) => p >= 1 && p <= totalPages).sort((a, b) => a - b);
  const items: (number | "ellipsis")[] = [];
  sorted.forEach((p, i) => {
    const previous = sorted[i - 1];
    if (previous !== undefined && p - previous > 1) items.push("ellipsis");
    items.push(p);
  });
  return items;
}

export function Pagination({ page, pageSize, total, totalPages, onPageChange }: PaginationProps) {
  if (total === 0) return null;
  const from = (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);

  return (
    <nav className="pagination" aria-label="Pagination">
      <p className="pagination__summary">
        Showing <strong>{from}</strong>–<strong>{to}</strong> of <strong>{total}</strong>
      </p>
      <div className="pagination__controls">
        <button
          type="button"
          className="pagination__button"
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          aria-label="Previous page"
        >
          <ChevronLeft size={16} aria-hidden />
        </button>
        {getPageItems(page, totalPages).map((item, index) =>
          item === "ellipsis" ? (
            <span key={`ellipsis-${index}`} className="pagination__ellipsis">
              …
            </span>
          ) : (
            <button
              key={item}
              type="button"
              className={`pagination__button${item === page ? " is-active" : ""}`}
              onClick={() => onPageChange(item)}
              aria-current={item === page ? "page" : undefined}
            >
              {item}
            </button>
          ),
        )}
        <button
          type="button"
          className="pagination__button"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          aria-label="Next page"
        >
          <ChevronRight size={16} aria-hidden />
        </button>
      </div>
    </nav>
  );
}
