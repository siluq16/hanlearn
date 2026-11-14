"use client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/empty-state";
import { MandarinAudioButton, MandarinSpeedToggle } from "@/components/mandarin-audio";
import { stopMandarin } from "@/lib/mandarin-speech";
import type { ReaderContent, ReaderGrammar, ReaderWord } from "./reader-types";
import { ContentProvenance } from "./provenance";
import { SectionNavigation } from "./section-navigation";

function Example({
  value,
  showPinyin,
}: {
  value: { hanzi: string; pinyin?: string; translationVi?: string };
  showPinyin: boolean;
}) {
  return (
    <div
      data-lesson-example
      className="max-w-prose space-y-2 rounded-r-xl border-l-2 border-primary/30 bg-secondary/40 px-4 py-3"
    >
      <div className="flex items-start justify-between gap-2">
        <p
          lang="zh-Hans"
          className="hanzi whitespace-pre-wrap [overflow-wrap:anywhere] text-xl leading-loose sm:text-2xl"
        >
          {value.hanzi}
        </p>
        <MandarinAudioButton
          text={value.hanzi}
          showSlow
          size="sm"
          variant="ghost"
        />
      </div>
      {showPinyin && value.pinyin && (
        <p
          data-pinyin-text
          className="whitespace-pre-wrap [overflow-wrap:anywhere] text-sm leading-7 text-primary"
        >
          {value.pinyin}
        </p>
      )}
      {value.translationVi && (
        <p className="whitespace-pre-wrap [overflow-wrap:anywhere] text-sm leading-7">
          {value.translationVi}
        </p>
      )}
    </div>
  );
}
function WordCard({
  word,
  showPinyin,
}: {
  word: ReaderWord;
  showPinyin: boolean;
}) {
  return (
    <Card data-vocabulary-card className="min-w-0 self-start">
      <CardContent className="p-5 sm:p-6">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="mb-1 text-xs font-medium text-muted-foreground">Hán tự</p>
            <p
              lang="zh-Hans"
              className="hanzi [overflow-wrap:anywhere] text-4xl leading-relaxed"
            >
              {word.hanzi}
            </p>
          </div>
          <MandarinAudioButton
            text={word.hanzi}
            showSlow
            label="Phát âm"
            size="sm"
            variant="outline"
          />
        </div>
        {word.traditional && (
          <p
            lang="zh-Hant"
            className="hanzi mt-1 [overflow-wrap:anywhere] text-lg text-muted-foreground"
          >
            {word.traditional}
          </p>
        )}
        {showPinyin && (
          <p
            data-pinyin-text
            aria-label="Pinyin"
            className="mt-1 [overflow-wrap:anywhere] text-lg leading-8 text-primary"
          >
            {word.pinyin}
          </p>
        )}
        <div className="my-5 space-y-2 border-t border-border pt-4">
          <p className="text-xs font-medium text-muted-foreground">
            Nghĩa & cách dùng
          </p>
          <p
            data-word-meaning
            className="whitespace-pre-wrap [overflow-wrap:anywhere] text-base leading-8"
          >
            {/* Preserve every character; parentheses get visual emphasis only.
                Semicolons are not inferred to separate definitions from usage. */}
            {word.meaningVi.split(/(\([^()]*\))/u).map((part, i) => (
              <span
                key={i}
                className={
                  part.startsWith("(") && part.endsWith(")")
                    ? "text-sm text-muted-foreground"
                    : "font-medium"
                }
              >
                {part}
              </span>
            ))}
          </p>
        </div>
        {word.example && (
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground">Ví dụ</p>
            <Example value={word.example} showPinyin={showPinyin} />
          </div>
        )}
        <ContentProvenance value={word.provenance} />
      </CardContent>
    </Card>
  );
}
function GrammarCard({
  grammar,
  showPinyin,
}: {
  grammar: ReaderGrammar;
  showPinyin: boolean;
}) {
  return (
    <Card>
      <CardContent className="space-y-4 p-5">
        <h3 className="[overflow-wrap:anywhere] text-lg font-semibold">
          {grammar.title}
        </h3>
        <p
          lang="zh-Hans"
          className="hanzi [overflow-wrap:anywhere] text-xl leading-loose"
        >
          {grammar.pattern}
        </p>
        <p className="whitespace-pre-wrap [overflow-wrap:anywhere] text-sm leading-7">
          {grammar.explanationVi}
        </p>
        {grammar.examples.map((example, index) => (
          <Example key={index} value={example} showPinyin={showPinyin} />
        ))}
        <ContentProvenance value={grammar.provenance} />
      </CardContent>
    </Card>
  );
}
export function LessonReader({ content, vocabulary, grammar }: ReaderContent) {
  const [showPinyin, setShowPinyin] = useState(true);

  useEffect(() => {
    return () => {
      stopMandarin();
    };
  }, []);
  const usedWords = new Set(
    content.sections.flatMap((s) =>
      s.type === "vocabulary_refs" ? s.vocabularyIds : [],
    ),
  );
  const usedGrammar = new Set(
    content.sections.flatMap((s) =>
      s.type === "grammar_refs" ? s.grammarIds : [],
    ),
  );
  const remainingWords = vocabulary.filter((w) => !usedWords.has(w.id)),
    remainingGrammar = grammar.filter((g) => !usedGrammar.has(g.id));
  return (
    <div className="min-w-0 space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-muted p-4">
        <div className="flex flex-wrap items-center gap-3">
          <p className="text-sm font-medium">Tốc độ phát âm:</p>
          <MandarinSpeedToggle />
        </div>
        <Button
          type="button"
          variant="outline"
          aria-pressed={showPinyin}
          onClick={() => setShowPinyin((v) => !v)}
        >
          Hiển thị pinyin
        </Button>
      </div>
      {vocabulary.length > 0 && (
        <p
          data-vocabulary-audio-notice
          className="rounded-xl border border-dashed border-border px-4 py-3 text-sm leading-7 text-muted-foreground"
        >
          Audio từ vựng chưa khả dụng trong bài này. Bạn có thể đọc Hán tự,
          pinyin và ví dụ bên dưới.
        </p>
      )}
      <SectionNavigation sections={content.sections} />
      {content.sections.length === 0 && (
        <EmptyState
          title="Chưa có phần nội dung"
          description="Các phần bài học sẽ hiển thị khi nội dung được phát hành hợp lệ."
        />
      )}
      {content.sections.map((section, index) => (
        <section
          key={section.id}
          id={`section-${section.id}`}
          tabIndex={-1}
          aria-labelledby={`heading-${section.id}`}
          className="scroll-mt-32 space-y-5 rounded-xl outline-offset-4"
        >
          <h2
            id={`heading-${section.id}`}
            className="[overflow-wrap:anywhere] text-xl font-semibold"
          >
            {index + 1}. {section.title}
          </h2>
          {section.type === "text" &&
            section.blocks.map((block, i) =>
              block.type === "paragraph" ? (
                <p
                  key={i}
                  lang={block.lang}
                  className={`max-w-prose whitespace-pre-wrap [overflow-wrap:anywhere] leading-8 ${block.lang === "zh-Hans" ? "hanzi text-xl" : "text-base"}`}
                >
                  {block.text}
                </p>
              ) : (
                <Example key={i} value={block} showPinyin={showPinyin} />
              ),
            )}
          {section.type === "vocabulary_refs" && (
            <div className="grid gap-4 sm:grid-cols-2">
              {section.vocabularyIds.map((id) => {
                const word = vocabulary.find((w) => w.id === id);
                return word ? (
                  <WordCard key={id} word={word} showPinyin={showPinyin} />
                ) : null;
              })}
            </div>
          )}
          {section.type === "grammar_refs" && (
            <div className="space-y-4">
              {section.grammarIds.map((id) => {
                const item = grammar.find((g) => g.id === id);
                return item ? (
                  <GrammarCard
                    key={id}
                    grammar={item}
                    showPinyin={showPinyin}
                  />
                ) : null;
              })}
            </div>
          )}
          {section.type === "listening" && (
            <div className="space-y-4 rounded-2xl border border-dashed border-border p-5">
              <p className="text-sm leading-7 text-muted-foreground">
                Audio của phần nghe chưa khả dụng. Bản chữ được hiển thị bên
                dưới nếu đã có nội dung.
              </p>
              {section.transcript.map((example, i) => (
                <Example key={i} value={example} showPinyin={showPinyin} />
              ))}
            </div>
          )}
        </section>
      ))}
      {remainingWords.length > 0 && (
        <section aria-label="Từ vựng khác trong bài" className="space-y-4">
          <h2 className="text-xl font-semibold">Từ vựng trong bài</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {remainingWords.map((w) => (
              <WordCard key={w.id} word={w} showPinyin={showPinyin} />
            ))}
          </div>
        </section>
      )}
      {remainingGrammar.length > 0 && (
        <section aria-label="Ngữ pháp khác trong bài" className="space-y-4">
          <h2 className="text-xl font-semibold">Ngữ pháp trong bài</h2>
          {remainingGrammar.map((g) => (
            <GrammarCard key={g.id} grammar={g} showPinyin={showPinyin} />
          ))}
        </section>
      )}
    </div>
  );
}
