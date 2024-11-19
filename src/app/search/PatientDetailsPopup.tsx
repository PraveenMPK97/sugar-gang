import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    Button,
    TextField,
    Typography,
    IconButton,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import { Patient } from './page';


export interface PatientDetail {
    detailId: string;
    grbs: string;
    grbsDatetime: string;
    investigation: string;
    investigationValue: number;
    investigationDatetime: string;
}

interface PatientDetailsPopupProps {
    open: boolean;
    handleClose: () => void;
    patient: Patient | null; // Make patient nullable to handle the initial state
}

const PatientDetailsPopup: React.FC<PatientDetailsPopupProps> = ({ open, handleClose, patient }) => {
    const [remarks, setRemarks] = useState<string>('');
    const [medications, setMedications] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);
    const [patientDetails, setPatientDetails] = useState<PatientDetail[]>([]);
    const [isEditing, setIsEditing] = useState<boolean>(false);

    useEffect(() => {
        if (patient) {
            fetch(`/api/getPatientRemarks?patientId=${patient.patientId}`)
                .then(res => res.json())
                .then(data => {
                    setRemarks(data.remarks || '');
                    setMedications(data.medications || '');
                })
                .catch(error => console.error("Error fetching remarks:", error));

            setPatientDetails(patient.patientDetails || []);
        }
    }, [patient]);

    const handleSaveRemarks = () => {
        setLoading(true);
        fetch('/api/addOrUpdateRemarks', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                patientId: patient?.patientId,
                remarks: remarks,
                medications: medications
            })
        })
            .then(response => response.json())
            .then(data => {
                console.log(data.message);
                handleClose();
            })
            .catch(error => console.error('Error saving remarks:', error))
            .finally(() => setLoading(false));
    };

    const handleSavePatientDetails = () => {
        setLoading(true);
        console.log("patient details",patientDetails);
        fetch('/api/savePatientDetails', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ patientId: patient?.patientId, patientDetails: patientDetails })
        })
            .then(response => response.json())
            .then(data => {
                console.log(data.message);
                setIsEditing(false);
            })
            .catch(error => console.error('Error saving patient details:', error))
            .finally(() => setLoading(false));
    };

    const handleDetailChange = (index: number, field: keyof PatientDetail, value: any) => {
        const updatedDetails = [...patientDetails];
        updatedDetails[index] = { ...updatedDetails[index], [field]: value };
        setPatientDetails(updatedDetails);
    };

    const handleDeleteDetail = (index: number) => {
        const updatedDetails = patientDetails.filter((_, i) => i !== index);
        setPatientDetails(updatedDetails);
    };

    const toggleEditMode = () => {
        setIsEditing(!isEditing);
    };

    return (
        <Dialog open={open} onClose={handleClose} fullWidth maxWidth="md">
            <DialogTitle>
                Patient Details
                <IconButton edge="end" color="inherit" onClick={handleClose} aria-label="close" style={{ position: 'absolute', right: 8, top: 8 }}>
                    <CloseIcon />
                </IconButton>
            </DialogTitle>
            <DialogContent>
                <DialogContentText>
                    <Typography variant="h6">Patient Name: {patient?.patientName}</Typography>
                    <Typography variant="subtitle1">Room Number: {patient?.patientRoomNo}</Typography>
                    <Typography variant="subtitle1">Consultant: {patient?.consultant}</Typography>
                    <Typography variant="subtitle1">Diagnosis: {patient?.diagnosis}</Typography>
                    <Typography variant="subtitle1">Comorbidities: {patient?.comorbidities}</Typography>
                </DialogContentText>

                <TextField
                    label="Remarks"
                    variant="outlined"
                    fullWidth
                    multiline
                    rows={4}
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                    style={{ marginTop: '20px' }}
                />
                <TextField
                    label="Medications"
                    variant="outlined"
                    fullWidth
                    multiline
                    rows={4}
                    value={medications}
                    onChange={(e) => setMedications(e.target.value)}
                    style={{ marginTop: '20px' }}
                />

                <Typography variant="h6" style={{ marginTop: '20px' }}>Patient Details:</Typography>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>GRBS</TableCell>
                            <TableCell>GRBS Date & Time</TableCell>
                            <TableCell>Investigation</TableCell>
                            <TableCell>Investigation Value</TableCell>
                            <TableCell>Investigation Date & Time</TableCell>
                            <TableCell>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {patientDetails.map((detail, index) => (
                            <TableRow key={detail.detailId}>
                                <TableCell>
                                    {isEditing ? (
                                        <TextField
                                            variant="outlined"
                                            value={detail.grbs}
                                            onChange={(e) => handleDetailChange(index, 'grbs', e.target.value)}
                                        />
                                    ) : (
                                        detail.grbs
                                    )}
                                </TableCell>
                                <TableCell>
                                    {isEditing ? (
                                        <TextField
                                            type="datetime-local"
                                            variant="outlined"
                                            value={new Date(detail.grbsDatetime).toISOString().slice(0, 16)}
                                            onChange={(e) => handleDetailChange(index, 'grbsDatetime', e.target.value)}
                                        />
                                    ) : (
                                        new Date(detail.grbsDatetime).toLocaleString()
                                    )}
                                </TableCell>
                                <TableCell>
                                    {isEditing ? (
                                        <TextField
                                            variant="outlined"
                                            value={detail.investigation}
                                            onChange={(e) => handleDetailChange(index, 'investigation', e.target.value)}
                                        />
                                    ) : (
                                        detail.investigation
                                    )}
                                </TableCell>
                                <TableCell>
                                    {isEditing ? (
                                        <TextField
                                            variant="outlined"
                                            type="number"
                                            value={detail.investigationValue}
                                            onChange={(e) => handleDetailChange(index, 'investigationValue', Number(e.target.value))}
                                        />
                                    ) : (
                                        detail.investigationValue
                                    )}
                                </TableCell>
                                <TableCell>
                                    {isEditing ? (
                                        <TextField
                                            type="datetime-local"
                                            variant="outlined"
                                            value={new Date(detail.investigationDatetime).toISOString().slice(0, 16)}
                                            onChange={(e) => handleDetailChange(index, 'investigationDatetime', e.target.value)}
                                        />
                                    ) : (
                                        new Date(detail.investigationDatetime).toLocaleString()
                                    )}
                                </TableCell>
                                <TableCell>
                                    {isEditing && (
                                        <IconButton edge="end" color="secondary" onClick={() => handleDeleteDetail(index)}>
                                            <DeleteIcon />
                                        </IconButton>
                                    )}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </DialogContent>

            <DialogActions>
                <Button onClick={handleClose} color="secondary">Cancel</Button>
                <Button onClick={toggleEditMode} color="primary">
                    {isEditing ? <SaveIcon /> : <EditIcon />}
                    {isEditing ? "Save" : "Edit"}
                </Button>
                <Button onClick={handleSavePatientDetails} color="primary" disabled={loading || !isEditing}>
                    {loading ? "Saving..." : "Save Patient Details"}
                </Button>
                <Button onClick={handleSaveRemarks} color="primary" disabled={loading}>
                    {loading ? "Saving..." : "Save Remarks"}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default PatientDetailsPopup;
