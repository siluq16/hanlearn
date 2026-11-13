"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/empty-state";
import type { ReaderContent, ReaderGrammar, ReaderWord } from "./reader-types";
import { ContentProvenance } from "./provenance";

function Example({
  value,
  showPinyin,
}: {
  value: { hanzi: string; pinyin?: string; translationVi?: string };
  showPinyin: boolean;
}) {
  return (
    <div className="space-y-2 border-l-2 border-primary/30 pl-4">
      <p
        lang="zh-Hans"
        className="hanzi [overflow-wrap:anywhere] text-xl leading-loose"
      >
        {value.hanzi}
      </p>
      {showPinyin && value.pinyin && (
        <p
          data-pinyin-text
          className="[overflow-wrap:anywhere] text-sm text-primary"
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
    <Card>
      <CardContent className="p-5">
        <p
          lang="zh-Hans"
          className="hanzi [overflow-wrap:anywhere] text-3xl leading-relaxed"
        >
          {word.hanzi}
        </p>
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
            className="mt-2 [overflow-wrap:anywhere] text-primary"
          >
            {word.pinyin}
          </p>
        )}
        <p className="my-4 whitespace-pre-wrap [overflow-wrap:anywhere] leading-7">
          {word.meaningVi}
        </p>
        {word.example && (
          <Example value={word.example} showPinyin={showPinyin} />
        )}
        <p className="mt-4 text-xs leading-6 text-muted-foreground">
          Audio chưa khả dụng. Bạn vẫn có thể đọc từ và ví dụ.
        </p>
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
        <p className="text-sm font-medium">Cách hiển thị phiên âm</p>
        <Button
          type="button"
          variant="outline"
          aria-pressed={showPinyin}
          onClick={() => setShowPinyin((v) => !v)}
        >
          Hiển thị pinyin
        </Button>
      </div>
      {content.sections.length > 0 && (
        <nav
          aria-label="Các phần của bài học"
          className="flex flex-wrap gap-x-5 gap-y-1"
        >
          {content.sections.map((s, index) => (
            <a
              key={s.id}
              href={`#section-${s.id}`}
              className="inline-flex min-h-11 items-center text-sm text-primary underline underline-offset-4"
            >
              {index + 1}. {s.title}
            </a>
          ))}
        </nav>
      )}
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
          className="scroll-mt-8 space-y-5 outline-offset-4"
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
                  className={`whitespace-pre-wrap [overflow-wrap:anywhere] leading-8 ${block.lang === "zh-Hans" ? "hanzi text-xl" : "text-sm"}`}
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
