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
function FixtureApp() {
  const [recovered, setRecovered] = useState(false);
  const mode = recovered
      ? "empty"
      : new URLSearchParams(location.search).get("mode"),
    rows = lessonFixture();
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
        <LessonView bundle={data.bundle} />
      )}
    </main>
  );
}
createRoot(document.getElementById("root")!).render(<FixtureApp />);
