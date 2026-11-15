"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  Search,
  LayoutGrid,
  List,
  Eye,
  EyeOff,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  CheckCircle2,
  Clock,
  ArrowUpRight,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MandarinAudioButton, MandarinSpeedToggle } from "@/components/mandarin-audio";
import { UNIFIED_UNITS } from "@/features/curriculum/unified-metadata";

export interface VocabularyViewItem {
  id: string;
  simplified: string;
  traditional?: string;
  pinyin_marked: string;
  meaning_vi: string;
  unitNumber: number;
  mastery: "not_introduced" | "introduced" | "learning" | "mastered";
}

interface VocabularyViewProps {
  items: VocabularyViewItem[];
  stats: {
    totalWords: number;
    learnedCount: number;
    dueCount: number;
  };
}

export function VocabularyView({ items, stats }: VocabularyViewProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUnit, setSelectedUnit] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [hideMeaning, setHideMeaning] = useState(false);
  const [revealedIds, setRevealedIds] = useState<Record<string, boolean>>({});
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 24;

  const toggleReveal = (id: string) => {
    setRevealedIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Filter items
  const filteredItems = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return items.filter((item) => {
      // Unit filter
      if (selectedUnit !== "all") {
        const uNum = parseInt(selectedUnit, 10);
        if (item.unitNumber !== uNum) return false;
      }

      // Status filter
      if (selectedStatus === "learned") {
        if (item.mastery === "not_introduced") return false;
      } else if (selectedStatus === "not_learned") {
        if (item.mastery !== "not_introduced") return false;
      }

      // Search query
      if (q) {
        const matchHanzi = item.simplified.includes(q);
        const matchPinyin = item.pinyin_marked.toLowerCase().includes(q);
        const matchMeaning = item.meaning_vi.toLowerCase().includes(q);
        if (!matchHanzi && !matchPinyin && !matchMeaning) return false;
      }

      return true;
    });
  }, [items, searchQuery, selectedUnit, selectedStatus]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filteredItems.length / pageSize));
  const pageIndex = Math.min(currentPage, totalPages);
  const currentItems = useMemo(() => {
    const start = (pageIndex - 1) * pageSize;
    return filteredItems.slice(start, start + pageSize);
  }, [filteredItems, pageIndex, pageSize]);

  const masteryLabels: Record<string, { label: string; className: string }> = {
    mastered: { label: "Đã vững", className: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30" },
    learning: { label: "Đang học", className: "bg-primary/10 text-primary border-primary/20" },
    introduced: { label: "Đã tiếp cận", className: "bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/30" },
    not_introduced: { label: "Chưa học", className: "bg-muted text-muted-foreground" },
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16">
      {/* 3 Summary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <Card className="border-border bg-card shadow-2xs">
          <CardContent className="p-4 sm:p-5 flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-xs text-muted-foreground font-medium">Tổng từ vựng HSK 1</span>
              <p className="text-2xl font-extrabold text-foreground">{stats.totalWords} từ</p>
            </div>
            <div className="size-10 rounded-xl bg-primary/10 text-primary grid place-items-center">
              <BookOpen className="size-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card shadow-2xs">
          <CardContent className="p-4 sm:p-5 flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-xs text-muted-foreground font-medium">Đã học theo bài</span>
              <p className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">
                {stats.learnedCount} từ
              </p>
            </div>
            <div className="size-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 grid place-items-center">
              <CheckCircle2 className="size-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card shadow-2xs">
          <CardContent className="p-4 sm:p-5 flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-xs text-muted-foreground font-medium">Cần ôn tập SRS</span>
              <p className="text-2xl font-extrabold text-amber-600 dark:text-amber-400">
                {stats.dueCount} thẻ
              </p>
            </div>
            <div className="size-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 grid place-items-center">
              <Clock className="size-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Control Toolbar */}
      <Card className="p-4 sm:p-5 border-border bg-card shadow-xs space-y-3.5">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Search bar */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              id="vocab-search"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Tìm chữ Hán, Pinyin hoặc nghĩa tiếng Việt…"
              className="pl-9 h-10 text-sm"
            />
          </div>

          {/* Unit Filter */}
          <select
            value={selectedUnit}
            onChange={(e) => {
              setSelectedUnit(e.target.value);
              setCurrentPage(1);
            }}
            className="h-10 px-3 rounded-xl border border-input bg-background text-xs font-medium text-foreground focus:outline-hidden focus:ring-1 focus:ring-primary"
          >
            <option value="all">Tất cả Unit (1–6)</option>
            {UNIFIED_UNITS.map((u) => (
              <option key={u.id} value={String(u.unitNumber)}>
                Unit {u.unitNumber}: {u.shortTitle}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => {
              setSelectedStatus(e.target.value);
              setCurrentPage(1);
            }}
            className="h-10 px-3 rounded-xl border border-input bg-background text-xs font-medium text-foreground focus:outline-hidden focus:ring-1 focus:ring-primary"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="learned">Đã học</option>
            <option value="not_learned">Chưa học</option>
          </select>
        </div>

        {/* View toggles & Audio Speed */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-border/60 text-xs">
          <div className="flex items-center gap-2">
            {/* Hide Meaning Toggle */}
            <Button
              type="button"
              variant={hideMeaning ? "default" : "outline"}
              size="sm"
              onClick={() => {
                setHideMeaning(!hideMeaning);
                setRevealedIds({});
              }}
              className="h-8 gap-1.5 text-xs rounded-lg"
            >
              {hideMeaning ? (
                <>
                  <EyeOff className="size-3.5" />
                  <span>Đang ẩn nghĩa</span>
                </>
              ) : (
                <>
                  <Eye className="size-3.5" />
                  <span>Ẩn nghĩa tiếng Việt</span>
                </>
              )}
            </Button>

            <span className="text-muted-foreground hidden sm:inline">•</span>

            {/* View Mode Toggle */}
            <div className="inline-flex rounded-lg border border-border p-0.5 bg-muted/40">
              <button
                type="button"
                onClick={() => setViewMode("grid")}
                aria-label="Xem dạng lưới"
                className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                  viewMode === "grid"
                    ? "bg-card text-foreground shadow-2xs font-semibold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <LayoutGrid className="size-3.5 inline mr-1" />
                <span>Lưới</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode("list")}
                aria-label="Xem dạng danh sách"
                className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                  viewMode === "list"
                    ? "bg-card text-foreground shadow-2xs font-semibold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <List className="size-3.5 inline mr-1" />
                <span>Danh sách</span>
              </button>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-muted-foreground">
              Hiển thị {filteredItems.length} từ
            </span>
            <MandarinSpeedToggle />
          </div>
        </div>
      </Card>

      {/* Vocabulary Display */}
      {filteredItems.length === 0 ? (
        <Card className="p-8 text-center border-dashed border-border bg-card">
          <p className="text-sm font-medium text-muted-foreground">
            Không tìm thấy từ vựng nào khớp với bộ lọc hiện tại.
          </p>
          <Button
            variant="outline"
            size="sm"
            className="mt-3 text-xs"
            onClick={() => {
              setSearchQuery("");
              setSelectedUnit("all");
              setSelectedStatus("all");
            }}
          >
            Xóa bộ lọc
          </Button>
        </Card>
      ) : viewMode === "grid" ? (
        /* GRID VIEW */
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5">
          {currentItems.map((v) => {
            const isRevealed = revealedIds[v.id];
            const isHidden = hideMeaning && !isRevealed;
            const masteryInfo = masteryLabels[v.mastery] || masteryLabels.not_introduced;

            return (
              <Card
                key={v.id}
                className="border-border hover:border-primary/40 transition-all bg-card shadow-2xs flex flex-col justify-between overflow-hidden group"
              >
                <CardContent className="p-4 space-y-3 flex flex-col justify-between h-full">
                  <div className="space-y-2">
                    {/* Top Bar: Unit badge & Audio button */}
                    <div className="flex items-center justify-between gap-2">
                      <Badge className="bg-primary/10 text-primary border-primary/20 text-[10px] font-bold">
                        Unit {v.unitNumber}
                      </Badge>
                      <MandarinAudioButton
                        text={v.simplified}
                        showSlow
                        size="sm"
                        variant="ghost"
                      />
                    </div>

                    {/* Hanzi & Pinyin */}
                    <div className="text-center py-1">
                      <span className="hanzi text-3xl font-bold block text-foreground tracking-wide">
                        {v.simplified}
                      </span>
                      <span className="text-xs font-semibold text-primary block mt-1">
                        {v.pinyin_marked}
                      </span>
                    </div>

                    {/* Vietnamese meaning (with hide/reveal feature) */}
                    <div
                      onClick={() => hideMeaning && toggleReveal(v.id)}
                      className={`text-center py-1 px-2 rounded-lg text-xs transition-all ${
                        isHidden
                          ? "bg-muted/70 text-muted-foreground cursor-pointer select-none border border-dashed border-border hover:bg-muted"
                          : "text-foreground font-medium"
                      }`}
                      title={isHidden ? "Nhấp để hiển thị nghĩa" : undefined}
                    >
                      {isHidden ? (
                        <span className="italic text-[11px] flex items-center justify-center gap-1">
                          <EyeOff className="size-3" />
                          <span>Nhấp để xem nghĩa</span>
                        </span>
                      ) : (
                        <span>{v.meaning_vi}</span>
                      )}
                    </div>
                  </div>

                  {/* Bottom Bar: Status badge & Word detail link */}
                  <div className="pt-2 border-t border-border/50 flex items-center justify-between text-[11px]">
                    <Badge className={`text-[10px] font-semibold ${masteryInfo.className}`}>
                      {masteryInfo.label}
                    </Badge>
                    <Link
                      href={`/vocabulary/${v.id}`}
                      className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-0.5 group-hover:text-primary"
                    >
                      <span>Chi tiết</span>
                      <ArrowUpRight className="size-3" />
                    </Link>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        /* LIST VIEW */
        <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-2xs">
          <div className="hidden sm:grid grid-cols-[1.2fr_1fr_2fr_1fr_auto] gap-4 border-b border-border bg-muted/60 px-5 py-3 text-xs font-bold text-muted-foreground">
            <span>Chữ Hán &amp; Audio</span>
            <span>Pinyin</span>
            <span>Nghĩa tiếng Việt</span>
            <span>Unit / Trạng thái</span>
            <span>Chi tiết</span>
          </div>

          <div className="divide-y divide-border">
            {currentItems.map((v) => {
              const isRevealed = revealedIds[v.id];
              const isHidden = hideMeaning && !isRevealed;
              const masteryInfo = masteryLabels[v.mastery] || masteryLabels.not_introduced;

              return (
                <div
                  key={v.id}
                  className="p-4 sm:px-5 sm:py-3.5 grid grid-cols-1 sm:grid-cols-[1.2fr_1fr_2fr_1fr_auto] items-center gap-2 sm:gap-4 hover:bg-muted/30 transition-colors"
                >
                  {/* Hanzi + Audio */}
                  <div className="flex items-center gap-2">
                    <span className="hanzi text-2xl font-bold text-foreground">
                      {v.simplified}
                    </span>
                    <MandarinAudioButton
                      text={v.simplified}
                      showSlow
                      size="sm"
                      variant="ghost"
                    />
                  </div>

                  {/* Pinyin */}
                  <span className="text-sm font-semibold text-primary">
                    {v.pinyin_marked}
                  </span>

                  {/* Meaning */}
                  <div
                    onClick={() => hideMeaning && toggleReveal(v.id)}
                    className={`text-xs transition-all ${
                      isHidden
                        ? "bg-muted/70 text-muted-foreground cursor-pointer select-none px-2 py-1 rounded-md border border-dashed border-border inline-block max-w-fit"
                        : "text-foreground leading-relaxed"
                    }`}
                  >
                    {isHidden ? (
                      <span className="italic flex items-center gap-1">
                        <EyeOff className="size-3" />
                        <span>Nhấp xem nghĩa</span>
                      </span>
                    ) : (
                      <span>{v.meaning_vi}</span>
                    )}
                  </div>

                  {/* Unit + Status */}
                  <div className="flex flex-wrap items-center gap-1.5">
                    <Badge className="bg-primary/10 text-primary border-primary/20 text-[10px] font-bold">
                      Unit {v.unitNumber}
                    </Badge>
                    <Badge className={`text-[10px] font-semibold ${masteryInfo.className}`}>
                      {masteryInfo.label}
                    </Badge>
                  </div>

                  {/* Detail link */}
                  <div className="flex justify-end">
                    <Link
                      href={`/vocabulary/${v.id}`}
                      className="text-xs text-primary hover:underline inline-flex items-center gap-0.5"
                    >
                      <span>Xem</span>
                      <ArrowUpRight className="size-3" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-2">
          <Button
            variant="outline"
            size="sm"
            disabled={pageIndex <= 1}
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            className="text-xs h-9 gap-1"
          >
            <ChevronLeft className="size-4" />
            <span>Trang trước</span>
          </Button>

          <span className="text-xs text-muted-foreground font-medium">
            Trang {pageIndex} / {totalPages}
          </span>

          <Button
            variant="outline"
            size="sm"
            disabled={pageIndex >= totalPages}
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            className="text-xs h-9 gap-1"
          >
            <span>Trang sau</span>
            <ChevronRight className="size-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
