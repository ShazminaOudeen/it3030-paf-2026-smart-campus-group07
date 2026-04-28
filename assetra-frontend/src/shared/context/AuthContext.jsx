import { createContext, useContext, useState, useEffect } from "react";

const API = import.meta.env.VITE_API_BASE_URL;
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(null);
  const [token,   setToken]   = useState(null);
  const [loading, setLoading] = useState(true);

  const login = (newToken, userData) => {
    localStorage.setItem("token", newToken);
    localStorage.setItem("user", JSON.stringify(userData));
    setToken(newToken);
    setUser(userData);
  };

  const loginWithToken = async (newToken) => {
    localStorage.setItem("token", newToken);
    setToken(newToken);
    try {
      const res  = await fetch(`${API}/auth/me`, {
        headers: { Authorization: `Bearer ${newToken}` }
      });
      const data = await res.json();

      const userData = {
        id:      data.id      || data._id        || data.userId,
        name:    data.name    || data.displayName || data.fullName || data.username,
        email:   data.email   || data.emailAddress,
        role:    data.role    || data.userRole    || "user",
        picture: data.picture || data.pictureUrl  || data.photoURL
                 || data.avatar || data.avatar_url || data.photo || null,
      };

      localStorage.setItem("user", JSON.stringify(userData));
      setUser(userData);
    } catch (err) {
      console.error("loginWithToken failed:", err);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setToken(null);
    setUser(null);
  };

  useEffect(() => {
    const savedToken = localStorage.getItem("token");
    const savedUser  = localStorage.getItem("user");

    if (savedToken && savedUser) {
      try {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
        setLoading(false);
      } catch {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setLoading(false);
      }
    } else if (savedToken && !savedUser) {
      loginWithToken(savedToken).finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, loading, login, loginWithToken, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}