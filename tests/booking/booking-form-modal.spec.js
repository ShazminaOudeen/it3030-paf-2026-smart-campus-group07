// tests/booking/booking-form-modal.spec.js
const { test, expect } = require("@playwright/test");

const ROOM_RESOURCE = {
  id: "r1",
  name: "Conference Room A",
  type: "ROOM",
  location: "Block B",
  capacity: 20,
  availabilityWindow: "08:00-18:00",
  status: "ACTIVE",
};

const EQUIPMENT_RESOURCE = {
  id: "r2",
  name: "Projector X200",
  type: "EQUIPMENT",
  capacity: null,
  availabilityWindow: null,
  status: "ACTIVE",
};

test.describe("BookingFormModal", () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem("token", "test-token");
    });

    // Mock auth check so UserLayout renders instead of redirecting
    await page.route("**/api/auth/me", (route) =>
      route.fulfill({
        json: {
          id: "u1",
          name: "Test User",
          email: "test@example.com",
          role: "USER",
        },
      })
    );

    await page.route("**/api/resources*", (route) =>
      route.fulfill({
        json: {
          content: [ROOM_RESOURCE, EQUIPMENT_RESOURCE],
          totalElements: 2,
          totalPages: 1,
        },
      })
    );

    await page.goto("/user/resources");
  });

  async function openModal(page, resourceName) {
    await expect(page.getByText(resourceName).first()).toBeVisible();
    await page.getByText(resourceName).first().click();
    await expect(page.getByRole("button", { name: "Book Now" })).toBeVisible();
    await page.getByRole("button", { name: "Book Now" }).click();
    await expect(page.getByRole("dialog")).toBeVisible();
  }

  test("opens and closes modal correctly", async ({ page }) => {
    await openModal(page, "Conference Room A");

    await expect(page.getByRole("dialog")).toBeVisible();
    await expect(page.getByText("New Booking Request")).toBeVisible();
    await expect(page.getByText("Conference Room A").first()).toBeVisible();

    await page.getByRole("button", { name: "Close modal" }).click();
    await expect(page.getByRole("dialog")).not.toBeVisible();
  });

  test("closes modal when clicking backdrop", async ({ page }) => {
    await openModal(page, "Conference Room A");

  // Click the backdrop element directly rather than a fixed coordinate
    await page.locator('[role="dialog"]').click({ position: { x: 5, y: 5 }, force: true });
    await expect(page.getByRole("dialog")).not.toBeVisible();
    });

  test("shows availability window info for room", async ({ page }) => {
    await openModal(page, "Conference Room A");
    await expect(page.getByText("Available window:")).toBeVisible();
    await expect(page.getByText("08:00 – 18:00")).toBeVisible();
  });

  test("shows violation banner when time is outside window", async ({ page }) => {
    await openModal(page, "Conference Room A");
    await page.locator('input[type="time"]').first().fill("06:00");

    await expect(page.getByText(/Conference Room A.*only bookable between/)).toBeVisible();
    await expect(page.getByRole("button", { name: "Submit Request" })).toBeDisabled();
  });

  test("shows validation error when date is missing", async ({ page }) => {
    await openModal(page, "Conference Room A");

    await page.locator('input[type="date"]').evaluate((el) => {
      const setter = Object.getOwnPropertyDescriptor(
        window.HTMLInputElement.prototype, "value"
      ).set;
      setter.call(el, "");
      el.dispatchEvent(new Event("input", { bubbles: true }));
      el.dispatchEvent(new Event("change", { bubbles: true }));
    });
    await page.fill("textarea", "Test purpose");
    await page.getByRole("button", { name: "Submit Request" }).click();

    await expect(page.getByRole("alert")).toContainText("Date is required");
  });

  test("shows validation error when end time is before start time", async ({ page }) => {
    await openModal(page, "Conference Room A");

    await page.locator('input[type="time"]').first().fill("10:00");
    await page.locator('input[type="time"]').last().fill("09:00");
    await page.fill("textarea", "Test purpose");
    await page.getByRole("button", { name: "Submit Request" }).click();

    await expect(page.getByRole("alert")).toContainText("End time must be after start time");
  });

  test("shows validation error when purpose is empty", async ({ page }) => {
    await openModal(page, "Conference Room A");

    await page.locator("textarea").fill("");
    await page.getByRole("button", { name: "Submit Request" }).click();

    await expect(page.getByRole("alert")).toContainText("Purpose is required");
  });

  test("shows validation error when attendees exceed capacity", async ({ page }) => {
    await openModal(page, "Conference Room A");

    await page.locator('input[type="number"]').fill("999");
    await page.fill("textarea", "Over capacity test");
    await page.getByRole("button", { name: "Submit Request" }).click();

    await expect(page.getByRole("alert")).toContainText("Cannot exceed room capacity of 20");
  });

  test("shows conflict error from API (409)", async ({ page }) => {
    await page.route("**/api/bookings", (route) =>
      route.fulfill({
        status: 409,
        json: { message: "Room is already booked for this time slot." },
      })
    );

    await openModal(page, "Conference Room A");
    await page.fill("textarea", "Team meeting");
    await page.getByRole("button", { name: "Submit Request" }).click();

    await expect(page.getByText("Room is already booked for this time slot.")).toBeVisible();
  });

  test("shows generic error from API on 500", async ({ page }) => {
    await page.route("**/api/bookings", (route) =>
      route.fulfill({
        status: 500,
        json: { message: "Booking failed. Please try again." },
      })
    );

    await openModal(page, "Conference Room A");
    await page.fill("textarea", "Team meeting");
    await page.getByRole("button", { name: "Submit Request" }).click();

    await expect(page.getByText("Booking failed. Please try again.")).toBeVisible();
  });

  test("shows success state after successful submission", async ({ page }) => {
    await page.route("**/api/bookings", (route) =>
      route.fulfill({ json: { id: "bk-001" } })
    );

    await openModal(page, "Conference Room A");
    await page.fill("textarea", "Team planning");
    await page.getByRole("button", { name: "Submit Request" }).click();

    await expect(page.getByText("Booking Submitted!")).toBeVisible();
    await expect(page.getByText("Your request is pending admin approval.")).toBeVisible();
  });

  test("hides attendees field for EQUIPMENT", async ({ page }) => {
    await openModal(page, "Projector X200");
    await expect(page.getByText("Expected Attendees")).not.toBeVisible();
  });

  test("does not show availability window info for EQUIPMENT", async ({ page }) => {
    await openModal(page, "Projector X200");
    await expect(page.getByText("Available window:")).not.toBeVisible();
  });

  test("submit button is enabled by default", async ({ page }) => {
    await openModal(page, "Conference Room A");
    await expect(page.getByRole("button", { name: "Submit Request" })).toBeEnabled();
  });

  test("dialog has correct ARIA attributes", async ({ page }) => {
    await openModal(page, "Conference Room A");

    const dialog = page.getByRole("dialog");
    await expect(dialog).toHaveAttribute("aria-modal", "true");
    await expect(dialog).toHaveAttribute("aria-label", "Book Conference Room A");
  });
});