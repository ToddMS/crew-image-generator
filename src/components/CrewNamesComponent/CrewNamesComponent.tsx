import React from 'react';
import { Box, Button, TextField, Typography } from '@mui/material';
import styles from './CrewNamesComponent.module.css';
import { MdSave } from 'react-icons/md';

interface CrewNamesComponentProps {
  boatClass: string;
  crewNames: string[];
  coxName: string;
  onNameChange: (idx: number, value: string) => void;
  onCoxNameChange: (value: string) => void;
  onSaveCrew: (boatClub: string, raceName: string, boatName: string) => void;
}

const getSeatLabels = (boatClass: string): string[] => {
  switch (boatClass) {
    case '8+':
      return [
        'Cox',
        'Stroke Seat',
        '7 Seat',
        '6 Seat',
        '5 Seat',
        '4 Seat',
        '3 Seat',
        '2 Seat',
        'Bow',
      ];
    case '4+':
      return ['Cox', 'Stroke Seat', '3 Seat', '2 Seat', 'Bow'];
    case '4-':
      return ['Stroke Seat', '3 Seat', '2 Seat', 'Bow'];
    case '2x':
      return ['Stroke Seat', 'Bow'];
    case '1x':
      return ['Stroke Seat'];
    default:
      return [];
  }
};

const CrewNamesComponent: React.FC<CrewNamesComponentProps> = ({
  boatClass,
  crewNames,
  coxName,
  onNameChange,
  onCoxNameChange,
  onSaveCrew,
}) => {
  const seatLabels = getSeatLabels(boatClass);
  const hasCox = boatClass === '8+' || boatClass === '4+';

  const handleFormSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const boatClub = 'Oxford Boat Club';
    const raceName = 'Summer Eights 2024';
    const boatName = 'Blue Boat';
    onSaveCrew(boatClub, raceName, boatName);
  };

  return (
    <Box component="form" className={styles.container} sx={{ marginTop: 4 }} onSubmit={handleFormSubmit}>
      <Typography variant="h6" gutterBottom>
        Enter Crew Names
      </Typography>
      {hasCox && (
        <div>
          <Typography className={styles.label}>Cox</Typography>
          <TextField
            name="coxName"
            placeholder="Enter Cox"
            value={coxName}
            onChange={e => onCoxNameChange(e.target.value)}
            required
            fullWidth
            margin="normal"
            className={styles.inputField}
          />
        </div>
      )}
      {crewNames.map((name, idx) => {
        const label = seatLabels[hasCox ? idx + 1 : idx];
        return (
          <div key={idx}>
            <Typography className={styles.label}>{label}</Typography>
            <TextField
              name={`crewName-${idx}`}
              placeholder={`Enter ${label.toLowerCase()} name`}
              value={name}
              onChange={e => onNameChange(idx, e.target.value)}
              required
              fullWidth
              margin="normal"
              className={styles.inputField}
            />
          </div>
        );
      })}
      <Button
        type="submit"
        variant="contained"
        sx={{
          backgroundColor: '#5E98C2',
          color: '#fff',
          padding: '10px',
          borderRadius: '6px',
          boxShadow: '0 2px 8px rgba(94,152,194,0.15)',
          '&:hover': {
            backgroundColor: '#4177a6',
          },
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          marginTop: '16px',
          justifyContent: 'center',
        }}
        endIcon={<MdSave size={22} />}
      >
        Save Crew
      </Button>
    </Box>
  );
};

export default CrewNamesComponent;