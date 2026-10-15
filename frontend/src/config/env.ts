/** Build-time configuration from Vite env vars (see .env.example). */
function required(name: string, value: string | undefined): string {
  if (!value) throw new Error(`Missing environment variable ${name}. Copy .env.example to .env and fill it in.`);
  return value;
}

export const env = {
  apiUrl: (import.meta.env.VITE_API_URL ?? "http://localhost:4000").replace(/\/+$/, ""),
  googleClientId: required("VITE_GOOGLE_CLIENT_ID", import.meta.env.VITE_GOOGLE_CLIENT_ID),
} as const;
