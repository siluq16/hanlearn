// Actual Development vertical slice. The encrypted dedicated test identity is mandatory.
import fs from "node:fs";
import { spawn } from "node:child_process";
import { randomUUID } from "node:crypto";
import { chromium, expect as baseExpect } from "@playwright/test";
import { createServerClient } from "@supabase/ssr";
import { ensureReviewCards } from "./development-srs.mjs";
import {
  developmentConfig,
  testStore,
  cacheFile,
  projectRef,
} from "./development.mjs";
const report = { status: "FAIL", target: projectRef, checks: [] };
// Web-first assertions have their own 5s default, independent of page timeouts.
// Real Auth/PostgREST plus an RSC revalidation need the same bounded budget.
const expect = baseExpect.configure({ timeout: 30000 });
let server, browser, context, client, account, page;
let stage = "test-session";
const check = (name, pass) => {
  report.checks.push({ name, status: pass ? "PASS" : "FAIL" });
  if (!pass) throw Error("CHECK_FAILED");
};
const origin = "http://127.0.0.1:3106";
const readOnly = process.argv.includes("--read-only");
const uxReview = process.argv.includes("--ux-review");
try {
  const config = developmentConfig();
  if (!fs.existsSync(cacheFile)) throw Error("RUN_DEV_SETUP_TEST_ONCE");
  account = testStore("Read");
  const realLearners = account.protectedLearnerIds;
  if (!Array.isArray(realLearners) || realLearners.length < 2)
    throw Error("TEST_ACCOUNT_BINDING_REQUIRED");
  check(
    "test-identity-is-not-owner-or-friend",
    !realLearners.includes(account.userId) && account.authCreated === true,
  );
  const cookies = new Map();
  client = createServerClient(config.url, config.key, {
    cookies: {
      getAll: () => [...cookies].map(([name, value]) => ({ name, value })),
      setAll: (rows) => {
        for (const row of rows) {
          if (row.value) cookies.set(row.name, row.value);
          else cookies.delete(row.name);
        }
      },
    },
  });
  let session;
  if (account.session?.refresh_token && account.session?.access_token) {
    const reused = await client.auth.setSession(account.session);
    if (!reused.error) session = reused.data.session;
  }
  if (!session) {
    const login = await client.auth.signInWithPassword({
      email: account.email,
      password: account.password,
    });
    check("dedicated-test-login", !login.error && !!login.data.session);
    session = login.data.session;
  } else check("existing-test-session-reused", true);
  const identity = await client.auth.getUser();
  check(
    "server-verified-test-app-metadata",
    !identity.error &&
      identity.data.user?.id === account.userId &&
      identity.data.user.email_confirmed_at &&
      identity.data.user.app_metadata?.hanlearn_automation === true &&
      identity.data.user.app_metadata?.hanlearn_project === projectRef,
  );
  account.session = {
    access_token: session.access_token,
    refresh_token: session.refresh_token,
  };
  testStore("Write", account);
  check(
    "test-is-allowlisted",
    (await client.rpc("get_learner_access")).data === true,
  );
  if (readOnly) {
    for (const [table, expected] of [
      ["lessons", 4],
      ["vocabulary", 44],
      ["quiz_questions", 24],
    ]) {
      const result = await client.from(table).select("id");
      check(
        "development-readable-" + table,
        !result.error && result.data.length === expected,
      );
    }
    const keys = await client
      .schema("private")
      .from("quiz_answer_keys")
      .select("question_id")
      .limit(0);
    check("private-answer-schema-http-denied", keys.error?.code === "PGRST106");
    report.status = "READ_PASS";
  } else {
    let occupied = false;
    try {
      await fetch(origin, { signal: AbortSignal.timeout(1000) });
      occupied = true;
    } catch {
      /* vacant */
    }
    if (occupied) throw Error("TEST_PORT_IN_USE");
    stage = "next-start";
    server = spawn(
      process.execPath,
      [
        "node_modules/next/dist/bin/next",
        "start",
        "--hostname",
        "127.0.0.1",
        "--port",
        "3106",
      ],
      {
        windowsHide: true,
        stdio: ["ignore", "ignore", "pipe"],
        env: { ...process.env, HANLEARN_DEVELOPMENT_LEARNING: "1" },
      },
    );
    server.stderr.on("data", (chunk) => {
      const text = chunk.toString();
      // Only fixed classifications; never retain raw Next diagnostics/headers.
      for (const type of [
        "TypeError",
        "ReferenceError",
        "ZodError",
        "FetchError",
        "EPERM",
        "ECONNRESET",
        "ETIMEDOUT",
        "ENOTFOUND",
      ]) {
        if (text.includes(type)) {
          report.serverSignals ??= [];
          if (!report.serverSignals.includes(type))
            report.serverSignals.push(type);
        }
      }
      if (text.includes("Không tải được dữ liệu học")) {
        report.serverSignals ??= [];
        if (!report.serverSignals.includes("APP_DATA_ERROR"))
          report.serverSignals.push("APP_DATA_ERROR");
      }
    });
    let ready = false;
    for (let n = 0; n < 60; n++) {
      try {
        ready = (
          await fetch(origin + "/login", { signal: AbortSignal.timeout(1000) })
        ).ok;
      } catch {
        /* wait */
      }
      if (ready) break;
      if (server.exitCode !== null) break;
      await new Promise((r) => setTimeout(r, 500));
    }
    check("real-next-server", ready);
    browser = await chromium.launch({
      headless: true,
      channel: process.env.PLAYWRIGHT_CHANNEL || "chrome",
    });
    context = await browser.newContext({
      viewport: { width: 1280, height: 900 },
    });
    await context.addCookies(
      [...cookies].map(([name, value]) => ({
        name,
        value,
        url: origin,
        sameSite: "Lax",
      })),
    );
    page = await context.newPage();
    page.setDefaultTimeout(30000);
    let privateField = false;
    const pending = [];
    page.on("console", (message) => {
      if (message.type() !== "error") return;
      const text = message.text();
      const reactCode = /Minified React error #(\d+)/.exec(text)?.[1];
      if (reactCode) (report.reactErrors ??= []).push(Number(reactCode));
      if (text.includes("Invalid time value"))
        (report.clientErrors ??= []).push("INVALID_DATE");
    });
    page.on("pageerror", (error) => {
      report.clientErrors ??= [];
      const kind = error.message.includes("Invalid time value")
        ? "INVALID_DATE"
        : error.message.includes("time zone")
          ? "TIME_ZONE"
          : error.message.includes("hydration")
            ? "HYDRATION"
            : ["RangeError", "TypeError", "ReferenceError"].includes(error.name)
              ? error.name
              : "CLIENT_ERROR";
      report.clientErrors.push(kind);
    });
    page.on("request", (r) => {
      if (r.url().startsWith(origin) && r.method() === "POST")
        report.actionRequests = (report.actionRequests ?? 0) + 1;
    });
    page.on("requestfailed", (r) => {
      if (r.url().startsWith(origin) && r.method() === "POST")
        report.failedActionRequests = (report.failedActionRequests ?? 0) + 1;
    });
    page.on("response", (r) => {
      if (r.url().startsWith(origin) && r.request().method() === "POST")
        (report.actionHttp ??= []).push(r.status());
      if (
        r.url().startsWith(origin) &&
        /text\/html|text\/x-component|javascript/.test(
          r.headers()["content-type"] || "",
        )
      )
        pending.push(
          r
            .text()
            .then((s) => {
              if (r.request().method() === "POST") {
                (report.actionTransport ??= []).push({
                  status: r.status(),
                  ok: /"ok"\s*:\s*true/.test(s),
                  rejected: /"ok"\s*:\s*false/.test(s),
                  flightError: /:E\{/.test(s),
                });
              }
              for (const match of s.matchAll(
                /"code"\s*:\s*"(LOCAL_ONLY|INVALID_INPUT|UNAVAILABLE|FORBIDDEN|CONFLICT|RETRY|READBACK|NETWORK)"/g,
              )) {
                (report.actionCodes ??= []).push(match[1]);
              }
              if (
                /correct_index|explanation_vi|submission_payload|submission_fingerprint/.test(
                  s,
                )
              )
                privateField = true;
            })
            .catch(() => {}),
        );
    });
    if (uxReview) {
      const snapshotRoot =
        ".local/development/ux" +
        (process.argv.includes("--after") ? "/after" : "");
      fs.mkdirSync(snapshotRoot, { recursive: true });
      const lessonIds = [3, 4].map(
        (n) =>
          JSON.parse(
            fs.readFileSync(
              `content/pilot-hsk1/v1/lessons/lesson-0${n}.json`,
              "utf8",
            ),
          ).id,
      );
      const firstWord = JSON.parse(
        fs.readFileSync("content/pilot-hsk1/v1/vocabulary.json", "utf8"),
      )[0].id;
      for (const size of [
        { name: "desktop", width: 1280, height: 900 },
        { name: "mobile", width: 360, height: 800 },
      ]) {
        await page.setViewportSize({ width: size.width, height: size.height });
        for (const [name, route] of [
          ["dashboard", "/dashboard"],
          ["roadmap", "/roadmap"],
          ["vocabulary", "/vocabulary"],
          ["word", "/vocabulary/" + firstWord],
          ["lesson", "/lessons/" + lessonIds[0]],
          ["study", "/lessons/" + lessonIds[1]],
          ["quiz", "/lessons/" + lessonIds[0] + "/quiz"],
          ["listening", "/listening"],
        ]) {
          stage = "ux-" + size.name + "-" + name;
          const response = await page.goto(origin + route);
          await page.locator("#main-content h1").waitFor();
          check(stage + "-loads", response?.status() === 200);
          const overflow = await page.evaluate(
            () => document.documentElement.scrollWidth > innerWidth,
          );
          report.checks.push({
            name: stage + "-no-overflow",
            status: overflow ? "FAIL" : "PASS",
          });
          await page.screenshot({
            path: `${snapshotRoot}/${size.name}-${name}.png`,
            mask: [page.locator("header details")],
            animations: "disabled",
          });
          if (name === "lesson") {
            await page
              .locator("[data-vocabulary-card]")
              .first()
              .scrollIntoViewIfNeeded();
            await page.screenshot({
              path: `${snapshotRoot}/${size.name}-word-cards.png`,
              mask: [page.locator("header details")],
              animations: "disabled",
            });
          }
          if (name === "study") {
            await page
              .getByRole("heading", { name: "Tiến độ đã lưu", exact: true })
              .scrollIntoViewIfNeeded();
            await page.screenshot({
              path: `${snapshotRoot}/${size.name}-study-controls.png`,
              mask: [page.locator("header details")],
              animations: "disabled",
            });
          }
        }
      }
      report.status = report.checks.some((c) => c.status === "FAIL")
        ? "FAIL"
        : "UX_REVIEW_PASS";
    } else {
      const lessons = [1, 2, 4].map((n) =>
        JSON.parse(
          fs.readFileSync(
            `content/pilot-hsk1/v1/lessons/lesson-0${n}.json`,
            "utf8",
          ),
        ),
      );
      stage = "study-server-action";
      await page.goto(origin + "/lessons/" + lessons[2].id);
      await page.locator("#lesson-title").waitFor();
      const study = page.getByRole("button", {
        name: /Tôi đã học nội dung này|Xác nhận lại việc học/,
      });
      await expect(study).toBeEnabled();
      await study.click();
      await expect(
        page.getByRole("button", {
          name: "Xác nhận lại việc học",
          exact: true,
        }),
      ).toBeVisible();
      const progress = () =>
        client
          .from("lesson_progress")
          .select("user_id,studied_at,completed_at")
          .eq("lesson_id", lessons[2].id)
          .eq("user_id", account.userId)
          .single();
      const first = await progress();
      check(
        "study-persisted-for-test-user",
        !first.error &&
          first.data?.user_id === account.userId &&
          !!first.data.studied_at,
      );
      stage = "study-repeat-click";
      await page
        .getByRole("button", { name: "Xác nhận lại việc học", exact: true })
        .click();
      stage = "study-repeat-readback";
      await expect(
        page.getByRole("button", {
          name: "Xác nhận lại việc học",
          exact: true,
        }),
      ).toBeEnabled();
      const second = await progress();
      check(
        "study-repeat-preserves-initial-timestamp",
        !second.error && second.data.studied_at === first.data.studied_at,
      );
      await page.reload();
      await expect(
        page.getByRole("button", {
          name: "Xác nhận lại việc học",
          exact: true,
        }),
      ).toBeVisible();
      check("study-survives-browser-reload", true);
      stage = "quiz-server-actions";
      await page.goto(origin + "/lessons/" + lessons[0].id + "/quiz");
      await page
        .getByRole("button", { name: "Bắt đầu quiz", exact: true })
        .click();
      stage = "quiz-start-readback";
      await page.locator("#quiz-question").waitFor();
      check(
        "real-start-server-action-six-questions",
        (await page.getByText(/6 câu · Đạt từ 80%/).count()) === 1,
      );
      // Deliberately arbitrary choices, never loaded from a private store/key vector.
      stage = "quiz-answer-navigation";
      for (let n = 0; n < 6; n++) {
        await page.getByRole("radio").first().check();
        if (n < 5)
          await page
            .getByRole("button", { name: "Câu tiếp", exact: true })
            .click();
      }
      stage = "quiz-submit-confirmation";
      await page.getByRole("button", { name: "Nộp bài", exact: true }).click();
      await page
        .getByRole("button", { name: "Xác nhận nộp", exact: true })
        .click();
      stage = "quiz-submit-readback";
      await expect(
        page.getByRole("heading", { name: /^Kết quả:/ }),
      ).toBeVisible();
      const q = await client
        .from("lesson_quizzes")
        .select("id")
        .eq("lesson_id", lessons[0].id)
        .single();
      const attempt = await client
        .from("quiz_attempts")
        .select("id,user_id,submitted_at,correct_count,question_count,passed")
        .eq("user_id", account.userId)
        .eq("quiz_id", q.data.id)
        .not("submitted_at", "is", null)
        .order("started_at", { ascending: false })
        .limit(1)
        .single();
      check(
        "database-graded-submission-persisted",
        !attempt.error &&
          attempt.data.user_id === account.userId &&
          attempt.data.question_count === 6 &&
          typeof attempt.data.passed === "boolean",
      );
      await expect(
        page.getByText(`${attempt.data.correct_count} / 6 câu đúng`, {
          exact: true,
        }),
      ).toBeVisible();
      await page.reload();
      check(
        "submitted-quiz-in-persisted-history-after-reload",
        (await page
          .locator(`a[href*='attempt=${attempt.data.id}']`)
          .count()) === 1,
      );
      stage = "srs-card-creation";
      await ensureReviewCards(client, account, check);
      stage = "srs-browser-review";
      const eventsBefore = await client
        .from("review_events")
        .select("id", { count: "exact", head: true })
        .eq("user_id", account.userId);
      const dueBefore = await client.rpc("get_due_review_count");
      check("srs-review-events-readable", !eventsBefore.error);
      await page.goto(origin + "/review");
      await expect(
        page.getByRole("heading", {
          name: "Ôn từng thẻ, nhớ lâu hơn.",
          exact: true,
        }),
      ).toBeVisible();
      let srsTodayThisRun = await page
        .locator('[data-review-stat="Lượt ôn hôm nay"]')
        .innerText();
      if (dueBefore.data > 0) {
        for (
          let reviewed = 0;
          reviewed < Math.min(3, dueBefore.data);
          reviewed++
        ) {
          const rating = reviewed + 1;
          await expect(
            page.getByRole("button", { name: "Đã nhớ", exact: true }),
          ).toBeDisabled();
          await page
            .getByRole("button", { name: "Lật thẻ", exact: true })
            .click();
          await expect(page.locator("[data-review-back]")).toBeVisible();
          await page
            .getByRole("button", {
              name: ["Quên", "Khó", "Đã nhớ"][reviewed],
              exact: true,
            })
            .click();
          await expect(
            page.locator('[data-review-stat="Đã ôn trong phiên"]'),
          ).toHaveText(String(reviewed + 1));
          const event = await client
            .from("review_events")
            .select("id,card_id,idempotency_key,rating,result")
            .eq("user_id", account.userId)
            .order("reviewed_at", { ascending: false })
            .limit(1)
            .single();
          check(
            "srs-event-and-next-review-persisted-rating-" + rating,
            !event.error &&
              event.data.rating === rating &&
              event.data.result.algorithmVersion === "hl-sm2-v1",
          );
          const params = {
            p_card_id: event.data.card_id,
            p_rating: rating,
            p_response_ms: null,
            p_expected_version: event.data.result.version - 1,
            p_idempotency_key: event.data.idempotency_key,
          };
          const repeated = await client.rpc("submit_review", params);
          const eventsAfter = await client
            .from("review_events")
            .select("id", { count: "exact", head: true })
            .eq("user_id", account.userId);
          check(
            "srs-identical-retry-one-event-rating-" + rating,
            !repeated.error &&
              repeated.data.version === event.data.result.version &&
              eventsAfter.count === eventsBefore.count + reviewed + 1,
          );
          const card = await client
            .from("review_cards")
            .select("version,due_at")
            .eq("id", event.data.card_id)
            .eq("user_id", account.userId)
            .single();
          check(
            "srs-card-version-and-due-match-db-receipt-rating-" + rating,
            !card.error &&
              card.data.version === event.data.result.version &&
              Date.parse(card.data.due_at) ===
                Date.parse(event.data.result.nextDueAt),
          );
        }
        const today = await page
          .locator('[data-review-stat="Lượt ôn hôm nay"]')
          .innerText();
        await page.reload();
        await expect(
          page.locator('[data-review-stat="Lượt ôn hôm nay"]'),
        ).toHaveText(today);
        srsTodayThisRun = today;
        check("srs-progress-survives-reload", true);
      } else {
        await expect(
          page.getByRole("heading", {
            name: "Chưa có thẻ đến hạn",
            exact: true,
          }),
        ).toBeVisible();
        check("srs-empty-no-early-review", true);
      }
      stage = "learning-navigation-and-persisted-status";
      await page.goto(origin + "/dashboard");
      await expect(
        page.getByRole("link", { name: "Tiếp tục học", exact: true }),
      ).toHaveAttribute("href", /^\/lessons\//);
      const saved = await client
        .from("lesson_progress")
        .select("lesson_id,studied_at,completed_at")
        .eq("user_id", account.userId);
      check("progress-readback-for-ui", !saved.error);
      const allLessonIds = [1, 2, 3, 4].map(
        (n) =>
          JSON.parse(
            fs.readFileSync(
              `content/pilot-hsk1/v1/lessons/lesson-0${n}.json`,
              "utf8",
            ),
          ).id,
      );
      const completedCount = saved.data.filter(
        (r) => r.completed_at && allLessonIds.includes(r.lesson_id),
      ).length;
      await expect(
        page.getByRole("progressbar", { name: "Tiến độ bài học", exact: true }),
      ).toHaveAttribute(
        "aria-valuenow",
        String(Math.round((completedCount / 4) * 100)),
      );
      await page.goto(origin + "/roadmap");
      await expect(
        page.locator(`#lesson-${lessons[2].id} summary`),
      ).toContainText(
        second.data.completed_at
          ? "Đã hoàn thành"
          : "Đã xác nhận học · Chờ quiz đạt",
      );
      check("dashboard-roadmap-use-saved-completion-and-study", true);
      stage = "vocabulary-search-and-empty-state";
      await page.goto(origin + "/vocabulary");
      await page.locator("#q").fill("hanlearn-no-matching-word");
      await page.getByRole("button", { name: "Tìm kiếm", exact: true }).click();
      await expect(
        page.getByRole("heading", {
          name: "Chưa tìm thấy từ phù hợp",
          exact: true,
        }),
      ).toBeVisible();
      await page.getByRole("link", { name: "Xóa bộ lọc", exact: true }).click();
      await expect(
        page.locator("#main-content a[href^='/vocabulary/']"),
      ).toHaveCount(20);
      await page.getByRole("link", { name: "Trang sau", exact: true }).click();
      await expect(page.getByText("Trang 2/3", { exact: true })).toBeVisible();
      check("vocabulary-search-reset-pagination", true);
      stage = "listening-practice-cloud-development";
      await page.goto(origin + "/listening");
      await page.locator('[data-testid="start-listening-btn"]').waitFor();
      check("development-listening-setup-loads", true);
      for (let n = 1; n <= 4; n++) {
        await expect(
          page.locator(`[data-testid="scope-lesson-${n}"]`),
        ).toBeVisible();
      }
      check("development-listening-all-four-lessons-available", true);
      await page.click('[data-testid="count-5"]');
      await page.click('[data-testid="start-listening-btn"]');
      await page.locator('[data-testid="listening-session-screen"]').waitFor();
      check("development-listening-session-starts", true);
      await expect(
        page.locator('[data-testid="question-prompt"]'),
      ).toBeVisible();
      const spoilerBefore = await page
        .locator('[data-testid="reveal-section"]')
        .count();
      check(
        "development-listening-no-spoiler-before-answer",
        spoilerBefore === 0,
      );
      await page.click('[data-testid="option-0"]');
      await page.locator('[data-testid="reveal-section"]').waitFor();
      await expect(
        page.locator('[data-testid="revealed-hanzi"]'),
      ).toBeVisible();
      await expect(
        page.locator('[data-testid="revealed-pinyin"]'),
      ).toBeVisible();
      check("development-listening-reveal-explanation-visible", true);
      await page.click('[data-testid="next-question-btn"]');
      await page.waitForTimeout(200);
      check("development-listening-advances-to-next-question", true);
      stage = "real-browser-relogin";
      await page.locator("header details summary").click();
      await page
        .getByRole("button", { name: "Đăng xuất", exact: true })
        .click();
      await page.waitForURL(origin + "/login");
      check(
        "real-browser-logout",
        (await context.request.get(origin + "/api/me")).status() === 401,
      );
      await page.locator("#email").fill(account.email);
      await page.locator("#password").fill(account.password);
      await page
        .getByRole("button", { name: "Vào không gian học", exact: true })
        .click();
      await page.waitForURL(origin + "/dashboard");
      cookies.clear();
      for (const cookie of await context.cookies())
        cookies.set(cookie.name, cookie.value);
      const reconnected = createServerClient(config.url, config.key, {
        cookies: {
          getAll: () => [...cookies].map(([name, value]) => ({ name, value })),
          setAll: () => {},
        },
      });
      const relogged = await reconnected.auth.getUser();
      check(
        "same-test-user-after-real-browser-login",
        !relogged.error && relogged.data.user?.id === account.userId,
      );
      const refreshed = await reconnected.auth.getSession();
      if (!refreshed.error && refreshed.data.session) {
        account.session = {
          access_token: refreshed.data.session.access_token,
          refresh_token: refreshed.data.session.refresh_token,
        };
        testStore("Write", account);
      }
      await page.goto(
        origin + "/lessons/" + lessons[2].id + "#lesson-progress",
      );
      await expect(
        page.getByRole("button", {
          name: "Xác nhận lại việc học",
          exact: true,
        }),
      ).toBeVisible();
      await expect(
        page.locator(`time[datetime="${first.data.studied_at}"]`),
      ).toBeVisible();
      await page.goto(
        origin +
          "/lessons/" +
          lessons[0].id +
          "/quiz?attempt=" +
          attempt.data.id,
      );
      await expect(
        page.getByRole("heading", { name: /^Kết quả:/ }),
      ).toBeVisible();
      await expect(
        page.getByText(`${attempt.data.correct_count} / 6 câu đúng`, {
          exact: true,
        }),
      ).toBeVisible();
      await expect(
        page.locator(
          `a[aria-current='page'][href*='attempt=${attempt.data.id}']`,
        ),
      ).toHaveCount(1);
      check("study-and-quiz-survive-relogin", true);
      await page.goto(origin + "/review");
      await expect(
        page.locator('[data-review-stat="Lượt ôn hôm nay"]'),
      ).toHaveText(srsTodayThisRun);
      check("srs-progress-survives-relogin", true);
      stage = "rpc-idempotency-and-isolation";
      const otherQuiz = await client
        .from("lesson_quizzes")
        .select("id")
        .eq("lesson_id", lessons[1].id)
        .single();
      account.startKey ??= randomUUID();
      testStore("Write", account);
      const params = {
        p_quiz_id: otherQuiz.data.id,
        p_idempotency_key: account.startKey,
      };
      const a = await client.rpc("start_quiz", params),
        b = await client.rpc("start_quiz", params);
      check(
        "same-start-key-same-attempt",
        !a.error && !b.error && a.data.attemptId === b.data.attemptId,
      );
      const payload = { p_attempt_id: a.data.attemptId, p_answers: {} };
      const submitA = await client.rpc("submit_quiz", payload),
        submitB = await client.rpc("submit_quiz", payload);
      check(
        "identical-submit-retry-same-database-receipt",
        !submitA.error &&
          !submitB.error &&
          JSON.stringify(submitA.data) === JSON.stringify(submitB.data),
      );
      check(
        "empty-answers-fail-in-database",
        submitA.data.passed === false && submitA.data.correctCount === 0,
      );
      for (const table of [
        "lesson_progress",
        "quiz_attempts",
        "quiz_responses",
        "review_cards",
        "review_events",
        "study_sessions",
      ]) {
        const rows = await client
          .from(table)
          .select("user_id")
          .in("user_id", realLearners);
        check(
          "test-cannot-read-real-learners-" + table,
          !rows.error && rows.data.length === 0,
        );
      }
      const keys = await client
        .schema("private")
        .from("quiz_answer_keys")
        .select("question_id")
        .limit(0);
      check(
        "private-answer-schema-http-denied",
        keys.error?.code === "PGRST106",
      );
      await page.setViewportSize({ width: 360, height: 800 });
      await page.goto(origin + "/review");
      await expect(
        page.locator('[data-review-stat="Lượt ôn hôm nay"]'),
      ).toHaveText(srsTodayThisRun);
      check(
        "mobile-review-no-horizontal-overflow",
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      );
      await page.goto(origin + "/lessons/" + lessons[0].id + "/quiz");
      await page.getByRole("heading", { level: 1 }).waitFor();
      check(
        "mobile-quiz-no-horizontal-overflow",
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      );
      await Promise.all(pending);
      check("no-private-key-fields-in-browser-responses", !privateField);
      report.status = "LIVE_PASS";
    }
  }
} catch (error) {
  report.stoppedAt = stage;
  report.code = /^[A-Z_]+$/.test(error.message)
    ? error.message
    : "DEVELOPMENT_TEST_FAILED";
  if (page) {
    report.failureType = error.constructor.name;
    report.strictLocator = error.message.includes("strict mode violation");
    const knownButtons = [
      "Tôi đã học nội dung này",
      "Xác nhận lại việc học",
      "Đang xác nhận học…",
      "Thử xác nhận lại an toàn",
      "Bắt đầu quiz",
      "Nộp bài",
      "Xác nhận nộp",
      "Đọc lại kết quả",
      "Làm lại với lượt mới",
      "Thử lại yêu cầu cũ",
    ];
    const buttonTexts = await page
      .locator("#main-content button")
      .allTextContents()
      .catch(() => []);
    report.knownButtons = knownButtons.filter((label) =>
      buttonTexts.some((text) => text.trim() === label),
    );
    report.lessonTitleNodes = await page
      .locator("#lesson-title")
      .count()
      .catch(() => 0);
    report.pagePath = new URL(page.url()).pathname;
    report.uiState = {
      studyConfirm: await page
        .getByRole("button", { name: "Xác nhận lại việc học", exact: true })
        .count()
        .catch(() => 0),
      studyRetry: await page
        .getByRole("button", { name: "Thử xác nhận lại an toàn", exact: true })
        .count()
        .catch(() => 0),
      alerts: await page
        .getByRole("alert")
        .count()
        .catch(() => 0),
      quizReadResultButton: await page
        .getByRole("button", { name: "Đọc lại kết quả", exact: true })
        .count()
        .catch(() => 0),
      pageErrorBoundary: await page
        .getByRole("heading", { name: "Chưa tải được dữ liệu", exact: true })
        .count()
        .catch(() => 0),
    };
    const alert = await page
      .getByRole("alert")
      .first()
      .innerText()
      .catch(() => "");
    report.alertKind = alert.includes("Mất kết nối")
      ? "NETWORK_CATCH"
      : alert.includes("Chưa xác định được kết quả")
        ? "SERVER_RETRY"
        : alert.includes("Bộ nhớ phiên")
          ? "SESSION_STORAGE"
          : alert.includes("Không đọc được")
            ? "RECOVERY_STORAGE"
            : alert.includes("Yêu cầu khôi phục")
              ? "INVALID_RECOVERY"
              : alert.includes("Có yêu cầu chưa xác định")
                ? "PENDING_RECOVERY"
                : alert.includes("Nội dung bài học chưa đủ")
                  ? "INVALID_LESSON"
                  : alert.includes("Chưa đọc lại được kết quả")
                    ? "RESULT_READBACK"
                    : "OTHER_GENERIC";
  }
} finally {
  // Deliberately retain this dedicated test session; do not revoke it every run.
  if (context) await context.close();
  if (browser) await browser.close();
  if (server) server.kill();
  fs.mkdirSync(".local/development", { recursive: true });
  fs.writeFileSync(
    `.local/development/${readOnly ? "last-read" : uxReview ? "last-ux" : "last-test"}.json`,
    JSON.stringify(report, null, 2),
  );
}
console.log(
  JSON.stringify({
    status: report.status,
    checks: report.checks.length,
    failed: report.checks.filter((c) => c.status === "FAIL").map((c) => c.name),
    code: report.code,
    stoppedAt: report.stoppedAt,
  }),
);
if (!["LIVE_PASS", "READ_PASS", "UX_REVIEW_PASS"].includes(report.status))
  process.exitCode = 2;
