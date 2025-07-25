import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Typography,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Radio,
  RadioGroup,
  Chip,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { SelectChangeEvent } from '@mui/material/Select';
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

interface BulkImageGeneratorProps {
  selectedCrews: string[];
  onGenerate: (
    crewIds: string[], 
    template: string, 
    colors?: { primary: string; secondary: string },
    onProgress?: (current: number, total: number, crewName: string) => void
  ) => Promise<void>;
  onDeselectCrew: (crewId: string) => void;
  savedCrews: any[];
}

const BulkImageGenerator: React.FC<BulkImageGeneratorProps> = ({
  selectedCrews,
  onGenerate,
  onDeselectCrew,
  savedCrews,
}) => {
  const { user } = useAuth();
  const theme = useTheme();
  const [selectedTemplate, setSelectedTemplate] = useState('1');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState({ current: 0, total: 0 });
  const [primaryColor, setPrimaryColor] = useState('#5E98C2');
  const [secondaryColor, setSecondaryColor] = useState('#ffffff');
  
  // Preset state
  const [presets, setPresets] = useState<ClubPreset[]>([]);
  const [usePresetColors, setUsePresetColors] = useState(false);
  const [selectedPresetId, setSelectedPresetId] = useState<number | null>(null);

  // Load presets when component mounts and user is authenticated
  useEffect(() => {
    if (user) {
      loadPresets();
    }
  }, [user]);

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
        
        // Auto-select default preset if available
        const defaultPreset = data.find((p: ClubPreset) => p.is_default);
        if (defaultPreset) {
          setUsePresetColors(true);
          setSelectedPresetId(defaultPreset.id);
          setPrimaryColor(defaultPreset.primary_color);
          setSecondaryColor(defaultPreset.secondary_color);
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

  const handlePresetModeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const usePresetMode = event.target.value === 'preset';
    setUsePresetColors(usePresetMode);
    
    if (usePresetMode) {
      const defaultPreset = presets.find(p => p.is_default);
      if (defaultPreset) {
        setSelectedPresetId(defaultPreset.id);
        setPrimaryColor(defaultPreset.primary_color);
        setSecondaryColor(defaultPreset.secondary_color);
      } else if (presets.length > 0) {
        setSelectedPresetId(presets[0].id);
        setPrimaryColor(presets[0].primary_color);
        setSecondaryColor(presets[0].secondary_color);
      }
    } else {
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
    }
  };

  const handleBulkGenerate = async () => {
    if (selectedCrews.length === 0 || !selectedTemplate) return;
    
    setIsGenerating(true);
    setGenerationProgress({ current: 0, total: selectedCrews.length });
    
    try {
      const colors = { primary: primaryColor, secondary: secondaryColor };
      await onGenerate(selectedCrews, selectedTemplate, colors, (current, total, crewName) => {
        setGenerationProgress({ current, total });
      });
    } catch (error) {
      console.error('Error in bulk generation:', error);
    } finally {
      setIsGenerating(false);
      setGenerationProgress({ current: 0, total: 0 });
    }
  };

  return (
    <Box sx={{ width: '100%', maxWidth: 800, mx: 'auto', mt: 4 }}>
      <Typography 
        variant="h6" 
        sx={{ 
          mb: 3, 
          textAlign: 'center', 
          color: theme.palette.text.primary,
          fontWeight: 500
        }}
      >
        Bulk Generate Images ({selectedCrews.length} crews selected)
      </Typography>

      {/* Selected crews chips */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, justifyContent: 'center', mb: 3 }}>
        {selectedCrews.map(crewId => {
          const crew = savedCrews.find(c => c.id === crewId);
          return crew ? (
            <Chip
              key={crewId}
              label={`${crew.boatName} (${crew.raceName})`}
              size="small"
              color="primary"
              variant="outlined"
              onDelete={() => onDeselectCrew(crewId)}
            />
          ) : null;
        })}
      </Box>

      <Box sx={{
        backgroundColor: theme.palette.background.paper,
        borderRadius: 2,
        border: `1px solid ${theme.palette.divider}`,
        p: 3,
      }}>
        {/* Template Selection */}
        <Box sx={{ mb: 3 }}>
          <Typography sx={{ mb: 2, fontWeight: 500, color: theme.palette.text.primary }}>
            Choose Template
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
            {templates.map((template) => (
              <Box
                key={template.value}
                onClick={() => handleTemplateClick(template.value)}
                sx={{
                  minWidth: 120,
                  height: 100,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  borderRadius: 2,
                  border: `2px solid ${selectedTemplate === template.value 
                    ? theme.palette.primary.main 
                    : theme.palette.divider}`,
                  backgroundColor: selectedTemplate === template.value 
                    ? (theme.palette.mode === 'dark' ? 'rgba(125, 179, 211, 0.2)' : '#f0f7ff')
                    : theme.palette.background.paper,
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    borderColor: theme.palette.primary.main,
                    backgroundColor: theme.palette.mode === 'dark' ? 'rgba(125, 179, 211, 0.1)' : '#f0f7ff'
                  }
                }}
              >
                <MdImage size={32} color={theme.palette.primary.main} />
                <Typography sx={{ 
                  color: theme.palette.text.primary, 
                  fontSize: 12, 
                  fontWeight: 500,
                  textAlign: 'center',
                  mt: 0.5
                }}>
                  {template.label}
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>

        {/* Color Options */}
        <Box sx={{ mb: 3 }}>
          <Typography sx={{ mb: 2, fontWeight: 500, color: theme.palette.text.primary }}>
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
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    style={{
                      width: '50px',
                      height: '40px',
                      border: `1px solid ${theme.palette.divider}`,
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}
                  />
                  <Box sx={{ 
                    px: 2, 
                    py: 1, 
                    backgroundColor: theme.palette.background.default,
                    borderRadius: 1,
                    flex: 1,
                    textAlign: 'center',
                    color: theme.palette.text.primary,
                    fontSize: 14
                  }}>
                    {primaryColor}
                  </Box>
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
                  <Box sx={{ 
                    px: 2, 
                    py: 1, 
                    backgroundColor: theme.palette.background.default,
                    borderRadius: 1,
                    flex: 1,
                    textAlign: 'center',
                    color: theme.palette.text.primary,
                    fontSize: 14
                  }}>
                    {secondaryColor}
                  </Box>
                </Box>
              </Box>
            </Box>
          )}
        </Box>

        {/* Generate Button */}
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
          <Button
            variant="contained"
            onClick={handleBulkGenerate}
            disabled={isGenerating || selectedCrews.length === 0 || !selectedTemplate}
            size="large"
            sx={{
              px: 6,
              py: 2,
              fontSize: '1.2rem',
              backgroundColor: theme.palette.primary.main,
              color: '#fff',
              borderRadius: 3,
              boxShadow: `0 4px 12px rgba(${theme.palette.mode === 'dark' ? '125, 179, 211' : '94, 152, 194'}, 0.3)`,
              '&:hover': {
                backgroundColor: theme.palette.primary.dark || '#4177a6',
                transform: 'translateY(-2px)',
                boxShadow: `0 6px 16px rgba(${theme.palette.mode === 'dark' ? '125, 179, 211' : '94, 152, 194'}, 0.4)`,
              },
              '&:disabled': {
                backgroundColor: theme.palette.mode === 'dark' ? '#555' : '#ccc',
              },
            }}
          >
            {isGenerating ? (
              <>
                <CircularProgress size={24} color="inherit" sx={{ mr: 2 }} />
                Generating {generationProgress.current}/{generationProgress.total}...
              </>
            ) : (
              <>
                <MdImage size={24} style={{ marginRight: 8 }} />
                Generate {selectedCrews.length} Images
              </>
            )}
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default BulkImageGenerator;