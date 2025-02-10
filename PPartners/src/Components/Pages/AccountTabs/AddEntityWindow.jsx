import React, { useState } from "react";
import { Modal, Button, Form, Dropdown, Card } from "react-bootstrap";
import { useProfile } from "../../Context/ProfileContext";

const EntityModal = ({ isOpen, onClose, fullName, onTrigger }) => {
  const authToken = localStorage.getItem("authToken");
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

  const handleSave = async () => {
    try {
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

      alert("Данные успешно сохранены!");
      onClose();
      onTrigger();
    } catch (error) {
      console.error(`Ошибка при сохранении данных: ${error.message}`);
    }
  };

  const options = ["Физическое лицо", "Юридическое лицо"];

  return (
    <Modal show={isOpen} onHide={onClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>Добавить новое лицо</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {/* Выпадающий список */}
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

        {entity && (
          <Card className="mt-3 p-3">
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
                      type="text"
                      name="currAcc"
                      value={formData.currAcc}
                      onChange={handleInputChange}
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Корреспондентский счет</Form.Label>
                    <Form.Control
                      type="text"
                      name="corrAcc"
                      value={formData.corrAcc}
                      onChange={handleInputChange}
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>БИК</Form.Label>
                    <Form.Control
                      type="text"
                      name="bik"
                      value={formData.bik}
                      onChange={handleInputChange}
                    />
                  </Form.Group>
                </>
              )}
            </Form>
          </Card>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onClose}>
          Закрыть
        </Button>
        <Button variant="success" onClick={handleSave}>
          Сохранить
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default EntityModal;
