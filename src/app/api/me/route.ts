import { getLearner } from "@/features/auth/session";
import { apiError, json } from "@/lib/api";
export const dynamic = "force-dynamic";
export async function GET() {
  try {
    const { user } = await getLearner();
    return json({ id: user.id, email: user.email });
  } catch (error) {
    return apiError(error);
  }
}
