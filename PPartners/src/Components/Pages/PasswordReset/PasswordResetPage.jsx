import React, {useState} from "react";
import {useNavigate} from "react-router-dom";
import {Button, Container, Row, Col, Form, Card} from "react-bootstrap";
import NotAuthTopBar from "../../TopBars/NotAuthTopBar";
import {faEye, faEyeSlash} from "@fortawesome/free-solid-svg-icons";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import ErrorMessage from "../../ErrorHandling/ErrorMessage.jsx";

const PasswordResetPage = () => {
    const navigate = useNavigate();
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const phoneNumber = localStorage.getItem("phoneNumber") || "";

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const [error, setError] = useState(null);

    const url = localStorage.getItem("url");

    const handlePasswordReset = async () => {
        if (password !== confirmPassword) {
            setError({message: "Пароли не совпадают"});
            return;
        }

        const response = await fetch(url + "/auth/password", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({phoneNumber, newPassword: password}),
        });

        const data = await response.json();

        if (response.ok) {
            navigate("/login");

        } else {
            setError({message: data.userFriendlyMessage, status: data.status });
        }

    };

    return (
        <div style={{display: "flex", flexDirection: "column", height: "100vh"}}>
            <NotAuthTopBar/>
            <Container
                fluid
                className="BG d-flex align-items-center justify-content-center"
                style={{
                    // backgroundColor: "#242582",
                    flex: 1,
                }}
            >
                <Row className="w-100">
                    <Col xs={12} md={8} lg={4} className="mx-auto">
                        <Card className="p-4 shadow-lg">
                            <Card.Body>
                                <h2 className="HLD text-center mb-4">Сброс пароля</h2>
                                <Form>
                                    <Form.Group controlId="formPassword" className="mb-3 position-relative">
                                        <Form.Control
                                            type={showPassword ? "text" : "password"}
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            placeholder="Введите пароль"
                                            className="rounded-pill p-3"
                                            style={{
                                                backgroundColor: "#ffffff",
                                                border: "none",
                                                boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                                            }}
                                        />
                                        <FontAwesomeIcon
                                            icon={showPassword ? faEyeSlash : faEye}
                                            className="position-absolute top-50 end-0 translate-middle-y me-3"
                                            style={{cursor: "pointer", color: "#888"}}
                                            onClick={() => setShowPassword(!showPassword)}
                                        />
                                    </Form.Group>
                                    <Form.Group controlId="formConfirmPassword" className="mb-3 position-relative">
                                        <Form.Control
                                            type={showConfirmPassword ? "text" : "password"}
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            placeholder="Введите пароль"
                                            className="rounded-pill p-3"
                                            style={{
                                                backgroundColor: "#ffffff",
                                                border: "none",
                                                boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                                            }}
                                        />
                                        <FontAwesomeIcon
                                            icon={showConfirmPassword ? faEyeSlash : faEye}
                                            className="position-absolute top-50 end-0 translate-middle-y me-3"
                                            style={{cursor: "pointer", color: "#888"}}
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        />
                                    </Form.Group>

                                    <ErrorMessage
                                        message={error?.message}
                                        statusCode={error?.status}
                                    />
                                    <div className="d-grid gap-2">
                                        <Button
                                            variant="primary"
                                            className="rounded-pill"
                                            style={{
                                                backgroundColor: "#ff7101",
                                                border: "none",
                                                fontSize: "18px",
                                            }}
                                            onClick={handlePasswordReset}
                                        >
                                            Подтвердить
                                        </Button>
                                    </div>
                                </Form>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </Container>
        </div>
    );
};

export default PasswordResetPage;
