import { createRoot } from "react-dom/client";
import { useEffect, useRef, useState } from "react";
import "@/app/globals.css";
import "@fontsource-variable/inter";
import "@fontsource/noto-sans-sc/400.css";
import "./preview.css";
import { LessonReader } from "@/features/lessons/components/lesson-reader";
import { Button } from "@/components/ui/button";
import data from "virtual:hanlearn-hsk1-preview";

function selected() {
  const n = Number(new URLSearchParams(location.search).get("lesson"));
  return Number.isInteger(n) && n >= 1 && n <= 4 ? n - 1 : 0;
}
type Note = {
  lessonId: string;
  sectionId: string;
  category: string;
  text: string;
};
function App() {
  const [index, setIndex] = useState(selected);
  const [notes, setNotes] = useState<Note[]>([]);
  const [text, setText] = useState("");
  const [sectionId, setSectionId] = useState("");
  const [category, setCategory] = useState("content");
  const heading = useRef<HTMLHeadingElement>(null);
  const lesson = data.lessons[index];
  useEffect(() => {
    const back = () => {
      setIndex(selected());
      setSectionId("");
    };
    addEventListener("popstate", back);
    return () => removeEventListener("popstate", back);
  }, []);
  function navigate(next: number) {
    history.pushState(null, "", `?lesson=${next + 1}`);
    setIndex(next);
    setSectionId("");
    requestAnimationFrame(() => {
      heading.current?.focus();
      heading.current?.scrollIntoView();
    });
  }
  function download() {
    const blob = new Blob(
      [
        JSON.stringify(
          {
            packageId: data.packageId,
            revision: data.revision,
            manifestHash: data.manifestHash,
            snapshotHash: data.snapshotHash,
            notes,
          },
          null,
          2,
        ),
      ],
      { type: "application/json" },
    );
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "hanlearn-local-preview-notes-r3.json";
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  return (
    <main className="mx-auto max-w-5xl space-y-8 px-4 py-8 sm:px-8">
      <header className="space-y-4 rounded-2xl border border-primary/20 bg-secondary p-6">
        <p className="text-xs font-bold tracking-widest text-primary">
          LOCAL CONTENT PREVIEW
        </p>
        <p className="text-2xl font-bold">HanLearn · HSK 1 Pilot</p>
        <p className="text-sm leading-7">
          Bản nháp r3 · Chưa published · Không ghi tiến độ. Nội dung hỗ trợ tự
          học, chưa được kiểm duyệt ngôn ngữ độc lập.
        </p>
        <p className="text-sm">
          4 bài · 29 phần · {data.vocabularyCount} từ vựng · {data.grammarCount}{" "}
          điểm ngữ pháp
        </p>
        <p className="text-sm text-muted-foreground">
          Chỉ đọc nội dung trên máy này. Không có chấm quiz, đồng bộ tài khoản
          hoặc xác nhận hoàn thành.
        </p>
      </header>
      <nav aria-label="Danh sách bài học" className="grid gap-3 sm:grid-cols-2">
        {data.lessons.map((l, i) => (
          <button
            key={l.id}
            type="button"
            aria-current={i === index ? "page" : undefined}
            onClick={() => navigate(i)}
            className={`min-h-24 rounded-xl border p-4 text-left focus-visible:outline-2 focus-visible:outline-primary ${i === index ? "border-primary bg-secondary" : "border-border bg-card"}`}
          >
            <span className="block text-xs text-muted-foreground">
              Bài {i + 1} · {l.estimatedMinutes} phút · {l.newWordCount} từ mới
            </span>
            <span className="mt-2 block font-semibold">{l.title}</span>
          </button>
        ))}
      </nav>
      <article className="space-y-6">
        <header className="space-y-3 border-b border-border pb-6">
          <p className="text-sm text-primary">
            Bài {index + 1} / 4 · {lesson.estimatedMinutes} phút dự kiến
          </p>
          <h1
            ref={heading}
            tabIndex={-1}
            className="text-2xl font-bold leading-relaxed outline-offset-4 sm:text-3xl"
          >
            {lesson.title}
          </h1>
          <p className="text-sm leading-8">{lesson.objectiveVi}</p>
        </header>
        <LessonReader
          content={lesson.content}
          vocabulary={lesson.vocabulary}
          grammar={lesson.grammar}
        />
      </article>
      <nav
        aria-label="Chuyển bài"
        className="flex flex-wrap justify-between gap-3 border-t border-border pt-6"
      >
        <Button disabled={index === 0} onClick={() => navigate(index - 1)}>
          ← Bài trước
        </Button>
        <Button disabled={index === 3} onClick={() => navigate(index + 1)}>
          Bài tiếp →
        </Button>
      </nav>
      <section
        aria-label="Ghi chú trải nghiệm"
        className="space-y-4 rounded-2xl border border-border bg-card p-5"
      >
        <h2 className="text-xl font-semibold">Ghi chú trải nghiệm</h2>
        <p className="text-sm leading-7">
          Ghi lỗi nội dung hoặc giao diện để xem lại. Ghi chú chỉ ở bộ nhớ tab,
          mất khi tải lại; hãy tải file nếu cần giữ. Đây không phải hồ sơ phê
          duyệt nội dung.
        </p>
        <label className="block text-sm">
          Loại ghi chú
          <select
            className="mt-2 block min-h-11 w-full rounded border border-border bg-background p-2"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="content">Nội dung</option>
            <option value="ui">Giao diện</option>
          </select>
        </label>
        <label className="block text-sm">
          Vị trí trong bài hiện tại
          <select
            className="mt-2 block min-h-11 w-full rounded border border-border bg-background p-2"
            value={sectionId}
            onChange={(e) => setSectionId(e.target.value)}
          >
            <option value="">Toàn bài {index + 1}</option>
            {lesson.content.sections.map((s) => (
              <option key={s.id} value={s.id}>
                {s.title}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-sm">
          Nhận xét
          <textarea
            maxLength={2000}
            rows={3}
            className="mt-2 block w-full rounded border border-border bg-background p-3"
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
        </label>
        <div className="flex flex-wrap gap-3">
          <Button
            disabled={!text.trim()}
            onClick={() => {
              setNotes([
                ...notes,
                { lessonId: lesson.id, sectionId, category, text: text.trim() },
              ]);
              setText("");
            }}
          >
            Thêm ghi chú
          </Button>
          <Button variant="outline" disabled={!notes.length} onClick={download}>
            Tải ghi chú
          </Button>
        </div>
        <p role="status" className="text-sm">
          {notes.length} ghi chú trong phiên này
        </p>
        <ul className="space-y-3">
          {notes.map((n, i) => (
            <li
              key={i}
              className="whitespace-pre-wrap break-words rounded bg-muted p-3 text-sm"
            >
              Bài {data.lessons.findIndex((l) => l.id === n.lessonId) + 1} ·{" "}
              {n.category === "ui" ? "Giao diện" : "Nội dung"}: {n.text}
            </li>
          ))}
        </ul>
      </section>
      <footer className="break-all text-xs leading-6 text-muted-foreground">
        Package {data.packageId} · r3
        <br />
        Snapshot SHA-256: {data.snapshotHash}
      </footer>
    </main>
  );
}
createRoot(document.getElementById("root")!).render(<App />);
