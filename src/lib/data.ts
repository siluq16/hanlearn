import "server-only";
export class DataError extends Error {
  constructor() {
    super("Không tải được dữ liệu học. Vui lòng thử lại.");
  }
}
export function dataOrThrow<T>(result: {
  data: T;
  error: unknown;
}): NonNullable<T> {
  if (result.error || result.data === null || result.data === undefined)
    throw new DataError();
  return result.data as NonNullable<T>;
}

// Avoid Supabase's default row cap silently corrupting counts/progress.
export async function readAll<T>(
  page: (
    from: number,
    to: number,
  ) => PromiseLike<{ data: T[] | null; error: unknown }>,
): Promise<T[]> {
  const rows: T[] = [];
  const size = 500;
  for (let from = 0; from < 100_000; from += size) {
    const batch = dataOrThrow(await page(from, from + size - 1));
    rows.push(...batch);
    if (batch.length < size) return rows;
  }
  throw new DataError(); // Explicit failure instead of displaying truncated statistics.
}
