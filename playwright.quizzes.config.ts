import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "./tests/quiz-browser",
  workers: 1,
  reporter: "list",
  use: { baseURL: "http://127.0.0.1:3105", channel: "chrome", trace: "off" },
  projects: [
    { name: "quiz-desktop", use: { viewport: { width: 1280, height: 900 } } },
    {
      name: "quiz-mobile",
      use: {
        viewport: { width: 360, height: 800 },
        isMobile: true,
        hasTouch: true,
      },
    },
  ],
  webServer: {
    command: "node scripts/quiz-ui-harness.mjs",
    url: "http://127.0.0.1:3105",
    reuseExistingServer: false,
    timeout: 60000,
  },
});
