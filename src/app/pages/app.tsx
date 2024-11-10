// components/AppLayout.tsx
import React from 'react';
import { AppBar, Toolbar, Typography, Button } from '@mui/material';
import Link from 'next/link';

const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    return (
        <>
            <AppBar position="static">
                <Toolbar>
                    <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                        Patient Management
                    </Typography>
                    <Button color="inherit" component={Link} href="/">Add Patient</Button>
                    <Button color="inherit" component={Link} href="/update-patient-details">Update Patient Details</Button>
                    <Button color="inherit" component={Link} href="/search">Search Patient</Button>
                </Toolbar>
            </AppBar>
            <main>
                {children}
            </main>
        </>
    );
};

export default AppLayout;
