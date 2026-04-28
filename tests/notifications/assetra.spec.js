// assetra.spec.js  — Playwright tests for Member 4 (Auth + Notifications + User Management)
// Run: npx playwright test assetra.spec.js --headed
//
// ─── BEFORE YOU RUN ────────────────────────────────────────────────────────────
// 1. Make sure backend is running on http://localhost:8082
// 2. Make sure frontend is running on http://localhost:5173
// 3. Have these test accounts ready in your DB:
//      USER  → email: testuser@test.com   password: Test1234!
//      ADMIN → email: testadmin@test.com  password: Test1234!
//      TECH  → email: testtech@test.com   password: Test1234!
// 4. Have at least 1 ticket created by testuser in your DB
// ────────────────────────────────────────────────────────────────────────────────

const { test, expect } = require("@playwright/test");

const BASE = "http://localhost:5173";
const ADMIN_EMAIL = "testadmin@test.com";
const USER_EMAIL  = "testuser@test.com";
const TECH_EMAIL  = "testtech@test.com";
const PASSWORD    = "Test1234!";

// ── Helper: log in as a role ──────────────────────────────────────────────────
async function loginAs(page, role, email, password) {
  await page.goto(`${BASE}/login/${role}`);
  await page.fill('input[type="email"]', email);
  await page.fill('input[type="password"]', password);
  await page.click('button[type="submit"]');
  // Wait for redirect away from login
  await page.waitForURL((url) => !url.toString().includes("/login"), { timeout: 8000 });
}

// ── Helper: logout ────────────────────────────────────────────────────────────
async function logout(page) {
  await page.evaluate(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  });
  await page.goto(`${BASE}/login`);
}

// ═══════════════════════════════════════════════════════════════════════════════
// 1. AUTH TESTS
// ═══════════════════════════════════════════════════════════════════════════════

test.describe("Auth — Login", () => {

  test("Login portal page loads with role options", async ({ page }) => {
    await page.goto(`${BASE}/login`);
    await expect(page).toHaveURL(`${BASE}/login`);
    // Should show role selection buttons
    await expect(page.locator("body")).toContainText(/admin|user|technician/i);
  });

  test("User can log in successfully", async ({ page }) => {
    await loginAs(page, "user", USER_EMAIL, PASSWORD);
    await expect(page).toHaveURL(/\/user/);
    // Token should be stored
    const token = await page.evaluate(() => localStorage.getItem("token"));
    expect(token).not.toBeNull();
  });

  test("Admin can log in successfully", async ({ page }) => {
    await loginAs(page, "admin", ADMIN_EMAIL, PASSWORD);
    await expect(page).toHaveURL(/\/admin/);
  });

  test("Technician can log in successfully", async ({ page }) => {
    await loginAs(page, "technician", TECH_EMAIL, PASSWORD);
    await expect(page).toHaveURL(/\/technician/);
  });

  test("Wrong password shows error", async ({ page }) => {
    await page.goto(`${BASE}/login/user`);
    await page.fill('input[type="email"]', USER_EMAIL);
    await page.fill('input[type="password"]', "WrongPassword999!");
    await page.click('button[type="submit"]');
    // Should stay on login page or show error
    await expect(page.locator("body")).toContainText(/invalid|incorrect|error|wrong/i, { timeout: 5000 });
  });

  test("Google OAuth button is visible on login page", async ({ page }) => {
    await page.goto(`${BASE}/login/user`);
    await expect(page.locator("body")).toContainText(/google/i);
  });

  test("GitHub OAuth button is visible on login page", async ({ page }) => {
    await page.goto(`${BASE}/login/user`);
    await expect(page.locator("body")).toContainText(/github/i);
  });

  test("Logout clears session and redirects", async ({ page }) => {
    await loginAs(page, "user", USER_EMAIL, PASSWORD);
    await logout(page);
    const token = await page.evaluate(() => localStorage.getItem("token"));
    expect(token).toBeNull();
    await expect(page).toHaveURL(/\/login/);
  });

});

test.describe("Auth — Register", () => {

  test("Register page loads", async ({ page }) => {
    await page.goto(`${BASE}/register`);
    await expect(page.locator("body")).toContainText(/register|sign up|create/i);
  });

  test("Register with missing fields shows validation", async ({ page }) => {
    await page.goto(`${BASE}/register`);
    await page.click('button[type="submit"]');
    // HTML5 validation or custom error should appear
    const emailInput = page.locator('input[type="email"]');
    await expect(emailInput).toBeVisible();
  });

});

// ═══════════════════════════════════════════════════════════════════════════════
// 2. NOTIFICATIONS PAGE TESTS
// ═══════════════════════════════════════════════════════════════════════════════

test.describe("Notifications — Page Load", () => {

  test("Notifications page loads for logged-in user", async ({ page }) => {
    await loginAs(page, "user", USER_EMAIL, PASSWORD);
    await page.goto(`${BASE}/user/notifications`);
    await expect(page.locator("h1")).toContainText(/notifications/i);
  });

  test("Notifications page shows login prompt when not logged in", async ({ page }) => {
    await page.goto(`${BASE}/user/notifications`);
    await expect(page.locator("body")).toContainText(/log in|login|please/i);
  });

  test("All and Unread tabs are visible", async ({ page }) => {
    await loginAs(page, "user", USER_EMAIL, PASSWORD);
    await page.goto(`${BASE}/user/notifications`);
    await expect(page.locator("button", { hasText: /^All$/i })).toBeVisible();
    await expect(page.locator("button", { hasText: /unread/i })).toBeVisible();
  });

  test("Settings/preferences button is visible", async ({ page }) => {
    await loginAs(page, "user", USER_EMAIL, PASSWORD);
    await page.goto(`${BASE}/user/notifications`);
    // The gear icon button
    const settingsBtn = page.locator("button svg").first();
    await expect(settingsBtn).toBeVisible();
  });

  test("Refresh button reloads notifications", async ({ page }) => {
    await loginAs(page, "user", USER_EMAIL, PASSWORD);
    await page.goto(`${BASE}/user/notifications`);
    // Click the refresh (rotate arrows) button — last button in header area
    const refreshBtn = page.locator("button").filter({ hasText: "" }).last();
    await refreshBtn.click();
    // Should not crash — page still shows heading
    await expect(page.locator("h1")).toContainText(/notifications/i);
  });

  test("Switching to Unread tab works", async ({ page }) => {
    await loginAs(page, "user", USER_EMAIL, PASSWORD);
    await page.goto(`${BASE}/user/notifications`);
    await page.click("button:has-text('Unread')");
    // Either shows notifications or "No unread" message
    await expect(page.locator("body")).toContainText(/unread|caught up|no unread/i);
  });

});

test.describe("Notifications — Preferences Panel", () => {

  test("Preferences panel opens and closes", async ({ page }) => {
    await loginAs(page, "user", USER_EMAIL, PASSWORD);
    await page.goto(`${BASE}/user/notifications`);
    // Click the gear button (settings)
    await page.locator("button").nth(1).click();
    await expect(page.locator("body")).toContainText(/preference/i);
    // Click again to close
    await page.locator("button").nth(1).click();
  });

  test("Preferences panel shows 3 category toggles", async ({ page }) => {
    await loginAs(page, "user", USER_EMAIL, PASSWORD);
    await page.goto(`${BASE}/user/notifications`);
    await page.locator("button").nth(1).click();
    await expect(page.locator("body")).toContainText(/booking/i);
    await expect(page.locator("body")).toContainText(/ticket/i);
    await expect(page.locator("body")).toContainText(/comment/i);
  });

  test("Toggle persists in localStorage", async ({ page }) => {
    await loginAs(page, "user", USER_EMAIL, PASSWORD);
    await page.goto(`${BASE}/user/notifications`);
    // Open prefs
    await page.locator("button").nth(1).click();
    // Click the first toggle button inside preferences
    const toggles = page.locator("button[class*='rounded-full']");
    await toggles.first().click();
    // Check localStorage updated
    const prefs = await page.evaluate(() => {
      const keys = Object.keys(localStorage).filter(k => k.includes("notif-prefs"));
      return keys.length > 0 ? localStorage.getItem(keys[0]) : null;
    });
    expect(prefs).not.toBeNull();
  });

});

// ═══════════════════════════════════════════════════════════════════════════════
// 3. NOTIFICATION TRIGGERS (Ticket Status + Comments)
// ═══════════════════════════════════════════════════════════════════════════════

test.describe("Notifications — Ticket Status Triggers", () => {

  test("User gets IN_PROGRESS notification after admin assigns technician", async ({ browser }) => {
    // Step 1: User creates a ticket via API
    const userCtx = await browser.newContext();
    const userPage = await userCtx.newPage();
    await loginAs(userPage, "user", USER_EMAIL, PASSWORD);
    const userToken = await userPage.evaluate(() => localStorage.getItem("token"));

    // Create ticket via API
    const ticketRes = await userPage.evaluate(async (token) => {
      const fd = new FormData();
      fd.append("ticket", new Blob([JSON.stringify({
        category: "ELECTRICAL",
        description: "Test notification ticket",
        priority: "MEDIUM",
        contactDetails: "0771234567"
      })], { type: "application/json" }));
      const res = await fetch("http://localhost:8082/api/tickets", {
        method: "POST",
        headers: { "X-User-Id": JSON.parse(localStorage.getItem("user")).id },
        body: fd
      });
      return res.json();
    }, userToken);

    const ticketId = ticketRes.id;
    expect(ticketId).toBeDefined();

    // Step 2: Admin assigns technician
    const adminCtx = await browser.newContext();
    const adminPage = await adminCtx.newPage();
    await loginAs(adminPage, "admin", ADMIN_EMAIL, PASSWORD);
    const adminUser = await adminPage.evaluate(() => JSON.parse(localStorage.getItem("user")));

    // Get a technician id from users list
    const techRes = await adminPage.evaluate(async (token) => {
      const res = await fetch("http://localhost:8082/api/users", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      const users = await res.json();
      return users.find(u => u.role === "TECHNICIAN");
    }, await adminPage.evaluate(() => localStorage.getItem("token")));

    if (!techRes) {
      console.warn("No technician found — skipping assign step");
    } else {
      await adminPage.evaluate(async ({ ticketId, techId, token }) => {
        await fetch(`http://localhost:8082/api/tickets/${ticketId}/assign`, {
          method: "PUT",
          headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
          body: JSON.stringify({ technicianId: techId })
        });
      }, { ticketId, techId: techRes.id, token: await adminPage.evaluate(() => localStorage.getItem("token")) });
    }

    // Step 3: Check user's notifications
    await userPage.goto(`${BASE}/user/notifications`);
    await userPage.waitForTimeout(1500);
    const body = await userPage.locator("body").textContent();
    expect(body).toMatch(/IN_PROGRESS|technician|assigned/i);

    await userCtx.close();
    await adminCtx.close();
  });

  test("User gets RESOLVED notification after technician updates status", async ({ browser }) => {
    const userCtx = await browser.newContext();
    const userPage = await userCtx.newPage();
    await loginAs(userPage, "user", USER_EMAIL, PASSWORD);

    // Create a ticket
    const ticketRes = await userPage.evaluate(async () => {
      const fd = new FormData();
      fd.append("ticket", new Blob([JSON.stringify({
        category: "PLUMBING",
        description: "Resolve notification test",
        priority: "LOW",
        contactDetails: "0779876543"
      })], { type: "application/json" }));
      const res = await fetch("http://localhost:8082/api/tickets", {
        method: "POST",
        headers: { "X-User-Id": JSON.parse(localStorage.getItem("user")).id },
        body: fd
      });
      return res.json();
    });

    const ticketId = ticketRes.id;

    // Technician resolves it directly via API
    const techCtx = await browser.newContext();
    const techPage = await techCtx.newPage();
    await loginAs(techPage, "technician", TECH_EMAIL, PASSWORD);

    await techPage.evaluate(async (tid) => {
      await fetch(`http://localhost:8082/api/tickets/${tid}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "RESOLVED", resolutionNotes: "Fixed it" })
      });
    }, ticketId);

    // Check user notifications
    await userPage.goto(`${BASE}/user/notifications`);
    await userPage.waitForTimeout(1500);
    await expect(userPage.locator("body")).toContainText(/RESOLVED|resolved|status/i);

    await userCtx.close();
    await techCtx.close();
  });

});

test.describe("Notifications — Comment Trigger", () => {

  test("User gets COMMENT_ADDED notification when admin comments on their ticket", async ({ browser }) => {
    // User creates ticket
    const userCtx = await browser.newContext();
    const userPage = await userCtx.newPage();
    await loginAs(userPage, "user", USER_EMAIL, PASSWORD);
    const userId = await userPage.evaluate(() => JSON.parse(localStorage.getItem("user")).id);

    const ticketRes = await userPage.evaluate(async (uid) => {
      const fd = new FormData();
      fd.append("ticket", new Blob([JSON.stringify({
        category: "NETWORK",
        description: "Comment notification test",
        priority: "HIGH",
        contactDetails: "0771112233"
      })], { type: "application/json" }));
      const res = await fetch("http://localhost:8082/api/tickets", {
        method: "POST",
        headers: { "X-User-Id": uid },
        body: fd
      });
      return res.json();
    }, userId);

    const ticketId = ticketRes.id;

    // Admin adds a comment
    const adminCtx = await browser.newContext();
    const adminPage = await adminCtx.newPage();
    await loginAs(adminPage, "admin", ADMIN_EMAIL, PASSWORD);
    const adminId = await adminPage.evaluate(() => JSON.parse(localStorage.getItem("user")).id);

    await adminPage.evaluate(async ({ tid, aid }) => {
      await fetch(`http://localhost:8082/api/tickets/${tid}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-User-Id": aid },
        body: JSON.stringify({ content: "Admin checking on this issue." })
      });
    }, { tid: ticketId, aid: adminId });

    // User checks notifications
    await userPage.goto(`${BASE}/user/notifications`);
    await userPage.waitForTimeout(1500);
    await expect(userPage.locator("body")).toContainText(/comment|added/i);

    await userCtx.close();
    await adminCtx.close();
  });

  test("User does NOT get notification when they comment on their own ticket", async ({ browser }) => {
    const userCtx = await browser.newContext();
    const userPage = await userCtx.newPage();
    await loginAs(userPage, "user", USER_EMAIL, PASSWORD);
    const userId = await userPage.evaluate(() => JSON.parse(localStorage.getItem("user")).id);

    // Create ticket
    const ticketRes = await userPage.evaluate(async (uid) => {
      const fd = new FormData();
      fd.append("ticket", new Blob([JSON.stringify({
        category: "HVAC",
        description: "Self comment test",
        priority: "LOW",
        contactDetails: "0770000000"
      })], { type: "application/json" }));
      const res = await fetch("http://localhost:8082/api/tickets", {
        method: "POST",
        headers: { "X-User-Id": uid },
        body: fd
      });
      return res.json();
    }, userId);

    // Get notification count before
    const beforeCount = await userPage.evaluate(async () => {
      const res = await fetch("http://localhost:8082/api/notifications/unread-count", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });
      const data = await res.json();
      return data.count;
    });

    // User comments on their own ticket
    await userPage.evaluate(async ({ tid, uid }) => {
      await fetch(`http://localhost:8082/api/tickets/${tid}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-User-Id": uid },
        body: JSON.stringify({ content: "My own comment" })
      });
    }, { tid: ticketRes.id, uid: userId });

    await userPage.waitForTimeout(500);

    // Count should NOT have increased
    const afterCount = await userPage.evaluate(async () => {
      const res = await fetch("http://localhost:8082/api/notifications/unread-count", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });
      const data = await res.json();
      return data.count;
    });

    expect(afterCount).toBe(beforeCount);
    await userCtx.close();
  });

});

// ═══════════════════════════════════════════════════════════════════════════════
// 4. MARK READ / DELETE
// ═══════════════════════════════════════════════════════════════════════════════

test.describe("Notifications — Mark Read & Delete", () => {

  test("Mark single notification as read", async ({ page }) => {
    await loginAs(page, "user", USER_EMAIL, PASSWORD);
    await page.goto(`${BASE}/user/notifications`);
    await page.waitForTimeout(1000);
    // Click the checkmark button on first unread notification if it exists
    const checkBtn = page.locator("button[title='Mark as read']").first();
    if (await checkBtn.isVisible()) {
      await checkBtn.click();
      await page.waitForTimeout(500);
      // Button should disappear (notification is now read)
      await expect(checkBtn).not.toBeVisible();
    } else {
      // All already read — pass
      console.log("No unread notifications to mark — skipping");
    }
  });

  test("Mark all as read clears unread count", async ({ page }) => {
    await loginAs(page, "user", USER_EMAIL, PASSWORD);
    await page.goto(`${BASE}/user/notifications`);
    await page.waitForTimeout(1000);
    const markAllBtn = page.locator("button:has-text('Mark all read')");
    if (await markAllBtn.isVisible()) {
      await markAllBtn.click();
      await page.waitForTimeout(500);
      await expect(markAllBtn).not.toBeVisible(); // disappears when count = 0
    } else {
      console.log("No unread — skipping mark all");
    }
  });

  test("Delete a notification removes it from list", async ({ page }) => {
    await loginAs(page, "user", USER_EMAIL, PASSWORD);
    await page.goto(`${BASE}/user/notifications`);
    await page.waitForTimeout(1000);
    const cards = page.locator(".space-y-3 > div");
    const countBefore = await cards.count();
    if (countBefore > 0) {
      const deleteBtn = page.locator("button[title='Delete']").first();
      await deleteBtn.click();
      await page.waitForTimeout(500);
      const countAfter = await cards.count();
      expect(countAfter).toBe(countBefore - 1);
    } else {
      console.log("No notifications to delete — skipping");
    }
  });

});

// ═══════════════════════════════════════════════════════════════════════════════
// 5. ADMIN — USER MANAGEMENT
// ═══════════════════════════════════════════════════════════════════════════════

test.describe("Admin — User Management", () => {

  test("User management page loads for admin", async ({ page }) => {
    await loginAs(page, "admin", ADMIN_EMAIL, PASSWORD);
    await page.goto(`${BASE}/admin/management/users`);
    await expect(page.locator("body")).toContainText(/user|management|admin/i);
  });

  test("User list is displayed", async ({ page }) => {
    await loginAs(page, "admin", ADMIN_EMAIL, PASSWORD);
    await page.goto(`${BASE}/admin/management/users`);
    await page.waitForTimeout(1500);
    // Should show at least one user row
    await expect(page.locator("body")).toContainText(/@/); // emails have @
  });

  test("Non-admin cannot access user management", async ({ page }) => {
    await loginAs(page, "user", USER_EMAIL, PASSWORD);
    await page.goto(`${BASE}/admin/management/users`);
    // Should redirect or show access denied
    await expect(page).not.toHaveURL(`${BASE}/admin/management/users`);
  });

});

// ═══════════════════════════════════════════════════════════════════════════════
// 6. PROFILE PAGE (all roles)
// ═══════════════════════════════════════════════════════════════════════════════

test.describe("Profile Page", () => {

  test("User profile page loads", async ({ page }) => {
    await loginAs(page, "user", USER_EMAIL, PASSWORD);
    await page.goto(`${BASE}/user/account/profile`);
    await expect(page.locator("body")).toContainText(/profile|account|name|email/i);
  });

  test("Admin profile page loads", async ({ page }) => {
    await loginAs(page, "admin", ADMIN_EMAIL, PASSWORD);
    await page.goto(`${BASE}/admin/account/profile`);
    await expect(page.locator("body")).toContainText(/profile|account|name|email/i);
  });

  test("Technician profile page loads", async ({ page }) => {
    await loginAs(page, "technician", TECH_EMAIL, PASSWORD);
    await page.goto(`${BASE}/technician/account/profile`);
    await expect(page.locator("body")).toContainText(/profile|account|name|email/i);
  });

  test("Profile shows correct user email", async ({ page }) => {
    await loginAs(page, "user", USER_EMAIL, PASSWORD);
    await page.goto(`${BASE}/user/account/profile`);
    await page.waitForTimeout(1000);
    await expect(page.locator("body")).toContainText(USER_EMAIL);
  });

});