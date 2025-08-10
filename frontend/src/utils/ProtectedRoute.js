import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, userType }) => {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    if (!token) {
        return <Navigate to="/login" replace />;
    }

    if (userType && user.userType !== userType) {
        // Redirect to appropriate dashboard based on user type
        const redirectMap = {
            user: '/user-dashboard',
            officer: '/officer-dashboard',
            admin: '/admin-dashboard',
        };
        return <Navigate to={redirectMap[user.userType] || '/login'} replace />;
    }

    return children;
};

export default ProtectedRoute;
