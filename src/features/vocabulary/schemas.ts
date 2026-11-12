import { z } from "zod";
export const vocabularyFiltersSchema = z.object({
  q: z.string().trim().max(100, "Từ khóa tối đa 100 ký tự.").default(""),
  level: z
    .union([z.coerce.number().int().min(1).max(9), z.literal("")])
    .optional(),
  page: z.coerce.number().int().min(1).max(5001).default(1),
});
export const vocabularySearchResultSchema = z.object({
  total: z.number().int().nonnegative(),
  items: z.array(
    z.object({
      id: z.uuid(),
      simplified: z.string(),
      pinyin_marked: z.string(),
      meaning_vi: z.string(),
      introduced_level: z.number().int().min(1).max(9),
      syllabus_code: z.string(),
    }),
  ),
});
