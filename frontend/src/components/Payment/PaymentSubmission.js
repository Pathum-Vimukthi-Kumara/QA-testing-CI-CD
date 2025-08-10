import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Card, Form, Button, Alert, Navbar, Nav } from 'react-bootstrap';
import { violationAPI, paymentAPI } from '../../utils/api';
import '../../styles/user-dashboard.css';

const PaymentSubmission = () => {
    const { violationId } = useParams();
    const navigate = useNavigate();
    const [violation, setViolation] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [paymentForm, setPaymentForm] = useState({
        payment_amount: '',
        receipt: null
    });

    useEffect(() => {
        fetchViolation();
    }, [violationId]);

    const fetchViolation = async () => {
        try {
            const response = await violationAPI.getById(violationId);
            setViolation(response.data);
            setPaymentForm(prevForm => ({
                ...prevForm,
                payment_amount: response.data.fine_amount
            }));
        } catch (error) {
            setError('Violation not found or access denied');
        } finally {
            setLoading(false);
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Validate file size (5MB limit)
            if (file.size > 5 * 1024 * 1024) {
                setError('File size must be less than 5MB');
                return;
            }
            
            // Validate file type
            const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
            if (!allowedTypes.includes(file.type)) {
                setError('Only JPEG, PNG, and PDF files are allowed');
                return;
            }
            
            setPaymentForm({
                ...paymentForm,
                receipt: file
            });
            setError('');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!paymentForm.receipt) {
            setError('Please upload a payment receipt');
            return;
        }
        
        if (!paymentForm.payment_amount || paymentForm.payment_amount <= 0) {
            setError('Please enter a valid payment amount');
            return;
        }

        setSubmitting(true);
        setError('');
        setSuccess('');

        try {
            const formData = new FormData();
            formData.append('violation_id', violationId);
            formData.append('payment_amount', paymentForm.payment_amount);
            formData.append('receipt', paymentForm.receipt);

            await paymentAPI.submit(formData);
            setSuccess('Payment submitted successfully! Your payment is under review.');
            
            // Redirect to dashboard after 3 seconds
            setTimeout(() => {
                navigate('/user-dashboard');
            }, 3000);
            
        } catch (error) {
            setError(error.response?.data?.message || 'Failed to submit payment');
        } finally {
            setSubmitting(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
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
                    <Navbar.Brand>🚗 License Tracker</Navbar.Brand>
                    <Navbar.Toggle aria-controls="basic-navbar-nav" />
                    <Navbar.Collapse id="basic-navbar-nav">
                        <Nav className="ms-auto">
                            <Nav.Link onClick={() => navigate('/user-dashboard')}>
                                Back to Dashboard
                            </Nav.Link>
                            <Nav.Link onClick={handleLogout} style={{ cursor: 'pointer' }}>
                                Logout
                            </Nav.Link>
                        </Nav>
                    </Navbar.Collapse>
                </Container>
            </Navbar>

            <div className="dashboard-content">
                <Container>
                    <div className="row justify-content-center">
                        <div className="col-md-8">
                            <Card className="shadow-lg border-0">
                                <Card.Header className="bg-primary text-white">
                                    <h4 className="mb-0">💳 Payment Submission</h4>
                                </Card.Header>
                                <Card.Body className="p-4">
                                    {error && <Alert variant="danger">{error}</Alert>}
                                    {success && <Alert variant="success">{success}</Alert>}

                                    {violation && (
                                        <>
                                            {/* Violation Details */}
                                            <div className="mb-4 p-3 bg-light rounded">
                                                <h5 className="text-primary mb-3">Violation Details</h5>
                                                <div className="row">
                                                    <div className="col-sm-6">
                                                        <p><strong>Violation Type:</strong><br />{violation.violation_type}</p>
                                                    </div>
                                                    <div className="col-sm-6">
                                                        <p><strong>Date:</strong><br />{formatDate(violation.violation_date)}</p>
                                                    </div>
                                                    <div className="col-sm-6">
                                                        <p><strong>Fine Amount:</strong><br /><span className="text-danger fs-5">{formatCurrency(violation.fine_amount)}</span></p>
                                                    </div>
                                                    <div className="col-sm-6">
                                                        <p><strong>Officer:</strong><br />{violation.officer_name}</p>
                                                    </div>
                                                    <div className="col-12">
                                                        <p><strong>Description:</strong><br />{violation.violation_description}</p>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Payment Form */}
                                            <Form onSubmit={handleSubmit}>
                                                <div className="mb-4">
                                                    <h5 className="text-primary mb-3">Payment Information</h5>
                                                    
                                                    <Form.Group className="mb-3">
                                                        <Form.Label>Payment Amount</Form.Label>
                                                        <Form.Control
                                                            type="number"
                                                            step="0.01"
                                                            min="0"
                                                            value={paymentForm.payment_amount}
                                                            onChange={(e) => setPaymentForm({
                                                                ...paymentForm,
                                                                payment_amount: e.target.value
                                                            })}
                                                            placeholder="Enter payment amount"
                                                            required
                                                        />
                                                        <Form.Text className="text-muted">
                                                            Fine amount: {formatCurrency(violation.fine_amount)}
                                                        </Form.Text>
                                                    </Form.Group>

                                                    <Form.Group className="mb-3">
                                                        <Form.Label>Payment Receipt</Form.Label>
                                                        <Form.Control
                                                            type="file"
                                                            accept=".jpg,.jpeg,.png,.pdf"
                                                            onChange={handleFileChange}
                                                            required
                                                        />
                                                        <Form.Text className="text-muted">
                                                            Upload your payment receipt (JPEG, PNG, or PDF, max 5MB)
                                                        </Form.Text>
                                                    </Form.Group>

                                                    {paymentForm.receipt && (
                                                        <div className="mb-3 p-2 bg-success bg-opacity-10 rounded">
                                                            <small className="text-success">
                                                                ✓ File selected: {paymentForm.receipt.name}
                                                            </small>
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="mb-4 p-3 bg-warning bg-opacity-10 rounded">
                                                    <h6 className="text-warning">📋 Important Instructions:</h6>
                                                    <ul className="mb-0 small">
                                                        <li>Ensure the payment amount matches the fine amount</li>
                                                        <li>Upload a clear image or PDF of your payment receipt</li>
                                                        <li>Your payment will be reviewed by the administration</li>
                                                        <li>You will be notified once the payment is verified</li>
                                                    </ul>
                                                </div>

                                                <div className="d-grid gap-2 d-md-flex justify-content-md-end">
                                                    <Button
                                                        variant="outline-secondary"
                                                        onClick={() => navigate('/user-dashboard')}
                                                        disabled={submitting}
                                                    >
                                                        Cancel
                                                    </Button>
                                                    <Button
                                                        type="submit"
                                                        variant="success"
                                                        disabled={submitting}
                                                        className="px-4"
                                                    >
                                                        {submitting ? (
                                                            <>
                                                                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                                                Submitting...
                                                            </>
                                                        ) : (
                                                            '💰 Submit Payment'
                                                        )}
                                                    </Button>
                                                </div>
                                            </Form>
                                        </>
                                    )}
                                </Card.Body>
                            </Card>
                        </div>
                    </div>
                </Container>
            </div>
        </div>
    );
};

export default PaymentSubmission;
