// src/shared/components/Navbar.jsx
import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";

const NAV_LINKS = [
  { label: "Home",         to: "/",              sectionId: "hero"         },
  { label: "Facilities",   to: "/facilities",    sectionId: null           },
  { label: "Incidents",    to: "/incidents",     sectionId: null           },
  { label: "Services",     to: "/#features",     sectionId: "features"     },
  { label: "How it Works", to: "/#how-it-works", sectionId: "how-it-works" },
];

const HOME_SECTIONS = ["hero", "features", "how-it-works", "roles", "cta"];

export default function Navbar() {
  const { theme, toggleTheme } = useTheme();
  const { user, logout }       = useAuth();
  const navigate               = useNavigate();

  const [menuOpen, setMenuOpen]           = useState(false);
  const [activeSection, setActiveSection] = useState("hero");
  const [scrolled, setScrolled]           = useState(false);
  const [userMenuOpen, setUserMenuOpen]   = useState(false);

  const location   = useLocation();
  const isHomePage = location.pathname === "/";

  // Close user menu when clicking outside
  useEffect(() => {
    const handler = (e) => {
      if (!e.target.closest("#user-menu-wrapper")) setUserMenuOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!isHomePage) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveSection(entry.target.id);
        });
      },
      { rootMargin: "-40% 0px -55% 0px" }
    );
    HOME_SECTIONS.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [isHomePage]);

  const isActive = (link) => {
    const { to, sectionId } = link;
    if (to === "/") return isHomePage && activeSection === "hero";
    if (sectionId && isHomePage) return activeSection === sectionId;
    return !to.includes("#") && location.pathname.startsWith(to);
  };

  const handleClick = (e, to) => {
    if (to === "/" && isHomePage) {
      e.preventDefault();
      document.getElementById("hero")?.scrollIntoView({ behavior: "smooth" });
    }
    if (to.startsWith("/#")) {
      e.preventDefault();
      const id = to.slice(2);
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleLogout = () => {
    logout();
    setUserMenuOpen(false);
    navigate("/");
  };

  const getDashboardLink = () => {
    if (!user) return "/login";
    const role = user.role?.toLowerCase();
    if (role === "admin")       return "/admin/dashboard";
    if (role === "technician")  return "/technician/dashboard";
    return "/user/dashboard";
  };

  const getRoleBadgeColor = () => {
    const role = user?.role?.toLowerCase();
    if (role === "admin")       return "bg-purple-500/15 text-purple-400";
    if (role === "technician")  return "bg-blue-500/15 text-blue-400";
    return "bg-orange-500/15 text-orange-400";
  };

  return (
    <header className={`sticky top-0 z-50 w-full border-b
                bg-white/80 dark:bg-gray-950/80 backdrop-blur-md
                transition-all duration-300
                ${scrolled ? "border-gray-200 dark:border-gray-800 shadow-sm" : "border-transparent"}`}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">

          {/* ── Logo ── */}
          <Link to="/" className="flex items-center gap-2 group">
            <img src="/src/assets/assetra_logo.png" alt="Assetra logo"
              className="h-8 w-8 rounded-lg object-cover group-hover:scale-110 transition-transform duration-200"/>
            <span className="font-display font-bold text-lg text-gray-900 dark:text-white tracking-tight">
              Asse<span className="text-orange-500">tra</span>
            </span>
          </Link>

          {/* ── Desktop nav ── */}
          <nav className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map((link) => {
              const active = isActive(link);
              return (
                <Link key={link.to} to={link.to}
                  onClick={(e) => handleClick(e, link.to)}
                  className={`relative px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200
                    ${active
                      ? "bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400"
                      : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800"
                    }`}>
                  {link.label}
                  {active && (
                    <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 h-0.5 w-4 rounded-full bg-orange-500"/>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* ── Right side ── */}
          <div className="flex items-center gap-2">

            {/* Dark mode toggle */}
            <button onClick={toggleTheme} aria-label="Toggle theme"
              className="h-9 w-9 rounded-lg flex items-center justify-center
                         text-gray-500 dark:text-gray-400
                         hover:bg-gray-100 dark:hover:bg-gray-800
                         transition-all duration-200">
              {theme === "dark" ? (
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <circle cx="12" cy="12" r="5"/>
                  <line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
                  <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
                  <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
                  <line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
                  <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
                  <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
                </svg>
              ) : (
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
                </svg>
              )}
            </button>

            {/* Notification bell — only when logged in */}
            {user && (
              <Link to={`/${user.role?.toLowerCase()}/notifications`}
                aria-label="Notifications"
                className="relative h-9 w-9 rounded-lg flex items-center justify-center
                           text-gray-500 dark:text-gray-400
                           hover:bg-gray-100 dark:hover:bg-gray-800
                           transition-all duration-200">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                  <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
                </svg>
                {/* Unread dot */}
                <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-orange-500 ring-2 ring-white dark:ring-gray-950"/>
              </Link>
            )}

            {/* ── User is logged in ── */}
            {user ? (
              <div className="relative" id="user-menu-wrapper">
                <button
                  onClick={() => setUserMenuOpen(o => !o)}
                  className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl
                             bg-gray-100 dark:bg-gray-800
                             hover:bg-gray-200 dark:hover:bg-gray-700
                             border border-gray-200 dark:border-gray-700
                             transition-all duration-200 group">

                  {/* Avatar — Google picture or initial */}
                  {user.pictureUrl ? (
                    <img src={user.pictureUrl} alt={user.name}
                      className="h-6 w-6 rounded-full object-cover ring-2 ring-orange-500/30"/>
                  ) : (
                    <div className="h-6 w-6 rounded-full bg-orange-500 flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-xs font-bold">
                        {user.name?.[0]?.toUpperCase() ?? "U"}
                      </span>
                    </div>
                  )}

                  {/* Name */}
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-200 max-w-[100px] truncate">
                    {user.name}
                  </span>

                  {/* Chevron */}
                  <svg className={`h-3.5 w-3.5 text-gray-400 transition-transform duration-200 ${userMenuOpen ? "rotate-180" : ""}`}
                    fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7"/>
                  </svg>
                </button>

                {/* Dropdown */}
                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 rounded-2xl
                                  bg-white dark:bg-gray-900
                                  border border-gray-200 dark:border-white/10
                                  shadow-xl shadow-black/10 dark:shadow-black/40
                                  overflow-hidden animate-scale-in z-50">

                    {/* User info header */}
                    <div className="px-4 py-3 border-b border-gray-100 dark:border-white/8">
                      <div className="flex items-center gap-3">
                        {user.pictureUrl ? (
                          <img src={user.pictureUrl} alt={user.name}
                            className="h-9 w-9 rounded-full object-cover"/>
                        ) : (
                          <div className="h-9 w-9 rounded-full bg-orange-500 flex items-center justify-center flex-shrink-0">
                            <span className="text-white text-sm font-bold">
                              {user.name?.[0]?.toUpperCase() ?? "U"}
                            </span>
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                            {user.name}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                            {user.email}
                          </p>
                        </div>
                      </div>
                      {/* Role badge */}
                      <span className={`mt-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${getRoleBadgeColor()}`}>
                        {user.role}
                      </span>
                    </div>

                    {/* Menu items */}
                    <div className="p-1.5">
                      <Link to={getDashboardLink()}
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm
                                   text-gray-700 dark:text-gray-300
                                   hover:bg-orange-50 dark:hover:bg-orange-500/10
                                   hover:text-orange-600 dark:hover:text-orange-400
                                   transition-all duration-150">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
                          <rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/>
                        </svg>
                        Dashboard
                      </Link>

                      <Link to={`/${user.role?.toLowerCase()}/account/profile`}
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm
                                   text-gray-700 dark:text-gray-300
                                   hover:bg-gray-100 dark:hover:bg-gray-800
                                   transition-all duration-150">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                        </svg>
                        My Profile
                      </Link>

                      <Link to={`/${user.role?.toLowerCase()}/notifications`}
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm
                                   text-gray-700 dark:text-gray-300
                                   hover:bg-gray-100 dark:hover:bg-gray-800
                                   transition-all duration-150">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                          <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
                        </svg>
                        Notifications
                      </Link>

                      <div className="h-px bg-gray-100 dark:bg-white/8 my-1"/>

                      <button onClick={handleLogout}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm
                                   text-red-500 dark:text-red-400
                                   hover:bg-red-50 dark:hover:bg-red-500/10
                                   transition-all duration-150">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
                        </svg>
                        Sign out
                      </button>
                    </div>
                  </div>
                )}
              </div>

            ) : (
              /* ── Not logged in ── */
              <div className="flex items-center gap-2">
                <Link to="/login"
                  className="flex items-center px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700
                             bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-200
                             text-sm font-semibold
                             hover:border-orange-300 dark:hover:border-orange-700
                             hover:text-orange-600 dark:hover:text-orange-400
                             transition-all duration-200 hover:scale-[1.02]">
                  Login
                </Link>
                <Link to="/register"
                  className="flex items-center gap-2 px-4 py-2 rounded-lg
                             bg-orange-500 hover:bg-orange-600 text-white
                             text-sm font-semibold shadow-md shadow-orange-500/25
                             transition-all duration-200 hover:scale-[1.02]">
                  Sign up
                </Link>
              </div>
            )}

            {/* Mobile hamburger */}
            <button
              className="md:hidden h-9 w-9 flex items-center justify-center rounded-lg
                         text-gray-600 dark:text-gray-400
                         hover:bg-gray-100 dark:hover:bg-gray-800 transition"
              onClick={() => setMenuOpen(o => !o)}
              aria-label="Toggle menu">
              {menuOpen
                ? <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path d="M6 18L18 6M6 6l12 12"/></svg>
                : <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path d="M4 6h16M4 12h16M4 18h16"/></svg>
              }
            </button>
          </div>
        </div>

        {/* ── Mobile dropdown ── */}
        {menuOpen && (
          <div className="md:hidden pb-3 pt-1 flex flex-col gap-1 animate-fade-up">
            {NAV_LINKS.map((link) => (
              <Link key={link.to} to={link.to}
                onClick={(e) => { handleClick(e, link.to); setMenuOpen(false); }}
                className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-all
                  ${isActive(link)
                    ? "bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400"
                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                  }`}>
                {link.label}
              </Link>
            ))}

            {/* Mobile user section */}
            {user ? (
              <div className="mt-2 pt-2 border-t border-gray-100 dark:border-white/8 flex flex-col gap-1">
                {/* User info */}
                <div className="flex items-center gap-3 px-4 py-2">
                  {user.pictureUrl ? (
                    <img src={user.pictureUrl} alt={user.name} className="h-8 w-8 rounded-full object-cover"/>
                  ) : (
                    <div className="h-8 w-8 rounded-full bg-orange-500 flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-xs font-bold">{user.name?.[0]?.toUpperCase()}</span>
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">{user.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{user.role}</p>
                  </div>
                </div>
                <Link to={getDashboardLink()} onClick={() => setMenuOpen(false)}
                  className="px-4 py-2.5 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800">
                  Dashboard
                </Link>
                <button onClick={() => { handleLogout(); setMenuOpen(false); }}
                  className="px-4 py-2.5 rounded-lg border border-red-200 dark:border-red-800
                             text-red-500 text-sm font-semibold text-left
                             hover:bg-red-50 dark:hover:bg-red-900/20 transition">
                  Sign out
                </button>
              </div>
            ) : (
              <div className="mt-1 flex flex-col gap-2">
                <Link to="/login" onClick={() => setMenuOpen(false)}
                  className="px-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700
                             bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-200
                             text-sm font-semibold text-center hover:border-orange-300 transition">
                  Login
                </Link>
                <Link to="/register" onClick={() => setMenuOpen(false)}
                  className="px-4 py-2.5 rounded-lg bg-orange-500 text-white
                             text-sm font-semibold text-center hover:bg-orange-600 transition">
                  Sign up
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}