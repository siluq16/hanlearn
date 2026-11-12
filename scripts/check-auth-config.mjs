// Public Auth configuration GET only. Never signup/provision/change settings.
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { parseEnv } from "node:util";
export function classifyAuthSettings(body) {
  const flags = {
    disableSignup: body.disable_signup ?? null,
    emailEnabled: body.external?.email ?? null,
    anonymousUsersEnabled: body.external?.anonymous_users ?? null,
  };
  return {
    ...flags,
    status: Object.values(flags).some((v) => typeof v !== "boolean")
      ? "BLOCKED"
      : flags.disableSignup &&
          flags.emailEnabled &&
          !flags.anonymousUsersEnabled
        ? "PASS"
        : "FAIL",
  };
}
if (
  process.argv[1] &&
  pathToFileURL(path.resolve(process.argv[1])).href === import.meta.url
) {
  const report = {
    projectRef: "hhgxrjqkuwdgurphopok",
    checkedAt: new Date().toISOString(),
    status: "BLOCKED",
  };
  try {
    const config = parseEnv(fs.readFileSync(".env.local", "utf8"));
    const url = new URL(config.NEXT_PUBLIC_SUPABASE_URL),
      key = config.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
    if (
      url.protocol !== "https:" ||
      url.hostname !== report.projectRef + ".supabase.co" ||
      url.username ||
      url.password ||
      !key?.startsWith("sb_publishable_")
    )
      throw Error();
    const response = await fetch(new URL("/auth/v1/settings", url), {
      method: "GET",
      redirect: "error",
      headers: { apikey: key },
      signal: AbortSignal.timeout(20000),
    });
    report.httpStatus = response.status;
    if (response.status === 200)
      Object.assign(report, classifyAuthSettings(await response.json()));
  } catch {
    report.reason = "Auth settings unavailable; raw diagnostics suppressed";
  }
  fs.mkdirSync(".local/acceptance", { recursive: true });
  fs.writeFileSync(
    ".local/acceptance/auth-settings.json",
    JSON.stringify(report, null, 2) + "\n",
  );
  console.log(JSON.stringify(report));
  if (report.status !== "PASS") process.exitCode = 2;
}
