import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  FormControl,
  MenuItem,
  Select,
  TextField,
  Typography,
  FormControlLabel,
  Checkbox,
  Chip,
  InputLabel,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { SelectChangeEvent } from '@mui/material/Select';
import styles from './CrewInfoComponent.module.css';
import { MdChevronRight } from 'react-icons/md';
import { useAuth } from '../../context/AuthContext';

interface ClubPreset {
  id: number;
  preset_name: string;
  club_name: string;
  primary_color: string;
  secondary_color: string;
  logo_filename?: string;
  is_default: boolean;
}

interface CrewInfoComponentProps {
  onSubmit: (boatClass: string, clubName: string, raceName: string, boatName: string) => void;
  initialValues?: {
    boatClass: string;
    clubName: string;
    raceName: string;
    boatName: string;
  };
}

const CrewInfoComponent: React.FC<CrewInfoComponentProps> = ({
  onSubmit,
  initialValues,
}) => {
  const { user } = useAuth();
  const theme = useTheme();
  const [boatClass, setBoatClass] = useState('');
  const [clubName, setClubName] = useState('');
  const [raceName, setRaceName] = useState('');
  const [boatName, setBoatName] = useState('');
  
  // Preset state
  const [presets, setPresets] = useState<ClubPreset[]>([]);
  const [usePreset, setUsePreset] = useState(false);
  const [selectedPresetId, setSelectedPresetId] = useState<number | null>(null);

  // Load presets when user is authenticated
  useEffect(() => {
    if (user) {
      loadPresets();
    }
  }, [user]);

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

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Enter' && (event.ctrlKey || event.metaKey)) {
        event.preventDefault();
        if (boatClass && clubName && raceName && boatName) {
          handleFormSubmit(event as any);
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [boatClass, clubName, raceName, boatName]);

  const loadPresets = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/club-presets`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('sessionId')}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setPresets(data);
        
        // Auto-select default preset if available and no club name is set
        const defaultPreset = data.find((p: ClubPreset) => p.is_default);
        if (defaultPreset && !clubName) {
          setUsePreset(true);
          setSelectedPresetId(defaultPreset.id);
          setClubName(defaultPreset.club_name);
        }
      }
    } catch (error) {
      console.error('Error loading presets:', error);
    }
  };

  const handleBoatClassChange = (event: SelectChangeEvent<string>) => {
    setBoatClass(event.target.value as string);
  };

  const handlePresetModeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const usePresetMode = event.target.checked;
    setUsePreset(usePresetMode);
    
    if (usePresetMode) {
      // If switching to preset mode and there's a default, use it
      const defaultPreset = presets.find(p => p.is_default);
      if (defaultPreset) {
        setSelectedPresetId(defaultPreset.id);
        setClubName(defaultPreset.club_name);
      } else if (presets.length > 0) {
        // Use first preset if no default
        setSelectedPresetId(presets[0].id);
        setClubName(presets[0].club_name);
      }
    } else {
      // Switching to manual mode
      setSelectedPresetId(null);
      setClubName('');
    }
  };

  const handlePresetSelection = (event: SelectChangeEvent<number>) => {
    const presetId = event.target.value as number;
    setSelectedPresetId(presetId);
    
    const selectedPreset = presets.find(p => p.id === presetId);
    if (selectedPreset) {
      setClubName(selectedPreset.club_name);
    }
  };

  const handleFormSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    onSubmit(boatClass, clubName, raceName, boatName);
  };

  return (
    <Box 
      component="form" 
      className={styles.container} 
      onSubmit={handleFormSubmit}
      sx={{
        backgroundColor: theme.palette.background.paper,
        color: theme.palette.text.primary
      }}
    >
      <Typography variant="h6" gutterBottom sx={{ fontWeight: 400, textAlign: 'center', mb: 2, letterSpacing: 1 }}>
        Enter Crew Information
      </Typography>
      
      {/* Club Name Section with Preset Option */}
      <Box sx={{ mb: 2 }}>
        <Box display="flex" alignItems="center" gap={1} mb={0.5}>
          <Typography className={styles.label}>Club Name</Typography>
          {user && presets.length > 0 && (
            <FormControlLabel
              control={
                <Checkbox
                  size="small"
                  checked={usePreset}
                  onChange={handlePresetModeChange}
                />
              }
              label="Use saved preset"
              sx={{ ml: 1 }}
            />
          )}
        </Box>
        
        {usePreset ? (
          <FormControl fullWidth variant="outlined" className={styles.inputField}>
            <InputLabel>Select Club Preset</InputLabel>
            <Select
              value={selectedPresetId || ''}
              onChange={handlePresetSelection}
              label="Select Club Preset"
              required
            >
              {presets.map((preset) => (
                <MenuItem key={preset.id} value={preset.id}>
                  <Box display="flex" alignItems="center" gap={1} width="100%">
                    <Box
                      sx={{
                        width: 16,
                        height: 16,
                        borderRadius: 1,
                        backgroundColor: preset.primary_color,
                        border: '1px solid #ddd'
                      }}
                    />
                    <Box flex={1}>
                      <Typography variant="body2" fontWeight="bold">
                        {preset.club_name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {preset.preset_name}
                      </Typography>
                    </Box>
                    {preset.is_default && (
                      <Chip label="Default" size="small" color="primary" />
                    )}
                  </Box>
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        ) : (
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
        )}
      </Box>
      <Box sx={{ mb: 2 }}>
        <Typography className={styles.label} sx={{ mb: 0.5 }}>Race Name</Typography>
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
      </Box>
      <Box sx={{ mb: 2 }}>
        <Typography className={styles.label} sx={{ mb: 0.5 }}>Boat Name</Typography>
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
      </Box>
      <Box sx={{ mb: 2 }}>
        <Typography className={styles.label} sx={{ mb: 0.5 }}>Boat Class</Typography>
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
      </Box>
      
      <Button
        type="submit"
        variant="contained"
        sx={{
          backgroundColor: theme.palette.primary.main,
          color: '#fff',
          padding: '12px 20px',
          borderRadius: '8px',
          boxShadow: `0 2px 8px rgba(${theme.palette.mode === 'dark' ? '125, 179, 211' : '94, 152, 194'}, 0.15)`,
          '&:hover': {
            backgroundColor: theme.palette.primary.dark || '#4177a6',
          },
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          marginTop: '24px',
          justifyContent: 'center',
          fontSize: '1rem',
          fontWeight: 600,
        }}
      >
        Enter Crew Names
        <MdChevronRight size={20} />
      </Button>
    </Box>
  );
};

export default CrewInfoComponent;