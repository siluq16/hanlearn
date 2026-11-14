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
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PageHeading } from "@/components/page-heading";
import type { PracticeSet, PracticeSkill } from "../types";

interface PracticeCenterProps {
  initialSkill?: string;
  initialUnit?: string;
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
  practiceSets,
  learnerHistory,
}: PracticeCenterProps) {
  const [selectedSkill, setSelectedSkill] = useState<PracticeSkill>(
    (initialSkill as PracticeSkill) || "vocabulary"
  );
  const [selectedUnit, setSelectedUnit] = useState<string>(
    initialUnit ? `u-hsk1-0${initialUnit}` : "all"
  );
  const [selectedDiff, setSelectedDiff] = useState<string>("all");

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
              onClick={() => setSelectedSkill(sk.id)}
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
            onChange={(e) => setSelectedUnit(e.target.value)}
            className="h-8 px-2.5 rounded-lg border border-border bg-card text-xs font-medium text-foreground focus:outline-hidden focus:ring-1 focus:ring-primary"
          >
            <option value="all">Tất cả các Unit</option>
            <option value="u-hsk1-01">Unit 1: Khởi đầu (Bài 1–4)</option>
            <option value="u-hsk1-02">Unit 2: Sinh hoạt (Bài 5–8)</option>
            <option value="u-hsk1-03">Unit 3: Mua sắm (Bài 9–14)</option>
            <option value="u-hsk1-04">Unit 4: Giao thông (Bài 15–20)</option>
            <option value="u-hsk1-05">Unit 5: Giao tiếp (Bài 21–25)</option>
            <option value="u-hsk1-06">Unit 6: Xã hội (Bài 26–32)</option>
          </select>

          {/* Difficulty Filter */}
          <select
            value={selectedDiff}
            onChange={(e) => setSelectedDiff(e.target.value)}
            className="h-8 px-2.5 rounded-lg border border-border bg-card text-xs font-medium text-foreground focus:outline-hidden focus:ring-1 focus:ring-primary"
          >
            <option value="all">Tất cả độ khó</option>
            <option value="easy">Dễ (Cơ bản)</option>
            <option value="medium">Trung bình</option>
            <option value="hard">Nâng cao</option>
          </select>
        </div>
      </div>

      {/* Prebuilt Sets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredSets.map((set) => {
          const history = learnerHistory[set.practice_set_id];
          const isDone = !!history;

          return (
            <Card
              key={set.practice_set_id}
              className="border-border hover:border-primary/40 transition-all flex flex-col justify-between"
            >
              <CardContent className="p-5 flex flex-col justify-between h-full space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <Badge className="border border-border bg-transparent text-[10px] font-bold uppercase tracking-wider">
                      {set.unit_id.replace("u-hsk1-0", "Unit ")}
                    </Badge>

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
                        {set.difficulty === "easy" ? "Dễ" : set.difficulty === "medium" ? "Trung bình" : "Nâng cao"}
                      </Badge>
                      <span className="text-[11px] text-muted-foreground">
                        {set.question_count} câu
                      </span>
                    </div>
                  </div>

                  <h4 className="text-base font-bold text-foreground leading-snug">
                    {set.title}
                  </h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {set.description}
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
                        Chưa hoàn thành
                      </span>
                    )}
                  </div>

                  <Link
                    href={`/practice/${set.practice_set_id}`}
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
  );
}
