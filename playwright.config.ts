import { defineConfig } from "@playwright/test";

const port = process.env.PLAYWRIGHT_PORT || "3107";
const baseURL = `http://127.0.0.1:${port}`;

export default defineConfig({
  testDir: "./tests",
  use: { baseURL, headless: true, channel: "chrome" },
  webServer: { command: `npm start -- --port ${port}`, url: baseURL, reuseExistingServer: false, timeout: 120000 },
});
