import { defineConfig, devices } from "@playwright/test";
const port = process.env.HANLEARN_E2E_PORT || "3000";
if (!/^\d{4,5}$/.test(port) || Number(port) < 1024 || Number(port) > 65535)
  throw new Error("HANLEARN_E2E_PORT must be a valid local port >=1024");
const baseURL = `http://127.0.0.1:${port}`;
export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: false,
  workers: 1,
  reporter: [["list"]],
  use: {
    baseURL,
    channel: process.env.PLAYWRIGHT_CHANNEL || undefined,
    screenshot: "only-on-failure",
    trace: "off",
  },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"] } },
    {
      name: "mobile",
      use: {
        viewport: { width: 390, height: 844 },
        isMobile: true,
        hasTouch: true,
      },
    },
  ],
  webServer: {
    command: `npm run start -- --port ${port}`,
    url: `${baseURL}/login`,
    reuseExistingServer: false,
    timeout: 60_000,
  },
});
