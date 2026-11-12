// GET only; publishable key, no user JWT, no writes, no returned rows logged.
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { parseEnv } from "node:util";

export async function checkAnonymousApi(fetcher, base, key, relations) {
  const probes = [
    {
      name: "platform.rls_auto_enable",
      path: "/rest/v1/rpc/rls_auto_enable",
      profile: "public",
      expectation: "event_trigger_rpc_rejected",
    },
    ...["allowed_learners", "quiz_answer_keys"].map((name) => ({
      name: `private.${name}`,
      path: `/rest/v1/${name}?select=*&limit=0`,
      profile: "private",
      expectation: "schema_excluded",
    })),
    {
      name: "private.is_learner",
      path: "/rest/v1/rpc/is_learner",
      profile: "private",
      expectation: "schema_excluded",
    },
    ...relations
      .filter((r) => r.schema === "public")
      .map((r) => ({
        name: `public.${r.name}`,
        path: `/rest/v1/${r.name}?select=*&limit=0`,
        profile: "public",
        expectation: "permission_denied",
      })),
    ...[
      ["get_learner_access", ""],
      ["get_due_review_count", ""],
      [
        "search_vocabulary",
        "?p_syllabus_id=00000000-0000-0000-0000-000000000000&p_limit=1",
      ],
    ].map(([name, query]) => ({
      name: `rpc.${name}`,
      path: `/rest/v1/rpc/${name}${query}`,
      profile: "public",
      expectation: "permission_denied",
    })),
  ];
  const checks = [];
  for (const probe of probes) {
    try {
      const response = await fetcher(new URL(probe.path, base), {
        method: "GET",
        redirect: "error",
        headers: { apikey: key, "Accept-Profile": probe.profile },
        signal: AbortSignal.timeout(20000),
      });
      const body = await response.json();
      const code = typeof body?.code === "string" ? body.code : null;
      const triggerRpcRejected =
        response.status === 400 &&
        code === "0A000" &&
        typeof body?.message === "string" &&
        [
          "cannot display a value of type event_trigger",
          "event trigger functions can only be called as event triggers",
          "trigger functions can only be called as triggers",
        ].includes(body.message);
      const pass =
        probe.expectation === "event_trigger_rpc_rejected"
          ? triggerRpcRejected
          : probe.expectation === "schema_excluded"
            ? response.status === 406 && code === "PGRST106"
            : [401, 403].includes(response.status) && code === "42501";
      checks.push({
        name: probe.name,
        expectation: probe.expectation,
        status: pass ? "PASS" : "FAIL",
        httpStatus: response.status,
        errorCode: code,
        ...(probe.expectation === "event_trigger_rpc_rejected"
          ? { triggerRpcRejected }
          : {}),
      });
    } catch {
      checks.push({
        name: probe.name,
        status: "BLOCKED",
        reason: "HTTP check unavailable; raw diagnostics suppressed.",
      });
    }
  }
  const status = (rows) =>
    rows.some((x) => x.status === "FAIL")
      ? "FAIL"
      : rows.some((x) => x.status !== "PASS")
        ? "BLOCKED"
        : "PASS";
  return {
    projectRef: "hhgxrjqkuwdgurphopok",
    checkedAt: new Date().toISOString(),
    status: status(checks),
    privateSchema: status(checks.filter((x) => x.name.startsWith("private."))),
    anonymousPermissions: status(
      checks.filter((x) => !x.name.startsWith("private.")),
    ),
    checks,
  };
}

if (
  process.argv[1] &&
  pathToFileURL(path.resolve(process.argv[1])).href === import.meta.url
) {
  const config = parseEnv(fs.readFileSync(".env.local", "utf8"));
  const base = new URL(config.NEXT_PUBLIC_SUPABASE_URL);
  const key = config.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (
    base.protocol !== "https:" ||
    base.hostname !== "hhgxrjqkuwdgurphopok.supabase.co" ||
    base.username ||
    base.password ||
    !key?.startsWith("sb_publishable_")
  ) {
    throw Error("Expected approved Development public configuration.");
  }
  const manifest = JSON.parse(
    fs
      .readFileSync(".local/cloud-apply/schema.json", "utf8")
      .replace(/^\uFEFF/, ""),
  );
  const result = await checkAnonymousApi(fetch, base, key, manifest.relations);
  fs.mkdirSync(".local/cloud-security", { recursive: true });
  fs.writeFileSync(
    ".local/cloud-security/http.json",
    JSON.stringify(result, null, 2) + "\n",
  );
  console.log(JSON.stringify(result));
  if (result.status !== "PASS") process.exitCode = 2;
}
