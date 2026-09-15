// src/pages/HomePage.jsx
// Animated homepage for Assetra — Smart Campus Operations Hub
//
// Layout: full-bleed hero (grayscale campus photo spans the entire hero,
// edge-to-edge on desktop; text sits on top with a left-edge gradient so
// it stays legible), a small icon strip below the hero, then a new
// "Overview" section (grayscale campus-photo grid + checklist + stat,
// matching Assetra's real feature set), then the existing
// Features / How-it-works / Roles / CTA sections. The hero and its photo
// overlay are theme-aware: gradients and background swap between a
// light and a dark variant depending on the app's light/dark mode.

import { Link } from "react-router-dom";
import { useEffect, useRef, useState } from "react";

// ─── tiny icon components ────────────────────────────────────────────────────

function IconBuilding({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
      <polyline points="9 22 9 12 15 12 15 22"/>
    </svg>
  );
}
function IconCalendar({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2"/>
      <line x1="16" y1="2" x2="16" y2="6"/>
      <line x1="8"  y1="2" x2="8"  y2="6"/>
      <line x1="3"  y1="10" x2="21" y2="10"/>
    </svg>
  );
}
function IconTicket({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/>
      <rect x="9" y="3" width="6" height="4" rx="2"/>
      <path d="M9 12h6M9 16h4"/>
    </svg>
  );
}
function IconBell({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
      <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
    </svg>
  );
}
function IconShield({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    </svg>
  );
}
function IconZap({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
    </svg>
  );
}
function IconCheck({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 13l4 4L19 7"/>
    </svg>
  );
}
function IconArrow({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round">
      <path d="M5 12h14M12 5l7 7-7 7"/>
    </svg>
  );
}
function IconUsers({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
      <circle cx="9" cy="7" r="4"/>
      <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
      <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
  );
}
function IconClock({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <polyline points="12 6 12 12 16 14"/>
    </svg>
  );
}

// ─── data ────────────────────────────────────────────────────────────────────

const FEATURES = [
  { icon: IconBuilding, title: "Facilities Catalogue",  desc: "Browse lecture halls, labs, and meeting rooms with real-time availability." },
  { icon: IconCalendar, title: "Smart Booking",          desc: "Request, approve, and manage bookings with automatic conflict detection."   },
  { icon: IconTicket,   title: "Incident Ticketing",     desc: "Report faults, attach evidence, track resolution from OPEN to CLOSED."      },
  { icon: IconBell,     title: "Live Notifications",     desc: "Instant alerts for booking decisions, ticket updates, and new comments."     },
  { icon: IconShield,   title: "Role-Based Access",      desc: "Secure endpoints with OAuth 2.0 and granular RBAC for all three roles."      },
  { icon: IconZap,      title: "Built for Speed",        desc: "Spring Boot REST API with layered architecture and a blazing-fast React frontend." },
];

const STATS = [
  { value: "4",   suffix: "",  label: "Core Modules"          },
  { value: "20",  suffix: "+", label: "REST Endpoints"         },
  { value: "100", suffix: "%", label: "Conflict-Free Bookings" },
  { value: "3",   suffix: "",  label: "User Roles"             },
];

// Icon strip shown directly under the hero — mirrors the reference layout's
// three-icon row ("Top Ranked", "100% Placement", "World Class") but says
// something true about Assetra instead.
const HERO_HIGHLIGHTS = [
  { icon: IconClock,    label: "Book in seconds"     },
  { icon: IconUsers,    label: "Built for 3 roles"   },
  { icon: IconShield,   label: "Fully audited"        },
];

// Checklist copy for the new Overview section — each line maps to a real,
// shipped Assetra capability (booking engine, RBAC, incident workflow),
// nothing invented.
const OVERVIEW_POINTS = [
  "Automatic conflict detection on every booking request",
  "Role-based access for Users, Admins, and Technicians",
  "Incident tickets tracked from OPEN through CLOSED",
];

const WORKFLOW = [
  { step: "01", title: "Browse",  desc: "Find available facilities and assets in the catalogue."      },
  { step: "02", title: "Request", desc: "Submit a booking with date, time range, and purpose."        },
  { step: "03", title: "Approve", desc: "Admin reviews and approves or rejects with a reason."        },
  { step: "04", title: "Done",    desc: "Attend your session or raise an incident if needed."         },
];

const ROLES = [
  {
    role: "User",
    desc: "Browse facilities, request bookings, report incidents, and track their status in real time.",
    perms: ["Book resources", "Raise tickets", "View notifications", "Add comments"],
    featured: false,
  },
  {
    role: "Admin",
    desc: "Full control — approve bookings, manage the facility catalogue, and oversee all tickets.",
    perms: ["Manage catalogue", "Approve bookings", "Reject with reason", "View all activity"],
    featured: true,
  },
  {
    role: "Technician",
    desc: "Assigned to incident tickets — update status, add resolution notes, and close tickets.",
    perms: ["Update ticket status", "Add resolution notes", "Upload evidence", "Comment on tickets"],
    featured: false,
  },
];

// ─── Grayscale campus photo slideshow ─────────────────────────────────────────
// Real campus/lecture-hall photography (Unsplash License — free for
// commercial use, no attribution required), fully desaturated via CSS
// grayscale(), crossfaded on a timer with a slow Ken Burns drift on each
// slide. The panel is now full-bleed across the entire hero (edge to edge
// on desktop, a full-width band on mobile) instead of a small rounded card.

const SLIDES = [
  {
    // Rows of empty seats in a dark auditorium — Denise Schuld, Unsplash License
    src: "https://images.unsplash.com/photo-1641735123823-90856d1efd39?auto=format&fit=crop&w=2400&q=80",
    kenburns: "kb-zoom-in",
  },
  {
    // Inside a university library, empty tables — Thomas Hoang, Unsplash License
    src: "https://images.unsplash.com/photo-1753328603655-a42ba8f025f3?auto=format&fit=crop&w=2400&q=80",
    kenburns: "kb-pan-right",
  },
  {
    // Empty lecture room, wide shot — Changbok Ko, Unsplash License
    src: "https://images.unsplash.com/photo-1541829070764-84a7d30dd3f3?auto=format&fit=crop&w=2400&q=80",
    kenburns: "kb-zoom-out",
  },
  {
    // People seated in a university lecture room — Dom Fou, Unsplash License
    src: "https://images.unsplash.com/photo-1606761568499-6d2451b23c66?auto=format&fit=crop&w=2400&q=80",
    kenburns: "kb-pan-right",
  },
];

const SLIDE_DURATION = 5000;

// Static grayscale photo grid for the Overview section — reuses the same
// vetted, licensed auditorium / lecture-hall photography as the hero
// slideshow (minus the library shot, which reads more "study space" than
// "lecture hall or theatre"), just laid out as three fixed images plus a
// stat card instead of a crossfading slideshow.
const OVERVIEW_PHOTOS = [
  {
    // Rows of empty seats in a dark auditorium — Denise Schuld, Unsplash License
    src: "https://images.unsplash.com/photo-1641735123823-90856d1efd39?auto=format&fit=crop&w=1400&q=80",
    alt: "Empty rows of seating in a campus auditorium",
  },
  {
    // People seated in a university lecture room — Dom Fou, Unsplash License
    src: "https://images.unsplash.com/photo-1606761568499-6d2451b23c66?auto=format&fit=crop&w=1400&q=80",
    alt: "Students seated in a university lecture room",
  },
  {
    // Empty lecture room, wide shot — Changbok Ko, Unsplash License
    src: "https://images.unsplash.com/photo-1541829070764-84a7d30dd3f3?auto=format&fit=crop&w=1400&q=80",
    alt: "Wide view of an empty lecture theatre",
  },
];

// Full-bleed hero photo panel. On mobile it's a full-width band at the top
// of the hero (edge to edge since the hero itself carries no horizontal
// padding). From `lg` up it becomes absolutely positioned, filling the
// entire right side of the hero from its very top to its very bottom.
// Every overlay gradient is defined with a light-mode color and a
// dark-mode color (`dark:` variant) so the blend always matches whichever
// theme is active, instead of being hardcoded to one background.
function CampusPhotoPanel() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setActive((i) => (i + 1) % SLIDES.length);
    }, SLIDE_DURATION);
    return () => clearInterval(id);
  }, []);

  return (
    <div
      className="relative w-full h-[300px] xs:h-[360px] sm:h-[440px]
                 lg:h-auto lg:absolute lg:inset-y-0 lg:right-0 lg:w-[56%]
                 overflow-hidden select-none bg-gray-50 dark:bg-[#0a0a0f]
                 transition-colors duration-300"
    >
      {/* Slides — masked on the left edge (desktop only) so each photo fades
         to fully transparent and reveals the panel's own background behind
         it. This guarantees a seamless match regardless of how bright or
         dark any given photo is, unlike a solid overlay colour which can
         still show a faint step against certain images. */}
      {SLIDES.map((slide, i) => (
        <img
          key={slide.src}
          src={slide.src}
          alt=""
          aria-hidden="true"
          className={`kb-slide hero-photo-mask ${slide.kenburns} absolute inset-0 w-full h-full object-cover
                     transition-opacity duration-[1400ms] ease-in-out
                     ${i === active ? "opacity-100" : "opacity-0"}`}
          style={{
            filter: "grayscale(1) contrast(1.05) brightness(1.02)",
            animationPlayState: i === active ? "running" : "paused",
          }}
          loading={i === 0 ? "eager" : "lazy"}
        />
      ))}

      {/* Very light darkening wash — dark mode only, keeps the photo crisp in
         light mode. Masked the same as the photo itself so this doesn't
         create its own hard edge at the panel boundary. */}
      <div className="absolute inset-0 pointer-events-none dark:bg-black/25 hero-photo-mask" />

      {/* Top edge — soft vignette so the photo doesn't start with a hard line */}
      <div
        className="absolute inset-x-0 top-0 h-1/6 pointer-events-none
                   bg-gradient-to-b from-gray-50/80 to-transparent
                   dark:from-[#0a0a0f]/80 dark:to-transparent
                   transition-colors duration-300"
      />
      {/* Bottom edge — blends the photo into the hero background below it
         (and, on mobile, into the copy that follows) */}
      <div
        className="absolute inset-x-0 bottom-0 h-1/4 pointer-events-none
                   bg-gradient-to-t from-gray-50 via-gray-50/25 to-transparent
                   dark:from-[#0a0a0f] dark:via-[#0a0a0f]/25 dark:to-transparent
                   transition-colors duration-300"
      />

      {/* Orange brand glow — radial, anchored at the bottom-right corner, so
         it fades outward in every direction with no straight edge anywhere */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(140% 110% at 100% 100%, rgba(249,115,22,0.24) 0%, rgba(249,115,22,0.12) 40%, rgba(249,115,22,0.04) 65%, transparent 82%)",
        }}
      />

      {/* Slide indicators */}
      <div className="absolute top-4 left-4 flex gap-1.5">
        {SLIDES.map((_, i) => (
          <span
            key={i}
            className={`h-1 rounded-full transition-all duration-500 ${
              i === active ? "w-6 bg-orange-400" : "w-3 bg-white/40"
            }`}
          />
        ))}
      </div>
    </div>
  );
}

// ─── Scroll Reveal Hook ───────────────────────────────────────────────────────

function useScrollReveal(selector, options = {}) {
  useEffect(() => {
    const elements = document.querySelectorAll(selector);
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("sr-visible");
          }
        });
      },
      { threshold: 0.12, ...options }
    );
    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [selector]);
}

// ─── component ───────────────────────────────────────────────────────────────

export default function HomePage() {
  const [heroLoaded, setHeroLoaded] = useState(false);

  useScrollReveal(".sr-feat");
  useScrollReveal(".sr-workflow");
  useScrollReveal(".sr-role");
  useScrollReveal(".sr-cta");
  useScrollReveal(".sr-overview");

  // Single orchestrated hero entrance, fired once on mount.
  useEffect(() => {
    const t = requestAnimationFrame(() => setHeroLoaded(true));
    return () => cancelAnimationFrame(t);
  }, []);

  // Mouse-tracking glow on feature cards
  useEffect(() => {
    const cards = document.querySelectorAll(".feat-card-glow");
    const handleMove = (e) => {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width * 100).toFixed(1);
      const y = ((e.clientY - rect.top)  / rect.height * 100).toFixed(1);
      e.currentTarget.style.setProperty("--mx", `${x}%`);
      e.currentTarget.style.setProperty("--my", `${y}%`);
    };
    cards.forEach((c) => c.addEventListener("mousemove", handleMove));
    return () => cards.forEach((c) => c.removeEventListener("mousemove", handleMove));
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors duration-300 overflow-x-hidden">

      {/* ── STYLES (injected once) ──────────────────────────────────── */}
      <style>{`
        @media (prefers-reduced-motion: reduce) {
          .hero-in, .sr-feat, .sr-workflow, .sr-role, .sr-cta, .sr-overview { transition: none !important; }
          .kb-slide { animation: none !important; }
        }

        /* ── hero photo: mask the left edge on desktop so it fades to the
           panel's own background with a guaranteed-seamless match ── */
        .hero-photo-mask { -webkit-mask-image: none; mask-image: none; }
        @media (min-width: 1024px) {
          .hero-photo-mask {
            -webkit-mask-image: linear-gradient(to right,
              transparent 0%, transparent 3%,
              rgba(0,0,0,0.15) 15%, rgba(0,0,0,0.4) 30%,
              rgba(0,0,0,0.7) 45%, rgba(0,0,0,0.92) 60%, black 72%);
            mask-image: linear-gradient(to right,
              transparent 0%, transparent 3%,
              rgba(0,0,0,0.15) 15%, rgba(0,0,0,0.4) 30%,
              rgba(0,0,0,0.7) 45%, rgba(0,0,0,0.92) 60%, black 72%);
          }
        }

        /* ── hero photo slideshow: slow Ken Burns drift per slide ── */
        .kb-slide { animation-duration: 8s; animation-timing-function: ease-out; animation-fill-mode: forwards; }
        @keyframes kbZoomIn  { from { transform: scale(1);    } to { transform: scale(1.04); } }
        @keyframes kbZoomOut { from { transform: scale(1.04); } to { transform: scale(1);    } }
        @keyframes kbPanRight{ from { transform: scale(1.02) translateX(-1%); } to { transform: scale(1.02) translateX(1%); } }
        .kb-zoom-in   { animation-name: kbZoomIn;   }
        .kb-zoom-out  { animation-name: kbZoomOut;  }
        .kb-pan-right { animation-name: kbPanRight; }

        /* ── hero entrance (single orchestrated sequence) ── */
        .hero-in {
          opacity: 0;
          transform: translateY(18px);
          transition: opacity 0.7s ease, transform 0.7s cubic-bezier(0.22,1,0.36,1);
        }
        .hero-in.hero-in-visible { opacity: 1; transform: translateY(0); }
        .hero-in[data-d="0"] { transition-delay: 0.05s; }
        .hero-in[data-d="1"] { transition-delay: 0.15s; }
        .hero-in[data-d="2"] { transition-delay: 0.25s; }
        .hero-in[data-d="3"] { transition-delay: 0.35s; }
        .hero-in[data-d="4"] { transition-delay: 0.45s; }
        .hero-in[data-d="5"] { transition-delay: 0.10s; }

        /* ── overview section (single reveal, not staggered per item —
           the hero already carries the page's "moment") ── */
        .sr-overview {
          opacity: 0;
          transform: translateY(24px);
          transition: opacity 0.6s ease, transform 0.6s cubic-bezier(0.22,1,0.36,1);
        }
        .sr-overview.sr-visible { opacity: 1; transform: translateY(0); }

        /* ── feature cards ── */
        .sr-feat {
          opacity: 0;
          transform: translateY(32px);
          transition: opacity 0.55s ease, transform 0.55s cubic-bezier(0.34,1.56,0.64,1);
        }
        .sr-feat.sr-visible { opacity: 1; transform: translateY(0); }
        .sr-feat:nth-child(1) { transition-delay: 0.00s; }
        .sr-feat:nth-child(2) { transition-delay: 0.08s; }
        .sr-feat:nth-child(3) { transition-delay: 0.16s; }
        .sr-feat:nth-child(4) { transition-delay: 0.24s; }
        .sr-feat:nth-child(5) { transition-delay: 0.32s; }
        .sr-feat:nth-child(6) { transition-delay: 0.40s; }

        .feat-card-glow { position: relative; overflow: hidden; }
        .feat-card-glow::before {
          content: '';
          position: absolute; inset: 0; border-radius: inherit;
          background: radial-gradient(circle at var(--mx, 50%) var(--my, 50%), rgba(249,115,22,0.07) 0%, transparent 65%);
          opacity: 0; transition: opacity 0.3s; pointer-events: none;
        }
        .feat-card-glow:hover::before { opacity: 1; }
        .feat-card-glow::after {
          content: '';
          position: absolute; top: 0; left: -100%; width: 60%; height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.04), transparent);
          transition: left 0.6s ease; pointer-events: none;
        }
        .feat-card-glow:hover::after { left: 150%; }
        .feat-card-glow:hover .feat-icon-inner {
          background: rgba(249,115,22,0.22) !important;
          transform: scale(1.12) rotate(-4deg);
        }
        .feat-icon-inner { transition: background 0.3s, transform 0.3s; }

        /* ── workflow cards ── */
        .sr-workflow {
          opacity: 0;
          transform: scale(0.88);
          transition: opacity 0.5s ease, transform 0.5s cubic-bezier(0.34,1.56,0.64,1);
        }
        .sr-workflow.sr-visible { opacity: 1; transform: scale(1); }
        .sr-workflow:nth-child(1) { transition-delay: 0.00s; }
        .sr-workflow:nth-child(2) { transition-delay: 0.12s; }
        .sr-workflow:nth-child(3) { transition-delay: 0.24s; }
        .sr-workflow:nth-child(4) { transition-delay: 0.36s; }
        .sr-workflow:hover .step-num-inner {
          background: rgba(249,115,22,0.20) !important;
          border-color: rgba(249,115,22,0.65) !important;
          transform: scale(1.12);
        }
        .step-num-inner { transition: background 0.3s, border-color 0.3s, transform 0.3s; }

        /* ── role cards ── */
        .sr-role {
          opacity: 0;
          transition: opacity 0.55s ease, transform 0.55s ease;
        }
        .sr-role:nth-child(1) { transform: translateX(-28px); transition-delay: 0.00s; }
        .sr-role:nth-child(2) { transform: translateY(28px);  transition-delay: 0.15s; }
        .sr-role:nth-child(3) { transform: translateX(28px);  transition-delay: 0.30s; }
        .sr-role.sr-visible   { opacity: 1; transform: none !important; }

        /* ── CTA banner ── */
        .sr-cta {
          opacity: 0;
          transform: scale(0.95);
          transition: opacity 0.6s ease, transform 0.6s cubic-bezier(0.34,1.56,0.64,1);
        }
        .sr-cta.sr-visible { opacity: 1; transform: scale(1); }
        @keyframes floatOrb {
          0%,100% { transform: scale(1);    }
          50%      { transform: scale(1.15); }
        }
        .cta-orb   { animation: floatOrb 6s ease-in-out infinite; }
        .cta-orb-2 { animation: floatOrb 6s ease-in-out infinite; animation-delay: -3s; }
      `}</style>

      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      {/* No horizontal padding on the section itself — the photo panel needs
         to touch the true edges of the viewport. Padding lives on the inner
         wrapper instead, around the text/grid/stats content only. */}
      <section
        id="hero"
        className="relative isolate overflow-hidden bg-gray-50 dark:bg-[#0a0a0f] transition-colors duration-300 pt-16 pb-16 sm:pt-20 sm:pb-20"
      >
        {/* faint grid backdrop, kept subtle so it doesn't compete with the photo panel */}
        <div
          className="absolute inset-0 pointer-events-none opacity-60"
          style={{
            backgroundImage:
              "linear-gradient(rgba(99,102,241,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.035) 1px, transparent 1px)",
            backgroundSize: "56px 56px",
            maskImage: "radial-gradient(ellipse at 30% 30%, black 20%, transparent 75%)",
          }}
        />

        {/* Full-bleed photo — mobile: full-width band at the top of the
           hero. Desktop: absolutely filled against the right edge, top to
           bottom of the section. */}
        <CampusPhotoPanel />

        <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-[1.05fr_0.95fr] gap-10 lg:gap-14 items-center">

            {/* ── copy ── */}
            <div className="flex flex-col items-start text-left">

              <div
                data-d="0"
                className={`hero-in ${heroLoaded ? "hero-in-visible" : ""}
                           mb-5 inline-flex items-center gap-2 rounded-full
                           border border-orange-500/35 bg-orange-500/10
                           px-4 py-1.5 text-xs font-semibold uppercase tracking-widest
                           text-orange-600 dark:text-orange-400`}
              >
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping
                                   rounded-full bg-orange-400 opacity-75"/>
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-orange-500"/>
                </span>
                Smart Campus Operations Hub
              </div>

              <h1
                data-d="1"
                className={`hero-in ${heroLoaded ? "hero-in-visible" : ""}
                           text-4xl sm:text-5xl lg:text-[52px] font-bold leading-[1.1]
                           tracking-tight text-gray-900 dark:text-white mb-5`}
              >
                Manage every{" "}
                <span className="relative text-orange-500">
                  campus resource
                  <svg className="absolute -bottom-1 left-0 w-full" viewBox="0 0 300 8"
                       fill="none" preserveAspectRatio="none">
                    <path d="M2 6 C60 2, 160 2, 298 5" stroke="#f97316"
                          strokeWidth="2.5" strokeLinecap="round" opacity="0.55"/>
                  </svg>
                </span>{" "}
                in one place
              </h1>

              <p
                data-d="2"
                className={`hero-in ${heroLoaded ? "hero-in-visible" : ""}
                           text-base sm:text-lg text-gray-600 dark:text-gray-400 leading-relaxed max-w-lg mb-8`}
              >
                Assetra unifies facility bookings, asset management, and incident
                ticketing into one modern platform with full auditability and role-based access.
              </p>

              <div
                data-d="3"
                className={`hero-in ${heroLoaded ? "hero-in-visible" : ""} flex flex-wrap gap-3`}
              >
                <Link
                  to="/facilities"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl
                             bg-orange-500 hover:bg-orange-600
                             text-white text-sm font-semibold
                             shadow-lg shadow-orange-500/30 hover:shadow-orange-500/50
                             hover:scale-[1.03] transition-all duration-200"
                >
                  Explore Facilities <IconArrow className="h-4 w-4"/>
                </Link>
                <Link
                  to="/login"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl
                             border border-gray-200 dark:border-white/10
                             bg-white dark:bg-white/5
                             text-gray-700 dark:text-gray-200 text-sm font-semibold
                             hover:bg-gray-50 dark:hover:bg-white/10 hover:scale-[1.03]
                             transition-all duration-200"
                >
                  Sign in with Google
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.83z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.83c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
                  </svg>
                </Link>
              </div>

              {/* Highlight strip — the reference's 3-icon row, themed to Assetra */}
              <div
                data-d="4"
                className={`hero-in ${heroLoaded ? "hero-in-visible" : ""}
                           mt-10 sm:mt-12 w-full grid grid-cols-1 xs:grid-cols-3 sm:grid-cols-3 gap-3 sm:gap-4`}
              >
                {HERO_HIGHLIGHTS.map(({ icon: Icon, label }) => (
                  <div key={label} className="flex items-center gap-2.5">
                    <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-orange-500/10">
                      <Icon className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                    </span>
                    <span className="text-sm text-gray-700 dark:text-gray-300">{label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* ── spacer column ──
               The photo itself is absolutely positioned against the section
               (see CampusPhotoPanel above), so this column just reserves the
               grid width on desktop; it renders nothing on mobile. */}
            <div className="hidden lg:block" aria-hidden="true" />
          </div>

          {/* Stats bar, full width beneath both columns */}
          <div className="mt-12 sm:mt-16">
            <div
              className="w-full grid grid-cols-2 sm:grid-cols-4 gap-px
                         rounded-2xl overflow-hidden border-2 border-gray-300 dark:border-white/15
                         bg-gray-300 dark:bg-white/15 transition-colors duration-300"
            >
              {STATS.map(({ value, suffix, label }) => (
                <div key={label}
                     className="flex flex-col items-center justify-center py-4 px-2
                                bg-white dark:bg-[#0c0c16] transition-colors duration-300">
                  <span className="font-bold text-2xl text-gray-900 dark:text-white">
                    {value}<span className="text-orange-500">{suffix}</span>
                  </span>
                  <span className="mt-1 text-[10px] text-gray-500 dark:text-gray-500 text-center uppercase tracking-wide">
                    {label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── OVERVIEW ─────────────────────────────────────────────────────── */}
      {/* Copy on the left, a small grid of three grayscale lecture-hall /
         auditorium photos plus a stat card on the right — the same photo
         treatment as the hero, just laid out as a static grid instead of a
         slideshow. Keeps the checklist limited to capabilities Assetra
         actually ships (booking conflicts, RBAC, ticket lifecycle). */}
      <section id="overview" className="py-16 sm:py-20 lg:py-24 bg-white dark:bg-gray-900 transition-colors">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="sr-overview grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">

            {/* ── copy ── */}
            <div>
              <span className="text-xs font-semibold uppercase tracking-widest text-orange-500">
                Why Assetra
              </span>
              <h2 className="mt-2 font-bold text-3xl sm:text-4xl text-gray-900 dark:text-white tracking-tight leading-tight">
                One login, every campus resource under control
              </h2>
              <p className="mt-4 text-gray-600 dark:text-gray-400 leading-relaxed max-w-lg">
                Assetra replaces scattered spreadsheets and email threads with a
                single Spring Boot and React platform that connects students,
                technicians, and administrators — from the moment a lecture
                hall is booked to the moment a fault ticket is closed.
              </p>

              <ul className="mt-6 space-y-3">
                {OVERVIEW_POINTS.map((point) => (
                  <li key={point} className="flex items-start gap-3">
                    <span className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-orange-500/10">
                      <IconCheck className="h-3 w-3 text-orange-500" />
                    </span>
                    <span className="text-sm text-gray-700 dark:text-gray-300">{point}</span>
                  </li>
                ))}
              </ul>

              <Link
                to="/facilities"
                className="mt-8 inline-flex items-center gap-2 px-6 py-3 rounded-xl
                           bg-orange-500 hover:bg-orange-600
                           text-white text-sm font-semibold
                           shadow-lg shadow-orange-500/30 hover:shadow-orange-500/50
                           hover:scale-[1.03] transition-all duration-200"
              >
                Discover Facilities <IconArrow className="h-4 w-4"/>
              </Link>
            </div>

            {/* ── photo grid: 3 grayscale campus photos + 1 stat card ── */}
            <div className="grid grid-cols-[1.3fr_1fr] grid-rows-2 gap-3 sm:gap-4 h-[380px] sm:h-[440px]">
              {OVERVIEW_PHOTOS.map(({ src, alt }) => (
                <div
                  key={src}
                  className="rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-800"
                >
                  <img
                    src={src}
                    alt={alt}
                    loading="lazy"
                    className="h-full w-full object-cover"
                    style={{ filter: "grayscale(1) contrast(1.05) brightness(1.02)" }}
                  />
                </div>
              ))}
              <div
                className="rounded-2xl border border-orange-500/20 bg-orange-500/10
                           flex flex-col items-center justify-center text-center p-3"
              >
                <span className="font-bold text-3xl text-orange-500">3</span>
                <span className="mt-1 text-[11px] uppercase tracking-wide text-gray-600 dark:text-gray-400">
                  Roles Supported
                </span>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── FEATURES ─────────────────────────────────────────────────────── */}
      <section id="features" className="py-16 sm:py-20 lg:py-28 bg-white dark:bg-gray-900 transition-colors">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 text-center">
            <span className="text-xs font-semibold uppercase tracking-widest text-orange-500">
              What we offer
            </span>
            <h2 className="mt-2 font-bold text-3xl sm:text-4xl text-gray-900 dark:text-white tracking-tight">
              Everything your campus needs
            </h2>
            <p className="mt-2 text-gray-500 dark:text-gray-400 max-w-md mx-auto">
              Four integrated modules, one seamless platform.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {FEATURES.map(({ icon: Icon, title, desc }) => (
              <div
                key={title}
                className="feat-card-glow sr-feat group rounded-2xl p-5
                           border border-gray-200 dark:border-gray-800
                           bg-white dark:bg-gray-900
                           hover:border-orange-400/50 hover:-translate-y-1
                           hover:shadow-lg hover:shadow-orange-500/5
                           transition-all duration-300"
              >
                <div className="feat-icon-inner inline-flex h-10 w-10 items-center justify-center
                                rounded-xl bg-orange-500/10 mb-4">
                  <Icon className="h-5 w-5 text-orange-500"/>
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1.5">
                  {title}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                  {desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ─────────────────────────────────────────────────── */}
      <section id="how-it-works" className="py-16 sm:py-20 lg:py-28 bg-gray-50 dark:bg-gray-950 transition-colors">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="text-xs font-semibold uppercase tracking-widest text-orange-500">
              Workflow
            </span>
            <h2 className="mt-2 font-bold text-3xl sm:text-4xl text-gray-900 dark:text-white tracking-tight">
              How it works
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {WORKFLOW.map(({ step, title, desc }) => (
              <div
                key={step}
                className="sr-workflow flex flex-col items-center text-center p-4
                           rounded-2xl border border-gray-200 dark:border-gray-800
                           hover:border-orange-400/40 hover:bg-orange-500/[0.03]
                           transition-colors duration-300"
              >
                <div className="step-num-inner flex h-14 w-14 items-center justify-center
                                rounded-2xl border-2 border-orange-500/30 bg-orange-500/8
                                mb-4">
                  <span className="font-bold text-lg text-orange-500">{step}</span>
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{title}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── ROLES ────────────────────────────────────────────────────────── */}
      <section id="roles" className="py-16 sm:py-20 lg:py-28 bg-white dark:bg-gray-900 transition-colors">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="text-xs font-semibold uppercase tracking-widest text-orange-500">
              Access Control
            </span>
            <h2 className="mt-2 font-bold text-3xl sm:text-4xl text-gray-900 dark:text-white tracking-tight">
              Built for every role
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
            {ROLES.map(({ role, desc, perms, featured }) => (
              <div
                key={role}
                className={`sr-role rounded-2xl p-6
                  ${featured
                    ? "bg-orange-500 shadow-2xl shadow-orange-500/30 md:scale-[1.02]"
                    : "bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 hover:-translate-y-1 transition-transform duration-300"
                  }`}
              >
                <h3 className={`font-bold text-xl mb-2
                  ${featured ? "text-white" : "text-gray-900 dark:text-white"}`}>
                  {role}
                </h3>
                <p className={`text-sm leading-relaxed mb-5
                  ${featured ? "text-orange-100" : "text-gray-500 dark:text-gray-400"}`}>
                  {desc}
                </p>
                <ul className="space-y-2">
                  {perms.map((p) => (
                    <li key={p} className="flex items-center gap-2 text-sm">
                      <IconCheck className={`h-4 w-4 flex-shrink-0
                        ${featured ? "text-orange-200" : "text-orange-500"}`}/>
                      <span className={featured ? "text-orange-50" : "text-gray-600 dark:text-gray-300"}>
                        {p}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA BANNER ───────────────────────────────────────────────────── */}
      <section id="cta" className="py-14 sm:py-16 lg:py-20 bg-gray-50 dark:bg-gray-950 transition-colors">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="sr-cta relative overflow-hidden rounded-3xl
                          bg-orange-500 px-6 sm:px-8 py-14 sm:py-16 text-center
                          shadow-2xl shadow-orange-500/30">
            <div className="cta-orb   absolute -top-20  -right-20 w-64 h-64 rounded-full bg-white/10 pointer-events-none"/>
            <div className="cta-orb-2 absolute -bottom-20 -left-20 w-64 h-64 rounded-full bg-white/10 pointer-events-none"/>

            <h2 className="relative font-bold text-3xl sm:text-4xl text-white mb-3 tracking-tight">
              Ready to modernise your campus?
            </h2>
            <p className="relative text-orange-100 max-w-md mx-auto mb-8 leading-relaxed">
              Sign in with your university Google account and get started in seconds. No setup required.
            </p>
            <Link
              to="/login"
              className="relative inline-flex items-center gap-2 px-7 py-3.5 rounded-xl
                         bg-white text-orange-600 font-bold text-sm
                         shadow-lg hover:shadow-xl hover:scale-[1.03]
                         transition-all duration-200"
            >
              Get Started Free <IconArrow className="h-4 w-4"/>
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}