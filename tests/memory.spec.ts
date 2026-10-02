import { test, expect } from "@playwright/test";

test("building stages distinguish telemetry from assistant capacity", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Design for scale" }).click();
  await expect(page.getByRole("heading", { name: "Design for scale" })).toBeVisible();
  await page.getByRole("button", { name: "2. Grow the estate" }).click();
  await expect(page).toHaveURL(/#enterprise\/grow$/);
  await expect(page.locator(".scale-metrics")).toContainText("36,000,000");
  await expect(page.locator(".scale-metrics")).toContainText("0.29");
  await page.getByRole("radio", { name: /Global portfolio/ }).click();
  await expect(page.getByRole("list", { name: "Global portfolio memory architecture" })).toContainText("Regional memory databases");
  await expect(page.locator(".scale-metrics")).toContainText("720,000,000");
  await expect(page.locator(".scale-metrics")).toContainText("6 GB");
  await page.getByRole("slider", { name: "Peak traffic multiplier" }).fill("10");
  await expect(page.locator(".scale-metrics")).toContainText("11.57");
  await expect(page.locator(".scale-metrics")).toContainText("100,000");
  await page.getByRole("radio", { name: /One building/ }).click();
  await expect(page.locator(".scale-metrics")).toContainText("720,000");
  await expect(page.locator(".scale-metrics")).toContainText("0.006 GB");
});

test("each building situation changes memories and handles an offline connection", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Design for scale" }).click();
  const examples = [
    { name: "Too hot again", memory: "sticking damper", connected: "damper inspection", offline: "today’s cause is unconfirmed" },
    { name: "Lights left on", memory: "cleaning override", connected: "expired override", offline: "cannot confirm who is on the floor" },
    { name: "A fault returns", memory: "pressure-sensor issue", connected: "existing maintenance job", offline: "current equipment status unverified" },
  ];
  for (const example of examples) {
    await page.getByRole("radiogroup", { name: "Building situation" }).getByRole("radio", { name: new RegExp(example.name) }).click();
    await expect(page.getByRole("status")).toHaveCount(0);
    await expect(page.locator(".building-memory-grid article")).toHaveCount(5);
    await expect(page.locator(".building-memory-grid")).toContainText(example.memory);
    await page.getByRole("checkbox", { name: "Simulate building connection offline" }).uncheck();
    await page.getByRole("button", { name: "Walk through this case" }).click();
    await expect(page.getByRole("status")).toContainText(example.connected);
    await page.getByRole("checkbox", { name: "Simulate building connection offline" }).check();
    await expect(page.getByRole("status")).toHaveCount(0);
    await page.getByRole("button", { name: "Walk through this case" }).click();
    await expect(page.getByRole("status")).toContainText(example.offline);
    await expect(page.getByRole("status")).toContainText("Offline outcome");
  }
});

test("smart building examples and global capacity fit a mobile screen", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await page.getByRole("button", { name: "Design for scale" }).click();
  await page.getByRole("button", { name: "2. Grow the estate" }).click();
  await page.getByRole("radio", { name: /Global portfolio/ }).click();
  await page.getByRole("button", { name: "1. One complaint" }).click();
  await page.getByRole("button", { name: "Walk through this case" }).click();
  await expect(page.getByRole("status")).toContainText("Connected outcome");
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await page.screenshot({ path: "test-results/enterprise-mobile.png", fullPage: true });
});

test("edited long-term memory survives new chats and reloads, and the memory switch excludes it", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("textbox", { name: "Memory record 1", exact: true }).fill("Comfort temperature: 72°F");
  await page.getByRole("button", { name: "Run example" }).click();
  await expect(page.locator(".response")).toContainText("72°F");
  await page.getByRole("switch", { name: "Use memory" }).click();
  await page.getByRole("button", { name: "Run example" }).click();
  await expect(page.locator(".response")).not.toContainText("72°F");
  await page.getByRole("button", { name: "New chat" }).click();
  await expect(page.getByRole("textbox", { name: "Memory record 1", exact: true })).toHaveValue("Comfort temperature: 72°F");
  await page.reload();
  await expect(page.getByRole("textbox", { name: "Memory record 1", exact: true })).toHaveValue("Comfort temperature: 72°F");
  await page.getByRole("button", { name: "Working memory", exact: true }).click();
  await expect(page.getByRole("textbox", { name: "Memory record 1", exact: true })).toHaveValue("Space: Riverside Tower, Level 12");
  await page.getByRole("button", { name: "New chat" }).click();
  await expect(page.locator(".record-count")).toHaveText("0 memories");
  await page.getByRole("button", { name: "Run example" }).click();
  await expect(page.locator(".response")).toContainText("Which floor or room");
  await page.getByRole("button", { name: "Reset example" }).click();
  await expect(page.locator(".record-count")).toHaveText("3 memories");
});

test("records can be added and deleted, every example runs, and deletions persist", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("textbox", { name: "New memory", exact: true }).fill("Prefers blinds half-closed");
  await page.getByRole("button", { name: "Add memory", exact: true }).click();
  await expect(page.locator(".record-count")).toHaveText("4 memories");
  await page.getByRole("button", { name: "Delete memory 4", exact: true }).click();
  await expect(page.locator(".record-count")).toHaveText("3 memories");
  for (const name of ["Working memory", "Short-term memory", "Semantic memory", "Episodic memory", "Procedural memory"]) {
    await page.getByRole("button", { name, exact: true }).click();
    await page.getByRole("button", { name: "Run example" }).click();
    await expect(page.locator(".response")).not.toBeEmpty();
  }
  await expect(page.locator(".type-nav .nav-end")).toHaveCount(5);
  await page.getByRole("button", { name: "Compare types" }).click();
  await expect(page.locator("tbody tr")).toHaveCount(5);
  await page.getByRole("button", { name: /Explore memory/ }).click();
  await page.getByRole("button", { name: "Semantic memory", exact: true }).click();
  for (let i = 0; i < 3; i++) await page.getByRole("button", { name: "Delete memory 1", exact: true }).click();
  await expect.poll(() => page.evaluate(() => JSON.parse(localStorage.getItem("memory-lab-v1") ?? "{}").semantic?.length)).toBe(0);
  await page.reload();
  await expect(page.locator(".record-count")).toHaveText("0 memories");
});

test("mobile layout fits the viewport and the example remains usable", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await page.getByRole("button", { name: "Run example" }).click();
  await expect(page.locator(".response")).toContainText("Comfort temperature: 70°F");
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await page.screenshot({ path: "test-results/mobile.png", fullPage: true });
});

test("untouched starter records from earlier versions upgrade while edited records are kept", async ({ page }) => {
  await page.addInitScript(() => {
    if (sessionStorage.getItem("seeded")) return;
    sessionStorage.setItem("seeded", "1");
    localStorage.setItem("memory-lab-v1", JSON.stringify({
      semantic: ["Comfort temperature: 21°C", "Usual workspace: Riverside Tower, Level 4", "Prefers: a quiet desk by the window"],
      episodic: ["May 12 · Trail hike: it rained unexpectedly.", "Outcome: shoes and spare clothes got soaked."],
      procedural: ["First, acknowledge the customer’s problem.", "Then, ask for their device model.", "Give one troubleshooting step at a time.", "If unresolved, offer escalation to a human."],
    }));
  });
  await page.goto("/");
  await expect(page.getByRole("textbox", { name: "Memory record 1", exact: true })).toHaveValue("Comfort temperature: 70°F");
  await page.getByRole("button", { name: "Episodic memory", exact: true }).click();
  await expect(page.locator(".record-count")).toHaveText("2 memories");
  await expect(page.getByRole("textbox", { name: "Memory record 1", exact: true })).toHaveValue("May 12 · Trail hike: it rained unexpectedly.");
  await page.getByRole("button", { name: "Procedural memory", exact: true }).click();
  await expect(page.getByRole("textbox", { name: "Memory record 2", exact: true })).toHaveValue("Then, ask for the room number and floor.");
  await expect.poll(() => page.evaluate(() => localStorage.getItem("memory-lab-v1"))).not.toContain("21°C");
  await expect.poll(() => page.evaluate(() => localStorage.getItem("memory-lab-v1"))).not.toContain("device model");
});
