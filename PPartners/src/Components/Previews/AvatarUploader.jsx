import React, { useState } from "react";
import { Button, Image, Spinner, Alert } from "react-bootstrap";

const AvatarUploader = ({ imagePath, onUpload }) => {
    console.log(imagePath)
    const [imageSrc, setImageSrc] = useState(imagePath || null); // Состояние для хранения изображения
    const [isLoading, setIsLoading] = useState(false); // Состояние для отображения загрузки
    const [error, setError] = useState(null); // Состояние для отображения ошибок
    const url = localStorage.getItem('url');

    // Обработчик загрузки файла
    const handleFileUpload = async (file) => {
        if (!file) return;

        setIsLoading(true);
        setError(null);

        try {
            const formData = new FormData();
            formData.append("avatar", file);

            const params = new URLSearchParams({ imageSrc });
            const response = await fetch(`${url}/${place}/image?${params.toString()}`, {
                method: "POST",
                body: formData,
            });

            if (!response.ok) {
                throw new Error("Ошибка загрузки файла");
            }

            const result = await response.json();
            setImageSrc(result.imageUrl);
            onUpload(result.imageUrl);
        } catch (error) {
            setError(error.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="d-flex flex-column align-items-center">
            <h3 className="text-center mb-4 text-primary">Фото профиля</h3>

            {/* Отображение изображения */}
            {imageSrc ? (
                <Image src={imageSrc} roundedCircle style={{ width: "150px", height: "150px", objectFit: "cover" }} />
            ) : (
                <div className="bg-light rounded-circle d-flex align-items-center justify-content-center" style={{ width: "150px", height: "150px" }}>
                    <span className="text-muted">Нет фото</span>
                </div>
            )}

            {/* Кнопка загрузки */}
            <div className="mt-3">
                <Button variant="primary" onClick={() => document.getElementById("avatarUpload").click()} disabled={isLoading}>
                    {isLoading ? (
                        <>
                            <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />
                            <span className="ms-2">Загрузка...</span>
                        </>
                    ) : (
                        "Загрузить аватар"
                    )}
                </Button>
            </div>

            {/* Скрытый input для выбора файла */}
            <input
                id="avatarUpload"
                type="file"
                accept="image/*"
                className="d-none"
                onChange={(e) => handleFileUpload(e.target.files[0])}
            />

            {/* Отображение ошибки */}
            {error && (
                <Alert variant="danger" className="mt-3">
                    {error}
                </Alert>
            )}
        </div>
    );
};

export default AvatarUploader;