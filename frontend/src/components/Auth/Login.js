import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authAPI } from '../../utils/api';
import '../../styles/auth.css';

const Login = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        userType: 'user'
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await authAPI.login(formData);
            const { token, user } = response.data;

            // Store token and user data
            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(user));

            // Redirect based on user type
            const redirectMap = {
                user: '/user-dashboard',
                officer: '/officer-dashboard',
                admin: '/admin-dashboard'
            };
            
            console.log('Login successful, user info:', user);
            
            // Ensure proper redirect by checking both userType and role
            let dashboardPath = '/user-dashboard'; // default
            
            if (user.userType === 'admin' || user.role === 'admin') {
                dashboardPath = '/admin-dashboard';
            } else if (user.userType === 'officer' || user.role === 'officer') {
                dashboardPath = '/officer-dashboard';
            }
            
            console.log('Redirecting to:', dashboardPath);
            navigate(dashboardPath);
        } catch (error) {
            setError(error.response?.data?.message || 'Login failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="main-container login-container">
            <div className="auth-card login-card mobile-login-card">
                <div className="auth-header">
                    <h2>Welcome Back!</h2>
                    <p>Sign in to your account to continue</p>
                </div>

                {error && (
                    <div className="alert alert-danger">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">User Type</label>
                        <select
                            name="userType"
                            value={formData.userType}
                            onChange={handleChange}
                            className="form-control form-select"
                            required
                        >
                            <option value="user">Citizen</option>
                            <option value="officer">Police Officer</option>
                            <option value="admin">Admin</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Email Address</label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            className="form-control"
                            placeholder="Enter your email"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Password</label>
                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            className="form-control"
                            placeholder="Enter your password"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className="btn-primary"
                        disabled={loading}
                    >
                        {loading && <span className="spinner"></span>}
                        {loading ? 'Signing In...' : 'Sign In'}
                    </button>
                </form>

                <div className="auth-links">
                    <p>Don't have an account? <Link to="/register">Create Account</Link></p>
                </div>
            </div>
        </div>
    );
};

export default Login;
