import React from 'react';
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

const CrewInfoComponent: React.FC = () => {
  const [boatClass, setBoatClass] = React.useState('');

  const handleBoatClassChange = (event: SelectChangeEvent<string>) => {
    setBoatClass(event.target.value as string);
  };

  return (
    <Box component="form" className={styles.container}>
      <div>
        <Typography className={styles.label}>Club Name</Typography>
        <TextField
          name="crewName"
          placeholder="Enter club name"
          required
          fullWidth
          variant="outlined"
          className={styles.inputField}
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
          InputProps={{ classes: { notchedOutline: styles.noOutline } }}
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
          InputProps={{ classes: { notchedOutline: styles.noOutline } }}
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
              <span className={styles.select} >Select boat class</span>
            </MenuItem>
            <MenuItem value="8+">8+</MenuItem>
            <MenuItem value="4+">4+</MenuItem>
            <MenuItem value="4-">4-</MenuItem>
            <MenuItem value="2x">2x</MenuItem>
            <MenuItem value="1x">1x</MenuItem>
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
        }}
      >
        Next Step
        <MdChevronRight size={24} />
      </Button>
    </Box>
  );
};

export default CrewInfoComponent;
