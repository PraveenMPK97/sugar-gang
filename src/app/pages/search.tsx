// pages/search.tsx
import React from 'react';
import AppLayout from '../pages/app';
import SearchPatientPage from '../pages/SearchPatientPage';

const SearchPatientPageComponent: React.FC = () => {
    return (
        <AppLayout>
            <SearchPatientPage />
        </AppLayout>
    );
};

export default SearchPatientPageComponent;
