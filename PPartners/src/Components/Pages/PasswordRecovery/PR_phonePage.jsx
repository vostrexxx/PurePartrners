import React, { useState } from "react";
// import "./ForgotPassword.css";

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

function SubmitButton({ onSubmit }) {
  return (
    <div className="submit-container">
      <button className="submit-button" onClick={onSubmit}>
        Отправить
      </button>
    </div>
  );
}

export default function ForgotPasswordPage() {
  const [activeField, setActiveField] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');

  const handleSubmit = () => {
    console.log("Отправлен номер телефона:", phoneNumber);
    // Добавьте здесь логику для отправки номера телефона для восстановления пароля
  };

  return (
    <div className="container">
      <div className="header">
        <div className="text">Восстановление пароля</div>
        <div className="underline"></div>
      </div>

      <InputField
        imageSrc={phone_icon}
        inputType="tel"
        placeholder="Введите номер телефона"
        isActive={activeField}
        onChange={(e) => setPhoneNumber(e.target.value)}
      />

      <SubmitButton onSubmit={handleSubmit} />
    </div>
  );
}
