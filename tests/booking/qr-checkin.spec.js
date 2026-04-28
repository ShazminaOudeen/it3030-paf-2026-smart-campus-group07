// tests/booking/qr-checkin.spec.js
const { test, expect } = require("@playwright/test");

test.describe("QrCheckInPage", () => {
  test("shows loading spinner while verifying token", async ({ page }) => {
    await page.route("**/api/bookings/checkin/**", async (route) => {
      await new Promise((r) => setTimeout(r, 1500));
      await route.fulfill({ json: { valid: true } });
    });

    await page.goto("/checkin/test-token-123");

    await expect(page.getByText("Verifying booking…")).toBeVisible();
    await expect(page.locator(".animate-spin")).toBeVisible();
  });

  test("shows success state for a valid token", async ({ page }) => {
    await page.route("**/api/bookings/checkin/**", (route) =>  // ← fixed
      route.fulfill({
        json: {
          valid: true,
          message: "Booking is confirmed",
          userName: "Alice Johnson",
          resourceName: "Conference Room A",
          resourceLocation: "Block B, Floor 2",
          bookingDate: "2025-08-10",
          startTime: "09:00",
          endTime: "11:00",
          purpose: "Team standup",
          bookingId: "BK-001",
        },
      })
    );

    await page.goto("/checkin/valid-token");

    await expect(page.getByText("Check-in Successful")).toBeVisible();
    await expect(page.getByText("Alice Johnson")).toBeVisible();
    await expect(page.getByText(/Conference Room A/)).toBeVisible();
    await expect(page.getByText(/Block B, Floor 2/)).toBeVisible();
    await expect(page.getByText("2025-08-10")).toBeVisible();
    await expect(page.getByText(/09:00/)).toBeVisible();
    await expect(page.getByText(/11:00/)).toBeVisible();
    await expect(page.getByText("Team standup")).toBeVisible();
    await expect(page.getByText(/BK-001/)).toBeVisible();
  });

  test("shows error state for an invalid token", async ({ page }) => {
    await page.route("**/api/bookings/checkin/**", (route) =>  // ← fixed
      route.fulfill({
        json: { valid: false, message: "Token has expired or is invalid." },
      })
    );

    await page.goto("/checkin/bad-token");

    await expect(page.getByText("Invalid Booking")).toBeVisible();
    await expect(page.getByText("Token has expired or is invalid.")).toBeVisible();
    await expect(page.getByText("Booked by")).not.toBeVisible();
  });

  test("shows fallback error message when API call fails", async ({ page }) => {
    await page.route("**/api/bookings/checkin/**", (route) => route.abort("failed"));  // ← fixed

    await page.goto("/checkin/network-error-token");

    await expect(page.getByText("Invalid Booking")).toBeVisible();
    await expect(page.getByText("Unable to verify. Please try again.")).toBeVisible();
  });

  test("shows the Assetra Check-in branding", async ({ page }) => {
    await page.route("**/api/bookings/checkin/**", (route) =>  // ← fixed
      route.fulfill({ json: { valid: false, message: "Invalid" } })
    );

    await page.goto("/checkin/any-token");

    await expect(page.getByText("Assetra Check-in")).toBeVisible();
    await expect(page.getByText("Assetra · Smart Campus Operations Hub")).toBeVisible();
  });

  test("does not show purpose row if purpose is absent in response", async ({ page }) => {
    await page.route("**/api/bookings/checkin/**", (route) =>  // ← fixed
      route.fulfill({
        json: {
          valid: true,
          message: "OK",
          userName: "Bob",
          resourceName: "Lab 1",
          bookingDate: "2025-08-10",
          startTime: "10:00",
          endTime: "12:00",
        },
      })
    );

    await page.goto("/checkin/no-purpose-token");

    await expect(page.getByText("Check-in Successful")).toBeVisible();
    await expect(page.getByText("Purpose")).not.toBeVisible();
  });
});