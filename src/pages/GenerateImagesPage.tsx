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
  Tooltip,
  CircularProgress
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

const GenerateImagesPage: React.FC = () => {
  const theme = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { trackEvent } = useAnalytics();
  const { showSuccess, showError } = useNotification();

  const [selectedCrewIds, setSelectedCrewIds] = useState<string[]>([]);
  const [selectedCrews, setSelectedCrews] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<SavedTemplate | null>(null);
  const [savedTemplates, setSavedTemplates] = useState<SavedTemplate[]>([]);
  const [previewCrewIndex, setPreviewCrewIndex] = useState(0);
  const [allCrews, setAllCrews] = useState<any[]>([]);
  const [crewsLoading, setCrewsLoading] = useState(false);
  const [selectedCrewIdsSet, setSelectedCrewIdsSet] = useState<Set<string>>(new Set());
  const hasAutoSelectedRef = useRef(false);

  useEffect(() => {
    const state = location.state as any;
    if (state?.selectedCrewIds) {
      setSelectedCrewIds(state.selectedCrewIds);
    } else if (state?.selectedCrewIndex !== undefined) {
      loadCrews().then(crews => {
        const crewsData = crews?.data || crews;
        if (crewsData && Array.isArray(crewsData) && state.selectedCrewIndex < crewsData.length) {
          setSelectedCrewIds([crewsData[state.selectedCrewIndex].id]);
        }
      });
    }
  }, [location.state]);

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

  // Load all crews for selection when no crews are selected
  useEffect(() => {
    if (selectedCrews.length === 0) {
      loadAllCrews();
    }
  }, [selectedCrews.length]);

  const loadAllCrews = async () => {
    setCrewsLoading(true);
    try {
      const result = await ApiService.getCrews();
      const crews = result.data || result;
      if (crews && Array.isArray(crews)) {
        setAllCrews(crews);
      }
    } catch (error) {
      console.error('Error loading all crews:', error);
    } finally {
      setCrewsLoading(false);
    }
  };

  const handleCrewSelection = (crew: any) => {
    const crewIdStr = crew.id.toString();
    const newSelectedSet = new Set(selectedCrewIdsSet);
    
    if (newSelectedSet.has(crewIdStr)) {
      // Deselect crew
      newSelectedSet.delete(crewIdStr);
    } else {
      // Select crew
      newSelectedSet.add(crewIdStr);
    }
    
    setSelectedCrewIdsSet(newSelectedSet);
    const newSelectedIds = Array.from(newSelectedSet);
    setSelectedCrewIds(newSelectedIds);
    
    // If we just selected a crew (not deselected), update preview to show the newly selected crew
    if (!selectedCrewIdsSet.has(crewIdStr) && newSelectedSet.has(crewIdStr)) {
      // Find the index of the newly selected crew in the current selected crews
      const currentSelectedCrews = allCrews.filter(c => newSelectedIds.includes(c.id.toString()));
      const newCrewIndex = currentSelectedCrews.findIndex(c => c.id.toString() === crewIdStr);
      if (newCrewIndex !== -1) {
        setPreviewCrewIndex(newCrewIndex);
      }
    }
  };

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
        // Always auto-select first template when templates load (if none selected)
        if (templates.length > 0 && !selectedTemplate) {
          setSelectedTemplate(templates[0]);
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
    try {
      const result = await ApiService.getCrews();
      const crews = result.data || result; // Handle both direct array and {data: array} responses
      
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
    const newSelectedSet = new Set(selectedCrewIdsSet);
    newSelectedSet.delete(crewId);
    setSelectedCrewIdsSet(newSelectedSet);
    setSelectedCrewIds(Array.from(newSelectedSet));
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


  return (
    <Box sx={{ maxWidth: 1400, mx: 'auto', p: 3 }}>
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}


      {/* Main Generation Interface */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '2fr 1fr' }, gap: 3 }}>
        {/* Left Column - Template Selection */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          
          {/* Crew Selection */}
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                Select Crews
              </Typography>
              
              {crewsLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                  <CircularProgress />
                </Box>
              ) : allCrews.length > 0 ? (
                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: 1, maxHeight: 300, overflowY: 'auto' }}>
                  {allCrews.map((crew) => {
                    const isSelected = selectedCrewIdsSet.has(crew.id.toString());
                    return (
                      <Box
                        key={crew.id}
                        sx={{
                          cursor: 'pointer',
                          border: isSelected 
                            ? `2px solid ${theme.palette.primary.main}` 
                            : `1px solid ${theme.palette.divider}`,
                          backgroundColor: isSelected 
                            ? theme.palette.primary.light + '15' 
                            : theme.palette.background.paper,
                          borderRadius: 1,
                          p: 1,
                          aspectRatio: '1',
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'center',
                          alignItems: 'center',
                          textAlign: 'center',
                          transition: 'all 0.2s ease',
                          position: 'relative',
                          '&:hover': {
                            transform: 'translateY(-1px)',
                            boxShadow: theme.shadows[2],
                            borderColor: theme.palette.primary.light
                          }
                        }}
                        onClick={() => handleCrewSelection(crew)}
                      >
                        <Typography variant="caption" sx={{ 
                          fontWeight: 600, 
                          mb: 0.5, 
                          fontSize: '0.7rem',
                          lineHeight: 1.1,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical'
                        }}>
                          {crew.name}
                        </Typography>
                        <Typography variant="caption" sx={{ 
                          color: theme.palette.text.secondary, 
                          fontSize: '0.65rem',
                          mb: 0.5,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          width: '100%'
                        }}>
                          {crew.raceName}
                        </Typography>
                        <Typography variant="caption" sx={{ 
                          color: theme.palette.text.secondary, 
                          fontSize: '0.65rem',
                          mb: 0.5,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          width: '100%'
                        }}>
                          {crew.clubName || crew.boatClub}
                        </Typography>
                        <Chip
                          label={crew.boatType.value}
                          size="small"
                          sx={{
                            height: 16,
                            fontSize: '0.6rem',
                            backgroundColor: isSelected ? theme.palette.primary.main : theme.palette.grey[800],
                            color: 'white',
                            border: 'none',
                            '& .MuiChip-label': {
                              px: 0.5
                            }
                          }}
                        />
                        {isSelected && (
                          <Box
                            sx={{
                              position: 'absolute',
                              top: 4,
                              right: 4,
                              width: 12,
                              height: 12,
                              borderRadius: '50%',
                              backgroundColor: theme.palette.primary.main,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}
                          >
                            <Typography sx={{ color: 'white', fontSize: '0.6rem', fontWeight: 'bold' }}>✓</Typography>
                          </Box>
                        )}
                      </Box>
                    );
                  })}
                </Box>
              ) : (
                <Box sx={{ p: 4, textAlign: 'center', backgroundColor: theme.palette.action.hover, borderRadius: 2 }}>
                  <Typography variant="h6" sx={{ mb: 2, color: theme.palette.text.primary }}>
                    No Crews Found
                  </Typography>
                  <Typography variant="body2" sx={{ color: theme.palette.text.secondary, mb: 3 }}>
                    Create your first crew to get started with image generation.
                  </Typography>
                  <Button
                    variant="contained"
                    onClick={() => navigate('/create')}
                    sx={{ px: 3, py: 1 }}
                  >
                    Create Crew
                  </Button>
                </Box>
              )}
            </CardContent>
          </Card>

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
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
                  {/* No Template Message */}
                  <Box sx={{ 
                    p: 3, 
                    backgroundColor: theme.palette.background.paper,
                    borderRadius: 2,
                    border: `1px solid ${theme.palette.divider}`,
                    width: '100%',
                    maxWidth: 400,
                    textAlign: 'center'
                  }}>
                    <MdImage size={48} color={theme.palette.text.secondary} style={{ marginBottom: 16 }} />
                    <Typography variant="h6" sx={{ mb: 2, color: theme.palette.text.primary }}>
                      Select Template & Crews
                    </Typography>
                    <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                      Choose crews from above and a template to see the preview.
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
          title={selectedCrewIds.length === 0 ? "Please select at least one crew" : ""}
          arrow
        >
          <span>
            <Button
              variant="contained"
              size="large"
              onClick={handleGenerateImages}
              disabled={generating || selectedCrewIds.length === 0 || !selectedTemplate}
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
                : selectedCrewIds.length > 0 
                  ? `Generate ${selectedCrewIds.length} Image${selectedCrewIds.length !== 1 ? 's' : ''}`
                  : 'Generate Images'
              }
            </Button>
          </span>
        </Tooltip>
      )}

    </Box>
  );
};

export default GenerateImagesPage;