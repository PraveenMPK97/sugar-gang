"use client";
import React, { useState } from 'react';
import axios from 'axios';
import { TextField, Button, Container, Typography } from '@mui/material';

const AddPatient: React.FC = () => {
  const [patientName, setPatientName] = useState<string>('');
  const [patientRoomNo, setPatientRoomNo] = useState<string>('');
  const [age, setAge] = useState<number>();

  const handleAddPatient = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const response = await axios.post('api/addPatient', {
        patientName,
        patientRoomNo,
        age,
      });
      alert(response.data.message);
      setPatientName('');
      setPatientRoomNo('');
      setAge(0);
    } catch (error) {
      console.error('Error adding patient:', error);
      alert('Failed to add patient');
    }
  };

  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        Add Patient
      </Typography>
      <form onSubmit={handleAddPatient}>
        <TextField
          fullWidth
          label="Patient Name"
          value={patientName}
          onChange={(e) => setPatientName(e.target.value)}
          margin="normal"
          required
        />
        <TextField
          fullWidth
          label="Room Number"
          value={patientRoomNo}
          onChange={(e) => setPatientRoomNo(e.target.value)}
          margin="normal"
          required
        />
        <TextField
          fullWidth
          label="Age"
          type="number"
          value={age}
          onChange={(e) => setAge(Number(e.target.value))}
          margin="normal"
          inputProps={{ min: 0 }}
          required
        />
        <Button type="submit" variant="contained" color="primary">
          Add Patient
        </Button>
      </form>
    </Container>
  );
};

export default AddPatient;
