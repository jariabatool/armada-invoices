import { createBrowserRouter, Navigate } from "react-router";
import { AppLayout } from "../layouts/AppLayout";
import { ClientsPage } from "../pages/ClientsPage";
import { InvoiceFormPage } from "../pages/InvoiceFormPage";
import { InvoicesPage } from "../pages/InvoicesPage";
import { LoginPage } from "../pages/LoginPage";
import { NotFoundPage } from "../pages/NotFoundPage";
import { ProtectedRoute } from "./ProtectedRoute";
import { PublicOnlyRoute } from "./PublicOnlyRoute";

export const router = createBrowserRouter([
  {
    element: <PublicOnlyRoute />,
    children: [{ path: "/login", element: <LoginPage /> }],
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppLayout />,
        children: [
          { path: "/", element: <Navigate to="/invoices" replace /> },
          { path: "/invoices", element: <InvoicesPage /> },
          { path: "/invoices/new", element: <InvoiceFormPage /> },
          { path: "/invoices/:id/edit", element: <InvoiceFormPage /> },
          { path: "/clients", element: <ClientsPage /> },
          { path: "*", element: <NotFoundPage /> },
        ],
      },
    ],
  },
]);
