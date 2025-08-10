import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar, Nav, Container, Card, Table, Badge, Button, Modal, Form, Alert } from 'react-bootstrap';
import { adminAPI, violationAPI, paymentAPI } from '../../utils/api';
import '../../styles/admin-dashboard.css';
import '../../styles/modal-styles.css';

const AdminDashboard = () => {
    const [stats, setStats] = useState({});
    const [users, setUsers] = useState([]);
    const [officers, setOfficers] = useState([]);
    const [violations, setViolations] = useState([]);
    const [payments, setPayments] = useState([]);    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('dashboard');    const [showOfficerModal, setShowOfficerModal] = useState(false);
    const [showViolationModal, setShowViolationModal] = useState(false);    const [showUserModal, setShowUserModal] = useState(false);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [showUserProfileModal, setShowUserProfileModal] = useState(false);
    const [showDeleteUserModal, setShowDeleteUserModal] = useState(false);
    const [showDeleteOfficerModal, setShowDeleteOfficerModal] = useState(false);
    const [showConfirmPaymentModal, setShowConfirmPaymentModal] = useState(false);
    const [userToDelete, setUserToDelete] = useState(null);
    const [officerToDelete, setOfficerToDelete] = useState(null);
    const [paymentToConfirm, setPaymentToConfirm] = useState(null);
    const [selectedViolation, setSelectedViolation] = useState(null);
    const [selectedUser, setSelectedUser] = useState(null);
    const [selectedPayment, setSelectedPayment] = useState(null);
    const [selectedUserProfile, setSelectedUserProfile] = useState(null);
    const [userViolations, setUserViolations] = useState([]);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [officerForm, setOfficerForm] = useState({
        officer_name: '',
        officer_email: '',
        officer_phone: '',
        password: '',
        role: 'Police Officer'
    });
    const [userForm, setUserForm] = useState({
        name: '',
        email: '',
        phone_number: '',
        driving_license_number: '',
        date_of_birth: '',
        address: ''
    });
    const navigate = useNavigate();

    useEffect(() => {
        // Check if user is admin before fetching data
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        
        if (user.userType !== 'admin' && user.role !== 'admin') {
            setError('You do not have admin privileges to access this dashboard');
            setLoading(false);
            return;
        }
        
        fetchDashboardData();
        fetchUsers();
        fetchOfficers();
        fetchViolations();
        fetchPayments();
    }, []);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            const response = await adminAPI.getDashboard();
            setStats(response.data);
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
            setError('Failed to load dashboard data. Please check your connection and permissions.');
        } finally {
            setLoading(false);
        }
    };

    const fetchUsers = async () => {
        try {
            const response = await adminAPI.getUsers();
            setUsers(response.data);
        } catch (error) {
            console.error('Error fetching users:', error);
        }
    };

    const fetchOfficers = async () => {
        try {
            const response = await adminAPI.getOfficers();
            setOfficers(response.data);
        } catch (error) {
            console.error('Error fetching officers:', error);
        }
    };

    const fetchViolations = async () => {
        try {
            const response = await violationAPI.getAll();
            setViolations(response.data);
        } catch (error) {
            console.error('Error fetching violations:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchPayments = async () => {
        try {
            const response = await paymentAPI.getAll();
            setPayments(response.data);
        } catch (error) {
            console.error('Error fetching payments:', error);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    const handleCreateOfficer = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        try {
            await adminAPI.createOfficer(officerForm);
            setSuccess('Officer created successfully!');
            setShowOfficerModal(false);
            setOfficerForm({
                officer_name: '',
                officer_email: '',
                officer_phone: '',
                password: '',
                role: 'Police Officer'
            });
            fetchOfficers();
        } catch (error) {
            setError(error.response?.data?.message || 'Failed to create officer');
        }
    };    const handleDeleteUserConfirm = (userId) => {
        setUserToDelete(userId);
        setShowDeleteUserModal(true);
    };
    
    const confirmDeleteUser = async () => {
        try {
            await adminAPI.deleteUser(userToDelete);
            setSuccess('User deleted successfully!');
            setShowDeleteUserModal(false);
            fetchUsers();
        } catch (error) {
            setError(error.response?.data?.message || 'Failed to delete user');
        }
    };

    const handleEditUser = (user) => {
        setSelectedUser(user);
        setUserForm({
            name: user.name || '',
            email: user.email || '',
            phone_number: user.phone_number || '',
            driving_license_number: user.driving_license_number || '',
            date_of_birth: user.date_of_birth ? user.date_of_birth.split('T')[0] : '',
            address: user.address || ''
        });
        setShowUserModal(true);
    };

    const handleCloseUserModal = () => {
        setShowUserModal(false);
        setSelectedUser(null);
        setUserForm({
            name: '',
            email: '',
            phone_number: '',
            driving_license_number: '',
            date_of_birth: '',
            address: ''
        });
    };    const handleUpdateUser = async (e) => {
        e.preventDefault();
        try {
            await adminAPI.updateUser(selectedUser.user_id, userForm);
            setSuccess('User updated successfully!');
            handleCloseUserModal();
            fetchUsers();
        } catch (error) {
            setError(error.response?.data?.message || 'Failed to update user');
        }
    };

    const handleViewUserProfile = async (user) => {
        try {
            setSelectedUserProfile(user);
            // Fetch user's violations
            const response = await adminAPI.getUserViolations(user.user_id);
            setUserViolations(response.data);
            setShowUserProfileModal(true);
        } catch (error) {
            setError(error.response?.data?.message || 'Failed to load user profile');
        }
    };

    const handleCloseUserProfileModal = () => {
        setShowUserProfileModal(false);
        setSelectedUserProfile(null);
        setUserViolations([]);
    };

    const handleDeleteOfficerConfirm = (officerId) => {
        setOfficerToDelete(officerId);
        setShowDeleteOfficerModal(true);
    };
    
    const confirmDeleteOfficer = async () => {
        try {
            await adminAPI.deleteOfficer(officerToDelete);
            setSuccess('Officer deleted successfully!');
            setShowDeleteOfficerModal(false);
            fetchOfficers();
        } catch (error) {
            setError(error.response?.data?.message || 'Failed to delete officer');
        }
    };    const handleUpdateViolationStatus = async (violationId, status) => {
        try {
            await violationAPI.updateStatus(violationId, status);
            setSuccess('Violation status updated successfully!');
            fetchViolations();
        } catch (error) {
            setError(error.response?.data?.message || 'Failed to update violation status');
        }
    };

    const handleViewViolation = (violation) => {
        setSelectedViolation(violation);
        setShowViolationModal(true);
    };    const handleCloseViolationModal = () => {
        setShowViolationModal(false);
        setSelectedViolation(null);
    };

    const handleViewPayment = (payment) => {
        setSelectedPayment(payment);
        setShowPaymentModal(true);
    };

    const handleClosePaymentModal = () => {
        setShowPaymentModal(false);
        setSelectedPayment(null);
    };

    const handleConfirmPaymentPrompt = (paymentId) => {
        setPaymentToConfirm(paymentId);
        setShowConfirmPaymentModal(true);
    };
    
    const confirmPayment = async () => {
        try {
            await adminAPI.confirmPayment(paymentToConfirm);
            setSuccess('Payment confirmed successfully!');
            setShowConfirmPaymentModal(false);
            fetchPayments();
            fetchViolations(); // Refresh violations to update status
        } catch (error) {
            setError(error.response?.data?.message || 'Failed to confirm payment');
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-LK', {
            style: 'currency',
            currency: 'LKR'
        }).format(amount);
    };

    if (loading) {
        return (
            <div className="loading-container">
                <div className="loading-spinner"></div>
            </div>
        );
    }

    return (
        <div className="admin-dashboard">
            <Navbar expand="lg" className="admin-navbar">
                <Container>
                    <Navbar.Brand>🏛️ Admin Portal</Navbar.Brand>
                    <Navbar.Toggle aria-controls="basic-navbar-nav" />
                    <Navbar.Collapse id="basic-navbar-nav">
                        <Nav className="ms-auto">
                            <Nav.Link 
                                onClick={() => setActiveTab('dashboard')}
                                className={activeTab === 'dashboard' ? 'active' : ''}
                            >
                                Dashboard
                            </Nav.Link>
                            <Nav.Link 
                                onClick={() => setActiveTab('users')}
                                className={activeTab === 'users' ? 'active' : ''}
                            >
                                Users
                            </Nav.Link>
                            <Nav.Link 
                                onClick={() => setActiveTab('officers')}
                                className={activeTab === 'officers' ? 'active' : ''}
                            >
                                Officers
                            </Nav.Link>
                            <Nav.Link 
                                onClick={() => setActiveTab('violations')}
                                className={activeTab === 'violations' ? 'active' : ''}
                            >
                                Violations
                            </Nav.Link>
                            <Nav.Link 
                                onClick={() => setActiveTab('payments')}
                                className={activeTab === 'payments' ? 'active' : ''}
                            >
                                Payments
                            </Nav.Link>
                            <Nav.Link onClick={handleLogout} style={{ cursor: 'pointer' }}>
                                Logout
                            </Nav.Link>
                        </Nav>
                    </Navbar.Collapse>
                </Container>
            </Navbar>

            <div className="admin-content">
                <Container>
                    {error && <Alert variant="danger" onClose={() => setError('')} dismissible>{error}</Alert>}
                    {success && <Alert variant="success" onClose={() => setSuccess('')} dismissible>{success}</Alert>}

                    {/* Dashboard Tab */}
                    {activeTab === 'dashboard' && (
                        <>
                            <div className="admin-welcome">
                                <h2>Admin Dashboard</h2>
                                <p>Manage users, officers, violations, and payments from this central hub.</p>
                            </div>

                            <div className="admin-stats">
                                <Card className="stat-card">
                                    <Card.Body>
                                        <div className="stat-icon">
                                            <i className="fas fa-user"></i>
                                        </div>
                                        <div className="stat-number">{stats.totalUsers || 0}</div>
                                        <div className="stat-label">{"Total\nUsers"}</div>
                                    </Card.Body>
                                </Card>
                                
                                <Card className="stat-card">
                                    <Card.Body>
                                        <div className="stat-icon">
                                            <i className="fas fa-user-shield"></i>
                                        </div>
                                        <div className="stat-number">{stats.totalOfficers || 0}</div>
                                        <div className="stat-label">{"Total\nOfficers"}</div>
                                    </Card.Body>
                                </Card>
                                
                                <Card className="stat-card">
                                    <Card.Body>
                                        <div className="stat-icon">
                                            <i className="fas fa-file-alt"></i>
                                        </div>
                                        <div className="stat-number">{stats.totalViolations || 0}</div>
                                        <div className="stat-label">{"Total\nViolations"}</div>
                                    </Card.Body>
                                </Card>
                                
                                <Card className="stat-card">
                                    <Card.Body>
                                        <div className="stat-icon">
                                            <i className="fas fa-credit-card"></i>
                                        </div>
                                        <div className="stat-number">{stats.totalPayments || 0}</div>
                                        <div className="stat-label">{"Total\nPayments"}</div>
                                    </Card.Body>
                                </Card>
                                
                                <Card className="stat-card">
                                    <Card.Body>
                                        <div className="stat-icon">
                                            <i className="fas fa-ellipsis-h"></i>
                                        </div>
                                        <div className="stat-number">{stats.pendingPayments || 0}</div>
                                        <div className="stat-label">{"Pending\nPayments"}</div>
                                    </Card.Body>
                                </Card>
                                
                                <Card className="stat-card">
                                    <Card.Body>
                                        <div className="stat-icon">
                                            <i className="fas fa-check"></i>
                                        </div>
                                        <div className="stat-number">{stats.paidPayments || 0}</div>
                                        <div className="stat-label">{"Paid Payments"}</div>
                                    </Card.Body>
                                </Card>
                            </div>
                        </>
                    )}

                    {/* Users Tab */}
                    {activeTab === 'users' && (
                        <div className="admin-section">
                            <div className="section-title">
                                <h3>Users Management ({users.length})</h3>
                            </div>
                            
                            <div className="table-responsive">
                                <Table className="data-table">
                                    <thead>
                                        <tr>
                                            <th>Name</th>
                                            <th>Email</th>
                                            <th>Phone</th>
                                            <th>License Number</th>
                                            <th>Registration Date</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {users.map((user) => (
                                            <tr key={user.user_id}>
                                                <td><strong>{user.name}</strong></td>
                                                <td>{user.email}</td>
                                                <td>{user.phone_number}</td>
                                                <td>{user.driving_license_number}</td>
                                                <td>{formatDate(user.registration_date)}</td>                                                <td>
                                                    <div className="action-buttons">
                                                        <Button
                                                            size="sm"
                                                            variant="outline-success"
                                                            onClick={() => handleViewUserProfile(user)}
                                                            className="me-2"
                                                        >
                                                            View Profile
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            variant="outline-primary"
                                                            onClick={() => handleEditUser(user)}
                                                            className="me-2"
                                                        >
                                                            Edit
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            variant="danger"
                                                            onClick={() => handleDeleteUserConfirm(user.user_id)}
                                                        >
                                                            Delete
                                                        </Button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </Table>
                            </div>
                        </div>
                    )}

                    {/* Officers Tab */}
                    {activeTab === 'officers' && (
                        <div className="admin-section">
                            <div className="section-title">
                                <h3>Officers Management ({officers.length})</h3>
                                <Button
                                    className="btn-admin-primary"
                                    onClick={() => setShowOfficerModal(true)}
                                >
                                    Add New Officer
                                </Button>
                            </div>
                            
                            <div className="table-responsive">
                                <Table className="data-table">
                                    <thead>
                                        <tr>
                                            <th>Name</th>
                                            <th>Email</th>
                                            <th>Phone</th>
                                            <th>Role</th>
                                            <th>Registration Date</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {officers.map((officer) => (
                                            <tr key={officer.officer_id}>
                                                <td><strong>{officer.officer_name}</strong></td>
                                                <td>{officer.officer_email}</td>
                                                <td>{officer.officer_phone}</td>
                                                <td>
                                                    <Badge bg="info">{officer.role}</Badge>
                                                </td>
                                                <td>{formatDate(officer.registration_date)}</td>
                                                <td>
                                                    <div className="action-buttons">
                                                        <Button
                                                            size="sm"
                                                            variant="danger"
                                                            onClick={() => handleDeleteOfficerConfirm(officer.officer_id)}
                                                        >
                                                            Delete
                                                        </Button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </Table>
                            </div>
                        </div>
                    )}

                    {/* Violations Tab */}
                    {activeTab === 'violations' && (
                        <div className="admin-section">
                            <div className="section-title">
                                <h3>Violations Management ({violations.length})</h3>
                            </div>
                            
                            <div className="table-responsive">
                                <Table className="data-table">
                                    <thead>
                                        <tr>
                                            <th>Date</th>
                                            <th>Driver</th>
                                            <th>License</th>
                                            <th>Violation</th>
                                            <th>Officer</th>
                                            <th>Fine</th>
                                            <th>Status</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {violations.map((violation) => (
                                            <tr key={violation.violation_id}>
                                                <td>{formatDate(violation.violation_date)}</td>
                                                <td><strong>{violation.user_name}</strong></td>
                                                <td>{violation.driving_license_number}</td>
                                                <td>
                                                    <div>
                                                        <strong>{violation.violation_type}</strong>
                                                        <br />
                                                        <small className="text-muted">
                                                            {violation.violation_description?.substring(0, 30)}...
                                                        </small>
                                                    </div>
                                                </td>
                                                <td>{violation.officer_name}</td>
                                                <td><strong>{formatCurrency(violation.fine_amount)}</strong></td>
                                                <td>
                                                    <Badge 
                                                        bg={violation.payment_status === 'Paid' ? 'success' : 'warning'}
                                                    >
                                                        {violation.payment_status}
                                                    </Badge>
                                                </td>                                                <td>
                                                    <div className="action-buttons">
                                                        <Button
                                                            size="sm"
                                                            variant="outline-info"
                                                            onClick={() => handleViewViolation(violation)}
                                                            className="me-2"
                                                        >
                                                            View
                                                        </Button>
                                                        {violation.payment_status === 'Pending' && (
                                                            <Button
                                                                size="sm"
                                                                variant="success"
                                                                onClick={() => handleUpdateViolationStatus(violation.violation_id, 'Paid')}
                                                            >
                                                                Mark Paid
                                                            </Button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </Table>
                            </div>
                        </div>
                    )}

                    {/* Payments Tab */}
                    {activeTab === 'payments' && (
                        <div className="admin-section">
                            <div className="section-title">
                                <h3>Payments Management ({payments.length})</h3>
                            </div>
                            
                            <div className="table-responsive">
                                <Table className="data-table">                                    <thead>
                                        <tr>
                                            <th>Payment Date</th>
                                            <th>Driver</th>
                                            <th>License</th>
                                            <th>Violation Type</th>
                                            <th>Fine Amount</th>
                                            <th>Payment Amount</th>
                                            <th>Receipt</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {payments.map((payment) => (
                                            <tr key={payment.payment_id}>
                                                <td>{formatDate(payment.payment_date)}</td>
                                                <td><strong>{payment.user_name}</strong></td>
                                                <td>{payment.driving_license_number}</td>
                                                <td>{payment.violation_type}</td>
                                                <td>{formatCurrency(payment.fine_amount)}</td>
                                                <td><strong>{formatCurrency(payment.payment_amount)}</strong></td>                                                <td>
                                                    {payment.receipt_file && (
                                                        <a 
                                                            href={`${process.env.REACT_APP_API_URL}/uploads/receipts/${payment.receipt_file}`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="btn btn-sm btn-outline-primary"
                                                        >
                                                            View Receipt
                                                        </a>
                                                    )}
                                                </td>
                                                <td>
                                                    <div className="action-buttons">
                                                        <Button
                                                            size="sm"
                                                            variant="outline-info"
                                                            onClick={() => handleViewPayment(payment)}
                                                            className="me-2"
                                                        >
                                                            View Details
                                                        </Button>
                                                        {payment.status !== 'Confirmed' && (
                                                            <Button
                                                                size="sm"
                                                                variant="success"
                                                                onClick={() => handleConfirmPaymentPrompt(payment.payment_id)}
                                                            >
                                                                Confirm
                                                            </Button>
                                                        )}
                                                        {payment.status === 'Confirmed' && (
                                                            <Badge bg="success">Confirmed</Badge>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </Table>
                            </div>
                        </div>
                    )}
                </Container>
            </div>

            {/* Create Officer Modal */}
            <Modal show={showOfficerModal} onHide={() => setShowOfficerModal(false)} size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>Create New Officer</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form onSubmit={handleCreateOfficer}>
                        <div className="form-grid">
                            <Form.Group>
                                <Form.Label>Officer Name</Form.Label>
                                <Form.Control
                                    type="text"
                                    value={officerForm.officer_name}
                                    onChange={(e) => setOfficerForm({
                                        ...officerForm,
                                        officer_name: e.target.value
                                    })}
                                    required
                                />
                            </Form.Group>

                            <Form.Group>
                                <Form.Label>Email</Form.Label>
                                <Form.Control
                                    type="email"
                                    value={officerForm.officer_email}
                                    onChange={(e) => setOfficerForm({
                                        ...officerForm,
                                        officer_email: e.target.value
                                    })}
                                    required
                                />
                            </Form.Group>

                            <Form.Group>
                                <Form.Label>Phone</Form.Label>
                                <Form.Control
                                    type="tel"
                                    value={officerForm.officer_phone}
                                    onChange={(e) => setOfficerForm({
                                        ...officerForm,
                                        officer_phone: e.target.value
                                    })}
                                />
                            </Form.Group>

                            <Form.Group>
                                <Form.Label>Role</Form.Label>
                                <Form.Select
                                    value={officerForm.role}
                                    onChange={(e) => setOfficerForm({
                                        ...officerForm,
                                        role: e.target.value
                                    })}
                                >
                                    <option value="Police Officer">Police Officer</option>
                                    <option value="Admin">Admin</option>
                                </Form.Select>
                            </Form.Group>
                        </div>

                        <Form.Group>
                            <Form.Label>Password</Form.Label>
                            <Form.Control
                                type="password"
                                value={officerForm.password}
                                onChange={(e) => setOfficerForm({
                                    ...officerForm,
                                    password: e.target.value
                                })}
                                required
                            />
                        </Form.Group>

                        <Modal.Footer>
                            <Button variant="secondary" onClick={() => setShowOfficerModal(false)}>
                                Cancel
                            </Button>
                            <Button type="submit" className="btn-admin-primary">
                                Create Officer
                            </Button>
                        </Modal.Footer>
                    </Form>                </Modal.Body>            </Modal>

            {/* User Edit Modal */}
            <Modal show={showUserModal} onHide={handleCloseUserModal} size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>Edit User</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form onSubmit={handleUpdateUser}>
                        <div className="row">
                            <div className="col-md-6">
                                <Form.Group className="mb-3">
                                    <Form.Label>Full Name</Form.Label>
                                    <Form.Control
                                        type="text"
                                        value={userForm.name}
                                        onChange={(e) => setUserForm({
                                            ...userForm,
                                            name: e.target.value
                                        })}
                                        required
                                    />
                                </Form.Group>
                            </div>
                            <div className="col-md-6">
                                <Form.Group className="mb-3">
                                    <Form.Label>Email</Form.Label>
                                    <Form.Control
                                        type="email"
                                        value={userForm.email}
                                        onChange={(e) => setUserForm({
                                            ...userForm,
                                            email: e.target.value
                                        })}
                                        required
                                    />
                                </Form.Group>
                            </div>
                        </div>

                        <div className="row">
                            <div className="col-md-6">
                                <Form.Group className="mb-3">
                                    <Form.Label>Phone Number</Form.Label>
                                    <Form.Control
                                        type="tel"
                                        value={userForm.phone_number}
                                        onChange={(e) => setUserForm({
                                            ...userForm,
                                            phone_number: e.target.value
                                        })}
                                        required
                                    />
                                </Form.Group>
                            </div>
                            <div className="col-md-6">
                                <Form.Group className="mb-3">
                                    <Form.Label>Driving License Number</Form.Label>
                                    <Form.Control
                                        type="text"
                                        value={userForm.driving_license_number}
                                        onChange={(e) => setUserForm({
                                            ...userForm,
                                            driving_license_number: e.target.value
                                        })}
                                        required
                                    />
                                </Form.Group>
                            </div>
                        </div>

                        <div className="row">
                            <div className="col-md-6">
                                <Form.Group className="mb-3">
                                    <Form.Label>Date of Birth</Form.Label>
                                    <Form.Control
                                        type="date"
                                        value={userForm.date_of_birth}
                                        onChange={(e) => setUserForm({
                                            ...userForm,
                                            date_of_birth: e.target.value
                                        })}
                                    />
                                </Form.Group>
                            </div>
                            <div className="col-md-6">
                                <Form.Group className="mb-3">
                                    <Form.Label>Address</Form.Label>
                                    <Form.Control
                                        as="textarea"
                                        rows={3}
                                        value={userForm.address}
                                        onChange={(e) => setUserForm({
                                            ...userForm,
                                            address: e.target.value
                                        })}
                                    />
                                </Form.Group>
                            </div>
                        </div>

                        <Modal.Footer>
                            <Button variant="secondary" onClick={handleCloseUserModal}>
                                Cancel
                            </Button>
                            <Button type="submit" variant="primary">
                                Update User
                            </Button>
                        </Modal.Footer>
                    </Form>
                </Modal.Body>            </Modal>

            {/* User Profile Modal */}
            <Modal show={showUserProfileModal} onHide={handleCloseUserProfileModal} size="xl">
                <Modal.Header closeButton>
                    <Modal.Title>User Profile & Violations</Modal.Title>
                </Modal.Header>                <Modal.Body>
                    {selectedUserProfile && (
                        <div className="user-profile-details">
                            {/* Header Section */}
                            <div className="violation-header mb-4">
                                <div className="row align-items-center">
                                    <div className="col-md-8">
                                        <h4 className="text-primary mb-0">{selectedUserProfile.name}</h4>
                                        <small className="text-muted">License: {selectedUserProfile.driving_license_number}</small>
                                    </div>
                                    <div className="col-md-4 text-end">
                                        <Badge 
                                            bg="info"
                                            className="fs-6 px-3 py-2"
                                        >
                                            {userViolations.length} Violations
                                        </Badge>
                                    </div>
                                </div>
                            </div>

                            {/* User Information Cards */}
                            <div className="row mb-4">
                                <div className="col-md-6">
                                    <div className="info-card">
                                        <h6 className="info-card-title">👤 Personal Information</h6>
                                        <div className="info-item">
                                            <span className="info-label">Full Name:</span>
                                            <span className="info-value"><strong>{selectedUserProfile.name}</strong></span>
                                        </div>
                                        <div className="info-item">
                                            <span className="info-label">Email:</span>
                                            <span className="info-value">{selectedUserProfile.email}</span>
                                        </div>
                                        <div className="info-item">
                                            <span className="info-label">Phone:</span>
                                            <span className="info-value">{selectedUserProfile.phone_number}</span>
                                        </div>
                                        <div className="info-item">
                                            <span className="info-label">Date of Birth:</span>
                                            <span className="info-value">
                                                {selectedUserProfile.date_of_birth ? 
                                                    new Date(selectedUserProfile.date_of_birth).toLocaleDateString() : 
                                                    'Not provided'
                                                }
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-md-6">
                                    <div className="info-card">
                                        <h6 className="info-card-title">🚗 License Information</h6>
                                        <div className="info-item">
                                            <span className="info-label">License Number:</span>
                                            <span className="info-value"><strong>{selectedUserProfile.driving_license_number}</strong></span>
                                        </div>
                                        <div className="info-item">
                                            <span className="info-label">Registration Date:</span>
                                            <span className="info-value">{formatDate(selectedUserProfile.registration_date)}</span>
                                        </div>
                                        {selectedUserProfile.address && (
                                            <div className="info-item">
                                                <span className="info-label">Address:</span>
                                                <span className="info-value">{selectedUserProfile.address}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>                            {/* Violations History */}
                            <div className="row mb-4">
                                <div className="col-12">
                                    <div className="info-card">
                                        <h6 className="info-card-title">⚖️ Violations History ({userViolations.length})</h6>
                                        {userViolations.length === 0 ? (
                                            <div className="status-card registered">
                                                <i className="fas fa-check-circle"></i>
                                                <strong>Clean Record:</strong> This user has no violations on record.
                                            </div>
                                        ) : (
                                            <div className="table-responsive mt-3">
                                                <Table className="violation-history-table" size="sm">
                                                    <thead>
                                                        <tr>
                                                            <th>Date</th>
                                                            <th>Type</th>
                                                            <th>Description</th>
                                                            <th>Fine</th>
                                                            <th>Status</th>
                                                            <th>Officer</th>
                                                            <th>Payment</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {userViolations.map((violation) => (
                                                            <tr key={violation.violation_id}>
                                                                <td><small>{formatDate(violation.violation_date)}</small></td>
                                                                <td><strong>{violation.violation_type}</strong></td>
                                                                <td>
                                                                    <div className="violation-desc">
                                                                        <small>{violation.violation_description.length > 40 
                                                                            ? `${violation.violation_description.substring(0, 40)}...`
                                                                            : violation.violation_description
                                                                        }</small>
                                                                    </div>
                                                                </td>
                                                                <td><strong><small>{formatCurrency(violation.fine_amount)}</small></strong></td>
                                                                <td>
                                                                    {violation.payment_status === 'Paid' ? (
                                                                        <Badge bg="success" size="sm">Paid</Badge>
                                                                    ) : violation.payment_submitted ? (
                                                                        <Badge bg="info" size="sm">Pending</Badge>
                                                                    ) : (
                                                                        <Badge bg="warning" size="sm">Unpaid</Badge>
                                                                    )}
                                                                </td>
                                                                <td><small>{violation.officer_name}</small></td>
                                                                <td>
                                                                    {violation.payment_amount ? (
                                                                        <div>
                                                                            <div><strong><small>{formatCurrency(violation.payment_amount)}</small></strong></div>
                                                                            <small className="text-muted" style={{fontSize: '0.7rem'}}>
                                                                                {formatDate(violation.payment_date)}
                                                                            </small>
                                                                            {violation.receipt_file && (
                                                                                <div>
                                                                                    <a 
                                                                                        href={`${process.env.REACT_APP_API_URL}/uploads/receipts/${violation.receipt_file}`}
                                                                                        target="_blank"
                                                                                        rel="noopener noreferrer"
                                                                                        className="btn btn-sm btn-outline-primary mt-1"
                                                                                        style={{fontSize: '0.7rem', padding: '0.25rem 0.5rem'}}
                                                                                    >
                                                                                        Receipt
                                                                                    </a>
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                    ) : (
                                                                        <small className="text-muted">No payment</small>
                                                                    )}
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </Table>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>                            {/* Summary Statistics */}
                            {userViolations.length > 0 && (
                                <div className="row">
                                    <div className="col-12">
                                        <div className="info-card">
                                            <h6 className="info-card-title">📊 Summary Statistics</h6>
                                            <div className="row">
                                                <div className="col-md-3">
                                                    <div className="summary-card">
                                                        <div className="summary-number text-primary">{userViolations.length}</div>
                                                        <div className="summary-label">Total Violations</div>
                                                    </div>
                                                </div>
                                                <div className="col-md-3">
                                                    <div className="summary-card">
                                                        <div className="summary-number text-success">
                                                            {userViolations.filter(v => v.payment_status === 'Paid').length}
                                                        </div>
                                                        <div className="summary-label">Paid</div>
                                                    </div>
                                                </div>
                                                <div className="col-md-3">
                                                    <div className="summary-card">
                                                        <div className="summary-number text-warning">
                                                            {userViolations.filter(v => v.payment_status === 'Pending').length}
                                                        </div>
                                                        <div className="summary-label">Pending</div>
                                                    </div>
                                                </div>
                                                <div className="col-md-3">
                                                    <div className="summary-card">
                                                        <div className="summary-number text-danger" style={{fontSize: '1.2rem'}}>
                                                            {formatCurrency(userViolations.filter(v => v.payment_status === 'Pending').reduce((sum, v) => sum + parseFloat(v.fine_amount), 0))}
                                                        </div>
                                                        <div className="summary-label">Outstanding</div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleCloseUserProfileModal}>
                        Close
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* Payment Details Modal */}
            <Modal show={showPaymentModal} onHide={handleClosePaymentModal} size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>Payment Details</Modal.Title>
                </Modal.Header>                <Modal.Body>
                    {selectedPayment && (
                        <div className="payment-details">
                            {/* Header Section - Payment ID and Status */}
                            <div className="violation-header mb-4">
                                <div className="row align-items-center">
                                    <div className="col-md-6">
                                        <h5 className="text-primary mb-0">Payment #{selectedPayment.payment_id}</h5>
                                        <small className="text-muted">{formatDate(selectedPayment.payment_date)}</small>
                                    </div>
                                    <div className="col-md-6 text-end">
                                        <Badge 
                                            bg={selectedPayment.status === 'Confirmed' ? 'success' : 'warning'}
                                            className="fs-6 px-3 py-2"
                                        >
                                            {selectedPayment.status || 'Pending'}
                                        </Badge>
                                    </div>
                                </div>
                            </div>

                            {/* Main Information Grid */}
                            <div className="row mb-4">
                                <div className="col-md-6">
                                    <div className="info-card">
                                        <h6 className="info-card-title">👤 Driver Information</h6>
                                        <div className="info-item">
                                            <span className="info-label">Name:</span>
                                            <span className="info-value"><strong>{selectedPayment.user_name}</strong></span>
                                        </div>
                                        <div className="info-item">
                                            <span className="info-label">License Number:</span>
                                            <span className="info-value">{selectedPayment.driving_license_number}</span>
                                        </div>
                                        <div className="info-item">
                                            <span className="info-label">Violation Type:</span>
                                            <span className="info-value"><strong>{selectedPayment.violation_type}</strong></span>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-md-6">
                                    <div className="info-card">
                                        <h6 className="info-card-title">💰 Payment Details</h6>
                                        <div className="info-item">
                                            <span className="info-label">Fine Amount:</span>
                                            <span className="info-value text-danger"><strong>{formatCurrency(selectedPayment.fine_amount)}</strong></span>
                                        </div>
                                        <div className="info-item">
                                            <span className="info-label">Payment Amount:</span>
                                            <span className="info-value text-success"><strong>{formatCurrency(selectedPayment.payment_amount)}</strong></span>
                                        </div>
                                        <div className="info-item">
                                            <span className="info-label">Payment Date:</span>
                                            <span className="info-value">{formatDate(selectedPayment.payment_date)}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>                            
                            {/* Description Section */}
                            {selectedPayment.violation_description && (
                                <div className="row mb-4">
                                    <div className="col-12">
                                        <div className="info-card">
                                            <h6 className="info-card-title">📋 Violation Description</h6>
                                            <div className="violation-description-text">
                                                {selectedPayment.violation_description}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Receipt Section */}
                            {selectedPayment.receipt_file && (
                                <div className="row mb-4">
                                    <div className="col-12">
                                        <div className="info-card">
                                            <h6 className="info-card-title">📄 Payment Receipt</h6>
                                            <div className="info-item">
                                                <span className="info-label">Receipt File:</span>
                                                <div className="info-value">
                                                    <div className="receipt-section">
                                                        <a 
                                                            href={`${process.env.REACT_APP_API_URL}/uploads/receipts/${selectedPayment.receipt_file}`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="btn btn-outline-primary btn-sm me-2"
                                                        >
                                                            <i className="fas fa-file-pdf"></i> View Receipt
                                                        </a>
                                                        <a 
                                                            href={`${process.env.REACT_APP_API_URL}/uploads/receipts/${selectedPayment.receipt_file}`}
                                                            download
                                                            className="btn btn-outline-secondary btn-sm"
                                                        >
                                                            <i className="fas fa-download"></i> Download
                                                        </a>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Payment Status Information */}
                            <div className="row">
                                <div className="col-12">
                                    {selectedPayment.fine_amount === selectedPayment.payment_amount ? (
                                        <div className="status-card registered">
                                            <i className="fas fa-check-circle"></i>
                                            <strong>Payment Status:</strong> Full amount paid ({formatCurrency(selectedPayment.payment_amount)})
                                        </div>
                                    ) : selectedPayment.payment_amount < selectedPayment.fine_amount ? (
                                        <div className="status-card unregistered">
                                            <i className="fas fa-exclamation-triangle"></i>
                                            <strong>Payment Status:</strong> Partial payment - Outstanding: {formatCurrency(selectedPayment.fine_amount - selectedPayment.payment_amount)}
                                        </div>
                                    ) : (
                                        <div className="status-card" style={{background: 'linear-gradient(135deg, #cce5ff 0%, #b3d9ff 100%)', border: '1px solid #b3d9ff', color: '#0056b3'}}>
                                            <i className="fas fa-info-circle"></i>
                                            <strong>Payment Status:</strong> Overpaid - Excess: {formatCurrency(selectedPayment.payment_amount - selectedPayment.fine_amount)}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    {selectedPayment && selectedPayment.status !== 'Confirmed' && (
                        <Button
                            variant="success"
                            onClick={() => {
                                handleClosePaymentModal();
                                handleConfirmPaymentPrompt(selectedPayment.payment_id);
                            }}
                        >
                            Confirm Payment
                        </Button>
                    )}
                    <Button variant="secondary" onClick={handleClosePaymentModal}>
                        Close
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* Violation Details Modal */}
            <Modal show={showViolationModal} onHide={handleCloseViolationModal} size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>Violation Details</Modal.Title>
                </Modal.Header>                <Modal.Body>
                    {selectedViolation && (
                        <div className="violation-details">
                            {/* Header Section - Violation ID and Status */}
                            <div className="violation-header mb-4">
                                <div className="row align-items-center">
                                    <div className="col-md-6">
                                        <h5 className="text-primary mb-0">Violation #{selectedViolation.violation_id}</h5>
                                        <small className="text-muted">{formatDate(selectedViolation.violation_date)}</small>
                                    </div>
                                    <div className="col-md-6 text-end">
                                        <Badge 
                                            bg={selectedViolation.payment_status === 'Paid' ? 'success' : 'warning'}
                                            className="fs-6 px-3 py-2"
                                        >
                                            {selectedViolation.payment_status}
                                        </Badge>
                                    </div>
                                </div>
                            </div>

                            {/* Main Information Grid */}
                            <div className="row mb-4">
                                <div className="col-md-6">
                                    <div className="info-card">
                                        <h6 className="info-card-title">🚗 Driver Information</h6>
                                        <div className="info-item">
                                            <span className="info-label">Name:</span>
                                            <span className="info-value">{selectedViolation.user_name || selectedViolation.citizen_name}</span>
                                        </div>
                                        <div className="info-item">
                                            <span className="info-label">License Number:</span>
                                            <span className="info-value">{selectedViolation.driving_license_number}</span>
                                        </div>
                                        {selectedViolation.location && (
                                            <div className="info-item">
                                                <span className="info-label">Location:</span>
                                                <span className="info-value">{selectedViolation.location}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="col-md-6">
                                    <div className="info-card">
                                        <h6 className="info-card-title">⚖️ Violation Details</h6>
                                        <div className="info-item">
                                            <span className="info-label">Type:</span>
                                            <span className="info-value"><strong>{selectedViolation.violation_type}</strong></span>
                                        </div>
                                        <div className="info-item">
                                            <span className="info-label">Fine Amount:</span>
                                            <span className="info-value text-danger"><strong>{formatCurrency(selectedViolation.fine_amount)}</strong></span>
                                        </div>
                                        <div className="info-item">
                                            <span className="info-label">Issued By:</span>
                                            <span className="info-value">{selectedViolation.officer_name}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Description Section */}
                            <div className="row mb-4">
                                <div className="col-12">
                                    <div className="info-card">
                                        <h6 className="info-card-title">📋 Description</h6>
                                        <div className="violation-description-text">
                                            {selectedViolation.violation_description}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Payment Information */}
                            {selectedViolation.payment_date && (
                                <div className="row mb-4">
                                    <div className="col-12">
                                        <div className="payment-info-card">
                                            <h6 className="text-success mb-3">💳 Payment Information</h6>
                                            <div className="row">
                                                <div className="col-md-6">
                                                    <div className="info-item">
                                                        <span className="info-label">Payment Date:</span>
                                                        <span className="info-value">{formatDate(selectedViolation.payment_date)}</span>
                                                    </div>
                                                </div>
                                                <div className="col-md-6">
                                                    <div className="info-item">
                                                        <span className="info-label">Amount Paid:</span>
                                                        <span className="info-value text-success"><strong>{formatCurrency(selectedViolation.fine_amount)}</strong></span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Registration Status */}
                            <div className="row">
                                <div className="col-12">
                                    {selectedViolation.user_id ? (
                                        <div className="status-card registered">
                                            <i className="fas fa-check-circle me-2"></i>
                                            <strong>Registration Status:</strong> Registered User
                                        </div>
                                    ) : (
                                        <div className="status-card unregistered">
                                            <i className="fas fa-exclamation-triangle me-2"></i>
                                            <strong>Registration Status:</strong> Unregistered - Violation filed for license number only
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    {selectedViolation && selectedViolation.payment_status === 'Pending' && (
                        <Button
                            variant="success"
                            onClick={() => {
                                handleCloseViolationModal();
                                handleUpdateViolationStatus(selectedViolation.violation_id, 'Paid');
                            }}
                        >
                            Mark as Paid
                        </Button>
                    )}
                    <Button variant="secondary" onClick={handleCloseViolationModal}>
                        Close
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* Delete User Confirmation Modal */}
            <Modal 
                show={showDeleteUserModal} 
                onHide={() => setShowDeleteUserModal(false)} 
                centered 
                size="sm"
                contentClassName="confirm-modal"
                backdrop="static"
            >
                <Modal.Header closeButton>
                    <Modal.Title>Confirm Delete</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p className="mb-0">Are you sure you want to delete this user?</p>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowDeleteUserModal(false)}>
                        Cancel
                    </Button>
                    <Button variant="danger" onClick={confirmDeleteUser}>
                        OK
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* Delete Officer Confirmation Modal */}
            <Modal 
                show={showDeleteOfficerModal} 
                onHide={() => setShowDeleteOfficerModal(false)} 
                centered 
                size="sm"
                contentClassName="confirm-modal"
                backdrop="static"
            >
                <Modal.Header closeButton>
                    <Modal.Title>Confirm Delete</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p className="mb-0">Are you sure you want to delete this officer?</p>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowDeleteOfficerModal(false)}>
                        Cancel
                    </Button>
                    <Button variant="danger" onClick={confirmDeleteOfficer}>
                        OK
                    </Button>
                </Modal.Footer>
            </Modal>
            
            {/* Confirm Payment Modal */}
            <Modal 
                show={showConfirmPaymentModal} 
                onHide={() => setShowConfirmPaymentModal(false)} 
                centered 
                size="sm"
                contentClassName="confirm-modal"
                backdrop="static"
            >
                <Modal.Header closeButton>
                    <Modal.Title>Confirm Payment</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p className="mb-0">Are you sure you want to confirm this payment?</p>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowConfirmPaymentModal(false)}>
                        Cancel
                    </Button>
                    <Button variant="success" onClick={confirmPayment}>
                        OK
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default AdminDashboard;
