import React, { useRef, useEffect } from "react";
import { Form } from "react-bootstrap";

const AutoResizingTextarea = ({ value, onChange, disabled }) => {
    const textareaRef = useRef(null);

    // Функция для автоматического изменения высоты
    const adjustHeight = () => {
        if (textareaRef.current) {
            textareaRef.current.style.height = "auto"; // Сбрасываем высоту
            textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`; // Устанавливаем новую высоту
        }
    };

    // Вызываем adjustHeight при изменении значения
    useEffect(() => {
        adjustHeight();
    }, [value]);

    return (
        <Form.Group className="mb-3">
            <Form.Label>Комментарий</Form.Label>
            <Form.Control
                ref={textareaRef}
                style={{
                    backgroundColor: "#333",
                    color: "white",
                    border: "1px solid #555",
                    resize: "none", // Отключаем ручное изменение размера
                    overflow: "hidden", // Скрываем скролл
                }}
                as="textarea"
                name="comments"
                placeholder="Добавьте комментарий"
                value={value}
                onChange={onChange}
                disabled={disabled}
                className="form-control-placeholder"
            />
        </Form.Group>
    );
};

export default AutoResizingTextarea;