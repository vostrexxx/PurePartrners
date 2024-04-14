// import React, { useState } from "react";
// // import "./LoginSignup.css";

// import name_icon from "../../../assets/name_icon1.png";
// import password_icon from "../../../assets/password_icon.png";
// import phone_icon from "../../../assets/phone_icon1.png";
// import email_icon from "../../../assets/email_icon.jpg";

// function InputField({ imageSrc, inputType, placeholder, isActive }) {
//   return (
//     <div className={`input ${isActive ? "active" : ""}`}>
//       <img src={imageSrc} alt="" className="icon" />
//       <input
//         type={inputType}
//         placeholder={placeholder}
//         className="input-field"
//       />
//     </div>
//   );
// }

// function SubmitContainers({ onRegister }) {
//   return (
//     <div className="submit-containers">
//       <button className="submit-container-signup" onClick={onRegister}>
//         Регистрация
//       </button>
//     </div>
//   );
// }

// function ForgotPassword() {
//   const handleForgotPasswordClick = () => {
//     // Ваша логика для обработки клика на "Забыли пароль?"
//     console.log("Забыли пароль? кликнули");
//   };

//   return (
//     <div className="forgotPassword" onClick={handleForgotPasswordClick}>
//       <span className="forgotPasswordText">Забыли пароль?</span>
//     </div>
//   );
// }

// export default function RegistrationPage() {
//   const [activeFields, setActiveFields] = useState({
//     name: false,
//     phone: false,
//     password1: false,
//     password2: false,
//   });

//   const handleRegister = async () => {
//     const formData = new FormData();
//     formData.append(
//       "email",
//       document.querySelector('input[name="email"]').value
//     );
//     formData.append(
//       "fullName",
//       document.querySelector('input[name="fullName"]').value
//     );
//     formData.append(
//       "phoneNumber",
//       document.querySelector('input[name="phoneNumber"]').value
//     );
//     formData.append(
//       "password",
//       document.querySelector('input[name="password"]').value
//     );
 

//     try {
//       const response = await fetch("Oleg", {
//         method: "POST",
//         body: formData,
//       });
//       if (response.ok) {
//         console.log("Регистрация прошла успешно");
//       } else {
//         console.error("Ошибка при регистрации");
//       }
//     } catch (error) {
//       console.error("Ошибка при отправке запроса:", error);
//     }
//   };

//   return (
//     <div className="container">
//       <div className="header">
//         <div className="text">Регистрация</div>
//         <div className="underline"></div>
//       </div>

//       <InputField
//         imageSrc={email_icon}
//         inputType="email"
//         placeholder="Введите адрес электронной почты"
//         isActive={activeFields.email}
//         name="email"
//       />

//       <InputField
//         imageSrc={name_icon}
//         inputType="text"
//         placeholder="Введите ФИО"
//         isActive={activeFields.name}
//         name="fullName"
//       />
//       <InputField
//         imageSrc={phone_icon}
//         inputType="tel"
//         placeholder="Введите номер телефона"
//         isActive={activeFields.phone}
//         name="phoneNumber"
//       />
//       <InputField
//         imageSrc={password_icon}
//         inputType="password"
//         placeholder="Введите пароль"
//         isActive={activeFields.password1}
//         name="password"
//       />
//       <InputField
//         imageSrc={password_icon}
//         inputType="password"
//         placeholder="Повторите пароль"
//         isActive={activeFields.password2}
//         name="confirmPassword"
//       />

//       <SubmitContainers onRegister={handleRegister} />
//     </div>
//   );
// }

import React, { useState } from "react";
import email_icon from "../../../assets/email_icon.jpg";
import password_icon from "../../../assets/password_icon.png";

function InputField({ imageSrc, inputType, placeholder }) {
  return (
    <div className="input">
      <img src={imageSrc} alt="" className="icon" />
      <input type={inputType} placeholder={placeholder} className="input-field" />
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

export default function RegistrationPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleRegister = async () => {
    const formData = new FormData();
    formData.append("email", email);
    formData.append("password", password);

    try {
      const response = await fetch("http://localhost:8080/api/v1/auth/register", {
        method: "POST",
        body: formData,
      });
      if (response.ok) {
        console.log("Регистрация прошла успешно");
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
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <InputField
        imageSrc={password_icon}
        inputType="password"
        placeholder="Введите пароль"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <SubmitContainers onRegister={handleRegister} />
    </div>
  );
}
