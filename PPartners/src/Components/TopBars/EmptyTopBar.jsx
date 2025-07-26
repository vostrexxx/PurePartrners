import { useNavigate } from "react-router-dom";
import { Navbar, Container } from "react-bootstrap";

import logo from "../../Images/logo.png";
import smallLogo from "../../Images/small-logo.png";
import './TopBar.css'

const NotAuthTopBar = () => {
    const navigate = useNavigate();

    return (
        <Navbar
            expand="lg"
            className="shadow-sm TopBar"
        >
            <Container className="d-flex justify-content-between align-items-center">
                <Navbar.Brand onClick={() => navigate("/")} style={{ cursor: "pointer" }}>
                    <img
                        src={logo}
                        alt="Логотип"
                        className="default-logo"
                        style={{ width: "200px", height: "auto", objectFit: "contain" }}
                    />
                    <img
                        src={smallLogo}
                        alt="Маленькое Логотип"
                        className="small-logo"
                        style={{ width: "50px", height: "auto", objectFit: "contain" }}
                    />
                </Navbar.Brand>
            </Container>
        </Navbar>
    );
};

export default NotAuthTopBar;
