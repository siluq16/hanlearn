import Link from "next/link";
import { Award, ArrowRight, Clock } from "lucide-react";
import { PageHeading } from "@/components/page-heading";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { HSK1_UNITS } from "@/features/courses/constants";

export const metadata = { title: "Kiểm tra & Đánh giá Năng lực" };

export default async function ExamOverviewPage() {
  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <PageHeading
        eyebrow="Đánh giá & Chuẩn hóa Năng lực"
        title="Hệ thống Kiểm tra & Đánh giá HSK 1"
        description="Đo lường sự tiến bộ chuẩn xác qua 6 bài Unit Test theo từng chặng và Đề thi thử HSK 1 chính thức."
      />

      {/* Official Mock Exam Banner */}
      <Card className="border-primary/40 bg-gradient-to-br from-primary/10 via-primary/5 to-card shadow-sm">
        <CardContent className="p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="flex items-center gap-2">
              <Badge className="bg-primary text-primary-foreground font-semibold">
                ĐỀ THI TỔNG HỢP CUỐI KHÓA
              </Badge>
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <Clock className="size-3.5" /> 35 phút
              </span>
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-foreground">
              Đề thi thử HSK 1 Chuẩn CTI (40 câu)
            </h3>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              Mô phỏng 100% định dạng đề thi thực tế: 20 câu Nghe (100 điểm) + 20 câu Đọc (100 điểm). Điểm đạt tối thiểu 120/200 điểm.
            </p>
          </div>

          <Link
            href="/exam/hsk1"
            className="inline-flex min-h-12 items-center px-6 rounded-xl bg-primary text-sm font-semibold text-primary-foreground hover:opacity-90 transition-opacity gap-2 shrink-0 shadow-md"
          >
            <span>Làm đề Thi thử HSK 1</span>
            <ArrowRight className="size-4" />
          </Link>
        </CardContent>
      </Card>

      {/* 6 Unit Tests Grid */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Award className="size-5 text-primary" />
          <h2 className="text-lg font-bold text-foreground">
            6 Bài Kiểm tra Unit Test (Mastery 80%)
          </h2>
        </div>
        <p className="text-xs text-muted-foreground">
          Mỗi Unit Test gồm 20 câu hỏi tổng hợp (Nghe, Từ vựng, Ngữ pháp, Đọc hiểu) trong 20 phút.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {HSK1_UNITS.map((u) => (
            <Card key={u.unit_id} className="border-border hover:border-primary/40 transition-colors">
              <CardContent className="p-5 flex flex-col justify-between h-full space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <Badge className="border border-border bg-transparent text-xs font-semibold">
                      UNIT {u.unit_number}
                    </Badge>
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="size-3.5" /> 20 phút · 20 câu
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-foreground">
                    {u.title}
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {u.topic}
                  </p>
                </div>

                <div className="pt-2 border-t border-border/60 flex items-center justify-between">
                  <span className="text-[11px] text-muted-foreground">
                    Gồm {u.lesson_slugs.length} bài học
                  </span>
                  <Link
                    href={`/exam/unit/${u.unit_number}`}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/10 text-xs font-semibold text-primary hover:bg-primary/20 transition-colors"
                  >
                    <span>Làm Unit Test {u.unit_number}</span>
                    <ArrowRight className="size-3.5" />
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
