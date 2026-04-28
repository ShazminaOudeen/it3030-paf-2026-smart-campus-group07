// tests/booking/booking-form.spec.js
const { test, expect } = require("@playwright/test");

const RESOURCES = [
  {
    id: "r1",
    name: "Conference Room A",
    type: "ROOM",
    location: "Block B",
    capacity: 20,
    availabilityWindow: "08:00-18:00",
    status: "ACTIVE",
  },
  {
    id: "r2",
    name: "Projector X200",
    type: "EQUIPMENT",
    location: null,
    capacity: null,
    availabilityWindow: null,
    status: "ACTIVE",
  },
];

/**
 * Fills a React-controlled date input.
 * Strips the min attribute first so browser native validation cannot
 * reject a date (BookingForm sets min={TODAY} and today is 2026).
 */
async function fillDate(page, value) {
  await page.locator('input[type="date"]').evaluate((el, v) => {
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

test.describe("BookingForm", () => {
  test.beforeEach(async ({ page }) => {
    // Auth must be mocked before goto or the app redirects to login
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
            role: "USER",
          }),
        })
    );

    // BookingForm fetches: GET /api/resources?status=ACTIVE
    await page.route(
      (url) => url.pathname === "/api/resources",
      (route) =>
        route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify(RESOURCES),
        })
    );

    await page.goto("/user/bookings/new");
    // Wait for the resource dropdown to be populated before each test
    await expect(page.locator("select")).toBeVisible();
  });

  test("renders resource dropdown with fetched resources", async ({ page }) => {
    await expect(page.getByRole("combobox")).toBeVisible();
    await expect(
      page.getByRole("option", { name: "Conference Room A — ROOM (Block B)" })
    ).toBeAttached();
    await expect(
      page.getByRole("option", { name: "Projector X200 — EQUIPMENT" })
    ).toBeAttached();
  });

  test("shows availability window info when room is selected and times are valid", async ({ page }) => {
    await page.selectOption("select", "r1");
    await page.locator('input[type="time"]').first().fill("09:00");
    await page.locator('input[type="time"]').last().fill("11:00");

    await expect(page.getByText(/Available window/)).toBeVisible();
    await expect(page.getByText("08:00 – 18:00")).toBeVisible();
  });

  test("shows warning banner when start time is outside availability window", async ({ page }) => {
    await page.selectOption("select", "r1");
    await page.locator('input[type="time"]').first().fill("06:00");

    await expect(page.getByText(/Conference Room A.*only bookable between/)).toBeVisible();
    await expect(page.getByText("08:00 – 18:00").first()).toBeVisible();
    await expect(page.getByRole("button", { name: "Request Booking" })).toBeDisabled();
  });

  test("shows warning banner when end time is outside availability window", async ({ page }) => {
    await page.selectOption("select", "r1");
    await page.locator('input[type="time"]').first().fill("09:00");
    await page.locator('input[type="time"]').last().fill("20:00");

    await expect(page.getByText(/only bookable between/)).toBeVisible();
    await expect(page.getByRole("button", { name: "Request Booking" })).toBeDisabled();
  });

  test("disables attendees field for EQUIPMENT resource", async ({ page }) => {
    await page.selectOption("select", "r2");

    const attendeesInput = page.locator('input[type="number"]');
    await expect(attendeesInput).toBeDisabled();
    await expect(attendeesInput).toHaveAttribute("placeholder", "N/A");
  });

  test("shows max capacity hint for room", async ({ page }) => {
    await page.selectOption("select", "r1");
    await expect(page.getByText("Max capacity: 20")).toBeVisible();
  });

  test("resets attendees and time fields when resource changes", async ({ page }) => {
    await page.selectOption("select", "r1");
    await page.locator('input[type="time"]').first().fill("09:00");
    await page.locator('input[type="number"]').fill("10");

    await page.selectOption("select", "r2");

    await expect(page.locator('input[type="time"]').first()).toHaveValue("");
    await expect(page.locator('input[type="number"]')).toHaveValue("");
  });

  test("submits form with correct payload for a room booking", async ({ page }) => {
    let capturedPayload = {};

    // Use exact pathname matcher — glob "**/api/bookings" doesn't reliably
    // match bare paths in Playwright. Method check ensures GETs are not caught.
    await page.route(
      (url) => url.pathname === "/api/bookings",
      async (route) => {
        if (route.request().method() !== "POST") return route.continue();
        capturedPayload = JSON.parse(route.request().postData() ?? "{}");
        return route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({ id: "bk-001" }),
        });
      }
    );

    await page.selectOption("select", "r1");
    await expect(page.locator("select")).toHaveValue("r1");
    // Use a future date — fillDate also strips min= so native validation won't block
    await fillDate(page, "2027-09-01");
    await page.locator('input[type="time"]').first().fill("09:00");
    await page.locator('input[type="time"]').last().fill("11:00");
    await page.fill("textarea", "Monthly planning session");
    await page.locator('input[type="number"]').fill("8");

    // Wait for the POST response using a function matcher instead of a glob
    const responsePromise = page.waitForResponse(
      (res) =>
        res.url().includes("/api/bookings") &&
        res.request().method() === "POST"
    );
    await page.getByRole("button", { name: "Request Booking" }).click();
    await responsePromise;

    expect(capturedPayload.resourceId).toBe("r1");
    expect(capturedPayload.bookingDate).toBe("2027-09-01");
    expect(capturedPayload.startTime).toBe("09:00");
    expect(capturedPayload.endTime).toBe("11:00");
    expect(capturedPayload.purpose).toBe("Monthly planning session");
    expect(capturedPayload.expectedAttendees).toBe(8);
  });

  test("does not include expectedAttendees in payload for EQUIPMENT", async ({ page }) => {
    let capturedPayload = {};

    await page.route(
      (url) => url.pathname === "/api/bookings",
      async (route) => {
        if (route.request().method() !== "POST") return route.continue();
        capturedPayload = JSON.parse(route.request().postData() ?? "{}");
        return route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({ id: "bk-002" }),
        });
      }
    );

    await page.selectOption("select", "r2");
    await expect(page.locator("select")).toHaveValue("r2");
    await fillDate(page, "2027-09-01");
    await page.locator('input[type="time"]').first().fill("10:00");
    await page.locator('input[type="time"]').last().fill("12:00");
    await page.fill("textarea", "Demo setup");

    const responsePromise = page.waitForResponse(
      (res) =>
        res.url().includes("/api/bookings") &&
        res.request().method() === "POST"
    );
    await page.getByRole("button", { name: "Request Booking" }).click();
    await responsePromise;

    expect(capturedPayload.expectedAttendees).toBeUndefined();
  });

  test("shows API error message on submission failure", async ({ page }) => {
    await page.route(
      (url) => url.pathname === "/api/bookings",
      (route) => {
        if (route.request().method() !== "POST") return route.continue();
        return route.fulfill({
          status: 500,
          contentType: "application/json",
          body: JSON.stringify({ message: "Server error occurred" }),
        });
      }
    );

    await page.selectOption("select", "r1");
    await expect(page.locator("select")).toHaveValue("r1");
    await fillDate(page, "2027-09-01");
    await page.locator('input[type="time"]').first().fill("09:00");
    await page.locator('input[type="time"]').last().fill("10:00");
    await page.fill("textarea", "Test booking");
    await page.locator('input[type="number"]').fill("5");

    const responsePromise = page.waitForResponse(
      (res) =>
        res.url().includes("/api/bookings") &&
        res.request().method() === "POST"
    );
    await page.getByRole("button", { name: "Request Booking" }).click();
    await responsePromise;

    await expect(page.getByText("Server error occurred")).toBeVisible();
  });

  test("submit button shows spinner while loading", async ({ page }) => {
    // Hold the response open so the spinner is visible before the request resolves
    let resolve;
    const hold = new Promise((r) => { resolve = r; });

    await page.route(
      (url) => url.pathname === "/api/bookings",
      async (route) => {
        if (route.request().method() !== "POST") return route.continue();
        await hold;
        return route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({ id: "bk-003" }),
        });
      }
    );

    await page.selectOption("select", "r1");
    await expect(page.locator("select")).toHaveValue("r1");
    await fillDate(page, "2027-09-01");
    await page.locator('input[type="time"]').first().fill("09:00");
    await page.locator('input[type="time"]').last().fill("10:00");
    await page.fill("textarea", "Test booking");
    await page.locator('input[type="number"]').fill("5");

    await page.getByRole("button", { name: "Request Booking" }).click();

    // BookingForm renders <Loader2 className="animate-spin" /> and "Submitting…" while loading
    await expect(page.getByText("Submitting…")).toBeVisible();
    await expect(page.locator(".animate-spin")).toBeVisible();
    resolve(); // unblock the route so the page finishes cleanly
  });
});