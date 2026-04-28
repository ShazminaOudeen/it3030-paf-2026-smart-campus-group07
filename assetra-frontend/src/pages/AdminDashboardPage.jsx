// admin/pages/AdminDashboardPage.jsx
import { useState, useEffect, useCallback } from "react";
import jsPDF from "jspdf";
import axios from "axios";
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend
} from "recharts";
import {
  CalendarCheck, Wrench, Building2, Users, TrendingUp,
  AlertTriangle, Clock, Download, Loader2, Sparkles,
  CheckCircle, XCircle, RefreshCw
} from "lucide-react";

// ─── Colour palette ───────────────────────────────────────────────────────────
const AMBER   = "#f59e0b";
const AMBER2  = "#fbbf24";
const TEAL    = "#14b8a6";
const ROSE    = "#f43f5e";
const INDIGO  = "#6366f1";
const SLATE   = "#64748b";
const STATUS_COLORS = {
  APPROVED: "#10b981", PENDING: AMBER, REJECTED: ROSE, CANCELLED: SLATE,
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmt = (n) => (n ?? 0).toLocaleString();

function pct(a, b) {
  if (!b) return "0%";
  return `${Math.round((a / b) * 100)}%`;
}

const toHour = (t) => parseInt((t || "00").split(":")[0], 10);

function buildHourSlots(bookings) {
  const slots = Array.from({ length: 24 }, (_, h) => ({ hour: `${h}:00`, count: 0 }));
  bookings.forEach((b) => { slots[toHour(b.startTime || b.start_time)].count += 1; });
  return slots;
}

function linearForecast(history, projectDays = 7) {
  if (!history.length) return [];
  const n   = history.length;
  const sx  = history.reduce((a, _, i) => a + i, 0);
  const sy  = history.reduce((a, d) => a + d.count, 0);
  const sxy = history.reduce((a, d, i) => a + i * d.count, 0);
  const sx2 = history.reduce((a, _, i) => a + i * i, 0);
  const denom = n * sx2 - sx * sx || 1;
  const m     = (n * sxy - sx * sy) / denom;
  const b     = (sy - m * sx) / n;

  const result = [];
  for (let i = 0; i < projectDays; i++) {
    const x    = n + i;
    const date = new Date();
    date.setDate(date.getDate() + i + 1);
    result.push({
      label: date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" }),
      predicted: Math.max(0, Math.round(m * x + b)),
      isForecasted: true,
    });
  }
  return result;
}

// ─── Sub-components ───────────────────────────────────────────────────────────
function KpiCard({ icon: Icon, label, value, sub, color = AMBER, loading }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700 shadow-sm flex items-start gap-4">
      <div className="p-2.5 rounded-xl shrink-0" style={{ background: `${color}18` }}>
        <Icon size={20} style={{ color }} />
      </div>
      <div className="min-w-0">
        <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-0.5">{label}</p>
        {loading
          ? <div className="h-7 w-16 bg-gray-100 dark:bg-gray-700 rounded animate-pulse" />
          : <p className="text-2xl font-bold text-gray-900 dark:text-white leading-none">{value}</p>}
        {sub && !loading && <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{sub}</p>}
      </div>
    </div>
  );
}

function SectionTitle({ children, icon: Icon }) {
  return (
    <div className="flex items-center gap-2 mb-4">
      {Icon && <Icon size={16} className="text-amber-500" />}
      <h2 className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">{children}</h2>
    </div>
  );
}

function ChartCard({ title, icon, children, className = "" }) {
  return (
    <div className={`bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700 shadow-sm ${className}`}>
      <SectionTitle icon={icon}>{title}</SectionTitle>
      {children}
    </div>
  );
}

// ─── PDF Generation (synchronous — jsPDF imported at top) ─────────────────────
function generatePDF(data) {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const W = 210;
  const H = 297;
 
  // ── Palette ──────────────────────────────────────────────────────────────
  const amber      = [245, 158, 11];
  const amberDark  = [217, 119, 6];
  const teal       = [20, 184, 166];
  const tealLight  = [204, 251, 241];
  const rose       = [244, 63, 94];
  const indigo     = [99, 102, 241];
  const slate      = [100, 116, 139];
  const dark       = [17, 24, 39];
  const navy       = [30, 41, 59];
  const navyDeep   = [15, 23, 42];
  const navyMid    = [51, 65, 85];
  const textMid    = [107, 114, 128];
  const textLight  = [156, 163, 175];
  const bg         = [248, 250, 252];
  const bgLight    = [241, 245, 249];
  const white      = [255, 255, 255];
  const border     = [229, 231, 235];
  const amberPale  = [254, 243, 199];
  const green      = [16, 185, 129];
 
  const STATUS_COLORS = {
    APPROVED: green, PENDING: amber, REJECTED: rose, CANCELLED: slate,
  };
 
  // ── Helpers ───────────────────────────────────────────────────────────────
  const rgb  = (arr) => ({ r: arr[0], g: arr[1], b: arr[2] });
  const setFill   = (arr) => doc.setFillColor(arr[0], arr[1], arr[2]);
  const setStroke = (arr) => doc.setDrawColor(arr[0], arr[1], arr[2]);
  const setTextC  = (arr) => doc.setTextColor(arr[0], arr[1], arr[2]);
 
  function roundedRect(x, y, w, h, r, fillColor, strokeColor) {
    if (fillColor) setFill(fillColor);
    if (strokeColor) setStroke(strokeColor);
    const lw = strokeColor ? 0.3 : 0;
    doc.roundedRect(x, y, w, h, r, r, strokeColor && !fillColor ? "S" : fillColor && !strokeColor ? "F" : "FD");
  }
 
  // ── Page background ───────────────────────────────────────────────────────
  setFill(bg);
  doc.rect(0, 0, W, H, "F");
 
  // ──────────────────────────────────────────────────────────────────────────
  // HEADER
  // ──────────────────────────────────────────────────────────────────────────
  const headerH = 62;
 
  // Dark background
  setFill(navy);
  doc.rect(0, 0, W, headerH, "F");
 
  // Decorative circles (top-right)
  setFill(navyMid);
  doc.circle(W - 18, 14, 28, "F");
  doc.circle(W - 38, 40, 18, "F");
 
  // Amber bottom stripe
  setFill(amber);
  doc.rect(0, headerH - 1.5, W, 1.5, "F");
 
  // Logo dot
  setFill(amber);
  doc.circle(13, 13, 4, "F");
  setFill(navy);
  doc.circle(13, 13, 2, "F");
 
  // Title
  setTextC(white);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.text("Smart Campus", 22, 11);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  setTextC([148, 163, 184]);
  doc.text("Admin Analytics Report", 22, 17);
  doc.setFontSize(7.5);
  setTextC([100, 116, 139]);
  doc.text(`Generated  ${new Date().toLocaleString()}`, 22, 24);
 
  // KPI stat cards in header
  const kpis = [
    ["Total Bookings",   fmt(data.totalBookings),           amber],
    ["Approval Rate",    pct(data.approved, data.totalBookings), teal],
    ["Active Resources", fmt(data.activeResources),         indigo],
    ["Open Tickets",     fmt(data.openTickets),             rose],
  ];
  const cardW = 44;
  const cardX0 = 14;
  kpis.forEach(([label, val, color], i) => {
    const cx = cardX0 + i * (cardW + 2);
    const cy = 33;
    setFill(navyDeep);
    roundedRect(cx, cy, cardW, 20, 2.5, navyDeep);
    // Color accent left bar
    setFill(color);
    doc.rect(cx, cy, 1.5, 20, "F");
    // Value
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    setTextC(color);
    doc.text(String(val), cx + 5, cy + 9);
    // Label
    doc.setFont("helvetica", "normal");
    doc.setFontSize(6.5);
    setTextC([148, 163, 184]);
    doc.text(label.toUpperCase(), cx + 5, cy + 15);
  });
 
  // ──────────────────────────────────────────────────────────────────────────
  // BODY
  // ──────────────────────────────────────────────────────────────────────────
  let y = headerH + 8;
  const leftX = 14;
 
  // ── Section label helper ────────────────────────────────────────────────
  function sectionLabel(text, color = amber) {
    setFill(color);
    doc.rect(leftX, y, 2.5, 5.5, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    setTextC(dark);
    doc.text(text.toUpperCase(), leftX + 5, y + 4);
    y += 9;
  }
 
  // ─────────────────────────────────────────────────────────────────────────
  // SECTION 1 — Booking Status Breakdown
  // ─────────────────────────────────────────────────────────────────────────
  sectionLabel("Booking Status Breakdown");
 
  const total = data.totalBookings || 1;
  const statusBreakdown = data.statusBreakdown || [];
  const barTrackW = 155;
  const barH = 6.5;
 
  statusBreakdown.forEach(({ status, count }) => {
    const color = STATUS_COLORS[status] || slate;
    const fraction = count / total;
    const fillW = fraction * barTrackW;
 
    // Track
    setFill(bgLight);
    roundedRect(leftX, y, barTrackW, barH, 3, bgLight);
 
    // Fill
    if (fillW > 6) {
      roundedRect(leftX, y, fillW, barH, 3, color);
    } else if (fillW > 0) {
      setFill(color);
      doc.rect(leftX, y, fillW, barH, "F");
    }
 
    // Status label (inside bar or outside)
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7);
    setTextC(fillW > 22 ? white : dark);
    doc.text(status, leftX + 3.5, y + 4.3);
 
    // Count + pct (right of bar)
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7);
    setTextC(textMid);
    doc.text(`${count}  (${Math.round(fraction * 100)}%)`, leftX + barTrackW + 3, y + 4.3);
 
    y += 9.5;
  });
 
  y += 4;
 
  // ─────────────────────────────────────────────────────────────────────────
  // SECTION 2 — Top Resources Table
  // ─────────────────────────────────────────────────────────────────────────
  sectionLabel("Top Resources by Bookings");
 
  const cols = [72, 30, 18, 30];   // widths in mm
  const heads = ["Resource", "Type", "Bookings", "Volume"];
  const rowH = 8.5;
  const tableW = cols.reduce((a, b) => a + b, 0);
  const topResources = data.topResources || [];
  const maxCount = Math.max(...topResources.map((r) => r.bookingCount), 1);
 
  // Header row
  setFill(navy);
  roundedRect(leftX, y, tableW, rowH, 2.5, navy);
  let cx = leftX;
  heads.forEach((h, i) => {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);
    setTextC(white);
    doc.text(h, cx + 3, y + 5.5);
    cx += cols[i];
  });
  y += rowH;
 
  topResources.slice(0, 8).forEach((r, idx) => {
    const rowBg = idx % 2 === 0 ? [248, 250, 252] : white;
    setFill(rowBg);
    doc.rect(leftX, y, tableW, rowH, "F");
 
    // Amber accent for top performers
    if (r.bookingCount >= 3) {
      setFill(amber);
      doc.rect(leftX, y, 1.8, rowH, "F");
    }
 
    cx = leftX;
    // Name
    doc.setFont(r.bookingCount >= 3 ? "helvetica-bold" : "helvetica", r.bookingCount >= 3 ? "bold" : "normal");
    doc.setFontSize(7.5);
    setTextC(dark);
    doc.text(String(r.name || "").substring(0, 34), cx + 3.5, y + 5.5);
    cx += cols[0];
 
    // Type badge
    doc.setFont("helvetica", "normal");
    doc.setFontSize(6.5);
    setTextC(textMid);
    doc.text(String(r.type || ""), cx + 2, y + 5.5);
    cx += cols[1];
 
    // Count
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    setTextC(r.bookingCount > 0 ? amberDark : textLight);
    doc.text(String(r.bookingCount), cx + 5, y + 5.5);
    cx += cols[2];
 
    // Mini bar
    if (r.bookingCount > 0) {
      const miniBarLen = (r.bookingCount / maxCount) * 24;
      setFill(amberPale);
      roundedRect(cx + 2, y + 2.5, 24, 3.5, 1.5, amberPale);
      setFill(amber);
      roundedRect(cx + 2, y + 2.5, miniBarLen, 3.5, 1.5, amber);
    }
 
    y += rowH;
  });
 
  // Bottom rule
  setStroke(border);
  doc.setLineWidth(0.4);
  doc.line(leftX, y + 1, leftX + tableW, y + 1);
  y += 7;
 
  // ─────────────────────────────────────────────────────────────────────────
  // SECTION 3 — AI Forecast
  // ─────────────────────────────────────────────────────────────────────────
  sectionLabel("AI Demand Forecast — Next 7 Days", teal);
 
  doc.setFont("helvetica", "italic");
  doc.setFontSize(7.5);
  setTextC(textMid);
  doc.text("Predicted booking volume based on linear trend analysis of historical data.", leftX, y);
  y += 7;
 
  const forecast = data.forecast || [];
  const maxPred = Math.max(...forecast.map((f) => f.predicted), 1);
  const chartH = 30;
  const chartBottom = y + chartH;
  const barAreaW = 155;
  const fBarW = (barAreaW / forecast.length) - 3.5;
 
  // Horizontal grid lines
  for (let i = 1; i <= 3; i++) {
    const gy = chartBottom - (i / 3) * chartH;
    setStroke([226, 232, 240]);
    doc.setLineWidth(0.35);
    doc.line(leftX, gy, leftX + barAreaW, gy);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(6);
    setTextC(textLight);
    doc.text(String(Math.round((i / 3) * maxPred)), leftX - 1, gy + 1.5, { align: "right" });
  }
 
  forecast.forEach((f, i) => {
    const bx = leftX + i * (barAreaW / forecast.length) + 1.5;
    const barHeight = maxPred > 0 ? (f.predicted / maxPred) * chartH : 2;
    const by = chartBottom - barHeight;
 
    // Shadow / glow
    setFill(tealLight);
    roundedRect(bx + 0.8, by + 0.8, fBarW, barHeight, 2.5, tealLight);
    // Bar
    setFill(teal);
    roundedRect(bx, by, fBarW, barHeight, 2.5, teal);
 
    // Value above
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);
    setTextC(dark);
    doc.text(String(f.predicted), bx + fBarW / 2, by - 1.5, { align: "center" });
 
    // Day label below
    const parts = f.label.split(", ");
    doc.setFont("helvetica", "normal");
    doc.setFontSize(6);
    setTextC(textMid);
    doc.text(parts[0] || f.label, bx + fBarW / 2, chartBottom + 4.5, { align: "center" });
    if (parts[1]) doc.text(parts[1], bx + fBarW / 2, chartBottom + 8.5, { align: "center" });
  });
 
  // X-axis line
  setStroke([203, 213, 225]);
  doc.setLineWidth(0.6);
  doc.line(leftX, chartBottom, leftX + barAreaW, chartBottom);
 
  // ──────────────────────────────────────────────────────────────────────────
  // FOOTER
  // ──────────────────────────────────────────────────────────────────────────
  setFill(navy);
  doc.rect(0, H - 13, W, 13, "F");
  setFill(amber);
  doc.rect(0, H - 13, W, 0.8, "F");
  doc.setFont("helvetica", "normal");
  doc.setFontSize(6.5);
  setTextC(white);
  doc.text("Smart Campus Operations Hub  •  Confidential  •  For Internal Use Only", 14, H - 5);
  doc.text("Page 1", W - 14, H - 5, { align: "right" });
 
  doc.save(`campus-analytics-${new Date().toISOString().split("T")[0]}.pdf`);
}
 

// ─── Main Component ───────────────────────────────────────────────────────────
export default function AdminDashboardPage() {
  const [loading,    setLoading]    = useState(true);
  const [exporting,  setExporting]  = useState(false);
  const [error,      setError]      = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);

  const [bookings,  setBookings]  = useState([]);
  const [resources, setResources] = useState([]);
  const [tickets,   setTickets]   = useState([]);
  const [users,     setUsers]     = useState([]);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [bRes, rRes, tRes, uRes] = await Promise.all([
        axios.get("/api/bookings"),
        axios.get("/api/resources?size=1000"),
        axios.get("/api/tickets"),
        axios.get("/api/users"),
      ]);
      const norm = (d) => Array.isArray(d) ? d : (d?.content ?? d?.data ?? []);
      setBookings(norm(bRes.data));
      setResources(norm(rRes.data));
      setTickets(norm(tRes.data));
      setUsers(norm(uRes.data));
      setLastUpdate(new Date());
    } catch (e) {
      setError(e?.response?.data?.message || "Failed to load dashboard data.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  // ── Derived analytics ──────────────────────────────────────────────────────
  const totalBookings   = bookings.length;
  const approved        = bookings.filter(b => b.status === "APPROVED").length;
  const pending         = bookings.filter(b => b.status === "PENDING").length;
  const rejected        = bookings.filter(b => b.status === "REJECTED").length;
  const cancelled       = bookings.filter(b => b.status === "CANCELLED").length;
  const activeResources = resources.filter(r => r.status === "ACTIVE" && !r.deleted).length;
  const openTickets     = tickets.filter(t => !["RESOLVED","CLOSED","REJECTED"].includes(t.status)).length;
  const totalUsers      = users.length;

  const statusBreakdown = [
    { status: "APPROVED",  count: approved },
    { status: "PENDING",   count: pending },
    { status: "REJECTED",  count: rejected },
    { status: "CANCELLED", count: cancelled },
  ].filter(s => s.count > 0);

  const resourceBookingMap = {};
  bookings.forEach(b => {
    const id = b.resourceId || b.resource_id;
    resourceBookingMap[id] = (resourceBookingMap[id] || 0) + 1;
  });
  const topResources = resources
    .map(r => ({ ...r, bookingCount: resourceBookingMap[r.id] || 0 }))
    .sort((a, b) => b.bookingCount - a.bookingCount)
    .slice(0, 6);

  const hourSlots = buildHourSlots(bookings);
  const peakHour  = hourSlots.reduce((max, s) => s.count > max.count ? s : max, hourSlots[0]);

  const dailyMap = {};
  bookings.forEach(b => {
    const d = (b.bookingDate || b.booking_date || "").split("T")[0];
    if (d) dailyMap[d] = (dailyMap[d] || 0) + 1;
  });
  const last30 = Array.from({ length: 30 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (29 - i));
    const key = d.toISOString().split("T")[0];
    return {
      label: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      count: dailyMap[key] || 0,
    };
  });

  const forecast = linearForecast(last30);

  const typeMap = {};
  resources.filter(r => !r.deleted).forEach(r => {
    typeMap[r.type || "OTHER"] = (typeMap[r.type || "OTHER"] || 0) + 1;
  });
  const typeBreakdown = Object.entries(typeMap).map(([type, count]) => ({ type, count }));

  const priorityMap = {};
  tickets.forEach(t => { priorityMap[t.priority || "MEDIUM"] = (priorityMap[t.priority || "MEDIUM"] || 0) + 1; });
  const priorityBreakdown = Object.entries(priorityMap).map(([p, c]) => ({ priority: p, count: c }));

  const pdfData = {
    totalBookings, approved, activeResources, openTickets,
    topResources, statusBreakdown, forecast,
  };

  // Now synchronous — no async needed
  const handleExport = () => {
    setExporting(true);
    try {
      generatePDF(pdfData);
    } catch (e) {
      console.error("PDF error:", e);
    } finally {
      setExporting(false);
    }
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">

      {/* ── Page header ── */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Analytics Dashboard</h1>
          {lastUpdate && (
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
              Last updated {lastUpdate.toLocaleTimeString()}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchAll}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-gray-200
              dark:border-gray-700 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-50
              dark:hover:bg-gray-800 transition-colors disabled:opacity-50">
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            Refresh
          </button>
          <button
            onClick={handleExport}
            disabled={exporting || loading}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600
              text-white text-sm font-semibold transition-colors disabled:opacity-60 disabled:cursor-not-allowed shadow-sm">
            {exporting ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
            {exporting ? "Generating PDF…" : "Export PDF Report"}
          </button>
        </div>
      </div>

      {/* ── Error ── */}
      {error && (
        <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-red-50 dark:bg-red-500/10
          border border-red-200 dark:border-red-500/30 text-sm text-red-600 dark:text-red-400">
          <AlertTriangle size={15} />
          {error}
        </div>
      )}

      {/* ── KPI Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard icon={CalendarCheck} label="Total Bookings"   value={fmt(totalBookings)}           sub={`${fmt(pending)} pending approval`}          color={AMBER}  loading={loading} />
        <KpiCard icon={CheckCircle}   label="Approval Rate"    value={pct(approved, totalBookings)} sub={`${fmt(approved)} approved`}                 color={TEAL}   loading={loading} />
        <KpiCard icon={Building2}     label="Active Resources" value={fmt(activeResources)}         sub={`${fmt(resources.length)} total`}             color={INDIGO} loading={loading} />
        <KpiCard icon={Wrench}        label="Open Tickets"     value={fmt(openTickets)}             sub={`${fmt(tickets.length)} total tickets`}       color={ROSE}   loading={loading} />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard icon={Users}      label="Registered Users" value={fmt(totalUsers)}                                                      sub="all roles"                color={SLATE} loading={loading} />
        <KpiCard icon={Clock}      label="Peak Hour"        value={loading ? "—" : peakHour?.hour}                                       sub={`${fmt(peakHour?.count)} bookings`} color={AMBER} loading={loading} />
        <KpiCard icon={XCircle}    label="Rejected"         value={fmt(rejected)}                                                        sub={`${pct(rejected, totalBookings)} rejection rate`} color={ROSE} loading={loading} />
        <KpiCard icon={TrendingUp} label="7-Day Forecast"   value={loading ? "—" : `${forecast.reduce((a, f) => a + f.predicted, 0)}`}   sub="predicted bookings"       color={TEAL} loading={loading} />
      </div>

      {/* ── Daily trend ── */}
      <ChartCard title="Booking Trend — Last 30 Days" icon={TrendingUp}>
        {loading
          ? <div className="h-48 bg-gray-50 dark:bg-gray-700/30 rounded-xl animate-pulse" />
          : (
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={last30} margin={{ top: 4, right: 8, bottom: 0, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" strokeOpacity={0.5} />
                <XAxis dataKey="label" tick={{ fontSize: 10, fill: "#9ca3af" }} interval={4} />
                <YAxis tick={{ fontSize: 10, fill: "#9ca3af" }} allowDecimals={false} />
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #f3f4f6" }} />
                <Line type="monotone" dataKey="count" stroke={AMBER} strokeWidth={2}
                  dot={false} activeDot={{ r: 4, fill: AMBER }} />
              </LineChart>
            </ResponsiveContainer>
          )}
      </ChartCard>

      {/* ── AI Forecast ── */}
      <div className="bg-gradient-to-br from-teal-50 to-emerald-50 dark:from-teal-900/20 dark:to-emerald-900/20
        rounded-2xl p-5 border border-teal-200 dark:border-teal-700/40 shadow-sm">
        <div className="flex items-center gap-2 mb-1">
          <Sparkles size={16} className="text-teal-500" />
          <h2 className="text-sm font-bold text-teal-800 dark:text-teal-300 uppercase tracking-wider">
            AI Demand Forecast — Next 7 Days
          </h2>
        </div>
        <p className="text-xs text-teal-600 dark:text-teal-400 mb-4">
          Predicted booking volume using linear trend analysis on your last 30 days of data.
        </p>
        {loading
          ? <div className="h-40 bg-teal-100/50 dark:bg-teal-800/20 rounded-xl animate-pulse" />
          : (
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={forecast} margin={{ top: 4, right: 8, bottom: 0, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#99f6e4" strokeOpacity={0.4} />
                <XAxis dataKey="label" tick={{ fontSize: 10, fill: "#0d9488" }} />
                <YAxis tick={{ fontSize: 10, fill: "#0d9488" }} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #99f6e4", background: "#f0fdfa" }}
                  formatter={(v) => [`${v} bookings`, "Predicted"]}
                />
                <Bar dataKey="predicted" fill={TEAL} radius={[6, 6, 0, 0]} maxBarSize={48} />
              </BarChart>
            </ResponsiveContainer>
          )}
      </div>

      {/* ── Top resources + Status breakdown ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="Top Resources by Bookings" icon={Building2}>
          {loading
            ? <div className="h-52 bg-gray-50 dark:bg-gray-700/30 rounded-xl animate-pulse" />
            : (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={topResources} layout="vertical" margin={{ top: 0, right: 24, bottom: 0, left: 4 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" strokeOpacity={0.5} horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 10, fill: "#9ca3af" }} allowDecimals={false} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 10, fill: "#6b7280" }} width={100} />
                  <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                  <Bar dataKey="bookingCount" name="Bookings" radius={[0, 6, 6, 0]} maxBarSize={20}>
                    {topResources.map((_, i) => (
                      <Cell key={i} fill={i === 0 ? AMBER : i === 1 ? AMBER2 : "#fde68a"} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
        </ChartCard>

        <ChartCard title="Booking Status Breakdown" icon={CalendarCheck}>
          {loading
            ? <div className="h-52 bg-gray-50 dark:bg-gray-700/30 rounded-xl animate-pulse" />
            : (
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={statusBreakdown}
                    dataKey="count"
                    nameKey="status"
                    cx="50%" cy="50%"
                    outerRadius={80}
                    innerRadius={44}
                    paddingAngle={3}
                    label={({ status, percent }) => `${status} ${(percent * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {statusBreakdown.map((s) => (
                      <Cell key={s.status} fill={STATUS_COLORS[s.status] || SLATE} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                  <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
                </PieChart>
              </ResponsiveContainer>
            )}
        </ChartCard>
      </div>

      {/* ── Peak hours ── */}
      <ChartCard title="Peak Booking Hours (All Time)" icon={Clock}>
        {loading
          ? <div className="h-36 bg-gray-50 dark:bg-gray-700/30 rounded-xl animate-pulse" />
          : (
            <>
              <ResponsiveContainer width="100%" height={150}>
                <BarChart data={hourSlots.slice(6, 22)} margin={{ top: 4, right: 8, bottom: 0, left: -20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" strokeOpacity={0.4} />
                  <XAxis dataKey="hour" tick={{ fontSize: 9, fill: "#9ca3af" }} />
                  <YAxis tick={{ fontSize: 10, fill: "#9ca3af" }} allowDecimals={false} />
                  <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                  <Bar dataKey="count" name="Bookings" radius={[4, 4, 0, 0]} maxBarSize={28}>
                    {hourSlots.slice(6, 22).map((s, i) => (
                      <Cell key={i}
                        fill={s.count === peakHour.count ? ROSE : s.count > peakHour.count * 0.6 ? AMBER : "#fde68a"} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-2 text-center">
                Showing 6:00–22:00 • Peak: <span className="font-semibold text-amber-500">{peakHour.hour}</span> with {fmt(peakHour.count)} bookings
              </p>
            </>
          )}
      </ChartCard>

      {/* ── Resource types + Ticket priority ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="Resources by Type" icon={Building2}>
          {loading
            ? <div className="h-44 bg-gray-50 dark:bg-gray-700/30 rounded-xl animate-pulse" />
            : (
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={typeBreakdown} margin={{ top: 4, right: 8, bottom: 0, left: -20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" strokeOpacity={0.4} />
                  <XAxis dataKey="type" tick={{ fontSize: 10, fill: "#9ca3af" }} />
                  <YAxis tick={{ fontSize: 10, fill: "#9ca3af" }} allowDecimals={false} />
                  <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                  <Bar dataKey="count" name="Resources" radius={[6, 6, 0, 0]} fill={INDIGO} maxBarSize={40} />
                </BarChart>
              </ResponsiveContainer>
            )}
        </ChartCard>

        <ChartCard title="Ticket Priority Breakdown" icon={Wrench}>
          {loading
            ? <div className="h-44 bg-gray-50 dark:bg-gray-700/30 rounded-xl animate-pulse" />
            : (
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={priorityBreakdown} margin={{ top: 4, right: 8, bottom: 0, left: -20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" strokeOpacity={0.4} />
                  <XAxis dataKey="priority" tick={{ fontSize: 10, fill: "#9ca3af" }} />
                  <YAxis tick={{ fontSize: 10, fill: "#9ca3af" }} allowDecimals={false} />
                  <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                  <Bar dataKey="count" name="Tickets" radius={[6, 6, 0, 0]} maxBarSize={40}>
                    {priorityBreakdown.map((p, i) => (
                      <Cell key={i}
                        fill={p.priority === "HIGH" ? ROSE : p.priority === "MEDIUM" ? AMBER : TEAL} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
        </ChartCard>
      </div>

    </div>
  );
}