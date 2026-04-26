import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../shared/context/AuthContext";

export default function OAuthCallbackPage() {
  const navigate = useNavigate();
  const { loginWithToken } = useAuth();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token  = params.get("token");
    const role   = params.get("role");

    if (!token) {
      navigate("/login", { replace: true });
      return;
    }

    // Fetch user details and save to localStorage, then redirect
    loginWithToken(token).then(() => {
      switch (role?.toUpperCase()) {
        case "ADMIN":      navigate("/admin/dashboard",      { replace: true }); break;
        case "TECHNICIAN": navigate("/technician/dashboard", { replace: true }); break;
        default:           navigate("/user/dashboard",       { replace: true }); break;
      }
    });
  }, []);

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
      <div className="text-center">
        <svg className="animate-spin w-10 h-10 text-orange-500 mx-auto mb-4"
          fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
        </svg>
        <p className="text-white text-sm">Signing you in...</p>
      </div>
    </div>
  );
}