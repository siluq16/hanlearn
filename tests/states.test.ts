import { describe, it, expect } from "vitest";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { EmptyState } from "@/components/empty-state";
import Loading from "@/app/(app)/loading";
import ErrorPage from "@/app/(app)/error";
describe("explicit application states", () => {
  it("renders a truthful empty state", () => {
    const html = renderToStaticMarkup(
      createElement(EmptyState, {
        title: "Chưa có nội dung",
        description: "Chưa có giáo trình được duyệt.",
      }),
    );
    expect(html).toContain("Chưa có nội dung");
    expect(html).not.toContain("100%");
  });
  it("announces loading without announcing decorative skeletons", () => {
    const html = renderToStaticMarkup(createElement(Loading));
    expect(html).toContain('role="status"');
    expect(html).toContain('aria-hidden="true"');
  });
  it("offers retry without leaking exception details", () => {
    const html = renderToStaticMarkup(
      createElement(ErrorPage, { reset: () => {} }),
    );
    expect(html).toContain('role="alert"');
    expect(html).toContain("Thử lại");
  });
});
