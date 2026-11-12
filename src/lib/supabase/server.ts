import "server-only";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { getPublicConfig } from "@/lib/env";
import type { Database } from "@/types/database";

export async function createClient() {
  const config = getPublicConfig();
  if (!config)
    throw new Error("Supabase public configuration is missing or invalid.");
  const store = await cookies();
  return createServerClient<Database>(config.url, config.publishableKey, {
    cookies: {
      getAll: () => store.getAll(),
      setAll(values) {
        try {
          values.forEach(({ name, value, options }) =>
            store.set(name, value, options),
          );
        } catch {
          /* Server Components cannot write cookies. Proxy owns refresh there. */
        }
      },
    },
  });
}
