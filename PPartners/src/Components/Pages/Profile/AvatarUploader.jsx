import React, { useState, useEffect } from 'react';

const AvatarUploader = ({ avatarUrl, onUpload, onDelete, isEditable }) => {
    const [avatar, setAvatar] = useState(avatarUrl || null); // Текущее изображение
    const [newAvatar, setNewAvatar] = useState(null); // Новое изображение перед загрузкой
    const [isLoading, setIsLoading] = useState(false); // Состояние загрузки

    useEffect(() => {
        setAvatar(avatarUrl); // Обновляем при изменении avatarUrl
    }, [avatarUrl]);

    // Функция выбора нового аватара
    const handleSelectAvatar = (e) => {
        const file = e.target.files[0];
        if (file) {
            setNewAvatar(file);
        }
    };

    // Функция загрузки аватара
    const handleUploadAvatar = async () => {
        if (!newAvatar) return alert("Выберите изображение!");

        setIsLoading(true);
        try {
            const formData = new FormData();
            formData.append("image", newAvatar);

            await onUpload(formData); // Вызываем переданную функцию загрузки

            setNewAvatar(null);
        } catch (error) {
            console.error("Ошибка загрузки аватара:", error);
            alert("Ошибка загрузки аватара.");
        } finally {
            setIsLoading(false);
        }
    };

    // Функция удаления аватара
    const handleDeleteAvatar = async () => {
        if (!avatar) return;

        if (window.confirm("Вы уверены, что хотите удалить аватар?")) {
            setIsLoading(true);
            try {
                await onDelete(); // Вызываем переданную функцию удаления
                setAvatar(null);
            } catch (error) {
                console.error("Ошибка удаления аватара:", error);
                alert("Ошибка удаления аватара.");
            } finally {
                setIsLoading(false);
            }
        }
    };

    return (
        <div style={styles.container}>
            <h4>Аватар</h4>
            <div style={styles.avatarWrapper}>
                {avatar ? (
                    <img src={avatar} alt="Аватар" style={styles.avatar} />
                ) : (
                    <div style={styles.placeholder}>Нет фото</div>
                )}
            </div>

            {isEditable && (
                <div style={styles.controls}>
                    <input type="file" accept="image/*" onChange={handleSelectAvatar} />
                    {newAvatar && (
                        <button onClick={handleUploadAvatar} disabled={isLoading} style={styles.uploadButton}>
                            {isLoading ? "Загрузка..." : "Загрузить"}
                        </button>
                    )}
                    {avatar && (
                        <button onClick={handleDeleteAvatar} disabled={isLoading} style={styles.deleteButton}>
                            Удалить
                        </button>
                    )}
                </div>
            )}
        </div>
    );
};

// Стили для компонента
const styles = {
    container: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '10px',
        padding: '10px',
        border: '1px solid #ccc',
        borderRadius: '8px',
        width: '200px',
    },
    avatarWrapper: {
        width: '100px',
        height: '100px',
        borderRadius: '50%',
        overflow: 'hidden',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f0f0f0',
    },
    avatar: {
        width: '100%',
        height: '100%',
        objectFit: 'cover',
    },
    placeholder: {
        width: '100%',
        height: '100%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        color: '#888',
    },
    controls: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '5px',
    },
    uploadButton: {
        padding: '8px',
        backgroundColor: 'green',
        color: 'white',
        border: 'none',
        cursor: 'pointer',
    },
    deleteButton: {
        padding: '8px',
        backgroundColor: 'red',
        color: 'white',
        border: 'none',
        cursor: 'pointer',
    },
};

export default AvatarUploader;
