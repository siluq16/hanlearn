import fs from "node:fs";
import path from "node:path";
import { createHash } from "node:crypto";

export interface HSK1VocabItem {
  id: string;
  canonical_source_id: string;
  pilot_v1_id: string | null;
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

// Authoritative Pilot v1 database UUIDs for the 43 Pilot words that belong to the HSK 1 300-word syllabus.
// Preserving these IDs as the effective database IDs prevents duplicate rows and keeps all SRS review_cards FKs intact.
export const PILOT_V1_VOCAB_ID_BY_HANZI: Record<string, string> = {
  "爸爸": "a1c65d77-b773-5f55-a5ed-c44dc908e6c0",
  "不": "df6876e3-e013-584d-b584-64c5d6f29048",
  "的": "a6c5e400-0154-5884-9810-f8245adfce8e",
  "点": "a0c51256-1682-5c09-9736-7996bd8293f2",
  "二": "ed5ea8de-bd9e-5674-adfe-03c941ac6326",
  "哥哥": "ed41c330-70ca-5535-8bdb-8b19b661bd11",
  "个": "cdf09665-aaf2-5aad-8697-073a91f5ddaa",
  "汉语": "d3550460-986b-55cf-8138-fe4a18985944",
  "好": "897e5fd5-e644-5a70-ac8c-07c42afbbc8f",
  "号": "e1833506-f5f1-50bd-9fd2-db12b5116daf",
  "和": "2aa17a86-f44e-5af2-87e3-32eb104bf7f5",
  "很": "fb146dc3-9976-50a8-93dd-b0789c7256e1",
  "几": "a5b9ce23-a21a-59e7-9975-0a9c973d63ad",
  "家": "81ce53a0-5394-5278-81fe-c67961c8c34d",
  "叫": "169b7623-b96a-5447-940b-f54efd6e2547",
  "姐姐": "09dc1b31-fa1c-5727-8eb5-79cbd86b5a89",
  "今天": "14303981-2984-5515-8609-95898457dd7c",
  "口": "7dec5724-9256-5404-8938-647c52f6f504",
  "两": "30dd26d7-593c-5002-b3de-e1fd35b87562",
  "六": "92bb88c4-2ec0-5692-8c10-cfd92fdd7236",
  "妈妈": "29784008-ba30-53e7-9f9d-04c98583dc51",
  "吗": "cce00807-ca0f-59fe-acbe-81d6744583c0",
  "名字": "eb4ddeb1-4d84-52d7-a951-9837dea7bb44",
  "呢": "bccefc87-a163-5bde-b48a-438de4aa4986",
  "你": "04c5a876-74d3-5b7d-9cde-416352dcd276",
  "七": "1c06f13a-f7a7-578d-97fe-fa27691960e3",
  "人": "ce2949af-3761-5a54-8a8b-8dbf2275bbd4",
  "三": "a925741e-b594-59dc-8a10-ee8600a4caad",
  "什么": "f49235d6-fdb0-58cf-89cf-b7af56a5a44b",
  "是": "ce52e655-b0aa-5915-b790-63712a3180bd",
  "四": "ad545a62-ac16-5d78-ac42-377f56bc4716",
  "天": "c390f103-ab57-531b-808b-e1c734509c22",
  "我": "8ae98d4e-69f1-54c1-ba0b-bc28c69f903b",
  "五": "0253f3c8-fe61-55ac-9cb1-16fc9666484a",
  "现在": "868d7848-c3ba-5927-bd3b-d2e5a9cca96e",
  "谢谢": "29771f36-43ad-5f67-bf22-a8fc61f82896",
  "星期": "0f23d9ef-ed12-5186-a65a-8bc3a350f4b0",
  "学习": "3c264a8e-b7c4-5840-a799-f465fcd4fa6f",
  "一": "0ed1f027-db68-53f8-b6db-53bb833bdbbb",
  "有": "8d613286-431b-5f14-8ed7-e45ca0178168",
  "月": "d2e5ae40-9d1c-5436-99a4-0403d8a7a4fc",
  "再见": "4b0c6509-4af7-53e6-92bb-51b68cc8285b",
  "中国": "d610982b-750e-5c68-b58e-4ae39f8badaf",
};

let cachedItems: HSK1VocabItem[] | null = null;
let lookupByIdOrHanzi: Map<string, HSK1VocabItem> | null = null;

export function generateCanonicalSourceUUID(hanzi: string): string {
  const hash = createHash("md5").update(`hsk1_word_${hanzi}`).digest("hex");
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
  const indexMap = new Map<string, HSK1VocabItem>();

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

    const canonicalSourceId = generateCanonicalSourceUUID(hz);
    const pilotId = PILOT_V1_VOCAB_ID_BY_HANZI[hz] || null;
    const effectiveId = pilotId ?? canonicalSourceId;

    const entry: HSK1VocabItem = {
      id: effectiveId,
      canonical_source_id: canonicalSourceId,
      pilot_v1_id: pilotId,
      simplified: hz,
      pinyin_marked: item.pinyin,
      meaning_vi: meaningVi,
      introduced_level: 1,
      syllabus_code: "HSK_2025",
      example_zh: exampleZh || undefined,
      example_pinyin: examplePy || undefined,
      example_vi: exampleVi || undefined,
    };

    items.push(entry);
    indexMap.set(entry.id, entry);
    indexMap.set(entry.canonical_source_id, entry);
    indexMap.set(entry.simplified, entry);
  }

  cachedItems = items;
  lookupByIdOrHanzi = indexMap;
  return items;
}

export function findOfficial300VocabItem(idOrHanzi: string): HSK1VocabItem | undefined {
  if (!lookupByIdOrHanzi) {
    getOfficial300VocabItems();
  }
  return lookupByIdOrHanzi?.get(idOrHanzi);
}

export const HSK1_LIBRARY_VOCABULARY: HSK1VocabItem[] = getOfficial300VocabItems();
