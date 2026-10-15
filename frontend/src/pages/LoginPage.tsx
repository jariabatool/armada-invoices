import { useState } from "react";
import { GoogleLogin } from "@react-oauth/google";
import { useNavigate, useLocation } from "react-router";
import { CheckCircle2 } from "lucide-react";
import { useAuth } from "../context/auth/useAuth";
import { Logo } from "../components/ui/Logo";
import { Spinner } from "../components/ui/Spinner";
import { getErrorMessage } from "../utils/errors";

const CURRENT_YEAR = new Date().getFullYear();

const FEATURES = [
  "Keep every client in one place",
  "Create invoices in seconds",
  "Track draft, sent, paid and overdue at a glance",
];

export function LoginPage() {
  const { loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [error, setError] = useState<string | null>(null);
  const [isSigningIn, setIsSigningIn] = useState(false);

  const redirectTo = (location.state as { from?: string } | null)?.from ?? "/invoices";

  const handleCredential = async (credential: string | undefined) => {
    if (!credential) {
      setError("Google did not return a credential. Please try again.");
      return;
    }
    setError(null);
    setIsSigningIn(true);
    try {
      await loginWithGoogle(credential);
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setError(getErrorMessage(err, "Sign-in failed. Please try again."));
      setIsSigningIn(false);
    }
  };

  return (
    <div className="login">
      <section className="login__brand" aria-hidden>
        <Logo inverted />
        <div className="login__pitch">
          <h2 className="login__headline">Invoicing that keeps your business moving.</h2>
          <ul className="login__features">
            {FEATURES.map((feature) => (
              <li key={feature}>
                <CheckCircle2 size={18} aria-hidden />
                {feature}
              </li>
            ))}
          </ul>
        </div>
        <p className="login__footnote">© {CURRENT_YEAR} Armada Solutions</p>
      </section>

      <section className="login__panel">
        <div className="login__card">
          <div className="login__mobile-logo">
            <Logo />
          </div>
          <h1 className="login__title">Welcome back</h1>
          <p className="login__subtitle">Sign in with your Google account to manage your clients and invoices.</p>

          <div className="login__google">
            {isSigningIn ? (
              <span className="login__signing-in">
                <Spinner size={18} /> Signing you in…
              </span>
            ) : (
              <GoogleLogin
                onSuccess={({ credential }) => handleCredential(credential)}
                onError={() => setError("Google sign-in was cancelled or failed. Please try again.")}
                size="large"
                width="320"
                text="continue_with"
                shape="rectangular"
              />
            )}
          </div>

          {error && (
            <div className="alert alert--error" role="alert">
              {error}
            </div>
          )}

          <p className="login__terms">New here? Signing in with Google creates your account automatically.</p>
        </div>
      </section>
    </div>
  );
}
