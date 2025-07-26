import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Radio,
  RadioGroup,
  TextField,
  Chip
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { SelectChangeEvent } from '@mui/material/Select';
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

interface ColorSchemeSelectorProps {
  primaryColor: string;
  secondaryColor: string;
  usePresetColors: boolean;
  selectedPresetId: number | null;
  onPrimaryColorChange: (color: string) => void;
  onSecondaryColorChange: (color: string) => void;
  onPresetModeChange: (usePreset: boolean) => void;
  onPresetSelection: (presetId: number) => void;
  presets?: ClubPreset[];
}

const ColorSchemeSelector: React.FC<ColorSchemeSelectorProps> = ({
  primaryColor,
  secondaryColor,
  usePresetColors,
  selectedPresetId,
  onPrimaryColorChange,
  onSecondaryColorChange,
  onPresetModeChange,
  onPresetSelection,
  presets = []
}) => {
  const { user } = useAuth();
  const theme = useTheme();

  const handlePresetModeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const usePresetMode = event.target.value === 'preset';
    onPresetModeChange(usePresetMode);
  };

  const handlePresetSelection = (event: SelectChangeEvent<number>) => {
    const presetId = event.target.value as number;
    onPresetSelection(presetId);
  };

  return (
    <div>
      <Typography 
        sx={{ 
          mb: 2, 
          fontWeight: 500, 
          color: theme.palette.text.primary,
          fontSize: '16px'
        }}
      >
        Color Scheme
      </Typography>
      
      {user && presets.length > 0 && (
        <Box sx={{ mb: 2 }}>
          <RadioGroup
            row
            value={usePresetColors ? 'preset' : 'manual'}
            onChange={handlePresetModeChange}
          >
            <FormControlLabel
              value="preset"
              control={<Radio size="small" />}
              label="Use Saved Preset"
            />
            <FormControlLabel
              value="manual"
              control={<Radio size="small" />}
              label="Choose Colors Manually"
            />
          </RadioGroup>
        </Box>
      )}
      
      {usePresetColors ? (
        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel>Select Club Preset</InputLabel>
          <Select
            value={selectedPresetId || ''}
            onChange={handlePresetSelection}
            label="Select Club Preset"
          >
            {presets.map((preset) => (
              <MenuItem key={preset.id} value={preset.id}>
                <Box display="flex" alignItems="center" gap={1} width="100%">
                  {preset.logo_filename && (
                    <img 
                      src={`${import.meta.env.VITE_API_URL}/api/club-presets/logos/${preset.logo_filename}`}
                      alt="Club logo"
                      style={{ width: '20px', height: '20px', objectFit: 'contain', borderRadius: '2px' }}
                    />
                  )}
                  <Box
                    sx={{
                      width: 16,
                      height: 16,
                      borderRadius: 1,
                      backgroundColor: preset.primary_color,
                      border: '1px solid #ddd'
                    }}
                  />
                  <Box
                    sx={{
                      width: 16,
                      height: 16,
                      borderRadius: 1,
                      backgroundColor: preset.secondary_color,
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
        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
          <Box sx={{ flex: 1 }}>
            <Typography variant="body2" sx={{ mb: 1, fontSize: 14, color: theme.palette.text.secondary }}>
              Primary Color
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <input
                type="color"
                value={primaryColor}
                onChange={(e) => onPrimaryColorChange(e.target.value)}
                style={{
                  width: '50px',
                  height: '40px',
                  border: `1px solid ${theme.palette.divider}`,
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              />
              <TextField
                value={primaryColor}
                onChange={(e) => onPrimaryColorChange(e.target.value)}
                size="small"
                sx={{ flex: 1 }}
                placeholder="#5E98C2"
              />
            </Box>
          </Box>
          <Box sx={{ flex: 1 }}>
            <Typography variant="body2" sx={{ mb: 1, fontSize: 14, color: theme.palette.text.secondary }}>
              Secondary Color
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <input
                type="color"
                value={secondaryColor}
                onChange={(e) => onSecondaryColorChange(e.target.value)}
                style={{
                  width: '50px',
                  height: '40px',
                  border: `1px solid ${theme.palette.divider}`,
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              />
              <TextField
                value={secondaryColor}
                onChange={(e) => onSecondaryColorChange(e.target.value)}
                size="small"
                sx={{ flex: 1 }}
                placeholder="#ffffff"
              />
            </Box>
          </Box>
        </Box>
      )}
    </div>
  );
};

export default ColorSchemeSelector;