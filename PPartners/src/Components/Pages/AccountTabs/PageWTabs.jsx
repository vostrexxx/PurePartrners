import React, { useState } from 'react';
import TopBar from '../TopBar/TopBar';
import Tab1 from './Tab1';
<<<<<<< HEAD
// import Tab2_1 from './Tab2_1';
=======
>>>>>>> 7e9714b398e1abe3ea70fa8d1594dbbeec3002ea
import Tab2 from './Tab2';
import Tab3 from './Tab3';
import Tab4 from './Tab4';
import { useProfile } from '../../Context/ProfileContext';

const PageWithTabs = () => {
  const [activeTab, setActiveTab] = useState(0);
  const { isSpecialist, toggleProfile } = useProfile();

  const handleTabClick = (index) => {
    setActiveTab(index);
  };

  return (
    <div>
      <TopBar />
      <h1>Личный кабинет</h1>
      <div className="tabs">
        <button onClick={() => handleTabClick(0)}>Персональная информация</button>
        {isSpecialist && <button onClick={() => handleTabClick(1)}>Данные для анкеты</button>}
        {!isSpecialist && <button onClick={() => handleTabClick(2)}>Данные для объявления</button>}
        <button onClick={() => handleTabClick(3)}>Обратная связь (Отзывы + оценки)</button>
      </div>

      <div className="tab-content">
        {activeTab === 0 && <Tab1 />}
        {activeTab === 1 && <Tab2 />}
        {activeTab === 2 && <Tab3 />}
        {activeTab === 3 && <Tab4 />}
      </div>
    </div>
  );
};

export default PageWithTabs;