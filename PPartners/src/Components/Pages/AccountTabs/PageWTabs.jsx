import React, { useState } from 'react';
import Tab1 from './Tab1';
import Tab2 from './Tab2';
import Tab3 from './Tab3';
import Tab4 from './Tab4';

const PageWithTabs = () => {
  const [activeTab, setActiveTab] = useState(0);

  const handleTabClick = (index) => {
    setActiveTab(index);
  };

  return (
    <div>
      <h2>Личный кабинет</h2>
      <div className="tabs">
        <button onClick={() => handleTabClick(0)}>Личные данные</button>
        {/* <button onClick={() => handleTabClick(1)}>ь</button> */}
        <button onClick={() => handleTabClick(2)}>Мои анкеты</button>
        <button onClick={() => handleTabClick(3)}>Подтверждение документов</button>
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