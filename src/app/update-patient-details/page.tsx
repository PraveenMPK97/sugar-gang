"use client";
import React, { useState, useEffect } from 'react';
import {
    TextField,
    Button,
    Container,
    Typography,
    MenuItem,
    Select,
    InputLabel,
    FormControl,
    Snackbar,
    Alert,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    IconButton,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import CloseIcon from '@mui/icons-material/Close';
import axios from 'axios';
import dayjs from 'dayjs';

interface Patient {
    patient_id: string;
    patient_name: string;
    patient_room_no: string;
    age:number;
    consultant?: string;
    diagnosis?: string;
    comorbidities?: string;
    grbs?: number;
    grbs_datetime?: string;
    investigation?: string;
    investigation_datetime?: string;
}

const UpdatePatientDetails: React.FC = () => {
    const [patients, setPatients] = useState<Patient[]>([]);
    const [selectedPatientId, setSelectedPatientId] = useState<string>('');
    const [age,setAge] =useState<number>();
    const [consultant, setConsultant] = useState<string>('');
    const [diagnosis, setDiagnosis] = useState<string>('');
    const [comorbidities, setComorbidities] = useState<string>('');
    const [grbs, setGrbs] = useState<number | string>(''); // Allowing string to handle empty input
    const [grbsDatetime, setGrbsDatetime] = useState<string>('');
    const [investigation, setInvestigation] = useState<string>('');
    const [investigationValue, setInvestigationValue] = useState<number>(0);
    const [investigationDatetime, setInvestigationDatetime] = useState<string>('');
    const [openSnackbar, setOpenSnackbar] = useState<boolean>(false);
    const [snackbarMessage, setSnackbarMessage] = useState<string>('');
    const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('success');
    const [openDialog, setOpenDialog] = useState<boolean>(false); // State for handling dialog open/close
    const [customInvestigation, setCustomInvestigation] = useState<string>(''); // State for custom investigation

    useEffect(() => {
        axios.get<Patient[]>('/api/getUpdatePatientDetails') // Updated endpoint to fetch all patients
            .then(response => {
                console.log('response',response.data)
                setPatients(response.data)})
            .catch(error => {
                console.error("Error fetching patients:", error);
            });
    }, []);

    const handleSubmit = () => {
        const formattedGrbsDatetime = dayjs(grbsDatetime).format("YYYY-MM-DDTHH:mm:ss");
        const formattedInvestigationDatetime = dayjs(investigationDatetime).format("YYYY-MM-DDTHH:mm:ss");

        const data = {
            patientId: selectedPatientId,
            age,
            consultant,
            diagnosis,
            comorbidities,
            grbs: typeof grbs === 'number' ? grbs : parseFloat(grbs), // Ensure grbs is a number
            grbsDatetime: formattedGrbsDatetime,
            investigation: investigation === 'OTHERS' ? customInvestigation : investigation, // Use custom investigation if selected
            investigationValue: investigationValue,
            investigationDatetime: formattedInvestigationDatetime
        };

        axios.post('/api/getUpdatePatientDetails', data) // Updated endpoint for updating patient details
            .then(response => {
                setSnackbarMessage('Patient details updated successfully!');
                setSnackbarSeverity('success');
                setOpenSnackbar(true);
                setOpenDialog(false); // Close dialog after successful update
            })
            .catch(error => {
                setSnackbarMessage('Error updating patient details.');
                setSnackbarSeverity('error');
                setOpenSnackbar(true);
            });
    };

    const handleCloseSnackbar = () => {
        setOpenSnackbar(false);
    };

    const handleDateChange = (setter: React.Dispatch<React.SetStateAction<string>>, value: string) => {
        const isoValue = dayjs(value).format("YYYY-MM-DDTHH:mm");
        setter(isoValue);
    };

    const openEditDialog = (patient: Patient) => {
        setSelectedPatientId(patient.patient_id);
        setAge(patient.age);
        setConsultant(patient.consultant || '');
        setDiagnosis(patient.diagnosis || '');
        setComorbidities(patient.comorbidities || '');
        setGrbs(patient.grbs || '');
        setGrbsDatetime(dayjs(patient.grbs_datetime).format("YYYY-MM-DDTHH:mm"));
        setInvestigation(patient.investigation || '');
        setInvestigationDatetime(dayjs(patient.investigation_datetime).format("YYYY-MM-DDTHH:mm"));
        setCustomInvestigation(''); // Reset custom investigation
        setInvestigationValue(0);
        setOpenDialog(true);
    };

    const closeEditDialog = () => {
        setOpenDialog(false);
    };

    return (
        <Container>
            <Typography variant="h4" gutterBottom>
                Update Patient Details
            </Typography>

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Patient Name</TableCell>
                            <TableCell>Room Number</TableCell>
                            <TableCell>Age</TableCell>
                            <TableCell>Consultant</TableCell>
                            <TableCell>Diagnosis</TableCell>
                            <TableCell>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {patients.map((patient) => (
                            <TableRow key={patient.patient_id}>
                                <TableCell>{patient.patient_name}</TableCell>
                                <TableCell>{patient.patient_room_no}</TableCell>
                                <TableCell>{patient.age}</TableCell>
                                <TableCell>{patient.consultant}</TableCell>
                                <TableCell>{patient.diagnosis}</TableCell>
                                <TableCell>
                                    <IconButton onClick={() => openEditDialog(patient)}>
                                        <EditIcon />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Dialog for editing patient details */}
            <Dialog open={openDialog} onClose={closeEditDialog} fullWidth maxWidth="sm">
                <DialogTitle>
                    Edit Patient Details
                    <IconButton
                        edge="end"
                        color="inherit"
                        onClick={closeEditDialog}
                        aria-label="close"
                        style={{ position: 'absolute', right: 8, top: 8 }}
                    >
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>
                <DialogContent>
                    <FormControl fullWidth variant="outlined" style={{ marginBottom: '20px' }}>
                        <InputLabel>Select Patient</InputLabel>
                        <Select
                            value={selectedPatientId}
                            onChange={(e: { target: { value: React.SetStateAction<string>; }; }) => setSelectedPatientId(e.target.value)}
                            label="Select Patient"
                            disabled
                        >
                            {patients.map((patient) => (
                                <MenuItem key={patient.patient_id} value={patient.patient_id}>
                                    {patient.patient_name} - {patient.patient_room_no}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <TextField
                        label="Age"
                        variant="outlined"
                        type="number"
                        fullWidth
                        value={age}
                        onChange={(e: { target: { value: React.SetStateAction<string>; }; }) => setAge(Number(e.target.value))}
                        style={{ marginBottom: '20px' }}
                    />

                    <TextField
                        label="Consultant"
                        variant="outlined"
                        fullWidth
                        value={consultant}
                        onChange={(e: { target: { value: React.SetStateAction<string>; }; }) => setConsultant(e.target.value)}
                        style={{ marginBottom: '20px' }}
                    />
                    <TextField
                        label="Diagnosis"
                        variant="outlined"
                        fullWidth
                        value={diagnosis}
                        onChange={(e: { target: { value: React.SetStateAction<string>; }; }) => setDiagnosis(e.target.value)}
                        style={{ marginBottom: '20px' }}
                    />
                    <TextField
                        label="Comorbidities"
                        variant="outlined"
                        fullWidth
                        value={comorbidities}
                        onChange={(e: { target: { value: React.SetStateAction<string>; }; }) => setComorbidities(e.target.value)}
                        style={{ marginBottom: '20px' }}
                    />
                    <TextField
                        label="GRBS"
                        variant="outlined"
                        fullWidth
                        type="number"
                        value={grbs}
                        onChange={(e: { target: { value: React.SetStateAction<string | number>; }; }) => setGrbs(e.target.value)}
                        style={{ marginBottom: '20px' }}
                    />
                    <TextField
                        label="GRBS Date & Time"
                        variant="outlined"
                        fullWidth
                        type="datetime-local"
                        value={grbsDatetime}
                        onChange={(e: { target: { value: string; }; }) => handleDateChange(setGrbsDatetime, e.target.value)}
                        style={{ marginBottom: '20px' }}
                    />

                    <FormControl fullWidth variant="outlined" style={{ marginBottom: '20px' }}>
                        <InputLabel>Investigation</InputLabel>
                        <Select
                            value={investigation}
                            onChange={(e: { target: { value: React.SetStateAction<string>; }; }) => {
                                setInvestigation(e.target.value);
                                if (e.target.value !== 'OTHERS') {
                                    setCustomInvestigation(''); // Clear custom input if not "OTHERS"
                                }
                            }}
                            label="Investigation"
                        >
                            <MenuItem value="Hb">Hb</MenuItem>
                            <MenuItem value="Tlc">Tlc</MenuItem>
                            <MenuItem value="Platelet">Platelet</MenuItem>
                            <MenuItem value="ESR">ESR</MenuItem>
                            <MenuItem value="S. Creatinine">S. Creatinine</MenuItem>
                            <MenuItem value="BUN">BUN</MenuItem>
                            <MenuItem value="Hba1c">Hba1c</MenuItem>
                            <MenuItem value="Na">Na</MenuItem>
                            <MenuItem value="K">K</MenuItem>
                            <MenuItem value="Cl">Cl</MenuItem>
                            <MenuItem value="TSH">TSH</MenuItem>
                            <MenuItem value="PT-INR">PT-INR</MenuItem>
                            <MenuItem value="APTT">APTT</MenuItem>
                            <MenuItem value="Malaria">Malaria</MenuItem>
                            <MenuItem value="Dengue">Dengue</MenuItem>
                            <MenuItem value="Weil-felix">Weil-felix</MenuItem>
                            <MenuItem value="Peripheral smear">Peripheral smear</MenuItem>
                            <MenuItem value="OTHERS">OTHERS</MenuItem>
                        </Select>
                    </FormControl>

                    {investigation === 'OTHERS' && (
                        <TextField
                            label="Please specify"
                            variant="outlined"
                            fullWidth
                            value={customInvestigation}
                            onChange={(e: { target: { value: React.SetStateAction<string>; }; }) => setCustomInvestigation(e.target.value)}
                            style={{ marginBottom: '20px' }}
                        />
                    )}
                    <TextField
                        fullWidth
                        label="Investigated value"
                        type="number"
                        value={investigationValue}
                        onChange={(e) => setInvestigationValue(Number(e.target.value))}
                        margin="normal"
                    />
                    <TextField
                        label="Investigation Date & Time"
                        variant="outlined"
                        fullWidth
                        type="datetime-local"
                        value={investigationDatetime}
                        onChange={(e: { target: { value: string; }; }) => handleDateChange(setInvestigationDatetime, e.target.value)}
                        style={{ marginBottom: '20px' }}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={closeEditDialog} color="secondary">
                        Cancel
                    </Button>
                    <Button onClick={handleSubmit} color="primary">
                        Update Details
                    </Button>
                </DialogActions>
            </Dialog>

            <Snackbar
                open={openSnackbar}
                autoHideDuration={6000}
                onClose={handleCloseSnackbar}
            >
                <Alert onClose={handleCloseSnackbar} severity={snackbarSeverity}>
                    {snackbarMessage}
                </Alert>
            </Snackbar>
        </Container>
    );
};

export default UpdatePatientDetails;
