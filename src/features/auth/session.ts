import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { getPublicConfig } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";

export type AccessFailure =
  "configuration" | "unauthenticated" | "forbidden" | "unavailable";
export class AccessError extends Error {
  constructor(public reason: AccessFailure) {
    super(reason);
  }
}

// getUser revalidates the user with Auth, including the current confirmation state.
// The DB predicate then checks the authoritative verified UUID allowlist.
export const getLearner = cache(async () => {
  if (!getPublicConfig()) throw new AccessError("configuration");
  const supabase = await createClient();
  let result;
  try {
    result = await supabase.auth.getUser();
  } catch {
    throw new AccessError("unavailable");
  }
  if (result.error || !result.data.user) {
    if (result.error && result.error.status && result.error.status >= 500)
      throw new AccessError("unavailable");
    throw new AccessError("unauthenticated");
  }
  if (!result.data.user.email_confirmed_at) throw new AccessError("forbidden");
  const access = await supabase.rpc("get_learner_access");
  if (access.error) throw new AccessError("unavailable");
  if (access.data !== true) throw new AccessError("forbidden");
  return { user: result.data.user, supabase };
});

export async function requireLearner() {
  try {
    return await getLearner();
  } catch (error) {
    if (!(error instanceof AccessError)) throw error;
    if (error.reason === "configuration") redirect("/setup");
    if (error.reason === "unauthenticated") redirect("/login");
    redirect(
      error.reason === "forbidden" ? "/access" : "/access?reason=unavailable",
    );
  }
}
