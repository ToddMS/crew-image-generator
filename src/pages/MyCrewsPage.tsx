import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Button,
  Typography,
  Alert,
  Card,
  CardContent,
  Chip,
  IconButton,
  Divider
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useNavigate, useLocation } from 'react-router-dom';
import { MdChecklist, MdPersonAdd, MdClose, MdKeyboardArrowDown, MdKeyboardArrowUp } from 'react-icons/md';
import SavedCrewsComponent from '../components/SavedCrewsComponent/SavedCrewComponent';
import LoginPrompt from '../components/Auth/LoginPrompt';
import ImageGenerator from '../components/ImageGenerator/ImageGenerator';
import { useAuth } from '../context/AuthContext';
import { useAnalytics } from '../context/AnalyticsContext';
import { ApiService } from '../services/api.service';

const boatClassToSeats: Record<string, number> = {
  '8+': 8,
  '4+': 4,
  '4-': 4,
  '4x': 4,
  '2-': 2,
  '2x': 2,
  '1x': 1,
};

const boatClassHasCox = (boatClass: string) => boatClass === '8+' || boatClass === '4+';

const boatClassToBoatType = (boatClass: string) => {
  const mapping: Record<string, any> = {
    '8+': { id: 1, value: '8+', seats: 8, name: 'Eight with Coxswain' },
    '4+': { id: 2, value: '4+', seats: 4, name: 'Four with Coxswain' },
    '4-': { id: 3, value: '4-', seats: 4, name: 'Four without Coxswain' },
    '4x': { id: 6, value: '4x', seats: 4, name: 'Quad Sculls' },
    '2-': { id: 7, value: '2-', seats: 2, name: 'Coxless Pair' },
    '2x': { id: 4, value: '2x', seats: 2, name: 'Double Sculls' },
    '1x': { id: 5, value: '1x', seats: 1, name: 'Single Sculls' },
  };
  return mapping[boatClass];
};

const MyCrewsPage: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { trackEvent } = useAnalytics();

  const [savedCrews, setSavedCrews] = useState<any[]>([]);
  const [recentCrews, setRecentCrews] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [bulkMode, setBulkMode] = useState(false);
  const [selectedCrews, setSelectedCrews] = useState<Set<string>>(new Set());
  const [showGenerateSection, setShowGenerateSection] = useState(false);
  const [selectedCrewsForGeneration, setSelectedCrewsForGeneration] = useState<any[]>([]);
  const [generating, setGenerating] = useState(false);
  const generateSectionRef = useRef<HTMLDivElement>(null);
  const crewsSectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadCrews();
  }, [user]);

  useEffect(() => {
    // Check for success message from navigation state
    const state = location.state as any;
    if (state?.successMessage) {
      setSuccessMessage(state.successMessage);
      // Clear the navigation state
      navigate(location.pathname, { replace: true });
      // Auto-hide after 3 seconds
      setTimeout(() => setSuccessMessage(null), 3000);
    }
  }, [location.state, navigate, location.pathname]);

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
        const transformedCrews = result.data.map(crew => {
          const getSeatLabel = (idx: number, totalRowers: number, hasCox: boolean) => {
            if (hasCox && idx === 0) return 'Cox';
            const rowerIdx = hasCox ? idx - 1 : idx;
            
            if (totalRowers === 8) {
              const seats = ['Stroke Seat', '7 Seat', '6 Seat', '5 Seat', '4 Seat', '3 Seat', '2 Seat', 'Bow'];
              return seats[rowerIdx];
            } else if (totalRowers === 4) {
              const seats = ['Stroke Seat', '3 Seat', '2 Seat', 'Bow'];
              return seats[rowerIdx];
            } else if (totalRowers === 2) {
              const seats = ['Stroke Seat', 'Bow'];
              return seats[rowerIdx];
            } else if (totalRowers === 1) {
              return 'Single';
            }
            return `${rowerIdx + 1} Seat`;
          };
          
          const totalRowers = crew.boatType.seats;
          const hasCox = boatClassHasCox(crew.boatType.value);
          
          return {
            ...crew,
            boatClub: crew.clubName,
            boatName: crew.name,
            boatClass: crew.boatType.value,
            crewMembers: crew.crewNames.map((name, idx) => ({
              seat: getSeatLabel(idx, totalRowers, hasCox),
              name
            }))
          };
        });
        setSavedCrews(transformedCrews);
      } else if (result.error) {
        setError('Failed to load crews. Please try again.');
        setSavedCrews([]);
      }
    } catch (error) {
      console.error('Error loading crews:', error);
      setError('Failed to load crews. Please try again.');
      setSavedCrews([]);
    } finally {
      setLoading(false);
    }
  };

  const updateRecentCrews = (crewIndex: number) => {
    setRecentCrews(prev => {
      const filtered = prev.filter(idx => idx !== crewIndex);
      return [crewIndex, ...filtered].slice(0, 5);
    });
  };

  const handleDeleteCrew = async (index: number) => {
    const crew = savedCrews[index];
    try {
      await ApiService.deleteCrew(crew.id);
      setSavedCrews(prev => prev.filter((_, idx) => idx !== index));
      
      trackEvent('crew_deleted', {
        crewName: crew.boatName,
        boatClass: crew.boatClass
      });
    } catch (error) {
      console.error('Error deleting crew:', error);
      setError('Failed to delete crew. Please try again.');
    }
  };

  const handleEditCrew = (index: number) => {
    updateRecentCrews(index);
    const crew = savedCrews[index];
    // Navigate to create page with crew data for editing
    navigate('/create', {
      state: {
        editingCrew: {
          id: crew.id,
          boatClass: crew.boatClass,
          clubName: crew.boatClub,
          raceName: crew.raceName,
          boatName: crew.boatName,
          crewNames: crew.crewMembers.filter((member: { seat: string; name: string }) => member.seat !== 'Cox').map((member: { seat: string; name: string }) => member.name),
          coxName: crew.crewMembers.find((member: { seat: string; name: string }) => member.seat === 'Cox')?.name || ''
        }
      }
    });
  };

  const handleGenerateImage = (index: number) => {
    updateRecentCrews(index);
    const crew = savedCrews[index];
    setSelectedCrewsForGeneration([crew]);
    setShowGenerateSection(true);
    // Smooth scroll to generate section
    setTimeout(() => {
      generateSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  const handleGenerateImages = async (
    imageName: string, 
    template: string, 
    colors?: { primary: string; secondary: string }, 
    saveImage?: boolean, 
    clubIcon?: any
  ) => {
    if (selectedCrewsForGeneration.length === 0) return;

    setGenerating(true);
    setError(null);

    try {
      let successCount = 0;
      
      for (let i = 0; i < selectedCrewsForGeneration.length; i++) {
        const crew = selectedCrewsForGeneration[i];
        
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
        if (i < selectedCrewsForGeneration.length - 1) {
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

  // Wrapper function to match SavedCrewsComponent interface
  const handleBulkGenerateImages = (
    crewIds: string[], 
    template: string, 
    colors?: { primary: string; secondary: string }, 
    onProgress?: (current: number, total: number, crewName: string) => void,
    clubIcon?: any
  ) => {
    // This function is not used in the new implementation
    // but kept for compatibility with SavedCrewsComponent interface
    console.log('Bulk generate called with crew IDs:', crewIds);
  };

  const handleBulkModeChange = (isBulkMode: boolean) => {
    setBulkMode(isBulkMode);
    setSelectedCrews(new Set());
  };

  const handleCrewSelection = (crewId: string, checked: boolean) => {
    const newSelected = new Set(selectedCrews);
    if (checked) {
      newSelected.add(crewId);
    } else {
      newSelected.delete(crewId);
    }
    setSelectedCrews(newSelected);
  };

  const handleBulkDelete = () => {
    const indicesToDelete = Array.from(selectedCrews)
      .map(crewId => savedCrews.findIndex(crew => crew.id === crewId))
      .filter(index => index !== -1)
      .sort((a, b) => b - a); // Delete from highest index first
    
    indicesToDelete.forEach(index => handleDeleteCrew(index));
    setSelectedCrews(new Set());
  };

  const handleBulkGenerate = () => {
    const selectedCrewsData = savedCrews.filter(crew => selectedCrews.has(crew.id));
    setSelectedCrewsForGeneration(selectedCrewsData);
    setShowGenerateSection(true);
    // Smooth scroll to generate section
    setTimeout(() => {
      generateSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  const handleRemoveCrewFromGeneration = (crewId: string) => {
    const newCrews = selectedCrewsForGeneration.filter(crew => crew.id !== crewId);
    setSelectedCrewsForGeneration(newCrews);
    
    if (newCrews.length === 0) {
      setShowGenerateSection(false);
      // Scroll back to crews section
      crewsSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const scrollToCrews = () => {
    crewsSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const scrollToGenerate = () => {
    generateSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
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
          My Crews
        </Typography>
        <Typography variant="body1" sx={{ color: theme.palette.text.secondary, mb: 4 }}>
          Sign in to view and manage your saved crew lineups
        </Typography>
        <LoginPrompt 
          message="Sign in to view and manage your saved crews"
          actionText="View My Crews"
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

  if (error) {
    return (
      <Box>
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
        <Box sx={{ textAlign: 'center' }}>
          <Button onClick={loadCrews} variant="contained">
            Retry
          </Button>
        </Box>
      </Box>
    );
  }

  if (savedCrews.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 8 }}>
        <Typography variant="h5" sx={{ color: theme.palette.text.primary, mb: 2 }}>
          No Crews Yet
        </Typography>
        <Typography variant="body1" sx={{ color: theme.palette.text.secondary, mb: 4 }}>
          Create your crew lineup to get started
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
          <Button
            variant="contained"
            startIcon={<MdPersonAdd />}
            onClick={() => navigate('/create')}
          >
            Create Your Crew
          </Button>
        </Box>
      </Box>
    );
  }

  return (
    <Box>
      {/* Success Message */}
      {successMessage && (
        <Alert 
          severity="success" 
          sx={{ mb: 3 }}
          onClose={() => setSuccessMessage(null)}
        >
          {successMessage}
        </Alert>
      )}

      {/* Error Message */}
      {error && (
        <Alert 
          severity="error" 
          sx={{ mb: 3 }}
          onClose={() => setError(null)}
        >
          {error}
        </Alert>
      )}

      {/* Crews Section */}
      <Box ref={crewsSectionRef}>
        {/* Header Actions */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box>
            <Typography variant="h6" sx={{ color: theme.palette.text.secondary }}>
              {savedCrews.length} crew{savedCrews.length !== 1 ? 's' : ''} in your account
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            {bulkMode && selectedCrews.size > 0 && (
              <>
                <Button
                  variant="outlined"
                  color="error"
                  onClick={handleBulkDelete}
                >
                  Delete {selectedCrews.size}
                </Button>
                <Button
                  variant="contained"
                  onClick={handleBulkGenerate}
                >
                  Generate Crews ({selectedCrews.size})
                </Button>
              </>
            )}
            <Button
              variant={bulkMode ? "contained" : "outlined"}
              startIcon={<MdChecklist />}
              onClick={() => handleBulkModeChange(!bulkMode)}
            >
              Select Multiple
            </Button>
            {showGenerateSection && (
              <Button
                variant="outlined"
                startIcon={<MdKeyboardArrowDown />}
                onClick={scrollToGenerate}
                sx={{ color: theme.palette.primary.main }}
              >
                Go to Generate
              </Button>
            )}
          </Box>
        </Box>

        {/* Crews List */}
        <SavedCrewsComponent
          savedCrews={savedCrews}
          recentCrews={recentCrews}
          onDeleteCrew={handleDeleteCrew}
          onEditCrew={handleEditCrew}
          onGenerateImage={handleGenerateImage}
                      onBulkGenerateImages={handleBulkGenerateImages}
          onBulkModeChange={handleBulkModeChange}
          bulkMode={bulkMode}
          selectedCrews={selectedCrews}
          onCrewSelection={handleCrewSelection}
          onBulkDelete={handleBulkDelete}
          onBulkGenerate={handleBulkGenerate}
        />
      </Box>

      {/* Generate Section */}
      {showGenerateSection && (
        <Box ref={generateSectionRef} sx={{ mt: 6 }}>
          <Divider sx={{ mb: 4 }} />
          
          {/* Generate Header */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h5" sx={{ fontWeight: 600 }}>
                  Generate Images
                </Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button
                    variant="outlined"
                    startIcon={<MdKeyboardArrowUp />}
                    onClick={scrollToCrews}
                    size="small"
                  >
                    Back to Crews
                  </Button>
                  <IconButton
                    onClick={() => {
                      setShowGenerateSection(false);
                      setSelectedCrewsForGeneration([]);
                    }}
                    size="small"
                  >
                    <MdClose />
                  </IconButton>
                </Box>
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
                Selected Crews ({selectedCrewsForGeneration.length})
              </Typography>
              
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {selectedCrewsForGeneration.map((crew) => (
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
                    onDelete={() => handleRemoveCrewFromGeneration(crew.id)}
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
                selectedCrew={selectedCrewsForGeneration[0]} // Use first crew for preview
                generating={generating}
                buttonText={
                  selectedCrewsForGeneration.length === 1 
                    ? 'Generate Image' 
                    : `Generate ${selectedCrewsForGeneration.length} Images`
                }
              />
            </CardContent>
          </Card>
        </Box>
      )}
    </Box>
  );
};

export default MyCrewsPage;