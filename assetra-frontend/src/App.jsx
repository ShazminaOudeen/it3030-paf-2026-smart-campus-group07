import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "./shared/context/ThemeContext";
import Navbar from "./shared/components/Navbar";
import Footer from "./shared/components/Footer";
import HomePage from "./pages/HomePage";

// Admin imports
import AdminLayout from "./shared/components/AdminLayout";
import AdminComingSoon from "./pages/AdminComingSoon";

// User imports
import UserLayout from "./shared/components/UserLayout";
import UserComingSoon from "./pages/UserComingSoon";

// Technician imports
import TechnicianLayout from "./shared/components/TechnicianLayout";
import TechnicianComingSoon from "./pages/TechnicianComingSoon";

// Member 3 — Incident pages
import ReportIssuePage from "./incident/pages/ReportIssuePage";
import MyTicketsPage from "./incident/pages/MyTicketsPage";
import AdminAllTicketsPage from "./incident/pages/AdminAllTicketsPage";
import AdminAssignTechnicianPage from "./incident/pages/AdminAssignTechnicianPage";
import TechnicianAssignedPage from "./incident/pages/TechnicianAssignedPage";
import TechnicianOpenTicketsPage from "./incident/pages/TechnicianOpenTicketsPage";
import TechnicianResolvedPage from "./incident/pages/TechnicianResolvedPage";

export default function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>

          {/* ── Public routes ── */}
          <Route
            path="/"
            element={
              <div className="flex min-h-screen flex-col bg-gray-50 dark:bg-gray-950 transition-colors duration-300">
                <Navbar />
                <main className="flex-1">
                  <HomePage />
                </main>
                <Footer />
              </div>
            }
          />

          {/* ── Admin routes ── */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminComingSoon />} />
            <Route path="dashboard" element={<AdminComingSoon />} />
            <Route path="resources" element={<AdminComingSoon />} />
            <Route path="resources/add" element={<AdminComingSoon />} />
            <Route path="bookings" element={<AdminComingSoon />} />
            <Route path="bookings/pending" element={<AdminComingSoon />} />
            <Route path="maintenance" element={<AdminAllTicketsPage />} />
            <Route path="maintenance/assign" element={<AdminAssignTechnicianPage />} />
            <Route path="management/users" element={<AdminComingSoon />} />
            <Route path="management/notifications" element={<AdminComingSoon />} />
            <Route path="account/profile" element={<AdminComingSoon />} />
            <Route path="logout" element={<AdminComingSoon />} />
          </Route>

          {/* ── User routes ── */}
          <Route path="/user" element={<UserLayout />}>
            <Route index element={<UserComingSoon />} />
            <Route path="dashboard" element={<UserComingSoon />} />
            <Route path="resources" element={<UserComingSoon />} />
            <Route path="bookings/new" element={<UserComingSoon />} />
            <Route path="bookings" element={<UserComingSoon />} />
            <Route path="maintenance/report" element={<ReportIssuePage />} />
            <Route path="maintenance" element={<MyTicketsPage />} />
            <Route path="notifications" element={<UserComingSoon />} />
            <Route path="account/profile" element={<UserComingSoon />} />
            <Route path="logout" element={<UserComingSoon />} />
          </Route>

          {/* ── Technician routes ── */}
          <Route path="/technician" element={<TechnicianLayout />}>
            <Route index element={<TechnicianComingSoon />} />
            <Route path="dashboard" element={<TechnicianComingSoon />} />
            <Route path="tickets/assigned" element={<TechnicianAssignedPage />} />
            <Route path="tickets/open" element={<TechnicianOpenTicketsPage />} />
            <Route path="tickets/resolved" element={<TechnicianResolvedPage />} />
            <Route path="resources" element={<TechnicianComingSoon />} />
            <Route path="notifications" element={<TechnicianComingSoon />} />
            <Route path="account/profile" element={<TechnicianComingSoon />} />
            <Route path="logout" element={<TechnicianComingSoon />} />
          </Route>

        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}