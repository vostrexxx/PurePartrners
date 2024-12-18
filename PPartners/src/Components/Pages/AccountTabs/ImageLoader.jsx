import React, { useState, useEffect } from 'react';
const ImageLoader = ({ imagePath, label, place }) => {
    const [imageSrc, setImageSrc] = useState(null);
    const [error, setError] = useState(null);

    const url = localStorage.getItem('url');
    const getAuthToken = () => localStorage.getItem('authToken');

    const [msg, setMsg] = useState(null);

    useEffect(() => {
        const fetchImage = async () => {
             
            try {
                
                const params = new URLSearchParams({ imagePath });
                const response = await fetch(`${url}/${place}/image?${params.toString()}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${getAuthToken()}`,
                    },
                });
                if (!response.ok) {
                    throw new Error(`Ошибка загрузки изображения: ${response.status}`);
                }

                const blob = await response.blob();
                setImageSrc(URL.createObjectURL(blob));
            } catch (error) {
                setError(`Не удалось загрузить изображение: ${error.message}`);
            }
        };

        if (imagePath) {
            fetchImage();
        }
    }, [imagePath]);

    return (
        <div>
            {label && <label>{label}</label>}
            {error ? (
                <p style={{ color: 'red' }}>{error}</p>
            ) : imageSrc ? (
                <img src={imageSrc} alt="Loaded" style={{ maxWidth: '300px', marginTop: '10px' }} />
            ) : (
                <p>Нет изображения</p>
            )}
        </div>
    );
};

export default ImageLoader;
