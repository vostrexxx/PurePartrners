import React, { useState } from 'react';
import PersonalInformation from './PersonalInformation';
import ProfileManagement from './ProfileManagment';
import AccountActions from './AccountActions';

const AccountActionsPage = () => {
    const [activeSection, setActiveSection] = useState('personal-information');

    const renderSection = () => {
        switch (activeSection) {
            case 'personal-information':
                return <PersonalInformation />;
            case 'profiles':
                return <ProfileManagement />;
            case 'account-actions':
                return <AccountActions />;
            default:
                return <PersonalInformation />;
        }
    };

    return (
        <div>
            <h1>Управление аккаунтом</h1>
            {renderSection()}
        </div>
    );
};

export default AccountActionsPage;