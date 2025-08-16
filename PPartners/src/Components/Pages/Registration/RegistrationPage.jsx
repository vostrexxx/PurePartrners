import React, {useState} from "react";
import {useNavigate} from "react-router-dom";
import {Button, Container, Row, Col, Form, Card} from "react-bootstrap";
import NotAuthTopBar from "../../TopBars/NotAuthTopBar";
import ErrorMessage from "../../ErrorHandling/ErrorMessage";
import {faEye, faEyeSlash} from '@fortawesome/free-solid-svg-icons';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {useToast} from '../../Notification/ToastContext'
import './Registration.css'

const RegistrationPage = () => {
    const showToast = useToast();
    const [phoneNumber, setPhoneNumber] = useState(localStorage.getItem("phoneNumber"));
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const [error, setError] = useState(null);
    const [passwordValid, setPasswordValid] = useState(true);
    const [passwordError, setPasswordError] = useState("");

    const navigate = useNavigate();

    const url = localStorage.getItem("url");

    const ChangePhoneNumber = () => {
        navigate("/identification");
    };

    const validatePassword = (value) => {
        if (value.length < 8) {
            return {isValid: false, error: "Пароль должен содержать минимум 8 символов"};
        }
        if (!/(?=.*[a-zа-яё])/.test(value)) {
            return {isValid: false, error: "Пароль должен содержать хотя бы одну строчную букву"};
        }
        if (!/(?=.*[A-ZА-ЯЁ])/.test(value)) {
            return {isValid: false, error: "Пароль должен содержать хотя бы одну заглавную букву"};
        }
        if (!/(?=.*\d)/.test(value)) {
            return {isValid: false, error: "Пароль должен содержать хотя бы одну цифру"};
        }
        return {isValid: true, error: ""};
    };

    const handleRegister = async (e) => {
        // Предотвращаем стандартное поведение формы
        if (e && e.preventDefault) {
            e.preventDefault();
        }

        const passwordValidation = validatePassword(password);
        if (!passwordValidation.isValid) {
            setPasswordValid(false);
            setPasswordError(passwordValidation.error);
            return;
        }

        if (password !== confirmPassword) {
            setError({message: "Пароли не совпадают"});
            return;
        }

        const response = await fetch(url + "/auth/register", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({phoneNumber, password}),
        });

        const data = await response.json();
        if (response.ok) {
            navigate("/login", {state: {phoneNumber}});
        } else {
            setError({message: data.userFriendlyMessage, status: data.status});
        }
    };

    const handlePasswordChange = (e) => {
        const value = e.target.value;
        setPassword(value);

        const validation = validatePassword(value);
        setPasswordValid(validation.isValid);
        setPasswordError(validation.error);
    };

    // Обработчик отправки формы (срабатывает при Enter)
    const handleSubmit = (e) => {
        e.preventDefault();
        handleRegister(e);
    };

    return (
        <div style={{display: "flex", flexDirection: "column", height: "100vh"}}>
            <NotAuthTopBar/>
            <Container
                fluid
                className="BG d-flex align-items-center justify-content-center"
                style={{
                    flex: 1,
                }}
            >
                <Row className="w-100">
                    <Col xs={12} md={8} lg={4} className="mx-auto">
                        <Card className="p-4 shadow-lg">
                            <Card.Body>
                                <h2 className="HLD text-center mb-4">Регистрация</h2>
                                {/* Добавляем onSubmit к форме */}
                                <Form onSubmit={handleSubmit}>
                                    <Form.Group controlId="formPhoneNumber" className="mb-3">
                                        <Form.Control
                                            type="text"
                                            value={phoneNumber}
                                            placeholder="+7 (***) ***-**-**"
                                            disabled
                                            className="rounded-pill p-3"
                                            style={{
                                                backgroundColor: "#e9ecef",
                                                border: "none",
                                                boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                                            }}
                                        />
                                    </Form.Group>
                                    <Form.Group controlId="formPassword" className="mb-3 position-relative">
                                        <Form.Control
                                            type={showPassword ? "text" : "password"}
                                            value={password}
                                            onChange={handlePasswordChange}
                                            placeholder="Введите пароль"
                                            isInvalid={!passwordValid}
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
                                            placeholder="Подтвердите пароль"
                                            isInvalid={password !== "" && confirmPassword !== "" && password !== confirmPassword}
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
                                        message={error?.message || passwordError || ((password !== "" && confirmPassword !== "" && password !== confirmPassword) && 'Пароли не совпадают')}
                                        statusCode={error?.status}
                                    />
                                    <div className="d-grid gap-2">
                                        {/* Кнопка теперь type="submit" */}
                                        <Button
                                            variant="primary"
                                            type="submit"
                                            className="rounded-pill"
                                            style={{
                                                backgroundColor: "#ff7101",
                                                border: "none",
                                                fontSize: "18px",
                                            }}
                                        >
                                            Зарегистрироваться
                                        </Button>
                                        <Button
                                            variant="link"
                                            className="text-decoration-underline text-center"
                                            style={{color: "#ff7101"}}
                                            onClick={ChangePhoneNumber}
                                        >
                                            Изменить номер телефона
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

export default RegistrationPage;