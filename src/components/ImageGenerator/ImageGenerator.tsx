import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  Alert,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Radio,
  RadioGroup,
  Chip,
  Checkbox,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { SelectChangeEvent } from '@mui/material/Select';
import styles from './ImageGenerator.module.css';
import { MdImage } from 'react-icons/md';
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

interface ClubIconData {
  type: 'preset' | 'upload';
  filename?: string;
  file?: File;
}

interface ImageGeneratorProps {
  onGenerate: (imageName: string, template: string, colors?: { primary: string; secondary: string }, saveImage?: boolean, clubIcon?: ClubIconData | null) => Promise<void>;
  selectedCrew?: any;
}

const ImageGenerator: React.FC<ImageGeneratorProps> = ({
  onGenerate,
  selectedCrew,
}) => {
  const { user } = useAuth();
  const theme = useTheme();
  const [imageName, setImageName] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [primaryColor, setPrimaryColor] = useState('#5E98C2');
  const [secondaryColor, setSecondaryColor] = useState('#ffffff');
  const [saveImage] = useState(true); // Always save images
  
  // Preset state
  const [presets, setPresets] = useState<ClubPreset[]>([]);
  const [usePresetColors, setUsePresetColors] = useState(false);
  const [selectedPresetId, setSelectedPresetId] = useState<number | null>(null);
  
  // Club icon state
  const [clubIcon, setClubIcon] = useState<File | null>(null);
  const [clubIconPreview, setClubIconPreview] = useState<string | null>(null);
  const [useClubIcon, setUseClubIcon] = useState(false);

  // Load presets when component mounts and user is authenticated
  useEffect(() => {
    if (user) {
      loadPresets();
    }
  }, [user]);

  // Auto-populate image name based on selected crew
  useEffect(() => {
    if (selectedCrew && !imageName) {
      setImageName(`${selectedCrew.boatName}_${selectedCrew.raceName}`);
    }
  }, [selectedCrew]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Enter' && (event.ctrlKey || event.metaKey)) {
        event.preventDefault();
        if (imageName && selectedTemplate && !isGenerating) {
          handleFormSubmit(event as any);
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [imageName, selectedTemplate, isGenerating]);

  // Handle preset selection changes
  const handlePresetModeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const usePresetMode = event.target.value === 'preset';
    setUsePresetColors(usePresetMode);
    
    if (usePresetMode) {
      // If switching to preset mode, try to use default or first preset
      const defaultPreset = presets.find(p => p.is_default);
      if (defaultPreset) {
        setSelectedPresetId(defaultPreset.id);
        setPrimaryColor(defaultPreset.primary_color);
        setSecondaryColor(defaultPreset.secondary_color);
        // Enable club icon if preset has one
        if (defaultPreset.logo_filename) {
          setUseClubIcon(true);
        }
      } else if (presets.length > 0) {
        setSelectedPresetId(presets[0].id);
        setPrimaryColor(presets[0].primary_color);
        setSecondaryColor(presets[0].secondary_color);
        // Enable club icon if preset has one
        if (presets[0].logo_filename) {
          setUseClubIcon(true);
        }
      }
    } else {
      // Switching to manual mode
      setSelectedPresetId(null);
      setPrimaryColor('#5E98C2');
      setSecondaryColor('#ffffff');
    }
  };

  const handlePresetSelection = (event: SelectChangeEvent<number>) => {
    const presetId = event.target.value as number;
    setSelectedPresetId(presetId);
    
    const selectedPreset = presets.find(p => p.id === presetId);
    if (selectedPreset) {
      setPrimaryColor(selectedPreset.primary_color);
      setSecondaryColor(selectedPreset.secondary_color);
      // Enable club icon if preset has one
      if (selectedPreset.logo_filename) {
        setUseClubIcon(true);
      } else {
        setUseClubIcon(false);
      }
    }
  };

  const getLogoUrl = (filename?: string) => {
    return filename ? `${import.meta.env.VITE_API_URL}/api/club-presets/logos/${filename}` : null;
  };

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
        
        // Auto-select crew's club preset if it matches
        if (selectedCrew?.boatClub) {
          const matchingPreset = data.find((p: ClubPreset) => 
            p.club_name.toLowerCase() === selectedCrew.boatClub.toLowerCase()
          );
          if (matchingPreset) {
            setUsePresetColors(true);
            setSelectedPresetId(matchingPreset.id);
            setPrimaryColor(matchingPreset.primary_color);
            setSecondaryColor(matchingPreset.secondary_color);
          }
        }
      }
    } catch (error) {
      console.error('Error loading presets:', error);
    }
  };

  const templates = [
    { value: '1', label: 'Template 1 - Colorful' },
    { value: '2', label: 'Template 2 - Professional' },
    { value: '3', label: 'Template 3 - Modern' },
  ];

  const handleTemplateClick = (templateValue: string) => {
    setSelectedTemplate(templateValue);
  };

  // Handle club icon upload
  const handleClubIconUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Please select a valid image file');
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('File size must be less than 5MB');
        return;
      }
      
      setClubIcon(file);
      setUseClubIcon(true);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setClubIconPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeClubIcon = () => {
    setClubIcon(null);
    setClubIconPreview(null);
    setUseClubIcon(false);
  };

  const handleFormSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (imageName && selectedTemplate) {
      setIsGenerating(true);
      setError(null);
      try {
        const colors = { primary: primaryColor, secondary: secondaryColor };
        
        // Prepare club icon data
        let clubIconData = null;
        if (usePresetColors && selectedPresetId) {
          const selectedPreset = presets.find(p => p.id === selectedPresetId);
          if (selectedPreset?.logo_filename) {
            clubIconData = {
              type: 'preset',
              filename: selectedPreset.logo_filename
            };
          }
        } else if (useClubIcon && clubIcon) {
          clubIconData = {
            type: 'upload',
            file: clubIcon
          };
        }
        
        await onGenerate(imageName, selectedTemplate, colors, saveImage, clubIconData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to generate image');
      } finally {
        setIsGenerating(false);
      }
    }
  };

  return (
    <Box 
      component="form" 
      className={styles.container} 
      onSubmit={handleFormSubmit}
      sx={{
        backgroundColor: theme.palette.background.paper,
        borderColor: theme.palette.divider,
        color: theme.palette.text.primary
      }}
    >
      <Typography variant="h6" gutterBottom sx={{ fontWeight: 400, textAlign: 'center', mb: 2, letterSpacing: 1 }}>
        Generate Image
      </Typography>
      
      <div>
        <Typography className={styles.label}>Image Name</Typography>
        <TextField
          name="imageName"
          placeholder="Enter image name"
          required
          fullWidth
          variant="outlined"
          className={styles.inputField}
          value={imageName}
          onChange={e => setImageName(e.target.value)}
        />
      </div>

      <div>
        <Typography className={styles.label}>Choose Template</Typography>
        <div className={styles.templateGrid}>
          {templates.map((template) => (
            <Box
              key={template.value}
              className={`${styles.templateCard} ${
                selectedTemplate === template.value ? styles.selected : ''
              }`}
              onClick={() => handleTemplateClick(template.value)}
              sx={{
                backgroundColor: selectedTemplate === template.value 
                  ? (theme.palette.mode === 'dark' ? 'rgba(125, 179, 211, 0.2)' : '#f0f7ff')
                  : theme.palette.background.paper,
                borderColor: selectedTemplate === template.value 
                  ? theme.palette.primary.main 
                  : theme.palette.divider,
                color: theme.palette.text.primary,
                '&:hover': {
                  borderColor: theme.palette.primary.main,
                  backgroundColor: theme.palette.mode === 'dark' ? 'rgba(125, 179, 211, 0.1)' : '#f0f7ff'
                }
              }}
            >
              <div className={styles.templateImage}>
                <MdImage size={48} color={theme.palette.primary.main} />
              </div>
              <Typography sx={{ color: theme.palette.text.primary, fontSize: 14, fontWeight: 500 }}>
                {template.label}
              </Typography>
            </Box>
          ))}
        </div>
      </div>

      {/* Color Scheme Section with Preset Option */}
      <div>
        <Typography className={styles.label}>Color Scheme</Typography>
        
        {user && presets.length > 0 && (
          <Box mb={2}>
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
          <Box>
            <FormControl fullWidth variant="outlined" className={styles.inputField} sx={{ mb: 2 }}>
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
          </Box>
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
                  onChange={(e) => setPrimaryColor(e.target.value)}
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
                  onChange={(e) => setPrimaryColor(e.target.value)}
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
                  onChange={(e) => setSecondaryColor(e.target.value)}
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
                  onChange={(e) => setSecondaryColor(e.target.value)}
                  size="small"
                  sx={{ flex: 1 }}
                  placeholder="#ffffff"
                />
              </Box>
            </Box>
          </Box>
        )}
      </div>

      {/* Club Icon Section */}
      <div>
        <Typography className={styles.label}>Club Icon (Optional)</Typography>
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
                  onChange={(e) => setUseClubIcon(e.target.checked)}
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
                      id="club-icon-upload"
                    />
                    <label htmlFor="club-icon-upload">
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
                      onClick={removeClubIcon}
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

      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}


      <Button
        type="submit"
        variant="contained"
        disabled={isGenerating || !imageName || !selectedTemplate}
        sx={{
          backgroundColor: theme.palette.primary.main,
          color: '#fff',
          padding: '10px',
          borderRadius: '6px',
          boxShadow: `0 2px 8px rgba(${theme.palette.mode === 'dark' ? '125, 179, 211' : '94, 152, 194'}, 0.15)`,
          '&:hover': {
            backgroundColor: theme.palette.primary.dark || '#4177a6',
          },
          '&:disabled': {
            backgroundColor: theme.palette.mode === 'dark' ? '#555' : '#ccc',
          },
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}
      >
        {isGenerating ? (
          <>
            <CircularProgress size={20} color="inherit" />
            Generating...
          </>
        ) : (
          <>
            Generate Image
            <MdImage size={24} />
          </>
        )}
      </Button>
    </Box>
  );
};

export default ImageGenerator;