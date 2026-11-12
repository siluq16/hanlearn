import "server-only";
import { NextResponse } from "next/server";
import { AccessError } from "@/features/auth/session";
export function json(body: unknown, status = 200) {
  return NextResponse.json(body, {
    status,
    headers: { "Cache-Control": "private, no-store" },
  });
}
export function apiError(error: unknown) {
  if (error instanceof AccessError) {
    const status =
      error.reason === "unauthenticated"
        ? 401
        : error.reason === "forbidden"
          ? 403
          : 503;
    return json(
      {
        error:
          status === 401
            ? "authentication_required"
            : status === 403
              ? "access_denied"
              : "service_unavailable",
      },
      status,
    );
  }
  return json({ error: "service_unavailable" }, 503);
}
