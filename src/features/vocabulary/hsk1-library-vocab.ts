import fs from "node:fs";
import path from "node:path";
import { createHash } from "node:crypto";

export interface HSK1VocabItem {
  id: string;
  simplified: string;
  traditional?: string;
  pinyin_marked: string;
  meaning_vi: string;
  introduced_level: number;
  syllabus_code: string;
  example_zh?: string;
  example_pinyin?: string;
  example_vi?: string;
}

let cachedItems: HSK1VocabItem[] | null = null;

function generateUUIDFromStr(str: string): string {
  const hash = createHash("md5").update(str).digest("hex");
  return `${hash.slice(0, 8)}-${hash.slice(8, 12)}-4${hash.slice(13, 16)}-a${hash.slice(17, 20)}-${hash.slice(20, 32)}`;
}

export function getOfficial300VocabItems(): HSK1VocabItem[] {
  if (cachedItems) return cachedItems;

  const vocabPath = path.join(process.cwd(), "content/hsk_library/hsk1_vocabulary.json");
  const official300Path = path.join(
    process.cwd(),
    "content/hsk_library/hsk1_exam_2025_official_300.json"
  );

  let vocabList: Array<Record<string, unknown>> = [];
  if (fs.existsSync(vocabPath)) {
    vocabList = JSON.parse(fs.readFileSync(vocabPath, "utf-8"));
  }

  const vocabMap = new Map<string, Record<string, unknown>>();
  for (const v of vocabList) {
    const hz = String(v.simplified || v.raw_hanzi || "");
    if (hz && !vocabMap.has(hz)) {
      vocabMap.set(hz, v);
    }
  }

  let official300: Array<{
    hanzi: string;
    pinyin: string;
    meaning_vi?: string;
    meaning_en?: string;
    example_zh?: string;
    example_pinyin?: string;
    example_vi?: string;
  }> = [];
  if (fs.existsSync(official300Path)) {
    official300 = JSON.parse(fs.readFileSync(official300Path, "utf-8"));
  }

  const items: HSK1VocabItem[] = [];

  for (const item of official300) {
    const hz = item.hanzi;
    const v = vocabMap.get(hz);

    let meaningVi = "";
    if (item.meaning_vi) {
      meaningVi = item.meaning_vi;
    } else if (v && v.meaning_vi) {
      meaningVi = String(v.meaning_vi);
    } else if (v && v.raw_definition) {
      meaningVi = String(v.raw_definition);
    } else {
      meaningVi = item.meaning_en || "Từ vựng HSK 1 chuẩn 2025";
    }

    let exampleZh = item.example_zh || "";
    let examplePy = item.example_pinyin || "";
    let exampleVi = item.example_vi || "";

    if (!exampleZh && v && v.example_zh_py) {
      const cleaned = String(v.example_zh_py).replace(/\s+/g, " ").trim();
      const match = cleaned.match(
        /^([\u4e00-\u9fff0-9，。！？、“”‘’：；（）\s]+?)\s*([A-Za-z\u00C0-\u024F\u1E00-\u1EFF].*)$/
      );
      if (match) {
        exampleZh = match[1].trim();
        examplePy = match[2].trim();
      } else {
        exampleZh = cleaned;
      }
    }
    if (!exampleVi && v && v.example_vi) {
      exampleVi = String(v.example_vi);
    }

    items.push({
      id: generateUUIDFromStr(`hsk1_word_${hz}`),
      simplified: hz,
      pinyin_marked: item.pinyin,
      meaning_vi: meaningVi,
      introduced_level: 1,
      syllabus_code: "HSK_2025",
      example_zh: exampleZh || undefined,
      example_pinyin: examplePy || undefined,
      example_vi: exampleVi || undefined,
    });
  }

  cachedItems = items;
  return items;
}

export const HSK1_LIBRARY_VOCABULARY: HSK1VocabItem[] = getOfficial300VocabItems();
