import { useAuth } from "./auth/useAuth";
import { Header } from "./components/Header";
import { LoginPage } from "./pages/LoginPage";
import "./App.css";

function App() {
  const { user, loading } = useAuth();

  if (loading) return <p className="center muted">Loading…</p>;
  if (!user) return <LoginPage />;

  return (
    <>
      <Header />
      <main className="container">
        <p className="muted">Welcome, {user.name}. Clients and invoices are coming next.</p>
      </main>
    </>
  );
}

export default App;
