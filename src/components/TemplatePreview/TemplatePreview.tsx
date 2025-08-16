import React, { useState, useEffect } from 'react';
import { Box, CircularProgress, Typography, Button, IconButton } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { MdChevronLeft, MdChevronRight } from 'react-icons/md';

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
  showGenerateButton?: boolean; // Whether to show the generate button
  onGenerate?: () => void; // Callback for generate button
  generating?: boolean; // Whether generation is in progress
  selectedCrewCount?: number; // Number of selected crews for button text
  mode?: 'template-builder' | 'generate-images'; // What mode the preview is in
  showCyclingControls?: boolean; // Whether to show cycling controls
  currentIndex?: number; // Current preview index
  totalCount?: number; // Total number of items
  onPrevious?: () => void; // Previous button callback
  onNext?: () => void; // Next button callback
  onIndexSelect?: (index: number) => void; // Dot selection callback
}

const TemplatePreview: React.FC<TemplatePreviewProps> = ({
  templateConfig,
  crewData,
  clubIcon,
  selectedBoatType,
  width = 300,
  height = 300,
  onPreviewGenerated,
  debounceMs = 500,
  showGenerateButton = false,
  onGenerate,
  generating = false,
  selectedCrewCount = 0,
  mode = 'template-builder',
  showCyclingControls = false,
  currentIndex = 0,
  totalCount = 0,
  onPrevious,
  onNext,
  onIndexSelect,
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
      '1x': 'Single Sculls',
    };
    return boatNames[boatType as keyof typeof boatNames] || 'Eight';
  };

  // Create crew names based on boat type
  const getCrewNames = (boatType: string) => {
    switch (boatType) {
      case '8+':
        return ['Cox', 'Julian', 'Vian', 'George', 'Grayson', 'Todd', 'Alex', 'Tim', ''];
      case '4+':
        return ['Cox', 'Alice', 'Bob', 'Charlie', 'David'];
      case '4-':
        return ['Alice', 'Bob', 'Charlie', 'David'];
      case '2x':
        return ['Alice', 'Bob'];
      case '2-':
        return ['Alice', 'Bob'];
      case '1x':
        return ['Alice'];
      default:
        return ['Cox', 'Julian', 'Vian', 'George', 'Grayson', 'Todd', 'Alex', 'Tim', ''];
    }
  };

  const generatePreview = async () => {
    // In generate-images mode, don't generate preview if no crew data is provided
    if (mode === 'generate-images' && !crewData) {
      setPreviewImage(null);
      setLoading(false);
      setError(null);
      return;
    }

    // Create a hash of the current configuration to avoid unnecessary regeneration
    const configHash = JSON.stringify({
      templateConfig,
      crewData,
      clubIcon: clubIcon ? { type: clubIcon.type, filename: clubIcon.filename } : null,
      selectedBoatType,
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
          name: 'Template Preview',
          clubName: 'Demo Club',
          raceName: 'Head of the River',
          boatType: { id: 1, value: boatType, name: getBoatName(boatType) },
          crewNames: getCrewNames(boatType),
          coachName: 'Demo Coach',
        };
      }

      // Convert uploaded file to base64 for preview
      let processedClubIcon = clubIcon;
      if (clubIcon && clubIcon.type === 'upload' && clubIcon.file) {
        const reader = new FileReader();
        const base64Promise = new Promise<string>((resolve) => {
          reader.onload = (e) => resolve(e.target?.result as string);
          reader.readAsDataURL(clubIcon.file!);
        });
        const base64Data = await base64Promise;
        processedClubIcon = {
          type: 'upload',
          base64: base64Data,
          filename: clubIcon.filename,
        };
      }

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/crews/generate-custom-image`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            crewId: null, // We'll pass the crew data directly
            crew: previewCrewData, // Pass crew data for preview
            templateConfig: templateConfig,
            clubIcon: processedClubIcon, // Pass the processed club icon for preview
            imageName: `preview_${Date.now()}.png`,
          }),
        },
      );

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
    debounceMs,
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
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
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
          position: 'relative',
        }}
      >
        {loading && (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '100%',
              height: '100%',
              backgroundColor:
                theme.palette.mode === 'dark' ? theme.palette.grey[800] : theme.palette.grey[100],
            }}
          >
            <CircularProgress
              size={40}
              sx={{
                color:
                  theme.palette.mode === 'dark' ? theme.palette.grey[400] : theme.palette.grey[600],
              }}
            />
          </Box>
        )}

        {previewImage && !loading && (
          <>
            <img
              src={previewImage}
              alt="Template Preview"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
              }}
            />

            {/* Cycling Controls Overlay - Show when showCyclingControls is true */}
            {showCyclingControls && totalCount > 1 && (
              <Box
                sx={{
                  position: 'absolute',
                  bottom: 8,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  backgroundColor: 'rgba(0, 0, 0, 0.6)',
                  borderRadius: 2,
                  px: 1.5,
                  py: 0.5,
                }}
              >
                <IconButton
                  size="small"
                  onClick={onPrevious}
                  sx={{
                    color: 'white',
                    '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.1)' },
                  }}
                >
                  <MdChevronLeft size={16} />
                </IconButton>

                <Box sx={{ display: 'flex', gap: 0.5 }}>
                  {Array.from({ length: totalCount }).map((_, index) => (
                    <Box
                      key={index}
                      onClick={() => onIndexSelect?.(index)}
                      sx={{
                        width: 6,
                        height: 6,
                        borderRadius: '50%',
                        backgroundColor:
                          index === currentIndex ? 'white' : 'rgba(255, 255, 255, 0.5)',
                        cursor: 'pointer',
                        transition: 'background-color 0.2s ease',
                        '&:hover': {
                          backgroundColor: 'rgba(255, 255, 255, 0.8)',
                        },
                      }}
                    />
                  ))}
                </Box>

                <IconButton
                  size="small"
                  onClick={onNext}
                  sx={{
                    color: 'white',
                    '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.1)' },
                  }}
                >
                  <MdChevronRight size={16} />
                </IconButton>
              </Box>
            )}
          </>
        )}

        {error && !loading && (
          <Box sx={{ textAlign: 'center', p: 2 }}>
            <Typography variant="caption" sx={{ color: theme.palette.error.main }}>
              Failed to generate preview
            </Typography>
          </Box>
        )}

        {!previewImage && !loading && !error && (
          <Box sx={{ textAlign: 'center', p: 2 }}>
            {mode === 'generate-images' ? (
              <>
                <Typography variant="h6" sx={{ color: theme.palette.text.primary, mb: 1 }}>
                  Select Crews & Template
                </Typography>
                <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                  Choose crews and a template to see the preview
                </Typography>
              </>
            ) : (
              <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                Preview will appear here
              </Typography>
            )}
          </Box>
        )}
      </Box>

      {/* Generate Button - Show when preview is ready and showGenerateButton is true */}
      {showGenerateButton && previewImage && !loading && !error && onGenerate && (
        <Button
          variant="contained"
          size="large"
          onClick={onGenerate}
          disabled={generating}
          sx={{
            mt: 2,
            py: 1.5,
            px: 3,
            fontSize: '0.875rem',
            fontWeight: 600,
            minWidth: 200,
            width: '100%',
            maxWidth: width,
          }}
        >
          {generating
            ? 'Generating...'
            : `Generate ${selectedCrewCount} Image${selectedCrewCount !== 1 ? 's' : ''}`}
        </Button>
      )}
    </Box>
  );
};

export default TemplatePreview;
