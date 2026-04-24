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
            <Route path="resources" element={<AdminComingSoon />} />
            <Route path="resources/add" element={<AdminComingSoon />} />
            <Route path="bookings" element={<AdminComingSoon />} />
            <Route path="bookings/pending" element={<AdminComingSoon />} />
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
            <Route path="resources" element={<UserComingSoon />} />
            <Route path="bookings/new" element={<UserComingSoon />} />
            <Route path="bookings" element={<UserComingSoon />} />
            <Route path="maintenance/report" element={<UserComingSoon />} />
            <Route path="maintenance" element={<UserComingSoon />} />
            <Route path="notifications" element={<UserComingSoon />} />
            <Route path="account/profile" element={<UserComingSoon />} />
            <Route path="logout" element={<UserComingSoon />} />
        </Route>
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}