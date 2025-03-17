import React, { useState, useEffect } from 'react';
import { useProfile } from '../../Components/Context/ProfileContext';
import { Row, Col, Card, Button } from 'react-bootstrap';
const EntityCard = ({ onSelectEntity }) => {
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
        <Row style={{ gap: '10px' }}>
            {/* Левый столбец - Юридические лица */}
            <Col style={{ flex: 1 }}>
                <h5 style={{ textAlign: 'center', color: 'white' }}>Ваши юридические лица</h5>
                {legalEntities.length > 0 ? (legalEntities.map((entity) => (
                    <Card
                        key={entity.id}
                        onClick={() => handleSelectEntity(entity.id)}
                        style={{
                            margin: '5px 0',
                            backgroundColor: selectedEntity === entity.id ? 'grey' : 'white',
                            border: '1px solid blue',
                            borderRadius: '5px',
                            cursor: 'pointer',
                        }}
                    >
                        <Card.Body>
                            <Card.Title as="strong">{entity.firm}</Card.Title>
                            <Card.Text>ИНН: {entity.inn}</Card.Text>
                        </Card.Body>
                    </Card>
                ))) : <div className="text-center">Нет юридических лиц</div>}
            </Col>

            {/* Правый столбец - Физические лица */}
            <Col style={{ flex: 1 }}>
                <h5 style={{ textAlign: 'center', color: 'white' }}>Ваши физические лица</h5>
                {persons.length > 0 ? (persons.map((person) => (
                    <Card
                        key={person.id}
                        onClick={() => handleSelectEntity(person.id)}
                        style={{
                            margin: '5px 0',
                            backgroundColor: selectedEntity === person.id ? 'grey' : 'white',
                            border: '1px solid green',
                            borderRadius: '5px',
                            cursor: 'pointer',
                        }}
                    >
                        <Card.Body>
                            <Card.Title as="strong">{person.fullName}</Card.Title>
                            <Card.Text>ИНН: {person.inn}</Card.Text>
                        </Card.Body>
                    </Card>
                ))) : (<div className="text-center">Нет физических лиц</div>)}
            </Col>
        </Row>

    );
};

export default EntityCard;
