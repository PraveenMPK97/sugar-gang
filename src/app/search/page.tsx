"use client";
import React, { useState } from "react";
import {
  TextField,
  Button,
  Container,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Collapse,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import PatientDetailsPopup, { PatientDetail } from "./PatientDetailsPopup";

export interface Patient {
  patientId: number;
  patientName: string;
  patientRoomNo: string;
  age: number;
  consultant: string;
  diagnosis: string;
  comorbidities: string;
  patientDetails: PatientDetail[];
}

const SearchPatients: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [patients, setPatients] = useState<Patient[]>([]);
  const [error, setError] = useState<string>("");
  const [expandedPatientId, setExpandedPatientId] = useState<number | null>(
    null
  );
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [openPopup, setOpenPopup] = useState<boolean>(false);

  const handleSearch = async () => {
    try {
      const response = await fetch(
        `api/searchPatients?searchTerm=${encodeURIComponent(searchTerm)}`
      );
      const data: Patient[] = await response.json();
      setPatients(data);
      setError("");
    } catch (err) {
      setError("Error fetching patients.");
      console.error(err);
    }
  };

  const handleExpandClick = (patientId: number) => {
    setExpandedPatientId(expandedPatientId === patientId ? null : patientId);
  };

  const handleEditClick = (patient: Patient) => {
    setSelectedPatient(patient);
    setOpenPopup(true);
  };

  const handleDeleteClick = async (patientId: number) => {
    try {
      await fetch(`/api/deletePatient?patientId=${patientId}`, {
        method: "DELETE",
      });
      setPatients(patients.filter((p) => p.patientId !== patientId));
    } catch (err) {
      console.error("Error deleting patient:", err);
      setError("Error deleting patient.");
    }
  };

  const handleClosePopup = () => {
    setOpenPopup(false);
  };

  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        Search Patients
      </Typography>
      <TextField
        label="Search by Name, Room Number, or Consultant"
        variant="outlined"
        fullWidth
        value={searchTerm}
        onChange={(e: { target: { value: React.SetStateAction<string> } }) =>
          setSearchTerm(e.target.value)
        }
      />
      <Button
        variant="contained"
        color="primary"
        onClick={handleSearch}
        style={{ marginTop: "10px" }}
      >
        Search
      </Button>

      {error && (
        <Typography color="error" variant="body2" style={{ marginTop: "10px" }}>
          {error}
        </Typography>
      )}

      {patients.length > 0 && (
        <TableContainer component={Paper} style={{ marginTop: "20px" }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell></TableCell> {/* Expand icon */}
                <TableCell>Patient ID</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Room Number</TableCell>
                <TableCell>Age</TableCell>
                <TableCell>Consultant</TableCell>
                <TableCell>Diagnosis</TableCell>
                <TableCell>Comorbidities</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {patients.map((patient) => (
                <React.Fragment key={patient.patientId}>
                  <TableRow>
                    <TableCell>
                      <IconButton
                        size="small"
                        onClick={() => handleExpandClick(patient.patientId)}
                      >
                        {expandedPatientId === patient.patientId ? (
                          <ExpandLessIcon />
                        ) : (
                          <ExpandMoreIcon />
                        )}
                      </IconButton>
                    </TableCell>
                    <TableCell>{patient.patientId}</TableCell>
                    <TableCell>{patient.patientName}</TableCell>
                    <TableCell>{patient.patientRoomNo}</TableCell>
                    <TableCell>{patient.age}</TableCell>
                    <TableCell>{patient.consultant}</TableCell>
                    <TableCell>{patient.diagnosis}</TableCell>
                    <TableCell>{patient.comorbidities}</TableCell>
                    <TableCell>
                      <IconButton onClick={() => handleEditClick(patient)}>
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        onClick={() => handleDeleteClick(patient.patientId)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>

                  <TableRow>
                    <TableCell
                      colSpan={8}
                      style={{ paddingBottom: 0, paddingTop: 0 }}
                    >
                      <Collapse
                        in={expandedPatientId === patient.patientId}
                        timeout="auto"
                        unmountOnExit
                      >
                        <Table size="small" aria-label="grbs-investigations">
                          <TableHead>
                            <TableRow>
                              <TableCell>GRBS</TableCell>
                              <TableCell>GRBS Date & Time</TableCell>
                              <TableCell>Investigation</TableCell>
                              <TableCell>Investigated value</TableCell>
                              <TableCell>Investigation Date & Time</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {patient.patientDetails.slice(-3).map((detail) => (
                              <TableRow key={detail.detailId}>
                                <TableCell>{detail.grbs}</TableCell>
                                <TableCell>
                                  {/* Convert to 12-hour format with AM/PM */}
                                  {new Date(detail.grbsDatetime).toLocaleString(
                                    "en-US",
                                    {
                                      hour: "2-digit",
                                      minute: "2-digit",
                                      second: "2-digit",
                                      hour12: true, // Ensures 12-hour format with AM/PM
                                      month: "short",
                                      day: "numeric",
                                      year: "numeric",
                                    }
                                  )}
                                </TableCell>
                                <TableCell>{detail.investigation}</TableCell>
                                <TableCell>
                                  {detail.investigationValue}
                                </TableCell>
                                <TableCell>
                                  {/* Convert to 12-hour format with AM/PM */}
                                  {new Date(
                                    detail.investigationDatetime
                                  ).toLocaleString("en-US", {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                    second: "2-digit",
                                    hour12: true, // Ensures 12-hour format with AM/PM
                                    month: "short",
                                    day: "numeric",
                                    year: "numeric",
                                  })}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </Collapse>
                    </TableCell>
                  </TableRow>
                </React.Fragment>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {selectedPatient && (
        <PatientDetailsPopup
          open={openPopup}
          handleClose={handleClosePopup}
          patient={selectedPatient}
        />
      )}
    </Container>
  );
};

export default SearchPatients;
