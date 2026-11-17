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

// Canonical Mandarin hūdúyīn (呼读音) syllables so zh-CN TTS engines pronounce authentic Mandarin phonemes instead of English alphabet letters
const INITIAL_CALL_HANZI: Record<string, string> = {
  b: "波",
  p: "坡",
  m: "摸",
  f: "佛",
  d: "得",
  t: "特",
  n: "讷",
  l: "勒",
  g: "哥",
  k: "科",
  h: "喝",
  j: "基",
  q: "欺",
  x: "希",
  z: "资",
  c: "雌",
  s: "思",
  zh: "知",
  ch: "蚩",
  sh: "诗",
  r: "日",
};

const FINAL_CALL_HANZI: Record<string, string> = {
  a: "啊",
  o: "喔",
  e: "鹅",
  i: "衣",
  u: "乌",
  ü: "迂",
  ai: "哀",
  ei: "诶",
  ui: "威",
  ao: "熬",
  ou: "欧",
  iu: "优",
  ie: "耶",
  üe: "约",
  er: "儿",
  an: "安",
  en: "恩",
  in: "因",
  un: "温",
  ün: "晕",
  ang: "昂",
  eng: "亨",
  ing: "英",
  ong: "轰",
  ia: "呀",
  iao: "腰",
  ian: "烟",
  iang: "央",
  iong: "拥",
  ua: "蛙",
  uo: "窝",
  uai: "歪",
  uan: "弯",
  uang: "汪",
  ueng: "翁",
  üan: "冤",
};

const TONE_CALL_HANZI: Record<number, string> = {
  1: "妈",
  2: "麻",
  3: "马",
  4: "骂",
  0: "吗",
};

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
          Hệ thống trọn vẹn 21 Thanh mẫu, 36 Vận mẫu, 4 Thanh điệu và các quy tắc biến điệu &amp; chính tả bắt buộc (thanh 3, 不, 一, ü). Nhấp vào bất kỳ âm nào để nghe âm đọc mẫu qua giọng đọc tiếng Trung phổ thông (zh-CN TTS).
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
          Quy tắc Biến điệu &amp; Chính tả
        </Button>
      </div>

      {/* Tab: 21 Thanh mẫu */}
      {activeTab === "initials" && (
        <div className="space-y-4">
          <p className="text-xs text-muted-foreground">
            Thanh mẫu là phụ âm mở đầu một âm tiết tiếng Trung. Hãy nghe âm hô độc (呼读音) và chú ý phân biệt nhóm âm bật hơi (p, t, k, q, c, ch) với nhóm không bật hơi (b, d, g, j, z, zh).
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
                      onClick={() => speak(INITIAL_CALL_HANZI[init] || init)}
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
            Vận mẫu gồm phần giới âm, nguyên âm chính và âm cuối. Bao gồm đầy đủ 36 vận mẫu: 6 vận mẫu đơn, 9 vận mẫu kép, 9 vận mẫu mũi (-n, -ng) và 12 vận mẫu ghép có giới âm (i-, u-, ü-).
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
                      onClick={() => speak(FINAL_CALL_HANZI[final] || final)}
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
            Tiếng Trung là ngôn ngữ thanh điệu. Thay đổi thanh điệu sẽ thay đổi hoàn toàn ý nghĩa của từ (ví dụ: 妈 mā mẹ, 麻 má gai, 马 mǎ ngựa, 骂 mà mắng, 吗 ma trợ từ).
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
                    onClick={() => speak(TONE_CALL_HANZI[tone.tone] || "妈")}
                    className="w-full rounded-xl gap-2 text-xs font-semibold"
                  >
                    <Volume2 className="size-3.5" />
                    Nghe mẫu phát âm ({TONE_CALL_HANZI[tone.tone]})
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
            4 quy tắc biến điệu và chính tả Pinyin cốt lõi cần nắm vững khi đọc và nói tiếng Trung.
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
          Bắt đầu Bài 1 (10 Chặng)
        </Link>
      </div>
    </div>
  );
}
