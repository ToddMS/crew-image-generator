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
  DialogContent,
  Switch,
  FormControlLabel
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useLocation, useNavigate } from 'react-router-dom';
import { MdClose, MdArrowBack, MdImage } from 'react-icons/md';
import LoginPrompt from '../components/Auth/LoginPrompt';
import ClubPresetDropdown from '../components/ClubPresetDropdown/ClubPresetDropdown';
import { useAuth } from '../context/AuthContext';
import { useAnalytics } from '../context/AnalyticsContext';
import { useNotification } from '../context/NotificationContext';
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
  const { showSuccess, showError } = useNotification();

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
  const [logoUrls, setLogoUrls] = useState<Record<string, string>>({});

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
        
        // Load logo images with authentication
        await loadLogoImages(data);
      }
    } catch (error) {
      console.error('Error loading presets:', error);
    }
  };

  const handlePresetSelection = (presetId: number, preset: any) => {
    setSelectedPresetId(presetId);
    setUsePresetColors(true);
  };

  const loadLogoImages = async (presets: any[]) => {
    const urls: Record<string, string> = {};
    
    for (const preset of presets) {
      if (preset.logo_filename) {
        try {
          const response = await fetch(`${import.meta.env.VITE_API_URL}/api/club-presets/logos/${preset.logo_filename}`, {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('sessionId')}`,
            },
          });
          
          if (response.ok) {
            const blob = await response.blob();
            const objectUrl = URL.createObjectURL(blob);
            urls[preset.logo_filename] = objectUrl;
          }
        } catch (error) {
          console.error('Error loading logo for', preset.club_name, error);
        }
      }
    }
    
    setLogoUrls(urls);
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
    
    // Update the selected crews array to match
    const newSelectedCrews = selectedCrews.filter(crew => crew.id !== crewId);
    setSelectedCrews(newSelectedCrews);
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
        
        // Show success notification
        showSuccess(`Successfully generated ${successCount} image${successCount > 1 ? 's' : ''} for your crew${successCount > 1 ? 's' : ''}!`);
        
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
      <Box sx={{ maxWidth: 800, mx: 'auto' }}>
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

        {/* No Crews Selected State */}
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 8 }}>
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
          </CardContent>
        </Card>
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


      {/* Selected Crews - Simplified */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Selected Crews ({selectedCrews.length})
            </Typography>
          </Box>
          
          <Box sx={{ 
            maxHeight: 300, 
            overflowY: 'auto',
            display: 'flex', 
            flexDirection: 'column', 
            gap: 1,
            pr: 1 // Space for scrollbar
          }}>
            {selectedCrews.map((crew) => (
              <Box
                key={crew.id}
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  p: 1.5,
                  border: `1px solid ${theme.palette.divider}`,
                  borderRadius: 1,
                  backgroundColor: theme.palette.background.paper,
                  '&:hover': {
                    backgroundColor: theme.palette.action.hover
                  }
                }}
              >
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.25 }}>
                    {crew.boatName}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                      {crew.boatClub}
                    </Typography>
                    <Chip
                      label={crew.boatClass}
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
                  </Box>
                </Box>
                <IconButton
                  onClick={() => handleRemoveCrew(crew.id)}
                  size="small"
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
        {/* Left Column - Configuration */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          
          {/* Template Selection */}
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                Choose Template
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


        </Box>

        {/* Right Column - Preview & Actions */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          
          {/* Live Preview - Clickable */}
          <Card sx={{ position: 'sticky', top: 20 }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                Preview
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
                      IMG
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
                  label="Instagram Format"
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

          {/* Color Configuration */}
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                Template Colours
              </Typography>
              
              {/* Color Mode Toggle */}
              <Box sx={{ mb: 3 }}>
                <Box display="flex" alignItems="center" gap={1.5} mb={2}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                    Club Colours
                  </Typography>
                  <FormControlLabel
                    control={
                      <Switch
                        size="small"
                        checked={usePresetColors}
                        onChange={(e) => {
                          const checked = e.target.checked;
                          setUsePresetColors(checked);
                          
                          // When toggling on, automatically select the favorite/default club
                          if (checked && !selectedPresetId) {
                            const favoritePreset = presets.find(p => p.is_default);
                            if (favoritePreset) {
                              setSelectedPresetId(favoritePreset.id);
                            }
                          }
                          
                          // When toggling off, clear the selection
                          if (!checked) {
                            setSelectedPresetId(null);
                          }
                        }}
                        sx={{
                          '& .MuiSwitch-switchBase.Mui-checked': {
                            color: theme.palette.primary.main,
                          },
                          '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                            backgroundColor: theme.palette.primary.main,
                          },
                        }}
                      />
                    }
                    label={
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        Use preset
                      </Typography>
                    }
                    sx={{ ml: 'auto' }}
                  />
                </Box>
              </Box>

              {usePresetColors ? (
                /* Club Presets Dropdown */
                <Box>
                  <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600, fontSize: '0.875rem' }}>
                    Select Club Preset
                  </Typography>
                  <ClubPresetDropdown
                    value={selectedPresetId}
                    onChange={handlePresetSelection}
                    label="Choose a club preset"
                    placeholder="Select a club preset"
                  />
                </Box>
              ) : (
                /* Custom Color Pickers with Club Logo */
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                  {/* Left Side - Colors stacked vertically */}
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {/* Primary Color */}
                    <input
                      type="color"
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      style={{
                        width: 36,
                        height: 36,
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer'
                      }}
                    />
                    
                    {/* Secondary Color */}
                    <input
                      type="color"
                      value={secondaryColor}
                      onChange={(e) => setSecondaryColor(e.target.value)}
                      style={{
                        width: 36,
                        height: 36,
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer'
                      }}
                    />
                  </Box>

                  {/* Middle - Color Info */}
                  <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', height: 36 }}>
                      <Box>
                        <Typography variant="caption" sx={{ color: theme.palette.text.secondary, fontSize: '0.7rem' }}>
                          Primary
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 500, fontFamily: 'monospace', fontSize: '0.8rem' }}>
                          {primaryColor.toUpperCase()}
                        </Typography>
                      </Box>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', height: 36 }}>
                      <Box>
                        <Typography variant="caption" sx={{ color: theme.palette.text.secondary, fontSize: '0.7rem' }}>
                          Secondary
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 500, fontFamily: 'monospace', fontSize: '0.8rem' }}>
                          {secondaryColor.toUpperCase()}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>

                  {/* Right Side - Club Logo */}
                  <Box sx={{ mt: -1 }}>
                    <Typography variant="caption" sx={{ color: theme.palette.text.secondary, fontSize: '0.7rem', display: 'block', textAlign: 'center', mb: 0.5 }}>
                      Club Logo
                    </Typography>
                    <Button
                      variant="outlined"
                      component="label"
                      sx={{ 
                        width: 60,
                        height: 60,
                        borderStyle: 'dashed',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 0.5,
                        '&:hover': {
                          borderStyle: 'solid',
                          backgroundColor: theme.palette.action.hover
                        }
                      }}
                    >
                      {clubIcon ? (
                        clubIcon.file ? (
                          <img 
                            src={URL.createObjectURL(clubIcon.file)}
                            alt="Club logo preview"
                            style={{ 
                              width: '100%', 
                              height: '100%', 
                              objectFit: 'contain',
                              borderRadius: '4px'
                            }}
                          />
                        ) : (
                          <Typography variant="caption" sx={{ fontSize: '0.55rem', textAlign: 'center' }}>
                            IMG
                          </Typography>
                        )
                      ) : (
                        <Typography variant="caption" sx={{ fontSize: '0.6rem' }}>
                          +
                        </Typography>
                      )}
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
                      <Box sx={{ mt: 1, textAlign: 'center' }}>
                        <IconButton
                          size="small"
                          onClick={() => setClubIcon(null)}
                          sx={{ 
                            color: theme.palette.error.main,
                            '&:hover': {
                              backgroundColor: theme.palette.error.light + '20'
                            }
                          }}
                        >
                          <MdClose size={12} />
                        </IconButton>
                      </Box>
                    )}
                  </Box>
                </Box>
              )}
            </CardContent>
          </Card>


        </Box>
      </Box>

      {/* Floating Generate Button */}
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
          
          // Prepare club icon - either from custom upload or preset
          let finalClubIcon = null;
          if (usePresetColors && selectedPresetId) {
            const selectedPreset = presets.find(p => p.id === selectedPresetId);
            if (selectedPreset?.logo_filename) {
              finalClubIcon = {
                type: 'preset',
                filename: selectedPreset.logo_filename,
                format: 'instagram'
              };
            }
          } else if (clubIcon) {
            finalClubIcon = {
              ...clubIcon,
              format: 'instagram'
            };
          }
          
          // Extended image generation with styling options
          handleGenerateImages('', selectedTemplate, colors, true, finalClubIcon);
        }}
        disabled={generating || selectedCrews.length === 0}
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
                    IMG
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
                label="1080x1080"
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