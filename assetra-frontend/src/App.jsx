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
import ProfilePage from "./shared/components/ProfilePage";

// ── Member 3 — Incidents ──
import ReportIssuePage           from "./incident/pages/ReportIssuePage";
import MyTicketsPage             from "./incident/pages/MyTicketsPage";
import AdminAllTicketsPage       from "./incident/pages/AdminAllTicketsPage";
import AdminAssignTechnicianPage from "./incident/pages/AdminAssignTechnicianPage";
import TechnicianAssignedPage    from "./incident/pages/TechnicianAssignedPage";
import TechnicianOpenTicketsPage from "./incident/pages/TechnicianOpenTicketsPage";
import TechnicianResolvedPage    from "./incident/pages/TechnicianResolvedPage";

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

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>

            {/* ── Public ── */}
            <Route path="/" element={<PublicLayout><HomePage /></PublicLayout>} />

            {/* ── Auth (Member 4) ── */}
            <Route path="/register"        element={<RegisterPage />} />
            <Route path="/login"           element={<LoginPortalPage />} />
            <Route path="/login/:role"     element={<RoleLoginPage />} />
            <Route path="/oauth2/success" element={<OAuthCallbackPage />} />

            {/* ── Admin routes ── */}
            <Route path="/admin" element={<AdminLayout />}>
              <Route index                          element={<AdminComingSoon />} />
              <Route path="dashboard"              element={<AdminComingSoon />} />
              <Route path="resources"              element={<AdminComingSoon />} />       {/* Member 1 */}
              <Route path="resources/add"          element={<AdminComingSoon />} />       {/* Member 1 */}
              <Route path="bookings"               element={<AdminComingSoon />} />       {/* Member 2 */}
              <Route path="bookings/pending"       element={<AdminComingSoon />} />       {/* Member 2 */}
              <Route path="maintenance"            element={<AdminAllTicketsPage />} />   {/* Member 3 */}
              <Route path="maintenance/assign"     element={<AdminAssignTechnicianPage />} /> {/* Member 3 */}
              <Route path="management/users"       element={<AdminUserManagement />} />  {/* Member 4 */}
              <Route path="management/notifications" element={<AdminComingSoon />} />    {/* Member 4 */}
              <Route path="account/profile" element={<ProfilePage />} /> 
              <Route path="logout"                 element={<AdminComingSoon />} />
            </Route>

            {/* ── User routes ── */}
            <Route path="/user" element={<UserLayout />}>
              <Route index                         element={<UserComingSoon />} />
              <Route path="dashboard"              element={<UserComingSoon />} />
              <Route path="resources"              element={<UserComingSoon />} />        {/* Member 1 */}
              <Route path="bookings/new"           element={<UserComingSoon />} />        {/* Member 2 */}
              <Route path="bookings"               element={<UserComingSoon />} />        {/* Member 2 */}
              <Route path="maintenance/report"     element={<ReportIssuePage />} />      {/* Member 3 */}
              <Route path="maintenance"            element={<MyTicketsPage />} />         {/* Member 3 */}
              <Route path="notifications"          element={<UserComingSoon />} />        {/* Member 4 */}
              <Route path="account/profile" element={<ProfilePage />} />
              <Route path="logout"                 element={<UserComingSoon />} />

            </Route>

            {/* ── Technician routes ── */}
            <Route path="/technician" element={<TechnicianLayout />}>
              <Route index                         element={<TechnicianComingSoon />} />
              <Route path="dashboard"              element={<TechnicianComingSoon />} />
              <Route path="tickets/assigned"       element={<TechnicianAssignedPage />} />    {/* Member 3 */}
              <Route path="tickets/open"           element={<TechnicianOpenTicketsPage />} /> {/* Member 3 */}
              <Route path="tickets/resolved"       element={<TechnicianResolvedPage />} />    {/* Member 3 */}
              <Route path="resources"              element={<TechnicianComingSoon />} />      {/* Member 1 */}
              <Route path="notifications"          element={<TechnicianComingSoon />} />      {/* Member 4 */}
              <Route path="account/profile" element={<ProfilePage />} />
              <Route path="logout"                 element={<TechnicianComingSoon />} />
            </Route>

          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}