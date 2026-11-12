import { ArrowLeft, Clock3 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import type { LessonBundle } from "../types";
import { LessonReader } from "./lesson-reader";
import { ContentProvenance } from "./provenance";

function SavedDate({ value }: { value: string | null }) {
  return value ? (
    <time dateTime={value}>
      {new Intl.DateTimeFormat("vi-VN", {
        dateStyle: "medium",
        timeStyle: "short",
        timeZone: "Asia/Ho_Chi_Minh",
      }).format(new Date(value))}
    </time>
  ) : (
    <>Chưa ghi nhận</>
  );
}
export function LessonView({ bundle }: { bundle: LessonBundle }) {
  const { lesson, course, unit, syllabus, progress } = bundle;
  return (
    <article aria-labelledby="lesson-title" className="min-w-0">
      <a
        href="/roadmap"
        className="mb-6 inline-flex min-h-11 items-center gap-2 text-sm text-primary underline underline-offset-4"
      >
        <ArrowLeft size={16} aria-hidden="true" />
        Về lộ trình
      </a>
      <header className="mb-8 space-y-4">
        <Badge>HSK {course.hskLevel}</Badge>
        <p className="[overflow-wrap:anywhere] text-sm leading-7 text-muted-foreground">
          {syllabus.title} · {course.title} · {unit.title}
        </p>
        <h1
          id="lesson-title"
          className="[overflow-wrap:anywhere] text-3xl font-semibold leading-tight tracking-tight sm:text-4xl"
        >
          {lesson.title}
        </h1>
        {lesson.objectiveVi && (
          <p className="max-w-3xl whitespace-pre-wrap [overflow-wrap:anywhere] text-sm leading-8 text-muted-foreground">
            {lesson.objectiveVi}
          </p>
        )}
        <p className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock3 size={16} aria-hidden="true" />
          Dự kiến {lesson.estimatedMinutes} phút
        </p>
      </header>
      <div className="grid min-w-0 gap-7 lg:grid-cols-[minmax(0,1fr)_minmax(240px,300px)]">
        <LessonReader
          content={bundle.content}
          vocabulary={bundle.vocabulary}
          grammar={bundle.grammar}
        />
        <aside className="min-w-0 space-y-5 lg:order-none">
          <Card>
            <CardContent className="space-y-4 p-5">
              <h2 className="text-base font-semibold">Tiến độ đã lưu</h2>
              <Badge>
                {progress.completedAt
                  ? "Đã hoàn thành"
                  : progress.studiedAt
                    ? "Đã xác nhận học"
                    : "Chưa xác nhận học"}
              </Badge>
              <dl className="space-y-3 text-xs leading-6">
                <div>
                  <dt className="text-muted-foreground">Xác nhận học</dt>
                  <dd>
                    <SavedDate value={progress.studiedAt} />
                  </dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Hoàn thành</dt>
                  <dd>
                    <SavedDate value={progress.completedAt} />
                  </dd>
                </div>
              </dl>
              <p className="text-xs leading-6 text-muted-foreground">
                Hoàn thành bài học không đồng nghĩa với thành thạo từ vựng.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5">
              <h2 className="text-base font-semibold">Nguồn bài học</h2>
              <ContentProvenance value={lesson.provenance} />
              <details className="mt-3 text-xs">
                <summary className="flex min-h-11 cursor-pointer items-center font-medium">
                  Syllabus, course và unit
                </summary>
                {[syllabus, course, unit].map((parent) => (
                  <div key={parent.id} className="mt-3">
                    <p className="[overflow-wrap:anywhere] font-medium">
                      {parent.title}
                    </p>
                    <ContentProvenance value={parent.provenance} />
                  </div>
                ))}
              </details>
            </CardContent>
          </Card>
        </aside>
      </div>
    </article>
  );
}
