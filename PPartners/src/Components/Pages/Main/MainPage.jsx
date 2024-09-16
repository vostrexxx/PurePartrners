import React from 'react';
import { Switch } from '@mui/material';
import { useProfile } from '../../Context/ProfileContext'; // Импортируем хук профиля

const MainPage = () => {
    const { isSpecialist, toggleProfile } = useProfile(); // Доступ к состоянию профиля

    return (
        <div>
            <div style={styles.topBar}>
                <div style={styles.topBarContent}>
                    <div style={styles.profileSwitchContainer}>
                        <span>Заказчик</span>
                        <Switch
                            checked={isSpecialist}
                            onChange={toggleProfile}
                            color="primary"
                        />
                        <span>Специалист</span>
                    </div>
                </div>
            </div>
            <div style={styles.mainContent}>
                {isSpecialist ? (
                    <div>Интерфейс Специалиста</div>
                ) : (
                    <div>Интерфейс Заказчика</div>
                )}
            </div>
        </div>
    );
};

const styles = {
    topBar: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '5%',
        width: '100%',
        padding: '0 20px',
        backgroundColor: '#f8f8f8',
        borderBottom: '1px solid #ddd',
        position: 'fixed',
        top: 0,
        left: 0,
        zIndex: 1000,
    },
    topBarContent: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
        maxWidth: '1200px',
    },
    profileSwitchContainer: {
        display: 'flex',
        alignItems: 'center',
        color: 'black'
    },
    mainContent: {
        padding: '70px 20px 20px',
    },
};

export default MainPage;
