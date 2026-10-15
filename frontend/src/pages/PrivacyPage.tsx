import { Link } from "react-router";
import { ArrowLeft } from "lucide-react";
import { Logo } from "../components/ui/Logo";

const CONTACT_EMAIL = "jariabatool005@gmail.com";
const LAST_UPDATED = "October 2026";

/** Public privacy policy (required by Google for the OAuth consent screen). */
export function PrivacyPage() {
  return (
    <div className="legal">
      <header className="legal__header">
        <Link to="/" aria-label="Armada Invoices home">
          <Logo />
        </Link>
      </header>

      <main className="legal__content">
        <Link to="/login" className="back-link">
          <ArrowLeft size={16} aria-hidden /> Back to sign in
        </Link>
        <h1>Privacy Policy</h1>
        <p className="legal__meta">Last updated: {LAST_UPDATED}</p>

        <p>
          Armada Invoices is a small invoice-tracking app built as a technical assessment. This page explains what
          data it uses and why.
        </p>

        <h2>What we collect</h2>
        <ul>
          <li>
            <strong>From your Google account:</strong> your name, email address and profile picture, used only to
            create your account and show who is signed in.
          </li>
          <li>
            <strong>Data you enter:</strong> the clients and invoices you create in the app.
          </li>
        </ul>

        <h2>How it is used</h2>
        <p>
          Your data is used only to provide the app’s features. Each user can see and manage only their own clients and
          invoices. We do not sell, share or use your data for advertising.
        </p>

        <h2>Storage and security</h2>
        <p>
          Data is stored in a PostgreSQL database hosted by Neon. Sign-in uses Google OAuth; we never see or store your
          Google password. Access to the API is protected with signed tokens.
        </p>

        <h2>Deleting your data</h2>
        <p>
          You can delete your clients and invoices in the app at any time. To delete your account entirely, email{" "}
          <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
        </p>

        <h2>Contact</h2>
        <p>
          Questions about this policy: <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
        </p>
      </main>
    </div>
  );
}
