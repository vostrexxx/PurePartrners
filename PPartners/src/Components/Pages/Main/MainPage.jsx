import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUserCircle } from 'react-icons/fa';

const MainPage = () => {
    const navigate = useNavigate();
    const [dropdownOpen, setDropdownOpen] = useState(false);

    // const handleProfileClick = () => {
    //     navigate('/profile');
    // };

    const toggleDropdown = () => {
        setDropdownOpen(!dropdownOpen);
    };

    return (
        <div>
            <div style={styles.topBar}>
                <div style={styles.topBarContent}>
                    <div style={styles.profileContainer}>
                        <FaUserCircle size={30} style={styles.profileIcon} onClick={toggleDropdown} />
                        {dropdownOpen && (
                            <div style={styles.dropdownMenu}>
                                <ul style={styles.dropdownList}>
                                    <li style={styles.dropdownItem} onClick={() => navigate('/account-actions')}>Работа с аккаунтом</li>
                                    {/* <li style={styles.dropdownItem} onClick={() => navigate('/profiles')}>Работа с профилями</li>
                                    <li style={styles.dropdownItem} onClick={() => navigate('/account-actions')}>Действия с аккаунтом</li> */}
                                </ul>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            <div style={styles.mainContent}>
                {/* Основное содержание страницы */}
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
    lkButton: {
        fontSize: '16px',
        cursor: 'pointer',
    },
    profileContainer: {
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
    },
    profileIcon: {
        cursor: 'pointer',
        color: '#333',
    },
    dropdownMenu: {
        position: 'absolute',
        top: '35px',
        right: 0,
        backgroundColor: 'white',
        border: '1px solid #ccc',
        boxShadow: '0px 2px 10px rgba(0, 0, 0, 0.1)',
        borderRadius: '4px',
        zIndex: 1000,
        minWidth: '150px', 
        visibility: 'visible', 
        opacity: 1, // Делаем меню полностью видимым
        transition: 'opacity 0.3s ease', // Плавный переход
    },
    dropdownList: {
        listStyle: 'none',
        padding: '0',
        margin: '0',
    },
    dropdownItem: {
        padding: '10px 20px',
        cursor: 'pointer',
        backgroundColor: 'black',
    },
    dropdownItemHover: {
        backgroundColor: '#f0f0f0',
    },
    mainContent: {
        padding: '70px 20px 20px',
    },
};

export default MainPage;