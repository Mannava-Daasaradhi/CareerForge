import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  timeout: 60000,         // 60s per test (LLM calls can be slow)
  retries: 1,             // retry once on failure (flaky network)
  workers: 2,             // run 2 tests in parallel
  reporter: [
    ["html", { outputFolder: "playwright-report", open: "never" }],
    ["list"],             // live output in terminal
  ],

  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL || "https://careerforge-zbdw.onrender.com",
    screenshot: "only-on-failure",   // screenshot every failed test
    video: "retain-on-failure",      // record video of failed tests
    trace: "on-first-retry",         // trace on retry for debugging
    headless: true,
  },

  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "mobile",
      use: { ...devices["iPhone 14"] },
      // Only run page load checks on mobile
      testMatch: "**/careerforge.spec.ts",
      grep: /Page Loads/,
    },
  ],
});
