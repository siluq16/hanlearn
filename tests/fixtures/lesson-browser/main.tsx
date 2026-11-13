// Test entry point, never imported by src/app or exposed by the Next application.
import { createRoot } from "react-dom/client";
import { useState } from "react";
import "@/app/globals.css";
import "@fontsource-variable/inter";
import "@fontsource/noto-sans-sc/400.css";
import { lessonFixture, lessonIds } from "../lesson";
import { buildLessonBundle } from "@/features/lessons/model";
import { LessonView } from "@/features/lessons/components/lesson-view";
import {
  InvalidLessonContent,
  LessonUnavailable,
  LessonLoading,
} from "@/features/lessons/components/lesson-states";
import ErrorPage from "@/app/(app)/error";
import { StudyConfirmation } from "@/features/lessons/components/study-confirmation";
import type {
  StudyProgress,
  StudyResult,
} from "@/features/lessons/study-contract";
function FixtureApp() {
  const [recovered, setRecovered] = useState(false);
  const modeKey = new URLSearchParams(location.search).get("mode") ?? "";
  const [studyProgress, setStudyProgress] = useState<StudyProgress>(() =>
    JSON.parse(
      sessionStorage.getItem(`synthetic-study:${modeKey}`) ??
        '{"studiedAt":null,"completedAt":null}',
    ),
  );
  const [attempts, setAttempts] = useState(0);
  const mode = recovered
      ? "empty"
      : new URLSearchParams(location.search).get("mode"),
    rows = lessonFixture();
  if (mode?.startsWith("study"))
    Object.assign(rows.progress, {
      studied_at: studyProgress.studiedAt,
      completed_at: studyProgress.completedAt,
    });
  async function syntheticConfirmation(): Promise<StudyResult> {
    setAttempts((n) => n + 1);
    await new Promise((resolve) => setTimeout(resolve, 300));
    // A test-only persisted store; never a product offline progress implementation.
    const persisted: StudyProgress = JSON.parse(
      sessionStorage.getItem(`synthetic-study:${modeKey}`) ??
        '{"studiedAt":null,"completedAt":null}',
    );
    const progress = {
      studiedAt: persisted.studiedAt ?? "2026-11-13T02:00:00Z",
      completedAt: mode === "study-complete" ? "2026-11-13T02:01:00Z" : null,
    };
    sessionStorage.setItem(
      `synthetic-study:${modeKey}`,
      JSON.stringify(progress),
    );
    if (mode === "study-retry" && attempts === 0)
      throw Error("synthetic lost response after commit");
    if (mode !== "study-no-render") setStudyProgress(progress);
    return { ok: true, progress };
  }
  if (mode === "unavailable") rows.unit.status = "draft";
  if (mode === "malformed")
    Object.assign(rows.lesson, {
      content: { version: 1, sections: [], answerKey: "private-test-marker" },
    });
  if (mode === "empty") {
    rows.lesson.content.sections = [];
    rows.vocabulary = [];
    rows.grammar = [];
    rows.vocabularyLinks = [];
    rows.grammarLinks = [];
  }
  if (mode === "long") {
    rows.lesson.title = "X".repeat(300);
    rows.unit.title = "U".repeat(300);
    rows.vocabulary[0].meaning_vi = "W".repeat(1500);
  }
  const data = buildLessonBundle(rows, lessonIds.user);
  return (
    <main className="mx-auto max-w-7xl p-5 sm:p-9">
      <p className="mb-8 rounded-xl bg-warning/20 p-4 text-sm">
        SYNTHETIC LOCAL TEST — không phải giáo trình HSK hoặc bằng chứng Cloud.
      </p>
      {mode === "loading" ? (
        <LessonLoading />
      ) : mode === "error" ? (
        <ErrorPage
          reset={() => {
            setRecovered(true);
          }}
        />
      ) : !data ? (
        <LessonUnavailable />
      ) : data.kind === "invalid-content" ? (
        <InvalidLessonContent />
      ) : (
        <LessonView
          bundle={data.bundle}
          studyConfirmation={
            mode?.startsWith("study") ? (
              <StudyConfirmation
                lessonId={lessonIds.lesson}
                progress={data.bundle.progress}
                enabled={mode !== "study-blocked"}
                confirm={syntheticConfirmation}
              />
            ) : undefined
          }
        />
      )}
    </main>
  );
}
createRoot(document.getElementById("root")!).render(<FixtureApp />);
