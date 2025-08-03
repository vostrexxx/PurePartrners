import { useState } from "react";
import { Switch } from "@mui/material";
import { useProfile } from "../Context/ProfileContext"; // Импортируем хук профиля
import { useNavigate } from "react-router-dom";
import { Navbar, Dropdown, Container, Button } from "react-bootstrap";
import { MdPerson, MdLogin } from "react-icons/md"; // Импортируем нужные иконки
import { MdBusinessCenter } from "react-icons/md"; // Импортируем нужные иконки
import { FaHardHat } from "react-icons/fa"; // Импортируем нужные иконки

import logo from "../../Images/logo.png";
import smallLogo from "../../Images/small-logo.png";
import './TopBar.css'

const NotAuthTopBar = () => {
    const { isSpecialist, toggleProfile } = useProfile(); // Доступ к состоянию профиля
    const navigate = useNavigate();
    const [dropdownOpen, setDropdownOpen] = useState(false);

    const toggleDropdown = () => {
        setDropdownOpen(!dropdownOpen);
    };

    return (
        <Navbar
            expand="lg"
            className="shadow-sm TopBar"
            style={{
                // backgroundColor: "#1a1a5b",
            }}
        >
            <Container className="d-flex justify-content-between align-items-center">
                {/* Логотип */}
                <Navbar.Brand onClick={() => navigate("/")} style={{ cursor: "pointer" }}>
                    {/* Большое лого */}
                    <img
                        src={logo}
                        alt="Логотип"
                        className="default-logo"
                        style={{ width: "200px", height: "auto", objectFit: "contain" }}
                    />
                    {/* Маленькое лого */}
                    <img
                        src={smallLogo}
                        alt="Маленькое Логотип"
                        className="small-logo"
                        style={{ width: "50px", height: "auto", objectFit: "contain" }}
                    />
                </Navbar.Brand>

                {/* Центр: Переключатель */}
                <div className="d-flex align-items-center">
                    {/* Иконка заказчика */}
                    <span className="me-2 d-none d-md-block text-white">Заказчик</span>
                    <span className="me-2 d-md-none">
                        <MdBusinessCenter size={30} color="#ffffff" />
                    </span>

                    <Switch
                        checked={isSpecialist}
                        onChange={toggleProfile}
                        sx={{
                            "& .MuiSwitch-switchBase": {
                                color: "#ff7101",
                            },
                            "& .MuiSwitch-switchBase.Mui-checked": {
                                color: "#ff7101",
                            },
                            "& .MuiSwitch-track": {
                                backgroundColor: "#ff7101",
                            },
                            "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
                                backgroundColor: "#ff7101",
                            },
                        }}
                    />

                    {/* Иконка специалиста */}
                    <span className="ms-2 d-none d-md-block text-white">Специалист</span>
                    <span className="ms-2 d-md-none">
                        <FaHardHat size={26} color="#ffffff" />
                    </span>
                </div>

                <span className="ms-2 d-none d-md-block" >
                    <Button
                        variant="link"
                        style={{ color: 'white' }}
                        onClick={() => navigate("/identification")}
                    >Вход и регистрация</Button>
                </span>
                <span className="ms-2 d-md-none">
                    <MdLogin
                        size={35} // Размер иконки
                        color="#ff6600" // Оранжевый цвет
                        style={{ marginRight: "8px" }}
                        onClick={() => navigate("/identification")}
                    />
                </span>

            </Container>
        </Navbar>
    );
};

export default NotAuthTopBar;
