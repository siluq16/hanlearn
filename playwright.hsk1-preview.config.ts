import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "./tests/hsk1-preview-browser",
  workers: 1,
  reporter: "list",
  use: { baseURL: "http://127.0.0.1:3114", channel: "chrome", trace: "off" },
  projects: [
    {
      name: "preview-desktop",
      use: { viewport: { width: 1280, height: 900 } },
    },
    {
      name: "preview-mobile",
      use: {
        viewport: { width: 360, height: 800 },
        isMobile: true,
        hasTouch: true,
      },
    },
    {
      name: "preview-tablet",
      use: { viewport: { width: 768, height: 1024 } },
    },
  ],
  webServer: {
    command: "npm run preview:hsk1",
    url: "http://127.0.0.1:3114",
    reuseExistingServer: false,
    timeout: 120000,
  },
});
