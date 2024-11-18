import React, { useState } from 'react';
import TopBar from '../TopBar/TopBar';
import ReceivedAgreement from './ReceivedAgreement';
import SentAgreement from './SentAgreement';
import { useProfile } from '../../Context/ProfileContext';

const AgreementPage = () => {
  const [activeTab, setActiveTab] = useState(0);

  const handleTabClick = (index) => {
    setActiveTab(index);
  };

  return (
    <div>
      <TopBar />
      <h1>Отклики</h1>
      <div className="tabs">
        <button onClick={() => handleTabClick(0)}>Ваши отклики</button>
        <button onClick={() => handleTabClick(1)}>Отклики Вам</button>
      </div>

      <div className="tab-content">
        {activeTab === 0 && <SentAgreement />}
        {activeTab === 1 && <ReceivedAgreement />}
      </div>
    </div>
  );
};

export default AgreementPage;