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
  onSaveCrew?: (boatClub: string, raceName: string, boatName: string) => void;
  clubName: string;
  raceName: string;
  boatName: string;
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
    case '4x':
      return ['Stroke Seat', '3 Seat', '2 Seat', 'Bow'];
    case '2-':
      return ['Stroke Seat', 'Bow'];
    case '2x':
      return ['Stroke Seat', 'Bow'];
    case '1x':
      return ['Single'];
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
  clubName,
  raceName,
  boatName,
}) => {
  const seatLabels = getSeatLabels(boatClass);
  const hasCox = boatClass === '8+' || boatClass === '4+';

  const handleFormSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    onSaveCrew(clubName, raceName, boatName);
  };

  const getBoatInfo = () => {
    const boatNames = {
      '8+': 'Eight',
      '4+': 'Coxed Four', 
      '4-': 'Coxless Four',
      '4x': 'Quad Sculls',
      '2-': 'Pair',
      '2x': 'Double Sculls',
      '1x': 'Single Sculls'
    };
    return boatNames[boatClass as keyof typeof boatNames] || boatClass;
  };

  return (
    <Box component="form" className={styles.container} sx={{ marginTop: 4 }} onSubmit={handleFormSubmit}>
      <Typography variant="h6" gutterBottom sx={{ fontWeight: 400, textAlign: 'center', mb: 1, letterSpacing: 1 }}>
        Enter Crew Names
      </Typography>
      
      <Box sx={{ 
        textAlign: 'center', 
        mb: 3, 
        p: 2, 
        backgroundColor: '#f5f7fa', 
        borderRadius: 2,
        border: '1px solid #e0e7ff'
      }}>
        <Typography variant="body1" sx={{ fontWeight: 600, color: '#5E98C2', mb: 1 }}>
          {clubName} - {raceName}
        </Typography>
        <Typography variant="body2" sx={{ color: '#666', mb: 1 }}>
          {boatName}
        </Typography>
        <Box sx={{ 
          display: 'inline-block',
          backgroundColor: '#5E98C2', 
          color: 'white', 
          px: 2, 
          py: 0.5, 
          borderRadius: 2, 
          fontSize: 14,
          fontWeight: 'bold'
        }}>
          {boatClass} - {getBoatInfo()}
        </Box>
      </Box>
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
            className={styles.inputField}
          />
        </div>
      )}
      {crewNames.map((name, idx) => {
        const label = seatLabels[hasCox ? idx + 1 : idx] || `Seat ${idx + 1}`;
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
              className={styles.inputField}
            />
          </div>
        );
      })}
      {onSaveCrew && (
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
      )}
    </Box>
  );
};

export default CrewNamesComponent;