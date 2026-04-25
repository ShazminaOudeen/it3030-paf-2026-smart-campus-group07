import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function OAuth2CallbackPage() {
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");

    if (token) {
      localStorage.setItem("token", token);

      // Get user info from token
      fetch(`${import.meta.env.VITE_API_BASE_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(res => res.json())
      .then(data => {
        localStorage.setItem("user", JSON.stringify(data));
        // Redirect based on role
        if (data.role === "ADMIN") {
          navigate("/admin/dashboard");
        } else {
          navigate("/user/dashboard");
        }
      })
      .catch(() => navigate("/login"));
    } else {
      navigate("/login");
    }
  }, [navigate]);

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
      <div className="text-center">
        <svg className="animate-spin w-10 h-10 text-orange-500 mx-auto mb-4"
          fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10"
            stroke="currentColor" strokeWidth="4"/>
          <path className="opacity-75" fill="currentColor"
            d="M4 12a8 8 0 018-8v8z"/>
        </svg>
        <p className="text-white text-sm">Signing you in...</p>
      </div>
    </div>
  );
}