import { createRoot } from "react-dom/client";
import "@/app/globals.css";
import "@fontsource-variable/inter";
import "@fontsource/noto-sans-sc/400.css";
import { QuizPlayer } from "@/features/quizzes/components/quiz-player";
import { quizFixture, activeQuiz, submittedQuiz } from "../quiz";
import type { QuizView, QuizResult } from "@/features/quizzes/contracts";
const params = new URLSearchParams(location.search);
let scenario = params.get("scenario") ?? "pass";
const db: {
  starts: Record<string, string>;
  views: Record<string, QuizView>;
  submissions: Record<string, string>;
} = JSON.parse(
  sessionStorage.getItem("syntheticQuizDB") ??
    '{"starts":{},"views":{},"submissions":{}}',
);
const save = () =>
  sessionStorage.setItem("syntheticQuizDB", JSON.stringify(db));
const calls = { start: [] as unknown[], submit: [] as unknown[] };
Object.assign(window, { quizCalls: calls });
const initial = db.views[params.get("attempt") ?? ""] ?? quizFixture();
const delay = () => new Promise((r) => setTimeout(r, 300));
const conflict: QuizResult = {
  ok: false,
  error: {
    code: "CONFLICT",
    message: "Đã thay đổi. Đọc lại kết quả đã lưu.",
    retryable: false,
    outcomeUnknown: true,
  },
};
const enabled = scenario !== "blocked";
async function start(input: {
  lessonId: string;
  startKey: string;
}): Promise<QuizResult> {
  calls.start.push(input);
  await delay();
  let id = db.starts[input.startKey];
  const created = !id;
  if (!id) {
    id = crypto.randomUUID();
    db.starts[input.startKey] = id;
    const view = activeQuiz();
    view.attempt!.id = id;
    view.history = [view.attempt!];
    if (scenario === "studied")
      view.progress.studiedAt = "2026-11-13T01:00:00Z";
    db.views[id] = view;
    save();
  }
  if (scenario === "start-loss" && created) {
    scenario = "pass";
    throw Error("synthetic lost response");
  }
  return { ok: true, view: structuredClone(db.views[id]) };
}
async function submit(input: {
  lessonId: string;
  attemptId: string;
  answers: Record<string, number>;
}): Promise<QuizResult> {
  calls.submit.push(structuredClone(input));
  await delay();
  const canonical = JSON.stringify(Object.entries(input.answers).sort());
  if (
    db.submissions[input.attemptId] &&
    db.submissions[input.attemptId] !== canonical
  )
    return conflict;
  if (!db.submissions[input.attemptId]) {
    const view = submittedQuiz(scenario !== "fail");
    view.attempt!.id = input.attemptId;
    view.history = [view.attempt!];
    view.responses = view.responses.map((r) => ({
      ...r,
      answer_index: input.answers[r.question_id] ?? null,
    }));
    const old = db.views[input.attemptId];
    view.progress = old.progress;
    if (old.progress.studiedAt && view.attempt!.passed)
      view.progress.completedAt = "2026-11-13T01:01:00Z";
    db.views[input.attemptId] = view;
    db.submissions[input.attemptId] = canonical;
    save();
  }
  if (scenario === "submit-loss") {
    scenario = "pass";
    throw Error("synthetic lost response");
  }
  return { ok: true, view: structuredClone(db.views[input.attemptId]) };
}
async function refresh(input: {
  lessonId: string;
  attemptId?: string;
}): Promise<QuizResult> {
  return {
    ok: true,
    view: structuredClone(
      input.attemptId ? db.views[input.attemptId] : quizFixture(),
    ),
  };
}
createRoot(document.getElementById("root")!).render(
  <main className="mx-auto max-w-3xl space-y-6 px-4 py-8">
    <p className="font-bold">SYNTHETIC QUIZ TEST · Không Cloud</p>
    <label>
      Kịch bản kiểm thử
      <select
        aria-label="Kịch bản kiểm thử"
        defaultValue={scenario}
        onChange={(e) => {
          scenario = e.target.value;
        }}
        className="min-h-11 border p-2"
      >
        <option value="pass">Pass receipt</option>
        <option value="fail">Fail receipt</option>
        <option value="start-loss">Lost start response</option>
        <option value="submit-loss">Lost submit response</option>
      </select>
    </label>
    <QuizPlayer
      initial={initial}
      enabled={enabled}
      start={start}
      submit={submit}
      refresh={refresh}
    />
  </main>,
);
