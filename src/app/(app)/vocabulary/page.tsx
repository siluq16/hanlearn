import Link from "next/link";
import { Search, ArrowLeft, ArrowRight, ArrowUpRight } from "lucide-react";
import { vocabularyFiltersSchema } from "@/features/vocabulary/schemas";
import { searchVocabulary } from "@/features/vocabulary/queries";
import { PageHeading } from "@/components/page-heading";
import { EmptyState } from "@/components/empty-state";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
export const metadata = { title: "Từ vựng" };
export default async function VocabularyPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const raw = {
    q: typeof params.q === "string" ? params.q : "",
    level: typeof params.level === "string" ? params.level : "",
    page: typeof params.page === "string" ? params.page : 1,
  };
  const parsed = vocabularyFiltersSchema.safeParse(raw);
  const filters = parsed.success
    ? parsed.data
    : { q: "", level: "" as const, page: 1 };
  const result = await searchVocabulary(filters);
  const totalPages = Math.ceil(result.total / 20);
  function pageUrl(page: number) {
    const query = new URLSearchParams({
      q: filters.q,
      level: String(filters.level ?? ""),
      page: String(page),
    });
    return `/vocabulary?${query}`;
  }
  const masteryLabels: Record<string, string> = {
    mastered: "Đã vững",
    learning: "Đang học",
    introduced: "Đã tiếp cận",
    not_introduced: "Chưa học",
  };
  return (
    <>
      <PageHeading
        eyebrow="Thư viện của bạn"
        title="Tích lũy từng từ một."
        description="Tra cứu chữ Hán, Pinyin và nghĩa tiếng Việt. Nội dung chỉ xuất hiện khi đã được duyệt và phát hành."
      />
      <Card className="mb-6 p-4 sm:p-5">
        <form action="/vocabulary" className="flex flex-col gap-3 sm:flex-row">
          <div className="flex-1">
            <label htmlFor="q" className="sr-only">
              Tìm chữ Hán, Pinyin hoặc nghĩa tiếng Việt
            </label>
            <div className="relative">
              <Search
                className="absolute left-3 top-4 size-4 text-muted-foreground"
                aria-hidden="true"
              />
              <Input
                id="q"
                name="q"
                defaultValue={filters.q}
                maxLength={100}
                placeholder="Tìm chữ Hán, Pinyin hoặc nghĩa…"
                className="pl-10"
              />
            </div>
          </div>
          <label className="sr-only" htmlFor="level">
            Cấp HSK giới thiệu từ
          </label>
          <select
            id="level"
            name="level"
            defaultValue={filters.level ?? ""}
            className="min-h-12 rounded-xl border border-input bg-background px-3 text-sm"
          >
            <option value="">Tất cả cấp HSK</option>
            {Array.from({ length: 9 }, (_, i) => (
              <option key={i + 1} value={i + 1}>
                HSK {i + 1}
              </option>
            ))}
          </select>
          <Button type="submit" className="h-12">
            <Search />
            Tìm kiếm
          </Button>
        </form>
        {!parsed.success && (
          <p role="alert" className="mt-3 text-sm text-destructive">
            Bộ lọc chưa hợp lệ. Đã hiển thị danh sách mặc định.
          </p>
        )}
      </Card>
      <div className="mb-4 flex flex-wrap justify-between gap-2 text-xs text-muted-foreground">
        <span>
          {result.syllabus
            ? `${result.total} từ · ${result.syllabus.code}`
            : "Chưa có syllabus được phát hành"}
        </span>
        {result.total > 0 && <span>20 từ mỗi trang</span>}
        {(filters.q || filters.level) && result.items.length > 0 && (
          <Link
            href="/vocabulary"
            className="inline-flex min-h-11 items-center text-primary underline"
          >
            Xóa bộ lọc
          </Link>
        )}
      </div>
      {result.items.length ? (
        <>
          <div className="overflow-hidden rounded-2xl border border-border bg-card">
            <div className="hidden grid-cols-[1fr_1fr_1.5fr_1fr] gap-4 border-b border-border bg-muted/60 px-6 py-4 text-xs font-medium text-muted-foreground md:grid">
              <span>Chữ Hán</span>
              <span>Pinyin</span>
              <span>Nghĩa tiếng Việt</span>
              <span>Cấp độ / Trạng thái</span>
            </div>
            {result.items.map((v) => (
              <Link
                href={`/vocabulary/${v.id}`}
                key={v.id}
                className="grid gap-3 border-b border-border px-5 py-5 last:border-0 hover:bg-muted/50 md:grid-cols-[1fr_1fr_1.5fr_1fr] md:items-center md:gap-4 md:px-6"
              >
                <span className="hanzi flex items-center gap-3 text-2xl">
                  {v.simplified}
                  <ArrowUpRight className="size-4 text-muted-foreground md:hidden" />
                </span>
                <span className="text-sm text-primary">{v.pinyin_marked}</span>
                <span className="text-sm leading-6">{v.meaning_vi}</span>
                <span className="flex flex-wrap items-center gap-2">
                  <Badge>HSK {v.introduced_level}</Badge>
                  <span className="text-xs text-muted-foreground">
                    {masteryLabels[v.mastery] ?? "Chưa học"}
                  </span>
                </span>
              </Link>
            ))}
          </div>
        </>
      ) : (
        <EmptyState
          title={
            result.total > 0
              ? "Trang này không có kết quả"
              : filters.q || filters.level
                ? "Chưa tìm thấy từ phù hợp"
                : "Thư viện đang chờ nội dung"
          }
          description={
            result.total > 0
              ? "Hãy quay lại trang đầu để xem danh sách."
              : result.syllabus
                ? "Thử từ khóa khác hoặc bỏ bộ lọc. Từ mới sẽ xuất hiện sau khi được kiểm duyệt."
                : "Chưa có nội dung được phát hành. Dữ liệu thử nghiệm không được hiển thị như giáo trình thật."
          }
        >
          {(filters.q || filters.level || filters.page > 1) && (
            <Button asChild variant="outline">
              <Link href="/vocabulary">
                {filters.q || filters.level ? "Xóa bộ lọc" : "Về trang đầu"}
              </Link>
            </Button>
          )}
        </EmptyState>
      )}
      {totalPages > 1 && (
        <nav
          aria-label="Phân trang từ vựng"
          className="mt-6 grid grid-cols-[1fr_auto_1fr] items-center gap-2"
        >
          {filters.page > 1 ? (
            <Button
              asChild
              variant="outline"
              className="justify-self-start px-3 sm:px-4"
            >
              <Link href={pageUrl(filters.page - 1)} aria-label="Trang trước">
                <ArrowLeft />
                <span>
                  <span className="hidden sm:inline">Trang </span>trước
                </span>
              </Link>
            </Button>
          ) : (
            <span />
          )}
          <span className="text-sm text-muted-foreground">
            Trang {filters.page}/{totalPages}
          </span>
          {filters.page < totalPages ? (
            <Button
              asChild
              variant="outline"
              className="justify-self-end px-3 sm:px-4"
            >
              <Link href={pageUrl(filters.page + 1)} aria-label="Trang sau">
                <span>
                  <span className="hidden sm:inline">Trang </span>sau
                </span>
                <ArrowRight />
              </Link>
            </Button>
          ) : (
            <span />
          )}
        </nav>
      )}
    </>
  );
}
