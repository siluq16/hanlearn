import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "./tests/review-browser",
  workers: 1,
  reporter: "list",
  use: { baseURL: "http://127.0.0.1:3110", channel: "chrome", trace: "off" },
  projects: [
    { name: "review-desktop", use: { viewport: { width: 1280, height: 900 } } },
    {
      name: "review-mobile",
      use: {
        viewport: { width: 360, height: 800 },
        isMobile: true,
        hasTouch: true,
      },
    },
  ],
  webServer: {
    command: "node scripts/review-ui-harness.mjs",
    url: "http://127.0.0.1:3110",
    reuseExistingServer: false,
    timeout: 60000,
  },
});
