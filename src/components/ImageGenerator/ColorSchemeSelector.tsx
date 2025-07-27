import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Checkbox,
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
  clubIconSelector?: React.ReactNode;
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
  presets = [],
  clubIconSelector
}) => {
  const { user } = useAuth();
  const theme = useTheme();


  const handlePresetSelection = (event: SelectChangeEvent<number>) => {
    const presetId = event.target.value as number;
    onPresetSelection(presetId);
  };

  return (
    <Box>
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
          <FormControlLabel
            control={
              <Checkbox
                checked={usePresetColors}
                onChange={(e) => onPresetModeChange(e.target.checked)}
                size="small"
              />
            }
            label="Use Club Preset Colors"
          />
        </Box>
      )}
      
      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
        {usePresetColors ? (
          <FormControl sx={{ maxWidth: 500, width: '100%' }}>
            <InputLabel>Select Club Preset</InputLabel>
            <Select
              value={selectedPresetId || ''}
              onChange={handlePresetSelection}
              label="Select Club Preset"
              size="medium"
              sx={{ 
                '& .MuiSelect-select': { 
                  py: 2 
                }
              }}
            >
              {presets.map((preset) => (
                <MenuItem key={preset.id} value={preset.id} sx={{ py: 1.5 }}>
                  <Box display="flex" alignItems="center" gap={2} width="100%">
                    {preset.logo_filename && (
                      <img 
                        src={`${import.meta.env.VITE_API_URL}/api/club-presets/logos/${preset.logo_filename}`}
                        alt="Club logo"
                        style={{ width: '48px', height: '48px', objectFit: 'contain', borderRadius: '6px' }}
                      />
                    )}
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                      <Box
                        sx={{
                          width: 24,
                          height: 14,
                          borderRadius: 1,
                          backgroundColor: preset.primary_color,
                          border: '1px solid #ddd'
                        }}
                      />
                      <Box
                        sx={{
                          width: 24,
                          height: 14,
                          borderRadius: 1,
                          backgroundColor: preset.secondary_color,
                          border: '1px solid #ddd'
                        }}
                      />
                    </Box>
                    <Box flex={1}>
                      <Typography variant="body1" fontWeight="bold">
                        {preset.club_name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
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
          <>
            {/* Color pickers when not using presets */}
            <Box sx={{ display: 'flex', gap: 3, mb: 2 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                <Typography variant="body2" sx={{ fontSize: 13, color: theme.palette.text.secondary, textAlign: 'center' }}>
                  Primary
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                  <input
                    type="color"
                    value={primaryColor}
                    onChange={(e) => onPrimaryColorChange(e.target.value)}
                    style={{
                      width: '60px',
                      height: '60px',
                      border: `2px solid ${theme.palette.divider}`,
                      borderRadius: '8px',
                      cursor: 'pointer'
                    }}
                  />
                  <TextField
                    value={primaryColor}
                    onChange={(e) => onPrimaryColorChange(e.target.value)}
                    size="small"
                    sx={{ width: 90 }}
                    placeholder="#5E98C2"
                    inputProps={{ style: { fontSize: 11, textAlign: 'center' } }}
                  />
                </Box>
              </Box>
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                <Typography variant="body2" sx={{ fontSize: 13, color: theme.palette.text.secondary, textAlign: 'center' }}>
                  Secondary
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                  <input
                    type="color"
                    value={secondaryColor}
                    onChange={(e) => onSecondaryColorChange(e.target.value)}
                    style={{
                      width: '60px',
                      height: '60px',
                      border: `2px solid ${theme.palette.divider}`,
                      borderRadius: '8px',
                      cursor: 'pointer'
                    }}
                  />
                  <TextField
                    value={secondaryColor}
                    onChange={(e) => onSecondaryColorChange(e.target.value)}
                    size="small"
                    sx={{ width: 90 }}
                    placeholder="#ffffff"
                    inputProps={{ style: { fontSize: 11, textAlign: 'center' } }}
                  />
                </Box>
              </Box>
            </Box>
            
            {/* Club icon to the right of color pickers */}
            {clubIconSelector && (
              <Box sx={{ minWidth: 120, maxWidth: 120 }}>
                {clubIconSelector}
              </Box>
            )}
          </>
        )}
      </Box>
    </Box>
  );
};

export default ColorSchemeSelector;