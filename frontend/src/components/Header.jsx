import React from "react";
import { Navbar, Nav, Container, Button } from "react-bootstrap";
import { useLogoutUserMutation } from "../redux/api/getMeAPI";
import { useNavigate } from "react-router-dom";
import { useAppSelector } from "../redux/store";

const Header = () => {

    const navigate = useNavigate();
    const [logoutUser, { isLoading }] = useLogoutUserMutation();
    const user = useAppSelector((state) => state.userState.user);
    const handleLogout = async () => {
        try {
            await logoutUser().unwrap();
            navigate("/login");
        } catch (err) {
            console.error("Logout error:", err);
        }
    };
    return (
        <Navbar
            bg="white"
            expand="lg"
            className="shadow-sm border-bottom fixed-top"
            style={{ padding: "0.75rem 1rem" }}
        >
            <Container fluid>
                {/* Brand / Logo */}
                <Navbar.Brand
                    href="/"
                    className="fw-bold text-primary"
                    style={{ fontSize: "1.5rem", letterSpacing: "0.5px" }}
                >
                    Project Management
                </Navbar.Brand>

                {/* Mobile Toggle */}
                <Navbar.Toggle aria-controls="main-navbar-nav" />

                <Navbar.Collapse id="main-navbar-nav" className="justify-content-end">
                    {user && user.role == 'admin' && (
                        <Nav className="gap-3">
                            <Nav.Link
                                href="/projects"
                                className="fw-semibold text-dark hover-link"
                            >
                                Projects
                            </Nav.Link>
                            <Nav.Link
                                href="/faculties"
                                className="fw-semibold text-dark hover-link"
                            >
                                Faculties
                            </Nav.Link>
                            <Nav.Link
                                href="/technologies"
                                className="fw-semibold text-dark hover-link"
                            >
                                Technologies
                            </Nav.Link>
                        </Nav>
                    )}
                    {user && (
                        <Button
                            variant="outline-danger"
                            size="sm"
                            className="ms-3 fw-semibold"
                            onClick={handleLogout}
                            disabled={isLoading}
                        >
                            {isLoading ? "Logging out..." : "Logout"}
                        </Button>
                    )}

                    {!user && (
                        <Nav className="gap-3">
                            <Nav.Link
                                href="/login"
                                className="fw-semibold text-dark hover-link"
                            >
                                Login
                            </Nav.Link>
                            <Nav.Link
                                href="/register"
                                className="fw-semibold text-dark hover-link"
                            >
                                Register
                            </Nav.Link>
                        </Nav>
                    )}

                </Navbar.Collapse>
            </Container>
        </Navbar>
    );
};

export default Header;
