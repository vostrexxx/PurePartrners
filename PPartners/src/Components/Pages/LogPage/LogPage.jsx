import React, { useState } from "react";
// import "./LoginSignup.css";

import email_icon from "../../../assets/email_icon.jpg";
import password_icon from "../../../assets/password_icon.png";

function InputField({ imageSrc, inputType, placeholder, onChange, name }) {
  return (
    <div className="input">
      <img src={imageSrc} alt="" className="icon" />
      <input
        type={inputType}
        placeholder={placeholder}
        className="input-field"
        onChange={onChange}
        name={name} // добавляем атрибут name
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
    console.log("Забыли пароль? кликнули");
  };

  return (
    <div className="forgotPassword" onClick={handleForgotPasswordClick}>
      <span className="forgotPasswordText">Забыли пароль?</span>
    </div>
  );
}

export default function LoginPage() {
  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setLoginData({
      ...loginData,
      [name]: value,
    });
  };

  const handleLogin = async () => {
    if (loginData.email && loginData.password) {
      try {
        const response = await fetch(
          "http://localhost:8080/api/v1/auth/login",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(loginData),
          }
        );

        if (response.ok) {
          const user = await response.json();
          alert(`Вы вошли в систему как ${user.email}`);
        } else {
          alert(
            "Ошибка аутентификации. Пожалуйста, проверьте правильность введенной почты и пароля."
          );
        }
      } catch (error) {
        console.error("Ошибка при отправке запроса:", error);
        alert(
          "Произошла ошибка при отправке запроса. Пожалуйста, попробуйте позже."
        );
      }
    } else {
      console.log("Пожалуйста, введите почту и пароль");
    }
  };

  return (
    <div className="container">
      <div className="header">
        <div className="text">Вход</div>
        <div className="underline"></div>
      </div>

      <InputField
        imageSrc={email_icon}
        inputType="email"
        placeholder="Введите адрес электронной почты"
        onChange={handleInputChange}
        name="email" // добавляем атрибут name
      />
      <InputField
        imageSrc={password_icon}
        inputType="password"
        placeholder="Введите пароль"
        onChange={handleInputChange}
        name="password" // добавляем атрибут name
      />

      <ForgotPassword />
      <SubmitContainers onLogin={handleLogin} />
    </div>
  );
}
