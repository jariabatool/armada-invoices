import { GoogleOAuthProvider } from "@react-oauth/google";
import { RouterProvider } from "react-router/dom";
import { env } from "./config/env";
import { AuthProvider } from "./context/auth/AuthProvider";
import { ToastProvider } from "./context/toast/ToastProvider";
import { router } from "./routes/router";

export function App() {
  return (
    <GoogleOAuthProvider clientId={env.googleClientId}>
      <AuthProvider>
        <ToastProvider>
          <RouterProvider router={router} />
        </ToastProvider>
      </AuthProvider>
    </GoogleOAuthProvider>
  );
}
