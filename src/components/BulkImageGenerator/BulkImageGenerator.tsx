import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Typography,
  CircularProgress,
  Chip,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { MdImage } from 'react-icons/md';
import { useAuth } from '../../context/AuthContext';
import TemplateSelector from '../ImageGenerator/TemplateSelector';
import ColorSchemeSelector from '../ImageGenerator/ColorSchemeSelector';
import ClubIconSelector from '../ImageGenerator/ClubIconSelector';

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

interface BulkImageGeneratorProps {
  selectedCrews: string[];
  onGenerate: (
    crewIds: string[], 
    template: string, 
    colors?: { primary: string; secondary: string },
    onProgress?: (current: number, total: number, crewName: string) => void,
    clubIcon?: ClubIconData | null
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
          // Enable club icon if preset has one
          if (defaultPreset.logo_filename) {
            setUseClubIcon(true);
          }
        }
      }
    } catch (error) {
      console.error('Error loading presets:', error);
    }
  };

  // Handle club icon upload
  const handleClubIconUpload = (file: File) => {
    setClubIcon(file);
    setUseClubIcon(true);
    
    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setClubIconPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const removeClubIcon = () => {
    setClubIcon(null);
    setClubIconPreview(null);
    setUseClubIcon(false);
  };

  const handleBulkGenerate = async () => {
    if (selectedCrews.length === 0 || !selectedTemplate) return;
    
    setIsGenerating(true);
    setGenerationProgress({ current: 0, total: selectedCrews.length });
    
    try {
      const colors = { primary: primaryColor, secondary: secondaryColor };
      
      // Prepare club icon data for bulk generation
      let clubIconData = null;
      console.log('Bulk generation state:', { usePresetColors, selectedPresetId, useClubIcon, clubIcon });
      
      if (usePresetColors && selectedPresetId) {
        const selectedPreset = presets.find(p => p.id === selectedPresetId);
        console.log('Selected preset:', selectedPreset);
        if (selectedPreset?.logo_filename) {
          clubIconData = {
            type: 'preset',
            filename: selectedPreset.logo_filename
          };
          console.log('Bulk generation using preset club icon:', clubIconData);
        } else {
          console.log('Selected preset has no logo_filename');
        }
      } else if (useClubIcon && clubIcon) {
        clubIconData = {
          type: 'upload',
          file: clubIcon
        };
        console.log('Bulk generation using uploaded club icon:', clubIconData);
      }
      
      console.log('Final bulk generation club icon data:', clubIconData);
      
      await onGenerate(selectedCrews, selectedTemplate, colors, (current, total, crewName) => {
        setGenerationProgress({ current, total });
      }, clubIconData);
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
        <TemplateSelector
          selectedTemplate={selectedTemplate}
          onTemplateSelect={setSelectedTemplate}
        />

        <ColorSchemeSelector
          primaryColor={primaryColor}
          secondaryColor={secondaryColor}
          usePresetColors={usePresetColors}
          selectedPresetId={selectedPresetId}
          onPrimaryColorChange={setPrimaryColor}
          onSecondaryColorChange={setSecondaryColor}
          onPresetModeChange={(usePreset) => {
            setUsePresetColors(usePreset);
            if (usePreset) {
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
              setSelectedPresetId(null);
              setPrimaryColor('#5E98C2');
              setSecondaryColor('#ffffff');
            }
          }}
          onPresetSelection={(presetId) => {
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
          }}
          presets={presets}
        />

        <ClubIconSelector
          usePresetColors={usePresetColors}
          selectedPresetId={selectedPresetId}
          useClubIcon={useClubIcon}
          clubIcon={clubIcon}
          clubIconPreview={clubIconPreview}
          onUseClubIconChange={setUseClubIcon}
          onClubIconUpload={handleClubIconUpload}
          onRemoveClubIcon={removeClubIcon}
          inputId="bulk-club-icon-upload"
          presets={presets}
        />

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