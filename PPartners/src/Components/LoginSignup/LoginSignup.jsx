import React, { useState } from "react";
import "./LoginSignup.css";

import name_icon from "../../assets/name_icon.png";
import password_icon from "../../assets/password_icon.png";
import phone_icon from "../../assets/phone_icon.png";



function InputField({ imageSrc, inputType, placeholder }) {
  return (
    <div className="input">
      <img src={imageSrc} alt="" className="icon" />
      <input type={inputType} placeholder={placeholder} className="input-field" />
    </div>
  );
}

function SubmitContainers({ onRegister, onLogin, isRegistering }) {
    return (
      <div className="submit-containers">
        <button
          className={`submit-container-signup ${isRegistering ? 'active' : ''}`}
          onClick={onRegister}
        >
          Регистрация
        </button>
        <button
          className={`submit-container-login ${!isRegistering ? 'active' : ''}`}
          onClick={onLogin}
        >
          Вход
        </button>
      </div>
    );
  }

function ForgotPassword() {
  return (
    <div className="forgotPassword">
      <span>Забыли пароль?</span>
    </div>
  );
}

export default function LoginSignup() {
  const [isRegistering, setIsRegistering] = useState(false);

  const handleRegister = () => {
    setIsRegistering(true);
  };

  const handleLogin = () => {
    setIsRegistering(false);
  };

  return (
    <div className="container">
      <div className="header">
        <div className="text">{isRegistering ? 'Регистрация' : 'Вход'}</div>
        <div className="underline"></div>
      </div>

      {isRegistering && (
        <>
          <InputField imageSrc={name_icon} inputType="text" placeholder="Введите ФИО" />
          <InputField imageSrc={phone_icon} inputType="tel" placeholder="Введите номер телефона" />
          <InputField imageSrc={password_icon} inputType="password" placeholder="Введите пароль" />
          <InputField imageSrc={password_icon} inputType="password" placeholder="Повторите пароль" />
        </>
      )}

      {!isRegistering && (
        <>
          <InputField imageSrc={phone_icon} inputType="tel" placeholder="Введите номер телефона" />
          <InputField imageSrc={password_icon} inputType="password" placeholder="Введите пароль" />
        </>
      )}

      <ForgotPassword />
      <SubmitContainers onRegister={handleRegister} onLogin={handleLogin} />
    </div>
  );
}
