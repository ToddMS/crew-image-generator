import React, { useState, useEffect } from 'react';
import {
  Box,
  CircularProgress,
  Typography
} from '@mui/material';
import { useTheme } from '@mui/material/styles';

interface TemplateConfig {
  background: string;
  nameDisplay: string;
  boatStyle: string;
  textLayout: string;
  logo: string;
  dimensions: { width: number; height: number };
  colors: { primary: string; secondary: string };
}

interface CrewData {
  name: string;
  clubName: string;
  raceName: string;
  boatType: { id: number; value: string; name: string };
  crewNames: string[];
  coachName?: string;
}

interface ClubIcon {
  type: 'upload' | 'preset';
  file?: File;
  filename?: string;
  base64?: string;
}

interface TemplatePreviewProps {
  templateConfig: TemplateConfig;
  crewData?: CrewData; // Optional - if not provided, uses dummy data
  clubIcon?: ClubIcon | null;
  selectedBoatType?: string; // For Template Builder mode
  width?: number;
  height?: number;
  onPreviewGenerated?: (imageUrl: string) => void;
  debounceMs?: number;
}

const TemplatePreview: React.FC<TemplatePreviewProps> = ({
  templateConfig,
  crewData,
  clubIcon,
  selectedBoatType,
  width = 300,
  height = 300,
  onPreviewGenerated,
  debounceMs = 500
}) => {
  const theme = useTheme();
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastGeneratedHash, setLastGeneratedHash] = useState<string>('');

  // Helper function to get boat name from type
  const getBoatName = (boatType: string) => {
    const boatNames = {
      '8+': 'Eight',
      '4+': 'Coxed Four',
      '4-': 'Coxless Four',
      '2x': 'Double Sculls',
      '2-': 'Coxless Pair',
      '1x': 'Single Sculls'
    };
    return boatNames[boatType as keyof typeof boatNames] || 'Eight';
  };

  // Create crew names based on boat type
  const getCrewNames = (boatType: string) => {
    switch (boatType) {
      case '8+':
        return ["Cox", "Julian", "Vian", "George", "Grayson", "Todd", "Alex", "Tim", ""];
      case '4+':
        return ["Cox", "Alice", "Bob", "Charlie", "David"];
      case '4-':
        return ["Alice", "Bob", "Charlie", "David"];
      case '2x':
        return ["Alice", "Bob"];
      case '2-':
        return ["Alice", "Bob"];
      case '1x':
        return ["Alice"];
      default:
        return ["Cox", "Julian", "Vian", "George", "Grayson", "Todd", "Alex", "Tim", ""];
    }
  };

  const generatePreview = async () => {
    // Create a hash of the current configuration to avoid unnecessary regeneration
    const configHash = JSON.stringify({
      templateConfig,
      crewData,
      clubIcon: clubIcon ? { type: clubIcon.type, filename: clubIcon.filename } : null,
      selectedBoatType
    });
    
    // Skip generation if nothing has actually changed
    if (configHash === lastGeneratedHash && previewImage) {
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      // Determine crew data to use
      let previewCrewData: CrewData;
      
      if (crewData) {
        // Use provided crew data (Generate Images mode)
        previewCrewData = crewData;
      } else {
        // Create dummy crew data (Template Builder mode)
        const boatType = selectedBoatType || '8+';
        previewCrewData = {
          name: "Template Preview",
          clubName: "Demo Club",
          raceName: "Head of the River",
          boatType: { id: 1, value: boatType, name: getBoatName(boatType) },
          crewNames: getCrewNames(boatType),
          coachName: "Demo Coach"
        };
      }
      
      // Convert uploaded file to base64 for preview
      let processedClubIcon = clubIcon;
      if (clubIcon && clubIcon.type === 'upload' && clubIcon.file) {
        const reader = new FileReader();
        const base64Promise = new Promise<string>((resolve) => {
          reader.onload = (e) => resolve(e.target?.result as string);
          reader.readAsDataURL(clubIcon.file);
        });
        const base64Data = await base64Promise;
        processedClubIcon = {
          type: 'upload',
          base64: base64Data,
          filename: clubIcon.filename
        };
      }
      
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/crews/generate-custom-image`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          crewId: null, // We'll pass the crew data directly
          crew: previewCrewData, // Pass crew data for preview
          templateConfig: templateConfig,
          clubIcon: processedClubIcon, // Pass the processed club icon for preview
          imageName: `preview_${Date.now()}.png`
        }),
      });

      if (!response.ok) throw new Error('Failed to generate preview');

      const blob = await response.blob();
      const imageUrl = URL.createObjectURL(blob);
      setPreviewImage(imageUrl);
      setLastGeneratedHash(configHash);
      
      if (onPreviewGenerated) {
        onPreviewGenerated(imageUrl);
      }
    } catch (err) {
      console.error('Error generating preview:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate preview');
    } finally {
      setLoading(false);
    }
  };

  // Auto-generate preview when config, crewData, clubIcon, or selectedBoatType changes
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      generatePreview();
    }, debounceMs);

    return () => clearTimeout(timeoutId);
  }, [
    // Spread templateConfig to track individual properties instead of object reference
    templateConfig.background,
    templateConfig.nameDisplay,
    templateConfig.boatStyle,
    templateConfig.textLayout,
    templateConfig.logo,
    templateConfig.colors.primary,
    templateConfig.colors.secondary,
    templateConfig.dimensions.width,
    templateConfig.dimensions.height,
    // Spread crewData to track individual properties
    crewData?.name,
    crewData?.clubName,
    crewData?.raceName,
    crewData?.boatType?.value,
    JSON.stringify(crewData?.crewNames), // Stringify array for comparison
    crewData?.coachName,
    // Track clubIcon properties
    clubIcon?.type,
    clubIcon?.filename,
    clubIcon?.base64,
    selectedBoatType,
    debounceMs
  ]);

  // Clean up blob URLs when component unmounts or image changes
  useEffect(() => {
    return () => {
      if (previewImage && previewImage.startsWith('blob:')) {
        URL.revokeObjectURL(previewImage);
      }
    };
  }, [previewImage]);

  return (
    <Box
      sx={{
        width: width,
        height: height,
        backgroundColor: theme.palette.grey[100],
        borderRadius: 2,
        border: `1px solid ${theme.palette.divider}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        position: 'relative'
      }}
    >
      {loading && (
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          width: '100%',
          height: '100%',
          backgroundColor: theme.palette.mode === 'dark' ? theme.palette.grey[800] : theme.palette.grey[100]
        }}>
          <CircularProgress 
            size={40} 
            sx={{ 
              color: theme.palette.mode === 'dark' ? theme.palette.grey[400] : theme.palette.grey[600]
            }} 
          />
        </Box>
      )}

      {previewImage && !loading && (
        <img
          src={previewImage}
          alt="Template Preview"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover'
          }}
        />
      )}

      {error && !loading && (
        <Box sx={{ textAlign: 'center', p: 2 }}>
          <Typography variant="caption" sx={{ color: theme.palette.error.main }}>
            Failed to generate preview
          </Typography>
        </Box>
      )}

      {!previewImage && !loading && !error && (
        <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
          Preview will appear here
        </Typography>
      )}
    </Box>
  );
};

export default TemplatePreview;