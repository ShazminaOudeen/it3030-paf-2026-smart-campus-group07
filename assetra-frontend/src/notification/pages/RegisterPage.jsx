import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

const API = import.meta.env.VITE_API_BASE_URL;

const validateForm = (form) => {
  const errors = {};
  if (!form.name.trim()) {
    errors.name = "Full name is required";
  } else if (/\d/.test(form.name)) {
    errors.name = "Name cannot contain numbers";
  } else if (form.name.trim().length < 2) {
    errors.name = "Name must be at least 2 characters";
  }
  if (!form.email.trim()) {
    errors.email = "Email is required";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
    errors.email = "Enter a valid email (e.g. name@domain.com)";
  }
  if (!form.phone.trim()) {
    errors.phone = "Contact number is required";
  }  else if (!/^07\d{8}$/.test(form.phone)) {
    errors.phone = "Number must start with 07 and be exactly 10 digits";
  }
  if (!form.password) {
    errors.password = "Password is required";
  } else if (form.password.length < 6) {
    errors.password = "Password must be at least 6 characters";
  } else if (!/[A-Z]/.test(form.password)) {
    errors.password = "Password must contain at least one uppercase letter";
  } else if (!/[0-9]/.test(form.password)) {
    errors.password = "Password must contain at least one number";
  }
  if (!form.confirmPassword) {
    errors.confirmPassword = "Please confirm your password";
  } else if (form.password !== form.confirmPassword) {
    errors.confirmPassword = "Passwords do not match";
  }
  return errors;
};

export default function RegisterPage() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [form, setForm] = useState({
    name: "", email: "", phone: "", password: "", confirmPassword: ""
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setFieldErrors({ ...fieldErrors, [e.target.name]: "" });
    setServerError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = validateForm(form);
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }
    setLoading(true);
    try {
      await axios.post(`${API}/auth/register`, {
        name: form.name,
        email: form.email,
        phone: form.phone,
        password: form.password,
      });
      navigate("/login");
    } catch (err) {
      setServerError(err.response?.data?.message || "Registration failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = () => { window.location.href = `${API}/oauth2/authorization/google`; };
  const handleGithub = () => { window.location.href = `${API}/oauth2/authorization/github`; };

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center px-4 py-12">

      {/* Background glow blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-orange-500/8 rounded-full blur-3xl"/>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-indigo-500/8 rounded-full blur-3xl"/>
      </div>

      <div className="w-full max-w-md relative z-10">

        {/* Glowing card */}
        <div className="relative">
          {/* Outer glow ring */}
          <div className="absolute -inset-0.5 bg-gradient-to-r from-orange-500/30 via-orange-300/10 to-orange-500/30 rounded-2xl blur-sm opacity-60"/>

          {/* Card */}
          <div className="relative bg-[#0f0f1a] border border-white/10 rounded-2xl p-8 shadow-2xl">

            {/* Shimmer top line */}
            <div className="absolute top-0 left-8 right-8 h-px bg-gradient-to-r from-transparent via-orange-500/50 to-transparent"/>

            {/* Header */}
            <div className="text-center mb-8">
              <div className="relative inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-orange-500/10 border border-orange-500/20 mb-4">
                <div className="absolute inset-0 rounded-2xl bg-orange-500/5 blur-sm"/>
                <svg className="relative w-7 h-7 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
                  <polyline strokeLinecap="round" strokeLinejoin="round" points="9 22 9 12 15 12 15 22"/>
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-white">Create Account</h1>
              <p className="text-gray-400 text-sm mt-1">Join Assetra Smart Campus Hub</p>
            </div>

            {/* OAuth Buttons */}
            <div className="flex gap-3 mb-6">
              <button onClick={handleGoogle}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl
                           border border-white/10 bg-white/5 hover:bg-white/10
                           hover:border-orange-500/30 hover:shadow-lg hover:shadow-orange-500/10
                           transition-all duration-200 text-sm text-gray-300 font-medium group">
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Google
              </button>
              <button onClick={handleGithub}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl
                           border border-white/10 bg-white/5 hover:bg-white/10
                           hover:border-orange-500/30 hover:shadow-lg hover:shadow-orange-500/10
                           transition-all duration-200 text-sm text-gray-300 font-medium">
                <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.477 2 2 6.477 2 12c0 4.418 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.342-3.369-1.342-.454-1.155-1.11-1.463-1.11-1.463-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0 1 12 6.836a9.59 9.59 0 0 1 2.504.337c1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.202 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.163 22 16.418 22 12c0-5.523-4.477-10-10-10z"/>
                </svg>
                GitHub
              </button>
            </div>

            {/* Divider */}
            <div className="flex items-center gap-3 mb-6">
              <div className="flex-1 h-px bg-white/10"/>
              <span className="text-gray-500 text-xs">or register with email</span>
              <div className="flex-1 h-px bg-white/10"/>
            </div>

            {/* Server Error */}
            {serverError && (
              <div className="mb-4 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center gap-2">
                <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                {serverError}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">

              {/* Full Name */}
              <div>
                <label className="text-sm text-gray-400 mb-1.5 block">Full Name</label>
                <div className={`relative rounded-xl transition-all duration-200 ${fieldErrors.name ? "shadow-sm shadow-red-500/20" : "focus-within:shadow-sm focus-within:shadow-orange-500/20"}`}>
                  <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                  </svg>
                  <input type="text" name="name" value={form.name} onChange={handleChange}
                    placeholder="Enter your full name"
                    className={`w-full bg-white/5 border rounded-xl py-3 pl-10 pr-4 text-white placeholder-gray-600 text-sm focus:outline-none transition-all duration-200
                      ${fieldErrors.name ? "border-red-500/50 focus:border-red-500" : "border-white/10 focus:border-orange-500/50 focus:bg-white/8"}`}/>
                </div>
                {fieldErrors.name && <p className="mt-1 text-xs text-red-400 flex items-center gap-1"><svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"/></svg>{fieldErrors.name}</p>}
              </div>

              {/* Email */}
              <div>
                <label className="text-sm text-gray-400 mb-1.5 block">Email Address</label>
                <div className={`relative rounded-xl transition-all duration-200 ${fieldErrors.email ? "shadow-sm shadow-red-500/20" : "focus-within:shadow-sm focus-within:shadow-orange-500/20"}`}>
                  <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                  </svg>
                  <input type="email" name="email" value={form.email} onChange={handleChange}
                    placeholder="Enter your email"
                    className={`w-full bg-white/5 border rounded-xl py-3 pl-10 pr-4 text-white placeholder-gray-600 text-sm focus:outline-none transition-all duration-200
                      ${fieldErrors.email ? "border-red-500/50 focus:border-red-500" : "border-white/10 focus:border-orange-500/50 focus:bg-white/8"}`}/>
                </div>
                {fieldErrors.email && <p className="mt-1 text-xs text-red-400 flex items-center gap-1"><svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"/></svg>{fieldErrors.email}</p>}
              </div>

              {/* Phone */}
              <div>
                <label className="text-sm text-gray-400 mb-1.5 block">Contact Number</label>
                <div className={`relative rounded-xl transition-all duration-200 ${fieldErrors.phone ? "shadow-sm shadow-red-500/20" : "focus-within:shadow-sm focus-within:shadow-orange-500/20"}`}>
                  <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
                  </svg>
                  <input type="tel" name="phone" value={form.phone} onChange={handleChange}
                    placeholder="+94 77 123 4567"
                    className={`w-full bg-white/5 border rounded-xl py-3 pl-10 pr-4 text-white placeholder-gray-600 text-sm focus:outline-none transition-all duration-200
                      ${fieldErrors.phone ? "border-red-500/50 focus:border-red-500" : "border-white/10 focus:border-orange-500/50 focus:bg-white/8"}`}/>
                </div>
                {fieldErrors.phone && <p className="mt-1 text-xs text-red-400 flex items-center gap-1"><svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"/></svg>{fieldErrors.phone}</p>}
              </div>

              {/* Password */}
              <div>
                <label className="text-sm text-gray-400 mb-1.5 block">Password</label>
                <div className={`relative rounded-xl transition-all duration-200 ${fieldErrors.password ? "shadow-sm shadow-red-500/20" : "focus-within:shadow-sm focus-within:shadow-orange-500/20"}`}>
                  <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path strokeLinecap="round" strokeLinejoin="round" d="M7 11V7a5 5 0 0110 0v4"/>
                  </svg>
                  <input type={showPassword ? "text" : "password"} name="password" value={form.password} onChange={handleChange}
                    placeholder="Min 6 chars, 1 uppercase, 1 number"
                    className={`w-full bg-white/5 border rounded-xl py-3 pl-10 pr-10 text-white placeholder-gray-600 text-sm focus:outline-none transition-all duration-200
                      ${fieldErrors.password ? "border-red-500/50 focus:border-red-500" : "border-white/10 focus:border-orange-500/50 focus:bg-white/8"}`}/>
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition">
                    {showPassword
                      ? <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"/></svg>
                      : <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
                    }
                  </button>
                </div>
                {fieldErrors.password && <p className="mt-1 text-xs text-red-400 flex items-center gap-1"><svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"/></svg>{fieldErrors.password}</p>}
              </div>

              {/* Confirm Password */}
              <div>
                <label className="text-sm text-gray-400 mb-1.5 block">Confirm Password</label>
                <div className={`relative rounded-xl transition-all duration-200 ${fieldErrors.confirmPassword ? "shadow-sm shadow-red-500/20" : "focus-within:shadow-sm focus-within:shadow-orange-500/20"}`}>
                  <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path strokeLinecap="round" strokeLinejoin="round" d="M7 11V7a5 5 0 0110 0v4"/>
                  </svg>
                  <input type={showConfirm ? "text" : "password"} name="confirmPassword" value={form.confirmPassword} onChange={handleChange}
                    placeholder="Re-enter your password"
                    className={`w-full bg-white/5 border rounded-xl py-3 pl-10 pr-10 text-white placeholder-gray-600 text-sm focus:outline-none transition-all duration-200
                      ${fieldErrors.confirmPassword ? "border-red-500/50 focus:border-red-500" : "border-white/10 focus:border-orange-500/50 focus:bg-white/8"}`}/>
                  <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition">
                    {showConfirm
                      ? <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"/></svg>
                      : <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
                    }
                  </button>
                </div>
                {fieldErrors.confirmPassword && <p className="mt-1 text-xs text-red-400 flex items-center gap-1"><svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"/></svg>{fieldErrors.confirmPassword}</p>}
              </div>

              {/* Submit */}
              <button type="submit" disabled={loading}
                className="w-full py-3 rounded-xl bg-orange-500 hover:bg-orange-600
                           disabled:opacity-50 disabled:cursor-not-allowed
                           text-white font-semibold text-sm
                           shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40
                           transition-all duration-200 mt-2 relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-r from-orange-600/0 via-white/10 to-orange-600/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"/>
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                    </svg>
                    Creating Account...
                  </span>
                ) : "Create Account"}
              </button>
            </form>

            <p className="text-center text-gray-500 text-sm mt-6">
              Already have an account?{" "}
              <Link to="/login" className="text-orange-400 hover:text-orange-300 font-medium transition">
                Sign in here
              </Link>
            </p>

            {/* Bottom shimmer line */}
            <div className="absolute bottom-0 left-8 right-8 h-px bg-gradient-to-r from-transparent via-orange-500/30 to-transparent"/>
          </div>
        </div>

        <p className="text-center text-gray-600 text-xs mt-6">
          Assetra © 2026 · Smart Campus Management System
        </p>
      </div>
    </div>
  );
}