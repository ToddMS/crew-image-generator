import React, { useState } from 'react';
import {
  Box,
  Button,
  FormControl,
  MenuItem,
  Select,
  TextField,
  Typography,
} from '@mui/material';
import { SelectChangeEvent } from '@mui/material/Select';
import styles from './CrewInfoComponent.module.css';
import { MdChevronRight } from 'react-icons/md';

interface CrewInfoComponentProps {
  onSubmit: (boatClass: string, clubName: string, raceName: string, boatName: string) => void;
}

const CrewInfoComponent: React.FC<CrewInfoComponentProps> = ({
  onSubmit,
}) => {
  const [boatClass, setBoatClass] = useState('');
  const [clubName, setClubName] = useState('');
  const [raceName, setRaceName] = useState('');
  const [boatName, setBoatName] = useState('');

  const handleBoatClassChange = (event: SelectChangeEvent<string>) => {
    setBoatClass(event.target.value as string);
  };

  const handleFormSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    onSubmit(boatClass, clubName, raceName, boatName);
  };

  return (
    <Box component="form" className={styles.container} onSubmit={handleFormSubmit}>
      <Typography variant="h6" gutterBottom sx={{ fontWeight: 400, textAlign: 'center', mb: 2, letterSpacing: 1 }}>
        Enter Crew Information
      </Typography>
      <div>
        <Typography className={styles.label}>Club Name</Typography>
        <TextField
          name="clubName"
          placeholder="Enter club name"
          required
          fullWidth
          variant="outlined"
          className={styles.inputField}
          value={clubName}
          onChange={e => setClubName(e.target.value)}
        />
      </div>
      <div>
        <Typography className={styles.label}>Race Name</Typography>
        <TextField
          name="raceName"
          placeholder="Enter race name"
          required
          fullWidth
          variant="outlined"
          className={styles.inputField}
          value={raceName}
          onChange={e => setRaceName(e.target.value)}
        />
      </div>
      <div>
        <Typography className={styles.label}>Boat Name</Typography>
        <TextField
          name="boatName"
          placeholder="Enter boat name"
          required
          fullWidth
          variant="outlined"
          className={styles.inputField}
          value={boatName}
          onChange={e => setBoatName(e.target.value)}
        />
      </div>
      <div>
        <Typography className={styles.label}>Boat Class</Typography>
        <FormControl fullWidth required variant="outlined" className={styles.inputField}>
          <Select
            name="boatClass"
            value={boatClass}
            onChange={handleBoatClassChange}
            displayEmpty
            sx={{
              '& .MuiSelect-select': {
                color: boatClass ? 'inherit' : '#888',
              },
            }}
          >
            <MenuItem value="">
              <span className={styles.select}>Select boat class</span>
            </MenuItem>
            <MenuItem value="8+">8+ (Eight with Coxswain)</MenuItem>
            <MenuItem value="4+">4+ (Four with Coxswain)</MenuItem>
            <MenuItem value="4-">4- (Four without Coxswain)</MenuItem>
            <MenuItem value="4x">4x (Quad Sculls)</MenuItem>
            <MenuItem value="2-">2- (Coxless Pair)</MenuItem>
            <MenuItem value="2x">2x (Double Sculls)</MenuItem>
            <MenuItem value="1x">1x (Single Sculls)</MenuItem>
          </Select>
        </FormControl>
      </div>
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
        }}
      >
        Next Step
        <MdChevronRight size={24} />
      </Button>
    </Box>
  );
};

export default CrewInfoComponent;