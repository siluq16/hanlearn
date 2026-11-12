import { z } from "zod";
export const loginSchema = z.object({
  email: z.string().trim().max(254).pipe(z.email("Email chưa đúng định dạng.")),
  password: z
    .string()
    .min(1, "Nhập mật khẩu của bạn.")
    .max(128, "Mật khẩu quá dài."),
});
