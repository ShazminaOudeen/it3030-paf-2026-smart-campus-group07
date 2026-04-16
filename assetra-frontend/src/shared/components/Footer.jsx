// src/shared/components/Footer.jsx
import { Link } from "react-router-dom";

const LINKS = {
  Platform: [
    { label: "Facilities", to: "/facilities" },
    { label: "Bookings",   to: "/bookings" },
    { label: "Incidents",  to: "/incidents" },
    { label: "Notifications", to: "/notifications" },
  ],
  Support: [
    { label: "Help Center",    to: "#" },
    { label: "Documentation",  to: "#" },
    { label: "System Status",  to: "#" },
  ],
  University: [
    { label: "IT Department", to: "#" },
    { label: "Admin Portal",  to: "#" },
    { label: "Privacy Policy",to: "#" },
  ],
};

export default function Footer() {
  return (
    <footer className="border-t border-gray-200 dark:border-gray-800
                       bg-white dark:bg-gray-950 transition-colors duration-300">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">

          {/* Brand column */}
          <div className="col-span-2 md:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4">
  <img
    src="/src/assets/assetra_logo.png"
    alt="Assetra logo"
    className="h-8 w-8 rounded-lg object-cover"
  />
  <span className="font-display font-bold text-lg text-gray-900 dark:text-white">
    Asse<span className="text-orange-500">tra</span>
  </span>
</Link>
            <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed max-w-xs">
              Smart Campus Operations Hub — streamlining facility bookings and
              incident management for modern universities.
            </p>
          </div>

          {/* Link columns */}
          {Object.entries(LINKS).map(([heading, links]) => (
            <div key={heading}>
              <h3 className="text-xs font-semibold uppercase tracking-widest
                             text-gray-400 dark:text-gray-500 mb-4">
                {heading}
              </h3>
              <ul className="space-y-2">
                {links.map(({ label, to }) => (
                  <li key={label}>
                    <Link
                      to={to}
                      className="text-sm text-gray-600 dark:text-gray-400
                                 hover:text-orange-500 dark:hover:text-orange-400
                                 transition-colors duration-150"
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="mt-10 pt-6 border-t border-gray-200 dark:border-gray-800
                        flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-gray-400 dark:text-gray-600">
            © {new Date().getFullYear()} Assetra — IT3030 PAF Assignment · SLIIT
          </p>
          <p className="text-xs text-gray-400 dark:text-gray-600">
            Built with Spring Boot + React
          </p>
        </div>
      </div>
    </footer>
  );
}