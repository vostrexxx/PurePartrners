import React, {useEffect, useState} from 'react';
import {Drawer, TextField, Checkbox, FormControlLabel, Radio, RadioGroup, FormControl} from '@mui/material';
import {useProfile} from '../../Context/ProfileContext';
import {useNavigate} from 'react-router-dom';

import {DatePicker, LocalizationProvider} from '@mui/x-date-pickers';
import {AdapterDateFns} from '@mui/x-date-pickers/AdapterDateFns';
import {format} from 'date-fns';
import Card from '../../Previews/Card';
import SearchComponent from '../SearchComponent/SearchComponent';
import TopBar from '../../TopBars/TopBar';
import ErrorMessage from '../../ErrorHandling/ErrorMessage';
import {Container, Row, Col, Nav, Button, Tab, Form} from "react-bootstrap";
import {FaFilter} from 'react-icons/fa';

const MainPage = () => {
    const {isSpecialist, toggleProfile} = useProfile();
    const navigate = useNavigate();
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [announcements, setAnnouncements] = useState([]);
    const [questionnaires, setQuestionnaires] = useState([]);
    const [loading, setLoading] = useState(false);

    const [error, setError] = useState(null);


    let url = localStorage.getItem('url');
    const getAuthToken = () => localStorage.getItem('authToken');

    const toggleDropdown = () => setDropdownOpen(!dropdownOpen);
    const toggleFilterDrawer = () => setIsFilterOpen(!isFilterOpen);


    // Состояние для применённых фильтров
    const [appliedQuestionnaireFilters, setAppliedQuestionnaireFilters] = useState({});
    const [appliedAnnouncementFilters, setAppliedAnnouncementFilters] = useState({});

    // Применение фильтров для анкет
    const applyQuestionnaireFilters = () => {
        setAppliedQuestionnaireFilters(questionnaireFilterParams);
        toggleFilterDrawer(); // Закрыть drawer (если используется)
    };

    // Применение фильтров для объявлений
    const applyAnnouncementFilters = () => {
        setAppliedAnnouncementFilters(announcementParams);
        toggleFilterDrawer(); // Закрыть drawer (если используется)
    };
    // const [appliedFilters, setAppliedFilters] = useState({ ...filterParams });


    const handleSearch = async (searchText) => {
        setLoading(true);

        const params = new URLSearchParams();

        params.append('text', searchText || '');

        if (!isSpecialist) {
            if (appliedQuestionnaireFilters.minPrice) {
                params.append('minPrice', appliedQuestionnaireFilters.minPrice);
            }
            if (appliedQuestionnaireFilters.experience) {
                params.append('minWorkExp', appliedQuestionnaireFilters.experience);
            }
            if (appliedQuestionnaireFilters.hasEdu) {
                params.append('hasEdu', 'true');
            }
            if (appliedQuestionnaireFilters.hasTeam === 'yes') {
                params.append('hasTeam', 'true');
            }
            if (appliedQuestionnaireFilters.hasTeam === 'no') {
                params.append('hasTeam', 'false');
            }
        }

        if (isSpecialist) {
            if (appliedAnnouncementFilters.minCost) {
                params.append('minCost', appliedAnnouncementFilters.minCost);
            }
            if (appliedAnnouncementFilters.maxCost) {
                params.append('maxCost', appliedAnnouncementFilters.maxCost);
            }
            if (appliedAnnouncementFilters.startDate) {
                params.append('startDate', formatDate(appliedAnnouncementFilters.startDate));
            }
            if (appliedAnnouncementFilters.finishDate) {
                params.append('finishDate', formatDate(appliedAnnouncementFilters.finishDate));
            }
        }

        const urlWithParams = isSpecialist
            ? `${url}/announcement/filter?${params.toString()}`
            : `${url}/questionnaire/filter?${params.toString()}`;

        const response = await fetch(urlWithParams, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${getAuthToken()}`,
            },
        });

        const data = await response.json();

        if (response.ok) {
            if (isSpecialist) {
                setAnnouncements(data.previews || []);
            } else {
                setQuestionnaires(data.previews || []);
            }
        } else {
            setError({message: data.userFriendlyMessage, status: data.status});
        }

    };

    const formatDate = (date) => {
        if (!date) return '';
        return format(date, 'yyyy-MM-dd');
    };

    const applyFilters = () => {
        if (!isSpecialist) {
            setAppliedQuestionnaireFilters(questionnaireFilterParams); // Применяем фильтры для анкет
        } else {
            setAppliedAnnouncementFilters(announcementParams); // Применяем фильтры для объявлений
        }
        toggleFilterDrawer(); // Закрываем drawer
    };

    const submitFilters = () => {
        handleSearch(filterParams.workCategories);
    };

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setError(null);


            let response;
            const params = new URLSearchParams({text: ""});

            if (isSpecialist) {
                response = await fetch(`${url}/announcement/filter?${params.toString()}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${getAuthToken()}`,
                    },
                });
            } else {
                response = await fetch(`${url}/questionnaire/filter?${params.toString()}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${getAuthToken()}`,
                    },
                });
            }

            const data = await response.json();
            // console.log(data)
            if (response.ok) {
                if (isSpecialist) {
                    setAnnouncements(data.previews || []);
                } else {
                    setQuestionnaires(data.previews || []);
                }
            } else {
                setError({message: data.userFriendlyMessage, status: data.status});
            }

        };

        fetchData();
    }, [isSpecialist]);



    const [questionnaireFilterParams, setQuestionnaireFilterParams] = useState({
        minPrice: "",
        experience: "",
        hasTeam: 'any',
        hasEdu: false
    });

    const handleQuestionnaireFilterChange = (key, value) => {
        setQuestionnaireFilterParams(prevState => ({
            ...prevState,
            [key]: value
        }));
    };

    const handleQuestionnaireHasTeamChange = (e) => {
        handleQuestionnaireFilterChange('hasTeam', e.target.value);
    };


    const [announcementParams, setAnnouncementFilterParams] = useState({
        startDate: null, // Начальная дата
        finishDate: null, // Конечная дата
        minCost: '', // Минимальная стоимость
        maxCost: '', // Максимальная стоимость
    });

    // Обработка изменения даты
    const handleAnnouncementDateChange = (key, date) => {
        setAnnouncementFilterParams(prevState => ({
            ...prevState,
            [key]: date,
        }));
    };

    // Обработка изменения текстовых полей (стоимость)
    const handleAnnouncementCostChange = (e) => {
        const {name, value} = e.target;
        setAnnouncementFilterParams(prevState => ({
            ...prevState,
            [name]: value,
        }));
    };

    return (
        <div style={{display: "flex", flexDirection: "column", height: "100vh"}}>
            <TopBar/>
            <Container
                fluid
                style={{
                    // backgroundColor: "#242582",
                    flex: 1,
                    padding: "20px",
                }}
                className='BG'
            >
                <Row className="justify-content-center">
                    <Col xs={12} md={10} lg={8}>

                        {/* <div style={styles.mainContent}> */}
                        <h2 className="text-white">{isSpecialist ? "Поиск объявлений" : "Поиск анкет"}</h2>
                        {/* </div> */}

                        <ErrorMessage
                            message={error?.message}
                            statusCode={error?.status}
                        />

                        <div className='mb-3'>
                            <SearchComponent onSearch={handleSearch}/>
                            <Button
                                onClick={toggleFilterDrawer}
                                style={styles.fixedButton}
                            >
                                <FaFilter/>
                            </Button>
                        </div>

                        <Drawer anchor="right" open={isFilterOpen} onClose={toggleFilterDrawer}>
                            <div style={{width: '300px', padding: '20px'}}>
                                <h2 className='mb-3'>Фильтры</h2>
                                {!isSpecialist ? (
                                    <div>
                                        <div className='mb-3'>
                                            <h5>Имеется ли команда?</h5>
                                            <FormControl component="fieldset">
                                                <RadioGroup
                                                    name="hasTeam"
                                                    value={questionnaireFilterParams.hasTeam}
                                                    onChange={handleQuestionnaireHasTeamChange}
                                                >
                                                    <FormControlLabel value="any" control={<Radio/>} label="Неважно"/>
                                                    <FormControlLabel value="yes" control={<Radio/>} label="Да"/>
                                                    <FormControlLabel value="no" control={<Radio/>} label="Нет"/>
                                                </RadioGroup>
                                            </FormControl>
                                        </div>

                                        <div className='mb-3'>
                                            <h5>Профильное образование</h5>
                                            <FormControlLabel
                                                control={
                                                    <Checkbox
                                                        checked={questionnaireFilterParams.hasEdu}
                                                        onChange={(e) => handleQuestionnaireFilterChange('hasEdu', e.target.checked)}
                                                        name="hasEdu"
                                                    />
                                                }
                                                label="Имеется профильное образование"
                                            />
                                        </div>

                                        <div className='mb-3'>
                                            <h5>Минимальный опыт работы</h5>
                                            <Row className="align-items-center">
                                                <Col xs={12}>
                                                    <Form.Control
                                                        type="number"
                                                        value={questionnaireFilterParams.experience}
                                                        onChange={(e) => {
                                                            const value = e.target.value;
                                                            handleQuestionnaireFilterChange('experience', value);
                                                        }}
                                                        min={0}
                                                        max={50}
                                                        style={{width: '150px'}}
                                                    />
                                                </Col>
                                            </Row>
                                        </div>

                                        {/* Минимальная цена */}
                                        <div
                                            hidden="true">
                                            <h5>Минимальная цена</h5>
                                            <Row className="align-items-center">
                                                <Col xs={12}>
                                                    <Form.Control
                                                        type="number"
                                                        value={questionnaireFilterParams.minPrice}
                                                        onChange={(e) => {
                                                            const value = e.target.value;
                                                            handleQuestionnaireFilterChange('minPrice', value);
                                                        }}
                                                        style={{width: '150px'}}
                                                    />
                                                </Col>
                                            </Row>
                                        </div>
                                    </div>
                                ) : (
                                    <div>
                                        <div className='mb-3'>
                                            <h5>Даты проведения работ</h5>
                                            <LocalizationProvider dateAdapter={AdapterDateFns}>
                                                <DatePicker
                                                    label="Дата начала"
                                                    value={announcementParams.startDate}
                                                    onChange={(date) => handleAnnouncementDateChange('startDate', date)}
                                                    renderInput={(params) => <TextField {...params} fullWidth
                                                                                        margin="normal"/>}
                                                    className='mb-2'
                                                />
                                                <DatePicker
                                                    label="Дата окончания"
                                                    value={announcementParams.finishDate}
                                                    onChange={(date) => handleAnnouncementDateChange('finishDate', date)}
                                                    renderInput={(params) => <TextField {...params} fullWidth
                                                                                        margin="normal"/>}
                                                />
                                            </LocalizationProvider>
                                        </div>
                                        <div className='mb-3'>
                                            <h5>Общая стоимость</h5>
                                            <div style={{display: 'flex', gap: '5px', alignItems: 'center'}}>
                                                <TextField
                                                    label="От"
                                                    name="minCost"
                                                    value={announcementParams.minCost}
                                                    onChange={handleAnnouncementCostChange}
                                                    type="number"
                                                    fullWidth
                                                    // margin="normal"
                                                    sx={{
                                                        "& input[type='number']": {
                                                            MozAppearance: "textfield",
                                                        },
                                                        "& input[type='number']::-webkit-inner-spin-button, & input[type='number']::-webkit-outer-spin-button": {
                                                            WebkitAppearance: "none",
                                                            margin: 0,
                                                        },
                                                    }}
                                                />
                                                <span>-</span>
                                                <TextField
                                                    label="До"
                                                    name="maxCost"
                                                    value={announcementParams.maxCost}
                                                    onChange={handleAnnouncementCostChange}
                                                    type="number"
                                                    fullWidth
                                                    // margin="normal"
                                                    sx={{
                                                        "& input[type='number']": {
                                                            MozAppearance: "textfield", // Для Firefox
                                                        },
                                                        "& input[type='number']::-webkit-inner-spin-button, & input[type='number']::-webkit-outer-spin-button": {
                                                            WebkitAppearance: "none", // Для Chrome и Safari
                                                            margin: 0,
                                                        },
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <Button color="primary" className='w-100' onClick={applyFilters} fullWidth>
                                    Применить
                                </Button>
                            </div>
                        </Drawer>
                        <hr className=''
                            style={{
                                height: '2px',
                                background: "white",
                                // margin: margin,
                            }}/>
                        <div className=''>
                            {!isSpecialist ? (
                                <div>
                                    {questionnaires.length > 0 ? (
                                        questionnaires.map((item) => (
                                            <Card
                                                title={item.workCategories}
                                                onClick={() => navigate(`/questionnaire/${item.id}`, {state: {fromLk: false}})}
                                                key={item.id}
                                                totalCost={item.totalCost}
                                                address={item.address}
                                                workExp={item.workExp}
                                                hasTeam={item.hasTeam}
                                                hasEdu={item.hasEdu}
                                                type={"questionnaire"}
                                            />
                                        ))
                                    ) : (
                                        <p className='text-white text-center'>Нет анкет, удовлетворяющих вашему
                                            запросу</p>
                                    )}
                                </div>
                            ) : (
                                <div>
                                    {/* <h2>Объявления:</h2> */}
                                    {announcements.length > 0 ? (
                                        announcements.map((item) => (
                                            <Card
                                                title={item.workCategories}
                                                onClick={() => navigate(`/announcement/${item.id}`, {state: {fromLk: false}})}
                                                key={item.id}
                                                totalCost={item.totalCost}
                                                address={item.address}
                                                workExp={item.workExp}
                                                hasTeam={item.hasTeam}
                                                hasEdu={item.hasEdu}
                                                // onClick={() => navigate(`/${type}/${data.id}`, { state: { fromLk: null } })}
                                                type={"announcement"}
                                            />
                                        ))
                                    ) : (
                                        <p className='text-white text-center'>Нет объявлений, удовлетворяющих вашему
                                            запросу</p>
                                    )}
                                </div>
                            )}
                        </div>
                    </Col>
                </Row>


            </Container>
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
        opacity: 1,
        transition: 'opacity 0.3s ease',
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
        color: 'white',
    },
    profileSwitchContainer: {
        display: 'flex',
        alignItems: 'center',
        color: 'black',
        marginLeft: '20px',
    },
    mainContent: {
        // padding: '70px 20px 20px',
    },

    fixedButton: {
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        zIndex: 1000,
        borderRadius: '50%',
        width: '50px',
        height: '50px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },


};

export default MainPage;
