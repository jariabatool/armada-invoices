import { useState } from "react";
import { GoogleLogin } from "@react-oauth/google";
import { useAuth } from "../auth/useAuth";

export function LoginPage() {
  const { loginWithGoogle } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  return (
    <main className="login">
      <div className="card login-card">
        <h1>Invoice Tracker</h1>
        <p className="muted">Sign in to manage your clients and invoices.</p>

        <div className="login-button">
          <GoogleLogin
            onSuccess={async ({ credential }) => {
              if (!credential) return setError("Google did not return a credential.");
              setError(null);
              setSubmitting(true);
              try {
                await loginWithGoogle(credential);
              } catch (e) {
                setError(e instanceof Error ? e.message : "Login failed");
              } finally {
                setSubmitting(false);
              }
            }}
            onError={() => setError("Google sign-in failed. Please try again.")}
          />
        </div>

        {submitting && <p className="muted">Signing you in…</p>}
        {error && <p className="error">{error}</p>}
      </div>
    </main>
  );
}
