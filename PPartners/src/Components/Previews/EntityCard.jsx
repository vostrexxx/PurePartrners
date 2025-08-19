import React, { useState, useEffect } from 'react';
// import { useProfile } from '../../Components/Context/ProfileContext';
import { Row, Col, Card, Button } from 'react-bootstrap';
const EntityCard = ({ onSelectEntity, legalEntities, persons }) => {

    const [selectedEntity, setSelectedEntity] = useState(null);

    const handleSelectEntity = (id) => {
        const newSelectedEntity = selectedEntity === id ? null : id;
        setSelectedEntity(newSelectedEntity);
        onSelectEntity(newSelectedEntity); // Передаём выбранный ID в родительский компонент
    };

    return (
        <Row style={{ gap: '10px' }}>
            {/* Левый столбец - Юридические лица */}
            {legalEntities.length !== 0 &&<Col style={{ flex: 1 }}>
                <h5 style={{ textAlign: 'center' }}>Ваши юридические лица</h5>
                {legalEntities.length > 0 ? (legalEntities.map((entity) => (
                    <Card
                        key={entity.id}
                        onClick={() => handleSelectEntity(entity.id)}
                        style={{
                            margin: '5px 0',
                            backgroundColor: selectedEntity === entity.id ? '#D5D5D5' : 'white',
                            border: '1px solid blue',
                            borderRadius: '5px',
                            cursor: 'pointer',
                        }}
                    >
                        <Card.Body>
                            <Card.Title as="strong">{entity.firm}</Card.Title>
                            <Card.Text>ИНН: {entity.INN}</Card.Text>
                        </Card.Body>
                    </Card>
                ))) : <div className="text-center">Нет юридических лиц</div>}
            </Col>}

            {/* Правый столбец - Физические лица */}
            {persons.length !== 0 && <Col style={{ flex: 1 }}>
                <h5 style={{ textAlign: 'center' }}>Ваши физические лица</h5>
                {persons.length > 0 ? (persons.map((person) => (
                    <Card
                        key={person.id}
                        onClick={() => handleSelectEntity(person.id)}
                        style={{
                            margin: '5px 0',
                            backgroundColor: selectedEntity === person.id ? '#D5D5D5' : 'white',
                            border: '1px solid blue',
                            borderRadius: '5px',
                            cursor: 'pointer',
                        }}
                    >
                        <Card.Body>
                            <Card.Title as="strong">{person.fullName}</Card.Title>
                            <Card.Text>ИНН: {person.INN}</Card.Text>
                        </Card.Body>
                    </Card>
                ))) : (<div className="text-center">Нет физических лиц</div>)}
            </Col>}
        </Row>

    );
};

export default EntityCard;
