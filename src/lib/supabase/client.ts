"use client";
import { createBrowserClient } from "@supabase/ssr";
import { getPublicConfig } from "@/lib/env";
import type { Database } from "@/types/database";

export function createClient() {
  const config = getPublicConfig();
  if (!config)
    throw new Error("Supabase public configuration is missing or invalid.");
  return createBrowserClient<Database>(config.url, config.publishableKey);
}
