import { createBrowserRouter } from "react-router";
import { AppLayout } from "../layouts/AppLayout";
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
        children: [{ path: "*", element: <NotFoundPage /> }],
      },
    ],
  },
]);
