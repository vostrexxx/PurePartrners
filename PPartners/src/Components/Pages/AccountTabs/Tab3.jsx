import React, { useState, useEffect } from 'react';

// Компонент для отображения поля формы
const FormField = ({ type, label, name, placeholder, value, onChange, disabled, hidden }) => {
    if (hidden) {
        return null
    }
    else{
        return (
            <div>
                <label>{label}</label>
                <input
                    type={type}
                    name={name}
                    placeholder={placeholder}
                    value={value}
                    onChange={onChange}
                    disabled={disabled}
                />
            </div>
        );
    
    } };
let url = localStorage.getItem('url')

const FormPage = () => {
    const [formData, setFormData] = useState({
        totalCost: '',
        workCategories: '',
        metro: '',
        house: '',
        other: '',
        hasOther: false,
        objectName: '',
        startDate: '',
        finishDate: '',
        comments: ''
    });

    const [isEditable, setIsEditable] = useState(false);
    const [isDataLoaded, setIsDataLoaded] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);
    const [imageFile, setImageFile] = useState(null);
    const [error, setError] = useState(null);



    
    useEffect(() => {
        let isMounted = true;
        const fetchData = async () => {
            const authToken = getAuthToken();
            if (!authToken) {
                console.error('Токен не найден');
                setIsDataLoaded(true);
                return;
            }
            try {
                const [customerResponse, imageResponse] = await Promise.all([
                    fetch(url + '/customer', {
                        method: 'GET',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${authToken}`
                        }
                    }),
                    fetch(url + '/customer/image', {
                        method: 'GET',
                        headers: {
                            'Authorization': `Bearer ${authToken}`,
                        }
                    })
                ]);
    
                if (!customerResponse.ok) {
                    throw new Error('Ошибка сети при загрузке данных о подрядчике');
                }
    
                const customerData = await customerResponse.json();
    
                if (customerData.success === 0) {
                    console.log('Ответ success: 0, устанавливаем значения по умолчанию');
                    setFormData({
                        totalCost: '', //
                        other: '',// 
                        hasOther: false,// o 
                        workCategories: '', // o  
                        metro: '', //
                        house: '', //
                        
                        objectName: '', // o
                        startDate: '', // 
                        finishDate: '', //
                        comments: '' // o
                    });
                } else {
                    setFormData(customerData.customer);
                }
    
                if (imageResponse.ok) {
                    const imageBlob = await imageResponse.blob();
                    if (isMounted) {
                        setSelectedImage(URL.createObjectURL(imageBlob));
                    }
                } else if (imageResponse.status === 400) {
                    const errorMessage = await imageResponse.text();
                    if (errorMessage.includes("Image not found")) {
                        // Изображение не найдено, не выводим ошибку, оставляем форму для загрузки фото
                        console.log('Изображение не найдено. Показать форму для загрузки фото.');
                    } else {
                        throw new Error('Ошибка сети при загрузке изображения');
                    }
                }
    
            } catch (error) {
                console.error('Ошибка при загрузке данных:', error);
                if (isMounted) setError('Ошибка загрузки данных. Попробуйте позже.');
            } finally {
                if (isMounted) setIsDataLoaded(true);
            }
        };
    
        fetchData();
    
        return () => {
            isMounted = false; // Очищаем состояние при размонтировании
        };
    }, []);
    

    const handleImageChange = (event) => {
        if (event.target.files && event.target.files.length > 0) {
            const file = event.target.files[0];
            setImageFile(file); // Сохраняем файл изображения
            const imageURL = URL.createObjectURL(file);
            setSelectedImage(imageURL); // Отображаем изображение
        }
    };

    const handleRemoveImage = () => {
        if (window.confirm("Вы уверены, что хотите удалить изображение?")) {
            setSelectedImage(null);
            setImageFile(null); // Очищаем выбранное изображение
        }
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: type === 'checkbox' ? checked : value,  // Для чекбоксов используем булевые значения
        }));
    };

    const handleEdit = () => {
        setIsEditable(true);
    };

    const handleSubmitProfile = async (e) => {
        e.preventDefault();

        try {
            const authToken = getAuthToken();
            if (!authToken) {
                alert('Токен не найден');
                return;
            }

            const response = await fetch(url + '/customer', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authToken}`
                },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                alert('Профиль успешно обновлен!');
                setIsEditable(false);
            } else {
                const errorMsg = await response.text();
                console.error('Ошибка:', errorMsg);
                alert(`Ошибка при обновлении профиля: ${errorMsg}`);
            }
        } catch (error) {
            console.error('Ошибка при отправке запроса:', error);
            alert('Произошла ошибка. Попробуйте снова.');
        }
    };

    const handleSubmitPhoto = async () => {
        if (!imageFile) {
            alert('Пожалуйста, выберите файл.');
            return;
        }

        const imageFormData = new FormData();
        imageFormData.append('image', imageFile);

        try {
            const authToken = getAuthToken();
            if (!authToken) {
                alert('Токен не найден');
                return;
            }

            const response = await fetch(url + '/customer/image', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                },
                body: imageFormData,
            });

            const data = await response.json();

            if (data && data.success) {
                alert('Фото успешно загружено!');
                const photoURL = URL.createObjectURL(imageFile);
                setSelectedImage(photoURL);
            } else {
                alert('Ошибка при загрузке фото.');
            }
        } catch (error) {
            console.error('Ошибка при загрузке фото:', error);
            alert('Произошла ошибка. Попробуйте снова.');
        }
    };

    if (!isDataLoaded) {
        return <div>Загрузка...</div>;
    }

    if (error) {
        return <div>{error}</div>;
    }

    return (
        <div>
            <h2>Фото объекта</h2>
            <div>
                {selectedImage ? (
                    <div>
                        <img
                            src={selectedImage}
                            alt="Uploaded"
                            style={{ width: "300px", marginTop: "20px" }}
                        />
                        <button onClick={handleRemoveImage} style={{ display: "block", marginTop: "10px" }}>
                            Удалить
                        </button>
                        {imageFile && (
                            <button onClick={handleSubmitPhoto} style={{ display: "block", marginTop: "10px" }}>
                                Сохранить
                            </button>
                        )}
                    </div>
                ) : (
                    <div>
                        <input type="file" accept="image/*" onChange={handleImageChange} />
                    </div>
                )}
            </div>
            <h2>Объявление</h2>
            <FormField
                type="text"
                label="Стоимость ваших работ"
                name="totalCost"
                placeholder="Стоимость работ"
                value={formData.totalCost}
                onChange={handleInputChange}
                disabled={!isEditable}
            />
            
            {/* totalCost: '',
        workCategories: '',
        metro: '',
        house: '',
        other: '',
        hasOther: false,
        objectName: '',
        startDate: '',
        finishDate: '',
        comments: '' */}

            <FormField
                type="text"
                label="Категории ваших работ"
                name="workCategories"
                placeholder="Категория работ"
                value={formData.workCategories}
                onChange={handleInputChange}
                disabled={!isEditable}
                // hidden={!formData.hasTeam}
            />

            <FormField
                type="text"
                label="Станция метро объекта"
                name="metro"
                placeholder="м. Киевская"
                value={formData.metro}
                onChange={handleInputChange}
                disabled={!isEditable}
                // hidden={!formData.hasEdu}
            />
            <FormField
                type="text"
                label="Дом"
                name="house"
                placeholder="9 корпус 1"
                value={formData.house}
                onChange={handleInputChange}
                disabled={!isEditable}
                // hidden={!formData.hasEdu}
            />
            <FormField
                type="text"
                label="Адрес"
                name="other"
                placeholder="Дом Пушкина на улице Калатушкина"
                value={formData.other}
                onChange={handleInputChange}
                disabled={!isEditable}
                // hidden={!formData.hasEdu}
            />
            <FormField
                type="text"
                label="Наименование объекта"
                name="objectName"
                placeholder="Строительство дома"
                value={formData.objectName}
                onChange={handleInputChange}
                disabled={!isEditable}
            />
            <FormField
                type="text"
                label="Комментарий"
                name="comments"
                placeholder="Информация к анкете"
                value={formData.comments}
                onChange={handleInputChange}
                disabled={!isEditable}
            />
            <FormField
                type="date"
                label="Дата начала строительства"
                name="startDate"
                placeholder="Дата старта"
                value={formData.startDate}
                onChange={handleInputChange}
                disabled={!isEditable}
            />
            <FormField
                type="date"
                label="Дата окончание строительства"
                name="finishDate"
                placeholder="Дата старта"
                value={formData.finishDate}
                onChange={handleInputChange}
                disabled={!isEditable}
            />

            {isEditable ? (
                <button onClick={handleSubmitProfile}>Сохранить изменения</button>
            ) : (
                <button onClick={handleEdit}>Редактировать</button>
            )}
        </div>
    );
};

const getAuthToken = () => {
    return localStorage.getItem('authToken');
};

export default FormPage;
