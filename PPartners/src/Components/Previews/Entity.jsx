import React, { useState, useEffect } from 'react';
import { useProfile } from '../../Context/ProfileContext';

const Entity = ({ onSelectEntity }) => {
    const url = localStorage.getItem('url');
    const authToken = localStorage.getItem('authToken');
    const { isSpecialist } = useProfile();

    const [legalEntities, setLegalEntities] = useState([]);
    const [persons, setPersons] = useState([]);
    const [selectedEntity, setSelectedEntity] = useState(null); // ID выбранного лица

    useEffect(() => {
        const fetchDataLegal = async () => {
            try {
                const response = await fetch(`${url}/${isSpecialist ? 'contractor' : 'customer'}/legal-entity`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${authToken}`,
                    },
                });

                if (!response.ok) {
                    throw new Error(`Ошибка сети: ${response.status}`);
                }

                const data = await response.json();
                setLegalEntities(data);
            } catch (error) {
                console.error('Ошибка при загрузке юрлиц:', error.message);
            }
        };

        const fetchDataPerson = async () => {
            try {
                const response = await fetch(`${url}/${isSpecialist ? 'contractor' : 'customer'}/person`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${authToken}`,
                    },
                });

                if (!response.ok) {
                    throw new Error(`Ошибка сети: ${response.status}`);
                }

                const data = await response.json();
                setPersons(data);
            } catch (error) {
                console.error('Ошибка при загрузке физлиц:', error.message);
            }
        };

        fetchDataLegal();
        fetchDataPerson();
    }, [isSpecialist, url, authToken]);

    const handleSelectEntity = (id) => {
        setSelectedEntity(id);
        onSelectEntity(id); // Передаём выбранный ID в родительский компонент
    };

    return (
        <div style={{ display: 'flex', gap: '20px' }}>
            {/* Левый столбец - Юридические лица */}
            <div style={{ flex: 1 }}>
                <h3 style={{ textAlign: 'center', color: 'white' }}>Юридические лица</h3>
                {legalEntities.map((entity) => (
                    <div
                        key={entity.id}
                        onClick={() => handleSelectEntity(entity.id)}
                        style={{
                            padding: '10px',
                            margin: '5px 0',
                            backgroundColor: selectedEntity === entity.id ? '#4114f5' : '#bd0999',
                            border: '1px solid blue',
                            borderRadius: '5px',
                            cursor: 'pointer',
                        }}
                    >
                        <strong>{entity.firm}</strong>
                        <p>ИНН: {entity.inn}</p>
                    </div>
                ))}
            </div>

            {/* Правый столбец - Физические лица */}
            <div style={{ flex: 1 }}>
                <h3 style={{ textAlign: 'center', color: 'white' }}>Физические лица</h3>
                {persons.map((person) => (
                    <div
                        key={person.id}
                        onClick={() => handleSelectEntity(person.id)}
                        style={{
                            padding: '10px',
                            margin: '5px 0',
                            backgroundColor: selectedEntity === person.id ? '#4114f5' : '#bd0999',
                            border: '1px solid green',
                            borderRadius: '5px',
                            cursor: 'pointer',
                        }}
                    >
                        <strong>{person.fullName}</strong>
                        <p>ИНН: {person.inn}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Entity;
