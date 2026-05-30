import { createClient } from "@insforge/sdk";

// Browser-mode client: access token kept in memory, refresh via httpOnly cookie.
export const insforge = createClient({
  baseUrl: process.env.NEXT_PUBLIC_INSFORGE_URL!,
  anonKey: process.env.NEXT_PUBLIC_INSFORGE_ANON_KEY!,
});
