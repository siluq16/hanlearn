"use server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getPublicConfig } from "@/lib/env";
import { loginSchema } from "./schemas";

export type AuthState = { error?: string };
export async function login(
  _state: AuthState,
  form: FormData,
): Promise<AuthState> {
  const parsed = loginSchema.safeParse({
    email: form.get("email"),
    password: form.get("password"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  if (!getPublicConfig())
    return {
      error:
        "Chưa kết nối môi trường học. Hãy hoàn tất cấu hình Supabase Development.",
    };
  const supabase = await createClient();
  try {
    const { data, error } = await supabase.auth.signInWithPassword(parsed.data);
    if (error || !data.user)
      return {
        error:
          "Không thể đăng nhập. Kiểm tra email, mật khẩu và trạng thái xác nhận tài khoản.",
      };
    const access = await supabase.rpc("get_learner_access");
    if (access.error || access.data !== true || !data.user.email_confirmed_at) {
      await supabase.auth.signOut({ scope: "local" });
      return {
        error: access.error
          ? "Chưa kiểm tra được quyền truy cập. Vui lòng thử lại sau."
          : "Tài khoản chưa được cấp quyền sử dụng HanLearn.",
      };
    }
  } catch {
    return {
      error: "Chưa kết nối được dịch vụ đăng nhập. Vui lòng thử lại sau.",
    };
  }
  revalidatePath("/", "layout");
  redirect("/dashboard");
}

export async function logout(): Promise<void> {
  let failed = false;
  if (getPublicConfig()) {
    try {
      const supabase = await createClient();
      // Revalidate independently. Even a revoked session may clear its own cookies.
      await supabase.auth.getUser();
      const { error } = await supabase.auth.signOut({ scope: "local" });
      failed = !!error;
    } catch {
      failed = true;
    }
  }
  if (failed) redirect("/access?reason=logout");
  revalidatePath("/", "layout");
  redirect("/login");
}
