import React, { useEffect, useState } from 'react';

const getAuthToken = () => localStorage.getItem('authToken');
let url = localStorage.getItem('url');

const DownloadCE = ({ agreementId }) => {
    const [isContractReady, setIsContractReady] = useState(false);
    const [isEstimateReady, setIsEstimateReady] = useState(false);

    useEffect(() => {
        const params = new URLSearchParams({ agreementId: agreementId });
        fetch(`${url}/document/presence?${params.toString()}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${getAuthToken()}`,
            },
        })
            .then((response) => {
                if (!response.ok) {
                    throw new Error(`Ошибка при получении информации по соглашению: ${response.status}`);
                }
                return response.json();
            })
            .then((response) => {
                setIsContractReady(response.isContractExists);
                setIsEstimateReady(response.isEstimateExists);
            })
            .catch((error) => {
                console.error(`Ошибка при получении информации по соглашению: ${error.message}`);
            });
    }, [agreementId]);

    const handleDownload = (type) => {
        const params = new URLSearchParams({ agreementId, type });
        fetch(`${url}/document?${params.toString()}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${getAuthToken()}`,
            },
        })
            .then((response) => {
                if (!response.ok) {
                    throw new Error(`Ошибка при загрузке файла: ${response.status}`);
                }
                return response.blob(); // Получаем бинарные данные файла
            })
            .then((blob) => {
                const fileURL = URL.createObjectURL(blob); // Создаём ссылку на файл
                const link = document.createElement('a'); // Создаём элемент <a> для загрузки
                link.href = fileURL;
                link.download = type === "contract" ? "Договор.docx" : "Смета.xlsx"; // Устанавливаем имя файла
                document.body.appendChild(link);
                link.click(); // Кликаем по ссылке для скачивания
                document.body.removeChild(link); // Удаляем ссылку
                URL.revokeObjectURL(fileURL); // Освобождаем память
            })
            .catch((error) => {
                console.error(`Ошибка при загрузке файла: ${error.message}`);
            });
    };

    return (
        <div>
            <h3 style={{ color: 'white' }}>Договор:</h3>
            {isContractReady ? (
                <button onClick={() => handleDownload("contract")}>Загрузить Договор</button>
            ) : (
                <div>Договор не сформирован</div>
            )}
            <h3 style={{ color: 'white' }}>Смета:</h3>
            {isEstimateReady ? (
                <button onClick={() => handleDownload("estimate")}>Загрузить Смету</button>
            ) : (
                <div>Смета не сформирована</div>
            )}
        </div>
    );
};

export default DownloadCE;
