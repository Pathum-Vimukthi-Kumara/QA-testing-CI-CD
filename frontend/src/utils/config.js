/**
 * Configuration file for frontend URLs and constants
 */

// Base URL for the frontend application
export const BASE_URL = process.env.REACT_APP_BASE_URL || 'http://REACT_APP_BASE_URL';

// Function to generate complete frontend URLs
export const getFrontendURL = (path) => {
    return `${BASE_URL}${path}`;
};

// Common routes
export const ROUTES = {
    HOME: '/',
    LOGIN: '/login',
    REGISTER: '/register',
    USER_DASHBOARD: '/user-dashboard',
    OFFICER_DASHBOARD: '/officer-dashboard',
    ADMIN_DASHBOARD: '/admin-dashboard',
    PAYMENT: (violationId) => `/payment/${violationId}`,
};

export default {
    BASE_URL,
    getFrontendURL,
    ROUTES,
};
