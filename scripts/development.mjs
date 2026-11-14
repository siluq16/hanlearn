// Fixed Development utilities; never import this operator module into the app.
import fs from "node:fs";
import path from "node:path";
import { parseEnv } from "node:util";
import { spawnSync } from "node:child_process";
import { randomBytes, randomUUID } from "node:crypto";
import { pathToFileURL } from "node:url";
import { createClient } from "@supabase/supabase-js";
import { lookup } from "node:dns/promises";
export const projectRef = "hhgxrjqkuwdgurphopok";
export const cacheFile = ".local/development/test-account.dpapi";
let poolerAddress;
export function developmentConfig() {
  const env = parseEnv(fs.readFileSync(".env.local", "utf8"));
  if (
    new URL(env.NEXT_PUBLIC_SUPABASE_URL).href !==
      `https://${projectRef}.supabase.co/` ||
    !env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.startsWith("sb_publishable_") ||
    process.env.VERCEL_ENV === "production" ||
    process.env.CONTEXT === "production" ||
    process.env.CI
  )
    throw Error("DEVELOPMENT_TARGET_REQUIRED");
  return {
    url: `https://${projectRef}.supabase.co`,
    key: env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  };
}
export function testStore(operation, data) {
  developmentConfig();
  if (process.platform !== "win32")
    throw Error("WINDOWS_TEST_SESSION_REQUIRED");
  const r = spawnSync(
    "powershell",
    [
      "-NoProfile",
      "-ExecutionPolicy",
      "Bypass",
      "-File",
      "scripts/development-store.ps1",
      "-Operation",
      operation,
    ],
    {
      input: data ? JSON.stringify(data) : undefined,
      encoding: "utf8",
      windowsHide: true,
      timeout: 20000,
      env: { ...process.env, HANLEARN_INTERNAL_SESSION_PIPE: "1" },
      maxBuffer: 200000,
    },
  );
  if (r.status !== 0) throw Error("TEST_SESSION_UNAVAILABLE");
  const parsed = JSON.parse(r.stdout.replace(/^\uFEFF/, ""));
  if (
    operation === "Read" &&
    (parsed.projectRef !== projectRef || !/^[a-f0-9-]{36}$/.test(parsed.userId))
  )
    throw Error("TEST_SESSION_TARGET_MISMATCH");
  return parsed;
}
function database(password, sql) {
  const ca = path.resolve(".local/cloud-preflight/prod-supabase.cer");
  if (!fs.existsSync(ca)) throw Error("TRUSTED_CA_REQUIRED");
  const env = Object.fromEntries(
    Object.entries(process.env).filter(
      ([k]) => !/^PG|SECRET|TOKEN|PASSWORD|DEBUG/.test(k),
    ),
  );
  Object.assign(env, {
    PGHOST: "aws-1-ap-southeast-2.pooler.supabase.com",
    PGHOSTADDR: poolerAddress,
    PGPORT: "5432",
    PGDATABASE: "postgres",
    PGUSER: `postgres.${projectRef}`,
    PGPASSWORD: password,
    PGSSLMODE: "verify-full",
    PGSSLROOTCERT: ca,
    PGCLIENTENCODING: "UTF8",
    PGCONNECT_TIMEOUT: "15",
    PGPASSFILE: path.resolve(".local/development/absent-passfile"),
  });
  const r = spawnSync(
    "C:/Program Files/PostgreSQL/18/bin/psql.exe",
    [
      "-X",
      "-w",
      "-A",
      "-t",
      "-q",
      "-v",
      "ON_ERROR_STOP=1",
      "-v",
      "VERBOSITY=sqlstate",
      "-f",
      "-",
    ],
    { input: sql, env, encoding: "utf8", windowsHide: true, timeout: 40000 },
  );
  if (r.status !== 0) throw Error("DEVELOPMENT_DB_COMMAND_FAILED");
  return r.stdout.trim();
}
async function setup(input) {
  const config = developmentConfig();
  poolerAddress = (
    await lookup("aws-1-ap-southeast-2.pooler.supabase.com", { family: 4 })
  ).address;
  if (typeof input.databasePassword !== "string" || !input.databasePassword)
    throw Error("DB_CREDENTIAL_REQUIRED");
  // No generic migration/preflight is needed for this bounded account provisioning.
  if (
    database(
      input.databasePassword,
      "BEGIN READ ONLY; SELECT current_database()='postgres' AND current_user='postgres'; ROLLBACK;",
    ) !== "t"
  )
    throw Error("DB_IDENTITY_MISMATCH");
  let account;
  if (fs.existsSync(cacheFile)) account = testStore("Read");
  const protectedLearnerIds = JSON.parse(
    database(
      input.databasePassword,
      "BEGIN READ ONLY; SELECT coalesce(json_agg(user_id::text),'[]'::json) FROM private.allowed_learners; ROLLBACK;",
    ),
  );
  if (!account?.authCreated) {
    if (
      !input.adminKey?.startsWith("sb_secret_") &&
      !input.adminKey?.startsWith("eyJ")
    )
      throw Error("AUTH_ADMIN_KEY_REQUIRED");
    account ??= {
      projectRef,
      userId: randomUUID(),
      email: `hanlearn-test-${randomUUID()}@example.invalid`,
      password: randomBytes(32).toString("base64url") + "aA1!",
      authCreated: false,
    };
    account.protectedLearnerIds ??= protectedLearnerIds.filter(
      (id) => id !== account.userId,
    );
    testStore("Write", account);
    const admin = createClient(config.url, input.adminKey, {
      auth: { persistSession: false, autoRefreshToken: false },
      global: {
        fetch: (url, options) => fetch(url, { ...options, redirect: "error" }),
      },
    });
    const existing = await admin.auth.admin.getUserById(account.userId);
    let user = existing.data?.user;
    if (!user) {
      if (existing.error?.status !== 404)
        throw Error("TEST_AUTH_LOOKUP_FAILED");
      const created = await admin.auth.admin.createUser({
        id: account.userId,
        email: account.email,
        password: account.password,
        email_confirm: true,
        app_metadata: {
          hanlearn_automation: true,
          hanlearn_project: projectRef,
        },
      });
      if (created.error)
        throw Error("TEST_AUTH_CREATE_STOPPED_VERIFY_SAME_UUID");
      user = created.data.user;
    }
    if (
      !user?.email_confirmed_at ||
      user.id !== account.userId ||
      user.app_metadata?.hanlearn_automation !== true ||
      user.app_metadata?.hanlearn_project !== projectRef
    )
      throw Error("TEST_AUTH_IDENTITY_MISMATCH");
    account.authCreated = true;
    testStore("Write", account);
  }
  const id = account.userId;
  if (!/^[a-f0-9-]{36}$/.test(id)) throw Error("INVALID_TEST_UUID");
  const sql = `BEGIN; SET LOCAL lock_timeout='5s'; LOCK TABLE private.allowed_learners IN SHARE ROW EXCLUSIVE MODE;
DO $check$ BEGIN IF NOT EXISTS(SELECT 1 FROM auth.users WHERE id='${id}'::uuid AND email_confirmed_at IS NOT NULL AND raw_app_meta_data->>'hanlearn_automation'='true' AND raw_app_meta_data->>'hanlearn_project'='${projectRef}') THEN RAISE EXCEPTION 'test_identity_required'; END IF; END $check$;
INSERT INTO private.allowed_learners(user_id) SELECT '${id}'::uuid WHERE NOT EXISTS(SELECT 1 FROM private.allowed_learners WHERE user_id='${id}'::uuid);
COMMIT;`;
  database(input.databasePassword, sql);
  console.log(
    JSON.stringify({
      status: "TEST_ACCOUNT_READY",
      target: projectRef,
      existingLearnersChanged: false,
    }),
  );
}
if (
  process.argv[1] &&
  pathToFileURL(path.resolve(process.argv[1])).href === import.meta.url
) {
  try {
    if (process.argv[2] !== "--setup") throw Error("SETUP_COMMAND_REQUIRED");
    let input = "";
    process.stdin.setEncoding("utf8");
    for await (const c of process.stdin) {
      input += c;
      if (input.length > 65536) throw Error("INPUT_LIMIT");
    }
    await setup(JSON.parse(input.replace(/^\uFEFF/, "")));
  } catch (error) {
    console.log(
      JSON.stringify({
        status: "STOPPED",
        code: /^[A-Z_]+$/.test(error.message)
          ? error.message
          : "DEVELOPMENT_SETUP_FAILED",
        automaticRetry: false,
      }),
    );
    process.exitCode = 2;
  }
}
