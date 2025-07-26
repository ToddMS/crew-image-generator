import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  FormControlLabel,
  Checkbox
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
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

interface ClubIconSelectorProps {
  usePresetColors: boolean;
  selectedPresetId: number | null;
  useClubIcon: boolean;
  clubIcon: File | null;
  clubIconPreview: string | null;
  onUseClubIconChange: (useIcon: boolean) => void;
  onClubIconUpload: (file: File) => void;
  onRemoveClubIcon: () => void;
  inputId?: string;
  presets?: ClubPreset[];
}

const ClubIconSelector: React.FC<ClubIconSelectorProps> = ({
  usePresetColors,
  selectedPresetId,
  useClubIcon,
  clubIcon,
  clubIconPreview,
  onUseClubIconChange,
  onClubIconUpload,
  onRemoveClubIcon,
  inputId = 'club-icon-upload',
  presets = []
}) => {
  const theme = useTheme();

  const handleClubIconUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        console.error('Please select a valid image file');
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        console.error('File size must be less than 5MB');
        return;
      }
      
      onClubIconUpload(file);
    }
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
        Club Icon (Optional)
      </Typography>
      
      <Typography variant="body2" sx={{ mb: 2, fontSize: 12, color: theme.palette.text.secondary }}>
        Add your club logo to appear in the bottom-right corner of generated images
      </Typography>
      
      {/* Show preset club icon if using preset */}
      {usePresetColors && selectedPresetId && (
        <Box sx={{ mb: 2 }}>
          {(() => {
            const selectedPreset = presets.find(p => p.id === selectedPresetId);
            return selectedPreset?.logo_filename ? (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2, border: `1px solid ${theme.palette.divider}`, borderRadius: 1 }}>
                <img 
                  src={`${import.meta.env.VITE_API_URL}/api/club-presets/logos/${selectedPreset.logo_filename}`}
                  alt="Club logo"
                  style={{ width: '40px', height: '40px', objectFit: 'contain' }}
                />
                <Typography variant="body2" sx={{ color: theme.palette.text.primary }}>
                  Using club logo from preset: {selectedPreset.preset_name}
                </Typography>
              </Box>
            ) : (
              <Typography variant="body2" sx={{ color: theme.palette.text.secondary, fontStyle: 'italic' }}>
                Selected preset doesn't have a club logo
              </Typography>
            );
          })()}
        </Box>
      )}
      
      {/* Manual club icon upload for manual color mode */}
      {!usePresetColors && (
        <Box>
          <FormControlLabel
            control={
              <Checkbox
                checked={useClubIcon}
                onChange={(e) => onUseClubIconChange(e.target.checked)}
                size="small"
              />
            }
            label="Add club icon to image"
            sx={{ mb: 1 }}
          />
          
          {useClubIcon && (
            <Box sx={{ mt: 2 }}>
              {!clubIconPreview ? (
                <Box>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleClubIconUpload}
                    style={{ display: 'none' }}
                    id={inputId}
                  />
                  <label htmlFor={inputId}>
                    <Button
                      variant="outlined"
                      component="span"
                      sx={{
                        borderColor: theme.palette.divider,
                        color: theme.palette.text.primary,
                        '&:hover': {
                          borderColor: theme.palette.primary.main,
                        }
                      }}
                    >
                      Choose Club Logo
                    </Button>
                  </label>
                  <Typography variant="caption" sx={{ display: 'block', mt: 1, color: theme.palette.text.secondary }}>
                    Supported: PNG, JPG, GIF (max 5MB)
                  </Typography>
                </Box>
              ) : (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2, border: `1px solid ${theme.palette.divider}`, borderRadius: 1 }}>
                  <img 
                    src={clubIconPreview} 
                    alt="Club logo preview" 
                    style={{ width: '40px', height: '40px', objectFit: 'contain' }}
                  />
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="body2" sx={{ color: theme.palette.text.primary }}>
                      {clubIcon?.name}
                    </Typography>
                    <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                      {clubIcon && (clubIcon.size / 1024).toFixed(1)} KB
                    </Typography>
                  </Box>
                  <Button
                    size="small"
                    onClick={onRemoveClubIcon}
                    sx={{ color: theme.palette.error.main }}
                  >
                    Remove
                  </Button>
                </Box>
              )}
            </Box>
          )}
        </Box>
      )}
    </div>
  );
};

export default ClubIconSelector;