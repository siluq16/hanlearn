// Real Auth/SSR browser acceptance. No profile/learning mutations, traces or screenshots.
import fs from "node:fs";
import { parseEnv } from "node:util";
import { spawn } from "node:child_process";
import { chromium } from "playwright";
import { createServerClient } from "@supabase/ssr";
const email = process.env.HANLEARN_ACCEPTANCE_EMAIL;
const password = process.env.HANLEARN_ACCEPTANCE_PASSWORD;
const role = process.env.HANLEARN_ACCEPTANCE_ROLE || "Owner";
delete process.env.HANLEARN_ACCEPTANCE_EMAIL;
delete process.env.HANLEARN_ACCEPTANCE_PASSWORD;
const report = {
  projectRef: "hhgxrjqkuwdgurphopok",
  role,
  checkedAt: new Date().toISOString(),
  status: "BLOCKED",
  checks: [],
};
let server,
  browser,
  context,
  client,
  stage = "configuration";
const check = (name, pass) => {
  report.checks.push({ name, status: pass ? "PASS" : "FAIL" });
  if (!pass) throw Error("assertion");
};
const origin = "http://127.0.0.1:3101";
try {
  const env = parseEnv(fs.readFileSync(".env.local", "utf8"));
  const url = env.NEXT_PUBLIC_SUPABASE_URL,
    key = env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (
    !email ||
    !password ||
    !["Owner", "Outsider", "LearnerB"].includes(role) ||
    new URL(url).hostname !== report.projectRef + ".supabase.co" ||
    !key?.startsWith("sb_publishable_")
  )
    throw Error();
  // Never attach to an unrelated existing server or inherit credentials into Next.
  let occupied = false;
  try {
    await fetch(origin, { signal: AbortSignal.timeout(1000) });
    occupied = true;
  } catch {
    /* no server */
  }
  if (occupied) throw Error();
  server = spawn(
    process.execPath,
    [
      "node_modules/next/dist/bin/next",
      "start",
      "--hostname",
      "127.0.0.1",
      "--port",
      "3101",
    ],
    { stdio: "ignore", windowsHide: true, env: process.env },
  );
  stage = "production-server-start";
  for (let i = 0; i < 60; i++) {
    try {
      if (
        (await fetch(origin + "/login", { signal: AbortSignal.timeout(1000) }))
          .ok
      )
        break;
    } catch {
      /* wait */
    }
    if (i === 59 || server.exitCode !== null) throw Error();
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  browser = await chromium.launch({
    headless: true,
    channel: process.env.PLAYWRIGHT_CHANNEL || "chrome",
  });
  context = await browser.newContext({
    viewport: { width: 1280, height: 900 },
  });
  const page = await context.newPage();
  page.setDefaultTimeout(30000);
  stage = "anonymous-protected-routes";
  await page.goto(origin + "/dashboard");
  check(stage, new URL(page.url()).pathname === "/login");
  const anonymous = await context.request.get(origin + "/api/me");
  check(
    "anonymous-api-no-identity",
    anonymous.status() === 401 && !Object.hasOwn(await anonymous.json(), "id"),
  );
  stage = "real-server-action-login";
  await page.locator("#email").fill(email);
  await page.locator("#password").fill(password);
  await page.getByRole("button", { name: "Vào không gian học" }).click();
  if (role === "Outsider") {
    await page.getByRole("alert").waitFor();
    check("outsider-login-denied", new URL(page.url()).pathname === "/login");
    const denied = await context.request.get(origin + "/api/me");
    check(
      "outsider-no-session-access",
      denied.status() === 401 || denied.status() === 403,
    );
    // Independent real JWT below checks DB RLS without the app's sign-out guard.
  } else {
    await page.waitForURL(origin + "/dashboard");
    check(stage, true);
  }
  // Server-client cookie integration using real browser cookie storage, held in memory only.
  const jar = new Map((await context.cookies()).map((c) => [c.name, c.value]));
  client = createServerClient(url, key, {
    cookies: {
      getAll: () => [...jar].map(([name, value]) => ({ name, value })),
      setAll: (values) => {
        for (const c of values) {
          if (c.value) jar.set(c.name, c.value);
          else jar.delete(c.name);
        }
      },
    },
  });
  if (role === "Outsider") {
    const login = await client.auth.signInWithPassword({ email, password });
    check(
      "outsider-real-auth-confirmed",
      !login.error && !!login.data.user?.email_confirmed_at,
    );
    const access = await client.rpc("get_learner_access");
    check("outsider-allowlist-false", !access.error && access.data === false);
    for (const table of [
      "profiles",
      "vocabulary",
      "review_cards",
      "lesson_progress",
    ]) {
      const rows = await client
        .from(table)
        .select(
          table === "profiles"
            ? "id"
            : table === "vocabulary"
              ? "id"
              : "user_id",
        )
        .limit(1);
      check("outsider-rls-" + table, !rows.error && rows.data.length === 0);
    }
  } else {
    stage = "real-auth-identity";
    const user = await client.auth.getUser();
    check(stage, !user.error && !!user.data.user?.email_confirmed_at);
    const uid = user.data.user.id;
    const access = await client.rpc("get_learner_access");
    check("real-jwt-allowlist", !access.error && access.data === true);
    const selectProfile = () =>
      client
        .from("profiles")
        .select(
          "id,display_name,baseline_hsk_level,target_hsk_level,preferred_syllabus_id,timezone,daily_goal_minutes",
        )
        .eq("id", uid);
    const profile = await selectProfile();
    check(
      "one-persisted-profile-matches-auth-uuid",
      !profile.error && profile.data.length === 1 && profile.data[0].id === uid,
    );
    const before = profile.data[0];
    for (const route of [
      "/dashboard",
      "/roadmap",
      "/vocabulary",
      "/settings",
    ]) {
      stage = "authenticated-route-" + route.slice(1);
      await page.goto(origin + route);
      check(
        stage,
        new URL(page.url()).pathname === route &&
          (await page.locator("#main-content").count()) === 1,
      );
      check(
        stage + "-no-overflow",
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      );
    }
    stage = "settings-read-reload-persistence";
    const sameSettings = async () =>
      (await page.locator("#display_name").inputValue()) ===
        (before.display_name ?? "") &&
      Number(await page.locator("#baseline_hsk_level").inputValue()) ===
        before.baseline_hsk_level &&
      Number(await page.locator("#target_hsk_level").inputValue()) ===
        before.target_hsk_level &&
      (await page.locator("#preferred_syllabus_id").inputValue()) ===
        (before.preferred_syllabus_id ?? "");
    check(stage + "-initial", await sameSettings());
    await page.reload();
    check(stage, await sameSettings());
    await page.setViewportSize({ width: 390, height: 844 });
    for (const route of [
      "/dashboard",
      "/roadmap",
      "/vocabulary",
      "/settings",
    ]) {
      await page.goto(origin + route);
      check(
        "mobile-" + route.slice(1),
        new URL(page.url()).pathname === route &&
          (await page.evaluate(
            () => document.documentElement.scrollWidth <= innerWidth,
          )),
      );
    }
    const me = await context.request.get(origin + "/api/me");
    const identity = await me.json();
    check(
      "route-handler-identity-shape-no-store",
      me.status() === 200 &&
        identity.id === uid &&
        Object.keys(identity).sort().join(",") === "email,id" &&
        me.headers()["cache-control"].includes("no-store"),
    );
    const cookies = (await context.cookies()).filter((c) =>
      c.name.startsWith("sb-"),
    );
    check(
      "ssr-cookie-scope",
      cookies.length > 0 &&
        cookies.every(
          (c) =>
            c.domain === "127.0.0.1" && c.path === "/" && c.sameSite === "Lax",
        ),
    );
    stage = "real-auth-refresh";
    const refresh = await client.auth.refreshSession();
    check(
      stage,
      !refresh.error && refresh.data.user?.id === uid && !!refresh.data.session,
    );
    await context.clearCookies();
    await context.addCookies(
      [...jar].map(([name, value]) => ({
        name,
        value,
        url: origin,
        sameSite: "Lax",
      })),
    );
    await page.goto(origin + "/settings");
    check(
      "ssr-after-real-token-refresh",
      new URL(page.url()).pathname === "/settings" && (await sameSettings()),
    );
    const privateKeys = await client
      .schema("private")
      .from("quiz_answer_keys")
      .select("question_id")
      .limit(0);
    check(
      "owner-private-schema-http-denied",
      privateKeys.error?.code === "PGRST106",
    );
    const due = await client.rpc("get_due_review_count");
    check(
      "owner-read-rpc",
      !due.error && Number.isFinite(due.data) && due.data >= 0,
    );
    for (const table of [
      "review_cards",
      "review_events",
      "lesson_progress",
      "study_sessions",
    ]) {
      const rows = await client.from(table).select("user_id").limit(1000);
      check(
        "owner-row-scope-" + table,
        !rows.error && rows.data.every((r) => r.user_id === uid),
      );
    }
    const after = await selectProfile();
    check(
      "profile-unchanged-by-acceptance",
      !after.error && JSON.stringify(after.data[0]) === JSON.stringify(before),
    );
    stage = "real-server-action-logout";
    await page
      .getByRole("button", { name: "Đăng xuất", exact: true })
      .last()
      .click();
    await page.waitForURL(origin + "/login");
    const signedOut = await context.request.get(origin + "/api/me");
    check(stage, signedOut.status() === 401);
    await page.goto(origin + "/dashboard");
    check("protected-after-logout", new URL(page.url()).pathname === "/login");
  }
  report.status = "PASS";
  report.limits = [
    "No Settings or learning-data writes",
    "No populated A/B cross-user fixture claim",
    "Explicit real refresh tested; naturally expired Proxy branch not forced",
    "No credentials, tokens, IDs, profile values, screenshots or traces retained",
  ];
} catch {
  report.status = report.checks.some((c) => c.status === "FAIL")
    ? "FAIL"
    : "BLOCKED";
  report.stoppedAt = stage;
} finally {
  if (client) {
    try {
      await client.auth.signOut({ scope: "local" });
    } catch {
      /* best effort */
    }
  }
  if (context) await context.close();
  if (browser) await browser.close();
  if (server) server.kill();
  fs.mkdirSync(".local/acceptance", { recursive: true });
  fs.writeFileSync(
    `.local/acceptance/auth-${role.toLowerCase()}.json`,
    JSON.stringify(report, null, 2) + "\n",
  );
}
console.log(
  JSON.stringify({ status: report.status, role, checks: report.checks.length }),
);
if (report.status !== "PASS") process.exitCode = 2;
