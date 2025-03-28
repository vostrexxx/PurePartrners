import React, { useState, useEffect } from 'react';
import { useProfile } from '../../Context/ProfileContext';
import { ImTextColor } from 'react-icons/im';
import Card_ from '../../Previews/Card.jsx';
import { useNavigate, useLocation } from 'react-router-dom';
import AutoCompleteInput from './AutoCompleteInput.jsx';
import MetroAutocomplete from '../SearchComponent/AutoCompleteMetro.jsx';
import { Button, Card, Container, Form, ListGroup, Row, Col, Spinner } from "react-bootstrap";
// import './global.css'
import { useToast } from '../../Notification/ToastContext'
import TextField from "@mui/material/TextField";
const Entities = ({ onSelectEntity }) => {
  const url = localStorage.getItem("url");
  const authToken = localStorage.getItem("authToken");
  const { isSpecialist } = useProfile();

  const [legalEntities, setLegalEntities] = useState([]);
  const [persons, setPersons] = useState([]);
  const [selectedEntity, setSelectedEntity] = useState(null);

  useEffect(() => {
    const fetchDataLegal = async () => {
      try {
        const response = await fetch(
          `${url}/${isSpecialist ? "contractor" : "customer"}/legal-entity`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${authToken}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error(`Ошибка сети: ${response.status}`);
        }

        const data = await response.json();
        setLegalEntities(data);
      } catch (error) {
        // console.error("Ошибка при загрузке юрлиц:", error.message);
        showToast("Ошибка при загрузке юрлиц", "danger")
      }
    };

    const fetchDataPerson = async () => {
      try {
        const response = await fetch(
          `${url}/${isSpecialist ? "contractor" : "customer"}/person`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${authToken}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error(`Ошибка сети: ${response.status}`);
        }

        const data = await response.json();
        setPersons(data);
      } catch (error) {
        // console.error("Ошибка при загрузке физлиц:", error.message);
        showToast("Ошибка при загрузке физлиц", "danger")
      }
    };

    fetchDataLegal();
    fetchDataPerson();
  }, [isSpecialist, url, authToken]);

  const handleSelectEntity = (id) => {
    setSelectedEntity(id);
    onSelectEntity(id);
  };

  return (
    <Container fluid>
      <h3 className="text-center mb-4" style={{ color: "#ff7f00" }}>
        Выберите лицо
      </h3>

      <Row className="g-4">
        {/* Юридические лица */}
        <Col xs={12} md={6}>
          <Card
            style={{
              backgroundColor: "#222",
              color: "white",
              borderRadius: "12px",
              padding: "10px",
              boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.5)",
            }}
          >
            <Card.Body>
              <h4 className="text-center" style={{ color: "white" }}>
                Юридические лица
              </h4>
              <ListGroup variant="flush">
                {legalEntities.length > 0 ? (
                  legalEntities.map((entity) => (
                    <ListGroup.Item
                      key={entity.id}
                      onClick={() => handleSelectEntity(entity.id)}
                      className="d-flex flex-column"
                      style={{
                        cursor: "pointer",
                        borderRadius: "8px",
                        padding: "12px",
                        marginBottom: "5px",
                        backgroundColor: selectedEntity === entity.id ? "#ff7f00" : "#333",
                        color: selectedEntity === entity.id ? "white" : "#bbb",
                        transition: "background-color 0.3s, color 0.3s",
                        border: "1px solid #555",
                      }}
                    >
                      <strong
                        style={{
                          color: selectedEntity === entity.id ? "white" : "inherit",
                        }}
                      >
                        {entity.firm}
                      </strong>
                      <span
                        style={{
                          color: selectedEntity === entity.id ? "white" : "#bbb",
                        }}
                      >
                        ИНН: {entity.inn}
                      </span>
                    </ListGroup.Item>
                  ))
                ) : (
                  <p className="text-center mt-3">
                    Нет зарегистрированных юридических лиц
                  </p>
                )}
              </ListGroup>
            </Card.Body>
          </Card>
        </Col>

        {/* Физические лица */}
        <Col xs={12} md={6}>
          <Card
            style={{
              backgroundColor: "#222",
              color: "white",
              borderRadius: "12px",
              padding: "10px",
              boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.5)",
            }}
          >
            <Card.Body>
              <h4 className="text-center" style={{ color: "white" }}>
                Физические лица
              </h4>
              <ListGroup variant="flush">
                {persons.length > 0 ? (
                  persons.map((person) => (
                    <ListGroup.Item
                      key={person.id}
                      onClick={() => handleSelectEntity(person.id)}
                      className="d-flex flex-column"
                      style={{
                        cursor: "pointer",
                        borderRadius: "8px",
                        padding: "12px",
                        marginBottom: "5px",
                        backgroundColor: selectedEntity === person.id ? "#ff7f00" : "#333",
                        color: selectedEntity === person.id ? "white" : "#bbb",
                        transition: "background-color 0.3s, color 0.3s",
                        border: "1px solid #555",
                      }}
                    >
                      <strong
                        style={{
                          color: selectedEntity === person.id ? "white" : "inherit",
                        }}
                      >
                        {person.fullName}
                      </strong>
                      <span
                        style={{
                          color: selectedEntity === person.id ? "white" : "#bbb",
                        }}
                      >
                        ИНН: {person.inn}
                      </span>
                    </ListGroup.Item>
                  ))
                ) : (
                  <p className="text-center mt-3">
                    Нет зарегистрированных физических лиц
                  </p>
                )}
              </ListGroup>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

const FormField = ({ type, label, name, placeholder, value, onChange, disabled, hidden }) => {
  if (hidden) {
    return null
  }
  else {
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

  }
};

const CheckboxField = ({ label, name, checked, onChange }) => {
  return (
    <div>
      <label>
        <input
          type="checkbox"
          name={name}
          checked={checked}
          onChange={onChange}
        />
        {label}
      </label>
    </div>
  );
};

const getAuthToken = () => {
  return localStorage.getItem('authToken');
};

let url = localStorage.getItem('url')

const QuestionnaireForm = ({ onSubmit, onCancel }) => {
  const showToast = useToast();

  const [formData, setFormData] = useState({
    workCategories: "",
    hasEdu: false,
    eduEst: "",
    eduDateStart: "",
    eduDateEnd: "",
    hasTeam: false,
    team: "",
    prices: "",
    selfInfo: "",
    workExp: "",
    entityId: null,
    guarantee: 12,
  });

  const [photos, setPhotos] = useState([]); // Хранение выбранных фотографий

  const handlePhotoChange = (e) => {
    const selectedPhotos = Array.from(e.target.files);
    setPhotos((prevPhotos) => [...prevPhotos, ...selectedPhotos]);
  };

  const handleRemovePhoto = (index) => {
    setPhotos((prevPhotos) => prevPhotos.filter((_, i) => i !== index));
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSelectEntity = (id) => {
    setFormData((prevData) => ({
      ...prevData,
      entityId: id, // Устанавливаем ID выбранного лица
    }));
  };

  const handleCategorySelect = (value) => {
    setFormData((prevData) => ({
      ...prevData,
      workCategories: value, // Обновляем workCategories при выборе
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const authToken = getAuthToken();

      const formDataToSend = new FormData();

      // Добавляем все текстовые данные
      Object.entries(formData).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          const trimmedValue = typeof value === "string" ? value.trim() : value;
          formDataToSend.append(key, trimmedValue);
        }
      });

      // Добавляем фотографии
      photos.forEach((photo) => {
        formDataToSend.append("images", photo);
      });

      const response = await fetch(`${url}/questionnaire`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
        body: formDataToSend,
      });

      if (response.ok) {
        // alert("Анкета успешно добавлена!");
        showToast("Анкета успешно добавлена", "success")
        setPhotos([]); // Очистить фотографии после успешной отправки
        onSubmit();
      } else {
        const errorMsg = await response.text();
        // alert(`Ошибка при добавлении анкеты: ${errorMsg}`);
      }
    } catch (error) {
      console.error("Ошибка при отправке анкеты:", error);
      showToast('Ошибка добавления анкеты', 'danger')

    }
  };

  return (
    <Container fluid className="mt-4">
      <Row className="justify-content-center">
        <Col md={8}>
          <Card
            style={{
              backgroundColor: "#222",
              color: "white",
              borderRadius: "12px",
              padding: "20px",
              boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.5)",
            }}
          >
            <Card.Body>
              <h2
                className="text-center mb-4"
                style={{ color: "#ff7f00", fontWeight: "bold" }}
              >
                Создание анкеты
              </h2>
              <Form onSubmit={handleSubmit}>
                {/* Категории */}
                <Form.Group className="mb-3">
                  <AutoCompleteInput
                    name="workCategories"
                    placeholder="Введите категорию"
                    onCategorySelect={handleCategorySelect}
                  />
                </Form.Group>

                {/* Образование */}
                <Form.Group className="mb-3">
                  <Form.Check
                    type="checkbox"
                    label="Имеется профильное образование?"
                    name="hasEdu"
                    checked={formData.hasEdu}
                    onChange={handleInputChange}
                    style={{ color: "white" }}
                  />
                </Form.Group>

                {formData.hasEdu && (
                  <>
                    <Form.Group className="mb-3">
                      <Form.Label style={{ color: "white" }}>
                        Образовательное учреждение
                      </Form.Label>
                      <TextField
                        type="text"
                        name="eduEst"
                        placeholder="Введите образовательное учреждение"
                        value={formData.eduEst}
                        onChange={handleInputChange}
                        sx={{
                          "& .MuiInputBase-input": {
                            color: "white", // Белый цвет текста
                          },
                          "& .MuiOutlinedInput-notchedOutline": {
                            borderColor: "white", // Белый цвет обводки (опционально)
                          },
                          "& .MuiInputLabel-root": {
                            color: "white", // Белый цвет placeholder
                          },
                          "& .MuiInputLabel-root.Mui-focused": {
                            color: "white", // Белый цвет placeholder при фокусе
                          },
                        }} className="form-control-placeholder w-100"
                      />
                    </Form.Group>

                    <Row className="">
                      <Col xs={12} md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label style={{
                            color: "white",
                            whiteSpace: "nowrap", // Запрещает перенос текста
                            overflow: "hidden",   // Скрывает текст, выходящий за пределы
                            textOverflow: "ellipsis", // Добавляет троеточие
                            display: "inline-block",  // Чтобы элемент занимал только необходимую ширину
                            maxWidth: "100%",         // Ограничивает ширину элемента
                          }}>
                            Дата начала обучения
                          </Form.Label>
                          <TextField
                            type="date"
                            name="eduDateStart"
                            value={formData.eduDateStart}
                            onChange={handleInputChange}
                            sx={{
                              "& .MuiInputBase-input": {
                                color: "white", // Белый цвет текста
                              },
                              "& .MuiOutlinedInput-notchedOutline": {
                                borderColor: "white", // Белый цвет обводки (опционально)
                              },
                              "& .MuiInputLabel-root": {
                                color: "white", // Белый цвет placeholder
                              },
                              "& .MuiInputLabel-root.Mui-focused": {
                                color: "white", // Белый цвет placeholder при фокусе
                              },
                            }}
                            className="form-control-placeholder w-100"
                          />
                        </Form.Group>
                      </Col>
                      <Col xs={12} md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label
                            style={{
                              color: "white",
                              whiteSpace: "nowrap", // Запрещает перенос текста
                              overflow: "hidden",   // Скрывает текст, выходящий за пределы
                              textOverflow: "ellipsis", // Добавляет троеточие
                              display: "inline-block",  // Чтобы элемент занимал только необходимую ширину
                              maxWidth: "100%",         // Ограничивает ширину элемента
                            }}
                          >
                            Дата окончания обучения
                          </Form.Label>
                          <TextField
                            type="date"
                            name="eduDateEnd"
                            value={formData.eduDateEnd}
                            onChange={handleInputChange}
                            sx={{
                              "& .MuiInputBase-input": {
                                color: "white", // Белый цвет текста
                              },
                              "& .MuiOutlinedInput-notchedOutline": {
                                borderColor: "white", // Белый цвет обводки (опционально)
                              },
                              "& .MuiInputLabel-root": {
                                color: "white", // Белый цвет placeholder
                              },
                              "& .MuiInputLabel-root.Mui-focused": {
                                color: "white", // Белый цвет placeholder при фокусе
                              },
                            }}
                            className="form-control-placeholder w-100"
                          />
                        </Form.Group>
                      </Col>
                    </Row>
                  </>
                )}

                {/* Команда */}
                <Form.Group className="mb-3">
                  <Form.Check
                    type="checkbox"
                    label="Имеется ли команда?"
                    name="hasTeam"
                    checked={formData.hasTeam}
                    onChange={handleInputChange}
                    style={{ color: "white" }}
                  />
                </Form.Group>

                {formData.hasTeam && (
                  <Form.Group className="mb-3">
                    <Form.Label style={{ color: "white" }}>Команда</Form.Label>
                    <TextField
                      type="text"
                      name="team"
                      placeholder="Опишите команду"
                      value={formData.team}
                      onChange={handleInputChange}
                      multiline
                      minRows={2}
                      maxRows={4}
                      className="form-control-placeholder w-100"
                      sx={{
                        "& .MuiInputBase-input": {
                          color: "white", // Белый цвет текста
                        },
                        "& .MuiOutlinedInput-notchedOutline": {
                          borderColor: "white", // Белый цвет обводки (опционально)
                        },
                        "& .MuiInputLabel-root": {
                          color: "white", // Белый цвет placeholder
                        },
                        "& .MuiInputLabel-root.Mui-focused": {
                          color: "white", // Белый цвет placeholder при фокусе
                        },
                      }}
                    />
                  </Form.Group>
                )}

                {/* Другие поля */}
                <Row className="g-3 mb-3">
                  <Col xs={12} md={6}>
                    <Form.Group>
                      <Form.Label style={{ color: "white" }}>Расценки</Form.Label>
                      <TextField
                        type="text"
                        name="prices"
                        placeholder="Например, 50к"
                        value={formData.prices}
                        onChange={handleInputChange}
                        className="form-control-placeholder w-100"
                        sx={{
                          "& .MuiInputBase-input": {
                            color: "white", // Белый цвет текста
                          },
                          "& .MuiOutlinedInput-notchedOutline": {
                            borderColor: "white", // Белый цвет обводки (опционально)
                          },
                          "& .MuiInputLabel-root": {
                            color: "white", // Белый цвет placeholder
                          },
                          "& .MuiInputLabel-root.Mui-focused": {
                            color: "white", // Белый цвет placeholder при фокусе
                          },
                        }}
                        multiline
                        minRows={1}
                        maxRows={4}
                      />
                    </Form.Group>
                  </Col>
                  <Col xs={12} md={6}>
                    <Form.Group>
                      <Form.Label style={{ color: "white" }}>
                        Опыт работы (лет)
                      </Form.Label>
                      <TextField
                        type="number"
                        name="workExp"
                        placeholder="Введите опыт работы"
                        value={formData.workExp}
                        onChange={handleInputChange}
                        sx={{
                          "& .MuiInputBase-input": {
                            color: "white", // Белый цвет текста
                          },
                          "& .MuiOutlinedInput-notchedOutline": {
                            borderColor: "white", // Белый цвет обводки (опционально)
                          },
                          "& .MuiInputLabel-root": {
                            color: "white", // Белый цвет placeholder
                          },
                          "& .MuiInputLabel-root.Mui-focused": {
                            color: "white", // Белый цвет placeholder при фокусе
                          },
                        }}
                        className="form-control-placeholder w-100"
                      />
                    </Form.Group>
                  </Col>
                </Row>

                {/* Информация о себе */}
                <Form.Group className="mb-3">
                  <Form.Label style={{ color: "white" }}>
                    Информация о себе
                  </Form.Label>
                  <TextField
                    type="text"
                    name="selfInfo"
                    multiline
                    minRows={2}
                    maxRows={4}
                    sx={{
                      "& .MuiInputBase-input": {
                        color: "white", // Белый цвет текста
                      },
                      "& .MuiOutlinedInput-notchedOutline": {
                        borderColor: "white", // Белый цвет обводки (опционально)
                      },
                      "& .MuiInputLabel-root": {
                        color: "white", // Белый цвет placeholder
                      },
                      "& .MuiInputLabel-root.Mui-focused": {
                        color: "white", // Белый цвет placeholder при фокусе
                      },
                    }}
                    placeholder="Опишите свои навыки и достижения"
                    value={formData.selfInfo}
                    onChange={handleInputChange}
                    className="form-control-placeholder w-100"
                  />
                </Form.Group>

                {/* Фото */}
                <h5 className="mt-4" style={{ color: "#ff7f00" }}>
                  Добавить фотографии
                </h5>
                <Form.Group className="mb-3">
                  <Form.Control
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handlePhotoChange}
                    style={{
                      backgroundColor: "#333",
                      color: "white",
                      border: "1px solid #555",
                    }}
                  />
                </Form.Group>

                {/* Выбор лица */}
                <Entities onSelectEntity={handleSelectEntity} />

                {/* Кнопки */}
                <div className="d-flex justify-content-between mt-4">

                  <Button
                    style={{
                      width: "48%",
                      backgroundColor: "#ffb300",
                      border: "none",
                      color: "black",
                      fontWeight: "bold",
                      padding: "10px",
                      borderRadius: "8px",
                      transition: "background-color 0.3s",
                    }}
                    onClick={onCancel}
                  >
                    Отмена
                  </Button>
                  <Button
                    style={{
                      width: "48%",
                      backgroundColor: "#ff7f00",
                      border: "none",
                      color: "white",
                      fontWeight: "bold",
                      padding: "10px",
                      borderRadius: "8px",
                      transition: "background-color 0.3s",
                    }}
                    type="submit"
                  >
                    Сохранить
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Стили для серого плейсхолдера */}
      <style>
        {`
          .form-control-placeholder::placeholder {
            color: #bbb; /* Серый цвет для плейсхолдера */
          }
        `}
      </style>
    </Container>
  );



};

const AnnouncementForm = ({ onSubmit, onCancel }) => {
  const showToast = useToast();

  const [formData, setFormData] = useState({
    totalCost: "",
    isNonFixedPrice: false,
    workCategories: "",
    metro: "",
    startDate: "",
    finishDate: "",
    comments: "",
    entityId: null,
    guarantee: 12,
    address: "",
  });

  const [images, setPhotos] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [files, setFiles] = useState([]);

  const handleCategorySelect = (value) => {
    setFormData((prevData) => ({
      ...prevData,
      workCategories: value,
    }));
  };

  const handleSelectEntity = (id) => {
    setFormData((prevData) => ({
      ...prevData,
      entityId: id,
    }));
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handlePhotoChange = (e) => {
    setPhotos([...images, ...e.target.files]);
  };

  const handleRemovePhoto = (index) => {
    setPhotos((prevPhotos) => prevPhotos.filter((_, i) => i !== index));
  };

  const handleFileChange = (e) => {
    const newFiles = Array.from(e.target.files);
    setFiles((prevFiles) => [...prevFiles, ...newFiles]);
  };

  const handleRemoveFile = (index) => {
    setFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setUploading(true);

      const formDataToSend = new FormData();

      Object.entries(formData).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          const trimmedValue = typeof value === "string" ? value.trim() : value;
          formDataToSend.append(key, trimmedValue);
        }
      });

      images.forEach((file) => {
        formDataToSend.append("images", file);
      });

      files.forEach((file) => {
        formDataToSend.append("files", file);
      });

      const authToken = localStorage.getItem("authToken");
      const response = await fetch(`${localStorage.getItem("url")}/announcement`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
        body: formDataToSend,
      });

      if (response.ok) {
        showToast('Объявление успешно добавлено', 'success')

        // alert("!");
        setFormData({
          totalCost: "",
          isNonFixedPrice: false,
          workCategories: "",
          metro: "",
          startDate: "",
          finishDate: "",
          comments: "",
          entityId: null,
          guarantee: 12,
          address: "",
        });
        setPhotos([]);
        setFiles([]);
        onSubmit();
      } else {
        const errorMsg = await response.text();
        // alert(`Ошибка при добавлении объявления: ${errorMsg}`);
        showToast("Ошибка создания объявления", "danger")
      }
    } catch (error) {
      console.error("Ошибка при отправке данных:", error);
      // alert("Произошла ошибка при отправке данных.");
      showToast("Ошибка создания объявления", "danger")

    } finally {
      setUploading(false);
    }
  };

  return (
    <Container fluid className="mt-4">
      <Row className="justify-content-center">
        <Col md={8}>
          <Card
            style={{
              backgroundColor: "#222",
              color: "white",
              borderRadius: "12px",
              padding: "20px",
              boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.5)",
            }}
          >
            <Card.Body>
              <h2 className="text-center mb-4" style={{ color: "#ff7f00", fontWeight: "bold" }}>
                Создание объявления
              </h2>

              <Form onSubmit={handleSubmit}>
                {/* Категории */}
                <Form.Group className="mb-3">
                  <AutoCompleteInput
                    name="workCategories"
                    placeholder="Введите категорию"
                    onCategorySelect={handleCategorySelect}
                  />
                </Form.Group>

                {/* Стоимость */}
                <Form.Group className="mb-3">
                  <Form.Label style={{ color: "white" }}>Общая стоимость</Form.Label>
                  <TextField
                    type="number"
                    name="totalCost"
                    placeholder="10000"
                    value={formData.totalCost}
                    className='w-100'
                    onChange={handleInputChange}
                    sx={{
                      "& .MuiInputBase-input": {
                        color: "white", // Белый цвет текста
                      },
                      "& .MuiOutlinedInput-notchedOutline": {
                        borderColor: "white", // Белый цвет обводки (опционально)
                      },
                      "& .MuiInputLabel-root": {
                        color: "white", // Белый цвет placeholder
                      },
                      "& .MuiInputLabel-root.Mui-focused": {
                        color: "white", // Белый цвет placeholder при фокусе
                      },
                    }}

                  // className="form-control-placeholder"
                  />
                  <style>
                    {`
      .form-control-placeholder::placeholder {
        color: #bbb; /* Серый цвет для плейсхолдера */
      }
    `}
                  </style>
                </Form.Group>


                {/* Чекбокс: Нефиксированная цена
                <Form.Group className="mb-3">
                  <Form.Check
                    type="checkbox"
                    label="Нефиксированная цена по договору"
                    name="isNonFixedPrice"
                    checked={formData.isNonFixedPrice}
                    onChange={handleInputChange}
                    style={{ color: "white" }}
                  />
                </Form.Group> */}

                {/* Метро */}
                <Form.Group className="mb-3">
                  <MetroAutocomplete
                    onSelect={(value) =>
                      setFormData((prev) => ({ ...prev, metro: value }))
                    }
                    value={formData.metro}
                  />
                </Form.Group>

                {/* Адрес */}
                <Form.Group className="mb-3">
                  <Form.Label style={{ color: "white" }}>Адрес</Form.Label>

                  <TextField
                    type="text"
                    name="address"
                    placeholder="Адрес будущих работ"
                    size="small"
                    value={formData.address}
                    onChange={handleInputChange}
                    className="w-100"
                    multiline
                    minRows={1}
                    maxRows={4}
                    sx={{
                      "& .MuiInputBase-input": {
                        color: "white", // Белый цвет текста
                      },
                      "& .MuiOutlinedInput-notchedOutline": {
                        borderColor: "white", // Белый цвет обводки (опционально)
                      },
                      "& .MuiInputLabel-root": {
                        color: "white", // Белый цвет placeholder
                      },
                      "& .MuiInputLabel-root.Mui-focused": {
                        color: "white", // Белый цвет placeholder при фокусе
                      },
                    }}
                  />
                  {/* <Form.Control
                    type="text"
                    name="address"
                    placeholder="Адрес будущих работ"
                    value={formData.address}
                    onChange={handleInputChange}
                    style={{
                      backgroundColor: "#333",
                      color: "white",
                      border: "1px solid #555",
                    }}
                    className="form-control-placeholder"
                  /> */}
                </Form.Group>
                <Row className="g-3 mb-3">
                  <Col xs={12} md={6}>
                    <Form.Group>
                      <Form.Label style={{ color: "white" }}>Дата начала</Form.Label>
                      <TextField
                        type="date"
                        name="startDate"
                        value={formData.startDate}
                        onChange={handleInputChange}
                        sx={{
                          "& .MuiInputBase-input": {
                            color: "white", // Белый цвет текста
                          },
                          "& .MuiOutlinedInput-notchedOutline": {
                            borderColor: "white", // Белый цвет обводки (опционально)
                          },
                          "& .MuiInputLabel-root": {
                            color: "white", // Белый цвет placeholder
                          },
                          "& .MuiInputLabel-root.Mui-focused": {
                            color: "white", // Белый цвет placeholder при фокусе
                          },
                        }}
                        className="form-control-placeholder w-100"
                      />
                    </Form.Group>
                  </Col>
                  <Col xs={12} md={6}>
                    <Form.Group>
                      <Form.Label style={{ color: "white" }}>Дата окончания</Form.Label>
                      <TextField
                        type="date"
                        name="finishDate"
                        value={formData.finishDate}
                        onChange={handleInputChange}
                        sx={{
                          "& .MuiInputBase-input": {
                            color: "white", // Белый цвет текста
                          },
                          "& .MuiOutlinedInput-notchedOutline": {
                            borderColor: "white", // Белый цвет обводки (опционально)
                          },
                          "& .MuiInputLabel-root": {
                            color: "white", // Белый цвет placeholder
                          },
                          "& .MuiInputLabel-root.Mui-focused": {
                            color: "white", // Белый цвет placeholder при фокусе
                          },
                        }}

                        className="form-control-placeholder w-100"
                      />
                    </Form.Group>
                  </Col>
                </Row>


                {/* Комментарии */}
                <Form.Group className="mb-3">
                  <Form.Label style={{ color: "white" }}>Комментарии</Form.Label>
                  <TextField
                    type="text"
                    name="comments"
                    placeholder="Комментарии"
                    multiline
                    minRows={1}
                    maxRows={8}
                    value={formData.comments}
                    onChange={handleInputChange}
                    sx={{
                      "& .MuiInputBase-input": {
                        color: "white", // Белый цвет текста
                      },
                      "& .MuiOutlinedInput-notchedOutline": {
                        borderColor: "white", // Белый цвет обводки (опционально)
                      },
                      "& .MuiInputLabel-root": {
                        color: "white", // Белый цвет placeholder
                      },
                      "& .MuiInputLabel-root.Mui-focused": {
                        color: "white", // Белый цвет placeholder при фокусе
                      },
                    }}
                    className="form-control-placeholder w-100"
                  />
                </Form.Group>



                {/* Стили для серого плейсхолдера */}
                <style>
                  {`
    .form-control-placeholder::placeholder {
      color: #bbb; /* Серый цвет для плейсхолдера */
    }
  `}
                </style>

                {/* Фотографии */}
                <h5 className="mt-4 mb-2" style={{ color: "#ff7f00" }}>
                  Добавить фотографии
                </h5>
                <Form.Group className="mb-3">
                  <Form.Control
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handlePhotoChange}
                    disabled={uploading}
                    style={{
                      backgroundColor: "#333",
                      color: "white",
                      border: "1px solid #555",
                    }}
                  />
                  <ListGroup className="mt-2">
                    {images.map((photo, index) => (
                      <ListGroup.Item
                        key={index}
                        className="d-flex justify-content-between align-items-center"
                        style={{ backgroundColor: "#333", color: "white", border: "1px solid #555" }}
                      >
                        {photo.name}
                        <Button variant="danger" size="sm" onClick={() => handleRemovePhoto(index)}>
                          Удалить
                        </Button>
                      </ListGroup.Item>
                    ))}
                  </ListGroup>
                </Form.Group>

                {/* Документы */}
                <h5 className="mt-4 mb-2" style={{ color: "#ff7f00" }}>
                  Добавить документы
                </h5>
                <Form.Group className="mb-3">
                  <Form.Control
                    type="file"
                    accept=".doc,.docx,.xls,.xlsx,.pdf"
                    multiple
                    onChange={handleFileChange}
                    disabled={uploading}
                    style={{
                      backgroundColor: "#333",
                      color: "white",
                      border: "1px solid #555",
                    }}
                  />
                  <ListGroup className="mt-2">
                    {files.map((file, index) => (
                      <ListGroup.Item
                        key={index}
                        className="d-flex justify-content-between align-items-center"
                        style={{ backgroundColor: "#333", color: "white", border: "1px solid #555" }}
                      >
                        {file.name}
                        <Button variant="danger" size="sm" onClick={() => handleRemoveFile(index)}>
                          Удалить
                        </Button>
                      </ListGroup.Item>
                    ))}
                  </ListGroup>
                </Form.Group>

                {/* Выбор лица */}
                <Form.Group className="mb-3">
                  <Entities onSelectEntity={handleSelectEntity} />
                </Form.Group>

                {/* Кнопки */}
                <div className="d-flex justify-content-between mt-4">

                  <Button
                    style={{
                      width: "48%",
                      backgroundColor: "#ffb300",
                      border: "none",
                      color: "black",
                      fontWeight: "bold",
                      padding: "10px",
                      borderRadius: "8px",
                      transition: "background-color 0.3s",
                    }}
                    onClick={onCancel}
                    disabled={uploading}
                  >
                    Отмена
                  </Button>
                  <Button
                    style={{
                      width: "48%",
                      backgroundColor: "#ff7f00",
                      border: "none",
                      color: "white",
                      fontWeight: "bold",
                      padding: "10px",
                      borderRadius: "8px",
                      transition: "background-color 0.3s",
                    }}
                    type="submit"
                    disabled={uploading}
                  >
                    {uploading ? <Spinner animation="border" size="sm" /> : "Сохранить"}
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>

  );

};

// Основной компонент

const MainPage = () => {
  const navigate = useNavigate();
  const { isSpecialist } = useProfile();
  const [isCreating, setIsCreating] = useState(false);
  const [announcements, setAnnouncements] = useState([]);
  const [questionnaires, setQuestionnaires] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [triggerGet, setTriggerGet] = useState(false);

  useEffect(() => {
    setAnnouncements([]);
    setQuestionnaires([]);
    setLoading(true);
    setError(null);

    const fetchData = async () => {
      try {
        const authToken = localStorage.getItem("authToken");
        const url = localStorage.getItem("url");

        let response;
        if (isSpecialist) {
          response = await fetch(`${url}/questionnaire/previews`, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${authToken}`,
            },
          });
          const data = await response.json();
          setQuestionnaires(data.previews || []);
        } else {
          const params = new URLSearchParams({ isInWork: false });
          response = await fetch(`${url}/announcement/previews?${params.toString()}`, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${authToken}`,
            },
          });
          const data = await response.json();
          setAnnouncements(data.previews || []);
        }
      } catch (error) {
        setError("Ошибка при загрузке данных");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isSpecialist, triggerGet]);

  const handleCreateClick = () => {
    setIsCreating(true);
  };

  const handleFormSubmit = () => {
    setIsCreating(false);
    setTriggerGet(!triggerGet);
  };

  const handleAnnCardClick = (id) => {
    navigate(`/announcement/${id}`, { state: { fromLk: true } });
  };

  const handleQueCardClick = (id) => {
    navigate(`/questionnaire/${id}`, { state: { fromLk: true } });
  };

  const handleCancel = () => {
    setIsCreating(false);
  };

  if (loading) {
    return (
      <Container className="d-flex justify-content-center align-items-center" style={{ height: "100vh" }}>
        <Spinner animation="border" variant="primary" />
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="text-center">
        <p className="text-danger">{error}</p>
      </Container>
    );
  }

  return (
    <Container fluid>
      {!isCreating ? (
        <div>
          <Row className="align-items-center mt-4 mb-3">
            <Col>
              <h2 className="text-white">{(isSpecialist ? "Анкеты" : "Объявления")}</h2>
            </Col>
            <Col xs="auto">
              <Button
                className="plus-button"
                onClick={handleCreateClick}
                style={{ backgroundColor: '#ff7f00', border: 'none', color: 'white' }}
              >
                <i className="bi bi-plus-lg"></i>
              </Button>

            </Col>
          </Row>

          <Row>
            {isSpecialist ? (
              questionnaires.length > 0 ? (
                questionnaires.map((item) => (
                  <Col xs={12} md={6} lg={4} key={item.id}>
                    <Card_
                      title={item.workCategories}
                      onClick={() => handleQueCardClick(item.id)}
                      totalCost={item.totalCost}
                      address={item.address}
                      workExp={item.workExp}
                      hasTeam={item.hasTeam}
                      hasEdu={item.hasEdu}
                      type={"questionnaire"}
                    />
                  </Col>
                ))
              ) : (
                <Col>
                  <p className="text-center text-white">Нет анкет</p>
                </Col>
              )
            ) : announcements.length > 0 ? (
              announcements.map((item) => (
                <Col xs={12} md={6} lg={4} key={item.id}>
                  <Card_
                    title={item.workCategories}
                    onClick={() => handleAnnCardClick(item.id)}
                    totalCost={item.totalCost}
                    address={item.address}
                    workExp={item.workExp}
                    hasTeam={item.hasTeam}
                    hasEdu={item.hasEdu}
                    type={"announcement"}
                  />
                </Col>
              ))
            ) : (
              <Col>
                <p className="text-center text-white">Нет объявлений</p>
              </Col>
            )}
          </Row>
        </div>
      ) : isSpecialist ? (
        <QuestionnaireForm onSubmit={handleFormSubmit} onCancel={handleCancel} />
      ) : (
        <AnnouncementForm onSubmit={handleFormSubmit} onCancel={handleCancel} />
      )}
    </Container>
  );
};

export default MainPage;
