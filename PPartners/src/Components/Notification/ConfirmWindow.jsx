import React from "react";
import { confirmAlert } from "react-confirm-alert";
import "react-confirm-alert/src/react-confirm-alert.css";

function App() {
    const handleClick = () => {
        confirmAlert({
            title: "Подтверждение",
            message: "Вы уверены, что хотите выполнить это действие?",
            buttons: [
                {
                    label: "Да",
                    onClick: () => console.log("Действие подтверждено!"),
                },
                {
                    label: "Нет",
                    onClick: () => console.log("Действие отменено!"),
                },
            ],
        });
    };

    return (
        <div>
            <button onClick={handleClick}>Вызвать подтверждение</button>
        </div>
    );
}

export default App;