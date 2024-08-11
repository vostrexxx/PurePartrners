import React from 'react';
import { useNavigate } from 'react-router-dom'; // Импортируем useNavigate
import { Switch, styled } from '@mui/material';

const CustomSwitch = styled(Switch)(({ theme }) => ({
    '& .MuiSwitch-switchBase.Mui-checked': {
        color: '#FF7101', // Цвет переключателя в состоянии включения
        '&:hover': {
            backgroundColor: 'rgba(255, 113, 1, 0.08)', // Цвет фона при наведении
        },
    },
    '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
        backgroundColor: '#FF7101', // Цвет трека в состоянии включения
    },
    '& .MuiSwitch-track': {
        backgroundColor: '#242582', // Цвет трека в состоянии выключения
    },
}));

const MainPage = () => {
    const navigate = useNavigate(); // Создаем экземпляр useNavigate
    const [switchState, setSwitchState] = React.useState(false);

    const handleSwitchChange = (event) => {
        setSwitchState(event.target.checked);
    };

    const handleProfileClick = () => {
        navigate('/profile'); // Перенаправляем на страницу профиля
    };

    return (
        <div>
            <div style={styles.topBar}>
                <div style={styles.topBarContent}>
                    <button style={styles.lkButton} onClick={handleProfileClick}>ЛК</button>
                    <CustomSwitch
                        checked={switchState}
                        onChange={handleSwitchChange}
                    />
                </div>
            </div>
            <div style={styles.mainContent}>
                {/* Add your main content here */}
            </div>
        </div>
    );
};

const styles = {
    topBar: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '50px',
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
    lkButton: {
        fontSize: '16px',
        cursor: 'pointer',
    },
    mainContent: {
        padding: '70px 20px 20px',
    },
};

export default MainPage;
