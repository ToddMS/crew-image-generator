import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  FormControl,
  MenuItem,
  Select,
  TextField,
  Typography,
  FormControlLabel,
  Switch,
  InputLabel,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { SelectChangeEvent } from '@mui/material/Select';
import styles from './CrewInfoComponent.module.css';
import { useAuth } from '../../context/AuthContext';
import ClubPresetDropdown from '../ClubPresetDropdown/ClubPresetDropdown';


interface CrewInfoComponentProps {
  onSubmit: (boatClass: string, clubName: string, raceName: string, boatName: string) => void;
  initialValues?: {
    boatClass: string;
    clubName: string;
    raceName: string;
    boatName: string;
  };
  showValidation?: boolean;
}

const CrewInfoComponent: React.FC<CrewInfoComponentProps> = ({
  onSubmit,
  initialValues,
  showValidation = false,
}) => {
  const { user } = useAuth();
  const theme = useTheme();
  const [boatClass, setBoatClass] = useState('');
  const [clubName, setClubName] = useState('');
  const [raceName, setRaceName] = useState('');
  const [boatName, setBoatName] = useState('');
  
  // Preset state
  const [usePreset, setUsePreset] = useState(false);
  const [selectedPresetId, setSelectedPresetId] = useState<number | null>(null);
  

  // Update component state when initialValues change (e.g., on logout)
  useEffect(() => {
    if (initialValues) {
      setBoatClass(initialValues.boatClass);
      setClubName(initialValues.clubName);
      setRaceName(initialValues.raceName);
      setBoatName(initialValues.boatName);
      // Reset preset selection when form is cleared
      if (!initialValues.clubName) {
        setUsePreset(false);
        setSelectedPresetId(null);
      }
    }
  }, [initialValues]);

  const handleBoatClassChange = (event: SelectChangeEvent<string>) => {
    handleFieldChange('boatClass', event.target.value as string);
  };

  // Call onSubmit when fields change through user interaction
  const handleFieldChange = (field: string, value: string) => {
    switch (field) {
      case 'boatClass':
        setBoatClass(value);
        onSubmit(value, clubName, raceName, boatName);
        break;
      case 'clubName':
        setClubName(value);
        onSubmit(boatClass, value, raceName, boatName);
        break;
      case 'raceName':
        setRaceName(value);
        onSubmit(boatClass, clubName, value, boatName);
        break;
      case 'boatName':
        setBoatName(value);
        onSubmit(boatClass, clubName, raceName, value);
        break;
    }
  };

  const handlePresetModeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const usePresetMode = event.target.checked;
    setUsePreset(usePresetMode);
    
    if (!usePresetMode) {
      // Switching to manual mode
      setSelectedPresetId(null);
      handleFieldChange('clubName', '');
    }
  };

  const handlePresetSelection = (presetId: number, preset: any) => {
    setSelectedPresetId(presetId);
    handleFieldChange('clubName', preset.club_name);
  };


  const boatClassOptions = [
    { value: '8+', label: '8+ (Eight with Coxswain)', seats: 8, description: 'Eight rowers with coxswain' },
    { value: '4+', label: '4+ (Four with Coxswain)', seats: 4, description: 'Four rowers with coxswain' },
    { value: '4-', label: '4- (Four without Coxswain)', seats: 4, description: 'Four rowers without coxswain' },
    { value: '4x', label: '4x (Quad Sculls)', seats: 4, description: 'Four scullers' },
    { value: '2-', label: '2- (Coxless Pair)', seats: 2, description: 'Two rowers without coxswain' },
    { value: '2x', label: '2x (Double Sculls)', seats: 2, description: 'Two scullers' },
    { value: '1x', label: '1x (Single Sculls)', seats: 1, description: 'Single sculler' },
  ];


  return (
    <Box 
      component="form"
      className={styles.container} 
      sx={{
        backgroundColor: theme.palette.background.paper,
        color: theme.palette.text.primary
      }}
      onSubmit={(e) => {
        e.preventDefault();
        // Form validation will be triggered by the browser
      }}
    >

      {/* Club Name Section with Preset Option */}
      <Box sx={{ mb: 3 }}>
        <Box display="flex" alignItems="center" gap={1.5} mb={1.5}>
          <Typography 
            variant="subtitle1" 
            sx={{ 
              fontWeight: 600, 
              color: theme.palette.text.primary,
              fontSize: '1.1rem'
            }}
          >
            Club Name
          </Typography>
          {user && (
            <FormControlLabel
              control={
                <Switch
                  size="small"
                  checked={usePreset}
                  onChange={handlePresetModeChange}
                  sx={{
                    '& .MuiSwitch-switchBase.Mui-checked': {
                      color: theme.palette.primary.main,
                    },
                    '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                      backgroundColor: theme.palette.primary.main,
                    },
                  }}
                />
              }
              label={
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  Use preset
                </Typography>
              }
              sx={{ ml: 'auto' }}
            />
          )}
        </Box>
        
        {usePreset ? (
          <ClubPresetDropdown
            value={selectedPresetId}
            onChange={handlePresetSelection}
            className={styles.inputField}
          />
        ) : (
          <TextField
            name="clubName"
            placeholder="Enter club name"
            required
            fullWidth
            variant="outlined"
            className={styles.inputField}
            value={clubName}
            onChange={e => handleFieldChange('clubName', e.target.value)}
            sx={{
              '& .MuiOutlinedInput-root': {
                '&:hover fieldset': {
                  borderColor: theme.palette.primary.main,
                },
                '&.Mui-focused fieldset': {
                  borderColor: theme.palette.primary.main,
                  borderWidth: 2,
                },
              }
            }}
          />
        )}
      </Box>

      {/* Race Name */}
      <Box sx={{ mb: 3 }}>
        <Box display="flex" alignItems="center" gap={1.5} mb={1.5}>
          <Typography 
            variant="subtitle1" 
            sx={{ 
              fontWeight: 600, 
              color: theme.palette.text.primary,
              fontSize: '1.1rem'
            }}
          >
            Race Name
          </Typography>
        </Box>
        <TextField
          name="raceName"
          placeholder="Enter race name"
          required
          fullWidth
          variant="outlined"
          className={styles.inputField}
          value={raceName}
          onChange={e => handleFieldChange('raceName', e.target.value)}
          sx={{
            '& .MuiOutlinedInput-root': {
              '&:hover fieldset': {
                borderColor: theme.palette.primary.main,
              },
              '&.Mui-focused fieldset': {
                borderColor: theme.palette.primary.main,
                borderWidth: 2,
              },
            }
          }}
        />
      </Box>

      {/* Boat Name */}
      <Box sx={{ mb: 3 }}>
        <Box display="flex" alignItems="center" gap={1.5} mb={1.5}>
          <Typography 
            variant="subtitle1" 
            sx={{ 
              fontWeight: 600, 
              color: theme.palette.text.primary,
              fontSize: '1.1rem'
            }}
          >
            Boat Name
          </Typography>
        </Box>
        <TextField
          name="boatName"
          placeholder="Enter boat name"
          required
          fullWidth
          variant="outlined"
          className={styles.inputField}
          value={boatName}
          onChange={e => handleFieldChange('boatName', e.target.value)}
          sx={{
            '& .MuiOutlinedInput-root': {
              '&:hover fieldset': {
                borderColor: theme.palette.primary.main,
              },
              '&.Mui-focused fieldset': {
                borderColor: theme.palette.primary.main,
                borderWidth: 2,
              },
            }
          }}
        />
      </Box>
      {/* Boat Class */}
      <Box sx={{ mb: 3 }}>
        <Box display="flex" alignItems="center" gap={1.5} mb={1.5}>
          <Typography 
            variant="subtitle1" 
            sx={{ 
              fontWeight: 600, 
              color: theme.palette.text.primary,
              fontSize: '1.1rem'
            }}
          >
            Boat Class
          </Typography>
        </Box>
        <FormControl fullWidth required variant="outlined" className={styles.inputField}>
          <InputLabel>Select boat class</InputLabel>
          <Select
            name="boatClass"
            value={boatClass}
            onChange={handleBoatClassChange}
            label="Select boat class"
            sx={{
              '& .MuiOutlinedInput-root': {
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: theme.palette.primary.main,
                },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                  borderColor: theme.palette.primary.main,
                  borderWidth: 2,
                },
              }
            }}
          >
            {boatClassOptions.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                <Box width="100%">
                  <Typography variant="body2" fontWeight={600}>
                    {option.label}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {option.description} • {option.seats} seat{option.seats > 1 ? 's' : ''}
                  </Typography>
                </Box>
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>
      
    </Box>
  );
};

export default CrewInfoComponent;