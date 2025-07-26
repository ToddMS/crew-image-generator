import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  Alert,
  CircularProgress,
} from '@mui/material';
import { SelectChangeEvent } from '@mui/material/Select';
import { useTheme } from '@mui/material/styles';
import styles from './ImageGenerator.module.css';
import { MdImage } from 'react-icons/md';
import { useAuth } from '../../context/AuthContext';
import TemplateSelector from './TemplateSelector';
import ColorSchemeSelector from './ColorSchemeSelector';
import ClubIconSelector from './ClubIconSelector';

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
        }}
        onPresetSelection={(presetId) => {
          setSelectedPresetId(presetId);
          const selectedPreset = presets.find(p => p.id === presetId);
          if (selectedPreset) {
            setPrimaryColor(selectedPreset.primary_color);
            setSecondaryColor(selectedPreset.secondary_color);
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
        inputId="club-icon-upload"
        presets={presets}
      />

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