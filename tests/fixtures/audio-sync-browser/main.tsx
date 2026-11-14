import { createRoot } from "react-dom/client";
import "@/app/globals.css";
import "@fontsource-variable/inter";
import "@fontsource/noto-sans-sc/400.css";
import { lessonFixture, lessonIds } from "../lesson";
import { buildLessonBundle } from "@/features/lessons/model";
import { LessonView } from "@/features/lessons/components/lesson-view";
import { ReviewPlayer } from "@/features/review/components/review-player";
import { MandarinSpeedToggle, MandarinAudioButton } from "@/components/mandarin-audio";
import type { ReviewView } from "@/features/review/contracts";

const reviewSeed: ReviewView = {
  scope: "synthetic-only",
  dueCount: 3,
  reviewedToday: 0,
  unsupportedAudio: 0,
  cards: [
    {
      id: "card-1",
      vocabularyId: "vocab-1",
      version: 0,
      direction: "hanzi_to_vi",
      hanzi: "你好",
      pinyin: "nǐ hǎo",
      meaning: "xin chào",
      example: { hanzi: "你好！", pinyin: "Nǐ hǎo!", meaning: "Xin chào!" },
    },
    {
      id: "card-2",
      vocabularyId: "vocab-2",
      version: 0,
      direction: "vi_to_hanzi",
      hanzi: "谢谢",
      pinyin: "xièxie",
      meaning: "cảm ơn",
      example: { hanzi: "非常感谢！", pinyin: "Fēicháng gǎnxiè!", meaning: "Rất cảm ơn!" },
    },
  ],
};

function VocabularySyncMock() {
  const words = [
    { id: "1", hanzi: "你好", pinyin: "nǐ hǎo", meaning: "xin chào" },
    { id: "2", hanzi: "谢谢", pinyin: "xièxie", meaning: "cảm ơn" },
    { id: "3", hanzi: "再见", pinyin: "zàijiàn", meaning: "tạm biệt" },
  ];

  return (
    <div className="space-y-4" data-testid="vocabulary-view">
      <div className="flex items-center justify-between border-b pb-3">
        <h2 className="text-xl font-bold">Thư viện từ vựng ({words.length} từ)</h2>
        <MandarinSpeedToggle />
      </div>
      <div className="grid gap-3">
        {words.map((w) => (
          <div key={w.id} className="flex items-center justify-between rounded-xl border p-4 bg-card" data-testid={`vocab-item-${w.id}`}>
            <div>
              <span className="text-xl font-serif mr-3">{w.hanzi}</span>
              <span className="text-sm text-muted-foreground mr-3">{w.pinyin}</span>
              <span className="text-sm">{w.meaning}</span>
            </div>
            <MandarinAudioButton text={w.hanzi} showSlow label={w.hanzi} />
          </div>
        ))}
      </div>
    </div>
  );
}

function AudioSyncApp() {
  const currentView = new URLSearchParams(window.location.search).get("view") || "lesson";
  const bundleResult = buildLessonBundle(lessonFixture(), lessonIds.user);

  function navigateTo(viewName: string) {
    const url = new URL(window.location.href);
    url.searchParams.set("view", viewName);
    window.location.href = url.toString();
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <nav className="flex items-center gap-3 border-b pb-4">
        <button
          type="button"
          onClick={() => navigateTo("lesson")}
          data-testid="nav-lesson"
          className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
            currentView === "lesson" ? "bg-primary text-primary-foreground" : "bg-muted hover:bg-muted/80"
          }`}
        >
          1. Lesson
        </button>
        <button
          type="button"
          onClick={() => navigateTo("vocabulary")}
          data-testid="nav-vocabulary"
          className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
            currentView === "vocabulary" ? "bg-primary text-primary-foreground" : "bg-muted hover:bg-muted/80"
          }`}
        >
          2. Vocabulary
        </button>
        <button
          type="button"
          onClick={() => navigateTo("review")}
          data-testid="nav-review"
          className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
            currentView === "review" ? "bg-primary text-primary-foreground" : "bg-muted hover:bg-muted/80"
          }`}
        >
          3. Review
        </button>
      </nav>

      <main>
        {currentView === "lesson" && bundleResult && bundleResult.kind === "ready" && (
          <div data-testid="lesson-container">
            <LessonView bundle={bundleResult.bundle} />
          </div>
        )}
        {currentView === "vocabulary" && <VocabularySyncMock />}
        {currentView === "review" && (
          <div data-testid="review-container">
            <ReviewPlayer
              initial={reviewSeed}
              enabled={true}
              submit={async () => ({
                ok: true,
                view: reviewSeed,
                receipt: {
                  status: "ok",
                  cardId: "card-1",
                  version: 1,
                  nextDueAt: new Date(Date.now() + 86400000).toISOString(),
                  intervalDays: 1,
                  newState: "review",
                  reviewedAt: new Date().toISOString(),
                  algorithmVersion: "hl-sm2-v1",
                },
              })}
              refresh={async () => ({ ok: true, view: structuredClone(reviewSeed) })}
            />
          </div>
        )}
      </main>
    </div>
  );
}

createRoot(document.getElementById("root")!).render(<AudioSyncApp />);
