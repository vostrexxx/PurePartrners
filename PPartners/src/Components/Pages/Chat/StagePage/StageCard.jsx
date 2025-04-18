import React from 'react';
import { Card, Badge } from "react-bootstrap";

const StageCard = ({ stage, onClick }) => {
    // Определяем цвет статуса в зависимости от stageStatus
    const getStatusVariant = () => {
        switch (stage.stageStatus) {
            case 'В ожидании заморозки средств':
                return 'warning';
            case 'Средства заморожены':
                return 'primary';
            case 'Работа завершена':
                return 'success';
            case 'Работа отменена':
                return 'danger';
            default:
                return 'secondary';
        }
    };

    return (
        <div style={styles.card} onClick={onClick} className='mb-3'>
            <Card.Body>
                <div className="d-flex justify-content-between align-items-start mb-3">
                    <Card.Title style={styles.title}>
                        {stage.stageTitle || 'Этап пуст'}
                    </Card.Title>
                    <Badge pill bg={getStatusVariant()} style={styles.badge}>
                        {stage.stageStatus || 'Нажмите, чтобы создать'}
                    </Badge>
                </div>

                <div className="mb-3">
                    <div style={styles.price}>
                        {stage.totalPrice > 0 && (
                            <div style={styles.priceSection}>
                                <span style={styles.priceLabel}>Сумма этапа: </span>
                                <span style={styles.priceValue}>
                                    {stage.totalPrice.toLocaleString('ru-RU')} ₽
                                </span>
                            </div>
                        )}
                    </div>
                </div>

                {stage.subWorkCategories?.length > 0 && (
                    <div className='mt-3'>
                        <b>Категории работ:</b>
                        <div style={styles.categoriesContainer}>
                            {stage.subWorkCategories.map((category, index) => (
                                <div key={index} style={styles.categoryItem}>
                                    {category}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </Card.Body>
        </div>
    );
};

const styles = {
    card: {
        color: 'black',
        border: '1px solid #ddd',
        borderRadius: '10px',
        padding: '20px',
        cursor: 'pointer',
        backgroundColor: '#fff',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
        transition: 'transform 0.2s, box-shadow 0.2s',
        ':hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
        }
    },
    title: {
        fontSize: '1.25rem',
        fontWeight: '600',
        marginBottom: '0'
    },
    badge: {
        fontSize: '0.75rem',
        padding: '6px 10px',
        fontWeight: '500'
    },
    price: {
        fontSize: '1rem',
        color: '#333'
    },
    categoriesContainer: {
        maxHeight: '150px',
        overflowY: 'auto',
        border: '1px solid #eee',
        borderRadius: '6px',
        padding: '10px',
        marginTop: '8px',
        backgroundColor: '#f9f9f9'
    },
    categoryItem: {
        padding: '6px 0',
        borderBottom: '1px solid #f0f0f0',
        ':last-child': {
            borderBottom: 'none'
        }
    }
};

export default StageCard;