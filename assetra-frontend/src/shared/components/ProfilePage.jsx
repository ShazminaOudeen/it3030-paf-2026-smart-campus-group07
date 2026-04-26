// src/shared/pages/ProfilePage.jsx
import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useLocation } from "react-router-dom";
import { User, Mail, Phone, Shield, Check, Calendar, Pencil, X, Save, Sparkles, Award, Clock, ShieldCheck, BadgeCheck } from "lucide-react";

/* ─── Per-role accent ─── */
function useRoleAccent() {
  const { pathname } = useLocation();
  if (pathname.startsWith("/admin"))
    return { 
      glow: "rgba(249,115,22,0.15)", 
      dot: "#f97316", 
      tag: "Administrator", 
      portal: "Admin Portal",
      gradient: "from-orange-500/20 to-orange-600/10",
      badge: "Administrator Access"
    };
  if (pathname.startsWith("/technician"))
    return { 
      glow: "rgba(59,130,246,0.15)", 
      dot: "#3b82f6", 
      tag: "Technician", 
      portal: "Technician Portal",
      gradient: "from-blue-500/20 to-blue-600/10",
      badge: "Technical Support"
    };
  return { 
    glow: "rgba(245,158,11,0.12)", 
    dot: "#f59e0b", 
    tag: "Campus User", 
    portal: "User Portal",
    gradient: "from-amber-500/20 to-amber-600/10",
    badge: "Campus Member"
  };
}

/* ─── Validation ─── */
function validateField(name, value) {
  if (name === "name") {
    if (!value.trim()) return "Full name is required";
    if (/[0-9]/.test(value)) return "Name cannot contain numbers";
    if (/[^a-zA-Z\s\-']/.test(value)) return "Name cannot contain special characters";
    if (value.trim().length < 2) return "Name must be at least 2 characters";
  }
  if (name === "phone") {
    const digits = value.replace(/\s/g, "");
    if (!digits) return "Phone number is required";
    if (!/^07/.test(digits)) return "Phone must start with 07";
    if (digits.length !== 10) return "Phone must be exactly 10 digits";
    if (!/^\d+$/.test(digits)) return "Phone must contain digits only";
  }
  if (name === "email") {
    if (!value.trim()) return "Email is required";
    if ((value.match(/@/g) || []).length !== 1) return "Email must contain exactly one @";
    if (!/^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/.test(value))
      return "Enter a valid email (e.g. name@domain.com)";
  }
  return "";
}

/* ─── Field component with animation ─── */
function Field({ label, value, name, type = "text", editing, onChange, icon: Icon, locked, error }) {
  return (
    <div className="flex flex-col gap-1.5 group transition-all duration-200">
      <label className="flex items-center gap-1.5 text-[10px] font-semibold tracking-widest uppercase text-gray-400 dark:text-gray-500 group-hover:text-gray-500 dark:group-hover:text-gray-400 transition-colors">
        <Icon size={10} className="transition-transform group-hover:scale-110" />
        {label}
        {locked && editing && (
          <span className="ml-auto text-[9px] normal-case tracking-normal font-normal text-gray-400 dark:text-gray-600">locked</span>
        )}
      </label>

      {editing && !locked ? (
        <>
          <input
            type={type}
            name={name}
            value={value}
            onChange={onChange}
            className={`w-full rounded-xl px-4 py-2.5 text-sm text-gray-900 dark:text-white
              bg-gray-50 dark:bg-white/[0.05]
              border outline-none transition-all duration-200
              placeholder-gray-400
              focus:scale-[1.01] focus:shadow-lg
              ${error
                ? "border-red-400 dark:border-red-500/60 focus:ring-2 focus:ring-red-200 dark:focus:ring-red-500/20 focus:border-red-500"
                : "border-gray-200 dark:border-white/[0.10] focus:border-gray-400 dark:focus:border-white/30 focus:ring-2 focus:ring-gray-200 dark:focus:ring-white/5"
              }`}
          />
          {error && (
            <p className="text-xs text-red-500 dark:text-red-400 flex items-center gap-1 mt-0.5 animate-shake">
              <svg className="w-3 h-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"/>
              </svg>
              {error}
            </p>
          )}
        </>
      ) : (
        <div className="px-4 py-2.5 rounded-xl text-sm text-gray-700 dark:text-gray-300
          bg-gray-50/80 dark:bg-white/[0.03]
          border border-gray-100 dark:border-white/[0.05]
          min-h-[42px] flex items-center
          transition-all duration-200 group-hover:border-gray-200 dark:group-hover:border-white/[0.1]">
          {value || <span className="text-gray-300 dark:text-gray-600 italic text-xs">Not provided</span>}
        </div>
      )}
    </div>
  );
}

/* ─── Stat pill with animation ─── */
function Stat({ label, value, icon: Icon }) {
  return (
    <div className="flex flex-col gap-0.5 px-4 py-3 rounded-2xl
      bg-gradient-to-br from-gray-50 to-white dark:from-white/[0.03] dark:to-white/[0.01]
      border border-gray-100 dark:border-white/[0.05]
      hover:border-gray-200 dark:hover:border-white/[0.1]
      hover:shadow-md hover:scale-[1.02]
      transition-all duration-300 cursor-default group">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-semibold tracking-widest uppercase text-gray-400 dark:text-gray-500">{label}</span>
        {Icon && <Icon size={12} className="text-gray-300 dark:text-gray-600 group-hover:scale-110 transition-transform" />}
      </div>
      <span className="text-sm font-semibold text-gray-800 dark:text-gray-200 mt-1">{value}</span>
    </div>
  );
}

/* ─── Animated background pattern ─── */
function AnimatedBackground({ accent }) {
  return (
    <div className="absolute inset-0 overflow-hidden rounded-3xl pointer-events-none">
      <div className="absolute -top-1/2 -right-1/2 w-full h-full bg-gradient-to-br from-transparent via-transparent to-transparent opacity-30"
        style={{ background: `radial-gradient(circle at 70% 30%, ${accent.glow} 0%, transparent 70%)` }} />
      <div className="absolute inset-0" style={{
        backgroundImage: `radial-gradient(circle at 2px 2px, ${accent.glow} 0.5px, transparent 0.5px)`,
        backgroundSize: '24px 24px'
      }} />
    </div>
  );
}

export default function ProfilePage() {
  const { user, login, token } = useAuth();
  const accent = useRoleAccent();

  const [editing, setEditing] = useState(false);
  const [saving,  setSaving]  = useState(false);
  const [saved,   setSaved]   = useState(false);
  const [form,    setForm]    = useState({ name: "", phone: "", email: "" });
  const [errors,  setErrors]  = useState({});

  useEffect(() => {
    if (user) setForm({ name: user.name ?? "", phone: user.phone ?? "", email: user.email ?? "" });
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: validateField(name, value) }));
  };

  const validateAll = () => {
    const e = {};
    ["name", "phone"].forEach(field => {
      const msg = validateField(field, form[field]);
      if (msg) e[field] = msg;
    });
    return e;
  };

  const handleSave = async () => {
    const validationErrors = validateAll();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setSaving(true);
    try {
      const API = import.meta.env.VITE_API_BASE_URL;
      const res = await fetch(`${API}/users/${user.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name: form.name, phone: form.phone }),
      });
      const updated = res.ok ? await res.json() : null;
      login(token, { ...user, name: updated?.name ?? form.name, phone: updated?.phone ?? form.phone });
    } catch {
      login(token, { ...user, name: form.name, phone: form.phone });
    } finally {
      setSaving(false);
      setEditing(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }
  };

  const handleCancel = () => {
    setForm({ name: user?.name ?? "", phone: user?.phone ?? "", email: user?.email ?? "" });
    setErrors({});
    setEditing(false);
  };

  const initial = (user?.name?.[0] ?? "U").toUpperCase();
  const memberSince = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString("en-US", { month: "short", year: "numeric" })
    : "2026";

  return (
    <>
      <style>{`
        @keyframes glowPulse {
          0%, 100% { opacity: 0.4; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.05); }
        }
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeSlideRight {
          from { opacity: 0; transform: translateX(-20px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes shimmer {
          0% { background-position: -1000px 0; }
          100% { background-position: 1000px 0; }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-4px); }
          75% { transform: translateX(4px); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-5px); }
        }
        @keyframes badgePulse {
          0%, 100% { opacity: 0.6; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.05); }
        }

        .animate-fade-slide-up { animation: fadeSlideUp 0.6s cubic-bezier(0.4, 0, 0.2, 1) both; }
        .animate-fade-slide-right { animation: fadeSlideRight 0.5s cubic-bezier(0.4, 0, 0.2, 1) both; }
        .animate-shake { animation: shake 0.3s ease-in-out; }
        .animate-float { animation: float 4s ease-in-out infinite; }
        .animate-badge-pulse { animation: badgePulse 2s ease-in-out infinite; }
        
        .profile-card { 
          animation: fadeSlideUp 0.6s cubic-bezier(0.4, 0, 0.2, 1) both; 
          backdrop-filter: blur(0px);
          transition: all 0.3s ease;
        }
        .profile-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 20px 25px -12px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.02);
        }
        .profile-card:nth-child(1) { animation-delay: 0s; }
        .profile-card:nth-child(2) { animation-delay: 0.1s; }
        .profile-card:nth-child(3) { animation-delay: 0.2s; }
        .profile-card:nth-child(4) { animation-delay: 0.3s; }
        
        .shimmer {
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent);
          background-size: 1000px 100%;
          animation: shimmer 2s infinite;
        }
      `}</style>

      <div className="max-w-2xl mx-auto space-y-4 pb-12 px-4 sm:px-6">

        {/* ── Hero card with enhanced animation ── */}
        <div className="profile-card relative rounded-3xl overflow-hidden
          bg-white dark:bg-gray-900/95
          border border-gray-100 dark:border-white/[0.07]
          shadow-xl hover:shadow-2xl transition-all duration-500">

          <AnimatedBackground accent={accent} />

          {/* Ambient glows */}
          <div className="absolute -top-16 -left-16 w-64 h-64 rounded-full pointer-events-none"
            style={{ background: `radial-gradient(circle, ${accent.glow} 0%, transparent 70%)`, animation: "glowPulse 5s ease-in-out infinite" }}/>
          <div className="absolute -bottom-16 -right-16 w-48 h-48 rounded-full pointer-events-none"
            style={{ background: `radial-gradient(circle, ${accent.glow} 0%, transparent 70%)`, animation: "glowPulse 7s ease-in-out infinite reverse" }}/>

          <div className="relative p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">

              {/* Avatar with enhanced animation */}
              <div className="relative flex-shrink-0 group">
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-orange-400 to-orange-600 opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-500" />
                {user?.pictureUrl ? (
                  <img src={user.pictureUrl} alt={user.name}
                    className="w-20 h-20 rounded-2xl object-cover border-2 border-white dark:border-gray-700 shadow-lg
                      group-hover:scale-105 transition-transform duration-300"/>
                ) : (
                  <div className="w-20 h-20 rounded-2xl flex items-center justify-center
                    bg-gradient-to-br from-gray-100 to-gray-200 dark:from-white/[0.08] dark:to-white/[0.02]
                    border border-gray-200 dark:border-white/10 shadow-lg
                    group-hover:scale-105 transition-transform duration-300">
                    <span className="text-3xl font-bold text-gray-500 dark:text-gray-300">{initial}</span>
                  </div>
                )}
                <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2
                  border-white dark:border-gray-900 animate-badge-pulse"
                  style={{ background: accent.dot }}/>
              </div>

              {/* Name + meta */}
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <h1 className="text-xl font-bold text-gray-900 dark:text-white font-display truncate animate-fade-slide-right">
                    {user?.name ?? "—"}
                  </h1>
                  <span className="text-[10px] font-semibold tracking-widest uppercase px-2.5 py-0.5 rounded-full
                    bg-gradient-to-r from-gray-100 to-gray-50 dark:from-white/[0.08] dark:to-white/[0.04]
                    text-gray-600 dark:text-gray-300
                    border border-gray-200 dark:border-white/[0.08]
                    flex items-center gap-1">
                    <Sparkles size={8} className="text-orange-500" />
                    {accent.tag}
                  </span>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 truncate flex items-center gap-1">
                  <Mail size={12} className="text-gray-400" />
                  {user?.email}
                </p>
                <p className="text-[11px] text-gray-400 dark:text-gray-500 font-mono mt-0.5 flex items-center gap-1">
                  <Clock size={10} />
                  {accent.portal} · Member since {memberSince}
                </p>
              </div>

              {/* Edit / Save / Cancel with better animations */}
              <div className="flex items-center gap-2 self-start sm:self-center">
                {saved && (
                  <span className="flex items-center gap-1 text-xs text-green-500 font-semibold animate-fade-slide-right">
                    <Check size={12}/> Saved!
                  </span>
                )}
                {editing ? (
                  <>
                    <button onClick={handleCancel}
                      className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold
                        text-gray-600 dark:text-gray-300
                        bg-gray-100 dark:bg-white/[0.06]
                        hover:bg-gray-200 dark:hover:bg-white/10
                        border border-gray-200 dark:border-white/[0.08]
                        hover:scale-105 transition-all duration-200">
                      <X size={12}/> Cancel
                    </button>
                    <button onClick={handleSave} disabled={saving}
                      className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold
                        text-white bg-gradient-to-r from-gray-800 to-gray-900 dark:from-white/90 dark:to-white/80 dark:text-gray-900
                        hover:from-gray-700 hover:to-gray-800 dark:hover:from-white dark:hover:to-white/90
                        shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 hover:scale-105">
                      {saving
                        ? <><svg className="animate-spin w-3 h-3" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                          </svg> Saving…</>
                        : <><Save size={12}/> Save Changes</>
                      }
                    </button>
                  </>
                ) : (
                  <button onClick={() => setEditing(true)}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold
                      text-gray-600 dark:text-gray-300
                      bg-gray-100 dark:bg-white/[0.06]
                      hover:bg-gray-200 dark:hover:bg-white/10
                      border border-gray-200 dark:border-white/[0.08]
                      hover:scale-105 transition-all duration-200 group">
                    <Pencil size={12} className="group-hover:rotate-12 transition-transform"/> Edit Profile
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ── Stats row with enhanced icons ── */}
        <div className="grid grid-cols-3 gap-3">
          <Stat label="Role" value={accent.tag} icon={Award} />
          <Stat label="Since" value={memberSince} icon={Calendar} />
          <Stat label="Status" value="Active" icon={BadgeCheck} />
        </div>

        {/* ── Personal info with enhanced styling ── */}
        <div className="profile-card rounded-3xl bg-white dark:bg-gray-900/95
          border border-gray-100 dark:border-white/[0.07] 
          shadow-lg hover:shadow-xl transition-all duration-300 p-6 sm:p-8 space-y-4">

          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-gray-700 dark:text-gray-300 font-display flex items-center gap-2">
              <User size={14} className="text-orange-500" />
              Personal Information
            </h2>
            {editing && (
              <p className="text-xs text-gray-400 dark:text-gray-500 flex items-center gap-1">
                <ShieldCheck size={10} />
                Email cannot be changed
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field
              label="Full Name" name="name" value={form.name} type="text"
              editing={editing} onChange={handleChange} icon={User}
              error={errors.name}/>
            <Field
              label="Email Address" name="email" value={form.email} type="email"
              editing={editing} onChange={handleChange} icon={Mail} locked
              error={errors.email}/>
            <Field
              label="Contact Number" name="phone" value={form.phone} type="tel"
              editing={editing} onChange={handleChange} icon={Phone}
              error={errors.phone}/>
            <Field
              label="Role" name="role" value={accent.tag} type="text"
              editing={false} onChange={() => {}} icon={Shield} locked/>
          </div>

          {/* Validation hint with animation */}
          {editing && (
            <div className="mt-2 p-3 rounded-xl bg-gradient-to-r from-gray-50 to-gray-100 dark:from-white/[0.03] dark:to-white/[0.01] 
              border border-gray-100 dark:border-white/[0.05] animate-fade-slide-up">
              <p className="text-xs text-gray-400 dark:text-gray-500 space-y-1">
                <span className="block flex items-center gap-1">• <Sparkles size={8}/> Name: letters and spaces only, no numbers or special characters</span>
                <span className="block flex items-center gap-1">• <Sparkles size={8}/> Phone: must start with 07 and be exactly 10 digits (e.g. 0771234567)</span>
              </p>
            </div>
          )}
        </div>

        {/* ── Account details with enhanced design ── */}
        <div className="profile-card rounded-3xl bg-white dark:bg-gray-900/95
          border border-gray-100 dark:border-white/[0.07] 
          shadow-lg hover:shadow-xl transition-all duration-300 p-6 sm:p-8">

          <h2 className="text-sm font-bold text-gray-700 dark:text-gray-300 font-display mb-4 flex items-center gap-2">
            <ShieldCheck size={14} className="text-orange-500" />
            Account Details
          </h2>

          <div className="space-y-0">
            {[
              { label: "Member Since",    value: memberSince, icon: Calendar },
              { label: "Account Status",  value: "Active & Verified", icon: BadgeCheck },
              { label: "Portal Access",   value: accent.portal, icon: ShieldCheck },
            ].map(({ label, value, icon: Icon }, i, arr) => (
              <div key={label}
                className={`flex items-center justify-between py-3 group
                  hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors duration-200 px-2 -mx-2 rounded-lg
                  ${i < arr.length - 1 ? "border-b border-gray-50 dark:border-white/[0.04]" : ""}`}>
                <span className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2">
                  <Icon size={12} className="text-gray-400 dark:text-gray-500 group-hover:text-orange-500 transition-colors" />
                  {label}
                </span>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1">
                  {value}
                  {label === "Account Status" && <Check size={12} className="text-green-500" />}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer with subtle animation */}
        <p className="text-center text-[10px] text-gray-300 dark:text-gray-700 font-mono pt-2 animate-fade-slide-up">
          Assetra v1.0.0 · IT3030 PAF 2026
        </p>
      </div>
    </>
  );
}