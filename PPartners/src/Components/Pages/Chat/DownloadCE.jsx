import React, { useEffect, useState } from 'react';

const getAuthToken = () => localStorage.getItem('authToken');
let url = localStorage.getItem('url');

const DownloadCE = ({ agreementId }) => {
    const [isContractReady, setIsContractReady] = useState(false);
    const [isEstimateReady, setIsEstimateReady] = useState(false);
    const [isActReady, setIsActReady] = useState(false);

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
                setIsActReady(response.isActExists);
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
                return response.blob();
            })
            .then((blob) => {
                const fileURL = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = fileURL;
                link.download =
                    type === "contract"
                        ? "Договор.docx"
                        : type === "estimate"
                            ? "Смета.xlsx"
                            : "Акт.pdf";
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                URL.revokeObjectURL(fileURL);
            })
            .catch((error) => {
                console.error(`Ошибка при загрузке файла: ${error.message}`);
            });
    };

    return (
        <div>
            <h3 style={{ color: 'white' }}>Смета:</h3>
            {isEstimateReady ? (
                <button onClick={() => handleDownload("estimate")}>Загрузить Смету</button>
            ) : (
                <div>Смета не сформирована</div>
            )}

            <h3 style={{ color: 'white' }}>Договор:</h3>
            {isContractReady ? (
                <button onClick={() => handleDownload("contract")}>Загрузить Договор</button>
            ) : (
                <div>Договор не сформирован</div>
            )}

            <h3 style={{ color: 'white' }}>Акт:</h3>
            {isActReady ? (
                <button onClick={() => handleDownload("act")}>Загрузить Акт</button>
            ) : (
                <div>Акт не сформирован</div>
            )}
        </div>
    );
};

export default DownloadCE;
