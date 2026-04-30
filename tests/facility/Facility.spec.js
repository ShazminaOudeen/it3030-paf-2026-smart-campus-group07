import { test, expect } from "@playwright/test";

const BASE_URL = "http://localhost:5173";

// ─── Auth & API mocking helpers ──────────────────────────────────────────────

async function mockAuth(page, role = "ADMIN") {
  await page.addInitScript(() => {
    localStorage.setItem("token", "test-token");
  });
  await page.route(
    (url) => url.pathname === "/api/auth/me",
    (route) =>
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          id: "u1",
          name: "Test User",
          email: "test@example.com",
          role,
        }),
      })
  );
}

const MOCK_RESOURCES = [
  {
    id: "r1",
    name: "Computer Lab A101",
    type: "LAB",
    status: "ACTIVE",
    location: "Block A, Floor 1",
    capacity: 40,
    availabilityWindow: "08:00-18:00",
    description: "A well-equipped computer lab.",
    isAvailableNow: true,
    activeBookingsCount: 2,
  },
  {
    id: "r2",
    name: "Main Auditorium",
    type: "AUDITORIUM",
    status: "OUT_OF_SERVICE",
    location: "Block B",
    capacity: 300,
    availabilityWindow: "09:00-17:00",
    description: "Large auditorium.",
    isAvailableNow: false,
    activeBookingsCount: 0,
  },
  {
    id: "r3",
    name: "Meeting Room 2B",
    type: "MEETING_ROOM",
    status: "UNDER_MAINTENANCE",
    location: "Block C, Floor 2",
    capacity: 12,
    availabilityWindow: "08:00-20:00",
    description: "Small meeting room.",
    isAvailableNow: false,
    activeBookingsCount: 1,
  },
];

const MOCK_STATS = {
  total: 3,
  active: 1,
  outOfService: 1,
  underMaintenance: 1,
};

const MOCK_PAGE_RESPONSE = {
  content: MOCK_RESOURCES,
  totalPages: 1,
  totalElements: 3,
  number: 0,
};

async function mockResourcesApi(page) {
  // List / search endpoint
  await page.route(
    (url) => url.pathname === "/api/resources" || url.pathname.startsWith("/api/resources?"),
    (route) =>
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(MOCK_PAGE_RESPONSE),
      })
  );
  // Stats endpoint
  await page.route(
    (url) => url.pathname === "/api/resources/stats" || url.pathname.startsWith("/api/resources/stats"),
    (route) =>
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(MOCK_STATS),
      })
  );
  // Single resource (PATCH / DELETE)
  await page.route(
    (url) => /\/api\/resources\/[^/]+$/.test(url.pathname),
    (route) => {
      const method = route.request().method();
      if (method === "DELETE") return route.fulfill({ status: 204, body: "" });
      if (method === "PATCH" || method === "PUT")
        return route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify(MOCK_RESOURCES[0]),
        });
      return route.continue();
    }
  );
  // Create
  await page.route(
    (url) => url.pathname === "/api/resources" && false, // POST handled separately per-test
    (route) => route.continue()
  );
}

async function gotoUser(page) {
  await mockAuth(page, "USER");
  await mockResourcesApi(page);
  await page.goto(`${BASE_URL}/user/resources`);
  await page.waitForLoadState("networkidle");
}

async function gotoAdmin(page) {
  await mockAuth(page, "ADMIN");
  await mockResourcesApi(page);
  await page.goto(`${BASE_URL}/admin/resources`);
  await page.waitForLoadState("networkidle");
}

// ─────────────────────────────────────────────────────────────────────────────
// ResourceCard
// ─────────────────────────────────────────────────────────────────────────────

test.describe("ResourceCard", () => {
  test.beforeEach(async ({ page }) => {
    await gotoUser(page);
  });

  test("renders resource name, type badge, and status badge", async ({ page }) => {
    const card = page.locator("button.group").first();
    await expect(card).toBeVisible();
    await expect(card.locator("h3")).toHaveText("Computer Lab A101");

    await expect(card.locator("text=Laboratory")).toBeVisible();
    await expect(card.locator("text=Active")).toBeVisible();
  });

  test("shows green availability strip for ACTIVE resources", async ({ page }) => {
    const activeCard = page.locator("button.group").first();
    await expect(activeCard).toBeVisible();
    const strip = activeCard.locator("div.absolute.h-0\\.5").first();
    await expect(strip).toHaveClass(/bg-green-400/);
  });

  test("shows 'Available to book' for active resources", async ({ page }) => {
    const activeCard = page.locator("button.group").first();
    await expect(activeCard.locator("text=Available to book")).toBeVisible();
  });

  test("shows 'Currently unavailable' for non-active resources", async ({ page }) => {
    // Second card is OUT_OF_SERVICE
    const unavailableCard = page.locator("button.group").nth(1);
    await expect(unavailableCard.locator("text=Currently unavailable")).toBeVisible();
  });

  test("renders location and capacity when present", async ({ page }) => {
    const card = page.locator("button.group").first();
    await expect(card.locator("text=Block A, Floor 1")).toBeVisible();
    await expect(card.locator("text=40 seats")).toBeVisible();
  });

  test("opens detail modal when clicked", async ({ page }) => {
    await page.locator("button.group").first().click();
    await expect(page.locator(".fixed.inset-0.z-50").first()).toBeVisible();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// ResourceDetailModal
// ─────────────────────────────────────────────────────────────────────────────

test.describe("ResourceDetailModal", () => {
  test.beforeEach(async ({ page }) => {
    await gotoUser(page);
    await page.locator("button.group").first().click();
    await page.locator(".fixed.inset-0.z-50").waitFor({ state: "visible" });
  });

  test("displays the resource name in the modal header", async ({ page }) => {
    const modal = page.locator(".fixed.inset-0.z-50").first();
    await expect(modal.locator("h2")).toContainText("Computer Lab A101");
  });

  test("closes on clicking the X button", async ({ page }) => {
    const modal = page.locator(".fixed.inset-0.z-50").first();
    // X button is the one with an X icon (not 'Close' text)
    await modal.locator("button[title], button").filter({ hasText: /^$/ }).first().click();
    await expect(modal).not.toBeVisible({ timeout: 3000 });
  });

  test("closes on clicking the Close button in footer", async ({ page }) => {
    const modal = page.locator(".fixed.inset-0.z-50").first();
    await modal.locator("button", { hasText: "Close" }).click();
    await expect(modal).not.toBeVisible({ timeout: 3000 });
  });

  test("'Book Now' button is enabled for ACTIVE resources", async ({ page }) => {
    const modal = page.locator(".fixed.inset-0.z-50").first();
    const bookBtn = modal.locator("button", { hasText: "Book Now" });
    await expect(bookBtn).toBeVisible();
    await expect(bookBtn).toBeEnabled();
    await expect(bookBtn).not.toHaveClass(/cursor-not-allowed/);
  });

  test("shows location, capacity and available hours in info grid", async ({ page }) => {
    const modal = page.locator(".fixed.inset-0.z-50").first();
    await expect(modal.locator("text=Block A, Floor 1")).toBeVisible();
    await expect(modal.locator("text=40 seats")).toBeVisible();
    await expect(modal.locator("text=08:00-18:00")).toBeVisible();
  });

  test("shows description under About section", async ({ page }) => {
    const modal = page.locator(".fixed.inset-0.z-50").first();
    await expect(modal.locator("text=A well-equipped computer lab.")).toBeVisible();
  });
});

test.describe("ResourceDetailModal – unavailable resource", () => {
  test.beforeEach(async ({ page }) => {
    await gotoUser(page);
    // Second card is OUT_OF_SERVICE
    await page.locator("button.group").nth(1).click();
    await page.locator(".fixed.inset-0.z-50").waitFor({ state: "visible" });
  });

  test("'Unavailable' button is disabled for OUT_OF_SERVICE resources", async ({ page }) => {
    const modal = page.locator(".fixed.inset-0.z-50").first();
    const btn = modal.locator("button", { hasText: "Unavailable" });
    await expect(btn).toBeDisabled();
  });

  test("shows an alert notice for OUT_OF_SERVICE resource", async ({ page }) => {
    const modal = page.locator(".fixed.inset-0.z-50").first();
    // Target the alert <p> specifically to avoid matching the status badge too
    await expect(
      modal.locator("p.text-sm.text-red-600, p.text-sm.text-red-400")
    ).toBeVisible();
  });
});

test.describe("ResourceDetailModal – Book Now flow", () => {
  test("clicking Book Now closes detail modal and opens booking form", async ({ page }) => {
    await gotoUser(page);
    await page.locator("button.group").first().click();

    const detailModal = page.locator(".fixed.inset-0.z-50").first();
    await detailModal.waitFor({ state: "visible" });

    // Grab a unique element that only exists in the detail modal (not the booking form)
    const detailClose = detailModal.locator("button", { hasText: "Close" });
    await expect(detailClose).toBeVisible();

    await detailModal.locator("button", { hasText: "Book Now" }).click();

    // The "Close" footer button only exists in ResourceDetailModal — once gone, detail modal is closed
    await expect(detailClose).not.toBeVisible({ timeout: 5000 });

    // Booking form modal should now be open
    await expect(page.locator(".fixed.inset-0.z-50").first()).toBeVisible();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// ResourceFilters
// ─────────────────────────────────────────────────────────────────────────────

test.describe("ResourceFilters – user view", () => {
  test.beforeEach(async ({ page }) => {
    await gotoUser(page);
  });

  test("search input is visible and accepts text", async ({ page }) => {
    const searchInput = page.locator('input[placeholder="Search resources..."]');
    await expect(searchInput).toBeVisible();
    await searchInput.fill("Lab");
    await expect(searchInput).toHaveValue("Lab");
  });

  test("pressing Enter in search triggers a filter update", async ({ page }) => {
    const searchInput = page.locator('input[placeholder="Search resources..."]');
    await searchInput.fill("Auditorium");
    await searchInput.press("Enter");
    await expect(page.locator("text=/\\d+ resource/")).toBeVisible();
  });

  test("Filters button toggles the advanced panel", async ({ page }) => {
    const filtersBtn = page.locator("button", { hasText: /Filters/ });
    await expect(filtersBtn).toBeVisible();

    // Panel hidden initially
    const typeSelect = page.locator("select").filter({
      has: page.locator("option", { hasText: "All Types" }),
    });
    await expect(typeSelect).not.toBeVisible();

    await filtersBtn.click();
    await expect(typeSelect).toBeVisible();

    await filtersBtn.click();
    await expect(typeSelect).not.toBeVisible();
  });

  test("Type dropdown lists all resource types", async ({ page }) => {
    await page.locator("button", { hasText: /Filters/ }).click();
    const typeSelect = page.locator("select").filter({
      has: page.locator("option", { hasText: "All Types" }),
    });
    const options = await typeSelect.locator("option").allTextContents();
    const expected = [
      "All Types", "Lecture Hall", "Laboratory", "Meeting Room",
      "Equipment", "Auditorium", "Study Room",
    ];
    for (const label of expected) expect(options).toContain(label);
  });

  test("Status filter is NOT visible in user view", async ({ page }) => {
    await page.locator("button", { hasText: /Filters/ }).click();
    const statusSelect = page.locator("select").filter({
      has: page.locator("option", { hasText: "Any Status" }),
    });
    await expect(statusSelect).not.toBeVisible();
  });

  test("Clear button appears after search and resets filters", async ({ page }) => {
    const searchInput = page.locator('input[placeholder="Search resources..."]');
    await searchInput.fill("Lab");
    await searchInput.press("Enter");

    const clearBtn = page.locator("button", { hasText: /Clear/ });
    await expect(clearBtn).toBeVisible();
    await clearBtn.click();

    await expect(clearBtn).not.toBeVisible();
  });

  test("orange dot appears on Filters button when a filter is active", async ({ page }) => {
    await page.locator("button", { hasText: /Filters/ }).click();
    const typeSelect = page.locator("select").filter({
      has: page.locator("option", { hasText: "All Types" }),
    });
    await typeSelect.selectOption("EQUIPMENT");

    const dot = page.locator("button", { hasText: /Filters/ }).locator("span.bg-orange-500");
    await expect(dot).toBeVisible();
  });

  // FIX 1: Re-query the typeSelect locator after re-opening the panel,
  // because Clear closes the panel and removes the select from the DOM.
  test("selecting a type and clearing resets the dropdown", async ({ page }) => {
    await page.locator("button", { hasText: /Filters/ }).click();
    const typeSelect = page.locator("select").filter({
      has: page.locator("option", { hasText: "All Types" }),
    });
    await typeSelect.selectOption("LAB");
    await expect(typeSelect).toHaveValue("LAB");

    // Clear closes the panel — just verify the Clear button disappears (filter was reset)
    await page.locator("button", { hasText: /Clear/ }).click();
    await expect(page.locator("button", { hasText: /Clear/ })).not.toBeVisible();

    // Re-open the panel and confirm the type is back to default.
    // Re-query the select after the panel re-opens — the previous DOM node was removed.
    await page.locator("button", { hasText: /Filters/ }).click();
    const resetTypeSelect = page.locator("select").filter({
      has: page.locator("option", { hasText: "All Types" }),
    });
    await expect(resetTypeSelect).toBeVisible();
    await expect(resetTypeSelect).toHaveValue("");
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// ResourceForm – create
// ─────────────────────────────────────────────────────────────────────────────

test.describe("ResourceForm – create", () => {
  test.beforeEach(async ({ page }) => {
    await gotoAdmin(page);
    await page.locator("button", { hasText: "Add Resource" }).click();
    await page.locator(".fixed.inset-0.z-50").waitFor({ state: "visible" });
  });

  test("modal renders with all required fields visible", async ({ page }) => {
    const modal = page.locator(".fixed.inset-0.z-50").first();
    await expect(modal.locator('input[placeholder="e.g. Computer Lab A101"]')).toBeVisible();
    await expect(modal.locator("text=Type *")).toBeVisible();
    await expect(modal.locator("text=Availability window")).toBeVisible();
    await expect(modal.locator("text=Status")).toBeVisible();
    await expect(modal.locator("text=Add resource")).toBeVisible();
  });

  test("shows validation error when Name is empty on submit", async ({ page }) => {
    const modal = page.locator(".fixed.inset-0.z-50").first();
    await modal.locator("button", { hasText: "Create resource" }).click();
    await expect(modal.locator("text=Name is required")).toBeVisible();
  });

  test("shows validation error when end time is before start time", async ({ page }) => {
    const modal = page.locator(".fixed.inset-0.z-50").first();
    await modal.locator('input[placeholder="e.g. Computer Lab A101"]').fill("Test Room");

    await modal.locator('input[placeholder="08:00"]').fill("17:00");
    await modal.locator('input[placeholder="18:00"]').fill("08:00");

    await modal.locator("button", { hasText: "Create resource" }).click();
    await expect(modal.locator("text=End time must be after start time")).toBeVisible();
  });

  test("shows validation error for invalid time format", async ({ page }) => {
    const modal = page.locator(".fixed.inset-0.z-50").first();
    await modal.locator('input[placeholder="e.g. Computer Lab A101"]').fill("Test Room");
    await modal.locator('input[placeholder="08:00"]').fill("abc");

    await modal.locator("button", { hasText: "Create resource" }).click();
    await expect(modal.locator("text=/HH:mm/")).toBeVisible();
  });

  test("type pill selection highlights the selected type", async ({ page }) => {
    const modal = page.locator(".fixed.inset-0.z-50").first();
    const lecturePill = modal.locator("button", { hasText: "Lecture hall" });
    await lecturePill.click();
    await expect(lecturePill).toHaveClass(/border-orange-400/);
  });

  test("status pill selection highlights the selected status", async ({ page }) => {
    const modal = page.locator(".fixed.inset-0.z-50").first();
    const maintenancePill = modal.locator("button", { hasText: "Maintenance" });
    await maintenancePill.click();
    await expect(maintenancePill).toHaveClass(/border-amber-400/);
  });

  test("Cancel button closes the form without submitting", async ({ page }) => {
    const modal = page.locator(".fixed.inset-0.z-50").first();
    await modal.locator("button", { hasText: "Cancel" }).click();
    await expect(modal).not.toBeVisible({ timeout: 3000 });
  });

  test("valid submission POSTs to the API and closes the modal", async ({ page }) => {
    let posted = false;
    await page.route(
      (url) => url.pathname === "/api/resources",
      (route) => {
        if (route.request().method() === "POST") {
          posted = true;
          return route.fulfill({
            status: 201,
            contentType: "application/json",
            body: JSON.stringify({ id: "new-1", ...MOCK_RESOURCES[0] }),
          });
        }
        return route.continue();
      }
    );

    const modal = page.locator(".fixed.inset-0.z-50").first();
    await modal.locator('input[placeholder="e.g. Computer Lab A101"]').fill("New Lab 001");
    await modal.locator('input[placeholder="08:00"]').fill("09:00");
    await modal.locator('input[placeholder="18:00"]').fill("17:00");
    await modal.locator("button", { hasText: "Create resource" }).click();

    await expect(modal).not.toBeVisible({ timeout: 5000 });
    expect(posted).toBe(true);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// AdminFacilitiesPage
// ─────────────────────────────────────────────────────────────────────────────

test.describe("AdminFacilitiesPage", () => {
  test.beforeEach(async ({ page }) => {
    await gotoAdmin(page);
  });

  test("renders page title and Add Resource button", async ({ page }) => {
    await expect(page.locator("h1", { hasText: "Resources" })).toBeVisible();
    await expect(page.locator("button", { hasText: "Add Resource" })).toBeVisible();
  });

  // FIX 2: Use tag-agnostic text locators instead of scoping to <p> tags,
  // since the stat card labels may be rendered in span/div/h3 elements.
  test("renders all four stat cards", async ({ page }) => {
    await expect(page.locator("text=Total Resources").first()).toBeVisible();
    await expect(page.locator("text=Active").first()).toBeVisible();
    await expect(page.locator("text=Out of Service").first()).toBeVisible();
    await expect(page.locator("text=Under Maintenance").first()).toBeVisible();
  });

  test("resource grid renders all mocked cards", async ({ page }) => {
    await expect(page.locator("button.group")).toHaveCount(3);
  });

  test("result count shows correct number", async ({ page }) => {
    await expect(page.locator("text=3 resources found")).toBeVisible();
  });

  test("Status filter IS visible for admin", async ({ page }) => {
    await page.locator("button", { hasText: /Filters/ }).click();
    const statusSelect = page.locator("select").filter({
      has: page.locator("option", { hasText: "Any Status" }),
    });
    await expect(statusSelect).toBeVisible();
  });

  test("sort dropdown changes the sort value", async ({ page }) => {
    const sortSelect = page.locator("select").last();
    await sortSelect.selectOption("name,asc");
    await expect(sortSelect).toHaveValue("name,asc");
  });

  test("hovering a card reveals edit, delete and toggle buttons", async ({ page }) => {
    const cardWrapper = page.locator(".relative.group").first();
    await cardWrapper.hover();

    // Admin overlay buttons fade in on hover
    const overlay = cardWrapper.locator(".absolute.top-3.right-3");
    await expect(overlay).toBeVisible();
    await expect(overlay.locator("button")).toHaveCount(3);
  });

  test("clicking Edit opens ResourceForm pre-filled with 'Edit resource'", async ({ page }) => {
    const cardWrapper = page.locator(".relative.group").first();
    await cardWrapper.hover();
    const overlay = cardWrapper.locator(".absolute.top-3.right-3");
    await overlay.locator("button").nth(1).click(); // Edit is 2nd

    const modal = page.locator(".fixed.inset-0.z-50").first();
    await modal.waitFor({ state: "visible" });
    await expect(modal.locator("text=Edit resource")).toBeVisible();
    // Name field should be pre-populated
    await expect(modal.locator('input[placeholder="e.g. Computer Lab A101"]')).toHaveValue("Computer Lab A101");
  });

  test("clicking Delete opens the confirm dialog", async ({ page }) => {
    const cardWrapper = page.locator(".relative.group").first();
    await cardWrapper.hover();
    const overlay = cardWrapper.locator(".absolute.top-3.right-3");
    await overlay.locator("button").nth(2).click(); // Delete is 3rd

    const dialog = page.locator(".fixed.inset-0.z-50").first();
    await dialog.waitFor({ state: "visible" });
    await expect(dialog.locator("text=Delete Resource?")).toBeVisible();
    await expect(dialog.locator("text=Computer Lab A101")).toBeVisible();
  });

  test("delete dialog – Cancel dismisses it", async ({ page }) => {
    const cardWrapper = page.locator(".relative.group").first();
    await cardWrapper.hover();
    await cardWrapper.locator(".absolute.top-3.right-3").locator("button").nth(2).click();

    const dialog = page.locator(".fixed.inset-0.z-50").first();
    await dialog.waitFor({ state: "visible" });
    await dialog.locator("button", { hasText: "Cancel" }).click();
    await expect(dialog).not.toBeVisible({ timeout: 3000 });
  });

  test("delete dialog – Delete button sends DELETE request", async ({ page }) => {
    let deleteHit = false;
    await page.route(
      (url) => /\/api\/resources\/r1$/.test(url.pathname),
      (route) => {
        if (route.request().method() === "DELETE") {
          deleteHit = true;
          return route.fulfill({ status: 204, body: "" });
        }
        return route.continue();
      }
    );

    const cardWrapper = page.locator(".relative.group").first();
    await cardWrapper.hover();
    await cardWrapper.locator(".absolute.top-3.right-3").locator("button").nth(2).click();

    const dialog = page.locator(".fixed.inset-0.z-50").first();
    await dialog.waitFor({ state: "visible" });
    await dialog.locator("button", { hasText: "Delete" }).click();

    await page.waitForTimeout(500);
    expect(deleteHit).toBe(true);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// UserFacilitiesPage
// ─────────────────────────────────────────────────────────────────────────────

test.describe("UserFacilitiesPage", () => {
  test.beforeEach(async ({ page }) => {
    await gotoUser(page);
  });

  test("renders Browse Resources heading", async ({ page }) => {
    await expect(page.locator("h1", { hasText: "Browse Resources" })).toBeVisible();
  });

  test("result count is displayed", async ({ page }) => {
    await expect(page.locator("text=/\\d+ resource/")).toBeVisible();
  });

  test("shows all three mocked resource cards", async ({ page }) => {
    await expect(page.locator("button.group")).toHaveCount(3);
  });

  test("Add Resource button is NOT visible to regular users", async ({ page }) => {
    await expect(page.locator("button", { hasText: "Add Resource" })).not.toBeVisible();
  });

  test("admin action overlay buttons are NOT present", async ({ page }) => {
    const overlay = page.locator(".absolute.top-3.right-3");
    await expect(overlay).not.toBeVisible();
  });

  test("sort dropdown is visible and functional", async ({ page }) => {
    const sortSelect = page.locator("select").last();
    await expect(sortSelect).toBeVisible();
    await sortSelect.selectOption("name,asc");
    await expect(sortSelect).toHaveValue("name,asc");
  });
});