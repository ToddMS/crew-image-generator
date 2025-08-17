import React, { useState, useEffect } from 'react';
import {
  Box,
  FormControl,
  MenuItem,
  Select,
  TextField,
  Typography,
  FormControlLabel,
  Switch,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { SelectChangeEvent } from '@mui/material/Select';
import { useAuth } from '../../context/AuthContext';
import ClubPresetDropdown from '../ClubPresetDropdown/ClubPresetDropdown';

interface CrewInfoComponentProps {
  onSubmit: (
    boatClass: string,
    clubName: string,
    raceName: string,
    boatName: string,
    coachName?: string,
  ) => void;
  initialValues?: {
    boatClass: string;
    clubName: string;
    raceName: string;
    boatName: string;
    coachName?: string;
  };
  showValidation?: boolean;
}

const CrewInfoComponent: React.FC<CrewInfoComponentProps> = ({ onSubmit, initialValues }) => {
  const { user } = useAuth();
  const theme = useTheme();
  const [boatClass, setBoatClass] = useState('');
  const [clubName, setClubName] = useState('');
  const [raceName, setRaceName] = useState('');
  const [boatName, setBoatName] = useState('');
  const [coachName, setCoachName] = useState('');

  const [usePreset, setUsePreset] = useState(false);
  const [selectedPresetId, setSelectedPresetId] = useState<number | null>(null);

  useEffect(() => {
    if (initialValues) {
      setBoatClass(initialValues.boatClass);
      setClubName(initialValues.clubName);
      setRaceName(initialValues.raceName);
      setBoatName(initialValues.boatName);
      setCoachName(initialValues.coachName || '');
      if (!initialValues.clubName) {
        setUsePreset(false);
        setSelectedPresetId(null);
      }
    }
  }, [initialValues]);

  const handleBoatClassChange = (event: SelectChangeEvent<string>) => {
    handleFieldChange('boatClass', event.target.value as string);
  };

  const handleFieldChange = (field: string, value: string) => {
    switch (field) {
      case 'boatClass':
        setBoatClass(value);
        onSubmit(value, clubName, raceName, boatName, coachName);
        break;
      case 'clubName':
        setClubName(value);
        onSubmit(boatClass, value, raceName, boatName, coachName);
        break;
      case 'raceName':
        setRaceName(value);
        onSubmit(boatClass, clubName, value, boatName, coachName);
        break;
      case 'boatName':
        setBoatName(value);
        onSubmit(boatClass, clubName, raceName, value, coachName);
        break;
      case 'coachName':
        setCoachName(value);
        onSubmit(boatClass, clubName, raceName, boatName, value);
        break;
    }
  };

  const handlePresetModeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const usePresetMode = event.target.checked;
    setUsePreset(usePresetMode);

    if (!usePresetMode) {
      setSelectedPresetId(null);
      handleFieldChange('clubName', '');
    }
  };

  const handlePresetSelection = (presetId: number, preset: any) => {
    setSelectedPresetId(presetId);
    handleFieldChange('clubName', preset.club_name);
  };

  const boatClassOptions = [
    {
      value: '8+',
      label: '8+ (Eight with Coxswain)',
      seats: 8,
      description: 'Eight rowers with coxswain',
    },
    {
      value: '4+',
      label: '4+ (Four with Coxswain)',
      seats: 4,
      description: 'Four rowers with coxswain',
    },
    {
      value: '4-',
      label: '4- (Four without Coxswain)',
      seats: 4,
      description: 'Four rowers without coxswain',
    },
    { value: '4x', label: '4x (Quad Sculls)', seats: 4, description: 'Four scullers' },
    {
      value: '2-',
      label: '2- (Coxless Pair)',
      seats: 2,
      description: 'Two rowers without coxswain',
    },
    { value: '2x', label: '2x (Double Sculls)', seats: 2, description: 'Two scullers' },
    { value: '1x', label: '1x (Single Sculls)', seats: 1, description: 'Single sculler' },
  ];

  return (
    <Box
      component="form"
      sx={{
        display: 'flex',
        flexDirection: 'column',
        maxWidth: 400,
        margin: '0 auto',
        boxShadow: '0 4px 24px rgba(0,0,0,0.12), 0 1.5px 6px rgba(0,0,0,0.08)',
        borderRadius: 2,
        p: 4,
        backgroundColor: theme.palette.background.paper,
        color: theme.palette.text.primary,
      }}
      onSubmit={(e) => {
        e.preventDefault();
      }}
    >
      <Box sx={{ mb: 2 }}>
        <Box display="flex" alignItems="center" gap={1.5} mb={1}>
          <Typography
            variant="subtitle1"
            sx={{
              fontWeight: 600,
              color: theme.palette.text.primary,
              fontSize: '0.9rem',
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
          <ClubPresetDropdown value={selectedPresetId} onChange={handlePresetSelection} />
        ) : (
          <TextField
            name="clubName"
            placeholder="Enter club name"
            required
            fullWidth
            size="small"
            variant="outlined"
            value={clubName}
            onChange={(e) => handleFieldChange('clubName', e.target.value)}
            sx={{
              '& .MuiOutlinedInput-root': {
                '&:hover fieldset': {
                  borderColor: theme.palette.primary.main,
                },
                '&.Mui-focused fieldset': {
                  borderColor: theme.palette.primary.main,
                  borderWidth: 2,
                },
              },
            }}
          />
        )}
      </Box>

      <Box sx={{ mb: 2 }}>
        <Box display="flex" alignItems="center" gap={1.5} mb={1}>
          <Typography
            variant="subtitle1"
            sx={{
              fontWeight: 600,
              color: theme.palette.text.primary,
              fontSize: '0.9rem',
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
          size="small"
          variant="outlined"
          value={raceName}
          onChange={(e) => handleFieldChange('raceName', e.target.value)}
          sx={{
            '& .MuiOutlinedInput-root': {
              '&:hover fieldset': {
                borderColor: theme.palette.primary.main,
              },
              '&.Mui-focused fieldset': {
                borderColor: theme.palette.primary.main,
                borderWidth: 2,
              },
            },
          }}
        />
      </Box>

      <Box sx={{ mb: 2 }}>
        <Box display="flex" alignItems="center" gap={1.5} mb={1}>
          <Typography
            variant="subtitle1"
            sx={{
              fontWeight: 600,
              color: theme.palette.text.primary,
              fontSize: '0.9rem',
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
          size="small"
          variant="outlined"
          value={boatName}
          onChange={(e) => handleFieldChange('boatName', e.target.value)}
          sx={{
            '& .MuiOutlinedInput-root': {
              '&:hover fieldset': {
                borderColor: theme.palette.primary.main,
              },
              '&.Mui-focused fieldset': {
                borderColor: theme.palette.primary.main,
                borderWidth: 2,
              },
            },
          }}
        />
      </Box>

      <Box sx={{ mb: 2 }}>
        <Box display="flex" alignItems="center" gap={1.5} mb={1}>
          <Typography
            variant="subtitle1"
            sx={{
              fontWeight: 600,
              color: theme.palette.text.primary,
              fontSize: '0.9rem',
            }}
          >
            Coach Name{' '}
            <Typography
              component="span"
              sx={{ color: theme.palette.text.secondary, fontSize: '0.8rem' }}
            >
              (optional)
            </Typography>
          </Typography>
        </Box>
        <TextField
          name="coachName"
          placeholder="Enter coach name (optional)"
          fullWidth
          size="small"
          variant="outlined"
          value={coachName}
          onChange={(e) => handleFieldChange('coachName', e.target.value)}
          sx={{
            '& .MuiOutlinedInput-root': {
              '&:hover fieldset': {
                borderColor: theme.palette.primary.main,
              },
              '&.Mui-focused fieldset': {
                borderColor: theme.palette.primary.main,
                borderWidth: 2,
              },
            },
          }}
        />
      </Box>
      <Box sx={{ mb: 1.5 }}>
        <Box display="flex" alignItems="center" gap={1.5} mb={1}>
          <Typography
            variant="subtitle1"
            sx={{
              fontWeight: 600,
              color: theme.palette.text.primary,
              fontSize: '0.9rem',
            }}
          >
            Boat Class
          </Typography>
        </Box>
        <FormControl fullWidth required size="small" variant="outlined">
          <Select
            name="boatClass"
            value={boatClass}
            onChange={handleBoatClassChange}
            displayEmpty
            renderValue={(selected) => {
              if (!selected) {
                return <span style={{ color: '#999' }}>Select boat class</span>;
              }
              const option = boatClassOptions.find((opt) => opt.value === selected);
              return option ? option.label : selected;
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: theme.palette.primary.main,
                },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                  borderColor: theme.palette.primary.main,
                  borderWidth: 2,
                },
              },
            }}
          >
            {boatClassOptions.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                <Typography variant="body2" fontWeight={600}>
                  {option.label}
                </Typography>
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>
    </Box>
  );
};

export default CrewInfoComponent;
