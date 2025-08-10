import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar, Nav, Container, Table, Badge, Button, Modal } from 'react-bootstrap';
import { userAPI } from '../../utils/api';
import '../../styles/user-dashboard.css';

const UserDashboard = () => {
    const [user, setUser] = useState(null);
    const [violations, setViolations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedViolation, setSelectedViolation] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [stats, setStats] = useState({
        total: 7,
        pending: 1,
        paid: 6
    });
    const navigate = useNavigate();

    useEffect(() => {
        fetchUserData();
        fetchViolations();
    }, []);

    const fetchUserData = async () => {
        try {
            const response = await userAPI.getProfile();
            setUser(response.data);
        } catch (error) {
            console.error('Error fetching user data:', error);
        }
    };
    const fetchViolations = async () => {
        try {                                                   
            const response = await userAPI.getViolations();
            setViolations(response.data);
            setStats({
                total: response.data.length,



                pending: response.data.filter(v => v.payment_status === 'Pending').length,
                paid: response.data.filter(v => v.payment_status === 'Paid').length                     


            });
            setLoading(false);
        } catch (error) {
            console.error('Error fetching violations:', error);
            setLoading(false);
        }
    };
    // Handle logout and redirect to login page

   
        
            
          

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    const handlePayViolation = (violationId) => {
        navigate(`/payment/${violationId}`);
    };

    const handleViewViolation = (violation) => {
        setSelectedViolation(violation);
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setSelectedViolation(null);
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const formatCurrency = (amount) => {
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
        <div className="dashboard-container">
            <Navbar expand="lg" className="navbar">
                <Container>
                    <Navbar.Brand>
                        <i className="fas fa-user me-2"></i>
                        Citizen
                    </Navbar.Brand>
                    <Navbar.Toggle aria-controls="basic-navbar-nav" />
                    <Navbar.Collapse id="basic-navbar-nav">
                        <Nav className="ms-auto">
                            <Nav.Link onClick={handleLogout} style={{ cursor: 'pointer' }}>
                                Logout
                            </Nav.Link>
                        </Nav>
                    </Navbar.Collapse>
                </Container>
            </Navbar>

            <div className="dashboard-content">
                <Container>
                    {/* Welcome Section */}
                    <div className="welcome-section">
                        <h2>Welcome back, {user?.name || 'pathum'}!</h2>
                        <p>Here's an overview of your driving license status and violations.</p>
                    </div>

                    {/* Stats Cards */}
                    <div className="stats-cards">
                        <div className="stat-card total">
                            <h3>{stats.total}</h3>
                            <p>Total 
                                      Violations</p>
                        </div>
                        <div className="stat-card pending">
                            <h3>{stats.pending}</h3>
                            <p>Pending Payments</p>
                        </div>
                        <div className="stat-card paid">
                            <h3>{stats.paid}</h3>
                            <p>Paid Violations</p>
                        </div>
                    </div>

                    {/* Profile Section */}
                    <div className="profile-section" id="profile">
                        <div className="profile-header">
                            <div className="profile-avatar">
                                {(user?.name || 'P').charAt(0).toUpperCase()}
                            </div>
                            <div className="profile-info">
                                <h4>{user?.name || 'pathum'}</h4>
                                <p>License: {user?.driving_license_number || 'L001234568'}</p>
                            </div>
                        </div>
                        <div className="profile-details">
                            <div className="detail-item">
                                <label>Email</label>
                                <span>{user?.email || 'netadmin@admin.com'}</span>
                            </div>
                            <div className="detail-item">
                                <label>Date of Birth</label>
                                <span>{user?.date_of_birth ? new Date(user.date_of_birth).toLocaleDateString() : '6/20/2025'}</span>
                            </div>
                            <div className="detail-item">
                                <label>Address</label>
                                <span>{user?.address || 'Balpatiya, Galle District'}</span>
                            </div>
                        </div>
                    </div>

                    {/* Violations Section */}
                    <div className="violations-section" id="violations">
                        <div className="section-header">
                            <h3>My Violations</h3>
                        </div>
                        
                        {violations.length === 0 ? (
                            <div className="no-violations">
                                <i className="fas fa-check-circle"></i>
                                <h4>No Violations Found</h4>
                                <p>You have a clean driving record!</p>
                            </div>
                        ) : (
                            <div className="table-responsive">
                                <Table className="table">
                                    <thead>
                                        <tr>
                                            <th>Date</th>
                                            <th>Violation</th>
                                            <th>Description</th>
                                            <th>Fine amount</th>
                                            <th>Status</th>
                                            <th>Officer</th>
                                            <th>Payment</th>
                                            <th>Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {violations.map((violation) => (
                                            <tr key={violation.violation_id}>
                                                <td>{new Date(violation.violation_date).toLocaleDateString('en-US', {
                                                    month: 'short',
                                                    day: 'numeric',
                                                    year: 'numeric'
                                                })}<br />{new Date(violation.violation_date).toLocaleTimeString('en-US', {
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })}</td>
                                                <td><strong>{violation.violation_type}</strong></td>
                                                <td>{violation.violation_description}</td>
                                                <td><strong>{formatCurrency(violation.fine_amount)}</strong></td>
                                                <td>
                                                    {violation.payment_status === 'Paid' ? (
                                                        <Badge bg="success">Paid</Badge>
                                                    ) : violation.payment_status === 'Pending' && violation.payment_submitted ? (
                                                        <Badge bg="info">Pending Approval</Badge>
                                                    ) : violation.payment_status === 'Pending' ? (
                                                        <Badge bg="warning">Pending</Badge>
                                                    ) : (
                                                        <Badge bg="secondary">{violation.payment_status}</Badge>
                                                    )}
                                                </td>
                                                <td>{violation.officer_name}</td>
                                                <td>
                                                    {violation.payment_status === 'Paid' ? (
                                                        <span className="text-success">Paid {formatCurrency(violation.fine_amount)}</span>
                                                    ) : (
                                                        <span className="text-warning">Pending</span>
                                                    )}
                                                </td>
                                                <td>
                                                    <div className="d-flex gap-1">
                                                        <Button
                                                            size="sm"
                                                            variant="outline-info"
                                                            onClick={() => handleViewViolation(violation)}
                                                            style={{ fontSize: '0.7rem', padding: '0.25rem 0.5rem' }}
                                                        >
                                                            View
                                                        </Button>
                                                        {violation.payment_status === 'Pending' && (
                                                            <Button
                                                                size="sm"
                                                                variant="outline-primary"
                                                                onClick={() => handlePayViolation(violation.violation_id)}
                                                                style={{ fontSize: '0.7rem', padding: '0.25rem 0.5rem' }}
                                                            >
                                                                Pay
                                                            </Button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </Table>
                            </div>
                        )}
                    </div>
                </Container>
            </div>

            {/* Violation Details Modal */}
            <Modal show={showModal} onHide={handleCloseModal} size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>Violation Details</Modal.Title>
                </Modal.Header>
                <Modal.Body>
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
                                        {selectedViolation.payment_status === 'Paid' ? (
                                            <Badge bg="success" className="fs-6 px-3 py-2">Paid</Badge>
                                        ) : selectedViolation.payment_status === 'Pending' && selectedViolation.payment_submitted ? (
                                            <Badge bg="info" className="fs-6 px-3 py-2">Pending Approval</Badge>
                                        ) : selectedViolation.payment_status === 'Pending' ? (
                                            <Badge bg="warning" className="fs-6 px-3 py-2">Pending</Badge>
                                        ) : (
                                            <Badge bg="secondary" className="fs-6 px-3 py-2">{selectedViolation.payment_status}</Badge>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Main Information Grid */}
                            <div className="row mb-4">
                                <div className="col-md-6">
                                    <div className="info-card">
                                        <h6 className="info-card-title">🚗 Your Information</h6>
                                        <div className="info-item">
                                            <span className="info-label">Name:</span>
                                            <span className="info-value">{user?.name}</span>
                                        </div>
                                        <div className="info-item">
                                            <span className="info-label">License Number:</span>
                                            <span className="info-value">{selectedViolation.driving_license_number || user?.driving_license_number}</span>
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
                                <div className="row">
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
                        </div>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    {selectedViolation && selectedViolation.payment_status === 'Pending' && (
                        <Button
                            variant="primary"
                            onClick={() => {
                                handleCloseModal();
                                handlePayViolation(selectedViolation.violation_id);
                            }}
                        >
                            Pay This Violation
                        </Button>
                    )}
                    <Button variant="secondary" onClick={handleCloseModal}>
                        Close
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default UserDashboard;
