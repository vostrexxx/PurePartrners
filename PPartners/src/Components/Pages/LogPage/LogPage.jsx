import React, { useState } from "react";
// import "./LoginSignup.css";

import name_icon from "../../../assets/name_icon1.png";
import password_icon from "../../../assets/password_icon.png";
import phone_icon from "../../../assets/phone_icon1.png";

function InputField({ imageSrc, inputType, placeholder, isActive }) {
  return (
    <div className={`input ${isActive ? "active" : ""}`}>
      <img src={imageSrc} alt="" className="icon" />
      <input
        type={inputType}
        placeholder={placeholder}
        className="input-field"
      />
    </div>
  );
}

function SubmitContainers({ onLogin }) {
  return (
    <div className="submit-containers">
      <button className="submit-container-login" onClick={onLogin}>
        Вход
      </button>
    </div>
  );
}

function ForgotPassword() {
  const handleForgotPasswordClick = () => {
    // Ваша логика для обработки клика на "Забыли пароль?"
    console.log("Забыли пароль? кликнули");
  };

  return (
    <div className="forgotPassword" onClick={handleForgotPasswordClick}>
      <span className="forgotPasswordText">Забыли пароль?</span>
    </div>
  );
}

export default function LoginPage() {
  const [activeFields, setActiveFields] = useState({
    phone: false,
    password: false,
  });

  const handleLogin = () => {
    console.log("Вход");
    // Добавьте здесь логику для обработки входа
  };

  return (
    <div className="container">
      <div className="header">
        <div className="text">Вход</div>
        <div className="underline"></div>
      </div>

      <InputField
        imageSrc={phone_icon}
        inputType="tel"
        placeholder="Введите номер телефона"
        isActive={activeFields.phone}
      />
      <InputField
        imageSrc={password_icon}
        inputType="password"
        placeholder="Введите пароль"
        isActive={activeFields.password}
      />

      <ForgotPassword />
      <SubmitContainers onLogin={handleLogin} />
    </div>
  );
}
