import type { NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/proxy";
export function proxy(request: NextRequest) {
  return updateSession(request);
}
export const config = {
  matcher: [
    "/login",
    "/dashboard/:path*",
    "/roadmap/:path*",
    "/lessons/:path*",
    "/vocabulary/:path*",
    "/settings/:path*",
    "/api/:path*",
  ],
};
