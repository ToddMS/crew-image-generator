import React, { useEffect } from 'react';
import { Box, Button, TextField, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import styles from './CrewNamesComponent.module.css';
import { MdSave } from 'react-icons/md';

interface CrewNamesComponentProps {
  boatClass: string;
  crewNames: string[];
  coxName: string;
  onNameChange: (idx: number, value: string) => void;
  onCoxNameChange: (value: string) => void;
  onSaveCrew?: () => void;
  clubName: string;
  raceName: string;
  boatName: string;
  saving?: boolean;
  canSave?: boolean;
  user?: any;
  isEditing?: boolean;
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
  saving = false,
  canSave = false,
  user,
  isEditing = false,
}) => {
  const theme = useTheme();
  const seatLabels = getSeatLabels(boatClass);
  const hasCox = boatClass === '8+' || boatClass === '4+';


  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Enter' && (event.ctrlKey || event.metaKey)) {
        event.preventDefault();
        if (canSave && onSaveCrew) {
          onSaveCrew();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [coxName, crewNames, hasCox, onSaveCrew, clubName, raceName, boatName]);

  const handleFormSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (canSave && onSaveCrew) {
      onSaveCrew();
    }
  };


  return (
    <Box 
      component="form" 
      className={styles.container} 
      sx={{ 
        backgroundColor: theme.palette.background.paper,
        color: theme.palette.text.primary
      }} 
      onSubmit={handleFormSubmit}
    >
      {hasCox && (
        <Box sx={{ mb: 2 }}>
          <Typography className={styles.label} sx={{ mb: 0.5 }}>Cox</Typography>
          <TextField
            name="coxName"
            placeholder="Enter Cox name"
            value={coxName}
            onChange={e => onCoxNameChange(e.target.value)}
            required
            fullWidth
            className={styles.inputField}
          />
        </Box>
      )}
      
      {crewNames.map((name, idx) => {
        const label = seatLabels[hasCox ? idx + 1 : idx] || `Seat ${idx + 1}`;
        return (
          <Box key={idx} sx={{ mb: 2 }}>
            <Typography className={styles.label} sx={{ mb: 0.5 }}>{label}</Typography>
            <TextField
              name={`crewName-${idx}`}
              placeholder={`Enter ${label.toLowerCase()} name`}
              value={name}
              onChange={e => onNameChange(idx, e.target.value)}
              required
              fullWidth
              className={styles.inputField}
            />
          </Box>
        );
      })}
      
      {onSaveCrew && user && (
        <Button
          type="submit"
          variant="contained"
          disabled={!canSave || saving}
          sx={{
            backgroundColor: theme.palette.success.main,
            color: '#fff',
            padding: '12px 20px',
            borderRadius: '8px',
            boxShadow: `0 2px 8px rgba(${theme.palette.mode === 'dark' ? '125, 179, 211' : '94, 152, 194'}, 0.15)`,
            '&:hover': {
              backgroundColor: theme.palette.success.dark,
            },
            '&:disabled': {
              backgroundColor: theme.palette.action.disabledBackground,
              color: theme.palette.action.disabled,
            },
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginTop: '24px',
            justifyContent: 'center',
            fontSize: '1rem',
            fontWeight: 600,
          }}
          startIcon={saving ? undefined : <MdSave size={20} />}
        >
          {saving ? 'Saving...' : (isEditing ? 'Update Crew' : 'Save Crew')}
        </Button>
      )}
    </Box>
  );
};

export default CrewNamesComponent;