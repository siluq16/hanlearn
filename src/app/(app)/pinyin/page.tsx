"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Volume2, Sparkles, BookOpen, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useMandarinSpeech } from "@/hooks/use-mandarin-speech";
import pinyinData from "../../../../content/hsk_library/module0_pinyin.json";
interface InitialsGroup {
  name: string;
  initials: string[];
  description: string;
}

interface FinalsGroup {
  name: string;
  finals: string[];
}

interface ToneItem {
  tone: number;
  symbol: string;
  name: string;
  description: string;
  pitch: string;
}

interface ToneRule {
  name: string;
  rule: string;
  example: string;
}

const initialsGroups = pinyinData.sections[0].groups as unknown as InitialsGroup[];
const finalsGroups = pinyinData.sections[1].groups as unknown as FinalsGroup[];
const tonesList = pinyinData.sections[2].tones as unknown as ToneItem[];
const rulesList = pinyinData.sections[3].rules as unknown as ToneRule[];

export default function PinyinFoundationPage() {
  const { speak } = useMandarinSpeech();
  const [activeTab, setActiveTab] = useState<"initials" | "finals" | "tones" | "rules">("initials");

  return (
    <div className="space-y-6">
      {/* Back button & Title */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Link
          href="/roadmap"
          className="inline-flex items-center gap-2 text-sm text-primary underline underline-offset-4"
        >
          <ArrowLeft className="size-4" />
          Về Lộ trình học
        </Link>
        <Badge className="px-3 py-1 font-semibold text-xs border border-primary/30 text-primary bg-primary/10">
          Module 0 · Nền tảng Nhập môn
        </Badge>
      </div>

      <header className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">
          Module 0: Ngữ âm &amp; Phát âm Pinyin Tiếng Trung Nền tảng
        </h1>
        <p className="text-sm leading-relaxed text-muted-foreground max-w-3xl">
          Hệ thống trọn vẹn 21 Thanh mẫu, 36 Vận mẫu, 4 Thanh điệu và quy tắc biến điệu bắt buộc (thanh 3, 不, 一). Nhấp vào bất kỳ âm nào để lắng nghe phát âm chuẩn bản xứ.
        </p>
      </header>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-border pb-3">
        <Button
          variant={activeTab === "initials" ? "default" : "outline"}
          size="sm"
          onClick={() => setActiveTab("initials")}
          className="rounded-xl gap-1.5"
        >
          <BookOpen className="size-4" />
          21 Thanh mẫu (Phụ âm)
        </Button>
        <Button
          variant={activeTab === "finals" ? "default" : "outline"}
          size="sm"
          onClick={() => setActiveTab("finals")}
          className="rounded-xl gap-1.5"
        >
          <Layers className="size-4" />
          36 Vận mẫu (Nguyên âm)
        </Button>
        <Button
          variant={activeTab === "tones" ? "default" : "outline"}
          size="sm"
          onClick={() => setActiveTab("tones")}
          className="rounded-xl gap-1.5"
        >
          <Sparkles className="size-4" />
          4 Thanh điệu &amp; Thanh nhẹ
        </Button>
        <Button
          variant={activeTab === "rules" ? "default" : "outline"}
          size="sm"
          onClick={() => setActiveTab("rules")}
          className="rounded-xl gap-1.5"
        >
          <Volume2 className="size-4" />
          Quy tắc Biến điệu
        </Button>
      </div>

      {/* Tab: 21 Thanh mẫu */}
      {activeTab === "initials" && (
        <div className="space-y-4">
          <p className="text-xs text-muted-foreground">
            Thanh mẫu là phụ âm mở đầu một âm tiết tiếng Trung. Hãy nghe và chú ý các âm bật hơi (p, t, k, q, c, ch) và âm uốn lưỡi (zh, ch, sh, r).
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {initialsGroups.map((group, idx) => (
              <Card key={idx} className="border-border/60 bg-card/60">
                <CardHeader className="p-4 pb-2">
                  <CardTitle className="text-sm font-semibold text-primary">{group.name}</CardTitle>
                  <CardDescription className="text-xs">{group.description}</CardDescription>
                </CardHeader>
                <CardContent className="p-4 pt-1 flex flex-wrap gap-2">
                  {group.initials.map((init) => (
                    <Button
                      key={init}
                      variant="outline"
                      size="sm"
                      onClick={() => speak(init)}
                      className="size-11 rounded-xl text-base font-bold hover:bg-primary/10 hover:border-primary flex items-center justify-center p-0"
                    >
                      {init}
                    </Button>
                  ))}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Tab: 36 Vận mẫu */}
      {activeTab === "finals" && (
        <div className="space-y-4">
          <p className="text-xs text-muted-foreground">
            Vận mẫu gồm phần vần và nguyên âm. Phân chia rõ ràng giữa vận mẫu đơn, vận mẫu kép và vận mẫu mũi (-n, -ng).
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {finalsGroups.map((group, idx) => (
              <Card key={idx} className="border-border/60 bg-card/60">
                <CardHeader className="p-4 pb-2">
                  <CardTitle className="text-sm font-semibold text-primary">{group.name}</CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-1 flex flex-wrap gap-2">
                  {group.finals.map((final) => (
                    <Button
                      key={final}
                      variant="outline"
                      size="sm"
                      onClick={() => speak(final)}
                      className="h-10 px-3 rounded-xl text-sm font-semibold hover:bg-primary/10 hover:border-primary"
                    >
                      {final}
                    </Button>
                  ))}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Tab: 4 Thanh điệu & Thanh nhẹ */}
      {activeTab === "tones" && (
        <div className="space-y-4">
          <p className="text-xs text-muted-foreground">
            Tiếng Trung là ngôn ngữ thanh điệu. Thay đổi thanh điệu sẽ thay đổi hoàn toàn ý nghĩa của từ.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {tonesList.map((tone, idx) => (
              <Card key={idx} className="border-border/60 bg-card/60">
                <CardHeader className="p-4 pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-bold text-primary">{tone.name}</CardTitle>
                    <Badge className="text-xs font-mono">{tone.symbol}</Badge>
                  </div>
                  <CardDescription className="text-xs text-foreground font-medium pt-1">
                    Độ cao: {tone.pitch}
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-4 pt-1 space-y-3">
                  <p className="text-xs text-muted-foreground leading-relaxed">{tone.description}</p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const sample = tone.tone === 1 ? "mā" : tone.tone === 2 ? "má" : tone.tone === 3 ? "mǎ" : tone.tone === 4 ? "mà" : "ma";
                      speak(sample);
                    }}
                    className="w-full rounded-xl gap-2 text-xs font-semibold"
                  >
                    <Volume2 className="size-3.5" />
                    Nghe mẫu phát âm
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Tab: Quy tắc biến điệu */}
      {activeTab === "rules" && (
        <div className="space-y-4">
          <p className="text-xs text-muted-foreground">
            3 quy tắc biến điệu bắt buộc phải thuộc lòng khi nói tiếng Trung để đảm bảo sự trôi chảy tự nhiên.
          </p>
          <div className="space-y-4">
            {rulesList.map((rule, idx) => (
              <Card key={idx} className="border-primary/20 bg-primary/5">
                <CardContent className="p-5 space-y-2">
                  <div className="flex items-center gap-2">
                    <Sparkles className="size-4 text-primary shrink-0" />
                    <h3 className="text-sm font-bold text-foreground">{rule.name}</h3>
                  </div>
                  <div className="p-3 rounded-lg bg-background border border-border text-xs font-mono text-primary font-bold">
                    Công thức: {rule.rule}
                  </div>
                  <p className="text-xs leading-relaxed text-muted-foreground">
                    Ví dụ thực tế: <strong className="text-foreground">{rule.example}</strong>
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Start Lesson 1 Call to action */}
      <div className="pt-4 p-5 rounded-2xl border border-primary/30 bg-primary/10 flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1">
          <h4 className="text-sm font-bold text-foreground">Bạn đã nắm chắc ngữ âm Pinyin nền tảng?</h4>
          <p className="text-xs text-muted-foreground">Hãy bắt đầu Bài 1 để học cách chào hỏi và tự giới thiệu bản thân bằng tiếng Trung.</p>
        </div>
        <Link
          href="/lessons/stage/hsk1-lesson-01"
          className="inline-flex min-h-11 items-center px-5 rounded-xl bg-primary text-xs font-semibold text-primary-foreground hover:opacity-90 transition-all shadow-sm"
        >
          Bắt đầu Bài 1 (9 Giai đoạn)
        </Link>
      </div>
    </div>
  );
}
