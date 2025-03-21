import React, { useState, useEffect } from "react";
import { Modal, Button, Form, Dropdown, Card } from "react-bootstrap";
import { useProfile } from "../../Context/ProfileContext";
import { useToast } from '../../Notification/ToastContext';

const EntityModal = ({ isOpen, onClose, fullName, onTrigger, gotPerson }) => {
  const authToken = localStorage.getItem("authToken");
  const showToast = useToast();
  const url = localStorage.getItem("url");
  const { isSpecialist } = useProfile();

  const [isLegalEntity, setIsLegalEntity] = useState(null);
  const [entity, setEntity] = useState(null);
  const [formData, setFormData] = useState({
    bik: "",
    corrAcc: "",
    currAcc: "",
    bank: "",
    fullName: fullName,
    kpp: "",
    inn: "",
    address: "",
    position: "",
    firm: "",
  });

  // Автоматически устанавливаем тип лица при открытии модального окна
  useEffect(() => {
    if (isOpen) {
      if (gotPerson) {
        // Если физическое лицо уже есть, выбираем юридическое лицо
        setEntity("Юридическое лицо");
        setIsLegalEntity(true);
      } else {
        // Если физического лица нет, сбрасываем выбор
        setEntity(null);
        setIsLegalEntity(null);
      }
    }
  }, [isOpen, gotPerson]); // Зависимость от isOpen и gotPerson

  const handleSelectOption = (option) => {
    setEntity(option);
    setIsLegalEntity(option === "Юридическое лицо");

    // Сброс формы при выборе нового типа
    setFormData({
      bik: "",
      corrAcc: "",
      currAcc: "",
      bank: "",
      fullName: fullName,
      kpp: "",
      inn: "",
      address: "",
      position: "",
      firm: "",
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  useEffect(() => {
    if (!isOpen) {
      setEntity(null);
      setIsLegalEntity(null);
      setFormData({
        bik: "",
        corrAcc: "",
        currAcc: "",
        bank: "",
        fullName: fullName,
        kpp: "",
        inn: "",
        address: "",
        position: "",
        firm: "",
      }); // Сброс формы
    }
  }, [isOpen]); // Зависимость от isOpen и fullName

  const handleSave = async () => {
    try {
      if (entity === "Физическое лицо") {
        // URL для подрядчика и заказчика
        const contractorUrl = `${url}/contractor`;
        const customerUrl = `${url}/customer`;

        // Данные для отправки
        const data = { ...formData, isLegalEntity: isLegalEntity };

        // Отправляем данные для подрядчика
        const contractorResponse = await fetch(contractorUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
          body: JSON.stringify(data),
        });

        if (!contractorResponse.ok) {
          throw new Error(`Ошибка сети: ${contractorResponse.status}`);
        }

        // Отправляем данные для заказчика
        const customerResponse = await fetch(customerUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
          body: JSON.stringify(data),
        });

        if (!customerResponse.ok) {
          throw new Error(`Ошибка сети: ${customerResponse.status}`);
        }

        // Если оба запроса успешны
        onClose();
        onTrigger();
        showToast('Физическое лицо успешно сохранено для обоих профилей', 'success');
      } else {
        // Если создаётся юридическое лицо, отправляем данные только для текущего профиля
        const fullUrl = `${url}/${isSpecialist ? "contractor" : "customer"}`;
        formData.isLegalEntity = isLegalEntity;

        const response = await fetch(fullUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
          body: JSON.stringify(formData),
        });

        if (!response.ok) {
          throw new Error(`Ошибка сети: ${response.status}`);
        }

        onClose();
        onTrigger();
        showToast('Юридическое лицо успешно сохранено', 'success');
      }
    } catch (error) {
      console.error(`Ошибка при сохранении данных: ${error.message}`);
      showToast('Ошибка сохранения лица', 'danger');
    }
  };

  const options = [!gotPerson ? "Физическое лицо" : null, "Юридическое лицо"].filter(option => option !== null);

  return (
    <Modal show={isOpen} onHide={onClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>Добавить новое лицо</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {/* Выпадающий список показываем только если есть выбор */}
        {options.length > 1 && (
          <Dropdown onSelect={handleSelectOption}>
            <Dropdown.Toggle variant="primary" className="w-100">
              {entity || "Выберите тип лица"}
            </Dropdown.Toggle>
            <Dropdown.Menu className="w-100">
              {options.map((option, index) => (
                <Dropdown.Item key={index} eventKey={option}>
                  {option}
                </Dropdown.Item>
              ))}
            </Dropdown.Menu>
          </Dropdown>
        )}

        {/* Если выбора нет (только юридическое лицо), сразу показываем форму */}
        {(entity || options.length === 1) && (
          <>
            <h5 className="text-center">Создание юридического лица</h5>

            <Card className="mt-3 p-3">
              {/* <Card.Title>фывфывфыв</Card.Title> */}
              <Form>
                {/* ФИО */}
                <Form.Group className="mb-3">
                  <Form.Label>ФИО</Form.Label>
                  <Form.Control
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                  />
                </Form.Group>

                {/* Адрес */}
                <Form.Group className="mb-3">
                  <Form.Label>Адрес</Form.Label>
                  <Form.Control
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                  />
                </Form.Group>

                {/* ИНН */}
                <Form.Group className="mb-3">
                  <Form.Label>ИНН</Form.Label>
                  <Form.Control
                    type="number"
                    name="inn"
                    value={formData.inn}
                    onChange={handleInputChange}
                    className="no-spinner"
                  />
                </Form.Group>

                {/* КПП, Банк, Расчетный счет, Корреспондентский счет, БИК */}
                {(isLegalEntity || entity === "Физическое лицо") && (
                  <>
                    {isLegalEntity && (
                      <>
                        {/* Юридическое лицо - Название фирмы и Должность */}
                        <Form.Group className="mb-3">
                          <Form.Label>Название фирмы</Form.Label>
                          <Form.Control
                            type="text"
                            name="firm"
                            value={formData.firm}
                            onChange={handleInputChange}
                          />
                        </Form.Group>

                        <Form.Group className="mb-3">
                          <Form.Label>Должность</Form.Label>
                          <Form.Control
                            type="text"
                            name="position"
                            value={formData.position}
                            onChange={handleInputChange}
                            className="no-spinner"
                          />
                        </Form.Group>
                      </>
                    )}

                    {/* Общие поля для обоих типов */}
                    <Form.Group className="mb-3">
                      <Form.Label>КПП</Form.Label>
                      <Form.Control
                        type="number"
                        name="kpp"
                        value={formData.kpp}
                        onChange={handleInputChange}
                        className="no-spinner"
                      />
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label>Банк</Form.Label>
                      <Form.Control
                        type="text"
                        name="bank"
                        value={formData.bank}
                        onChange={handleInputChange}
                      />
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label>Расчетный счет</Form.Label>
                      <Form.Control
                        type="number"
                        name="currAcc"
                        value={formData.currAcc}
                        onChange={handleInputChange}
                        className="no-spinner"
                      />
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label>Корреспондентский счет</Form.Label>
                      <Form.Control
                        type="number"
                        name="corrAcc"
                        value={formData.corrAcc}
                        onChange={handleInputChange}
                        className="no-spinner"
                      />
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label>БИК</Form.Label>
                      <Form.Control
                        type="number"
                        name="bik"
                        value={formData.bik}
                        onChange={handleInputChange}
                        className="no-spinner"
                      />
                    </Form.Group>
                  </>
                )}
              </Form>
            </Card></>

        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="success" onClick={handleSave} className="w-100">
          Сохранить
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default EntityModal;