"use server";
import { revalidatePath } from "next/cache";
import { requireLearner } from "@/features/auth/session";
import { learningEnabled } from "@/lib/learning";
import { getReviewView } from "./queries";
import {
  receiptSchema,
  reviewInput,
  type ReviewError,
  type ReviewResult,
  type RefreshResult,
} from "./contracts";
function failure(
  code: string,
  retryable = false,
  outcomeUnknown = false,
): { ok: false; error: ReviewError } {
  const messages: Record<string, string> = {
    DISABLED: "Ôn tập chưa được mở trong môi trường này.",
    INVALID_INPUT: "Dữ liệu đánh giá chưa hợp lệ.",
    UNAVAILABLE: "Thẻ không còn khả dụng.",
    FORBIDDEN: "Bạn chưa được phép ôn thẻ này.",
    CONFLICT: "Thẻ đã thay đổi hoặc chưa đến hạn. Hãy tải lại danh sách.",
    RETRY:
      "Chưa xác nhận được kết quả. Thử lại đúng đánh giá đã gửi; không chọn lại mức khác.",
  };
  return {
    ok: false,
    error: {
      code,
      message: messages[code] ?? messages.RETRY,
      retryable,
      outcomeUnknown,
    },
  };
}
export async function submitReview(input: unknown): Promise<ReviewResult> {
  const { user, supabase } = await requireLearner();
  const parsed = reviewInput.safeParse(input);
  if (!parsed.success) return failure("INVALID_INPUT");
  if (!learningEnabled("review")) return failure("DISABLED");
  let attempted = false;
  try {
    const p = parsed.data;
    attempted = true;
    const result = await supabase.rpc("submit_review", {
      p_card_id: p.cardId,
      p_rating: p.rating,
      p_response_ms: null,
      p_expected_version: p.expectedVersion,
      p_idempotency_key: p.idempotencyKey,
    });
    if (result.error) {
      const code = result.error.code;
      if (code === "PT404") return failure("UNAVAILABLE");
      if (code === "PT409") return failure("CONFLICT");
      if (["42501", "28000"].includes(code)) return failure("FORBIDDEN");
      if (code === "22023") return failure("INVALID_INPUT");
      return failure("RETRY", true, true);
    }
    const receipt = receiptSchema.parse(result.data);
    if (
      receipt.cardId !== p.cardId ||
      receipt.version !== p.expectedVersion + 1
    )
      return failure("RETRY", true, true);
    // Verify immutable owned evidence; a replay may precede a newer card version.
    const event = await supabase
      .from("review_events")
      .select("card_id,rating,result")
      .eq("user_id", user.id)
      .eq("idempotency_key", p.idempotencyKey)
      .maybeSingle();
    const stored = receiptSchema.safeParse(event.data?.result);
    if (
      event.error ||
      !stored.success ||
      event.data?.card_id !== p.cardId ||
      event.data.rating !== p.rating ||
      JSON.stringify(stored.data) !== JSON.stringify(receipt)
    )
      return failure("RETRY", true, true);
    const view = await getReviewView();
    for (const path of ["/review", "/dashboard", "/vocabulary"])
      revalidatePath(path);
    return { ok: true, receipt, view };
  } catch {
    return failure("RETRY", true, attempted);
  }
}
export async function refreshReview(): Promise<RefreshResult> {
  await requireLearner();
  try {
    return { ok: true, view: await getReviewView() };
  } catch {
    return failure("RETRY", false);
  }
}
