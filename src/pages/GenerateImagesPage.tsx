import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  Alert,
  Button,
  Card,
  CardContent,
  Chip,
  IconButton,
  Tooltip
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useLocation, useNavigate } from 'react-router-dom';
import { MdClose, MdImage, MdChevronLeft, MdChevronRight } from 'react-icons/md';
import LoginPrompt from '../components/Auth/LoginPrompt';
import { useAuth } from '../context/AuthContext';
import { useAnalytics } from '../context/AnalyticsContext';
import { useNotification } from '../context/NotificationContext';
import { ApiService } from '../services/api.service';
import TemplatePreview from '../components/TemplatePreview/TemplatePreview';

interface SavedTemplate {
  id: string;
  name: string;
  config: {
    background: string;
    nameDisplay: string;
    boatStyle: string;
    textLayout: string;
    logo: string;
    dimensions: { width: number; height: number };
    colors: { primary: string; secondary: string };
  };
  previewUrl?: string;
  createdAt: string;
}

const GenerateImagesPageSimplified: React.FC = () => {
  const theme = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { trackEvent } = useAnalytics();
  const { showSuccess, showError } = useNotification();

  const [selectedCrewIds, setSelectedCrewIds] = useState<string[]>([]);
  const [selectedCrews, setSelectedCrews] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<SavedTemplate | null>(null);
  const [savedTemplates, setSavedTemplates] = useState<SavedTemplate[]>([]);
  const [lastSelectedCrewIndex, setLastSelectedCrewIndex] = useState(0);
  const [previewCrewIndex, setPreviewCrewIndex] = useState(0);
  const hasAutoSelectedRef = useRef(false);

  // Check if we came from crews page with selected crews
  useEffect(() => {
    const state = location.state as any;
    console.log('Navigation state received:', state);
    if (state?.selectedCrewIds) {
      console.log('Setting selected crew IDs from navigation:', state.selectedCrewIds);
      setSelectedCrewIds(state.selectedCrewIds);
    } else if (state?.selectedCrewIndex !== undefined) {
      console.log('Using selected crew index:', state.selectedCrewIndex);
      loadCrews().then(crews => {
        const crewsData = crews?.data || crews;
        if (crewsData && crewsData[state.selectedCrewIndex]) {
          setSelectedCrewIds([crewsData[state.selectedCrewIndex].id]);
        }
      });
    } else {
      console.log('No navigation state with crew selection found');
    }
  }, [location.state]);

  // Load crew details when we have selected IDs
  useEffect(() => {
    if (selectedCrewIds.length > 0) {
      loadSelectedCrews();
    }
  }, [selectedCrewIds]);

  // Reset preview index when crews change
  useEffect(() => {
    if (selectedCrews.length > 0) {
      setPreviewCrewIndex(Math.min(previewCrewIndex, selectedCrews.length - 1));
    }
  }, [selectedCrews]);

  // Load saved templates
  useEffect(() => {
    loadSavedTemplates();
    
    // Listen for localStorage changes (when templates are saved from Template Builder)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'savedTemplates') {
        loadSavedTemplates();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    // Also check periodically for changes (in case both pages are open in same browser)
    const interval = setInterval(loadSavedTemplates, 2000);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  const loadSavedTemplates = () => {
    try {
      // Load templates from localStorage where Template Builder saves them
      const savedTemplatesData = localStorage.getItem('savedTemplates');
      if (savedTemplatesData) {
        const templates = JSON.parse(savedTemplatesData) as SavedTemplate[];
        setSavedTemplates(templates);
        // Only auto-select first template on initial load
        if (templates.length > 0 && !hasAutoSelectedRef.current) {
          setSelectedTemplate(templates[0]);
          hasAutoSelectedRef.current = true;
        }
        // If the currently selected template no longer exists, clear selection
        if (selectedTemplate && !templates.find(t => t.id === selectedTemplate.id)) {
          setSelectedTemplate(templates.length > 0 ? templates[0] : null);
        }
      } else {
        // No saved templates from Template Builder
        setSavedTemplates([]);
        setSelectedTemplate(null);
      }
    } catch (error) {
      console.error('Error loading saved templates from localStorage:', error);
      setSavedTemplates([]);
      setSelectedTemplate(null);
    }
  };

  const loadCrews = async () => {
    if (!user) return null;
    try {
      const crews = await ApiService.getCrews();
      return crews;
    } catch (error) {
      console.error('Error loading crews:', error);
      return null;
    }
  };

  const loadSelectedCrews = async () => {
    setLoading(true);
    try {
      const result = await ApiService.getCrews();
      const crews = result.data || result; // Handle both direct array and {data: array} responses
      console.log('All crews loaded:', crews?.length);
      console.log('Selected crew IDs to find:', selectedCrewIds);
      
      if (crews && Array.isArray(crews)) {
        const selected = crews.filter(crew => {
          const crewIdStr = crew.id?.toString();
          const isSelected = selectedCrewIds.includes(crewIdStr) || selectedCrewIds.includes(crew.id);
          console.log(`Crew ${crew.name} (ID: ${crew.id}/${crewIdStr}) - Selected: ${isSelected}`);
          return isSelected;
        });
        console.log('Selected crews found:', selected.length);
        setSelectedCrews(selected);
      } else {
        console.error('No crews data received or not an array:', crews);
        setSelectedCrews([]);
      }
    } catch (error) {
      console.error('Error loading crews:', error);
      setError('Failed to load crew details');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateImages = async () => {
    if (!selectedTemplate || selectedCrews.length === 0) return;

    setGenerating(true);
    let successCount = 0;

    try {
      for (const crew of selectedCrews) {
        try {
          const response = await fetch(`${import.meta.env.VITE_API_URL}/api/crews/generate-custom-image`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              crewId: crew.id,
              templateConfig: selectedTemplate.config,
              imageName: `${crew.name}_${crew.boatType.value}_${Date.now()}.png`
            }),
          });

          if (response.ok) {
            successCount++;
            // Track successful generation
            trackEvent('image_generated', {
              template: selectedTemplate.id,
              crewName: crew.boatName,
              raceName: crew.raceName,
              boatClass: crew.boatClass
            });
          }
        } catch (error) {
          console.error(`Failed to generate image for crew ${crew.id}:`, error);
        }
      }

      if (successCount > 0) {
        showSuccess(`Successfully generated ${successCount} image${successCount > 1 ? 's' : ''} for your crew${successCount > 1 ? 's' : ''}!`);
        
        // Navigate to gallery
        setTimeout(() => {
          navigate('/gallery');
        }, 1500);
      } else {
        showError('Failed to generate any images. Please try again.');
      }
    } catch (error) {
      showError('Failed to generate images');
    } finally {
      setGenerating(false);
    }
  };

  const removeSelectedCrew = (crewId: string) => {
    const newSelectedIds = selectedCrewIds.filter(id => id !== crewId);
    const newSelectedCrews = selectedCrews.filter(crew => crew.id.toString() !== crewId);
    setSelectedCrewIds(newSelectedIds);
    setSelectedCrews(newSelectedCrews);
  };

  if (!user) {
    return (
      <Box sx={{ textAlign: 'center', py: 8 }}>
        <Typography variant="h5" sx={{ color: theme.palette.text.primary, mb: 2 }}>
          Generate Images
        </Typography>
        <Typography variant="body1" sx={{ color: theme.palette.text.secondary, mb: 4 }}>
          Sign in to generate crew images with custom templates
        </Typography>
        <LoginPrompt 
          message="Sign in to generate crew images"
          actionText="Generate Images"
        />
      </Box>
    );
  }

  if (selectedCrews.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 8 }}>
        <Typography variant="h5" sx={{ color: theme.palette.text.primary, mb: 2 }}>
          No crews selected
        </Typography>
        <Typography variant="body1" sx={{ color: theme.palette.text.secondary, mb: 4 }}>
          Please select crews from the My Crews page to generate images
        </Typography>
        <Button 
          variant="contained" 
          onClick={() => navigate('/crews')}
          sx={{ px: 4, py: 1.5 }}
        >
          Go to My Crews
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 1400, mx: 'auto', p: 3 }}>
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Selected Crews */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
            Selected Crews ({selectedCrews.length})
          </Typography>
          
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {selectedCrews.map((crew) => (
              <Box
                key={crew.id}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  p: 1,
                  border: 1,
                  borderColor: theme.palette.divider,
                  borderRadius: 1,
                  backgroundColor: theme.palette.background.paper,
                  '&:hover': {
                    backgroundColor: theme.palette.action.hover
                  }
                }}
              >
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.25 }}>
                    {crew.name}
                  </Typography>
                  <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                    {crew.raceName} • {crew.boatType.value}
                  </Typography>
                </Box>
                
                <Chip
                  label={crew.boatType.value}
                  size="small"
                  sx={{
                    height: 20,
                    fontSize: '0.65rem',
                    backgroundColor: theme.palette.primary.main,
                    color: 'white',
                    '& .MuiChip-label': {
                      px: 1
                    }
                  }}
                />
                
                <IconButton
                  size="small"
                  onClick={() => removeSelectedCrew(crew.id.toString())}
                  sx={{
                    ml: 1,
                    color: theme.palette.text.secondary,
                    '&:hover': {
                      backgroundColor: theme.palette.error.light + '20',
                      color: theme.palette.error.main
                    }
                  }}
                >
                  <MdClose size={16} />
                </IconButton>
              </Box>
            ))}
          </Box>
        </CardContent>
      </Card>

      {/* Main Generation Interface */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '2fr 1fr' }, gap: 3 }}>
        {/* Left Column - Template Selection */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          
          {/* Template Selection */}
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                Choose Template ({savedTemplates.length})
              </Typography>
              
              {savedTemplates.length > 0 ? (
                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 1.5 }}>
                  {savedTemplates.map((template) => (
                    <Card
                      key={template.id}
                      variant="outlined"
                      sx={{
                        cursor: 'pointer',
                        border: selectedTemplate?.id === template.id 
                          ? `2px solid ${theme.palette.primary.main}` 
                          : `1px solid ${theme.palette.divider}`,
                        transition: 'all 0.2s ease',
                        '&:hover': {
                          transform: 'translateY(-1px)',
                          boxShadow: theme.shadows[2]
                        }
                      }}
                      onClick={() => setSelectedTemplate(template)}
                    >
                      <CardContent sx={{ p: 1.5, textAlign: 'center' }}>
                        {/* Always show color gradient preview (blob URLs don't persist) */}
                        <Box
                          sx={{
                            width: '100%',
                            height: 80,
                            backgroundColor: template.config.colors.primary,
                            borderRadius: 1,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            mb: 1.5,
                            backgroundImage: `linear-gradient(135deg, ${template.config.colors.primary} 0%, ${template.config.colors.secondary} 100%)`,
                            border: `1px solid ${theme.palette.divider}`,
                            position: 'relative'
                          }}
                        >
                          <MdImage size={24} color="white" style={{ opacity: 0.8 }} />
                        </Box>
                        
                        <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5, fontSize: '0.8rem' }}>
                          {template.name}
                        </Typography>
                        <Typography variant="caption" sx={{ color: theme.palette.text.secondary, fontSize: '0.7rem' }}>
                          Created {new Date(template.createdAt).toLocaleDateString()}
                        </Typography>
                      </CardContent>
                    </Card>
                  ))}
                </Box>
              ) : (
                <Box sx={{ p: 4, textAlign: 'center', backgroundColor: theme.palette.action.hover, borderRadius: 2 }}>
                  <MdImage size={48} color={theme.palette.text.secondary} style={{ marginBottom: 16 }} />
                  <Typography variant="h6" sx={{ mb: 2, color: theme.palette.text.primary }}>
                    No Templates Found
                  </Typography>
                  <Typography variant="body2" sx={{ color: theme.palette.text.secondary, mb: 3 }}>
                    Create your first custom template in the Template Builder to get started!
                  </Typography>
                  <Button
                    variant="contained"
                    onClick={() => navigate('/template-builder')}
                    sx={{ px: 3, py: 1 }}
                  >
                    Create Template
                  </Button>
                </Box>
              )}
              
            </CardContent>
          </Card>
        </Box>

        {/* Right Column - Preview */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          
          {/* Live Preview */}
          <Card sx={{ position: 'sticky', top: 20 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Preview
                </Typography>
                {selectedCrews.length > 1 && (
                  <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                    {previewCrewIndex + 1} of {selectedCrews.length}
                  </Typography>
                )}
              </Box>
              
              {selectedTemplate && selectedCrews.length > 0 ? (
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <TemplatePreview
                    templateConfig={selectedTemplate.config}
                    crewData={{
                      name: selectedCrews[previewCrewIndex].name,
                      clubName: selectedCrews[previewCrewIndex].clubName || selectedCrews[previewCrewIndex].boatClub,
                      raceName: selectedCrews[previewCrewIndex].raceName,
                      boatType: selectedCrews[previewCrewIndex].boatType,
                      crewNames: selectedCrews[previewCrewIndex].crewNames || selectedCrews[previewCrewIndex].crewMembers?.map((member: any) => member.name) || [],
                      coachName: selectedCrews[previewCrewIndex].coachName
                    }}
                    width={350}
                    height={438}
                    debounceMs={300}
                  />
                  
                  {/* Cycling Controls - only show if multiple crews */}
                  {selectedCrews.length > 1 && (
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mt: 2, gap: 2 }}>
                      <IconButton
                        size="small"
                        onClick={() => setPreviewCrewIndex((prev) => (prev - 1 + selectedCrews.length) % selectedCrews.length)}
                        sx={{ color: theme.palette.primary.main }}
                      >
                        <MdChevronLeft size={20} />
                      </IconButton>
                      
                      {/* Dots indicator */}
                      <Box sx={{ display: 'flex', gap: 0.5 }}>
                        {selectedCrews.map((_, index) => (
                          <Box
                            key={index}
                            onClick={() => setPreviewCrewIndex(index)}
                            sx={{
                              width: 8,
                              height: 8,
                              borderRadius: '50%',
                              backgroundColor: index === previewCrewIndex 
                                ? theme.palette.primary.main 
                                : theme.palette.divider,
                              cursor: 'pointer',
                              transition: 'background-color 0.2s ease',
                              '&:hover': {
                                backgroundColor: theme.palette.primary.light
                              }
                            }}
                          />
                        ))}
                      </Box>
                      
                      <IconButton
                        size="small"
                        onClick={() => setPreviewCrewIndex((prev) => (prev + 1) % selectedCrews.length)}
                        sx={{ color: theme.palette.primary.main }}
                      >
                        <MdChevronRight size={20} />
                      </IconButton>
                    </Box>
                  )}
                </Box>
              ) : (
                <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                  <Box
                    sx={{
                      width: 350,
                      height: 438,
                      backgroundColor: theme.palette.grey[100],
                      borderRadius: 2,
                      border: `2px solid ${theme.palette.divider}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Typography variant="body2" sx={{ color: theme.palette.text.secondary, textAlign: 'center' }}>
                      {!selectedTemplate ? 'Select a template to see preview' : 'No crew selected'}
                    </Typography>
                  </Box>
                </Box>
              )}
            </CardContent>
          </Card>
        </Box>
      </Box>

      {/* Floating Generate Button */}
      {savedTemplates.length > 0 && (
        <Tooltip 
          title={selectedCrews.length === 0 ? "Please select at least one crew" : ""}
          arrow
        >
          <span>
            <Button
              variant="contained"
              size="large"
              onClick={handleGenerateImages}
              disabled={generating || selectedCrews.length === 0 || !selectedTemplate}
              sx={{
                position: 'fixed',
                bottom: 24,
                right: 24,
                zIndex: 1000,
                py: 1.5,
                px: 3,
                fontSize: '0.875rem',
                fontWeight: 600,
                minWidth: 160,
                boxShadow: theme.shadows[8],
                '&:hover': {
                  boxShadow: theme.shadows[12],
                  transform: 'translateY(-2px)',
                },
                transition: 'all 0.2s ease'
              }}
            >
              {generating 
                ? 'Generating...' 
                : selectedCrews.length > 0 
                  ? `Generate ${selectedCrews.length} Image${selectedCrews.length !== 1 ? 's' : ''}`
                  : 'Generate Images'
              }
            </Button>
          </span>
        </Tooltip>
      )}

    </Box>
  );
};

export default GenerateImagesPageSimplified;