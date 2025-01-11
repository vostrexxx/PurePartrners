import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const ContractButton = ({ agreementId }) => {
    // const navigate = useNavigate();
    const getAuthToken = () => localStorage.getItem('authToken');
    const url = localStorage.getItem('url');
    // const [contractorId, setContractorId] = useState(null);
    // const [contractorItemId, setContractorItemId] = useState(null);
    // const [questionnaireData, setQuestionnaireData] = useState(null);
    // const [contractorEntityId, setContractorEntityId] = useState(null);
    // const [contractorEntityData, setContractorEntityData] = useState(null);

    // const [customerId, setCustomerId] = useState(null);
    // const [customerItemId, setCustomerItemId] = useState(null);
    // const [announcementData, setAnnouncementData] = useState(null);
    // const [customerEntityId, setCustomerEntityId] = useState(null);
    // const [customerEntityData, setCustomerEntityData] = useState(null);

    // const [totalPrice, setTotalPrice] = useState(null);

    // // Инфа по объекту
    // const [project, setProject] = useState({
    //     workCategories: null,
    //     address: null,
    //     startDate: null,
    //     finishDate: null,
    //     totalPrice: null,
    //     agreementId
    // });

    // // Инфа по подрядчику
    // const [contractor, setContractor] = useState({
    //     isLegalEntity: null,
    //     fullName: null,
    //     firm: null,
    //     position: null,
    //     address: null,
    //     inn: null,
    //     kpp: null,
    //     corrAcc: null,
    //     currAcc: null,
    //     bik: null,
    //     bank: null,
    // });

    // // Инфа по заказчику
    // const [customer, setCustomer] = useState({
    //     isLegalEntity: null,
    //     fullName: null,
    //     firm: null,
    //     position: null,
    //     address: null,
    //     inn: null,
    //     kpp: null,
    //     corrAcc: null,
    //     currAcc: null,
    //     bik: null,
    //     bank: null,
    // });

    // const updateState = (setter, updates) => {
    //     setter((prevState) => ({
    //         ...prevState,
    //         ...updates,
    //     }));
    // };

    // useEffect(() => {

    // }, []);


    const handleContract = async () => {
        try {
          const params = new URLSearchParams({ agreementId });
      
          // Шаг 1: Получить данные о соглашении
          const agreementResponse = await fetch(`${url}/agreement?${params.toString()}`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${getAuthToken()}`,
            },
          });
      
          if (!agreementResponse.ok) {
            throw new Error(`Ошибка при получении соглашения: ${agreementResponse.status}`);
          }
      
          const agreementData = await agreementResponse.json();
          let customerId, customerItemId, contractorId, contractorItemId;
      
          if (agreementData.agreementInfo.mode === 1) {
            customerId = agreementData.agreementInfo.initiatorId;
            customerItemId = agreementData.agreementInfo.initiatorItemId;
      
            contractorId = agreementData.agreementInfo.receiverId;
            contractorItemId = agreementData.agreementInfo.receiverItemId;
          } else {
            contractorId = agreementData.agreementInfo.initiatorId;
            contractorItemId = agreementData.agreementInfo.initiatorItemId;
      
            customerId = agreementData.agreementInfo.receiverId;
            customerItemId = agreementData.agreementInfo.receiverItemId;
          }
      
          // Шаг 2: Получить данные о заказчике (объявление)
          const customerParams = new URLSearchParams({ announcementId: customerItemId });
          const announcementResponse = await fetch(`${url}/announcement?${customerParams.toString()}`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${getAuthToken()}`,
            },
          });
      
          if (!announcementResponse.ok) {
            throw new Error(`Ошибка при получении объявления: ${announcementResponse.status}`);
          }
      
          const announcementData = await announcementResponse.json();
      
          // Шаг 3: Получить данные о подрядчике (анкета)
          const contractorParams = new URLSearchParams({ questionnaireId: contractorItemId });
          const questionnaireResponse = await fetch(`${url}/questionnaire?${contractorParams.toString()}`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${getAuthToken()}`,
            },
          });
      
          if (!questionnaireResponse.ok) {
            throw new Error(`Ошибка при получении анкеты: ${questionnaireResponse.status}`);
          }
      
          const questionnaireData = await questionnaireResponse.json();
      
          // Шаг 4: Получить данные о заказчике (Entity)
          const customerEntityParams = new URLSearchParams({ customerId: announcementData.announcementInfo.entityId });
          const customerEntityResponse = await fetch(`${url}/customer?${customerEntityParams.toString()}`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${getAuthToken()}`,
            },
          });
      
          if (!customerEntityResponse.ok) {
            throw new Error(`Ошибка при получении данных заказчика: ${customerEntityResponse.status}`);
          }
      
          const customerEntityData = await customerEntityResponse.json();
      
          // Шаг 5: Получить данные о подрядчике (Entity)
          const contractorEntityParams = new URLSearchParams({ contractorId: questionnaireData.questionnaireInfo.entityId });
          const contractorEntityResponse = await fetch(`${url}/contractor?${contractorEntityParams.toString()}`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${getAuthToken()}`,
            },
          });
      
          if (!contractorEntityResponse.ok) {
            throw new Error(`Ошибка при получении данных подрядчика: ${contractorEntityResponse.status}`);
          }
      
          const contractorEntityData = await contractorEntityResponse.json();
      
          // Шаг 6: Получить общую стоимость проекта
          const priceParams = new URLSearchParams({ agreementId });
          const priceResponse = await fetch(`${url}/document/estimate-total-price?${priceParams.toString()}`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${getAuthToken()}`,
            },
          });
      
          if (!priceResponse.ok) {
            throw new Error(`Ошибка при получении общей стоимости: ${priceResponse.status}`);
          }
      
          const priceData = await priceResponse.json();
      
          // Формируем данные для отправки
          const projectData = {
            agreementId,
            workCategories: announcementData.announcementInfo.workCategories,
            address: announcementData.announcementInfo.address,
            startDate: announcementData.announcementInfo.startDate,
            finishDate: announcementData.announcementInfo.finishDate,
            totalPrice: priceData.totalPrice,
            guarantee: announcementData.announcementInfo.guarantee,
          };
      
          const contractorData = {
            isLegalEntity: contractorEntityData.isLegalEntity,
            fullName: contractorEntityData.fullName,
            firm: contractorEntityData.firm,
            position: contractorEntityData.position,
            address: contractorEntityData.address,
            inn: contractorEntityData.inn,
            kpp: contractorEntityData.kpp,
            corrAcc: contractorEntityData.corrAcc,
            currAcc: contractorEntityData.currAcc,
            bik: contractorEntityData.bik,
            bank: contractorEntityData.bank,
          };
      
          const customerData = {
            isLegalEntity: customerEntityData.isLegalEntity,
            fullName: customerEntityData.fullName,
            firm: customerEntityData.firm,
            position: customerEntityData.position,
            address: customerEntityData.address,
            inn: customerEntityData.inn,
            kpp: customerEntityData.kpp,
            corrAcc: customerEntityData.corrAcc,
            currAcc: customerEntityData.currAcc,
            bik: customerEntityData.bik,
            bank: customerEntityData.bank,
          };
      
          // Шаг 7: Отправка данных на сервер
          const fullUrl = `${url}/document/contract`;
      
          const response = await fetch(fullUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${getAuthToken()}`,
            },
            body: JSON.stringify({ project: projectData, contractor: contractorData, customer: customerData }),
          });
      
          if (!response.ok) {
            throw new Error(`Ошибка при сохранении данных: ${response.status}`);
          }
      
          console.log('Данные успешно отправлены');
        } catch (error) {
          console.error('Ошибка при составлении договора:', error.message);
        }
    };
      
    const handleAct = async () => {
      try {
        const params = new URLSearchParams({ agreementId });
    
        // Шаг 1: Получить данные о соглашении
        const agreementResponse = await fetch(`${url}/agreement?${params.toString()}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${getAuthToken()}`,
          },
        });
    
        if (!agreementResponse.ok) {
          throw new Error(`Ошибка при получении соглашения: ${agreementResponse.status}`);
        }
    
        const agreementData = await agreementResponse.json();
        let customerId, customerItemId, contractorId, contractorItemId;
    
        if (agreementData.agreementInfo.mode === 1) {
          customerId = agreementData.agreementInfo.initiatorId;
          customerItemId = agreementData.agreementInfo.initiatorItemId;
    
          contractorId = agreementData.agreementInfo.receiverId;
          contractorItemId = agreementData.agreementInfo.receiverItemId;
        } else {
          contractorId = agreementData.agreementInfo.initiatorId;
          contractorItemId = agreementData.agreementInfo.initiatorItemId;
    
          customerId = agreementData.agreementInfo.receiverId;
          customerItemId = agreementData.agreementInfo.receiverItemId;
        }
    
        // Шаг 2: Получить данные о заказчике (объявление)
        const customerParams = new URLSearchParams({ announcementId: customerItemId });
        const announcementResponse = await fetch(`${url}/announcement?${customerParams.toString()}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${getAuthToken()}`,
          },
        });
    
        if (!announcementResponse.ok) {
          throw new Error(`Ошибка при получении объявления: ${announcementResponse.status}`);
        }
    
        const announcementData = await announcementResponse.json();
    
        // Шаг 3: Получить данные о подрядчике (анкета)
        const contractorParams = new URLSearchParams({ questionnaireId: contractorItemId });
        const questionnaireResponse = await fetch(`${url}/questionnaire?${contractorParams.toString()}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${getAuthToken()}`,
          },
        });
    
        if (!questionnaireResponse.ok) {
          throw new Error(`Ошибка при получении анкеты: ${questionnaireResponse.status}`);
        }
    
        const questionnaireData = await questionnaireResponse.json();
    
        // Шаг 4: Получить данные о заказчике (Entity)
        const customerEntityParams = new URLSearchParams({ customerId: announcementData.announcementInfo.entityId });
        const customerEntityResponse = await fetch(`${url}/customer?${customerEntityParams.toString()}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${getAuthToken()}`,
          },
        });
    
        if (!customerEntityResponse.ok) {
          throw new Error(`Ошибка при получении данных заказчика: ${customerEntityResponse.status}`);
        }
    
        const customerEntityData = await customerEntityResponse.json();
    
        // Шаг 5: Получить данные о подрядчике (Entity)
        const contractorEntityParams = new URLSearchParams({ contractorId: questionnaireData.questionnaireInfo.entityId });
        const contractorEntityResponse = await fetch(`${url}/contractor?${contractorEntityParams.toString()}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${getAuthToken()}`,
          },
        });
    
        if (!contractorEntityResponse.ok) {
          throw new Error(`Ошибка при получении данных подрядчика: ${contractorEntityResponse.status}`);
        }
    
        const contractorEntityData = await contractorEntityResponse.json();
    
        // Шаг 6: Получить общую стоимость проекта
        const priceParams = new URLSearchParams({ agreementId });
        const priceResponse = await fetch(`${url}/document/estimate-total-price?${priceParams.toString()}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${getAuthToken()}`,
          },
        });
    
        if (!priceResponse.ok) {
          throw new Error(`Ошибка при получении общей стоимости: ${priceResponse.status}`);
        }
    
        const priceData = await priceResponse.json();
    
        // Формируем данные для отправки
        const projectData = {
          agreementId,
          workCategories: announcementData.announcementInfo.workCategories,
          address: announcementData.announcementInfo.address,
          startDate: announcementData.announcementInfo.startDate,
          finishDate: announcementData.announcementInfo.finishDate,
          totalPrice: priceData.totalPrice,
          guarantee: announcementData.announcementInfo.guarantee,
        };
    
        const contractorData = {
          isLegalEntity: contractorEntityData.isLegalEntity,
          fullName: contractorEntityData.fullName,
          firm: contractorEntityData.firm,
          position: contractorEntityData.position,
          address: contractorEntityData.address,
          inn: contractorEntityData.inn,
          kpp: contractorEntityData.kpp,
          corrAcc: contractorEntityData.corrAcc,
          currAcc: contractorEntityData.currAcc,
          bik: contractorEntityData.bik,
          bank: contractorEntityData.bank,
        };
    
        const customerData = {
          isLegalEntity: customerEntityData.isLegalEntity,
          fullName: customerEntityData.fullName,
          firm: customerEntityData.firm,
          position: customerEntityData.position,
          address: customerEntityData.address,
          inn: customerEntityData.inn,
          kpp: customerEntityData.kpp,
          corrAcc: customerEntityData.corrAcc,
          currAcc: customerEntityData.currAcc,
          bik: customerEntityData.bik,
          bank: customerEntityData.bank,
        };
    
        // Шаг 7: Отправка данных на сервер
        const fullUrl = `${url}/document/contract`;
    
        const response = await fetch(fullUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${getAuthToken()}`,
          },
          body: JSON.stringify({ project: projectData, contractor: contractorData, customer: customerData }),
        });
    
        if (!response.ok) {
          throw new Error(`Ошибка при сохранении данных: ${response.status}`);
        }
    
        console.log('Данные успешно отправлены');
      } catch (error) {
        console.error('Ошибка при составлении договора:', error.message);
      }
    };

    return (
        <div>
            <button onClick={handleContract} style={{marginTop:'10px', backgroundColor:"blue"}} >Сформировать договор</button>
            <button onClick={handleAct} style={{marginTop:'10px', backgroundColor:"blue"}} >Сформировать Акт</button>
        </div>
    );
};

export default ContractButton;
