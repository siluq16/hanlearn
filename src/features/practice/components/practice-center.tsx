"use client";

import { useState } from "react";
import Link from "next/link";
import {
  BookOpen,
  Headphones,
  Mic,
  MessageSquare,
  FileCheck2,
  ArrowRight,
  CheckCircle2,
  Layers,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PageHeading } from "@/components/page-heading";
import type { PracticeSet, PracticeSkill } from "../types";
import { UNIFIED_UNITS, getPracticeSetMeta } from "@/features/curriculum/unified-metadata";

interface PracticeCenterProps {
  initialSkill?: string;
  initialUnit?: string;
  initialDiff?: string;
  practiceSets: PracticeSet[];
  learnerHistory: Record<string, { bestScore: number; total: number; completedAt: string }>;
}

const SKILL_CONFIG: {
  id: PracticeSkill;
  label: string;
  icon: typeof BookOpen;
  description: string;
}[] = [
  {
    id: "vocabulary",
    label: "Từ vựng",
    icon: BookOpen,
    description: "Nhận diện chữ Hán, Pinyin, nghĩa tiếng Việt, ghép từ và điền từ khuyết.",
  },
  {
    id: "grammar",
    label: "Ngữ pháp",
    icon: Layers,
    description: "Sắp xếp trật tự câu, lượng từ, trợ từ kết cấu và thể tiếp diễn.",
  },
  {
    id: "listening",
    label: "Luyện nghe",
    icon: Headphones,
    description: "Nghe từ, nghe chọn Hán tự, nghe câu đối đáp và nghe chép chính tả.",
  },
  {
    id: "speaking",
    label: "Luyện nói",
    icon: Mic,
    description: "Luyện phát âm từ, đọc câu trôi chảy, nhại âm shadowing và phản xạ giao tiếp.",
  },
  {
    id: "reading",
    label: "Đọc hiểu",
    icon: FileCheck2,
    description: "Đọc đoạn văn ngắn, câu hỏi Đúng/Sai, biển báo và sắp xếp trình tự câu chuyện.",
  },
  {
    id: "dialogue",
    label: "Hội thoại",
    icon: MessageSquare,
    description: "Đóng vai nhân vật A / B trong các kịch bản mua sắm, nhà hàng, chỉ đường.",
  },
];

export function PracticeCenter({
  initialSkill,
  initialUnit,
  initialDiff,
  practiceSets,
  learnerHistory,
}: PracticeCenterProps) {
  const resolveUnitId = (u?: string) => {
    if (!u || u === "all") return "all";
    if (u.startsWith("u-hsk1-")) return u;
    const num = parseInt(u, 10);
    if (!isNaN(num)) return `u-hsk1-0${num}`;
    return "all";
  };

  const [selectedSkill, setSelectedSkill] = useState<PracticeSkill>(
    (initialSkill as PracticeSkill) || "vocabulary"
  );
  const [selectedUnit, setSelectedUnit] = useState<string>(
    resolveUnitId(initialUnit)
  );
  const [selectedDiff, setSelectedDiff] = useState<string>(initialDiff || "all");
  const [collapsedUnits, setCollapsedUnits] = useState<Record<string, boolean>>({});

  const updateUrlState = (skill: PracticeSkill, unit: string, diff: string) => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams();
    if (skill !== "vocabulary") params.set("skill", skill);
    if (unit !== "all") params.set("unit", unit);
    if (diff !== "all") params.set("diff", diff);
    const qs = params.toString();
    const newUrl = qs ? `/practice?${qs}` : "/practice";
    window.history.replaceState(null, "", newUrl);
  };

  const handleSelectSkill = (skill: PracticeSkill) => {
    setSelectedSkill(skill);
    updateUrlState(skill, selectedUnit, selectedDiff);
  };

  const handleSelectUnit = (unit: string) => {
    setSelectedUnit(unit);
    updateUrlState(selectedSkill, unit, selectedDiff);
  };

  const handleSelectDiff = (diff: string) => {
    setSelectedDiff(diff);
    updateUrlState(selectedSkill, selectedUnit, diff);
  };

  const toggleUnit = (unitId: string) => {
    setCollapsedUnits((prev) => ({ ...prev, [unitId]: !prev[unitId] }));
  };

  const filteredSets = practiceSets.filter((s) => {
    if (s.skill !== selectedSkill) return false;
    if (selectedUnit !== "all" && s.unit_id !== selectedUnit) return false;
    if (selectedDiff !== "all" && s.difficulty !== selectedDiff) return false;
    return true;
  });

  const currentSkillInfo =
    SKILL_CONFIG.find((s) => s.id === selectedSkill) || SKILL_CONFIG[0];

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-16">
      <PageHeading
        eyebrow="Ngân hàng Bài tập Chuẩn bị sẵn"
        title="Trung tâm Luyện tập Đa Kỹ năng"
        description="Chọn kỹ năng, chọn bộ bài tập cố định đã được biên soạn sẵn và bắt đầu luyện tập ngay lập tức mà không cần cấu hình."
      />

      {/* 6 Skill Navigation Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
        {SKILL_CONFIG.map((sk) => {
          const Icon = sk.icon;
          const isActive = selectedSkill === sk.id;
          const setCount = practiceSets.filter((s) => s.skill === sk.id).length;

          return (
            <button
              key={sk.id}
              type="button"
              onClick={() => handleSelectSkill(sk.id)}
              className={`flex flex-col items-center justify-center p-3 rounded-2xl border text-center transition-all ${
                isActive
                  ? "border-primary bg-primary text-primary-foreground shadow-sm"
                  : "border-border bg-card text-muted-foreground hover:bg-muted/70 hover:text-foreground"
              }`}
            >
              <Icon className="size-5 mb-1.5" />
              <span className="text-xs font-bold leading-tight">{sk.label}</span>
              <span
                className={`text-[10px] mt-0.5 ${
                  isActive ? "text-primary-foreground/80" : "text-muted-foreground"
                }`}
              >
                {setCount} bộ bài
              </span>
            </button>
          );
        })}
      </div>

      {/* Active Skill Info & Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-muted/40 border border-border">
        <div className="space-y-0.5">
          <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
            <span>Kỹ năng: {currentSkillInfo.label}</span>
            <Badge className="border border-border bg-transparent text-[10px] font-semibold">
              {filteredSets.length} bộ bài có sẵn
            </Badge>
          </h3>
          <p className="text-xs text-muted-foreground max-w-lg">
            {currentSkillInfo.description}
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Unit Filter */}
          <select
            value={selectedUnit}
            onChange={(e) => handleSelectUnit(e.target.value)}
            className="h-8 px-2.5 rounded-lg border border-border bg-card text-xs font-medium text-foreground focus:outline-hidden focus:ring-1 focus:ring-primary"
          >
            <option value="all">Tất cả các Unit</option>
            {UNIFIED_UNITS.map((u) => (
              <option key={u.id} value={u.id}>
                {u.fullTitle}
              </option>
            ))}
          </select>

          {/* Difficulty Filter */}
          <select
            value={selectedDiff}
            onChange={(e) => handleSelectDiff(e.target.value)}
            className="h-8 px-2.5 rounded-lg border border-border bg-card text-xs font-medium text-foreground focus:outline-hidden focus:ring-1 focus:ring-primary"
          >
            <option value="all">Tất cả độ khó</option>
            <option value="easy">Dễ (Cơ bản)</option>
            <option value="medium">Trung bình</option>
            <option value="hard">Nâng cao</option>
          </select>
        </div>
      </div>

      {/* Unit-grouped Accordions */}
      {filteredSets.length === 0 ? (
        <Card className="p-8 text-center border-dashed border-border bg-card">
          <p className="text-sm font-medium text-muted-foreground">
            Không tìm thấy bộ bài tập nào phù hợp với bộ lọc hiện tại.
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          {UNIFIED_UNITS.filter(
            (u) => selectedUnit === "all" || selectedUnit === u.id
          ).map((unit) => {
            const unitSets = filteredSets.filter((s) => s.unit_id === unit.id);
            if (unitSets.length === 0) return null;

            const isCollapsed = !!collapsedUnits[unit.id];
            const completedInUnit = unitSets.filter(
              (s) => !!learnerHistory[s.practice_set_id]
            ).length;

            return (
              <div
                key={unit.id}
                className="rounded-2xl border border-border bg-card overflow-hidden shadow-xs transition-all"
              >
                {/* Accordion Header */}
                <button
                  type="button"
                  onClick={() => toggleUnit(unit.id)}
                  className="w-full p-4 sm:p-5 flex items-center justify-between gap-4 text-left hover:bg-muted/40 transition-colors"
                >
                  <div className="space-y-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-bold text-base text-foreground">
                        {unit.fullTitle}
                      </span>
                      <Badge className="bg-primary/10 text-primary border-primary/20 text-[11px] font-semibold">
                        {unitSets.length} bộ bài
                      </Badge>
                      {completedInUnit === unitSets.length && unitSets.length > 0 && (
                        <Badge className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 text-[11px] font-semibold gap-1">
                          <CheckCircle2 className="size-3" />
                          Hoàn tất Unit
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-1">
                      {unit.topic} · Đã làm {completedInUnit}/{unitSets.length} bộ
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 text-muted-foreground">
                    <span className="text-xs hidden sm:inline">
                      {isCollapsed ? "Mở rộng" : "Thu gọn"}
                    </span>
                    {isCollapsed ? (
                      <ChevronDown className="size-5" />
                    ) : (
                      <ChevronUp className="size-5" />
                    )}
                  </div>
                </button>

                {/* Accordion Content */}
                {!isCollapsed && (
                  <div className="p-4 sm:p-5 pt-0 border-t border-border/50 mt-1">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-3">
                      {unitSets.map((set) => {
                        const history = learnerHistory[set.practice_set_id];
                        const isDone = !!history;
                        const setMeta = getPracticeSetMeta(set.practice_set_id);

                        return (
                          <Card
                            key={set.practice_set_id}
                            className="border-border hover:border-primary/40 transition-all flex flex-col justify-between shadow-none bg-muted/20"
                          >
                            <CardContent className="p-4 sm:p-5 flex flex-col justify-between h-full space-y-3.5">
                              <div className="space-y-2">
                                <div className="flex items-center justify-between gap-2">
                                  <div className="flex items-center gap-1.5">
                                    <Badge className="bg-primary text-primary-foreground text-[10px] font-bold">
                                      {setMeta.setCode}
                                    </Badge>
                                    <Badge className="border border-border bg-transparent text-[10px] font-bold uppercase tracking-wider">
                                      {set.exercise_type.replace(/_/g, " ")}
                                    </Badge>
                                  </div>

                                  <div className="flex items-center gap-1.5">
                                    <Badge
                                      className={`text-[10px] uppercase font-bold ${
                                        set.difficulty === "easy"
                                          ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                                          : set.difficulty === "medium"
                                            ? "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                                            : "bg-red-500/10 text-red-600 dark:text-red-400"
                                      }`}
                                    >
                                      {set.difficulty === "easy"
                                        ? "Dễ"
                                        : set.difficulty === "medium"
                                          ? "Trung bình"
                                          : "Nâng cao"}
                                    </Badge>
                                    <span className="text-[11px] text-muted-foreground">
                                      {set.question_count} câu
                                    </span>
                                  </div>
                                </div>

                                <h4 className="text-sm sm:text-base font-bold text-foreground leading-snug">
                                  {setMeta.shortTitle}
                                </h4>
                                <p className="text-xs text-muted-foreground line-clamp-1">
                                  {setMeta.description}
                                </p>
                              </div>

                              <div className="pt-3 border-t border-border/60 flex items-center justify-between">
                                <div>
                                  {isDone ? (
                                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                                      <CheckCircle2 className="size-3.5" />
                                      Đã làm · {history.bestScore}/{history.total} câu
                                    </span>
                                  ) : (
                                    <span className="text-[11px] text-muted-foreground">
                                      Chưa làm
                                    </span>
                                  )}
                                </div>

                                <Link
                                  href={`/practice/${set.practice_set_id}`}
                                  prefetch={true}
                                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary text-xs font-semibold text-primary-foreground hover:opacity-90 transition-opacity"
                                >
                                  <span>{isDone ? "Luyện lại" : "Bắt đầu"}</span>
                                  <ArrowRight className="size-3.5" />
                                </Link>
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
