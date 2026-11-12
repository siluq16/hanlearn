import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "./tests/lesson-browser",
  workers: 1,
  reporter: "list",
  use: {
    baseURL: "http://127.0.0.1:3103",
    channel: process.env.PLAYWRIGHT_CHANNEL || "chrome",
    trace: "off",
    screenshot: "only-on-failure",
  },
  projects: [
    { name: "lesson-desktop", use: { viewport: { width: 1280, height: 900 } } },
    {
      name: "lesson-mobile",
      use: {
        viewport: { width: 360, height: 800 },
        isMobile: true,
        hasTouch: true,
      },
    },
  ],
  webServer: {
    command: "node scripts/lesson-ui-harness.mjs",
    url: "http://127.0.0.1:3103",
    reuseExistingServer: false,
    timeout: 60000,
  },
});
