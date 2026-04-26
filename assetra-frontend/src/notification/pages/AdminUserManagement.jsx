// src/pages/admin/AdminUserManagement.jsx
import { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { useAuth } from "../../shared/context/AuthContext";

const API = import.meta.env.VITE_API_BASE_URL;

const ROLE_STYLES = {
  ADMIN:      { label: "Admin",      cls: "bg-purple-500/15 text-purple-400 border-purple-500/30" },
  TECHNICIAN: { label: "Technician", cls: "bg-blue-500/15 text-blue-400 border-blue-500/30" },
  USER:       { label: "User",       cls: "bg-orange-500/15 text-orange-400 border-orange-500/30" },
};

const EMPTY_STAFF_FORM = {
  name: "", email: "", phone: "", password: "", role: "TECHNICIAN",
};

function RoleBadge({ role }) {
  const s = ROLE_STYLES[role] ?? ROLE_STYLES.USER;
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${s.cls}`}>
      {s.label}
    </span>
  );
}

function Avatar({ name, pictureUrl }) {
  if (pictureUrl) return (
    <img src={pictureUrl} alt={name}
      className="w-9 h-9 rounded-full object-cover border border-white/10 flex-shrink-0"/>
  );
  return (
    <div className="w-9 h-9 rounded-full bg-orange-500/20 border border-orange-500/30 flex items-center justify-center flex-shrink-0">
      <span className="text-orange-400 text-sm font-bold">{name?.[0]?.toUpperCase() ?? "?"}</span>
    </div>
  );
}

export default function AdminUserManagement() {
  const { token } = useAuth();
  const authHeader = { Authorization: `Bearer ${token}` };

  const [users, setUsers]             = useState([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState("");
  const [search, setSearch]           = useState("");
  const [roleFilter, setRoleFilter]   = useState("ALL");
  const [showModal, setShowModal]     = useState(false);
  const [staffForm, setStaffForm]     = useState(EMPTY_STAFF_FORM);
  const [formErrors, setFormErrors]   = useState({});
  const [creating, setCreating]       = useState(false);
  const [createError, setCreateError] = useState("");
  const [createSuccess, setCreateSuccess] = useState("");
  const [deleteTarget, setDeleteTarget]   = useState(null);
  const [deleting, setDeleting]           = useState(false);

  // ✅ FIXED — was outside the component before, causing the crash
  const [showStaffPassword, setShowStaffPassword] = useState(false);

  // ── Fetch users ──
  const fetchUsers = async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await axios.get(`${API}/users`, { headers: authHeader });
      setUsers(data);
    } catch {
      setError("Failed to load users. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  // ── Filtered + searched list ──
  const filtered = useMemo(() => {
    return users.filter((u) => {
      const matchRole   = roleFilter === "ALL" || u.role === roleFilter;
      const q           = search.toLowerCase();
      const matchSearch = !q ||
        u.name?.toLowerCase().includes(q) ||
        u.email?.toLowerCase().includes(q) ||
        u.phone?.toLowerCase().includes(q);
      return matchRole && matchSearch;
    });
  }, [users, search, roleFilter]);

  // ── Stats ──
  const stats = useMemo(() => ({
    total:       users.length,
    users:       users.filter(u => u.role === "USER").length,
    technicians: users.filter(u => u.role === "TECHNICIAN").length,
    admins:      users.filter(u => u.role === "ADMIN").length,
  }), [users]);

  // ── Validate staff form ──
  const validateStaff = () => {
    const e = {};
    if (!staffForm.name.trim())  e.name = "Name is required";
    else if (/\d/.test(staffForm.name)) e.name = "Name cannot contain numbers";
    else if (/[^a-zA-Z\s]/.test(staffForm.name)) e.name = "Name cannot contain special characters";

    if (!staffForm.email.trim()) e.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(staffForm.email)) e.email = "Invalid email";

    if (!staffForm.phone.trim()) e.phone = "Phone is required";
    else if (!/^07\d{8}$/.test(staffForm.phone.replace(/\s/g, ""))) e.phone = "Must start with 07 and be exactly 10 digits";

    if (!staffForm.password)     e.password = "Password is required";
    else if (staffForm.password.length < 6)      e.password = "Min 6 characters";
    else if (!/[A-Z]/.test(staffForm.password))  e.password = "Must have an uppercase letter";
    else if (!/[0-9]/.test(staffForm.password))  e.password = "Must have a number";
    return e;
  };

  // ── Create staff ──
  const handleCreateStaff = async (e) => {
    e.preventDefault();
    setCreateError("");
    setCreateSuccess("");
    const errs = validateStaff();
    if (Object.keys(errs).length) { setFormErrors(errs); return; }
    setCreating(true);
    try {
      await axios.post(`${API}/users/create-staff`, staffForm, { headers: authHeader });
      setCreateSuccess(`${staffForm.role === "TECHNICIAN" ? "Technician" : "Admin"} account created successfully!`);
      setStaffForm(EMPTY_STAFF_FORM);
      setFormErrors({});
      fetchUsers();
      setTimeout(() => { setShowModal(false); setCreateSuccess(""); }, 1800);
    } catch (err) {
      setCreateError(err.response?.data?.message || "Failed to create account.");
    } finally {
      setCreating(false);
    }
  };

  // ── Delete user ──
  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await axios.delete(`${API}/users/${deleteTarget.id}`, { headers: authHeader });
      setUsers(prev => prev.filter(u => u.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch {
      alert("Failed to delete user.");
    } finally {
      setDeleting(false);
    }
  };

  // ── Input style helper ──
  const inputCls = (hasErr) =>
    `w-full bg-gray-50 dark:bg-white/5 border rounded-xl py-2.5 pl-3 pr-4 text-sm
     text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600
     focus:outline-none transition-all duration-200
     ${hasErr
       ? "border-red-400 dark:border-red-500/50"
       : "border-gray-200 dark:border-white/10 focus:border-orange-500/60 dark:focus:border-orange-500/50"}`;

  return (
    <div className="space-y-6">

      {/* ── Page header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">User Management</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-0.5">
            Manage all registered users, technicians, and administrators.
          </p>
        </div>
        <button
          onClick={() => { setShowModal(true); setCreateError(""); setCreateSuccess(""); setFormErrors({}); }}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600
                     text-white text-sm font-semibold shadow-lg shadow-orange-500/25
                     transition-all duration-200 hover:shadow-orange-500/40 self-start sm:self-auto">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4"/>
          </svg>
          Add Staff Account
        </button>
      </div>

      {/* ── Stats row ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Users",    value: stats.total,       color: "text-gray-900 dark:text-white" },
          { label: "Regular Users",  value: stats.users,       color: "text-orange-500" },
          { label: "Technicians",    value: stats.technicians, color: "text-blue-500" },
          { label: "Admins",         value: stats.admins,      color: "text-purple-500" },
        ].map(s => (
          <div key={s.label}
            className="rounded-xl border border-gray-200 dark:border-white/8 bg-white dark:bg-gray-900/50 p-4">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{s.label}</p>
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* ── Search + filter ── */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
            fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <circle cx="11" cy="11" r="8"/>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35"/>
          </svg>
          <input type="text" placeholder="Search by name, email, or phone..."
            value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-white/10
                       bg-white dark:bg-gray-900/50 text-gray-900 dark:text-white
                       placeholder-gray-400 dark:placeholder-gray-500 text-sm
                       focus:outline-none focus:border-orange-500/60 dark:focus:border-orange-500/50 transition-all"/>
        </div>

        <div className="flex gap-2 flex-wrap">
          {["ALL", "USER", "TECHNICIAN", "ADMIN"].map(r => (
            <button key={r} onClick={() => setRoleFilter(r)}
              className={`px-4 py-2.5 rounded-xl text-sm font-medium border transition-all duration-200
                ${roleFilter === r
                  ? "bg-orange-500 border-orange-500 text-white shadow-md shadow-orange-500/25"
                  : "bg-white dark:bg-gray-900/50 border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-400 hover:border-orange-400/50"
                }`}>
              {r === "ALL" ? "All Roles" : r[0] + r.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      {/* ── Users table ── */}
      <div className="rounded-2xl border border-gray-200 dark:border-white/8 bg-white dark:bg-gray-900/50 overflow-hidden">

        <div className="grid grid-cols-[2fr_2fr_1.2fr_1fr_80px] gap-4 px-5 py-3
                        border-b border-gray-100 dark:border-white/8
                        bg-gray-50 dark:bg-white/[0.03]">
          {["Name", "Email", "Phone", "Role", ""].map((h, i) => (
            <span key={i} className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
              {h}
            </span>
          ))}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <svg className="animate-spin w-6 h-6 text-orange-500" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
            </svg>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center gap-2 py-16 text-red-400 text-sm">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            {error}
            <button onClick={fetchUsers} className="ml-2 underline hover:text-red-300">Retry</button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-2">
            <svg className="w-10 h-10 text-gray-300 dark:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0"/>
            </svg>
            <p className="text-gray-400 dark:text-gray-500 text-sm">No users found</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-white/5">
            {filtered.map(u => (
              <div key={u.id}
                className="grid grid-cols-[2fr_2fr_1.2fr_1fr_80px] gap-4 px-5 py-4 items-center
                           hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors duration-150">
                <div className="flex items-center gap-3 min-w-0">
                  <Avatar name={u.name} pictureUrl={u.pictureUrl}/>
                  <span className="text-sm font-medium text-gray-900 dark:text-white truncate">{u.name}</span>
                </div>
                <span className="text-sm text-gray-500 dark:text-gray-400 truncate">{u.email}</span>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {u.phone || <span className="text-gray-300 dark:text-gray-600 italic">—</span>}
                </span>
                <RoleBadge role={u.role}/>
                <button onClick={() => setDeleteTarget(u)}
                  className="inline-flex items-center justify-center w-8 h-8 rounded-lg
                             text-gray-400 dark:text-gray-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10
                             transition-all duration-200">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <polyline points="3 6 5 6 21 6"/>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6m5 0V4h4v2"/>
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}

        {!loading && !error && (
          <div className="px-5 py-3 border-t border-gray-100 dark:border-white/8 bg-gray-50/50 dark:bg-white/[0.01]">
            <p className="text-xs text-gray-400 dark:text-gray-500">
              Showing {filtered.length} of {users.length} users
            </p>
          </div>
        )}
      </div>

      {/* ══ Create Staff Modal ══ */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowModal(false)}/>
          <div className="relative w-full max-w-md bg-white dark:bg-gray-900 rounded-2xl
                          border border-gray-200 dark:border-white/10 shadow-2xl animate-scale-in">
            <div className="absolute top-0 left-8 right-8 h-px bg-gradient-to-r from-transparent via-orange-500/40 to-transparent"/>

            <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-gray-100 dark:border-white/8">
              <div>
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">Add Staff Account</h2>
                <p className="text-gray-500 dark:text-gray-400 text-xs mt-0.5">Create a Technician or Admin account</p>
              </div>
              <button onClick={() => setShowModal(false)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400
                           hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-white/8 transition">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </button>
            </div>

            <form onSubmit={handleCreateStaff} className="px-6 py-5 space-y-4">

              {/* Role selector */}
              <div>
                <label className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2 block">Account Type</label>
                <div className="flex gap-3">
                  {["TECHNICIAN", "ADMIN"].map(r => (
                    <button key={r} type="button"
                      onClick={() => setStaffForm(f => ({ ...f, role: r }))}
                      className={`flex-1 py-2.5 rounded-xl text-sm font-semibold border transition-all duration-200
                        ${staffForm.role === r
                          ? r === "TECHNICIAN"
                            ? "bg-blue-500 border-blue-500 text-white shadow-md shadow-blue-500/25"
                            : "bg-purple-600 border-purple-600 text-white shadow-md shadow-purple-500/25"
                          : "bg-gray-50 dark:bg-white/5 border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-400"
                        }`}>
                      {r[0] + r.slice(1).toLowerCase()}
                    </button>
                  ))}
                </div>
              </div>

              {/* Name */}
              <div>
                <label className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1.5 block">Full Name</label>
                <input type="text" placeholder="Enter full name"
                  value={staffForm.name}
                  onChange={e => { setStaffForm(f => ({ ...f, name: e.target.value })); setFormErrors(fe => ({ ...fe, name: "" })); }}
                  className={inputCls(!!formErrors.name)}/>
                {formErrors.name && <p className="mt-1 text-xs text-red-500">{formErrors.name}</p>}
              </div>

              {/* Email */}
              <div>
                <label className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1.5 block">Email Address</label>
                <input type="email" placeholder="name@domain.com"
                  value={staffForm.email}
                  onChange={e => { setStaffForm(f => ({ ...f, email: e.target.value })); setFormErrors(fe => ({ ...fe, email: "" })); }}
                  className={inputCls(!!formErrors.email)}/>
                {formErrors.email && <p className="mt-1 text-xs text-red-500">{formErrors.email}</p>}
              </div>

              {/* Phone */}
              <div>
                <label className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1.5 block">Phone Number</label>
                <input type="tel" placeholder="0771234567"
                  value={staffForm.phone}
                  onChange={e => { setStaffForm(f => ({ ...f, phone: e.target.value })); setFormErrors(fe => ({ ...fe, phone: "" })); }}
                  className={inputCls(!!formErrors.phone)}/>
                {formErrors.phone && <p className="mt-1 text-xs text-red-500">{formErrors.phone}</p>}
              </div>

              {/* Password */}
              <div>
                <label className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1.5 block">Password</label>
                <div className="relative">
                  <input
                    type={showStaffPassword ? "text" : "password"}
                    placeholder="Min 6 chars, 1 uppercase, 1 number"
                    value={staffForm.password}
                    onChange={e => { setStaffForm(f => ({ ...f, password: e.target.value })); setFormErrors(fe => ({ ...fe, password: "" })); }}
                    className={inputCls(!!formErrors.password) + " pr-10"}/>
                  <button type="button" onClick={() => setShowStaffPassword(p => !p)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition">
                    {showStaffPassword
                      ? <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"/></svg>
                      : <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
                    }
                  </button>
                </div>
                {formErrors.password && <p className="mt-1 text-xs text-red-500">{formErrors.password}</p>}
              </div>

              {createError && (
                <div className="px-4 py-3 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 text-sm">
                  {createError}
                </div>
              )}
              {createSuccess && (
                <div className="px-4 py-3 rounded-xl bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-500/20 text-green-600 dark:text-green-400 text-sm flex items-center gap-2">
                  <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
                  </svg>
                  {createSuccess}
                </div>
              )}

              <div className="flex gap-3 pt-1">
                <button type="button" onClick={() => setShowModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-white/10
                             bg-gray-50 dark:bg-white/5 text-gray-600 dark:text-gray-400
                             text-sm font-medium hover:bg-gray-100 dark:hover:bg-white/10 transition">
                  Cancel
                </button>
                <button type="submit" disabled={creating}
                  className="flex-1 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600
                             disabled:opacity-50 disabled:cursor-not-allowed
                             text-white text-sm font-semibold
                             shadow-lg shadow-orange-500/25 transition-all duration-200">
                  {creating
                    ? <span className="flex items-center justify-center gap-2">
                        <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                        </svg>
                        Creating...
                      </span>
                    : "Create Account"
                  }
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ══ Delete Confirm Modal ══ */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setDeleteTarget(null)}/>
          <div className="relative w-full max-w-sm bg-white dark:bg-gray-900 rounded-2xl
                          border border-gray-200 dark:border-white/10 shadow-2xl p-6 animate-scale-in">
            <div className="flex flex-col items-center text-center gap-3">
              <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-500/15 flex items-center justify-center">
                <svg className="w-6 h-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
                </svg>
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-900 dark:text-white">Delete User</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Are you sure you want to delete{" "}
                  <span className="font-semibold text-gray-700 dark:text-gray-200">{deleteTarget.name}</span>?
                  This action cannot be undone.
                </p>
              </div>
              <div className="flex gap-3 w-full mt-2">
                <button onClick={() => setDeleteTarget(null)}
                  className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-white/10
                             bg-gray-50 dark:bg-white/5 text-gray-600 dark:text-gray-400
                             text-sm font-medium hover:bg-gray-100 dark:hover:bg-white/10 transition">
                  Cancel
                </button>
                <button onClick={handleDelete} disabled={deleting}
                  className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-600
                             disabled:opacity-50 text-white text-sm font-semibold
                             shadow-lg shadow-red-500/25 transition-all duration-200">
                  {deleting ? "Deleting..." : "Yes, Delete"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}