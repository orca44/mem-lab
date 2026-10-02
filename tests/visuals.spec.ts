import { test, expect } from "@playwright/test";

test("flow strip follows the records, lights up on run, and shows when memory is bypassed", async ({ page }) => {
  await page.goto("/");
  const strip = page.getByRole("list", { name: "How the answer was built" });
  await expect(strip).toContainText("3 memories");
  await expect(strip.locator("li.done")).toHaveCount(0);
  await page.getByRole("button", { name: "Delete memory 3", exact: true }).click();
  await expect(strip).toContainText("2 memories");
  await page.getByRole("button", { name: "Run example" }).click();
  await expect(strip.locator("li.done")).toHaveCount(4);
  await expect(strip).toContainText("Answer uses your details");
  await page.getByRole("switch", { name: "Use memory" }).click();
  await expect(strip).toContainText("Memory off");
  await expect(strip).toContainText("Question only");
  await page.getByRole("button", { name: "Run example" }).click();
  await expect(strip.locator("li.done")).toHaveCount(4);
  await expect(strip).toContainText("Generic answer");
  await expect(page.locator(".contrast-answer")).toHaveCount(0);
});

test("lifetime preview shows retention without modifying the user's records", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Compare types" }).click();
  const chart = page.getByRole("region", { name: "Memory lifetime experiment" });
  await expect(chart).toContainText("16 memories carried forward");
  await chart.getByRole("button", { name: "Next chat" }).click();
  await expect(chart).toContainText("10 memories carried forward");
  await expect(chart.locator(".lifetime-row").first().locator(".lifetime-value")).toContainText("0");
  await chart.getByRole("button", { name: "After reload" }).click();
  await expect(chart).toContainText("10 memories carried forward");
  await page.getByRole("button", { name: "Working memory", exact: true }).click();
  await expect(page.getByRole("textbox", { name: "Memory record 1", exact: true })).toHaveValue("Space: Riverside Tower, Level 12");
});

test("capacity graph responds to estate size and traffic, and context allocation is inspectable", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Design for scale" }).click();
  await page.getByRole("button", { name: "2. Grow the estate" }).click();
  await page.getByRole("radio", { name: /Global portfolio/ }).click();
  await page.getByRole("slider", { name: "Peak traffic multiplier" }).fill("10");
  const traffic = page.getByRole("region", { name: "Assistant traffic chart" });
  await expect(traffic.getByRole("img")).toHaveAccessibleName(/11.574 peak assistant requests/);
  await page.getByRole("radio", { name: /One building/ }).click();
  await expect(traffic.getByRole("img")).toHaveAccessibleName(/0.012 peak assistant requests/);
  const budget = page.getByRole("region", { name: "Context budget chart" });
  await budget.getByRole("button", { name: "Approved playbook 1,000" }).click();
  await expect(budget.locator(".budget-detail")).toContainText("Approved playbook · 12.5%");
});

test("visuals fit mobile, work with reduced motion, and have no browser errors", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", e => errors.push(e.message));
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await page.getByRole("button", { name: "Run example" }).click();
  await expect(page.getByRole("list", { name: "How the answer was built" }).locator("li.done")).toHaveCount(4);
  for (const name of ["Compare types", "Learning labs", "Design for scale", "Sources"]) {
    await page.getByRole("button", { name, exact: true }).click();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  }
  await page.screenshot({ path: "test-results/visuals-enterprise-mobile.png", fullPage: true });
  expect(errors).toEqual([]);
});

test("capture desktop visual playground and comparison", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1100 });
  await page.goto("/");
  await page.screenshot({ path: "test-results/visuals-desktop.png", fullPage: true });
  await page.getByRole("button", { name: "Compare types" }).click();
  await page.screenshot({ path: "test-results/visuals-comparison.png", fullPage: true });
  await page.getByRole("button", { name: "Design for scale" }).click();
  await page.getByRole("button", { name: "2. Grow the estate" }).click();
  await page.locator(".capacity-charts").screenshot({ path: "test-results/visuals-capacity.png" });
});
