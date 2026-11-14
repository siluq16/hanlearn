// Real Auth/SSR browser acceptance. No profile/learning mutations, traces or screenshots.
import fs from "node:fs";
import { parseEnv } from "node:util";
import { spawn } from "node:child_process";
import { chromium } from "playwright";
import { createServerClient } from "@supabase/ssr";
const email = process.env.HANLEARN_ACCEPTANCE_EMAIL;
const password = process.env.HANLEARN_ACCEPTANCE_PASSWORD;
const role = process.env.HANLEARN_ACCEPTANCE_ROLE || "Owner";
const catalogRead = process.env.HANLEARN_ACCEPTANCE_MODE === "CATALOG_READ";
const anonymousRead = process.argv[2] === "--anonymous-read";
delete process.env.HANLEARN_ACCEPTANCE_EMAIL;
delete process.env.HANLEARN_ACCEPTANCE_PASSWORD;
const report = {
  projectRef: "hhgxrjqkuwdgurphopok",
  role: anonymousRead ? "Anonymous" : role,
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
async function verifyLiveCatalog(page, context, client) {
  const { loadPilot, publicDraftParts } =
    await import("./pilot-r3-importer.mjs");
  const batches = publicDraftParts(loadPilot()).batches;
  const expectedWords = batches.find(
    ([table]) => table === "public.vocabulary",
  )[1];
  const expectedMembers = batches.find(
    ([table]) => table === "public.syllabus_vocabulary",
  )[1];
  const memberIds = new Set(expectedMembers.map((r) => r.vocabulary_id));
  const supplemental = expectedWords.filter((r) => !memberIds.has(r.id));
  const note = (name, pass) =>
    report.checks.push({ name, status: pass ? "PASS" : "FAIL" });
  const manifest = JSON.parse(
    fs.readFileSync("content/pilot-hsk1/v1/manifest.json", "utf8"),
  );
  const lessons = [1, 2, 3, 4].map((n) =>
    JSON.parse(
      fs.readFileSync(
        `content/pilot-hsk1/v1/lessons/lesson-0${n}.json`,
        "utf8",
      ),
    ),
  );
  const user = await client.auth.getUser();
  check(
    "live-confirmed-auth",
    !user.error && !!user.data.user?.email_confirmed_at,
  );
  const uid = user.data.user.id;
  const prior = JSON.parse(
    fs
      .readFileSync(".local/pilot-r3-blockers/capture.json", "utf8")
      .replace(/^\uFEFF/, ""),
  );
  const expected = prior.ownerIdentity.allowlist.filter((r) =>
    role === "Owner" ? r.owner_reference_match : !r.owner_reference_match,
  );
  check(
    "live-distinct-expected-invitee",
    expected.length === 1 && expected[0].id === uid,
  );
  const access = await client.rpc("get_learner_access");
  check("live-jwt-allowlisted", !access.error && access.data === true);
  const snapshot = async () => {
    const state = {};
    for (const [table, columns] of [
      ["profiles", "id"],
      ["lesson_progress", "lesson_id,studied_at,completed_at"],
      [
        "quiz_attempts",
        "id,started_at,submitted_at,correct_count,question_count,passed",
      ],
      ["study_sessions", "id"],
      ["review_cards", "id"],
    ]) {
      const r = await client
        .from(table)
        .select(columns)
        .order(table === "lesson_progress" ? "lesson_id" : "id");
      check("read-owned-state-" + table, !r.error);
      state[table] = r.data;
    }
    return JSON.stringify(state);
  };
  const before = await snapshot();
  let unsafePayload = false,
    mutationRequest = false;
  const pending = [];
  page.on("response", (response) => {
    if (!response.url().startsWith(origin)) return;
    const type = response.headers()["content-type"] || "";
    if (/text\/html|text\/x-component|javascript|application\/json/.test(type))
      pending.push(
        response
          .text()
          .then((text) => {
            if (
              /correct_index|explanation_vi|submission_fingerprint|submission_payload/.test(
                text,
              )
            )
              unsafePayload = true;
          })
          .catch(() => {}),
      );
  });
  // After login this mode only navigates/reads/toggles presentation controls.
  await context.route("**/*", (route) => {
    if (!["GET", "HEAD"].includes(route.request().method())) {
      mutationRequest = true;
      return route.abort();
    }
    return route.continue();
  });
  const visit = async (route) => {
    stage = "live-page-" + route;
    const response = await page.goto(origin + route);
    check(
      stage,
      response?.status() === 200 &&
        new URL(page.url()).pathname === route.split("?")[0] &&
        (await page.locator("#main-content").count()) === 1,
    );
    // HTTP load / the shared app shell can precede streamed page content.
    await page
      .getByRole("heading", { level: 1 })
      .first()
      .waitFor({ state: "visible" });
    note(
      stage + "-responsive",
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    );
  };
  await visit("/dashboard");
  await visit("/roadmap");
  check(
    "roadmap-four-published-lessons",
    (await page.locator("details[id^='lesson-']").count()) === 4,
  );
  const vocabularyIds = new Set();
  const vocabularyPageCounts = [];
  for (let n = 1; n <= 3; n++) {
    await visit("/vocabulary?page=" + n);
    await page
      .getByRole("heading", { name: "Tích lũy từng từ một.", exact: true })
      .waitFor();
    const hrefs = await page
      .locator("#main-content a[href^='/vocabulary/']")
      .evaluateAll((nodes) => nodes.map((a) => a.getAttribute("href")));
    vocabularyPageCounts.push(hrefs.length);
    for (const href of hrefs) vocabularyIds.add(href);
  }
  report.vocabularyPageCounts = vocabularyPageCounts;
  note(
    "website-exact-syllabus-vocabulary-paginated",
    vocabularyIds.size === memberIds.size &&
      [...memberIds].every((id) => vocabularyIds.has("/vocabulary/" + id)),
  );
  const words = await client
    .from("syllabus_vocabulary")
    .select("vocabulary_id")
    .eq("syllabus_id", manifest.syllabus.id);
  check(
    "live-jwt-exact-43-vocabulary-memberships",
    !words.error &&
      words.data.length === memberIds.size &&
      words.data.every((r) => memberIds.has(r.vocabulary_id)),
  );
  const catalog = await client
    .from("vocabulary")
    .select("id")
    .in(
      "id",
      expectedWords.map((w) => w.id),
    );
  check(
    "live-jwt-all-44-published-vocabulary",
    !catalog.error && catalog.data.length === expectedWords.length,
  );
  for (const word of supplemental) {
    await visit("/vocabulary/" + word.id);
    check(
      "supplemental-word-detail-readable-without-fabricated-hsk-membership",
      await page
        .getByRole("heading", { level: 1, name: word.simplified, exact: true })
        .isVisible(),
    );
  }
  let totalQuestions = 0,
    totalSections = 0,
    quizzesVisible = 0;
  for (let n = 0; n < lessons.length; n++) {
    const checkStart = report.checks.length;
    try {
      const lesson = lessons[n];
      await visit("/lessons/" + lesson.id);
      await page.locator("#lesson-title").waitFor({ state: "visible" });
      check(
        "lesson-" + (n + 1) + "-title",
        (await page.locator("#lesson-title").innerText()) === lesson.title,
      );
      check(
        "lesson-" + (n + 1) + "-sections",
        (await page.locator("section[id^='section-']").count()) ===
          lesson.content.sections.length,
      );
      totalSections += lesson.content.sections.length;
      const toggle = page.getByRole("button", {
        name: "Hiển thị pinyin",
        exact: true,
      });
      const initialPinyin = await page.locator("[data-pinyin-text]").count();
      check("lesson-" + (n + 1) + "-pinyin-present", initialPinyin > 0);
      await toggle.click();
      await page.waitForFunction(
        () => document.querySelectorAll("[data-pinyin-text]").length === 0,
      );
      check(
        "lesson-" + (n + 1) + "-pinyin-hidden",
        (await page.locator("[data-pinyin-text]").count()) === 0,
      );
      await toggle.click();
      await page.waitForFunction(
        (n) => document.querySelectorAll("[data-pinyin-text]").length === n,
        initialPinyin,
      );
      check(
        "lesson-" + (n + 1) + "-pinyin-restored",
        (await page.locator("[data-pinyin-text]").count()) === initialPinyin,
      );
      check(
        "lesson-" + (n + 1) + "-study-locked",
        await page
          .getByRole("button", { name: "Tôi đã học nội dung này", exact: true })
          .isDisabled(),
      );
      const q = await client
        .from("lesson_quizzes")
        .select("id,revision")
        .eq("lesson_id", lesson.id)
        .eq("status", "published")
        .single();
      check(
        "lesson-" + (n + 1) + "-quiz-revision",
        !q.error && q.data.revision === [3, 2, 2, 2][n],
      );
      const questions = await client
        .from("quiz_questions")
        .select("id,prompt,choices,sort_order")
        .eq("quiz_id", q.data.id)
        .order("sort_order");
      check(
        "lesson-" + (n + 1) + "-six-public-questions",
        !questions.error &&
          questions.data.length === 6 &&
          questions.data.every(
            (r) =>
              Object.keys(r).sort().join(",") ===
              "choices,id,prompt,sort_order",
          ),
      );
      totalQuestions += questions.data.length;
      await visit("/lessons/" + lesson.id + "/quiz");
      check(
        "lesson-" + (n + 1) + "-quiz-header-six",
        (await page.getByText(/6 câu · Đạt từ 80%/).count()) === 1,
      );
      check(
        "lesson-" + (n + 1) + "-quiz-start-locked",
        await page.getByRole("button", { name: /Bắt đầu/ }).isDisabled(),
      );
      const visible = (await page.locator("#quiz-question").count()) > 0;
      note("lesson-" + (n + 1) + "-questions-visible-without-start", visible);
      if (visible) quizzesVisible++;
    } catch {
      if (!report.checks.slice(checkStart).some((c) => c.status === "FAIL"))
        note("lesson-" + (n + 1) + "-read-flow", false);
      (report.lessonReadErrors ??= []).push({
        lesson: n + 1,
        stoppedAt: stage,
      });
    }
  }
  await page.setViewportSize({ width: 360, height: 800 });
  for (const route of [
    "/dashboard",
    "/roadmap",
    "/vocabulary",
    "/lessons/" + lessons[2].id,
    "/lessons/" + lessons[2].id + "/quiz",
  ])
    await visit(route);
  const privateSchema = await client
    .schema("private")
    .from("quiz_answer_keys")
    .select("question_id")
    .limit(0);
  check(
    "live-private-schema-not-exposed",
    privateSchema.error?.code === "PGRST106",
  );
  const after = await snapshot();
  check("learning-state-unchanged-by-live-acceptance", before === after);
  await Promise.all(pending);
  check("no-private-quiz-fields-in-observed-browser-responses", !unsafePayload);
  check("no-browser-mutation-or-server-action-after-login", !mutationRequest);
  report.counts = {
    lessons: 4,
    vocabulary: catalog.data.length,
    syllabusVocabulary: vocabularyIds.size,
    supplementalVocabulary: supplemental.length,
    sections: totalSections,
    questions: totalQuestions,
    quizPages: 4,
    quizPagesShowingQuestionsWithoutStart: quizzesVisible,
  };
  report.limits = [
    "No startQuiz, submitQuiz, study RPC, profile or learning writes",
    "Read-only browser navigation with production Next.js and real Development Auth/JWT",
    "No private store read; field-name scan and HTTP private-schema denial are not a comparison against private values",
    "Quiz questions require a started attempt in the current UI; no attempt created",
    "No screenshots/traces, credentials/cookies/tokens or user IDs retained",
  ];
}
try {
  const env = parseEnv(fs.readFileSync(".env.local", "utf8"));
  const url = env.NEXT_PUBLIC_SUPABASE_URL,
    key = env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (
    (!anonymousRead && (!email || !password)) ||
    !["Owner", "Outsider", "LearnerB"].includes(role) ||
    new URL(url).href !== "https://" + report.projectRef + ".supabase.co/" ||
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
  if (anonymousRead) {
    await page.setViewportSize({ width: 360, height: 800 });
    for (const path of ["/roadmap", "/vocabulary", "/dashboard"]) {
      await page.goto(origin + path);
      check(
        "anonymous-redirect-" + path.slice(1),
        new URL(page.url()).pathname === "/login",
      );
    }
    check(
      "mobile-login-no-overflow",
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    );
  } else {
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
    const jar = new Map(
      (await context.cookies()).map((c) => [c.name, c.value]),
    );
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
    if (catalogRead && role !== "Outsider") {
      await verifyLiveCatalog(page, context, client);
    } else if (role === "Outsider") {
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
        !profile.error &&
          profile.data.length === 1 &&
          profile.data[0].id === uid,
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
              c.domain === "127.0.0.1" &&
              c.path === "/" &&
              c.sameSite === "Lax",
          ),
      );
      stage = "real-auth-refresh";
      const refresh = await client.auth.refreshSession();
      check(
        stage,
        !refresh.error &&
          refresh.data.user?.id === uid &&
          !!refresh.data.session,
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
        !after.error &&
          JSON.stringify(after.data[0]) === JSON.stringify(before),
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
      check(
        "protected-after-logout",
        new URL(page.url()).pathname === "/login",
      );
    }
  }
  report.status = report.checks.some((c) => c.status === "FAIL")
    ? "FAIL"
    : "PASS";
  if (anonymousRead)
    report.limits = [
      "Anonymous redirects and API denial only; no login, tokens or learner mutations",
    ];
  else if (!catalogRead)
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
    `.local/acceptance/${anonymousRead ? "live-read-anonymous" : (catalogRead ? "live-read" : "auth") + "-" + role.toLowerCase()}.json`,
    JSON.stringify(report, null, 2) + "\n",
  );
}
console.log(
  JSON.stringify({
    status: report.status,
    role: report.role,
    checks: report.checks.length,
  }),
);
if (report.status !== "PASS") process.exitCode = 2;
