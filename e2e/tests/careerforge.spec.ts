import { test, expect, Page } from "@playwright/test";

// ─────────────────────────────────────────────────────────────────────────────
// CareerForge E2E Test Suite
// Tests every page and feature on the live site.
// Run: npx playwright test
// ─────────────────────────────────────────────────────────────────────────────

const BASE_URL = process.env.PLAYWRIGHT_BASE_URL || "https://careerforge-zbdw.onrender.com";
const BACKEND_URL = process.env.PLAYWRIGHT_BACKEND_URL || "https://careerforge-backend-production-0618.up.railway.app";
const TEST_EMAIL = process.env.TEST_EMAIL || "test@careerforge.io";
const TEST_PASSWORD = process.env.TEST_PASSWORD || "TestPassword123!";

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────

async function loginUser(page: Page) {
  await page.goto(`${BASE_URL}/login`);
  await page.fill('input[type="email"]', TEST_EMAIL);
  await page.fill('input[type="password"]', TEST_PASSWORD);
  await page.click('button[type="submit"]');
  // Wait for redirect to dashboard
  await page.waitForURL(`${BASE_URL}/dashboard`, { timeout: 15000 });
}

async function checkPageLoads(page: Page, path: string, expectedText: string) {
  await page.goto(`${BASE_URL}${path}`);
  await expect(page.locator("body")).toContainText(expectedText, { timeout: 10000 });
}

// ─────────────────────────────────────────────────────────────────────────────
// GROUP 1: BACKEND HEALTH (no auth needed)
// ─────────────────────────────────────────────────────────────────────────────

test.describe("Backend Health", () => {
  test("health check returns active status", async ({ request }) => {
    const res = await request.get(`${BACKEND_URL}/`);
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.status).toBe("active");
  });

  test("GitHub audit returns trust score for torvalds", async ({ request }) => {
    const res = await request.get(`${BACKEND_URL}/api/audit/torvalds`);
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body).toHaveProperty("trust_score");
    expect(typeof body.trust_score).toBe("number");
    expect(body.trust_score).toBeGreaterThan(0);
  });

  test("public profile endpoint responds", async ({ request }) => {
    const res = await request.get(`${BACKEND_URL}/api/public/profile/torvalds`);
    expect(res.status()).toBe(200);
  });

  test("protected routes return 401 without token", async ({ request }) => {
    const routes = [
      { method: "POST", path: "/api/challenge/new", body: { topic: "Python", difficulty: 50 } },
      { method: "POST", path: "/api/career/roadmap", body: { skill_gaps: ["Redis"], target_role: "Backend Engineer" } },
      { method: "POST", path: "/api/recruiter/ask", body: { username: "test", question: "hi" } },
    ];

    for (const route of routes) {
      const res = await request.post(`${BACKEND_URL}${route.path}`, {
        data: route.body,
        headers: { "Content-Type": "application/json" },
      });
      expect(res.status()).toBe(401);
    }
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// GROUP 2: AUTH FLOW
// ─────────────────────────────────────────────────────────────────────────────

test.describe("Authentication", () => {
  test("root redirects to login when unauthenticated", async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForURL(`${BASE_URL}/login`, { timeout: 10000 });
    await expect(page).toHaveURL(`${BASE_URL}/login`);
  });

  test("login page renders correctly", async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test("login with wrong password shows error", async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    await page.fill('input[type="email"]', "wrong@careerforge.io");
    await page.fill('input[type="password"]', "wrongpassword");
    await page.click('button[type="submit"]');
    // Should see an error in the terminal log section
    await expect(page.locator("text=FATAL ERROR")).toBeVisible({ timeout: 10000 });
  });

  test("login with valid credentials redirects to dashboard", async ({ page }) => {
    await loginUser(page);
    await expect(page).toHaveURL(`${BASE_URL}/dashboard`);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// GROUP 3: PAGE LOAD CHECKS (authenticated)
// ─────────────────────────────────────────────────────────────────────────────

test.describe("Page Loads (Authenticated)", () => {
  test.beforeEach(async ({ page }) => {
    await loginUser(page);
  });

  test("/dashboard loads with agent status cards", async ({ page }) => {
    await page.goto(`${BASE_URL}/dashboard`);
    await expect(page.locator("body")).toContainText("Command", { timeout: 10000 });
  });

  test("/interview loads voice interface", async ({ page }) => {
    await page.goto(`${BASE_URL}/interview`);
    await expect(page.locator("body")).toContainText("Interview", { timeout: 10000 });
  });

  test("/resume loads upload interface", async ({ page }) => {
    await page.goto(`${BASE_URL}/resume`);
    await expect(page.locator("body")).toContainText("Resume", { timeout: 10000 });
  });

  test("/challenge loads proving ground", async ({ page }) => {
    await page.goto(`${BASE_URL}/challenge`);
    await expect(page.locator("body")).toContainText("Challenge", { timeout: 10000 });
  });

  test("/roadmap loads skill tree", async ({ page }) => {
    await page.goto(`${BASE_URL}/roadmap`);
    await expect(page.locator("body")).toContainText("Roadmap", { timeout: 10000 });
  });

  test("/kanban loads job pipeline", async ({ page }) => {
    await page.goto(`${BASE_URL}/kanban`);
    await expect(page.locator("body")).toContainText("Kanban", { timeout: 10000 });
  });

  test("/hunter loads job search", async ({ page }) => {
    await page.goto(`${BASE_URL}/hunter`);
    await expect(page.locator("body")).toContainText("Hunter", { timeout: 10000 });
  });

  test("/negotiator loads salary dojo", async ({ page }) => {
    await page.goto(`${BASE_URL}/negotiator`);
    await expect(page.locator("body")).toContainText("Negotiat", { timeout: 10000 });
  });

  test("/outreach loads network sniper", async ({ page }) => {
    await page.goto(`${BASE_URL}/outreach`);
    await expect(page.locator("body")).toContainText("Outreach", { timeout: 10000 });
  });

  test("/passport loads skill passport", async ({ page }) => {
    await page.goto(`${BASE_URL}/passport`);
    await expect(page.locator("body")).toContainText("Passport", { timeout: 10000 });
  });

  test("/recruiter loads digital twin", async ({ page }) => {
    await page.goto(`${BASE_URL}/recruiter`);
    await expect(page.locator("body")).toContainText("Recruiter", { timeout: 10000 });
  });

  test("/experiments loads A/B tester", async ({ page }) => {
    await page.goto(`${BASE_URL}/experiments`);
    await expect(page.locator("body")).toContainText("A/B", { timeout: 10000 });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// GROUP 4: FEATURE TESTS (authenticated + real API calls)
// ─────────────────────────────────────────────────────────────────────────────

test.describe("Feature: Challenge Generator", () => {
  test.beforeEach(async ({ page }) => {
    await loginUser(page);
  });

  test("generates a challenge and displays broken code", async ({ page }) => {
    await page.goto(`${BASE_URL}/challenge`);

    // Click "New Challenge"
    await page.click("button:has-text('New Challenge')");

    // Wait for LLM response (up to 30s)
    await expect(page.locator("textarea")).not.toBeEmpty({ timeout: 30000 });

    // Should show a title and the broken code in the editor
    await expect(page.locator("h2")).toBeVisible({ timeout: 30000 });
  });
});

test.describe("Feature: Career Roadmap", () => {
  test.beforeEach(async ({ page }) => {
    await loginUser(page);
  });

  test("generates a roadmap for a given role and skill gaps", async ({ page }) => {
    await page.goto(`${BASE_URL}/roadmap`);

    // Fill in the inputs
    await page.fill('input[placeholder*="Target Role"]', "Backend Engineer");
    await page.fill('input[placeholder*="Skill gaps"]', "Redis, Docker");

    // Click Generate
    await page.click("button:has-text('Generate Path')");

    // Wait for LLM response
    await expect(page.locator("text=Week 1")).toBeVisible({ timeout: 30000 });
  });
});

test.describe("Feature: Job Hunter", () => {
  test.beforeEach(async ({ page }) => {
    await loginUser(page);
  });

  test("searches for jobs and returns results", async ({ page }) => {
    await page.goto(`${BASE_URL}/hunter`);

    // Fill role input and search
    const roleInput = page.locator("input").first();
    await roleInput.fill("Backend Engineer");
    await page.click("button:has-text('Hunt')");

    // Wait for results
    await expect(page.locator("body")).toContainText("match", { timeout: 30000 });
  });
});

test.describe("Feature: Salary Negotiator", () => {
  test.beforeEach(async ({ page }) => {
    await loginUser(page);
  });

  test("starts a negotiation scenario and gets an offer", async ({ page }) => {
    await page.goto(`${BASE_URL}/negotiator`);

    // Click start
    await page.click("button:has-text('Start')");

    // Should see salary numbers
    await expect(page.locator("body")).toContainText("$", { timeout: 30000 });
  });
});

test.describe("Feature: GitHub Audit", () => {
  test.beforeEach(async ({ page }) => {
    await loginUser(page);
  });

  test("audits a GitHub username and shows trust score", async ({ page }) => {
    await page.goto(`${BASE_URL}/resume`);

    // Find audit input and test with torvalds
    const auditInput = page.locator('input[placeholder*="github" i]').first();
    if (await auditInput.isVisible()) {
      await auditInput.fill("torvalds");
      await page.click("button:has-text('Audit')");
      await expect(page.locator("body")).toContainText("trust", { timeout: 15000 });
    }
  });
});

test.describe("Feature: Outreach Generator", () => {
  test.beforeEach(async ({ page }) => {
    await loginUser(page);
  });

  test("generates cold outreach email", async ({ page }) => {
    await page.goto(`${BASE_URL}/outreach`);

    // Fill in fields
    const inputs = page.locator("input");
    await inputs.nth(0).fill("torvalds");
    await inputs.nth(1).fill("Google");

    await page.click("button:has-text('Generate')");
    await expect(page.locator("body")).toContainText("Subject", { timeout: 30000 });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// GROUP 5: PUBLIC ROUTES (no auth)
// ─────────────────────────────────────────────────────────────────────────────

test.describe("Public Routes", () => {
  test("public candidate profile loads", async ({ page }) => {
    await page.goto(`${BASE_URL}/candidate/torvalds`);
    await expect(page.locator("body")).toContainText("torvalds", { timeout: 10000 });
  });
});
