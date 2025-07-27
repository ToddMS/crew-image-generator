import React from 'react';
import {
  Box,
  Typography,
  Button
} from '@mui/material';
import { useTheme } from '@mui/material/styles';

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
    <Box sx={{ 
      width: '100%'
    }}>
      <Typography 
        variant="body2" 
        sx={{ 
          mb: 1, 
          fontSize: 13, 
          color: theme.palette.text.secondary, 
          textAlign: 'center' 
        }}
      >
        Club Icon
      </Typography>
      
      {/* Show preset club icon if using preset */}
      {usePresetColors && selectedPresetId ? (
        <Box sx={{ mb: 2 }}>
          {(() => {
            const selectedPreset = presets.find(p => p.id === selectedPresetId);
            return selectedPreset?.logo_filename ? (
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                <Box sx={{
                  width: '70px',
                  height: '70px',
                  border: `2px solid ${theme.palette.divider}`,
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: theme.palette.background.paper
                }}>
                  <img 
                    src={`${import.meta.env.VITE_API_URL}/api/club-presets/logos/${selectedPreset.logo_filename}`}
                    alt="Club logo"
                    style={{ width: '60px', height: '60px', objectFit: 'contain' }}
                  />
                </Box>
                <Box sx={{ width: 90, textAlign: 'center' }}>
                  <Typography variant="caption" sx={{ 
                    fontSize: 11, 
                    color: theme.palette.text.secondary
                  }}>
                    From preset
                  </Typography>
                </Box>
              </Box>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                <Box sx={{
                  width: '70px',
                  height: '70px',
                  border: `2px solid ${theme.palette.divider}`,
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: theme.palette.background.paper,
                  color: theme.palette.text.secondary
                }}>
                  <Typography variant="caption" sx={{ fontSize: 10, textAlign: 'center' }}>
                    No Logo
                  </Typography>
                </Box>
                <Box sx={{ width: 90, textAlign: 'center' }}>
                  <Typography variant="caption" sx={{ 
                    fontSize: 11, 
                    color: theme.palette.text.secondary
                  }}>
                    From preset
                  </Typography>
                </Box>
              </Box>
            );
          })()}
        </Box>
      ) : (
        /* Manual club icon upload for manual color mode */
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
          {!clubIconPreview ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
              <input
                type="file"
                accept="image/*"
                onChange={handleClubIconUpload}
                style={{ display: 'none' }}
                id={inputId}
              />
              <label htmlFor={inputId}>
                <Box sx={{
                  width: '70px',
                  height: '70px',
                  border: `2px solid ${theme.palette.divider}`,
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: theme.palette.background.paper,
                  cursor: 'pointer',
                  '&:hover': {
                    borderColor: theme.palette.primary.main,
                  }
                }}>
                  <Typography variant="h4" sx={{ 
                    color: theme.palette.text.secondary,
                    userSelect: 'none'
                  }}>
                    +
                  </Typography>
                </Box>
              </label>
              <Box sx={{ width: 90, textAlign: 'center' }}>
                <Typography variant="caption" sx={{ 
                  fontSize: 11, 
                  color: theme.palette.text.secondary
                }}>
                  Click to add
                </Typography>
              </Box>
            </Box>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
              <Box sx={{
                width: '70px',
                height: '70px',
                border: `2px solid ${theme.palette.divider}`,
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: theme.palette.background.paper,
                position: 'relative'
              }}>
                <img 
                  src={clubIconPreview} 
                  alt="Logo preview" 
                  style={{ width: '60px', height: '60px', objectFit: 'contain' }}
                />
                <Button
                  size="small"
                  onClick={onRemoveClubIcon}
                  sx={{ 
                    position: 'absolute',
                    top: -8,
                    right: -8,
                    minWidth: 20,
                    width: 20,
                    height: 20,
                    borderRadius: '50%',
                    backgroundColor: theme.palette.error.main,
                    color: 'white',
                    fontSize: 12,
                    '&:hover': {
                      backgroundColor: theme.palette.error.dark,
                    }
                  }}
                >
                  ×
                </Button>
              </Box>
              <Box sx={{ width: 90, textAlign: 'center' }}>
                <Typography variant="caption" sx={{ 
                  fontSize: 11, 
                  color: theme.palette.text.secondary,
                  overflow: 'hidden', 
                  textOverflow: 'ellipsis', 
                  whiteSpace: 'nowrap'
                }}>
                  {clubIcon?.name?.replace(/\.[^/.]+$/, "") || "Club logo"}
                </Typography>
              </Box>
            </Box>
          )}
        </Box>
      )}
    </Box>
  );
};

export default ClubIconSelector;