import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "./shared/context/ThemeContext";
import Navbar from "./shared/components/Navbar";
import Footer from "./shared/components/Footer";
import HomePage from "./pages/HomePage";

// Admin imports
import AdminLayout from "./shared/components/AdminLayout";
import AdminComingSoon from "./pages/AdminComingSoon";

//user imports
import UserLayout from "./shared/components/UserLayout";
import UserComingSoon from "./pages/UserComingSoon";

//technician imports
import TechnicianLayout from "./shared/components/TechnicianLayout";
import TechnicianComingSoon from "./pages/TechnicianComingSoon";

//booking
import NewBookingPage        from "./booking/pages/NewBookingPage";
import BookingsPage          from "./booking/pages/BookingsPage";
import AdminBookingsPage     from "./booking/pages/AdminBookingsPage";
import AdminPendingPage      from "./booking/pages/AdminPendingPage";
import QrCheckInPage         from "./booking/pages/QrCheckInPage";

//facilities
import AdminFacilitiesPage from "./facility/pages/AdminFacilitiesPage";
import UserFacilitiesPage  from "./facility/pages/UserFacilitiesPage";

export default function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>

          {/* ── Public routes (with Navbar + Footer) ── */}
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

          {/* ── Admin routes (no Navbar/Footer, own layout) ── */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminComingSoon />} />
            <Route path="dashboard" element={<AdminComingSoon />} />
            <Route path="resources"     element={<AdminFacilitiesPage />} />
           <Route path="resources/add" element={<AdminFacilitiesPage />} />
            <Route path="bookings"         element={<AdminBookingsPage />} />
            <Route path="bookings/pending" element={<AdminPendingPage />} />

            <Route path="maintenance" element={<AdminComingSoon />} />
            <Route path="maintenance/assign" element={<AdminComingSoon />} />
            <Route path="management/users" element={<AdminComingSoon />} />
            <Route path="management/notifications" element={<AdminComingSoon />} />
            <Route path="account/profile" element={<AdminComingSoon />} />
            <Route path="logout" element={<AdminComingSoon />} />
          </Route>

          
          <Route path="/user" element={<UserLayout />}>
            <Route index element={<UserComingSoon />} />
            <Route path="dashboard" element={<UserComingSoon />} />
             <Route path="resources" element={<UserFacilitiesPage />} />
             <Route path="bookings/new" element={<NewBookingPage />} />
            <Route path="bookings"     element={<BookingsPage />} />
            <Route path="maintenance/report" element={<UserComingSoon />} />
            <Route path="maintenance" element={<UserComingSoon />} />
            <Route path="notifications" element={<UserComingSoon />} />
            <Route path="account/profile" element={<UserComingSoon />} />
            <Route path="logout" element={<UserComingSoon />} />
        </Route>

        <Route path="/technician" element={<TechnicianLayout />}>
            <Route index element={<TechnicianComingSoon />} />
            <Route path="dashboard" element={<TechnicianComingSoon />} />
            <Route path="tickets/assigned" element={<TechnicianComingSoon />} />
            <Route path="tickets/open" element={<TechnicianComingSoon />} />
            <Route path="tickets/resolved" element={<TechnicianComingSoon />} />
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