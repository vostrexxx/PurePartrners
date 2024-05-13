import React, { useState } from "react";
import name_icon from "../../../assets/name_icon1.png";
import password_icon from "../../../assets/password_icon.png";
import phone_icon from "../../../assets/phone_icon1.png";
import email_icon from "../../../assets/email_icon.jpg";

function InputField({ imageSrc, inputType, placeholder, isActive, value, onChange }) {
  return (
    <div className={`input ${isActive ? "active" : ""}`}>
      <img src={imageSrc} alt="" className="icon" />
      <input
        type={inputType}
        placeholder={placeholder}
        className="input-field"
        value={value}
        onChange={onChange}
      />
    </div>
  );
}

function SubmitContainers({ onRegister }) {
  return (
    <div className="submit-containers">
      <button className="submit-container-signup" onClick={onRegister}>
        Регистрация
      </button>
    </div>
  );
}

// function ForgotPassword() {
//   const handleForgotPasswordClick = () => {
//     console.log("Забыли пароль? кликнули");
//   };

//   return (
//     <div className="forgotPassword" onClick={handleForgotPasswordClick}>
//       <span className="forgotPasswordText">Забыли пароль?</span>
//     </div>
//   );
// }

export default function RegistrationPage() {
  const [activeFields, setActiveFields] = useState({
    email: false,
    fullName: false,
    phoneNumber: false,
    password: false,
    confirmPassword: false,
  });

  const [formData, setFormData] = useState({
    email: "",
    fullName: "",
    phoneNumber: "",
    password: "",
    confirmPassword: "",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleRegister = async () => {
    const { email, password } = formData;
  
    try {
      const response = await fetch("http://localhost:8887/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });
  
      if (response.ok) {
        const data = await response.json();
        const token = data.token;  
      
        const helloResponse = await fetch("http://localhost:8887/hello/hello", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });
  
        if (helloResponse.ok) {
          console.log("Токен успешно отправлен");
        } else {
          console.error("Ошибка при отправке токена");
        }
      } else {
        console.error("Ошибка при регистрации");
      }
    } catch (error) {
      console.error("Ошибка при отправке запроса:", error);
    }
  };  

  return (
    <div className="container">
      <div className="header">
        <div className="text">Регистрация</div>
        <div className="underline"></div>
      </div>

      <InputField
        imageSrc={email_icon}
        inputType="email"
        placeholder="Введите адрес электронной почты"
        isActive={activeFields.email}
        name="email"
        value={formData.email}
        onChange={handleInputChange}
      />

      <InputField
        imageSrc={name_icon}
        inputType="text"
        placeholder="Введите ФИО"
        isActive={activeFields.fullName}
        name="fullName"
        value={formData.fullName}
        onChange={handleInputChange}
      />
      <InputField
        imageSrc={phone_icon}
        inputType="tel"
        placeholder="Введите номер телефона"
        isActive={activeFields.phoneNumber}
        name="phoneNumber"
        value={formData.phoneNumber}
        onChange={handleInputChange}
      />
      <InputField
        imageSrc={password_icon}
        inputType="password"
        placeholder="Введите пароль"
        isActive={activeFields.password}
        name="password"
        value={formData.password}
        onChange={handleInputChange}
      />
      <InputField
        imageSrc={password_icon}
        inputType="password"
        placeholder="Повторите пароль"
        isActive={activeFields.confirmPassword}
        name="confirmPassword"
        value={formData.confirmPassword}
        onChange={handleInputChange}
      />

      <SubmitContainers onRegister={handleRegister} />
    </div>
  );
}
