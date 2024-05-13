import React, { useState } from "react";

export default function RegistrationPage() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [token, setToken] = useState("");

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
        setToken(token);

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

      <div className="input">
        <input
          type="email"
          placeholder="Введите адрес электронной почты"
          name="email"
          value={formData.email}
          onChange={handleInputChange}
        />
      </div>

      <div className="input">
        <input
          type="password"
          placeholder="Введите пароль"
          name="password"
          value={formData.password}
          onChange={handleInputChange}
        />
      </div>

      <div className="submit-containers">
        <button className="submit-container-signup" onClick={handleRegister}>
          Регистрация
        </button>
      </div>
    </div>
  );
}
