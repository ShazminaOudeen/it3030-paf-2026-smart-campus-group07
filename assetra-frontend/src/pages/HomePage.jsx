// src/pages/HomePage.jsx
// Animated homepage for Assetra — Smart Campus Operations Hub
// Hero uses a faded campus illustration with enhanced glittering particles
// Sections animate in on scroll via IntersectionObserver

import { Link } from "react-router-dom";
import { useEffect, useRef } from "react";

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

// ─── Particle Canvas ──────────────────────────────────────────────────────────

function ParticleCanvas() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    const COLORS = [
      [165, 180, 252], // lavender
      [249, 115, 22],  // orange
      [255, 255, 255], // white
      [99,  102, 241], // indigo
      [251, 146, 60],  // light orange
    ];

    const PARTICLE_COUNT = 180;
    let particles = [];
    let frame = 0;
    let animId;

    function spawn(overrideY) {
      const col = COLORS[Math.floor(Math.random() * COLORS.length)];
      const isStar = Math.random() > 0.5;
      return {
        x: Math.random() * canvas.width,
        y: overrideY !== undefined ? overrideY : Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.25,
        vy: -Math.random() * 0.35 - 0.05,
        r: isStar ? Math.random() * 1.5 + 0.4 : Math.random() * 2.2 + 0.6,
        alpha: Math.random() * 0.7 + 0.2,
        alphaDir: Math.random() > 0.5 ? 1 : -1,
        alphaSpeed: Math.random() * 0.006 + 0.002,
        maxAlpha: Math.random() * 0.75 + 0.2,
        minAlpha: 0.05,
        color: col,
        isStar,
        twinkleOffset: Math.random() * Math.PI * 2,
        twinkleSpeed: Math.random() * 0.03 + 0.01,
      };
    }

    function resize() {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
    }

    resize();
    window.addEventListener("resize", resize);

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      particles.push(spawn());
    }

    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      frame++;
      const t = frame * 0.01;

      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        p.alpha += p.alphaDir * p.alphaSpeed;
        if (p.alpha > p.maxAlpha) { p.alpha = p.maxAlpha; p.alphaDir = -1; }
        if (p.alpha < p.minAlpha) { p.alpha = p.minAlpha; p.alphaDir =  1; }

        // recycle when off-screen top
        if (p.y < -10) {
          const np = spawn(canvas.height + 10);
          Object.assign(p, np);
          continue;
        }

        const [r, g, b] = p.color;

        if (p.isStar) {
          const twinkle = 0.5 + 0.5 * Math.sin(t * p.twinkleSpeed * 60 + p.twinkleOffset);
          const a = p.alpha * (0.3 + 0.7 * twinkle);
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${r},${g},${b},${a})`;
          ctx.fill();

          // cross-flare on bright twinkling stars
          if (p.r > 1.0 && twinkle > 0.65) {
            const len = p.r * 4.5;
            ctx.strokeStyle = `rgba(${r},${g},${b},${(a * 0.55).toFixed(3)})`;
            ctx.lineWidth = 0.5;
            ctx.beginPath();
            ctx.moveTo(p.x - len, p.y); ctx.lineTo(p.x + len, p.y);
            ctx.moveTo(p.x, p.y - len); ctx.lineTo(p.x, p.y + len);
            ctx.stroke();
          }
        } else {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${r},${g},${b},${p.alpha})`;
          ctx.fill();
        }
      }

      animId = requestAnimationFrame(draw);
    }

    draw();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ zIndex: 1 }}
    />
  );
}

// ─── Campus Hero Background ───────────────────────────────────────────────────

function CampusHeroBackground() {
  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none select-none">
      {/* Sky */}
      <div
        className="absolute inset-0"
        style={{ background: "linear-gradient(180deg, #050508 0%, #0c0c18 40%, #0f0f1e 100%)" }}
      />

      {/* Campus SVG illustration */}
      <svg
        className="absolute bottom-0 left-0 w-full"
        style={{ height: "75%", opacity: 0.18 }}
        viewBox="0 0 1200 420"
        preserveAspectRatio="xMidYMax meet"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Clock tower / admin building */}
        <rect x="540" y="80" width="120" height="340" fill="#a5b4fc" opacity="0.4"/>
        <rect x="560" y="40" width="80" height="60" fill="#a5b4fc" opacity="0.4"/>
        <rect x="590" y="10" width="20" height="40" fill="#c7d2fe" opacity="0.5"/>
        <rect x="555" y="95"  width="30" height="40" fill="#1e1b4b" opacity="0.6"/>
        <rect x="615" y="95"  width="30" height="40" fill="#1e1b4b" opacity="0.6"/>
        <rect x="555" y="155" width="30" height="40" fill="#1e1b4b" opacity="0.6"/>
        <rect x="615" y="155" width="30" height="40" fill="#1e1b4b" opacity="0.6"/>
        <rect x="555" y="215" width="30" height="40" fill="#1e1b4b" opacity="0.6"/>
        <rect x="615" y="215" width="30" height="40" fill="#1e1b4b" opacity="0.6"/>
        <circle cx="600" cy="62" r="18" fill="#1e1b4b" opacity="0.7"/>
        <circle cx="600" cy="62" r="14" fill="#6366f1" opacity="0.25"/>

        {/* Library */}
        <rect x="300" y="160" width="200" height="260" fill="#818cf8" opacity="0.3"/>
        <rect x="280" y="200" width="240" height="220" fill="#818cf8" opacity="0.15"/>
        {[310, 340, 370, 400, 430, 460].map((x) => (
          <rect key={x} x={x} y="200" width="12" height="180" fill="#c7d2fe" opacity="0.35"/>
        ))}
        <polygon points="280,200 480,200 380,150" fill="#a5b4fc" opacity="0.3"/>
        {[320, 360, 400, 440].map((x) => (
          <rect key={`lw1-${x}`} x={x} y="260" width="24" height="36" fill="#1e1b4b" opacity="0.7"/>
        ))}
        {[320, 360, 400, 440].map((x) => (
          <rect key={`lw2-${x}`} x={x} y="320" width="24" height="36" fill="#1e1b4b" opacity="0.7"/>
        ))}

        {/* Science block */}
        <rect x="700" y="140" width="220" height="280" fill="#818cf8" opacity="0.28"/>
        <rect x="720" y="120" width="180" height="30" fill="#a5b4fc" opacity="0.3"/>
        <rect x="740" y="100" width="140" height="30" fill="#a5b4fc" opacity="0.25"/>
        {[710, 750, 790, 830, 870].map((x) =>
          [155, 205, 255, 305, 355].map((y) => (
            <rect key={`sw-${x}-${y}`} x={x} y={y} width="22" height="30" fill="#1e1b4b" opacity="0.65"/>
          ))
        )}

        {/* Left dormitory */}
        <rect x="0"  y="200" width="260" height="220" fill="#6366f1" opacity="0.18"/>
        <rect x="20" y="180" width="220" height="30"  fill="#818cf8" opacity="0.25"/>
        {[20, 60, 100, 140, 180, 220].map((x) =>
          [210, 260, 310].map((y) => (
            <rect key={`dw-${x}-${y}`} x={x} y={y} width="28" height="36" fill="#1e1b4b" opacity="0.55"/>
          ))
        )}

        {/* Right wing / gym */}
        <rect x="960" y="220" width="240" height="200" fill="#6366f1" opacity="0.18"/>
        <rect x="960" y="200" width="240" height="28"  fill="#818cf8" opacity="0.22"/>
        <rect x="1050" y="310" width="60" height="110" fill="#0c0c18" opacity="0.8"/>
        <ellipse cx="1080" cy="310" rx="30" ry="20"   fill="#0c0c18" opacity="0.8"/>
        {[975, 1025, 1110, 1160].map((x) => (
          <rect key={`gw1-${x}`} x={x} y="240" width="32" height="42" fill="#1e1b4b" opacity="0.6"/>
        ))}
        {[975, 1025, 1110, 1160].map((x) => (
          <rect key={`gw2-${x}`} x={x} y="300" width="32" height="42" fill="#1e1b4b" opacity="0.6"/>
        ))}

        {/* Ground & paths */}
        <rect x="0" y="390" width="1200" height="30" fill="#312e81" opacity="0.3"/>
        <line x1="600" y1="390" x2="600" y2="420" stroke="#818cf8" strokeWidth="2"   opacity="0.4"/>
        <line x1="380" y1="390" x2="320" y2="420" stroke="#818cf8" strokeWidth="1.5" opacity="0.25"/>
        <line x1="820" y1="390" x2="880" y2="420" stroke="#818cf8" strokeWidth="1.5" opacity="0.25"/>
        <rect x="0" y="410" width="1200" height="10" fill="#4338ca" opacity="0.2"/>

        {/* Tree silhouettes */}
        {[80, 170, 500, 700, 880, 1050, 1150].map((x, i) => (
          <g key={`tree-${i}`}>
            <rect    x={x + 8} y={330 + (i % 2) * 10} width="4" height="70" fill="#312e81" opacity="0.4"/>
            <ellipse cx={x + 10} cy={310 + (i % 2) * 10} rx="18" ry="30"    fill="#312e81" opacity="0.35"/>
          </g>
        ))}

        {/* Stars */}
        {[100, 200, 350, 450, 700, 850, 950, 1050, 1100].map((x, i) => (
          <circle key={`star-${i}`} cx={x} cy={30 + (i * 7) % 60} r="1.2" fill="white" opacity="0.5"/>
        ))}
      </svg>

      {/* Depth fog */}
      <div
        className="absolute inset-0"
        style={{ background: "linear-gradient(180deg, transparent 0%, transparent 40%, #0a0a0f 92%)" }}
      />

      {/* Particle layer */}
      <ParticleCanvas />

      {/* Orange brand glow at ground level */}
      <div
        className="absolute bottom-0 left-1/2 -translate-x-1/2"
        style={{
          width: "60%",
          height: "180px",
          background: "radial-gradient(ellipse at center bottom, rgba(249,115,22,0.07) 0%, transparent 70%)",
          zIndex: 2,
        }}
      />
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
  // Attach scroll reveal to each animated class
  useScrollReveal(".sr-feat");
  useScrollReveal(".sr-workflow");
  useScrollReveal(".sr-role");
  useScrollReveal(".sr-cta");

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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors duration-300">

      {/* ── SCROLL REVEAL STYLES (injected once) ─────────────────────── */}
      <style>{`
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

        /* mouse-tracking glow */
        .feat-card-glow {
          position: relative;
          overflow: hidden;
        }
        .feat-card-glow::before {
          content: '';
          position: absolute;
          inset: 0;
          border-radius: inherit;
          background: radial-gradient(
            circle at var(--mx, 50%) var(--my, 50%),
            rgba(249,115,22,0.07) 0%,
            transparent 65%
          );
          opacity: 0;
          transition: opacity 0.3s;
          pointer-events: none;
        }
        .feat-card-glow:hover::before { opacity: 1; }

        /* shimmer sweep */
        .feat-card-glow::after {
          content: '';
          position: absolute;
          top: 0; left: -100%;
          width: 60%; height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.04), transparent);
          transition: left 0.6s ease;
          pointer-events: none;
        }
        .feat-card-glow:hover::after { left: 150%; }

        /* icon bounce on card hover */
        .feat-card-glow:hover .feat-icon-inner {
          background: rgba(249,115,22,0.22) !important;
          transform: scale(1.12) rotate(-4deg);
        }
        .feat-icon-inner {
          transition: background 0.3s, transform 0.3s;
        }

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

        /* step-num bounce on hover */
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

        /* floating orbs inside CTA */
        @keyframes floatOrb {
          0%,100% { transform: scale(1);    }
          50%      { transform: scale(1.15); }
        }
        .cta-orb { animation: floatOrb 6s ease-in-out infinite; }
        .cta-orb-2 { animation: floatOrb 6s ease-in-out infinite; animation-delay: -3s; }
      `}</style>

      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <section
        id="hero"
        className="relative overflow-hidden bg-[#0a0a0f] rounded-none
                   flex flex-col items-center justify-center
                   min-h-[600px] px-6 pt-20 pb-24"
      >
        <CampusHeroBackground />

        {/* Subtle grid overlay */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage:
              "linear-gradient(rgba(99,102,241,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.04) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
            maskImage: "radial-gradient(ellipse at 50% 40%, black 30%, transparent 80%)",
            zIndex: 2,
          }}
        />

        <div className="relative z-10 flex flex-col items-center text-center max-w-3xl">

          {/* Badge */}
          <div className="mb-6 inline-flex items-center gap-2 rounded-full
                          border border-orange-500/35 bg-orange-500/10
                          px-4 py-1.5 text-xs font-semibold uppercase tracking-widest
                          text-orange-400">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping
                               rounded-full bg-orange-400 opacity-75"/>
              <span className="relative inline-flex h-2 w-2 rounded-full bg-orange-500"/>
            </span>
            Smart Campus Operations Hub
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-[60px] font-bold leading-[1.08]
                         tracking-tight text-white mb-5">
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

          {/* Sub */}
          <p className="text-base sm:text-lg text-gray-400 leading-relaxed max-w-xl mb-8">
            Assetra unifies facility bookings, asset management, and incident
            ticketing into one modern platform with full auditability and role-based access.
          </p>

          {/* CTAs */}
          <div className="flex flex-wrap gap-3 justify-center">
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
                         border border-white/10 bg-white/5
                         text-gray-200 text-sm font-semibold
                         hover:bg-white/10 hover:scale-[1.03]
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

          {/* Stats bar */}
          <div className="mt-14 w-full max-w-xl grid grid-cols-4 gap-px
                          rounded-2xl overflow-hidden
                          border border-white/8 bg-white/8">
            {STATS.map(({ value, suffix, label }) => (
              <div key={label}
                   className="flex flex-col items-center justify-center py-4 px-2
                              bg-[#0c0c16]">
                <span className="font-bold text-2xl text-white">
                  {value}<span className="text-orange-500">{suffix}</span>
                </span>
                <span className="mt-1 text-[10px] text-gray-500 text-center uppercase tracking-wide">
                  {label}
                </span>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ── FEATURES ─────────────────────────────────────────────────────── */}
      <section id="features" className="py-20 lg:py-28 bg-white dark:bg-gray-900 transition-colors">
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
      <section id="how-it-works" className="py-20 lg:py-28 bg-gray-50 dark:bg-gray-950 transition-colors">
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
      <section id="roles" className="py-20 lg:py-28 bg-white dark:bg-gray-900 transition-colors">
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
                    ? "bg-orange-500 shadow-2xl shadow-orange-500/30 scale-[1.02]"
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
      <section id="cta" className="py-16 lg:py-20 bg-gray-50 dark:bg-gray-950 transition-colors">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="sr-cta relative overflow-hidden rounded-3xl
                          bg-orange-500 px-8 py-16 text-center
                          shadow-2xl shadow-orange-500/30">
            {/* Floating orbs */}
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