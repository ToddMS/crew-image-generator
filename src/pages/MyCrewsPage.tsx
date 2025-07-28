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
import { MdPersonAdd, MdClose, MdExpandMore, MdExpandLess, MdSettings } from 'react-icons/md';
import SavedCrewsComponent from '../components/SavedCrewsComponent/SavedCrewComponent';
import LoginPrompt from '../components/Auth/LoginPrompt';
import TemplateSelector from '../components/ImageGenerator/TemplateSelector';
import ColorSchemeSelector from '../components/ImageGenerator/ColorSchemeSelector';
import ClubIconSelector from '../components/ImageGenerator/ClubIconSelector';
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
  const [selectedCrews, setSelectedCrews] = useState<Set<string>>(new Set());
  const [selectedTemplate, setSelectedTemplate] = useState<string>('1');
  const [primaryColor, setPrimaryColor] = useState<string>('#5E98C2');
  const [secondaryColor, setSecondaryColor] = useState<string>('#ffffff');
  const [usePresetColors, setUsePresetColors] = useState<boolean>(false);
  const [selectedPresetId, setSelectedPresetId] = useState<number | null>(null);
  const [clubIcon, setClubIcon] = useState<any>(null);
  const [presets, setPresets] = useState<any[]>([]);
  const [showGeneratePanel, setShowGeneratePanel] = useState<boolean>(false);
  const [generating, setGenerating] = useState(false);
  const generateSectionRef = useRef<HTMLDivElement>(null);
  const crewsSectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadCrews();
    loadPresets();
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

  const loadPresets = async () => {
    if (!user) {
      setPresets([]);
      return;
    }

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/club-presets`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('sessionId')}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setPresets(data);
      }
    } catch (error) {
      console.error('Error loading presets:', error);
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

  const handleCrewSelection = (crewId: string, checked: boolean) => {
    const newSelected = new Set(selectedCrews);
    if (checked) {
      newSelected.add(crewId);
    } else {
      newSelected.delete(crewId);
    }
    setSelectedCrews(newSelected);
    
    // Auto-show generate panel when crews are selected
    if (newSelected.size > 0 && !showGeneratePanel) {
      setShowGeneratePanel(true);
    }
  };

  const handleGenerateImages = async () => {
    if (selectedCrews.size === 0) {
      setError('Please select at least one crew to generate images.');
      return;
    }

    setGenerating(true);
    setError(null);

    try {
      let successCount = 0;
      const selectedCrewsArray = savedCrews.filter(crew => selectedCrews.has(crew.id));
      
      // Prepare colors based on preset selection
      const colors = usePresetColors && selectedPresetId 
        ? (() => {
            const preset = presets.find(p => p.id === selectedPresetId);
            return preset ? { primary: preset.primary_color, secondary: preset.secondary_color } : { primary: primaryColor, secondary: secondaryColor };
          })()
        : { primary: primaryColor, secondary: secondaryColor };
      
      for (let i = 0; i < selectedCrewsArray.length; i++) {
        const crew = selectedCrewsArray[i];
        
        try {
          const imageBlob = await ApiService.generateImage(
            crew.id, 
            `${crew.boatName}_${crew.raceName}`, 
            selectedTemplate, 
            colors, 
            clubIcon
          );
          
          if (imageBlob) {
            await ApiService.saveImage(crew.id, `${crew.boatName}_${crew.raceName}`, selectedTemplate, colors, imageBlob);
            successCount++;
            
            trackEvent('image_generated', {
              template: selectedTemplate,
              primaryColor: colors.primary,
              secondaryColor: colors.secondary,
              crewName: crew.boatName,
              raceName: crew.raceName,
              boatClass: crew.boatClass
            });
          }
        } catch (error) {
          console.error(`Error generating image for crew ${crew.boatName}:`, error);
        }
        
        // Small delay between generations
        if (i < selectedCrewsArray.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }
      
      if (successCount > 0) {
        trackEvent('bulk_generation', {
          template: selectedTemplate,
          crewCount: successCount,
          primaryColor: colors.primary,
          secondaryColor: colors.secondary
        });
        
        // Clear selections and hide panel after successful generation
        setSelectedCrews(new Set());
        setShowGeneratePanel(false);
        
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

  const handleBulkDelete = () => {
    const indicesToDelete = Array.from(selectedCrews)
      .map(crewId => savedCrews.findIndex(crew => crew.id === crewId))
      .filter(index => index !== -1)
      .sort((a, b) => b - a); // Delete from highest index first
    
    indicesToDelete.forEach(index => handleDeleteCrew(index));
    setSelectedCrews(new Set());
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

      {/* My Crews Section - Primary Focus */}
      <Box sx={{ mb: 4 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 600, mb: 1 }}>
              My Crews
            </Typography>
            <Typography variant="body1" sx={{ color: theme.palette.text.secondary }}>
              {selectedCrews.size > 0 
                ? `${selectedCrews.size} of ${savedCrews.length} crews selected`
                : `${savedCrews.length} crew${savedCrews.length !== 1 ? 's' : ''} in your account`
              }
            </Typography>
          </Box>
          {selectedCrews.size > 0 && (
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              <Button
                variant="outlined"
                color="error"
                onClick={handleBulkDelete}
                size="small"
              >
                Delete {selectedCrews.size}
              </Button>
              <Button
                variant="outlined"
                onClick={() => {
                  setSelectedCrews(new Set());
                  setShowGeneratePanel(false);
                }}
                size="small"
              >
                Clear Selection
              </Button>
            </Box>
          )}
        </Box>

        {/* Crews List */}
        <SavedCrewsComponent
          savedCrews={savedCrews}
          recentCrews={recentCrews}
          onDeleteCrew={handleDeleteCrew}
          onEditCrew={handleEditCrew}
          bulkMode={true} // Always in selection mode now
          selectedCrews={selectedCrews}
          onCrewSelection={handleCrewSelection}
          onBulkDelete={handleBulkDelete}
        />
      </Box>

      {/* Collapsible Generate Images Panel */}
      <Card 
        sx={{ 
          mb: 4,
          border: selectedCrews.size > 0 ? `2px solid ${theme.palette.primary.main}` : `1px solid ${theme.palette.divider}`,
          backgroundColor: selectedCrews.size > 0 ? `${theme.palette.primary.main}08` : theme.palette.background.paper
        }}
      >
        <CardContent 
          onClick={() => setShowGeneratePanel(!showGeneratePanel)}
          sx={{ 
            cursor: 'pointer',
            '&:hover': {
              backgroundColor: theme.palette.action.hover
            }
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <MdSettings size={24} color={theme.palette.primary.main} />
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  ⚡ Generate Images
                  {selectedCrews.size > 0 && (
                    <Chip 
                      label={`${selectedCrews.size} selected`} 
                      size="small" 
                      color="primary" 
                      sx={{ ml: 2 }}
                    />
                  )}
                </Typography>
                <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                  {selectedCrews.size > 0 
                    ? 'Configure template and settings for your selected crews'
                    : 'Select crews above to configure image generation settings'
                  }
                </Typography>
              </Box>
            </Box>
            {showGeneratePanel ? <MdExpandLess size={24} /> : <MdExpandMore size={24} />}
          </Box>
        </CardContent>

        {/* Collapsible Content */}
        {showGeneratePanel && (
          <Box sx={{ px: 3, pb: 3 }}>
            <Divider sx={{ mb: 3 }} />
            
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 4, mb: 3 }}>
              {/* Template Selector */}
              <Box>
                <TemplateSelector
                  selectedTemplate={selectedTemplate}
                  onTemplateChange={setSelectedTemplate}
                />
              </Box>
              
              {/* Color Scheme and Club Icon */}
              <Box>
                <ColorSchemeSelector
                  primaryColor={primaryColor}
                  secondaryColor={secondaryColor}
                  usePresetColors={usePresetColors}
                  selectedPresetId={selectedPresetId}
                  onPrimaryColorChange={setPrimaryColor}
                  onSecondaryColorChange={setSecondaryColor}
                  onPresetModeChange={setUsePresetColors}
                  onPresetSelection={setSelectedPresetId}
                  presets={presets}
                  clubIconSelector={
                    <ClubIconSelector
                      selectedIcon={clubIcon}
                      onIconChange={setClubIcon}
                    />
                  }
                />
              </Box>
            </Box>

            {/* Generate Button */}
            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
              <Button
                variant="contained"
                size="large"
                onClick={handleGenerateImages}
                disabled={generating || selectedCrews.size === 0}
                sx={{ minWidth: 250, py: 1.5 }}
              >
                {generating 
                  ? 'Generating...' 
                  : selectedCrews.size === 0
                    ? 'Select crews to generate'
                    : `Generate ${selectedCrews.size} Image${selectedCrews.size !== 1 ? 's' : ''}`
                }
              </Button>
            </Box>
          </Box>
        )}
      </Card>
    </Box>
  );
};

export default MyCrewsPage;