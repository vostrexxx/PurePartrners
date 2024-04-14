import React, { useState } from "react";
// import "./ResetPassword.css";

import code_icon from "../../../assets/code_icon1.png";
import password_icon from "../../../assets/password_icon.png";

function InputField({ imageSrc, inputType, placeholder, isActive, onChange }) {
  return (
    <div className={`input ${isActive ? "active" : ""}`}>
      <img src={imageSrc} alt="" className="icon" />
      <input
        type={inputType}
        placeholder={placeholder}
        className="input-field"
        onChange={onChange}
      />
    </div>
  );
}

function SubmitButton({ onSubmit }) {
  return (
    <div className="submit-container">
      <button className="submit-button" onClick={onSubmit}>
        Сохранить
      </button>
    </div>
  );
}

export default function ResetPasswordPage() {
  const [activeFields, setActiveFields] = useState({
    code: false,
    newPassword: false,
    confirmNewPassword: false
  });
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');

  const handleSubmit = () => {
    console.log("Отправлен код:", code);
    console.log("Новый пароль:", newPassword);
    console.log("Подтверждение нового пароля:", confirmNewPassword);
    // Добавьте здесь логику для обработки введенных данных
  };

  return (
    <div className="container">
      <div className="header">
        <div className="text">Сброс пароля</div>
        <div className="underline"></div>
      </div>

      <InputField
        imageSrc={code_icon}
        inputType="text"
        placeholder="Введите код из сообщения"
        isActive={activeFields.code}
        onChange={(e) => setCode(e.target.value)}
      />
      <InputField
        imageSrc={password_icon}
        inputType="password"
        placeholder="Введите новый пароль"
        isActive={activeFields.newPassword}
        onChange={(e) => setNewPassword(e.target.value)}
      />
      <InputField
        imageSrc={password_icon}
        inputType="password"
        placeholder="Повторите новый пароль"
        isActive={activeFields.confirmNewPassword}
        onChange={(e) => setConfirmNewPassword(e.target.value)}
      />

      <SubmitButton onSubmit={handleSubmit} />
    </div>
  );
}
