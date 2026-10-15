import { Spinner } from "./Spinner";

export function LoadingState({ message = "Loading…" }: { message?: string }) {
  return (
    <div className="state" role="status">
      <Spinner size={28} />
      <p className="state__text">{message}</p>
    </div>
  );
}
