// tests/booking/booking-pages.spec.js
const { test, expect } = require("@playwright/test");

const BOOKINGS = [
  {
    id: "bk-001",
    resourceName: "Conference Room A",
    bookingDate: "2025-09-01",
    startTime: "09:00",
    endTime: "11:00",
    status: "PENDING",
    userName: "Alice Johnson",
    purpose: "Team standup",
  },
  {
    id: "bk-002",
    resourceName: "Lab 3",
    bookingDate: "2025-09-02",
    startTime: "13:00",
    endTime: "14:00",
    status: "APPROVED",
    userName: "Bob Smith",
    purpose: "Physics experiment",
  },
  {
    id: "bk-003",
    resourceName: "Projector X200",
    bookingDate: "2025-09-03",
    startTime: "10:00",
    endTime: "12:00",
    status: "REJECTED",
    userName: "Carol Tan",
    purpose: "Demo setup",
  },
];

// ─── Shared helpers ───────────────────────────────────────────────────────────

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

/**
 * Fills a React-controlled date input.
 * Also uses a FUTURE date (2027) to avoid browser native validation
 * rejecting dates that are before today's min= value.
 */
async function fillDate(page, value) {
  await page.locator('input[type="date"]').evaluate((el, v) => {
    // Remove the min attribute so native validation cannot block past/future dates
    el.removeAttribute("min");
    const setter = Object.getOwnPropertyDescriptor(
      window.HTMLInputElement.prototype,
      "value"
    ).set;
    setter.call(el, v);
    el.dispatchEvent(new Event("input", { bubbles: true }));
    el.dispatchEvent(new Event("change", { bubbles: true }));
  }, value);
}

// ─── AdminBookingsPage ────────────────────────────────────────────────────────

test.describe("AdminBookingsPage", () => {
  test.beforeEach(async ({ page }) => {
    await mockAuth(page, "ADMIN");
  });

  async function routeAllBookings(page, responseBody = BOOKINGS) {
    await page.route(
      (url) => url.pathname === "/api/bookings",
      (route) => {
        if (route.request().method() !== "GET") return route.continue();
        return route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify(responseBody),
        });
      }
    );
  }

  test("renders page heading", async ({ page }) => {
    await routeAllBookings(page);
    await page.goto("/admin/bookings");
    await expect(page.getByRole("heading", { name: /All Bookings/i })).toBeVisible();
    await expect(page.getByText("Review and manage all booking requests")).toBeVisible();
  });

  test("renders all bookings by default", async ({ page }) => {
    await routeAllBookings(page);
    await page.goto("/admin/bookings");
    await expect(page.getByText("Conference Room A")).toBeVisible();
    await expect(page.getByText("Lab 3")).toBeVisible();
    await expect(page.getByText("Projector X200")).toBeVisible();
  });

  test("renders status filter dropdown with all options", async ({ page }) => {
    await routeAllBookings(page);
    await page.goto("/admin/bookings");
    const select = page.getByRole("combobox");
    await expect(select).toBeVisible();
    for (const status of ["All Statuses", "PENDING", "APPROVED", "REJECTED", "CANCELLED"]) {
      await expect(page.getByRole("option", { name: status })).toBeAttached();
    }
  });

  test("filters bookings by status", async ({ page }) => {
    await page.route(
      (url) => url.pathname === "/api/bookings",
      (route) => {
        if (route.request().method() !== "GET") return route.continue();
        const status = new URL(route.request().url()).searchParams.get("status");
        const filtered = status ? BOOKINGS.filter((b) => b.status === status) : BOOKINGS;
        return route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify(filtered),
        });
      }
    );

    await page.goto("/admin/bookings");
    await expect(page.getByText("Conference Room A")).toBeVisible();
    await page.selectOption("select", "APPROVED");
    await expect(page.getByText("Lab 3")).toBeVisible();
    await expect(page.getByText("Conference Room A")).not.toBeVisible();
  });

  test("refetch button triggers a new API call", async ({ page }) => {
    let callCount = 0;
    await page.route(
      (url) => url.pathname === "/api/bookings",
      (route) => {
        if (route.request().method() !== "GET") return route.continue();
        callCount++;
        return route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify(BOOKINGS),
        });
      }
    );

    await page.goto("/admin/bookings");
    await page.waitForLoadState("networkidle");
    const before = callCount;

    // From the strict-mode error, Playwright identified the refetch button exactly as:
    // getByRole('main').getByRole('button').filter({ hasText: /^$/ })
    // This matches the icon-only <button> inside <main> with no text content.
    await page.getByRole("main").getByRole("button").filter({ hasText: /^$/ }).click();
    await page.waitForLoadState("networkidle");

    expect(callCount).toBeGreaterThan(before);
  });

  test("shows empty state when no bookings found", async ({ page }) => {
    await page.route(
      (url) => url.pathname === "/api/bookings",
      (route) => {
        if (route.request().method() !== "GET") return route.continue();
        return route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify([]),
        });
      }
    );
    await page.goto("/admin/bookings");
    await expect(page.getByText("No bookings found.")).toBeVisible();
  });

  test("shows error message on API failure", async ({ page }) => {
    await page.route(
      (url) => url.pathname === "/api/bookings",
      (route) => {
        if (route.request().method() !== "GET") return route.continue();
        return route.abort("failed");
      }
    );
    await page.goto("/admin/bookings");
    await expect(page.locator(".text-red-500")).toBeVisible();
  });

  test("shows loading spinner initially", async ({ page }) => {
    let resolve;
    const hold = new Promise((r) => { resolve = r; });
    await page.route(
      (url) => url.pathname === "/api/bookings",
      async (route) => {
        if (route.request().method() !== "GET") return route.continue();
        await hold;
        return route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify(BOOKINGS),
        });
      }
    );
    await page.goto("/admin/bookings");
    await expect(page.locator(".animate-spin")).toBeVisible();
    resolve();
  });
});

// ─── BookingsPage (User) ──────────────────────────────────────────────────────

test.describe("BookingsPage (User)", () => {
  test.beforeEach(async ({ page }) => {
    await mockAuth(page, "USER");
    await page.route(
      (url) => url.pathname === "/api/bookings/my",
      (route) =>
        route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify(BOOKINGS),
        })
    );
    await page.goto("/user/bookings");
  });

  test("renders My Bookings heading", async ({ page }) => {
    await expect(page.getByRole("heading", { name: /My Bookings/i })).toBeVisible();
    await expect(page.getByText("Track and manage your booking requests")).toBeVisible();
  });

  test("renders all status tabs", async ({ page }) => {
    for (const tab of ["ALL", "PENDING", "APPROVED", "REJECTED", "CANCELLED"]) {
      await expect(page.getByRole("button", { name: tab })).toBeVisible();
    }
  });

  test("ALL tab shows all bookings by default", async ({ page }) => {
    await expect(page.getByText("Conference Room A")).toBeVisible();
    await expect(page.getByText("Lab 3")).toBeVisible();
    await expect(page.getByText("Projector X200")).toBeVisible();
  });

  test("APPROVED tab filters to only approved bookings", async ({ page }) => {
    await page.getByRole("button", { name: "APPROVED" }).click();
    await expect(page.getByText("Lab 3")).toBeVisible();
    await expect(page.getByText("Conference Room A")).not.toBeVisible();
    await expect(page.getByText("Projector X200")).not.toBeVisible();
  });

  test("PENDING tab filters to only pending bookings", async ({ page }) => {
    await page.getByRole("button", { name: "PENDING" }).click();
    await expect(page.getByText("Conference Room A")).toBeVisible();
    await expect(page.getByText("Lab 3")).not.toBeVisible();
  });

  test("CANCELLED tab shows empty state message", async ({ page }) => {
    await page.getByRole("button", { name: "CANCELLED" }).click();
    await expect(page.getByText("No bookings found for this filter.")).toBeVisible();
  });

  test("active tab is visually highlighted", async ({ page }) => {
    const allTab = page.getByRole("button", { name: "ALL" });
    await expect(allTab).toHaveClass(/bg-amber-500/);
    await page.getByRole("button", { name: "PENDING" }).click();
    await expect(page.getByRole("button", { name: "PENDING" })).toHaveClass(/bg-amber-500/);
    await expect(allTab).toHaveClass(/bg-gray-100/);
  });

  test("shows loading spinner while fetching", async ({ page }) => {
    let resolve;
    const hold = new Promise((r) => { resolve = r; });
    await page.route(
      (url) => url.pathname === "/api/bookings/my",
      async (route) => {
        await hold;
        return route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify(BOOKINGS),
        });
      }
    );
    await page.goto("/user/bookings");
    await expect(page.locator(".animate-spin")).toBeVisible();
    resolve();
  });

  test("shows error message on API failure", async ({ page }) => {
    await page.route(
      (url) => url.pathname === "/api/bookings/my",
      (route) => route.abort("failed")
    );
    await page.goto("/user/bookings");
    await expect(page.locator(".text-red-500")).toBeVisible();
  });
});

// ─── NewBookingPage ───────────────────────────────────────────────────────────

test.describe("NewBookingPage", () => {
  test.beforeEach(async ({ page }) => {
    await mockAuth(page, "USER");
    await page.route(
      (url) => url.pathname === "/api/resources",
      (route) =>
        route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify([
            {
              id: "r1",
              name: "Study Hall",
              type: "ROOM",
              location: "Block A",
              capacity: 30,
              // No availabilityWindow — avoids window-violation guard blocking submit
              status: "ACTIVE",
            },
          ]),
        })
    );
    await page.goto("/user/bookings/new");
    await expect(page.locator("select")).toBeVisible();
  });

  test("renders page heading and subtext", async ({ page }) => {
    await expect(page.getByRole("heading", { name: /Make a Booking/i })).toBeVisible();
    await expect(
      page.getByText("Fill in the details below to request a resource booking.")
    ).toBeVisible();
  });

  test("renders BookingForm inside card", async ({ page }) => {
    await expect(page.getByRole("combobox")).toBeVisible();
  });

  async function fillAndSubmitForm(page, attendees = "10") {
    // Mock the POST before clicking submit
    await page.route(
      (url) => url.pathname === "/api/bookings",
      (route) => {
        if (route.request().method() !== "POST") return route.continue();
        return route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({ id: "bk-999" }),
        });
      }
    );

    await page.selectOption("select", "r1");
    await expect(page.locator("select")).toHaveValue("r1");

    // Use a future date and strip the min attribute so native validation
    // cannot reject the value (BookingForm sets min={TODAY}, today is 2026).
    await fillDate(page, "2027-06-15");

    await page.locator('input[type="time"]').first().fill("09:00");
    await page.locator('input[type="time"]').last().fill("11:00");
    await page.fill("textarea", "Exam preparation");
    await page.locator('input[type="number"]').fill(attendees);

    await page.getByRole("button", { name: "Request Booking" }).click();
  }

  test("shows success screen after booking is submitted", async ({ page }) => {
    await fillAndSubmitForm(page, "10");

    await expect(page.getByText("Booking Submitted!")).toBeVisible({ timeout: 10000 });
    await expect(page.getByText("Your request is pending admin approval.")).toBeVisible();
    await expect(page.getByRole("button", { name: "View My Bookings" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Book Another" })).toBeVisible();
  });

  test("View My Bookings button navigates to bookings page", async ({ page }) => {
    // Also mock /api/bookings/my for the page that loads after navigation
    await page.route(
      (url) => url.pathname === "/api/bookings/my",
      (route) =>
        route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify(BOOKINGS),
        })
    );

    await fillAndSubmitForm(page, "5");

    await expect(page.getByRole("button", { name: "View My Bookings" })).toBeVisible({ timeout: 10000 });
    await page.getByRole("button", { name: "View My Bookings" }).click();
    await expect(page).toHaveURL(/\/user\/bookings/);
  });
});