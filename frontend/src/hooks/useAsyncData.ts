import { useCallback, useEffect, useState } from "react";
import { getErrorMessage } from "../utils/errors";

type Fetcher<T> = (signal: AbortSignal) => Promise<T>;

interface Result<T> {
  fetcher: Fetcher<T>;
  reloadKey: number;
  data: T | null;
  error: string | null;
}

/**
 * Runs `fetcher` whenever it changes (wrap it in useCallback with its inputs as deps)
 * and cancels stale requests. While a new request is in flight the previous data is kept,
 * so lists can dim instead of flashing a spinner.
 */
export function useAsyncData<T>(fetcher: Fetcher<T>) {
  const [reloadKey, setReloadKey] = useState(0);
  const [result, setResult] = useState<Result<T> | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    fetcher(controller.signal)
      .then((data) => setResult({ fetcher, reloadKey, data, error: null }))
      .catch((err: unknown) => {
        if (controller.signal.aborted) return;
        setResult((previous) => ({ fetcher, reloadKey, data: previous?.data ?? null, error: getErrorMessage(err) }));
      });
    return () => controller.abort();
  }, [fetcher, reloadKey]);

  const isLoading = result === null || result.fetcher !== fetcher || result.reloadKey !== reloadKey;

  const reload = useCallback(() => setReloadKey((key) => key + 1), []);

  /** Update the loaded data locally (e.g. after a successful mutation). */
  const setData = useCallback((updater: (data: T) => T) => {
    setResult((previous) => (previous?.data ? { ...previous, data: updater(previous.data) } : previous));
  }, []);

  return {
    data: result?.data ?? null,
    error: isLoading ? null : (result?.error ?? null),
    isLoading,
    reload,
    setData,
  };
}
