/**
 * Admin Routes
 * Drop this inside your main App.jsx / router setup.
 *
 * Usage in App.jsx:
 *   import { adminRoutes } from './admin/routes/adminRoutes';
 *   // Then spread into your createBrowserRouter routes array.
 *
 * Later, wrap the AdminLayout element with <AdminRoute /> once auth is ready.
 */
import AdminLayout from '../../shared/components/AdminLayout';
import AdminComingSoon from '../pages/AdminComingSoon';

// All admin child routes — each renders <AdminComingSoon /> for now.
// Members will replace AdminComingSoon with their real page components.
const adminChildRoutes = [
  { path: "dashboard" },
  { path: "resources" },
  { path: "resources/add" },
  { path: "bookings" },
  { path: "bookings/pending" },
  { path: "maintenance" },
  { path: "maintenance/assign" },
  { path: "management/users" },
  { path: "management/notifications" },
  { path: "account/profile" },
  { path: "logout" },   // Member 4 will handle real logout here
].map(({ path }) => ({
  path,
  element: <AdminComingSoon />,
}));

export const adminRoutes = {
  path: "/admin",
  element: <AdminLayout />,
  children: [
    // Redirect /admin → /admin/dashboard
    { index: true, element: <AdminComingSoon /> },
    ...adminChildRoutes,
  ],
};