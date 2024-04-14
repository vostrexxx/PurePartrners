import React, { useState } from "react";
import "./LoginSignup.css";

import name_icon from "../../assets/name_icon1.png";
import password_icon from "../../assets/password_icon.png";
import phone_icon from "../../assets/phone_icon1.png";

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

function SubmitContainers({ onRegister, onLogin, isRegistering }) {
  return (
    <div className="submit-containers">
      <button
        className={`submit-container-signup ${
          isRegistering ? "active" : "inactive-signup"
        }`}
        onClick={onRegister}
      >
        Регистрация
      </button>
      <button
        className={`submit-container-login ${
          !isRegistering ? "active" : "inactive-login"
        }`}
        onClick={onLogin}
      >
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

export default function LoginSignup() {
  const [isRegistering, setIsRegistering] = useState(false);
  const [activeFields, setActiveFields] = useState({
    name: false,
    phone: false,
    password1: false,
    password2: false,
  });

  const handleRegister = () => {
    setIsRegistering(true);
  };

  const handleLogin = () => {
    setIsRegistering(false);
  };

  return (
    <div className="container">
      <div className="header">
        <div className="text">{isRegistering ? "Регистрация" : "Вход"}</div>
        <div className="underline"></div>
      </div>

      {isRegistering && (
        <>
          <InputField
            imageSrc={name_icon}
            inputType="text"
            placeholder="Введите ФИО"
            isActive={activeFields.name}
          />
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
            isActive={activeFields.password1}
          />
          <InputField
            imageSrc={password_icon}
            inputType="password"
            placeholder="Повторите пароль"
            isActive={activeFields.password2}
          />
        </>
      )}

      {!isRegistering && (
        <>
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
            isActive={activeFields.password1}
          />
        </>
      )}

      <ForgotPassword />
      <SubmitContainers
        onRegister={handleRegister}
        onLogin={handleLogin}
        isRegistering={isRegistering}
      />
    </div>
  );
}
