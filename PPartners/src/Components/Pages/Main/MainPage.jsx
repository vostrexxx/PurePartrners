import React, { useEffect, useState } from 'react'; // Добавляем импорт useState
import { Switch } from '@mui/material';
import { useProfile } from '../../Context/ProfileContext'; // Импортируем хук профиля
import { useNavigate } from 'react-router-dom';
import { FaUserCircle } from 'react-icons/fa';

const MainPage = () => {
    const { isSpecialist, toggleProfile } = useProfile(); // Доступ к состоянию профиля
    const navigate = useNavigate();
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const getAuthToken = () => localStorage.getItem('authToken');

    // Функциаонал под карточки объявлений и анкет
    const [announcements, setAnnouncements] = useState();
    const [questionnaires, setQuestionnaires] = useState();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    let url = localStorage.getItem('url');


    const toggleDropdown = () => {
        setDropdownOpen(!dropdownOpen);
    };

    useEffect(() => {
        // Чистим данные при переключении
        setAnnouncements([])
        setQuestionnaires([])
        setLoading(true);
        setError(null);

        const fetchData = async () =>{
            try {
                let response;
                if (isSpecialist){
                    // console.log(isSpecialist, url + 'questionnaire/filter')
                    // Если активен спец, то делаем запрос на анкеты
                    response = await fetch(url + '/questionnaire/filter', {
                        method: 'GET',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${getAuthToken()}`,
                        }
                    });
                    const data = await response.json();
                    // Устанавливаем данные под анкеты 
                    setQuestionnaires(data);
                } else {
                    // Если активен заказчик, то делаем запрос на объявы
                    response = await fetch(url + '/announcement/filter', {
                        method: 'GET',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${getAuthToken()}`,
                        }
                    });
                    const data = await response.json();
                    // Устанавливаем данные под объявы 
                    setAnnouncements(data)
                }
            } catch (error) {
                setError('Чё-то бля ошибки какие-то я хз че там')
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    // массив зависимостей
    }, [isSpecialist]); // useEffect будет вызываться, когда будет изменяться isSpecialist,
    //  он как бы слушается на изменения 

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
        color: 'white', // Цвет текста для лучшей видимости
    },
    dropdownItemHover: {
        backgroundColor: '#f0f0f0',
    },
    profileSwitchContainer: {
        display: 'flex',
        alignItems: 'center',
        color: 'black',
        marginLeft: '20px', // Добавляем отступ между переключателем и иконкой профиля
    },
    mainContent: {
        padding: '70px 20px 20px',
    },
};

export default MainPage;
