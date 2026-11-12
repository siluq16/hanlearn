import { z } from "zod";
export const settingsSchema = z.object({
  display_name: z.string().trim().max(80, "Tên hiển thị tối đa 80 ký tự."),
  baseline_hsk_level: z.coerce.number().int().min(0).max(9),
  target_hsk_level: z.coerce.number().int().min(1).max(9),
  preferred_syllabus_id: z.union([z.uuid(), z.literal("")]),
});
