import React, { useState } from 'react';
import { useProfile } from '../../Context/ProfileContext';

const Dropdown = ({ options, onSelect }) => {
  const [isOpen, setIsOpen] = useState(false); // Стейт для контроля видимости списка
  const [selectedOption, setSelectedOption] = useState(null); // Стейт для выбранного элемента

  const toggleDropdown = () => setIsOpen(!isOpen); // Переключить видимость списка
  const handleSelect = (option) => {
    setSelectedOption(option);
    setIsOpen(false); // Закрыть список после выбора
    onSelect(option); // Передать выбранный элемент в родительский компонент
  };

  return (
    <div className="dropdown">
      <button className="dropdown-toggle" onClick={toggleDropdown}>
        {selectedOption ? selectedOption : 'Выберите типа лица'}
      </button>

      {isOpen && (
        <ul className="dropdown-menu">
          {options.map((option, index) => (
            <li key={index} onClick={() => handleSelect(option)} className="dropdown-item">
              {option}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

const Modal = ({ isOpen, onClose, children, fullName, onTrigger }) => {
  // console.log(fullName)
  if (!isOpen) return null;
  const authToken = localStorage.getItem('authToken');
  const url = localStorage.getItem('url');
  const { isSpecialist } = useProfile();

  const [isLegalEntity, setIsLegalEntity] = useState(null);
  const [entity, setEntity] = useState(null); // Стейт для выбранного типа лица
  const [formData, setFormData] = useState({
    bik: '',
    corrAcc: '',
    currAcc: '',
    bank: '',
    fullName: fullName,
    kpp: '',
    inn: '',
    address: '',
    position: '',
    firm: '',
  });

  const handleSelectOption = (option) => {
    // console.log(option)
    setEntity(option);
    // console.log(entity)
    option === "Юридическое лицо" ? setIsLegalEntity(true) : setIsLegalEntity(false);

    setFormData({
      bik: '',
      corrAcc: '',
      currAcc: '',
      bank: '',
      fullName: fullName,
      kpp: '',
      inn: '',
      address: '',
      position: '',
      firm: '',
    }); // Сбросить форму
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSave = async () => {
    try {
      const fullUrl = `${url}/${isSpecialist ? 'contractor' : 'customer'}`;
      // console.log(formData)
      formData.isLegalEntity = isLegalEntity;
      // console.log(formData)

      const response = await fetch(fullUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error(`Ошибка сети: ${response.status}`);
      }

      alert('Данные успешно сохранены!');

      onClose();
      // setIsEditable(false);
      onTrigger();

      // setTimeout(() => {
      // }, 300);

    } catch (error) {
      console.error(`Ошибка при сохранении данных: ${error.message}`);
    }
  };

  const options = ['Физическое лицо', 'Юридическое лицо'];

  return (
    <div className="modal">
      <div className="modal-content">
        <Dropdown options={options} onSelect={handleSelectOption} />

        {entity === 'Юридическое лицо' && (
          <div>

            <label>
              ФИО:
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleInputChange}
              />
            </label>

            <label>
              Название фирмы:
              <input
                type="text"
                name="firm"
                value={formData.firm}
                onChange={handleInputChange}
              />
            </label>

            <label>
              Должность:
              <input
                type="text"
                name="position"
                value={formData.position}
                onChange={handleInputChange}
              />
            </label>

            <label>
              Адрес:
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
              />
            </label>

            <label>
              ИНН:
              <input
                type="number"
                name="inn"
                value={formData.inn}
                onChange={handleInputChange}
              />
            </label>

            <label>
              КПП:
              <input
                type="number"
                name="kpp"
                value={formData.kpp}
                onChange={handleInputChange}
              />
            </label>

            <label>
              Банк:
              <input
                type="number"
                name="bank"
                value={formData.bank}
                onChange={handleInputChange}
              />
            </label>

            <label>
              Расчетный счет:
              <input
                type="number"
                name="currAcc"
                value={formData.currAcc}
                onChange={handleInputChange}
              />
            </label>

            <label>
              Корреспондентский счет:
              <input
                type="number"
                name="corrAcc"
                value={formData.corrAcc}
                onChange={handleInputChange}
              />
            </label>

            <label>
              БИК:
              <input
                type="number"
                name="bik"
                value={formData.bik}
                onChange={handleInputChange}
              />
            </label>

          </div>
        )}

        {entity === 'Физическое лицо' && (
          <div>
            <label>
              ФИО:
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleInputChange}
              />
            </label>

            <label>
              Адрес:
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
              />
            </label>

            <label>
              ИНН:
              <input
                type="text"
                name="inn"
                value={formData.inn}
                onChange={handleInputChange}
              />
            </label>

            <label>
              КПП:
              <input
                type="number"
                name="kpp"
                value={formData.kpp}
                onChange={handleInputChange}
              />
            </label>

            <label>
              Банк:
              <input
                type="number"
                name="bank"
                value={formData.bank}
                onChange={handleInputChange}
              />
            </label>

            <label>
              Расчетный счет:
              <input
                type="number"
                name="currAcc"
                value={formData.currAcc}
                onChange={handleInputChange}
              />
            </label>

            <label>
              Корреспондентский счет:
              <input
                type="number"
                name="corrAcc"
                value={formData.corrAcc}
                onChange={handleInputChange}
              />
            </label>

            <label>
              БИК:
              <input
                type="number"
                name="bik"
                value={formData.bik}
                onChange={handleInputChange}
              />
            </label>
          </div>
        )}

        <button onClick={onClose}>Закрыть</button>
        <button onClick={handleSave}>Сохранить</button>
      </div>
    </div>
  );
};

export default Modal;
