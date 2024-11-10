// pages/index.tsx
import React from 'react';
import AppLayout from '../pages/app';
import AddPatientPage from '../pages/AddPatientPage';

const HomePage: React.FC = () => {
    return (
        <AppLayout>
            <AddPatientPage />
        </AppLayout>
    );
};

export default HomePage;
