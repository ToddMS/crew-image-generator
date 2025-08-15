import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Alert,
  Button,
  Card,
  CardContent,
  Chip,
  IconButton,
  Dialog,
  DialogContent
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useLocation, useNavigate } from 'react-router-dom';
import { MdClose, MdImage } from 'react-icons/md';
import LoginPrompt from '../components/Auth/LoginPrompt';
import { useAuth } from '../context/AuthContext';
import { useAnalytics } from '../context/AnalyticsContext';
import { useNotification } from '../context/NotificationContext';
import { ApiService } from '../services/api.service';

interface SavedTemplate {
  id: string;
  name: string;
  description: string;
  config: {
    background: string;
    nameDisplay: string;
    boatStyle: string;
    textLayout: string;
    logo: string;
    dimensions: { width: number; height: number };
    colors: { primary: string; secondary: string };
  };
  isDefault?: boolean;
  previewUrl?: string;
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
  const [previewModalOpen, setPreviewModalOpen] = useState(false);

  // Check if we came from crews page with selected crews
  useEffect(() => {
    const state = location.state as any;
    if (state?.selectedCrewIds) {
      setSelectedCrewIds(state.selectedCrewIds);
    } else if (state?.selectedCrewIndex !== undefined) {
      loadCrews().then(crews => {
        if (crews && crews[state.selectedCrewIndex]) {
          setSelectedCrewIds([crews[state.selectedCrewIndex].id]);
        }
      });
    }
  }, [location.state]);

  // Load crew details when we have selected IDs
  useEffect(() => {
    if (selectedCrewIds.length > 0) {
      loadSelectedCrews();
    }
  }, [selectedCrewIds]);

  // Load saved templates
  useEffect(() => {
    loadSavedTemplates();
  }, []);

  const loadSavedTemplates = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/crews/saved-templates`);
      if (!response.ok) throw new Error('Failed to load templates');
      const data = await response.json();
      setSavedTemplates(data.templates);
      // Select first template by default
      if (data.templates.length > 0) {
        setSelectedTemplate(data.templates[0]);
      }
    } catch (error) {
      console.error('Error loading saved templates:', error);
      showError('Failed to load templates');
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
      const crews = await ApiService.getCrews();
      const selected = crews.filter(crew => selectedCrewIds.includes(crew.id.toString()));
      setSelectedCrews(selected);
    } catch (error) {
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
                Choose Template
              </Typography>
              
              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: 2 }}>
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
                        transform: 'translateY(-2px)',
                        boxShadow: theme.shadows[4]
                      }
                    }}
                    onClick={() => setSelectedTemplate(template)}
                  >
                    <CardContent sx={{ p: 2, textAlign: 'center' }}>
                      <Box
                        sx={{
                          width: '100%',
                          height: 120,
                          backgroundColor: template.config.colors.primary,
                          borderRadius: 1,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          mb: 2,
                          backgroundImage: `linear-gradient(135deg, ${template.config.colors.primary} 0%, ${template.config.colors.secondary} 100%)`,
                          border: `1px solid ${theme.palette.divider}`,
                          position: 'relative'
                        }}
                      >
                        <MdImage size={32} color="white" style={{ opacity: 0.8 }} />
                        
                        {template.isDefault && (
                          <Chip
                            label="Default"
                            size="small"
                            sx={{
                              position: 'absolute',
                              top: 4,
                              right: 4,
                              backgroundColor: 'rgba(255,255,255,0.9)',
                              color: theme.palette.text.secondary,
                              fontSize: '0.65rem'
                            }}
                          />
                        )}
                      </Box>
                      
                      <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
                        {template.name}
                      </Typography>
                      <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                        {template.description}
                      </Typography>
                    </CardContent>
                  </Card>
                ))}
              </Box>
              
              <Box sx={{ mt: 3, p: 2, backgroundColor: theme.palette.action.hover, borderRadius: 1 }}>
                <Typography variant="body2" sx={{ color: theme.palette.text.secondary, textAlign: 'center' }}>
                  💡 Create custom templates in the Template Builder and they'll appear here!
                </Typography>
                <Button
                  variant="text"
                  size="small"
                  onClick={() => navigate('/template-builder')}
                  sx={{ display: 'block', mx: 'auto', mt: 1 }}
                >
                  Go to Template Builder
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Box>

        {/* Right Column - Preview */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          
          {/* Live Preview */}
          <Card sx={{ position: 'sticky', top: 20 }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                Preview
              </Typography>
              
              <Box
                onClick={() => setPreviewModalOpen(true)}
                sx={{
                  width: '100%',
                  aspectRatio: '1/1',
                  backgroundColor: selectedTemplate?.config.colors.primary || theme.palette.grey[200],
                  borderRadius: 2,
                  position: 'relative',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundImage: selectedTemplate ? `linear-gradient(135deg, ${selectedTemplate.config.colors.primary} 0%, ${selectedTemplate.config.colors.secondary} 100%)` : 'none',
                  border: `2px solid ${theme.palette.divider}`,
                  overflow: 'hidden',
                  cursor: 'pointer',
                  transition: 'transform 0.2s ease',
                  '&:hover': {
                    transform: 'scale(1.02)'
                  }
                }}
              >
                {selectedTemplate && (
                  <>
                    <Box sx={{ 
                      textAlign: 'center', 
                      color: 'white', 
                      textShadow: '0 2px 4px rgba(0,0,0,0.3)',
                      px: 3
                    }}>
                      <Typography 
                        variant="h6" 
                        sx={{ 
                          fontWeight: 600,
                          mb: 1,
                          fontSize: '1.2rem'
                        }}
                      >
                        {selectedCrews[0]?.name || 'Crew Name'}
                      </Typography>
                      
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          fontWeight: 500,
                          mb: 0.5,
                          fontSize: '0.9rem'
                        }}
                      >
                        {selectedCrews[0]?.raceName || 'Race Name'}
                      </Typography>
                      
                      <Chip
                        label={selectedCrews[0]?.boatType.value || '8+'}
                        size="small"
                        sx={{
                          mt: 1,
                          backgroundColor: 'rgba(255,255,255,0.2)',
                          color: 'white',
                          fontWeight: 600,
                          fontSize: '0.75rem'
                        }}
                      />
                    </Box>
                    
                    <Chip
                      label={selectedTemplate.name}
                      size="small"
                      sx={{
                        position: 'absolute',
                        top: 8,
                        right: 8,
                        backgroundColor: 'rgba(0,0,0,0.6)',
                        color: 'white',
                        fontSize: '0.7rem'
                      }}
                    />
                  </>
                )}
              </Box>
              
              <Typography variant="caption" sx={{ 
                display: 'block', 
                textAlign: 'center', 
                color: theme.palette.text.secondary, 
                mt: 2
              }}>
                Click to enlarge preview
              </Typography>
            </CardContent>
          </Card>
        </Box>
      </Box>

      {/* Floating Generate Button */}
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
          : `Generate ${selectedCrews.length} Image${selectedCrews.length !== 1 ? 's' : ''}`
        }
      </Button>

      {/* Preview Modal */}
      <Dialog
        open={previewModalOpen}
        onClose={() => setPreviewModalOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            backgroundColor: 'transparent',
            boxShadow: 'none',
            overflow: 'visible'
          }
        }}
      >
        <DialogContent sx={{ p: 0, position: 'relative' }}>
          <IconButton
            onClick={() => setPreviewModalOpen(false)}
            sx={{
              position: 'absolute',
              top: -50,
              right: -50,
              zIndex: 1,
              backgroundColor: 'rgba(0, 0, 0, 0.6)',
              color: 'white',
              '&:hover': {
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
              }
            }}
          >
            <MdClose size={24} />
          </IconButton>
          
          {selectedTemplate && (
            <Box
              sx={{
                width: 500,
                height: 500,
                mx: 'auto',
                backgroundImage: `linear-gradient(135deg, ${selectedTemplate.config.colors.primary} 0%, ${selectedTemplate.config.colors.secondary} 100%)`,
                border: `4px solid ${theme.palette.divider}`,
                overflow: 'hidden',
                cursor: 'pointer',
                boxShadow: theme.shadows[24],
                borderRadius: 4,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Box sx={{ 
                textAlign: 'center', 
                color: 'white', 
                textShadow: '0 2px 4px rgba(0,0,0,0.5)',
                px: 4
              }}>
                <Typography 
                  variant="h4" 
                  sx={{ 
                    fontWeight: 700,
                    mb: 2,
                    fontSize: '2rem'
                  }}
                >
                  {selectedCrews[0]?.name || 'Crew Name'}
                </Typography>
                
                <Typography 
                  variant="h6" 
                  sx={{ 
                    fontWeight: 500,
                    mb: 1,
                    fontSize: '1.2rem'
                  }}
                >
                  {selectedCrews[0]?.raceName || 'Race Name'}
                </Typography>
                
                <Chip
                  label={selectedCrews[0]?.boatType.value || '8+'}
                  sx={{
                    mt: 2,
                    backgroundColor: 'rgba(255,255,255,0.2)',
                    color: 'white',
                    fontWeight: 700,
                    fontSize: '1rem',
                    px: 2,
                    py: 1
                  }}
                />
              </Box>
              
              <Chip
                label={selectedTemplate.name}
                sx={{
                  position: 'absolute',
                  top: 16,
                  right: 16,
                  backgroundColor: 'rgba(0,0,0,0.6)',
                  color: 'white',
                  fontSize: '0.8rem'
                }}
              />
            </Box>
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default GenerateImagesPageSimplified;