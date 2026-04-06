import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AdminRoute = ({ children }) => {
    const { user, token } = useAuth();
    if (!token) return <Navigate to="/login" />;
    if (user?.role !== 'ADMIN') return <Navigate to="/" />;
    return children;
};

export default AdminRoute;