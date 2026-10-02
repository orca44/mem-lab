import { test, expect } from "@playwright/test";
import {sections, sources} from "../lib/sources";

test("sources list every reference once, filter by section, and are reached from each section's link", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await page.getByRole("button", { name: "Sources", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Sources", exact: true })).toBeVisible();
  await expect(page.locator(".reference-list a")).toHaveCount(Object.keys(sources).length);
  await expect(page.getByRole("link", { name: /MDN · Browser localStorage/ })).toHaveAttribute("href", "https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage");
  await page.getByRole("group", { name: "Filter by section" }).getByRole("button", { name: /Find lab/ }).click();
  await expect(page.locator(".reference-list a")).toHaveCount(sections.retrieve.ids.length);
  await expect(page).toHaveURL(/#sources\/retrieve$/);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({ path: "test-results/content-sources-mobile.png", fullPage: true });
  await page.goto("/#labs/evaluate");
  await page.getByRole("link", { name: /Sources for this section/ }).click();
  await expect(page).toHaveURL(/#sources\/evaluate$/);
  await expect(page.locator(".reference-list a")).toHaveCount(sections.evaluate.ids.length);
  for (const view of ["#explore/semantic", "#compare", "#labs/write", "#labs/retrieve", "#labs/govern", "#enterprise"]) {
    await page.goto("/" + view);
    await expect(page.getByRole("link", { name: /Sources for this section/ }).first()).toBeVisible();
    await expect(page.locator("main a[href^='https://']"), view).toHaveCount(0);
  }
});

test("edited context is echoed without unrelated recommendations or literal newline escapes", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Short-term memory", exact: true }).click();
  await page.getByRole("textbox", { name: "Memory record 2", exact: true }).fill("Assistant: I could adjust the ventilation schedule instead.");
  await page.getByRole("button", { name: "Run example" }).click();
  const response = page.locator(".response");
  await expect(response).toContainText("ventilation schedule");
  await expect(response).not.toContainText("lower the temperature by 2°F");
  expect(await response.textContent()).toContain("\n");
  expect(await response.textContent()).not.toContain("\\n");
  await page.getByRole("button", { name: "Procedural memory", exact: true }).click();
  await page.getByRole("textbox", { name: "Memory record 2", exact: true }).fill("Never ask for the room number.");
  await page.getByRole("button", { name: "Run example" }).click();
  await expect(response).toContainText("Never ask for the room number.");
  await expect(response).not.toContainText("ask for the room number and floor");
  await expect(response).toContainText("without executing them");
});

for (const saved of ["null", "[]", "broken-json"]) {
  test(`invalid saved root ${saved} recovers without a render crash`, async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", error => errors.push(error.message));
    await page.addInitScript(value => localStorage.setItem("memory-lab-v1", value), saved);
    await page.goto("/");
    await expect(page.getByRole("status")).toContainText("Saved memories could not be loaded");
    await page.getByRole("button", { name: "Run example" }).click();
    await expect(page.locator(".response")).toContainText("Comfort temperature: 70°F");
    expect(errors).toEqual([]);
  });
}

test("one invalid saved type does not discard the other saved examples", async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem("memory-lab-v1", JSON.stringify({ semantic: ["Comfort temperature: 72°F"], episodic: 42, procedural: [] })));
  await page.goto("/");
  await expect(page.getByRole("textbox", { name: "Memory record 1", exact: true })).toHaveValue("Comfort temperature: 72°F");
  await expect(page.getByRole("status")).toContainText("Usable examples were retained");
});

test("failed saves do not promise persistence or successful browser deletion", async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem("memory-lab-v1", JSON.stringify({ semantic: ["Previously saved 72°F preference"], episodic: [], procedural: [] }));
    Storage.prototype.setItem = () => { throw new DOMException("Storage denied", "SecurityError"); };
  });
  await page.goto("/");
  await expect(page.getByRole("main").getByRole("alert")).toContainText("previously saved data may remain");
  await expect(page.locator(".storage-label")).toContainText("browser saving unavailable");
  await page.getByRole("button", { name: "Compare types" }).click();
  await page.getByRole("button", { name: "Next chat" }).click();
  await expect(page.locator(".chart-takeaway")).toContainText("1 memory carried forward");
  await page.getByRole("button", { name: "After reload" }).click();
  await expect(page.locator(".chart-takeaway")).toContainText("no current memories are confirmed saved");
  await page.getByRole("button", { name: /Explore memory/ }).click();
  await page.getByRole("button", { name: "Delete memory 1", exact: true }).click();
  await expect(page.getByRole("main").getByRole("alert")).toBeVisible();
  expect(await page.evaluate(() => localStorage.getItem("memory-lab-v1"))).toContain("Previously saved 72°F preference");
});

test("small-estate rates remain nonzero and note payload is six decimal megabytes", async ({ page }) => {
  await page.goto("/");
  await page.goto("/#enterprise/grow");
  await page.getByRole("radio", { name: /One building/ }).click();
  await page.getByRole("slider", { name: "Peak traffic multiplier" }).fill("1");
  const values = page.locator(".scale-metrics strong");
  await expect(values).toHaveText(["720,000", "100", "0.001", "0.006 GB"]);
});
