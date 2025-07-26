import React, { useState, useEffect } from 'react';
import {
  Box,
  Tabs,
  Tab,
  Typography,
  Alert,
  Button,
  Card,
  CardContent,
  Chip
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useLocation, useNavigate } from 'react-router-dom';
import { MdImage, MdGroups, MdPhotoLibrary, MdGroup } from 'react-icons/md';
import ImageGenerator from '../components/ImageGenerator/ImageGenerator';
import BulkImageGenerator from '../components/BulkImageGenerator/BulkImageGenerator';
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

  const [activeTab, setActiveTab] = useState(0);
  const [savedCrews, setSavedCrews] = useState<any[]>([]);
  const [selectedCrewForImage, setSelectedCrewForImage] = useState<number | null>(null);
  const [selectedCrews, setSelectedCrews] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [galleryRefreshTrigger, setGalleryRefreshTrigger] = useState(0);

  // Check if we came from crews page with a specific crew selected
  useEffect(() => {
    const state = location.state as any;
    if (state?.selectedCrewIndex !== undefined) {
      setSelectedCrewForImage(state.selectedCrewIndex);
      setActiveTab(0); // Single generation tab
    }
  }, [location.state]);

  useEffect(() => {
    loadCrews();
  }, [user]);

  const loadCrews = async () => {
    if (!user) {
      setSavedCrews([]);
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const result = await ApiService.getCrews();
      if (result.data) {
        const transformedCrews = result.data.map(crew => ({
          ...crew,
          boatClub: crew.clubName,
          boatName: crew.name,
          boatClass: crew.boatType.value,
          crewMembers: crew.crewNames.map((name, idx) => ({
            seat: `${idx + 1}`,
            name
          }))
        }));
        setSavedCrews(transformedCrews);
      } else if (result.error) {
        setError('Failed to load crews. Please try again.');
      }
    } catch (error) {
      console.error('Error loading crews:', error);
      setError('Failed to load crews. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateImage = async (
    imageName: string, 
    template: string, 
    colors?: { primary: string; secondary: string }, 
    saveImage?: boolean, 
    clubIcon?: ClubIconData | null
  ) => {
    if (selectedCrewForImage === null) return;
    
    const selectedCrew = savedCrews[selectedCrewForImage];
    if (!selectedCrew) return;

    try {
      console.log('Generating image:', imageName, 'with template:', template, 'colors:', colors, 'clubIcon:', clubIcon, 'for crew:', selectedCrew);
      
      const imageBlob = await ApiService.generateImage(selectedCrew.id, imageName, template, colors, clubIcon);
      
      if (imageBlob) {
        try {
          await ApiService.saveImage(selectedCrew.id, imageName, template, colors, imageBlob);
          console.log('Image saved to crew gallery!');
          
          trackEvent('image_generated', {
            template,
            primaryColor: colors?.primary,
            secondaryColor: colors?.secondary,
            crewName: selectedCrew.boatName,
            raceName: selectedCrew.raceName,
            boatClass: selectedCrew.boatClass
          });
          
          setGalleryRefreshTrigger(prev => prev + 1);
          
          // Show success and offer to view gallery
          setError(null);
        } catch (error) {
          console.error('Error saving image:', error);
          setError('Image generated but failed to save. Please try again.');
        }
      } else {
        setError('Failed to generate image. Please try again.');
      }
    } catch (error) {
      console.error('Error generating image:', error);
      setError('Failed to generate image. Please try again.');
    }
  };

  const handleBulkGenerateImages = async (
    crewIds: string[], 
    template: string, 
    colors?: { primary: string; secondary: string },
    onProgress?: (current: number, total: number, crewName: string) => void,
    clubIcon?: ClubIconData | null
  ) => {
    console.log('Bulk generating images for crews:', crewIds, 'with template:', template, 'clubIcon:', clubIcon);
    
    for (let i = 0; i < crewIds.length; i++) {
      const crewId = crewIds[i];
      const crew = savedCrews.find(c => c.id === crewId);
      
      if (!crew) continue;
      
      try {
        const imageName = `${crew.boatName}_${crew.raceName}`;
        console.log(`Generating image ${i + 1}/${crewIds.length}: ${imageName} with clubIcon:`, clubIcon);
        
        onProgress?.(i + 1, crewIds.length, crew.boatName);
        
        const imageBlob = await ApiService.generateImage(crew.id, imageName, template, colors, clubIcon);
        
        if (imageBlob) {
          await ApiService.saveImage(crew.id, imageName, template, colors, imageBlob);
          console.log(`Image ${i + 1}/${crewIds.length} saved to gallery`);
        }
      } catch (error) {
        console.error(`Error generating image for crew ${crew.boatName}:`, error);
      }
      
      if (i < crewIds.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }
    
    trackEvent('bulk_generation', {
      template,
      crewCount: crewIds.length,
      primaryColor: colors?.primary,
      secondaryColor: colors?.secondary
    });
    
    setGalleryRefreshTrigger(prev => prev + 1);
    console.log('Bulk generation completed!');
  };

  const handleCrewSelection = (crewId: string, selected: boolean) => {
    const newSelected = new Set(selectedCrews);
    if (selected) {
      newSelected.add(crewId);
    } else {
      newSelected.delete(crewId);
    }
    setSelectedCrews(newSelected);
  };

  const handleDeselectCrew = (crewId: string) => {
    handleCrewSelection(crewId, false);
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
          Loading your crews...
        </Typography>
      </Box>
    );
  }

  if (savedCrews.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 8 }}>
        <Typography variant="h5" sx={{ color: theme.palette.text.primary, mb: 2 }}>
          No Crews Found
        </Typography>
        <Typography variant="body1" sx={{ color: theme.palette.text.secondary, mb: 4 }}>
          Create some crews first before generating images
        </Typography>
        <Button
          variant="contained"
          startIcon={<MdGroup />}
          onClick={() => navigate('/create')}
        >
          Create Your First Crew
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      {error && (
        <Alert 
          severity="error" 
          sx={{ mb: 3 }}
          action={
            <Button color="inherit" size="small" onClick={() => setError(null)}>
              Dismiss
            </Button>
          }
        >
          {error}
        </Alert>
      )}

      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" sx={{ color: theme.palette.text.secondary }}>
            {savedCrews.length} crew{savedCrews.length !== 1 ? 's' : ''} available for image generation
          </Typography>
          <Button
            variant="outlined"
            startIcon={<MdPhotoLibrary />}
            onClick={() => navigate('/gallery')}
          >
            View Gallery
          </Button>
        </Box>
      </Box>

      {/* Tabs */}
      <Card sx={{ mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={(_, newValue) => setActiveTab(newValue)}
          sx={{ borderBottom: `1px solid ${theme.palette.divider}` }}
        >
          <Tab
            icon={<MdImage />}
            label="Single Generation"
            iconPosition="start"
            sx={{ minHeight: 64 }}
          />
          <Tab
            icon={<MdGroups />}
            label="Bulk Generation"
            iconPosition="start"
            sx={{ minHeight: 64 }}
          />
        </Tabs>
      </Card>

      {/* Tab Content */}
      {activeTab === 0 && (
        <Box>
          {/* Crew Selection for Single Generation */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Select a Crew
              </Typography>
              <Typography variant="body2" sx={{ color: theme.palette.text.secondary, mb: 3 }}>
                Choose which crew lineup you want to generate an image for
              </Typography>
              
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                {savedCrews.map((crew, index) => (
                  <Chip
                    key={crew.id}
                    label={`${crew.boatName} (${crew.raceName})`}
                    onClick={() => setSelectedCrewForImage(index)}
                    color={selectedCrewForImage === index ? 'primary' : 'default'}
                    variant={selectedCrewForImage === index ? 'filled' : 'outlined'}
                    sx={{
                      cursor: 'pointer',
                      '&:hover': {
                        backgroundColor: selectedCrewForImage === index 
                          ? theme.palette.primary.dark 
                          : theme.palette.action.hover
                      }
                    }}
                  />
                ))}
              </Box>
            </CardContent>
          </Card>

          {/* Single Image Generator */}
          {selectedCrewForImage !== null && (
            <Card>
              <CardContent>
                <ImageGenerator 
                  onGenerate={handleGenerateImage}
                  selectedCrew={savedCrews[selectedCrewForImage]}
                />
              </CardContent>
            </Card>
          )}
        </Box>
      )}

      {activeTab === 1 && (
        <Box>
          <BulkImageGenerator
            selectedCrews={Array.from(selectedCrews)}
            onGenerate={handleBulkGenerateImages}
            onDeselectCrew={handleDeselectCrew}
            savedCrews={savedCrews}
          />
          
          {/* Crew Selection for Bulk Generation */}
          <Card sx={{ mt: 3 }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Select Crews for Bulk Generation
              </Typography>
              <Typography variant="body2" sx={{ color: theme.palette.text.secondary, mb: 3 }}>
                Choose multiple crews to generate images for all at once
              </Typography>
              
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                {savedCrews.map((crew) => (
                  <Chip
                    key={crew.id}
                    label={`${crew.boatName} (${crew.raceName})`}
                    onClick={() => handleCrewSelection(crew.id, !selectedCrews.has(crew.id))}
                    color={selectedCrews.has(crew.id) ? 'primary' : 'default'}
                    variant={selectedCrews.has(crew.id) ? 'filled' : 'outlined'}
                    sx={{
                      cursor: 'pointer',
                      '&:hover': {
                        backgroundColor: selectedCrews.has(crew.id)
                          ? theme.palette.primary.dark 
                          : theme.palette.action.hover
                      }
                    }}
                  />
                ))}
              </Box>
              
              {selectedCrews.size > 0 && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                    {selectedCrews.size} crew{selectedCrews.size !== 1 ? 's' : ''} selected for bulk generation
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Box>
      )}
    </Box>
  );
};

export default GenerateImagesPage;