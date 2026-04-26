// src/App.jsx
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "./shared/context/ThemeContext";
import { AuthProvider } from "./shared/context/AuthContext";

import Navbar from "./shared/components/Navbar";
import Footer from "./shared/components/Footer";
import HomePage from "./pages/HomePage";

// ── Member 4 — Auth / Notifications ──
import RegisterPage        from "./notification/pages/RegisterPage";
import LoginPortalPage     from "./notification/pages/LoginPortalPage";
import RoleLoginPage       from "./notification/pages/RoleLoginPage";
import OAuthCallbackPage   from "./notification/pages/OAuthCallbackPage";
import AdminUserManagement from "./notification/pages/AdminUserManagement";
import ProfilePage         from "./shared/components/ProfilePage";

// ── Member 3 — Incidents ──
import ReportIssuePage           from "./incident/pages/ReportIssuePage";
import MyTicketsPage             from "./incident/pages/MyTicketsPage";
import AdminAllTicketsPage       from "./incident/pages/AdminAllTicketsPage";
import AdminAssignTechnicianPage from "./incident/pages/AdminAssignTechnicianPage";
import TechnicianAssignedPage    from "./incident/pages/TechnicianAssignedPage";
import TechnicianOpenTicketsPage from "./incident/pages/TechnicianOpenTicketsPage";
import TechnicianResolvedPage    from "./incident/pages/TechnicianResolvedPage";

// ── Member 2 — Bookings ──
import NewBookingPage    from "./booking/pages/NewBookingPage";
import BookingsPage      from "./booking/pages/BookingsPage";
import AdminBookingsPage from "./booking/pages/AdminBookingsPage";
import AdminPendingPage  from "./booking/pages/AdminPendingPage";

// ── Member 1 — Facilities ──
import AdminFacilitiesPage from "./facility/pages/AdminFacilitiesPage";
import UserFacilitiesPage  from "./facility/pages/UserFacilitiesPage";

// ── Layouts & placeholders ──
import AdminLayout          from "./shared/components/AdminLayout";
import UserLayout           from "./shared/components/UserLayout";
import TechnicianLayout     from "./shared/components/TechnicianLayout";
import AdminComingSoon      from "./pages/AdminComingSoon";
import UserComingSoon       from "./pages/UserComingSoon";
import TechnicianComingSoon from "./pages/TechnicianComingSoon";

function PublicLayout({ children }) {
  return (
    <div className="flex min-h-screen flex-col bg-gray-50 dark:bg-gray-950 transition-colors duration-300">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}

function AppContent() {
  return (
    <BrowserRouter>
      <Routes>

        {/* ── Public ── */}
        <Route path="/" element={<PublicLayout><HomePage /></PublicLayout>} />

        {/* ── Auth (Member 4) ── */}
        <Route path="/register"       element={<RegisterPage />} />
        <Route path="/login"          element={<LoginPortalPage />} />
        <Route path="/login/:role"    element={<RoleLoginPage />} />
        <Route path="/oauth2/success" element={<OAuthCallbackPage />} />

        {/* ── Admin routes ── */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index                           element={<AdminComingSoon />} />
          <Route path="dashboard"                element={<AdminComingSoon />} />
          <Route path="resources"                element={<AdminFacilitiesPage />} />
          <Route path="resources/add"            element={<AdminFacilitiesPage />} />
          <Route path="bookings"                 element={<AdminBookingsPage />} />
          <Route path="bookings/pending"         element={<AdminPendingPage />} />
          <Route path="maintenance"              element={<AdminAllTicketsPage />} />
          <Route path="maintenance/assign"       element={<AdminAssignTechnicianPage />} />
          <Route path="management/users"         element={<AdminUserManagement />} />
          <Route path="management/notifications" element={<AdminComingSoon />} />
          <Route path="account/profile"          element={<ProfilePage />} />
          <Route path="logout"                   element={<AdminComingSoon />} />
        </Route>

        {/* ── User routes ── */}
        <Route path="/user" element={<UserLayout />}>
          <Route index                      element={<UserComingSoon />} />
          <Route path="dashboard"           element={<UserComingSoon />} />
          <Route path="resources"           element={<UserFacilitiesPage />} />
          <Route path="bookings/new"        element={<NewBookingPage />} />
          <Route path="bookings"            element={<BookingsPage />} />
          <Route path="maintenance/report"  element={<ReportIssuePage />} />
          <Route path="maintenance"         element={<MyTicketsPage />} />
          <Route path="notifications"       element={<UserComingSoon />} />
          <Route path="account/profile"     element={<ProfilePage />} />
          <Route path="logout"              element={<UserComingSoon />} />
        </Route>

        {/* ── Technician routes ── */}
        <Route path="/technician" element={<TechnicianLayout />}>
          <Route index                      element={<TechnicianComingSoon />} />
          <Route path="dashboard"           element={<TechnicianComingSoon />} />
          <Route path="tickets/assigned"    element={<TechnicianAssignedPage />} />
          <Route path="tickets/open"        element={<TechnicianOpenTicketsPage />} />
          <Route path="tickets/resolved"    element={<TechnicianResolvedPage />} />
          <Route path="resources"           element={<UserFacilitiesPage />} />
          <Route path="notifications"       element={<TechnicianComingSoon />} />
          <Route path="account/profile"     element={<ProfilePage />} />
          <Route path="logout"              element={<TechnicianComingSoon />} />
        </Route>

      </Routes>
    </BrowserRouter>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  );
}