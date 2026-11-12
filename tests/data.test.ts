import { describe, it, expect } from "vitest";
import { readAll, dataOrThrow } from "@/lib/data";
describe("accurate reads", () => {
  it("loads every page rather than accepting a default row cap", async () => {
    const all = Array.from({ length: 1001 }, (_, id) => ({ id }));
    expect(
      await readAll(async (from, to) => ({
        data: all.slice(from, to + 1),
        error: null,
      })),
    ).toHaveLength(1001);
  });
  it("never turns a query error into a misleading empty state", async () => {
    await expect(
      readAll(async () => ({
        data: null,
        error: { message: "private detail" },
      })),
    ).rejects.toThrow("Không tải được dữ liệu");
  });
  it("accepts legitimate zero counts", () =>
    expect(dataOrThrow({ data: 0, error: null })).toBe(0));
});
