import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './shared/context/AuthContext';
import ProtectedRoute from './shared/routes/ProtectedRoute';
import LoginPage from './notification/pages/LoginPage';
import NotificationsPage from './notification/pages/NotificationsPage';
import NotificationBell from './notification/components/NotificationBell';
import useNotifications from './notification/hooks/useNotifications';

const AppLayout = ({ children }) => {
    const { user, token, logout } = useAuth();
    const { unreadCount } = useNotifications(user?.id, token);

    return (
        <div className="min-h-screen bg-gray-50">
            <nav className="bg-white shadow-sm px-6 py-3 flex justify-between items-center">
                <h1 className="text-xl font-bold text-indigo-700">🏫 Assetra</h1>
                <div className="flex items-center gap-4">
                    <NotificationBell unreadCount={unreadCount} />
                    <div className="flex items-center gap-2">
                        {user?.picture && (
                            <img src={user.picture} alt="avatar" 
                                 className="w-8 h-8 rounded-full" />
                        )}
                        <span className="text-sm font-medium text-gray-700">
                            {user?.name}
                        </span>
                        <button onClick={logout}
                            className="text-xs text-red-500 hover:underline ml-2">
                            Logout
                        </button>
                    </div>
                </div>
            </nav>
            <main className="p-6">{children}</main>
        </div>
    );
};

const OAuthCallback = () => {
    const { login } = useAuth();

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const urlToken = params.get('token');
        if (urlToken) {
            fetch(`${import.meta.env.VITE_API_BASE_URL}/auth/me`, {
                headers: { Authorization: `Bearer ${urlToken}` }
            })
            .then(res => res.json())
            .then(data => {
                login(data, urlToken);
                window.location.href = '/';
            });
        }
    }, []);

    return <div className="text-center py-20">Signing you in...</div>;
};

const AppRoutes = () => {
    const { token } = useAuth();

    return (
        <Routes>
            <Route path="/login" element={
                token ? <Navigate to="/" /> : <LoginPage />
            } />
            <Route path="/oauth-callback" element={<OAuthCallback />} />
            <Route path="/notifications" element={
                <ProtectedRoute>
                    <AppLayout>
                        <NotificationsPageWrapper />
                    </AppLayout>
                </ProtectedRoute>
            } />
            <Route path="/" element={
                <ProtectedRoute>
                    <AppLayout>
                        <HomePage />
                    </AppLayout>
                </ProtectedRoute>
            } />
        </Routes>
    );
};

const NotificationsPageWrapper = () => {
    const { user, token } = useAuth();
    return <NotificationsPage userId={user?.id} token={token} />;
};

const HomePage = () => {
    const { user } = useAuth();
    return (
        <div className="text-center py-20">
            <h2 className="text-2xl font-bold text-gray-700">
                Welcome, {user?.name}! 👋
            </h2>
            <p className="text-gray-400 mt-2">Smart Campus Operations Hub</p>
        </div>
    );
};

const App = () => (
    <BrowserRouter>
        <AuthProvider>
            <AppRoutes />
        </AuthProvider>
    </BrowserRouter>
);

export default App;