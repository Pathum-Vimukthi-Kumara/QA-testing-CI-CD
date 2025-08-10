import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar, Nav, Container, Card, Form, Button, Alert, Table, Badge, Modal } from 'react-bootstrap';
import { officerAPI, violationAPI, adminAPI } from '../../utils/api';
import '../../styles/officer-dashboard.css';

const OfficerDashboard = () => {
    const [officer, setOfficer] = useState(null);
    const [violations, setViolations] = useState([]);
    const [searchResult, setSearchResult] = useState(null);
    const [loading, setLoading] = useState(true);
    const [searchLoading, setSearchLoading] = useState(false);
    const [submitLoading, setSubmitLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [licenseSearch, setLicenseSearch] = useState('');
    const [showUserProfileModal, setShowUserProfileModal] = useState(false);
    const [showViolationModal, setShowViolationModal] = useState(false);
    const [selectedUserProfile, setSelectedUserProfile] = useState(null);
    const [selectedViolation, setSelectedViolation] = useState(null);
    const [userViolations, setUserViolations] = useState([]);

    const [violationForm, setViolationForm] = useState({
        violation_type: '',
        violation_description: '',
        fine_amount: '',
        citizen_name: ''
    });
    const navigate = useNavigate();

    const violationTypes = [
        'Speeding',
        'Running Red Light',
        'Illegal Parking',
        'Reckless Driving',
        'DUI/DWI',
        'No License',
        'Expired License',
        'No Insurance',
        'Illegal Turn',
        'Other'
    ];

    useEffect(() => {
        fetchOfficerData();
        fetchViolations();
    }, []);

    const fetchOfficerData = async () => {
        try {
            const response = await officerAPI.getProfile();
            setOfficer(response.data);
        } catch (error) {
            console.error('Error fetching officer data:', error);
        }
    };

    const fetchViolations = async () => {
        try {
            const response = await officerAPI.getViolations();
            setViolations(response.data);
        } catch (error) {
            console.error('Error fetching violations:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    const handleLicenseSearch = async (e) => {
        e.preventDefault();
        if (!licenseSearch.trim()) return;
        
        setSearchLoading(true);
        setError('');
        setSearchResult(null);

        try {
            const response = await officerAPI.searchUser(licenseSearch.trim());
            setSearchResult(response.data);
        } catch (error) {
            setError(error.response?.data?.message || 'User not found with this license number');
        } finally {
            setSearchLoading(false);
        }
    };

    const handleViolationSubmit = async (e) => {
        e.preventDefault();
        if (!searchResult) {
            setError('Please search for a user first');
            return;
        }

        setSubmitLoading(true);
        setError('');
        setSuccess('');

        try {
            let violationData;
            
            if (searchResult.is_registered) {
                violationData = {
                    user_id: searchResult.user_id,
                    ...violationForm
                };
            } else {
                violationData = {
                    driving_license_number: searchResult.driving_license_number,
                    citizen_name: violationForm.citizen_name || 'Unknown',
                    ...violationForm
                };
            }

            await violationAPI.create(violationData);
            
            if (searchResult.is_registered) {
                setSuccess('Violation filed successfully for registered citizen!');
            } else {
                setSuccess('Violation filed successfully! The citizen will see this violation when they register.');
            }
            
            // Reset form
            setViolationForm({
                violation_type: '',
                violation_description: '',
                fine_amount: '',
                citizen_name: ''
            });
            setSearchResult(null);
            setLicenseSearch('');
            
            // Refresh violations list
            fetchViolations();
        } catch (error) {
            setError(error.response?.data?.message || 'Failed to file violation');
        } finally {
            setSubmitLoading(false);
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
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-LK', {
            style: 'currency',
            currency: 'LKR'
        }).format(amount);
    };

    const handleViewUserProfile = async (userId) => {
        try {
            const response = await adminAPI.getUserProfile(userId);
            setSelectedUserProfile(response.data.user);
            setUserViolations(response.data.violations || []);
            setShowUserProfileModal(true);
        } catch (error) {
            setError('Failed to load user profile');
        }
    };

    const handleCloseUserProfileModal = () => {
        setShowUserProfileModal(false);
        setSelectedUserProfile(null);
        setUserViolations([]);
    };

    const handleViewViolationDetails = (violation) => {
        setSelectedViolation(violation);
        setShowViolationModal(true);
    };

    const handleCloseViolationModal = () => {
        setShowViolationModal(false);
        setSelectedViolation(null);
    };

    if (loading) {
        return (
            <div className="loading-container">
                <div className="loading-spinner"></div>
            </div>
        );
    }

    return (
        <div className="officer-dashboard">
            <Navbar expand="lg" className="officer-navbar">
                <Container>
                    <Navbar.Brand>
                        <i className="fas fa-shield-alt me-2"></i>
                        Officer Dashboard
                    </Navbar.Brand>
                    <Navbar.Toggle aria-controls="basic-navbar-nav" />
                    <Navbar.Collapse id="basic-navbar-nav">
                        <Nav className="ms-auto">
                            <Nav.Link onClick={handleLogout} style={{ cursor: 'pointer' }}>
                                <i className="fas fa-sign-out-alt me-1"></i>
                                Logout
                            </Nav.Link>
                        </Nav>
                    </Navbar.Collapse>
                </Container>
            </Navbar>

            <div className="officer-content">
                <Container>
                    {/* Officer Header */}
                    <div className="officer-header">
                        <div className="officer-title">
                            <h1>
                                <i className="fas fa-shield-alt"></i>
                                Traffic Officer Dashboard
                            </h1>
                            <div className="officer-info">
                                <i className="fas fa-user-circle"></i>
                                Officer {officer?.name || 'Loading...'}
                            </div>
                        </div>
                    </div>

                    {/* Stats Row */}
                    <div className="officer-stats-row">
                        <Card className="officer-stat-card">
                            <Card.Body>
                                <div className="officer-stat-icon">
                                    <i className="fas fa-exclamation-triangle"></i>
                                </div>
                                <div className="officer-stat-number">{violations.length}</div>
                                <div className="officer-stat-label">Total Violations Filed</div>
                            </Card.Body>
                        </Card>
                        
                        <Card className="officer-stat-card">
                            <Card.Body>
                                <div className="officer-stat-icon">
                                    <i className="fas fa-clock"></i>
                                </div>
                                <div className="officer-stat-number">
                                    {violations.filter(v => v.payment_status === 'Pending').length}
                                </div>
                                <div className="officer-stat-label">Pending Payments</div>
                            </Card.Body>
                        </Card>
                        
                        <Card className="officer-stat-card">
                            <Card.Body>
                                <div className="officer-stat-icon">
                                    <i className="fas fa-check-circle"></i>
                                </div>
                                <div className="officer-stat-number">
                                    {violations.filter(v => v.payment_status === 'Paid').length}
                                </div>
                                <div className="officer-stat-label">Resolved Violations</div>
                            </Card.Body>
                        </Card>
                        
                        <Card className="officer-stat-card">
                            <Card.Body>
                                <div className="officer-stat-icon">
                                    <i className="fas fa-money-bill-wave"></i>
                                </div>
                                <div className="officer-stat-number">
                                    {violations.reduce((sum, v) => sum + (v.payment_status === 'Paid' ? parseFloat(v.fine_amount) : 0), 0).toFixed(0)}
                                </div>
                                <div className="officer-stat-label">Total Fines Collected (LKR)</div>
                            </Card.Body>
                        </Card>
                    </div>

                    {/* Dashboard Grid */}
                    <div className="dashboard-grid">
                        {/* License Search */}
                        <div className="license-search-section">
                            <h3>
                                <i className="fas fa-search"></i>
                                License Verification
                            </h3>
                            
                            <Form onSubmit={handleLicenseSearch} className="search-form">
                                <Form.Control
                                    type="text"
                                    placeholder="Enter License Number (e.g., L001234567)"
                                    value={licenseSearch}
                                    onChange={(e) => setLicenseSearch(e.target.value)}
                                    required
                                />
                                <Button type="submit" className="search-btn" disabled={searchLoading}>
                                    {searchLoading ? (
                                        <>
                                            <i className="fas fa-spinner fa-spin me-1"></i>
                                            Searching...
                                        </>
                                    ) : (
                                        <>
                                            <i className="fas fa-search me-1"></i>
                                            Search
                                        </>
                                    )}
                                </Button>
                            </Form>

                            {/* Search Results */}
                            {searchResult && (
                                <div className="search-results">
                                    <div className="user-info-card">
                                        <h5 className="mb-3">
                                            {searchResult.is_registered ? (
                                                <><i className="fas fa-check-circle text-success me-2"></i>Registered Driver</>
                                            ) : (
                                                <><i className="fas fa-exclamation-triangle text-warning me-2"></i>Unregistered Driver</>
                                            )}
                                        </h5>
                                        
                                        <div className="user-info-grid">
                                            <div className="user-info-item">
                                                <label>License Number</label>
                                                <span>{searchResult.driving_license_number}</span>
                                            </div>
                                            {searchResult.is_registered && (
                                                <>
                                                    <div className="user-info-item">
                                                        <label>Name</label>
                                                        <span>{searchResult.name}</span>
                                                    </div>
                                                    <div className="user-info-item">
                                                        <label>Email</label>
                                                        <span>{searchResult.email}</span>
                                                    </div>
                                                    <div className="user-info-item">
                                                        <label>Phone</label>
                                                        <span>{searchResult.phone_number}</span>
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                        
                                        {searchResult.previous_violations && searchResult.previous_violations.length > 0 && (
                                            <div className="mt-3">
                                                <small className="text-muted">
                                                    <i className="fas fa-history me-1"></i>
                                                    {searchResult.previous_violations.length} previous violation(s) on record
                                                </small>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Quick Actions */}
                        <div className="quick-actions-section">
                            <h3>
                                <i className="fas fa-bolt"></i>
                                Quick Actions
                            </h3>
                            
                            <div className="quick-actions">
                                <a href="#license-search" className="quick-action-btn">
                                    <i className="fas fa-search"></i>
                                    <span>Verify License</span>
                                </a>
                                
                                <a href="#recent-violations" className="quick-action-btn">
                                    <i className="fas fa-list"></i>
                                    <span>View Violations</span>
                                </a>
                                
                                <a href="#new-violation" className="quick-action-btn">
                                    <i className="fas fa-plus-circle"></i>
                                    <span>File Violation</span>
                                </a>
                                
                                <a href="#reports" className="quick-action-btn">
                                    <i className="fas fa-chart-bar"></i>
                                    <span>Reports</span>
                                </a>
                            </div>
                        </div>
                    </div>

                    {/* Violation Form */}
                    {searchResult && (
                        <div className="license-search-section" id="new-violation">
                            <h3>
                                <i className="fas fa-file-alt"></i>
                                File New Violation
                            </h3>
                            
                            <Form onSubmit={handleViolationSubmit}>
                                <div className="row g-3 mb-3">
                                    {!searchResult.is_registered && (
                                        <div className="col-md-6">
                                            <Form.Group>
                                                <Form.Label>Citizen Name</Form.Label>
                                                <Form.Control
                                                    type="text"
                                                    placeholder="Enter citizen's full name"
                                                    value={violationForm.citizen_name}
                                                    onChange={(e) => setViolationForm({
                                                        ...violationForm,
                                                        citizen_name: e.target.value
                                                    })}
                                                    required={!searchResult.is_registered}
                                                />
                                            </Form.Group>
                                        </div>
                                    )}
                                    
                                    <div className="col-md-6">
                                        <Form.Group>
                                            <Form.Label>Violation Type</Form.Label>
                                            <Form.Select
                                                value={violationForm.violation_type}
                                                onChange={(e) => setViolationForm({
                                                    ...violationForm,
                                                    violation_type: e.target.value
                                                })}
                                                required
                                            >
                                                <option value="">Select violation type</option>
                                                {violationTypes.map((type) => (
                                                    <option key={type} value={type}>{type}</option>
                                                ))}
                                            </Form.Select>
                                        </Form.Group>
                                    </div>

                                    <div className="col-md-6">
                                        <Form.Group>
                                            <Form.Label>Fine Amount (LKR)</Form.Label>
                                            <Form.Control
                                                type="number"
                                                step="0.01"
                                                min="0"
                                                placeholder="Enter fine amount"
                                                value={violationForm.fine_amount}
                                                onChange={(e) => setViolationForm({
                                                    ...violationForm,
                                                    fine_amount: e.target.value
                                                })}
                                                required
                                            />
                                        </Form.Group>
                                    </div>
                                </div>

                                <Form.Group className="mb-3">
                                    <Form.Label>Violation Description</Form.Label>
                                    <Form.Control
                                        as="textarea"
                                        rows={3}
                                        placeholder="Provide detailed description of the violation..."
                                        value={violationForm.violation_description}
                                        onChange={(e) => setViolationForm({
                                            ...violationForm,
                                            violation_description: e.target.value
                                        })}
                                        required
                                    />
                                </Form.Group>

                                <Button
                                    type="submit"
                                    className="search-btn"
                                    disabled={submitLoading}
                                >
                                    {submitLoading ? (
                                        <>
                                            <i className="fas fa-spinner fa-spin me-1"></i>
                                            Filing Violation...
                                        </>
                                    ) : (
                                        <>
                                            <i className="fas fa-file-alt me-1"></i>
                                            File Violation
                                        </>
                                    )}
                                </Button>
                            </Form>
                        </div>
                    )}

                    {/* Alerts */}
                    {error && (
                        <Alert variant="danger" dismissible onClose={() => setError('')}>
                            <i className="fas fa-exclamation-circle me-2"></i>
                            {error}
                        </Alert>
                    )}
                    
                    {success && (
                        <Alert variant="success" dismissible onClose={() => setSuccess('')}>
                            <i className="fas fa-check-circle me-2"></i>
                            {success}
                        </Alert>
                    )}

                    {/* Recent Violations */}
                    <div className="recent-violations-section" id="recent-violations">
                        <h3>
                            <i className="fas fa-history"></i>
                            Recent Violations Filed ({violations.length})
                        </h3>
                        
                        {violations.length === 0 ? (
                            <div className="text-center py-5">
                                <i className="fas fa-inbox fa-3x text-muted mb-3"></i>
                                <p className="text-muted">No violations filed yet.</p>
                            </div>
                        ) : (
                            <div className="table-responsive">
                                <Table striped hover>
                                    <thead>
                                        <tr>
                                            <th>Date</th>
                                            <th>Driver</th>
                                            <th>License</th>
                                            <th>Violation</th>
                                            <th>Fine Amount</th>
                                            <th>Status</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {violations.slice(0, 10).map((violation) => (
                                            <tr key={violation.violation_id}>
                                                <td>{formatDate(violation.violation_date)}</td>
                                                <td>
                                                    <div>
                                                        <strong>{violation.user_name || violation.citizen_name}</strong>
                                                        {violation.user_status === 'Unregistered' && (
                                                            <div>
                                                                <Badge bg="warning" className="mt-1">Unregistered</Badge>
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>
                                                <td><code>{violation.driving_license_number}</code></td>
                                                <td>
                                                    <div>
                                                        <strong>{violation.violation_type}</strong>
                                                        {violation.violation_description && (
                                                            <div>
                                                                <small className="text-muted">
                                                                    {violation.violation_description.length > 50
                                                                        ? `${violation.violation_description.substring(0, 50)}...`
                                                                        : violation.violation_description
                                                                    }
                                                                </small>
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>
                                                <td><strong>{formatCurrency(violation.fine_amount)}</strong></td>
                                                <td>
                                                    <Badge 
                                                        bg={violation.payment_status === 'Paid' ? 'success' : 'warning'}
                                                    >
                                                        {violation.payment_status}
                                                    </Badge>
                                                </td>
                                                <td>
                                                    <div className="action-buttons">
                                                        <Button
                                                            variant="outline-info"
                                                            size="sm"
                                                            onClick={() => handleViewViolationDetails(violation)}
                                                            className="me-1"
                                                        >
                                                            <i className="fas fa-eye"></i>
                                                        </Button>
                                                        {violation.user_id && (
                                                            <Button
                                                                variant="outline-primary"
                                                                size="sm"
                                                                onClick={() => handleViewUserProfile(violation.user_id)}
                                                            >
                                                                <i className="fas fa-user"></i>
                                                            </Button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </Table>
                                <div className="mobile-scroll-hint">
                                    Swipe to see more <i className="fas fa-arrow-right"></i>
                                </div>
                            </div>
                        )}
                    </div>
                </Container>
            </div>

            {/* Modals */}
            <Modal show={showViolationModal} onHide={handleCloseViolationModal} size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>Violation Details</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {selectedViolation && (
                        <div>
                            <h5>Violation #{selectedViolation.violation_id}</h5>
                            <p><strong>Date:</strong> {formatDate(selectedViolation.violation_date)}</p>
                            <p><strong>Type:</strong> {selectedViolation.violation_type}</p>
                            <p><strong>Description:</strong> {selectedViolation.violation_description}</p>
                            <p><strong>Fine Amount:</strong> {formatCurrency(selectedViolation.fine_amount)}</p>
                            <p><strong>Status:</strong> <Badge bg={selectedViolation.payment_status === 'Paid' ? 'success' : 'warning'}>{selectedViolation.payment_status}</Badge></p>
                        </div>
                    )}
                </Modal.Body>
            </Modal>

            <Modal show={showUserProfileModal} onHide={handleCloseUserProfileModal} size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>User Profile</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {selectedUserProfile && (
                        <div>
                            <h5>{selectedUserProfile.name}</h5>
                            <p><strong>License:</strong> {selectedUserProfile.driving_license_number}</p>
                            <p><strong>Email:</strong> {selectedUserProfile.email}</p>
                            <p><strong>Phone:</strong> {selectedUserProfile.phone_number}</p>
                            {userViolations.length > 0 && (
                                <div>
                                    <h6>Violations ({userViolations.length})</h6>
                                    <Table size="sm">
                                        <thead>
                                            <tr>
                                                <th>Date</th>
                                                <th>Type</th>
                                                <th>Fine</th>
                                                <th>Status</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {userViolations.map((violation) => (
                                                <tr key={violation.violation_id}>
                                                    <td>{formatDate(violation.violation_date)}</td>
                                                    <td>{violation.violation_type}</td>
                                                    <td>{formatCurrency(violation.fine_amount)}</td>
                                                    <td>
                                                        <Badge bg={violation.payment_status === 'Paid' ? 'success' : 'warning'}>
                                                            {violation.payment_status}
                                                        </Badge>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </Table>
                                </div>
                            )}
                        </div>
                    )}
                </Modal.Body>
            </Modal>
        </div>
    );
};

export default OfficerDashboard;
