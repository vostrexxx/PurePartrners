import React, { useState } from "react";
import { Switch } from "@mui/material";
import { useProfile } from "../../Context/ProfileContext"; // Импортируем хук профиля
import { useNavigate } from "react-router-dom";
import { Navbar, Dropdown, Container } from "react-bootstrap";
import { MdPerson } from "react-icons/md"; // Импортируем нужные иконки
import { MdBusinessCenter } from "react-icons/md"; // Импортируем нужные иконки
import { FaHardHat } from "react-icons/fa"; // Импортируем нужные иконки

import logo from "../../../Images/logo.png";
import smallLogo from "../../../Images/small-logo.png";
import './TopBar.css'

const UnswitchTopBar = () => {
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
        <Navbar.Brand onClick={() => navigate("/main")} style={{ cursor: "pointer" }}>
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

        {/* Иконка профиля */}
        <Dropdown>
          <Dropdown.Toggle
            variant="light"
            className="p-0 border-0 d-flex align-items-center dropdown-toggle-custom"
            style={{
              backgroundColor: "transparent",
            }}
          >
            <MdPerson
              size={40} // Размер иконки
              color="#ff6600" // Оранжевый цвет
              style={{ marginRight: "8px" }}
            />
          </Dropdown.Toggle>

          <Dropdown.Menu align="end" className="custom-dropdown-menu">
            <Dropdown.Item onClick={() => navigate("/account-actions")}>
              Работа с аккаунтом
            </Dropdown.Item>
            <Dropdown.Item onClick={() => navigate("/agreement")}>
              Отклики
            </Dropdown.Item>
            <Dropdown.Item onClick={() => navigate("/all-chats")}>
              Мои чаты
            </Dropdown.Item>
            {!isSpecialist && (
              <Dropdown.Item onClick={() => navigate("/balance")}>
                Баланс
              </Dropdown.Item>
            )}
            {/* {!isSpecialist && ( */}
            <Dropdown.Item onClick={() => navigate("/")}>
              Выйти
            </Dropdown.Item>
            {/* } */}
          </Dropdown.Menu>
        </Dropdown>
      </Container>
    </Navbar>
  );
};

export default UnswitchTopBar;
