import { expect, test } from "@playwright/test";

test.describe("home route", () => {
  test("loads splash hero content", async ({ page }) => {
    await page.goto("/");

    await expect(
      page.getByRole("heading", {
        name: "Type-safe mocks without the framework lock-in.",
      }),
    ).toBeVisible();
    await expect(
      page.getByText("Framework-agnostic mock functions"),
    ).toBeVisible();
  });

  test("cta route is reachable", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: "Start in 2 minutes" }).click();

    await expect(page).toHaveURL(/\/docs\/getting-started$/);
    await expect(
      page.getByRole("heading", { name: "Getting Started" }),
    ).toBeVisible();
  });
});

test.describe("docs shell", () => {
  test("docs overview loads with shared navigation", async ({ page }) => {
    await page.goto("/docs");

    const docsSidebar = page.getByLabel("Docs navigation");

    await expect(
      page.getByRole("heading", { name: "Documentation" }),
    ).toBeVisible();
    await expect(
      page.getByRole("navigation", { name: "Primary navigation" }),
    ).toBeVisible();
    await expect(
      docsSidebar.getByRole("link", { name: "Why mock-extended" }),
    ).toBeVisible();
  });

  test("sidebar links are navigable", async ({ page }) => {
    await page.goto("/docs");
    await page.getByRole("link", { name: "Features" }).first().click();

    await expect(page).toHaveURL(/\/docs\/features$/);
    await expect(page.getByRole("heading", { name: "Features" })).toBeVisible();
  });
});

test.describe("docs content pages", () => {
  test("all docs pages load with expected headings", async ({ page }) => {
    const expectedPages = [
      { href: "/docs/why-mock-extended", heading: "Why mock-extended" },
      { href: "/docs/getting-started", heading: "Getting Started" },
      { href: "/docs/features", heading: "Features" },
      { href: "/docs/examples", heading: "Examples" },
    ] as const;

    for (const route of expectedPages) {
      await page.goto(route.href);
      await expect(
        page.getByRole("heading", { name: route.heading }),
      ).toBeVisible();
    }
  });

  test("docs pages retain sidebar context", async ({ page }) => {
    await page.goto("/docs/examples");

    await expect(
      page.getByRole("link", { name: "Examples" }).first(),
    ).toHaveClass(/active/);
    await expect(
      page.getByRole("link", { name: "Getting Started" }).first(),
    ).toBeVisible();
  });
});
