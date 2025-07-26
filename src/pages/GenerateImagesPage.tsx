import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Alert,
  Button,
  Card,
  CardContent,
  Chip,
  IconButton
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useLocation, useNavigate } from 'react-router-dom';
import { MdClose, MdArrowBack, MdImage } from 'react-icons/md';
import ImageGenerator from '../components/ImageGenerator/ImageGenerator';
import LoginPrompt from '../components/Auth/LoginPrompt';
import { useAuth } from '../context/AuthContext';
import { useAnalytics } from '../context/AnalyticsContext';
import { ApiService } from '../services/api.service';

interface ClubIconData {
  type: 'preset' | 'upload';
  filename?: string;
  file?: File;
}

const GenerateImagesPage: React.FC = () => {
  const theme = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { trackEvent } = useAnalytics();

  const [selectedCrewIds, setSelectedCrewIds] = useState<string[]>([]);
  const [selectedCrews, setSelectedCrews] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);

  // Check if we came from crews page with selected crews
  useEffect(() => {
    const state = location.state as any;
    console.log('GenerateImagesPage state:', state);
    if (state?.selectedCrewIds) {
      console.log('Setting selected crew IDs:', state.selectedCrewIds);
      setSelectedCrewIds(state.selectedCrewIds);
    } else if (state?.selectedCrewIndex !== undefined) {
      // Handle legacy single crew selection
      loadCrews().then(crews => {
        if (crews && crews[state.selectedCrewIndex]) {
          setSelectedCrewIds([crews[state.selectedCrewIndex].id]);
        }
      });
    }
  }, [location.state]);

  // Load crew details when we have selected IDs
  useEffect(() => {
    console.log('Selected crew IDs changed:', selectedCrewIds);
    if (selectedCrewIds.length > 0) {
      loadSelectedCrews();
    }
  }, [selectedCrewIds]);

  const loadCrews = async () => {
    try {
      const result = await ApiService.getCrews();
      if (result.data) {
        return result.data.map(crew => ({
          ...crew,
          boatClub: crew.clubName,
          boatName: crew.name,
          boatClass: crew.boatType.value,
          crewMembers: crew.crewNames.map((name, idx) => ({
            seat: `${idx + 1}`,
            name
          }))
        }));
      }
    } catch (error) {
      console.error('Error loading crews:', error);
    }
    return [];
  };

  const loadSelectedCrews = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const allCrews = await loadCrews();
      const selected = allCrews.filter(crew => selectedCrewIds.includes(crew.id));
      setSelectedCrews(selected);
    } catch (error) {
      console.error('Error loading selected crews:', error);
      setError('Failed to load crew details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveCrew = (crewId: string) => {
    const newIds = selectedCrewIds.filter(id => id !== crewId);
    setSelectedCrewIds(newIds);
    
    if (newIds.length === 0) {
      // No crews left, go back to My Crews
      navigate('/crews');
    }
  };

  const handleGenerateImages = async (
    imageName: string, 
    template: string, 
    colors?: { primary: string; secondary: string }, 
    saveImage?: boolean, 
    clubIcon?: ClubIconData | null
  ) => {
    if (selectedCrews.length === 0) return;

    setGenerating(true);
    setError(null);

    try {
      let successCount = 0;
      
      for (let i = 0; i < selectedCrews.length; i++) {
        const crew = selectedCrews[i];
        
        try {
          const imageBlob = await ApiService.generateImage(
            crew.id, 
            `${crew.boatName}_${crew.raceName}`, 
            template, 
            colors, 
            clubIcon
          );
          
          if (imageBlob) {
            await ApiService.saveImage(crew.id, `${crew.boatName}_${crew.raceName}`, template, colors, imageBlob);
            successCount++;
            
            trackEvent('image_generated', {
              template,
              primaryColor: colors?.primary,
              secondaryColor: colors?.secondary,
              crewName: crew.boatName,
              raceName: crew.raceName,
              boatClass: crew.boatClass
            });
          }
        } catch (error) {
          console.error(`Error generating image for crew ${crew.boatName}:`, error);
        }
        
        // Small delay between generations
        if (i < selectedCrews.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }
      
      if (successCount > 0) {
        trackEvent('bulk_generation', {
          template,
          crewCount: successCount,
          primaryColor: colors?.primary,
          secondaryColor: colors?.secondary
        });
        
        // Navigate to gallery after successful generation
        navigate('/gallery');
      } else {
        setError('Failed to generate any images. Please try again.');
      }
    } catch (error) {
      console.error('Error during bulk generation:', error);
      setError('Failed to generate images. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  const getBoatClassColor = (boatClass: string) => {
    const colors: Record<string, string> = {
      '8+': '#FF6B6B',
      '4+': '#4ECDC4', 
      '4-': '#45B7D1',
      '4x': '#96CEB4',
      '2-': '#E67E22',
      '2x': '#DDA0DD',
      '1x': '#FFB347',
    };
    return colors[boatClass] || '#9E9E9E';
  };

  if (!user) {
    return (
      <Box sx={{ textAlign: 'center', py: 8 }}>
        <Typography variant="h5" sx={{ color: theme.palette.text.primary, mb: 2 }}>
          Generate Images
        </Typography>
        <Typography variant="body1" sx={{ color: theme.palette.text.secondary, mb: 4 }}>
          Sign in to generate crew lineup images
        </Typography>
        <LoginPrompt 
          message="Sign in to generate crew lineup images"
          actionText="Generate Images"
        />
      </Box>
    );
  }

  if (loading) {
    return (
      <Box sx={{ textAlign: 'center', py: 8 }}>
        <Typography variant="h6" sx={{ color: theme.palette.text.secondary }}>
          Loading crew details...
        </Typography>
      </Box>
    );
  }

  if (selectedCrews.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 8 }}>
        <Typography variant="h5" sx={{ color: theme.palette.text.primary, mb: 2 }}>
          No Crews Selected
        </Typography>
        <Typography variant="body1" sx={{ color: theme.palette.text.secondary, mb: 4 }}>
          Select crews from My Crews page to generate images
        </Typography>
        <Button
          variant="contained"
          startIcon={<MdArrowBack />}
          onClick={() => navigate('/crews')}
        >
          Go to My Crews
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto' }}>
      {error && (
        <Alert 
          severity="error" 
          sx={{ mb: 3 }}
          onClose={() => setError(null)}
        >
          {error}
        </Alert>
      )}

      {/* Header */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h5" sx={{ fontWeight: 600 }}>
              Generate Images
            </Typography>
            <Button
              variant="outlined"
              startIcon={<MdArrowBack />}
              onClick={() => navigate('/crews')}
            >
              Back to My Crews
            </Button>
          </Box>
          <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
            Choose a template and customize settings for your selected crews
          </Typography>
        </CardContent>
      </Card>

      {/* Selected Crews */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
            Selected Crews ({selectedCrews.length})
          </Typography>
          
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {selectedCrews.map((crew) => (
              <Chip
                key={crew.id}
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box
                      sx={{
                        width: 12,
                        height: 12,
                        borderRadius: '50%',
                        backgroundColor: getBoatClassColor(crew.boatClass)
                      }}
                    />
                    <span>{crew.boatClub} - {crew.boatName}</span>
                  </Box>
                }
                onDelete={() => handleRemoveCrew(crew.id)}
                deleteIcon={<MdClose size={16} />}
                variant="outlined"
                sx={{
                  '& .MuiChip-label': {
                    px: 1
                  }
                }}
              />
            ))}
          </Box>
        </CardContent>
      </Card>

      {/* Template Selection and Generation */}
      <Card>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
            Choose Template & Generate
          </Typography>
          
          <ImageGenerator 
            onGenerate={handleGenerateImages}
            selectedCrew={selectedCrews[0]} // Use first crew for preview
            generating={generating}
            buttonText={
              selectedCrews.length === 1 
                ? 'Generate Image' 
                : `Generate ${selectedCrews.length} Images`
            }
          />
        </CardContent>
      </Card>
    </Box>
  );
};

export default GenerateImagesPage;