import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../../shared/context/AuthContext";
import { useTheme } from "../../shared/context/ThemeContext";
import { Sun, Moon } from "lucide-react";

const API = import.meta.env.VITE_API_BASE_URL;

const ROLE_CONFIG = {
  user: {
    label: "User", sub: "Students, Teachers & Staff",
    iconBg: "bg-orange-500", btnClass: "bg-orange-500 hover:bg-orange-600 shadow-orange-500/25",
    borderFocus: "focus:border-orange-500/50", glowClass: "via-orange-500/30",
    showOAuth: true,
    icon: <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>,
  },
  technician: {
    label: "Technician", sub: "Maintenance & Support Staff",
    iconBg: "bg-blue-500", btnClass: "bg-blue-500 hover:bg-blue-600 shadow-blue-500/25",
    borderFocus: "focus:border-blue-500/50", glowClass: "via-blue-500/30",
    showOAuth: false,
    icon: <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg>,
  },
  admin: {
    label: "Admin", sub: "System Administrators",
    iconBg: "bg-purple-600", btnClass: "bg-purple-600 hover:bg-purple-700 shadow-purple-500/25",
    borderFocus: "focus:border-purple-500/50", glowClass: "via-purple-500/30",
    showOAuth: false,
    icon: <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>,
  },
};

export default function RoleLoginPage() {
  const { role } = useParams();
  const navigate = useNavigate();
  const { login } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const config = ROLE_CONFIG[role] || ROLE_CONFIG.user;

  const [form, setForm] = useState({ email: "", password: "" });
  const [showPassword, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => { setForm({ ...form, [e.target.name]: e.target.value }); setError(""); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) { setError("Please fill in all fields."); return; }
    setLoading(true);
    try {
      const { data } = await axios.post(`${API}/auth/login`, form);
      const expectedRole = role.toUpperCase();
      if (data.role !== expectedRole) {
        setError(`This account is not registered as ${config.label}. Please use the correct login portal.`);
        return;
      }
      login(data.token, { id: data.id, name: data.name, email: data.email, role: data.role, picture: data.picture });
      if (data.role === "ADMIN") navigate("/admin/dashboard", { replace: true });
      else if (data.role === "TECHNICIAN") navigate("/technician/dashboard", { replace: true });
      else navigate("/user/dashboard", { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = () => { window.location.href = `${API}/oauth2/authorization/google`; };
  const handleGithub = () => { window.location.href = `${API}/oauth2/authorization/github`; };

  return (
    <div className="min-h-screen bg-white dark:bg-[#0a0a0f] flex items-center justify-center px-4 py-12 relative overflow-hidden transition-colors duration-300">
      <div className="fixed inset-0 pointer-events-none">
        <div className={`absolute top-1/3 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full blur-3xl opacity-10
          ${role === "admin" ? "bg-purple-500" : role === "technician" ? "bg-blue-500" : "bg-orange-500"}`}/>
      </div>

     

      <div className="w-full max-w-md relative z-10">
        <Link to="/login" className="inline-flex items-center gap-2 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white text-sm mb-8 transition-colors">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
          </svg>
          Back to Login Portal
        </Link>

        <div className="relative">
          <div className={`absolute -inset-0.5 bg-gradient-to-r from-transparent ${config.glowClass} to-transparent rounded-2xl blur-sm opacity-50`}/>
          <div className="relative bg-gray-50 dark:bg-[#0f0f1a] border border-gray-200 dark:border-white/10 rounded-2xl p-8 shadow-2xl transition-colors duration-300">
            <div className={`absolute top-0 left-8 right-8 h-px bg-gradient-to-r from-transparent ${config.glowClass} to-transparent`}/>

            <div className="text-center mb-8">
              <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl ${config.iconBg} mb-4 shadow-lg`}>
                {config.icon}
              </div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                <span className="text-gray-400 font-normal">{config.label}</span> Login
              </h1>
              <p className="text-gray-500 text-sm mt-1">{config.sub}</p>
              {!config.showOAuth && (
                <p className="text-gray-500 dark:text-gray-600 text-xs mt-2 bg-gray-100 dark:bg-white/5 rounded-lg px-3 py-2">
                  Staff accounts are created by the system administrator. Contact your admin if you don't have credentials.
                </p>
              )}
            </div>

            {/* OAuth — only for users */}
            {config.showOAuth && (
              <>
                <div className="flex gap-3 mb-6">
                  <button onClick={handleGoogle}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 hover:border-orange-500/30 transition-all text-sm text-gray-700 dark:text-gray-300 font-medium">
                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    Google
                  </button>
                  <button onClick={handleGithub}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 hover:border-orange-500/30 transition-all text-sm text-gray-700 dark:text-gray-300 font-medium">
                    <svg className="w-4 h-4 text-gray-900 dark:text-white" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2C6.477 2 2 6.477 2 12c0 4.418 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.342-3.369-1.342-.454-1.155-1.11-1.463-1.11-1.463-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0 1 12 6.836a9.59 9.59 0 0 1 2.504.337c1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.202 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.163 22 16.418 22 12c0-5.523-4.477-10-10-10z"/>
                    </svg>
                    GitHub
                  </button>
                </div>
                <div className="flex items-center gap-3 mb-6">
                  <div className="flex-1 h-px bg-gray-200 dark:bg-white/10"/>
                  <span className="text-gray-400 dark:text-gray-500 text-xs">or sign in with email</span>
                  <div className="flex-1 h-px bg-gray-200 dark:bg-white/10"/>
                </div>
              </>
            )}

            {error && (
              <div className="mb-4 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center gap-2">
                <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm text-gray-500 dark:text-gray-400 mb-1.5 block">Email Address</label>
                <div className="relative">
                  <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                  </svg>
                  <input type="email" name="email" value={form.email} onChange={handleChange}
                    placeholder="name@domain.com"
                    className={`w-full bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl py-3 pl-10 pr-4 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 text-sm focus:outline-none ${config.borderFocus} transition-all`}/>
                </div>
              </div>

              <div>
                <label className="text-sm text-gray-500 dark:text-gray-400 mb-1.5 block">Password</label>
                <div className="relative">
                  <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path strokeLinecap="round" strokeLinejoin="round" d="M7 11V7a5 5 0 0110 0v4"/>
                  </svg>
                  <input type={showPassword ? "text" : "password"} name="password" value={form.password} onChange={handleChange}
                    placeholder="Enter your password"
                    className={`w-full bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl py-3 pl-10 pr-10 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 text-sm focus:outline-none ${config.borderFocus} transition-all`}/>
                  <button type="button" onClick={() => setShow(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition">
                    {showPassword
                      ? <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"/></svg>
                      : <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
                    }
                  </button>
                </div>
              </div>

              <button type="submit" disabled={loading}
                className={`w-full py-3 rounded-xl text-white font-semibold text-sm shadow-lg transition-all duration-200 mt-2 relative overflow-hidden group disabled:opacity-50 disabled:cursor-not-allowed ${config.btnClass}`}>
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"/>
                {loading
                  ? <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                      </svg>
                      Signing in...
                    </span>
                  : `Sign in as ${config.label}`
                }
              </button>
            </form>

            {role === "user" && (
              <p className="text-center text-gray-500 text-sm mt-6">
                Don't have an account?{" "}
                <Link to="/register" className="text-orange-400 hover:text-orange-300 font-medium transition">
                  Create one here
                </Link>
              </p>
            )}

            <div className={`absolute bottom-0 left-8 right-8 h-px bg-gradient-to-r from-transparent ${config.glowClass} to-transparent`}/>
          </div>
        </div>
        <p className="text-center text-gray-400 dark:text-gray-600 text-xs mt-6">Assetra © 2026 · Smart Campus Operations Hub</p>
      </div>
    </div>
  );
}