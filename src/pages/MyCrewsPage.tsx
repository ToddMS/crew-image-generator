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
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useNavigate, useLocation } from 'react-router-dom';
import { MdPersonAdd, MdClose, MdExpandMore, MdExpandLess, MdSettings } from 'react-icons/md';
import SavedCrewsComponent from '../components/SavedCrewsComponent/SavedCrewComponent';
import LoginPrompt from '../components/Auth/LoginPrompt';
import { useAuth } from '../context/AuthContext';
import { useAnalytics } from '../context/AnalyticsContext';
import { useNotification } from '../context/NotificationContext';
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
  const { showSuccess, showError } = useNotification();

  const [savedCrews, setSavedCrews] = useState<any[]>([]);
  const [recentCrews, setRecentCrews] = useState<number[]>([]);
  const [sortBy, setSortBy] = useState<string>('recent');
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
        
        // Load recently saved crews from localStorage
        const recentlyViewed = localStorage.getItem(`recently_saved_crews_${user.id}`);
        console.log('Loading recent crews for user:', user.id, 'Data:', recentlyViewed);
        if (recentlyViewed) {
          try {
            const recentIds = JSON.parse(recentlyViewed);
            console.log('Parsed recent crew IDs:', recentIds);
            // Ensure all IDs are strings for consistent comparison
            const stringIds = recentIds.map(id => String(id));
            setRecentCrews(stringIds.slice(0, 5)); // Keep only last 5
          } catch (error) {
            console.error('Error parsing recent crews:', error);
          }
        }
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

  const updateRecentCrews = (crewId: string) => {
    if (!user) return;
    
    const stringId = String(crewId);
    setRecentCrews(prev => {
      const stringPrev = prev.map(id => String(id));
      const filtered = stringPrev.filter(id => id !== stringId);
      const newRecent = [stringId, ...filtered].slice(0, 5);
      
      // Save to localStorage
      localStorage.setItem(`recently_saved_crews_${user.id}`, JSON.stringify(newRecent));
      
      return newRecent;
    });
  };

  const getSortedCrews = () => {
    const crewsCopy = [...savedCrews];
    
    switch (sortBy) {
      case 'recent':
        // Default: by creation date (newest first)
        return crewsCopy.sort((a, b) => new Date(b.created_at || b.createdAt || 0).getTime() - new Date(a.created_at || a.createdAt || 0).getTime());
      
      case 'club':
        return crewsCopy.sort((a, b) => a.boatClub.localeCompare(b.boatClub));
      
      case 'race':
        return crewsCopy.sort((a, b) => a.raceName.localeCompare(b.raceName));
      
      case 'boat_class':
        return crewsCopy.sort((a, b) => a.boatClass.localeCompare(b.boatClass));
      
      default:
        return crewsCopy;
    }
  };

  const getRecentlyViewedCrews = () => {
    const recent = recentCrews
      .map(crewId => {
        const stringId = String(crewId);
        const found = savedCrews.find(crew => String(crew.id) === stringId);
        console.log('Looking for crew ID:', stringId, 'Found:', found?.boatName || 'NOT FOUND');
        return found;
      })
      .filter(crew => crew !== undefined)
      .slice(0, 5);
    
    console.log('Recent crews result:', recent.length, recent.map(c => c.boatName));
    return recent;
  };

  const getRemainingCrews = () => {
    const recentIds = new Set(recentCrews.map(id => String(id)));
    return getSortedCrews().filter(crew => !recentIds.has(String(crew.id)));
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
      
      // Show success notification
      showSuccess(`Crew "${crew.boatName}" deleted successfully!`);
    } catch (error) {
      console.error('Error deleting crew:', error);
      showError('Failed to delete crew. Please try again.');
      setError('Failed to delete crew. Please try again.');
    }
  };

  const handleEditCrew = (index: number) => {
    const crew = savedCrews[index];
    updateRecentCrews(crew.id);
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
        
        // Show success notification
        showSuccess(`Successfully generated ${successCount} image${successCount > 1 ? 's' : ''} for your crew${successCount > 1 ? 's' : ''}!`);
        
        // Clear selections and hide panel after successful generation
        setSelectedCrews(new Set());
        setShowGeneratePanel(false);
        
        // Navigate to gallery after successful generation
        navigate('/gallery');
      } else {
        showError('Failed to generate any images. Please try again.');
        setError('Failed to generate any images. Please try again.');
      }
    } catch (error) {
      console.error('Error during bulk generation:', error);
      showError('Failed to generate images. Please try again.');
      setError('Failed to generate images. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  const handleBulkDelete = async () => {
    const crewsToDelete = Array.from(selectedCrews)
      .map(crewId => savedCrews.find(crew => crew.id === crewId))
      .filter(crew => crew !== undefined);
    
    if (crewsToDelete.length === 0) return;
    
    try {
      // Delete all crews
      await Promise.all(crewsToDelete.map(crew => ApiService.deleteCrew(crew.id)));
      
      // Update local state
      setSavedCrews(prev => prev.filter(crew => !selectedCrews.has(crew.id)));
      
      // Show success notification
      showSuccess(`Successfully deleted ${crewsToDelete.length} crew${crewsToDelete.length > 1 ? 's' : ''}!`);
      
      // Clear selection
      setSelectedCrews(new Set());
    } catch (error) {
      console.error('Error in bulk delete:', error);
      showError('Failed to delete some crews. Please try again.');
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
            <Typography variant="body1" sx={{ color: theme.palette.text.secondary }}>
              {selectedCrews.size > 0 
                ? `${selectedCrews.size} of ${savedCrews.length} crews selected`
                : `${savedCrews.length} crew${savedCrews.length !== 1 ? 's' : ''} in your account`
              }
            </Typography>
          </Box>
          
          {/* Sort Dropdown */}
          {savedCrews.length > 0 && (
            <FormControl size="small" sx={{ minWidth: 160 }}>
              <InputLabel>Sort by</InputLabel>
              <Select
                value={sortBy}
                label="Sort by"
                onChange={(e) => setSortBy(e.target.value)}
              >
                <MenuItem value="recent">Recently Created</MenuItem>
                <MenuItem value="club">Club Name</MenuItem>
                <MenuItem value="race">Race Name</MenuItem>
                <MenuItem value="boat_class">Boat Class</MenuItem>
              </Select>
            </FormControl>
          )}
        </Box>

        {/* Recently Saved Crews */}
        {getRecentlyViewedCrews().length > 0 && (
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              Recently Saved
            </Typography>
            <SavedCrewsComponent
              savedCrews={getRecentlyViewedCrews()}
              recentCrews={[]}
              onDeleteCrew={(index) => {
                const recentCrews = getRecentlyViewedCrews();
                const crew = recentCrews[index];
                const originalIndex = savedCrews.findIndex(c => c.id === crew.id);
                handleDeleteCrew(originalIndex);
              }}
              onEditCrew={(index) => {
                const recentCrews = getRecentlyViewedCrews();
                const crew = recentCrews[index];
                const originalIndex = savedCrews.findIndex(c => c.id === crew.id);
                handleEditCrew(originalIndex);
              }}
              bulkMode={true}
              selectedCrews={selectedCrews}
              onCrewSelection={handleCrewSelection}
              onBulkDelete={handleBulkDelete}
            />
          </Box>
        )}

        {/* All Other Crews */}
        <Box>
          {getRecentlyViewedCrews().length > 0 && (
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              All Crews
            </Typography>
          )}
          <SavedCrewsComponent
            savedCrews={getRemainingCrews()}
            recentCrews={[]}
            onDeleteCrew={(index) => {
              const remainingCrews = getRemainingCrews();
              const crew = remainingCrews[index];
              const originalIndex = savedCrews.findIndex(c => c.id === crew.id);
              handleDeleteCrew(originalIndex);
            }}
            onEditCrew={(index) => {
              const remainingCrews = getRemainingCrews();
              const crew = remainingCrews[index];
              const originalIndex = savedCrews.findIndex(c => c.id === crew.id);
              handleEditCrew(originalIndex);
            }}
            bulkMode={true}
            selectedCrews={selectedCrews}
            onCrewSelection={handleCrewSelection}
            onBulkDelete={handleBulkDelete}
          />
        </Box>
      </Box>


      {/* Bottom Sticky Bar for Selection Actions */}
      <Box
        sx={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 1300,
          transform: selectedCrews.size > 0 ? 'translateY(0)' : 'translateY(100%)',
          transition: 'transform 0.3s ease-in-out',
          backgroundColor: theme.palette.background.paper,
          borderTop: `1px solid ${theme.palette.divider}`,
          boxShadow: theme.shadows[8],
          p: 2
        }}
      >
        <Box sx={{ 
          maxWidth: 1200, 
          mx: 'auto', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          gap: 2
        }}>
          {/* Selection Info */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box sx={{ 
              backgroundColor: theme.palette.primary.main, 
              color: 'white', 
              px: 2, 
              py: 0.5, 
              borderRadius: 3,
              fontWeight: 600,
              fontSize: '0.9rem'
            }}>
              {selectedCrews.size}
            </Box>
            <Typography variant="body1" sx={{ fontWeight: 500 }}>
              {selectedCrews.size === 1 ? 'crew selected' : 'crews selected'}
            </Typography>
            
            {/* Quick Preview of Selected Crews */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, ml: 2 }}>
              {Array.from(selectedCrews).slice(0, 3).map(crewId => {
                const crew = savedCrews.find(c => c.id === crewId);
                return crew ? (
                  <Chip
                    key={crewId}
                    label={crew.boatClub}
                    size="small"
                    sx={{ 
                      backgroundColor: theme.palette.action.selected,
                      fontSize: '0.75rem',
                      maxWidth: 120
                    }}
                  />
                ) : null;
              })}
              {selectedCrews.size > 3 && (
                <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                  +{selectedCrews.size - 3} more
                </Typography>
              )}
            </Box>
          </Box>

          {/* Action Buttons */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Button
              variant="text"
              onClick={() => setSelectedCrews(new Set())}
              sx={{ color: theme.palette.text.secondary }}
            >
              Clear Selection
            </Button>
            
            <Button
              variant="outlined"
              color="error"
              onClick={handleBulkDelete}
              sx={{ 
                minWidth: 120,
                borderColor: theme.palette.error.main,
                color: theme.palette.error.main,
                '&:hover': {
                  borderColor: theme.palette.error.dark,
                  color: theme.palette.error.dark,
                  backgroundColor: theme.palette.error.main + '08'
                }
              }}
            >
              Delete {selectedCrews.size}
            </Button>
            
            <Button
              variant="contained"
              onClick={() => {
                // Navigate to generate page with selected crew IDs
                navigate('/generate', {
                  state: {
                    selectedCrewIds: Array.from(selectedCrews)
                  }
                });
              }}
              sx={{ 
                minWidth: 160,
                bgcolor: theme.palette.primary.main,
                '&:hover': {
                  bgcolor: theme.palette.primary.dark
                }
              }}
            >
              Generate Images
            </Button>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default MyCrewsPage;