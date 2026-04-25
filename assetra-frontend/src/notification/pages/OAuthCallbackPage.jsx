import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../shared/context/AuthContext";

export default function OAuthCallbackPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");

    if (token) {
      fetch(`${import.meta.env.VITE_API_BASE_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(res => res.json())
      .then(data => {
        login(token, {
          id: data.id,
          name: data.name,
          email: data.email,
          role: data.role,
          picture: data.picture,
        });
        const role = data.role?.toLowerCase();
        if (role === "admin") navigate("/admin/dashboard", { replace: true });
        else if (role === "technician") navigate("/technician/dashboard", { replace: true });
        else navigate("/user/dashboard", { replace: true });
      })
      .catch(() => navigate("/login"));
    } else {
      navigate("/login");
    }
  }, [navigate, login]);

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
      <div className="text-center">
        <svg className="animate-spin w-10 h-10 text-orange-500 mx-auto mb-4"
          fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10"
            stroke="currentColor" strokeWidth="4"/>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
        </svg>
        <p className="text-white text-sm">Signing you in...</p>
      </div>
    </div>
  );
}