import React, { useState } from 'react';
import TopBar from '../TopBar/TopBar';
import Tab1 from './Tab1';
import Tab2 from './Tab2';
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
        <button onClick={() => handleTabClick(0)}>Данные по анкете/объявлению</button>
        <button onClick={() => handleTabClick(1)}>Персональная информация</button>
        {/* <button onClick={() => handleTabClick(3)}>Обратная связь (Отзывы + оценки)</button> */}
      </div>

      <div className="tab-content">
        {activeTab === 0 && <Tab2 />}
        {activeTab === 1 && <Tab1 />}
        {activeTab === 3 && <Tab4 />}
      </div>
    </div>
  );
};

export default PageWithTabs;