import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useProfile } from '../../Components/Context/ProfileContext';
import { useNavigate, useLocation } from 'react-router-dom';

const EntityDetails = () => {
    const [isLegalEntity, setIsLegalEntity] = useState(null);
    const [entityData, setEntityData] = useState({});
    const [originalData, setOriginalData] = useState({});
    const [isEditable, setIsEditable] = useState(false);

    const url = localStorage.getItem('url');
    const getAuthToken = () => localStorage.getItem('authToken');
    const { isSpecialist } = useProfile();
    const { id } = useParams();
    const navigate = useNavigate();
    
    useEffect(() => {
        const fetchData = async () => {
            try {
                const entityParams = new URLSearchParams();
                const who = isSpecialist ? 'contractor' : 'customer';
                isSpecialist ? entityParams.append('contractorId', id) : entityParams.append('customerId', id);

                const entityResponse = await fetch(`${url}/${who}?${entityParams.toString()}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${getAuthToken()}`,
                    },
                });

                if (!entityResponse.ok) {
                    throw new Error(`Ошибка при получении данных лица: ${entityResponse.status}`);
                }

                const entityData = await entityResponse.json();
                setIsLegalEntity(entityData.isLegalEntity);
                setEntityData(entityData);
                setOriginalData(entityData); // Сохраняем исходные данные
                // console.log('Данные лица:', entityData);
            } catch (error) {
                console.error(`Ошибка при выполнении запросов: ${error.message}`);
            }
        };

        fetchData();
    }, [id, url, isSpecialist]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setEntityData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };

    const handleEditClick = () => {
        setIsEditable(true);
    };

    const handleCancelClick = () => {
        setEntityData(originalData); // Восстанавливаем исходные данные
        setIsEditable(false);
    };



    const handleDeleteClick = async () => {
        try {
            const entityParams = new URLSearchParams();
            const who = isSpecialist ? 'contractor' : 'customer';
            isSpecialist ? entityParams.append('contractorId', id) : entityParams.append('customerId', id);
            const response = await fetch(`${url}/${who}?${entityParams.toString()}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${getAuthToken()}`,
                },
                // body: JSON.stringify(entityData),
            });

            if (!response.ok) {
                throw new Error(`Ошибка при сохранении данных: ${response.status}`);
            }

            const data = await response.json();
            navigate(`/account-actions`);
        } catch (error) {
            console.error(`Ошибка при сохранении данных: ${error.message}`);
        }
    };

    const handleSaveClick = async () => {
        try {
            const who = isSpecialist ? 'contractor' : 'customer';
            const response = await fetch(`${url}/${who}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${getAuthToken()}`,
                },
                body: JSON.stringify(entityData),
            });

            if (!response.ok) {
                throw new Error(`Ошибка при сохранении данных: ${response.status}`);
            }

            const data = await response.json();
            setOriginalData(entityData); // Обновляем исходные данные
            setIsEditable(false); // Отключаем режим редактирования
            // console.log('Данные успешно сохранены:', data);
        } catch (error) {
            console.error(`Ошибка при сохранении данных: ${error.message}`);
        }
    };

    if (!entityData) {
        return <p>Загрузка данных лица...</p>;
    }

    return (
        <div>
            <h3>{isLegalEntity ? 'Юридическое лицо' : 'Физическое лицо'}</h3>
            <form style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '10px', /* Расстояние между элементами */
                alignItems: 'stretch', /* Растянуть элементы на всю ширину контейнера */
                width: '100%', /* Полная ширина */
                maxWidth: '400px', /* Ограничение по ширине (если требуется) */
                margin: '0 auto', /* Центрирование формы */
                padding: '20px', /* Внутренние отступы */
                boxSizing: 'border-box', /* Учитывать отступы в ширине */
            }}>
                {
                    <div>
                        {/* Общие поля для всех типов лиц */}
                        <>
                            <label>ФИО</label>
                            <input
                                type="text"
                                name="fullName" // Поле `fullName` будет использоваться и для названия фирмы
                                value={entityData.fullName || ''}
                                onChange={handleInputChange}
                                disabled={!isEditable}
                            />

                            <label>ИНН</label>
                            <input
                                type="text"
                                name="inn"
                                value={entityData.inn || ''}
                                onChange={handleInputChange}
                                disabled={!isEditable}
                            />

                            <label>Адрес</label>
                            <input
                                type="text"
                                name="address"
                                value={entityData.address || ''}
                                onChange={handleInputChange}
                                disabled={!isEditable}
                            />

                            <label>КПП</label>
                            <input
                                type="text"
                                name="kpp"
                                value={entityData.kpp || ''}
                                onChange={handleInputChange}
                                disabled={!isEditable}
                            />

                            <label>Банк</label>
                            <input
                                type="text"
                                name="bank"
                                value={entityData.bank || ''}
                                onChange={handleInputChange}
                                disabled={!isEditable}
                            />

                            <label>Корреспондентский счет</label>
                            <input
                                type="text"
                                name="corrAcc"
                                value={entityData.corrAcc || ''}
                                onChange={handleInputChange}
                                disabled={!isEditable}
                            />

                            <label>Расчетный счет</label>
                            <input
                                type="text"
                                name="currAcc"
                                value={entityData.currAcc || ''}
                                onChange={handleInputChange}
                                disabled={!isEditable}
                            />

                            <label>БИК</label>
                            <input
                                type="text"
                                name="bik"
                                value={entityData.bik || ''}
                                onChange={handleInputChange}
                                disabled={!isEditable}
                            />
                        </>

                        {/* Поля, которые видны только для юридического лица */}
                        {isLegalEntity && (
                            <>
                                <label>Наименование фирмы</label>
                                <input
                                    type="text"
                                    name="firm"
                                    value={entityData.firm || ''}
                                    onChange={handleInputChange}
                                    disabled={!isEditable}
                                />

                                <label>Должность</label>
                                <input
                                    type="text"
                                    name="position"
                                    value={entityData.position || ''}
                                    onChange={handleInputChange}
                                    disabled={!isEditable}
                                />
                            </>
                        )}
                    </div>
                }


                <div style={{ marginTop: '20px' }}>
                    <>
                        {!isEditable ? (
                            <button type="button" onClick={handleEditClick}>
                                Редактировать
                            </button>
                        ) : (
                            <>
                                <button type="button" onClick={handleSaveClick}>
                                    Сохранить
                                </button>
                                <button type="button" onClick={handleCancelClick}>
                                    Отмена
                                </button>
                            </>
                        )}
                        <button type="button" onClick={handleDeleteClick}>Удалить</button>
                    </>

                </div>
            </form>
        </div>
    );
};

export default EntityDetails;
