import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Navbar, Nav } from 'react-bootstrap';
import '../../styles/landing-page.css';

const LandingPage = () => {
    const navigate = useNavigate();

    const handleGetStarted = () => {
        navigate('/login');
    };

    const handleRoleSelect = (role) => {
        navigate('/login', { state: { role } });
    };

    return (
        <div className="landing-page">
            {/* Navigation */}
            <Navbar expand="lg" className="navbar" fixed="top">
                <Container>
                    <Navbar.Brand href="#home" className="d-flex align-items-center">
                        <i className="fas fa-car me-2"></i> Driving License Tracker
                    </Navbar.Brand>
                    <Navbar.Toggle aria-controls="basic-navbar-nav" className="navbar-dark" />
                    <Navbar.Collapse id="basic-navbar-nav">
                        <Nav className="ms-auto">
                            <Nav.Link onClick={() => navigate('/login')} className="nav-item px-3">Login</Nav.Link>
                            <Nav.Link onClick={() => navigate('/register')} className="nav-item px-3">Register</Nav.Link>
                        </Nav>
                    </Navbar.Collapse>
                </Container>
            </Navbar>

            {/* Hero Section */}
            <section className="hero-section">
                <Container>
                    <div className="hero-content">
                        <h1 className="hero-title d-flex align-items-center justify-content-center flex-wrap">
                            <i className="fas fa-car hero-icon"></i>
                            <span>Driving License Tracker</span>
                        </h1>
                        <p className="hero-subtitle">
                            Comprehensive license management for citizens and law enforcement
                        </p>
                        <Button 
                            className="cta-button"
                            size="lg"
                            onClick={handleGetStarted}
                        >
                            Get started
                        </Button>
                    </div>
                </Container>
            </section>

            {/* Features Section */}
            <section className="features-section" id="features">
                <Container>
                    
                    
                    <Row className="justify-content-center">
                        {/* Citizens Card */}
                        <Col lg={4} md={6} sm={12} className="mb-4">
                            <Card 
                                className="feature-card h-100 citizen-card"
                                onClick={() => handleRoleSelect('citizen')}
                            >
                                <Card.Body className="text-center mobile-card-body">
                                    <div className="feature-icon mobile-feature-icon">
                                        <i className="fas fa-user"></i>
                                    </div>
                                    <Card.Title className="feature-title mobile-feature-title">
                                        For Citizens
                                    </Card.Title>
                                    <Card.Text className="feature-description mobile-feature-description">
                                        View your driving license information, check violation status, pay fines online, and track your payment history.
                                    </Card.Text>
                                    <ul className="feature-list mobile-feature-list">
                                        <li>View license details</li>
                                        <li>Check violations</li>
                                        <li>Pay fines online</li>
                                        <li>Payment history</li>
                                    </ul>
                                </Card.Body>
                            </Card>
                        </Col>

                        {/* Police Officers Card */}
                        <Col lg={4} md={6} sm={12} className="mb-4">
                            <Card 
                                className="feature-card h-100 officer-card"
                                onClick={() => handleRoleSelect('officer')}
                            >
                                <Card.Body className="text-center mobile-card-body">
                                    <div className="feature-icon mobile-feature-icon">
                                        <i className="fas fa-shield-alt"></i>
                                    </div>
                                    <Card.Title className="feature-title mobile-feature-title">
                                        For Police Officers
                                    </Card.Title>
                                    <Card.Text className="feature-description mobile-feature-description">
                                        Search license holders, record traffic violations, track violation history, and monitor payment status.
                                    </Card.Text>
                                    <ul className="feature-list mobile-feature-list">
                                        <li>Search licenses</li>
                                        <li>Record violations</li>
                                        <li>Track history</li>
                                        <li>Monitor payments</li>
                                    </ul>
                                </Card.Body>
                            </Card>
                        </Col>

                        {/* Security Card */}
                        <Col lg={4} md={6} sm={12} className="mb-4">
                            <Card className="feature-card h-100 security-card">
                                <Card.Body className="text-center mobile-card-body">
                                    <div className="feature-icon mobile-feature-icon">
                                        <i className="fas fa-lock"></i>
                                    </div>
                                    <Card.Title className="feature-title mobile-feature-title">
                                        Secure & Reliable
                                    </Card.Title>
                                    <Card.Text className="feature-description mobile-feature-description">
                                        Built with modern security practices, encrypted data transmission, and reliable cloud infrastructure.
                                    </Card.Text>
                                    <ul className="feature-list mobile-feature-list">
                                        <li>Secure authentication</li>
                                        <li>Encrypted data</li>
                                        <li>Cloud infrastructure</li>
                                        <li>Real-time updates</li>
                                    </ul>
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>
                </Container>
            </section>

            {/* Footer */}
            <footer className="landing-footer">
                <Container>
                    <Row>
                        <Col className="text-center">
                            <p className="footer-text">
                                © 2025 Driving License Tracker. Built for efficient license management.
                            </p>
                            <div className="d-flex justify-content-center mt-2 social-icons">
                                <a href="#" className="mx-2"><i className="fab fa-facebook-f"></i></a>
                                <a href="#" className="mx-2"><i className="fab fa-twitter"></i></a>
                                <a href="#" className="mx-2"><i className="fab fa-instagram"></i></a>
                            </div>
                        </Col>
                    </Row>
                </Container>
            </footer>
        </div>
    );
};

export default LandingPage;
