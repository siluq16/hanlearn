"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Volume2,
  Snail,
  Square,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Info,
  CheckSquare,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import {
  getMandarinVoices,
  getBestMandarinVoice,
  setPreferredMandarinVoice,
  getPreferredMandarinVoiceName,
  categorizeVoice,
  speakMandarin,
  stopMandarin,
  subscribeVoicesChanged,
  MANDARIN_RATES,
} from "@/lib/mandarin-speech";

const PRESET_SENTENCES = [
  { text: "你好", note: "Biến điệu hai thanh 3: nǐ hǎo → ní hǎo" },
  { text: "谢谢", note: "Thanh 4 rơi mạnh + thanh nhẹ: xièxie" },
  { text: "再见", note: "Hai thanh 4 liên tiếp: zàijiàn" },
  { text: "我是学生。", note: "Ngữ điệu câu, thanh 4 - thanh 4 - thanh 2 - thanh nhẹ" },
  { text: "你今天好吗？", note: "Thanh 1, biến điệu và trợ từ nghi vấn nhẹ: ma" },
  { text: "爸爸妈妈都很好。", note: "Từ lặp gia đình, thanh 1 và thanh nhẹ" },
];

export function AudioDiagnosticsCard() {
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<string>("");
  const [testText, setTestText] = useState<string>("我是学生。");
  const [activeRate, setActiveRate] = useState<number>(MANDARIN_RATES.NORMAL);
  const [status, setStatus] = useState<string>("Sẵn sàng");
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [lastError, setLastError] = useState<string | null>(null);

  const [timings, setTimings] = useState<{
    normalMs: number | null;
    slowMs: number | null;
    testedRate: number | null;
  }>({ normalMs: null, slowMs: null, testedRate: null });

  // Acceptance Checklist items state
  const [checklist, setChecklist] = useState<Record<string, boolean>>({
    tone1: false,
    tone2: false,
    tone3: false,
    tone4: false,
    sandhi: false,
    neutralTone: false,
    slowClarity: false,
  });

  const startTimeRef = useRef<number>(0);

  const refreshVoices = () => {
    const list = getMandarinVoices();
    setVoices(list);
    const preferred = getPreferredMandarinVoiceName();
    if (preferred && list.some((v) => v.name === preferred)) {
      setSelectedVoice(preferred);
    } else {
      const best = getBestMandarinVoice();
      if (best) {
        setSelectedVoice(best.name);
      } else if (list.length > 0) {
        setSelectedVoice("");
      }
    }
  };

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      refreshVoices();
    });
    const unsub = subscribeVoicesChanged(() => {
      refreshVoices();
    });
    return () => {
      cancelAnimationFrame(frame);
      unsub();
      stopMandarin();
    };
  }, []);

  const handleVoiceChange = (name: string) => {
    setSelectedVoice(name);
    setPreferredMandarinVoice(name);
    stopMandarin();
    setIsPlaying(false);
    setStatus(`Đã chọn giọng: ${name}`);
  };

  const handleFallbackSelect = (name: string) => {
    handleVoiceChange(name);
  };

  const handlePlayRate = (rate: number, label: string) => {
    setLastError(null);
    setActiveRate(rate);
    setStatus(`Đang phát (${label})...`);
    startTimeRef.current = performance.now();

    const success = speakMandarin({
      text: testText,
      rate,
      onStart: () => {
        setIsPlaying(true);
        setStatus(`Đang phát (${label})`);
      },
      onEnd: () => {
        const elapsed = Math.round(performance.now() - startTimeRef.current);
        setIsPlaying(false);
        setStatus(`Hoàn thành (${label}) trong ${elapsed} ms`);
        setTimings((prev) => ({
          ...prev,
          testedRate: rate,
          ...(rate === MANDARIN_RATES.NORMAL
            ? { normalMs: elapsed }
            : { slowMs: elapsed }),
        }));
      },
      onError: (err) => {
        setIsPlaying(false);
        setLastError(err);
        setStatus(`Lỗi phát âm: ${err}`);
      },
    });

    if (!success) {
      setIsPlaying(false);
      setStatus("Không thể bắt đầu phát âm.");
    }
  };

  const handleStop = () => {
    stopMandarin();
    setIsPlaying(false);
    setStatus("Đã dừng phát âm.");
  };

  const toggleCheck = (key: string) => {
    setChecklist((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const activeVoiceObj =
    voices.find((v) => v.name === selectedVoice) || getBestMandarinVoice();
  const activeVoiceCategory = activeVoiceObj ? categorizeVoice(activeVoiceObj) : null;

  const hasMainlandVoice = voices.some((v) => categorizeVoice(v).isMainland);

  const ratio =
    timings.normalMs && timings.slowMs
      ? (timings.slowMs / timings.normalMs).toFixed(2)
      : null;

  const checkedCount = Object.values(checklist).filter(Boolean).length;
  const totalCount = Object.keys(checklist).length;

  return (
    <Card className="border-primary/20 bg-card">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Volume2 className="size-4 text-primary" />
            Kiểm tra chất lượng Mandarin Audio & Nghiệm thu bằng tai
          </CardTitle>
          <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
            Development Only
          </span>
        </div>
        <CardDescription className="text-xs">
          Công cụ hỗ trợ chẩn đoán Web Speech API: chọn giọng zh-CN chuẩn, kiểm chứng tốc độ chậm thực tế và nghiệm thu thanh điệu bằng tai.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 text-sm">
        {/* Voice Selection & Policy */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label htmlFor="voice-select" className="text-xs font-medium text-muted-foreground">
              Giọng phát âm ({voices.length} giọng tiếng Trung được phát hiện)
            </label>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={refreshVoices}
              className="h-6 px-1.5 text-xs text-muted-foreground"
              title="Quét lại giọng hệ thống"
            >
              <RefreshCw className="size-3 mr-1" /> Làm mới
            </Button>
          </div>

          {voices.length > 0 ? (
            <select
              id="voice-select"
              value={selectedVoice}
              onChange={(e) => handleVoiceChange(e.target.value)}
              className="w-full rounded-xl border border-input bg-background px-3 py-2 text-xs font-mono"
            >
              <option value="">-- Chọn giọng phát âm tiếng Trung --</option>
              {voices.map((v) => {
                const cat = categorizeVoice(v);
                const prefix = cat.isMainland ? "🇨🇳 [zh-CN]" : cat.region === "zh-TW" ? "🇹🇼 [zh-TW]" : "🇭🇰 [zh-HK]";
                return (
                  <option key={v.name} value={v.name}>
                    {prefix} {v.name} ({v.lang})
                  </option>
                );
              })}
            </select>
          ) : (
            <p className="rounded-lg border border-dashed border-destructive/40 bg-destructive/10 p-2 text-xs text-destructive">
              Không tìm thấy giọng tiếng Trung (zh) nào trong trình duyệt. Vui lòng cài gói tiếng Trung trong Settings hệ điều hành.
            </p>
          )}

          {/* Active Voice Status Banner */}
          {activeVoiceObj && activeVoiceCategory ? (
            <div
              className={`rounded-lg p-2.5 text-xs space-y-1.5 border ${
                activeVoiceCategory.isMainland
                  ? "bg-primary/5 border-primary/20 text-foreground"
                  : "bg-amber-500/10 border-amber-500/20 text-foreground"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-semibold flex items-center gap-1.5">
                  {activeVoiceCategory.isMainland ? (
                    <>
                      <CheckCircle2 className="size-3.5 text-primary" />
                      Giọng Chuẩn: {activeVoiceObj.name}
                    </>
                  ) : (
                    <>
                      <AlertTriangle className="size-3.5 text-amber-600" />
                      Giọng Dự Phòng: {activeVoiceObj.name}
                    </>
                  )}
                </span>
                <span
                  className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                    activeVoiceCategory.isMainland
                      ? "bg-primary/10 text-primary"
                      : "bg-amber-500/20 text-amber-700 dark:text-amber-300"
                  }`}
                >
                  {activeVoiceCategory.label}
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground">
                {activeVoiceCategory.isMainland
                  ? "Giọng phát âm Đại lục (zh-CN) chuẩn ngữ âm HSK. Giữ nguyên pitch 1.0 bảo toàn thanh điệu."
                  : "Đang sử dụng giọng Đài Loan (zh-TW) dự phòng theo lựa chọn của bạn. Nên cài đặt thêm giọng zh-CN để đạt độ chuẩn HSK cao nhất."}
              </p>
            </div>
          ) : !hasMainlandVoice && voices.length > 0 ? (
            <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-2.5 text-xs text-amber-800 dark:text-amber-300 space-y-2">
              <div className="flex items-start gap-1.5">
                <Info className="size-4 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold">Chưa phát hiện giọng zh-CN (Giản thể Đại lục)</p>
                  <p className="text-[11px] mt-0.5">
                    Hệ thống đang phát hiện {voices.length} giọng Đài Loan (zh-TW). Theo quy tắc chất lượng, HanLearn không tự ý phát giọng Đài Loan thay cho Đại lục trừ khi bạn chủ động chọn.
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-7 text-xs border-amber-500/40 hover:bg-amber-500/20"
                  onClick={() => handleFallbackSelect(voices[0].name)}
                >
                  Tạm dùng giọng zh-TW: {voices[0].name}
                </Button>
              </div>
            </div>
          ) : null}

          {/* Windows Installation Instructions */}
          {!hasMainlandVoice && (
            <div className="rounded-lg bg-muted/60 p-2.5 text-xs text-muted-foreground space-y-1 leading-relaxed">
              <p className="font-semibold text-foreground flex items-center gap-1.5">
                <Sparkles className="size-3 text-primary" /> Hướng dẫn cài giọng zh-CN (Chinese Simplified) trên Windows:
              </p>
              <ol className="list-decimal pl-4 space-y-0.5 text-[11px]">
                <li>Mở <strong>Windows Settings</strong> (phím <code>Win + I</code>) → <strong>Time & Language</strong>.</li>
                <li>Chọn <strong>Language & Region</strong> → Bấm <strong>Add a language</strong>.</li>
                <li>Tìm kiếm <strong>Chinese (Simplified, China)</strong> (hoặc <em>中文 (中华人民共和国)</em>).</li>
                <li>Tích chọn <strong>Speech</strong> và <strong>Text-to-speech</strong> → Bấm <strong>Install</strong>.</li>
                <li>Khởi động lại trình duyệt Edge/Chrome để nạp giọng <em>Microsoft Huihui</em> / <em>Yaoyao</em>.</li>
              </ol>
            </div>
          )}
        </div>

        {/* Text Input & Presets for Ear Acceptance */}
        <div className="space-y-1.5">
          <label htmlFor="test-phrase" className="text-xs font-medium text-muted-foreground">
            Câu kiểm tra phát âm & thanh điệu
          </label>
          <input
            id="test-phrase"
            type="text"
            value={testText}
            onChange={(e) => setTestText(e.target.value)}
            className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm hanzi"
            placeholder="Nhập chữ Hán cần kiểm tra..."
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-1">
            {PRESET_SENTENCES.map((p) => (
              <button
                key={p.text}
                type="button"
                onClick={() => setTestText(p.text)}
                className={`rounded-lg border px-2.5 py-1.5 text-left text-xs transition-colors ${
                  testText === p.text
                    ? "border-primary bg-primary/10 text-primary font-medium"
                    : "border-border bg-background hover:bg-muted"
                }`}
              >
                <span className="font-semibold block hanzi text-sm">{p.text}</span>
                <span className="text-[11px] text-muted-foreground">{p.note}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Playback Speed Controls */}
        <div className="space-y-1.5">
          <span className="text-xs font-medium text-muted-foreground block">
            Thử nghiệm các mức tốc độ (giữ nguyên pitch = 1.0):
          </span>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              variant={activeRate === MANDARIN_RATES.NORMAL ? "default" : "outline"}
              size="sm"
              onClick={() => handlePlayRate(MANDARIN_RATES.NORMAL, "1.0x Chuẩn")}
              disabled={!activeVoiceObj}
            >
              <Volume2 className="size-4" />
              <span>1.0x (Chuẩn)</span>
            </Button>

            <Button
              type="button"
              variant={activeRate === MANDARIN_RATES.SLOW ? "default" : "outline"}
              size="sm"
              onClick={() => handlePlayRate(MANDARIN_RATES.SLOW, "0.55x Chậm")}
              disabled={!activeVoiceObj}
              title="Mức nghe chậm mặc định mới của HanLearn (~1.5x duration, rõ từng âm)"
            >
              <Snail className="size-4 text-primary" />
              <span>0.55x (Chậm HanLearn)</span>
            </Button>

            <Button
              type="button"
              variant={activeRate === MANDARIN_RATES.VERY_SLOW ? "default" : "outline"}
              size="sm"
              onClick={() => handlePlayRate(MANDARIN_RATES.VERY_SLOW, "0.50x Rất chậm")}
              disabled={!activeVoiceObj}
            >
              <Snail className="size-4" />
              <span>0.5x (Rất chậm)</span>
            </Button>

            <Button
              type="button"
              variant={activeRate === MANDARIN_RATES.GENTLE_SLOW ? "default" : "outline"}
              size="sm"
              onClick={() => handlePlayRate(MANDARIN_RATES.GENTLE_SLOW, "0.70x Chậm nhẹ")}
              disabled={!activeVoiceObj}
            >
              <span>0.7x (Cũ)</span>
            </Button>

            {isPlaying && (
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={handleStop}
              >
                <Square className="size-3.5" />
                <span>Dừng</span>
              </Button>
            )}
          </div>
        </div>

        {/* Real-time Status & Measurements */}
        <div className="rounded-xl border border-border bg-muted/40 p-3 space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Trạng thái:</span>
            <span className="font-medium text-foreground">{status}</span>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1">
            <div className="rounded-lg bg-background p-2 border border-border/60">
              <span className="text-muted-foreground block">Thời gian 1.0x (Chuẩn):</span>
              <span className="font-mono text-sm font-semibold">
                {timings.normalMs ? `${timings.normalMs} ms` : "--"}
              </span>
            </div>
            <div className="rounded-lg bg-background p-2 border border-border/60">
              <span className="text-muted-foreground block">
                Thời gian Chậm ({timings.testedRate ?? "0.55"}x):
              </span>
              <span className="font-mono text-sm font-semibold">
                {timings.slowMs ? `${timings.slowMs} ms` : "--"}
              </span>
            </div>
          </div>

          {ratio && (
            <div className="pt-1 flex items-start gap-1.5 text-muted-foreground">
              {Number(ratio) >= 1.4 ? (
                <CheckCircle2 className="size-3.5 text-primary shrink-0 mt-0.5" />
              ) : (
                <AlertTriangle className="size-3.5 text-amber-500 shrink-0 mt-0.5" />
              )}
              <div>
                <p>
                  Tỉ lệ thời gian (Chậm / Chuẩn):{" "}
                  <strong className="text-foreground">{ratio}x</strong>{" "}
                  <span className="text-[11px]">
                    {Number(ratio) >= 1.4
                      ? "(Khác biệt rõ rệt ~50-70% thời lượng, dễ nhận biết bằng tai)"
                      : "(Chênh lệch nhẹ)"}
                  </span>
                </p>
              </div>
            </div>
          )}

          {lastError && (
            <p className="text-destructive font-medium pt-1">{lastError}</p>
          )}
        </div>

        {/* Manual Ear Verification Checklist */}
        <div className="rounded-xl border border-border bg-card p-3 space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <CheckSquare className="size-4 text-primary" />
              <span className="text-xs font-semibold">Bảng kiểm nghiệm thu bằng tai (Human Ear Acceptance)</span>
            </div>
            <span className="text-[11px] font-mono font-medium text-muted-foreground">
              {checkedCount}/{totalCount} tiêu chí
            </span>
          </div>

          <p className="text-[11px] text-muted-foreground leading-relaxed">
            API events và unit tests chỉ xác nhận logic kích hoạt kỹ thuật. Chất lượng phát âm, thanh điệu và biến điệu bắt buộc phải được người dùng trực tiếp nghe và xác nhận:
          </p>

          <div className="space-y-1.5 pt-1 text-xs">
            <label className="flex items-center gap-2 cursor-pointer hover:text-foreground">
              <input
                type="checkbox"
                checked={checklist.tone1}
                onChange={() => toggleCheck("tone1")}
                className="rounded border-input text-primary focus:ring-primary size-3.5"
              />
              <span>1. <strong>Thanh 1 (Âm bình)</strong>: Cao đều, bằng phẳng (ví dụ: <em>jīn tiān</em>, <em>mā</em>).</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer hover:text-foreground">
              <input
                type="checkbox"
                checked={checklist.tone2}
                onChange={() => toggleCheck("tone2")}
                className="rounded border-input text-primary focus:ring-primary size-3.5"
              />
              <span>2. <strong>Thanh 2 (Dương bình)</strong>: Từ trung bình vút lên cao (ví dụ: <em>xué</em> trong <em>xuéshēng</em>).</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer hover:text-foreground">
              <input
                type="checkbox"
                checked={checklist.tone3}
                onChange={() => toggleCheck("tone3")}
                className="rounded border-input text-primary focus:ring-primary size-3.5"
              />
              <span>3. <strong>Thanh 3 (Thượng thanh)</strong>: Xuống trầm rồi hơi nảy nhẹ (ví dụ: <em>hǎo</em>).</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer hover:text-foreground">
              <input
                type="checkbox"
                checked={checklist.tone4}
                onChange={() => toggleCheck("tone4")}
                className="rounded border-input text-primary focus:ring-primary size-3.5"
              />
              <span>4. <strong>Thanh 4 (Khứ thanh)</strong>: Rơi mạnh, dứt khoát từ đỉnh xuống đáy (ví dụ: <em>xiè</em>, <em>zài</em>).</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer hover:text-foreground">
              <input
                type="checkbox"
                checked={checklist.sandhi}
                onChange={() => toggleCheck("sandhi")}
                className="rounded border-input text-primary focus:ring-primary size-3.5"
              />
              <span>5. <strong>Biến điệu &ldquo;你好&rdquo;</strong>: Hai thanh 3 đứng liền nhau tự nhiên đổi thành thanh 2 + thanh 3 (<em>ní hǎo</em>).</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer hover:text-foreground">
              <input
                type="checkbox"
                checked={checklist.neutralTone}
                onChange={() => toggleCheck("neutralTone")}
                className="rounded border-input text-primary focus:ring-primary size-3.5"
              />
              <span>6. <strong>Thanh nhẹ</strong>: Âm thứ hai đọc ngắn, nhẹ nhàng (ví dụ: <em>xièxie</em>, <em>hǎo ma</em>).</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer hover:text-foreground">
              <input
                type="checkbox"
                checked={checklist.slowClarity}
                onChange={() => toggleCheck("slowClarity")}
                className="rounded border-input text-primary focus:ring-primary size-3.5"
              />
              <span>7. <strong>Tốc độ 0.55x</strong>: Tách bạch rõ rệt giữa các âm, không bị méo cao độ, hỗ trợ nghe học từ hiệu quả.</span>
            </label>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
