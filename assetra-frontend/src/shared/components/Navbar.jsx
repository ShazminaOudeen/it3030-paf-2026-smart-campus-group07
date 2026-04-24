// src/shared/components/Navbar.jsx
import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";

const NAV_LINKS = [
  { label: "Home",         to: "/",             sectionId: "hero"         },
  { label: "Facilities",   to: "/facilities",   sectionId: null           },
  { label: "Incidents",    to: "/incidents",    sectionId: null           },
  { label: "Services",     to: "/#features",    sectionId: "features"     },
  { label: "How it Works", to: "/#how-it-works", sectionId: "how-it-works" },
];

const HOME_SECTIONS = ["hero", "features", "how-it-works", "roles", "cta"];

export default function Navbar() {
  const { theme, toggleTheme } = useTheme();
  const user = null;

  const [menuOpen, setMenuOpen]           = useState(false);
  const [activeSection, setActiveSection] = useState("hero");
  const [scrolled, setScrolled]           = useState(false);
  const location   = useLocation();
  const isHomePage = location.pathname === "/";

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

  return (
    <header
      className={`sticky top-0 z-50 w-full border-b
                  bg-white/80 dark:bg-gray-950/80 backdrop-blur-md
                  transition-all duration-300
                  ${scrolled
                    ? "border-gray-200 dark:border-gray-800 shadow-sm"
                    : "border-transparent"}`}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <img
              src="/src/assets/assetra_logo.png"
              alt="Assetra logo"
              className="h-8 w-8 rounded-lg object-cover
                         group-hover:scale-110 transition-transform duration-200"
            />
            <span className="font-display font-bold text-lg
                             text-gray-900 dark:text-white tracking-tight">
              Asse<span className="text-orange-500">tra</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map((link) => {
              const active = isActive(link);
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={(e) => handleClick(e, link.to)}
                  className={`relative px-4 py-2 rounded-lg text-sm font-medium
                              transition-all duration-200
                    ${active
                      ? "bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400"
                      : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800"
                    }`}
                >
                  {link.label}
                  {active && (
                    <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2
                                     h-0.5 w-4 rounded-full bg-orange-500"/>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-2">

            {/* Dark mode toggle */}
            <button
              onClick={toggleTheme}
              aria-label="Toggle theme"
              className="h-9 w-9 rounded-lg flex items-center justify-center
                         text-gray-500 dark:text-gray-400
                         hover:bg-gray-100 dark:hover:bg-gray-800
                         transition-all duration-200"
            >
              {theme === "dark" ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none"
                     viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <circle cx="12" cy="12" r="5"/>
                  <line x1="12" y1="1"  x2="12" y2="3"/>
                  <line x1="12" y1="21" x2="12" y2="23"/>
                  <line x1="4.22"  y1="4.22"  x2="5.64"  y2="5.64"/>
                  <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
                  <line x1="1"  y1="12" x2="3"  y2="12"/>
                  <line x1="21" y1="12" x2="23" y2="12"/>
                  <line x1="4.22"  y1="19.78" x2="5.64"  y2="18.36"/>
                  <line x1="18.36" y1="5.64"  x2="19.78" y2="4.22"/>
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none"
                     viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
                </svg>
              )}
            </button>

            {/* Notification bell — only when logged in */}
            {user && (
              <Link
                to="/notifications"
                aria-label="Notifications"
                className="relative h-9 w-9 rounded-lg flex items-center justify-center
                           text-gray-500 dark:text-gray-400
                           hover:bg-gray-100 dark:hover:bg-gray-800
                           transition-all duration-200"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none"
                     viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                  <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
                </svg>
                <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full
                                 bg-orange-500 ring-2 ring-white dark:ring-gray-950"/>
              </Link>
            )}

            {/* Auth buttons */}
            {user ? (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg
                              bg-gray-100 dark:bg-gray-800
                              text-gray-700 dark:text-gray-200 text-sm font-medium">
                <span className="h-6 w-6 rounded-full bg-orange-500 flex items-center
                                 justify-center text-white text-xs font-bold">
                  {user.name?.[0] ?? "U"}
                </span>
                {user.name ?? "User"}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                {/* Login button */}
                <Link
                  to="/login"
                  className="flex items-center px-4 py-2 rounded-lg
                             border border-gray-200 dark:border-gray-700
                             bg-white dark:bg-gray-900
                             text-gray-700 dark:text-gray-200
                             text-sm font-semibold
                             hover:border-orange-300 dark:hover:border-orange-700
                             hover:text-orange-600 dark:hover:text-orange-400
                             transition-all duration-200 hover:scale-[1.02]"
                >
                  Login
                </Link>

                {/* Sign in → Register */}
                <Link
                  to="/register"
                  className="flex items-center gap-2 px-4 py-2 rounded-lg
                             bg-orange-500 hover:bg-orange-600
                             text-white text-sm font-semibold
                             shadow-md shadow-orange-500/25
                             transition-all duration-200 hover:scale-[1.02]"
                >
                  Sign in
                </Link>
              </div>
            )}

            {/* Mobile hamburger */}
            <button
              className="md:hidden h-9 w-9 flex items-center justify-center rounded-lg
                         text-gray-600 dark:text-gray-400
                         hover:bg-gray-100 dark:hover:bg-gray-800 transition"
              onClick={() => setMenuOpen((o) => !o)}
              aria-label="Toggle menu"
            >
              {menuOpen ? (
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24"
                     stroke="currentColor" strokeWidth={2}>
                  <path d="M6 18L18 6M6 6l12 12"/>
                </svg>
              ) : (
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24"
                     stroke="currentColor" strokeWidth={2}>
                  <path d="M4 6h16M4 12h16M4 18h16"/>
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile dropdown */}
        {menuOpen && (
          <div className="md:hidden pb-3 pt-1 flex flex-col gap-1 animate-fade-up">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={(e) => { handleClick(e, link.to); setMenuOpen(false); }}
                className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-all
                  ${isActive(link)
                    ? "bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400"
                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                  }`}
              >
                {link.label}
              </Link>
            ))}
            {!user && (
              <div className="mt-1 flex flex-col gap-2">
                <Link
                  to="/login"
                  onClick={() => setMenuOpen(false)}
                  className="px-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700
                             bg-white dark:bg-gray-900
                             text-gray-700 dark:text-gray-200
                             text-sm font-semibold text-center
                             hover:border-orange-300 transition"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMenuOpen(false)}
                  className="px-4 py-2.5 rounded-lg bg-orange-500 text-white
                             text-sm font-semibold text-center hover:bg-orange-600 transition"
                >
                  Sign in
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}