import { afterEach, expect, it, vi } from "vitest";
import { uncachedFetch } from "@/lib/supabase/fetch";
afterEach(() => vi.unstubAllGlobals());
it("forces fresh readback and opts out of Next request memoization", async () => {
  const fetch = vi.fn().mockResolvedValue(new Response("{}"));
  vi.stubGlobal("fetch", fetch);
  await uncachedFetch("https://example.invalid/rest/v1/lesson_progress", {
    cache: "force-cache",
  });
  await uncachedFetch("https://example.invalid/rest/v1/lesson_progress");
  expect(fetch.mock.calls[0][1].cache).toBe("no-store");
  expect(fetch.mock.calls[0][1].signal).toBeInstanceOf(AbortSignal);
  expect(fetch.mock.calls[0][1].signal).not.toBe(fetch.mock.calls[1][1].signal);
});
it("preserves the caller's cancellation and request parameters", async () => {
  const fetch = vi.fn().mockResolvedValue(new Response("{}"));
  vi.stubGlobal("fetch", fetch);
  const signal = new AbortController().signal;
  await uncachedFetch("https://example.invalid/rest/v1/rpc/start_quiz", {
    signal,
    method: "POST",
    body: "{}",
  });
  expect(fetch.mock.calls[0][1]).toMatchObject({
    signal,
    method: "POST",
    body: "{}",
    cache: "no-store",
  });
});
