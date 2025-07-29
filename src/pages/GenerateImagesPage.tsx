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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Dialog,
  DialogContent
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
  const [selectedTemplate, setSelectedTemplate] = useState<string>('1');
  const [primaryColor, setPrimaryColor] = useState<string>('#5E98C2');
  const [secondaryColor, setSecondaryColor] = useState<string>('#ffffff');
  const [usePresetColors, setUsePresetColors] = useState<boolean>(false);
  const [selectedPresetId, setSelectedPresetId] = useState<number | null>(null);
  const [clubIcon, setClubIcon] = useState<any>(null);
  const [presets, setPresets] = useState<any[]>([]);
  const [previewModalOpen, setPreviewModalOpen] = useState(false);

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

  // Load presets
  useEffect(() => {
    loadPresets();
  }, [user]);

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

  const loadCrews = async () => {
    try {
      const result = await ApiService.getCrews();
      if (result.data) {
        return result.data.map(crew => {
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
          const hasCox = crew.boatType.value === '8+' || crew.boatType.value === '4+';
          
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
              Choose Template & Customize
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

      {/* Selected Crews - Simplified */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Selected Crews ({selectedCrews.length})
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {selectedCrews.map((crew) => (
              <Box
                key={crew.id}
                sx={{
                  position: 'relative',
                  width: 80,
                  height: 80,
                  borderRadius: 2,
                  background: `linear-gradient(135deg, ${getBoatClassColor(crew.boatClass)} 0%, ${getBoatClassColor(crew.boatClass)}CC 100%)`,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  border: `2px solid ${theme.palette.divider}`,
                  '&:hover': {
                    transform: 'scale(1.05)',
                    boxShadow: theme.shadows[4]
                  }
                }}
              >
                <IconButton
                  onClick={() => handleRemoveCrew(crew.id)}
                  size="small"
                  sx={{
                    position: 'absolute',
                    top: -6,
                    right: -6,
                    backgroundColor: theme.palette.error.main,
                    color: 'white',
                    width: 20,
                    height: 20,
                    '&:hover': {
                      backgroundColor: theme.palette.error.dark
                    }
                  }}
                >
                  <MdClose size={12} />
                </IconButton>
                
                <Typography variant="caption" sx={{ 
                  fontWeight: 700, 
                  fontSize: '0.7rem',
                  textAlign: 'center',
                  mb: 0.5,
                  textShadow: '0 1px 2px rgba(0,0,0,0.3)'
                }}>
                  {crew.boatClass}
                </Typography>
                
                <Typography variant="caption" sx={{ 
                  fontSize: '0.6rem',
                  textAlign: 'center',
                  opacity: 0.9,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  width: '100%',
                  px: 0.5,
                  textShadow: '0 1px 2px rgba(0,0,0,0.3)'
                }}>
                  {crew.boatClub}
                </Typography>
              </Box>
            ))}
          </Box>
        </CardContent>
      </Card>

      {/* Main Generation Interface */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '2fr 1fr' }, gap: 3 }}>
        {/* Left Column - Configuration */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          
          {/* Template Selection */}
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                🎨 Choose Template
              </Typography>
              
              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 2 }}>
                {['1', '2', '3', '4'].map((templateId) => (
                  <Card
                    key={templateId}
                    variant="outlined"
                    sx={{
                      cursor: 'pointer',
                      border: selectedTemplate === templateId 
                        ? `2px solid ${theme.palette.primary.main}` 
                        : `1px solid ${theme.palette.divider}`,
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: theme.shadows[4]
                      }
                    }}
                    onClick={() => setSelectedTemplate(templateId)}
                  >
                    <CardContent sx={{ p: 2, textAlign: 'center' }}>
                      <Box
                        sx={{
                          width: '100%',
                          height: 120,
                          backgroundColor: theme.palette.grey[100],
                          borderRadius: 1,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          mb: 2,
                          backgroundImage: 'url("data:image/svg+xml,%3Csvg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="%23999" fill-opacity="0.3"%3E%3Cpath d="M20 20c0-5.5-4.5-10-10-10s-10 4.5-10 10 4.5 10 10 10 10-4.5 10-10zm10 0c0-5.5-4.5-10-10-10s-10 4.5-10 10 4.5 10 10 10 10-4.5 10-10z"/%3E%3C/g%3E%3C/svg%3E")',
                          backgroundRepeat: 'repeat',
                          border: `1px solid ${theme.palette.divider}`
                        }}
                      >
                        <MdImage size={32} color={theme.palette.text.disabled} />
                      </Box>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        Template {templateId}
                      </Typography>
                      <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                        {templateId === '1' && 'Classic Layout'}
                        {templateId === '2' && 'Modern Style'}
                        {templateId === '3' && 'Minimal Design'}
                        {templateId === '4' && 'Bold Format'}
                      </Typography>
                    </CardContent>
                  </Card>
                ))}
              </Box>
            </CardContent>
          </Card>

          {/* Color Configuration */}
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                🎨 Colors & Styling
              </Typography>
              
              {/* Color Mode Toggle */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
                  Color Mode
                </Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button
                    variant={!usePresetColors ? 'contained' : 'outlined'}
                    onClick={() => setUsePresetColors(false)}
                    size="small"
                  >
                    Custom Colors
                  </Button>
                  <Button
                    variant={usePresetColors ? 'contained' : 'outlined'}
                    onClick={() => setUsePresetColors(true)}
                    size="small"
                  >
                    Club Presets
                  </Button>
                </Box>
              </Box>

              {usePresetColors ? (
                /* Club Presets Dropdown */
                <Box>
                  <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
                    Select Club Preset
                  </Typography>
                  <FormControl fullWidth>
                    <InputLabel>Choose a club preset</InputLabel>
                    <Select
                      value={selectedPresetId || ''}
                      onChange={(e) => setSelectedPresetId(e.target.value as number)}
                      label="Choose a club preset"
                    >
                      {presets.map((preset) => (
                        <MenuItem key={preset.id} value={preset.id}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Box sx={{ display: 'flex', gap: 0.5 }}>
                              <Box
                                sx={{
                                  width: 16,
                                  height: 16,
                                  borderRadius: 1,
                                  backgroundColor: preset.primary_color,
                                  border: `1px solid ${theme.palette.divider}`
                                }}
                              />
                              <Box
                                sx={{
                                  width: 16,
                                  height: 16,
                                  borderRadius: 1,
                                  backgroundColor: preset.secondary_color,
                                  border: `1px solid ${theme.palette.divider}`
                                }}
                              />
                            </Box>
                            <Typography>{preset.name}</Typography>
                          </Box>
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>
              ) : (
                /* Custom Color Pickers with Club Logo */
                <Box>
                  <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 3, mb: 3 }}>
                    <Box>
                      <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
                        Primary Color
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <input
                          type="color"
                          value={primaryColor}
                          onChange={(e) => setPrimaryColor(e.target.value)}
                          style={{
                            width: 50,
                            height: 50,
                            border: 'none',
                            borderRadius: '8px',
                            cursor: 'pointer'
                          }}
                        />
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {primaryColor}
                          </Typography>
                          <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                            Main brand color
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                    
                    <Box>
                      <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
                        Secondary Color
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <input
                          type="color"
                          value={secondaryColor}
                          onChange={(e) => setSecondaryColor(e.target.value)}
                          style={{
                            width: 50,
                            height: 50,
                            border: 'none',
                            borderRadius: '8px',
                            cursor: 'pointer'
                          }}
                        />
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {secondaryColor}
                          </Typography>
                          <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                            Accent color
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                  </Box>

                  {/* Club Logo Upload - Only for Custom Colors */}
                  <Box>
                    <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
                      Club Logo (Optional)
                    </Typography>
                    <Button
                      variant="outlined"
                      component="label"
                      sx={{ 
                        py: 2,
                        borderStyle: 'dashed',
                        width: '100%',
                        '&:hover': {
                          borderStyle: 'solid',
                          backgroundColor: theme.palette.action.hover
                        }
                      }}
                    >
                      {clubIcon ? 'Change Logo' : 'Upload Club Logo'}
                      <input
                        type="file"
                        hidden
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            setClubIcon({
                              type: 'upload',
                              file: file,
                              filename: file.name
                            });
                          }
                        }}
                      />
                    </Button>
                    
                    {clubIcon && (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 2 }}>
                        <Typography variant="caption" sx={{ 
                          color: theme.palette.success.main,
                          flex: 1
                        }}>
                          ✓ {clubIcon.filename || 'Logo selected'}
                        </Typography>
                        <Button
                          size="small"
                          onClick={() => setClubIcon(null)}
                          sx={{ color: theme.palette.error.main }}
                        >
                          Remove
                        </Button>
                      </Box>
                    )}
                    
                    <Typography variant="caption" sx={{ color: theme.palette.text.secondary, display: 'block', mt: 1 }}>
                      PNG, JPG, SVG recommended. Max 2MB.
                    </Typography>
                  </Box>
                </Box>
              )}
            </CardContent>
          </Card>

        </Box>

        {/* Right Column - Preview & Actions */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          
          {/* Live Preview - Clickable */}
          <Card sx={{ position: 'sticky', top: 20 }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                🔍 Preview
              </Typography>
              
              <Box
                onClick={() => setPreviewModalOpen(true)}
                sx={{
                  width: '100%',
                  aspectRatio: '1/1', // Instagram square format
                  backgroundColor: primaryColor,
                  borderRadius: 2,
                  position: 'relative',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundImage: `linear-gradient(135deg, ${
                    usePresetColors && selectedPresetId 
                      ? presets.find(p => p.id === selectedPresetId)?.primary_color || primaryColor
                      : primaryColor
                  } 0%, ${
                    usePresetColors && selectedPresetId 
                      ? presets.find(p => p.id === selectedPresetId)?.secondary_color || secondaryColor
                      : secondaryColor
                  } 100%)`,
                  border: `2px solid ${theme.palette.divider}`,
                  overflow: 'hidden',
                  cursor: 'pointer',
                  transition: 'transform 0.2s ease',
                  '&:hover': {
                    transform: 'scale(1.02)',
                    boxShadow: theme.shadows[8]
                  }
                }}
              >
                {/* Club Icon */}
                {clubIcon && (
                  <Box
                    sx={{
                      position: 'absolute',
                      top: 16,
                      left: 16,
                      width: 40,
                      height: 40,
                      backgroundColor: 'rgba(255,255,255,0.2)',
                      borderRadius: 2,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backdropFilter: 'blur(4px)'
                    }}
                  >
                    <Typography variant="caption" sx={{ color: 'white', fontWeight: 600 }}>
                      📁
                    </Typography>
                  </Box>
                )}

                {/* Main Content */}
                <Box sx={{ 
                  textAlign: 'center', 
                  color: 'white', 
                  textShadow: '0 2px 4px rgba(0,0,0,0.3)',
                  px: 3
                }}>
                  <Typography 
                    variant="h5" 
                    sx={{ 
                      fontWeight: 600,
                      mb: 1,
                      fontSize: '1.5rem'
                    }}
                  >
                    {selectedCrews[0]?.boatClub || 'Club Name'}
                  </Typography>
                  
                  <Typography 
                    variant="body1" 
                    sx={{ 
                      fontWeight: 500,
                      mb: 0.5,
                      fontSize: '1rem'
                    }}
                  >
                    {selectedCrews[0]?.boatName || 'Boat Name'}
                  </Typography>
                  
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      opacity: 0.9,
                      fontSize: '0.9rem'
                    }}
                  >
                    {selectedCrews[0]?.raceName || 'Race Name'}
                  </Typography>
                  
                  <Chip
                    label={selectedCrews[0]?.boatClass || '8+'}
                    size="small"
                    sx={{
                      mt: 2,
                      backgroundColor: 'rgba(255,255,255,0.2)',
                      color: 'white',
                      fontWeight: 600,
                      fontSize: '0.75rem'
                    }}
                  />
                </Box>
                
                {/* Template Badge */}
                <Chip
                  label={`Template ${selectedTemplate}`}
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

                {/* Instagram Format Badge */}
                <Chip
                  label="📷 Instagram Format"
                  size="small"
                  sx={{
                    position: 'absolute',
                    bottom: 8,
                    right: 8,
                    backgroundColor: 'rgba(0,0,0,0.6)',
                    color: 'white',
                    fontSize: '0.7rem'
                  }}
                />
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

      {/* Generate Button - Bottom */}
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <Button
          variant="contained"
          size="large"
          onClick={() => {
            const colors = usePresetColors && selectedPresetId 
              ? (() => {
                  const preset = presets.find(p => p.id === selectedPresetId);
                  return preset ? { primary: preset.primary_color, secondary: preset.secondary_color } : { primary: primaryColor, secondary: secondaryColor };
                })()
              : { primary: primaryColor, secondary: secondaryColor };
            
            // Extended image generation with styling options
            handleGenerateImages('', selectedTemplate, colors, true, {
              ...clubIcon,
              format: 'instagram'
            });
          }}
          disabled={generating || selectedCrews.length === 0}
          sx={{
            py: 2,
            px: 6,
            fontSize: '1.1rem',
            fontWeight: 600,
            background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
            '&:hover': {
              background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.secondary.dark} 100%)`,
            }
          }}
        >
          {generating 
            ? '🎨 Generating Images...' 
            : `🚀 Generate ${selectedCrews.length} Image${selectedCrews.length !== 1 ? 's' : ''}`
          }
        </Button>
      </Box>

      {/* Preview Modal */}
      <Dialog
        open={previewModalOpen}
        onClose={() => setPreviewModalOpen(false)}
        maxWidth="md"
        PaperProps={{
          sx: {
            backgroundColor: 'transparent',
            boxShadow: 'none',
            overflow: 'visible'
          }
        }}
      >
        <DialogContent sx={{ p: 0 }}>
          <Box sx={{ position: 'relative' }}>
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
            
            <Box
              onClick={() => setPreviewModalOpen(false)}
              sx={{
                width: 500,
                height: 500,
                borderRadius: 4,
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundImage: `linear-gradient(135deg, ${
                  usePresetColors && selectedPresetId 
                    ? presets.find(p => p.id === selectedPresetId)?.primary_color || primaryColor
                    : primaryColor
                } 0%, ${
                  usePresetColors && selectedPresetId 
                    ? presets.find(p => p.id === selectedPresetId)?.secondary_color || secondaryColor
                    : secondaryColor
                } 100%)`,
                border: `4px solid ${theme.palette.divider}`,
                overflow: 'hidden',
                cursor: 'pointer',
                boxShadow: theme.shadows[24]
              }}
            >
              {/* Club Icon */}
              {clubIcon && (
                <Box
                  sx={{
                    position: 'absolute',
                    top: 24,
                    left: 24,
                    width: 60,
                    height: 60,
                    backgroundColor: 'rgba(255,255,255,0.2)',
                    borderRadius: 3,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backdropFilter: 'blur(4px)'
                  }}
                >
                  <Typography variant="h6" sx={{ color: 'white', fontWeight: 600 }}>
                    📁
                  </Typography>
                </Box>
              )}

              {/* Main Content */}
              <Box sx={{ 
                textAlign: 'center', 
                color: 'white', 
                textShadow: '0 2px 4px rgba(0,0,0,0.3)',
                px: 4
              }}>
                <Typography 
                  variant="h3" 
                  sx={{ 
                    fontWeight: 700,
                    mb: 2,
                    fontSize: '3rem'
                  }}
                >
                  {selectedCrews[0]?.boatClub || 'Club Name'}
                </Typography>
                
                <Typography 
                  variant="h5" 
                  sx={{ 
                    fontWeight: 500,
                    mb: 1,
                    fontSize: '1.5rem'
                  }}
                >
                  {selectedCrews[0]?.boatName || 'Boat Name'}
                </Typography>
                
                <Typography 
                  variant="h6" 
                  sx={{ 
                    opacity: 0.9,
                    fontSize: '1.2rem',
                    mb: 2
                  }}
                >
                  {selectedCrews[0]?.raceName || 'Race Name'}
                </Typography>
                
                <Chip
                  label={selectedCrews[0]?.boatClass || '8+'}
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
              
              {/* Template Badge */}
              <Chip
                label={`Template ${selectedTemplate}`}
                sx={{
                  position: 'absolute',
                  top: 16,
                  right: 16,
                  backgroundColor: 'rgba(0,0,0,0.6)',
                  color: 'white',
                  fontSize: '0.8rem'
                }}
              />

              {/* Instagram Format Badge */}
              <Chip
                label="📷 1080x1080"
                sx={{
                  position: 'absolute',
                  bottom: 16,
                  right: 16,
                  backgroundColor: 'rgba(0,0,0,0.6)',
                  color: 'white',
                  fontSize: '0.8rem'
                }}
              />
            </Box>
          </Box>
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default GenerateImagesPage;