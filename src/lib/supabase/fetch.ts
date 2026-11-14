// Persisted readback after an RPC must not reuse an earlier GET from that request.
// Next's request memoization also applies to no-store fetches unless a signal opts out.
export const uncachedFetch: typeof fetch = (input, init) =>
  fetch(input, {
    ...init,
    cache: "no-store",
    signal: init?.signal ?? new AbortController().signal,
  });
