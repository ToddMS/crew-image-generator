import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Alert,
  CircularProgress,
  TextField,
  IconButton,
  Card,
  CardContent,
  Switch,
  FormControlLabel
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { Palette, Brush, ViewModule, TextFields, Image, Save, Delete, CloudUpload, SwapVert } from '@mui/icons-material';
import ClubPresetDropdown from '../components/ClubPresetDropdown/ClubPresetDropdown';

interface TemplateComponent {
  id: string;
  name: string;
  description: string;
}

interface TemplateComponents {
  backgrounds: TemplateComponent[];
  nameDisplays: TemplateComponent[];
  boatStyles: TemplateComponent[];
  textLayouts: TemplateComponent[];
  logoPositions: TemplateComponent[];
}

interface TemplateConfig {
  background: string;
  nameDisplay: string;
  boatStyle: string;
  textLayout: string;
  logo: string;
  dimensions: { width: number; height: number };
  colors: { primary: string; secondary: string };
}

interface SavedTemplate {
  id: string;
  name: string;
  config: TemplateConfig;
  previewUrl?: string;
  createdAt: string;
}

const TemplateCustomizerPageCompact: React.FC = () => {
  const theme = useTheme();
  const [components, setComponents] = useState<TemplateComponents | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [savedTemplates, setSavedTemplates] = useState<SavedTemplate[]>([]);
  const [templateName, setTemplateName] = useState('');
  const [usePresetColors, setUsePresetColors] = useState(false);
  const [selectedPresetId, setSelectedPresetId] = useState<number | null>(null);
  const [clubIcon, setClubIcon] = useState<any>(null);
  const [presets, setPresets] = useState<any[]>([]);
  const [selectedBoatType, setSelectedBoatType] = useState<string>('8+');

  // Template configuration state
  const [config, setConfig] = useState<TemplateConfig>({
    background: 'diagonal',
    nameDisplay: 'labeled',
    boatStyle: 'offset',
    textLayout: 'header-left',
    logo: 'bottom-right',
    dimensions: { width: 1080, height: 1350 },
    colors: { primary: '#DAA520', secondary: '#2C3E50' }
  });

  // Load available components
  useEffect(() => {
    const fetchComponents = async () => {
      try {
        const response = await fetch('http://localhost:8080/api/crews/template-components');
        if (!response.ok) throw new Error('Failed to fetch components');
        const data = await response.json();
        setComponents(data);
        
        // Generate initial preview after components load
        generatePreview();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchComponents();
  }, []);

  // Load presets and set default to favorite
  useEffect(() => {
    loadPresets();
  }, []);

  // Set default preset to favorite when presets load
  useEffect(() => {
    if (presets.length > 0 && !selectedPresetId && usePresetColors) {
      const favoritePreset = presets.find(p => p.is_default);
      console.log('Presets loaded, looking for favorite preset:', favoritePreset); // Debug log
      if (favoritePreset) {
        console.log('Setting default preset:', favoritePreset.club_name); // Debug log
        handlePresetSelection(favoritePreset.id, favoritePreset);
      } else if (presets.length > 0) {
        // Fallback to first preset if no favorite
        console.log('No favorite preset found, selecting first preset:', presets[0].club_name); // Debug log
        handlePresetSelection(presets[0].id, presets[0]);
      }
    }
  }, [presets, usePresetColors]);

  const loadPresets = async () => {
    try {
      console.log('Loading presets from:', `${import.meta.env.VITE_API_URL}/api/club-presets`); // Debug log
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/club-presets`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('sessionId')}`,
        },
      });
      console.log('Presets response status:', response.status); // Debug log
      if (!response.ok) throw new Error('Failed to load presets');
      const data = await response.json();
      console.log('Raw presets data:', data); // Debug log
      console.log('Loaded presets:', data.map(p => ({name: p.club_name, isDefault: p.is_default}))); // Debug log
      setPresets(data);
    } catch (error) {
      console.error('Error loading presets:', error);
    }
  };

  const handlePresetSelection = (presetId: number, preset: any) => {
    console.log('Preset selected:', presetId, preset); // Debug log
    setSelectedPresetId(presetId);
    if (presetId && preset) {
      setConfig(prev => ({
        ...prev,
        colors: {
          primary: preset.primary_color,
          secondary: preset.secondary_color
        }
      }));
      // Set the club icon from the preset
      console.log('Setting club icon:', preset.logo_filename); // Debug log
      if (preset.logo_filename) {
        setClubIcon({
          type: 'preset',
          filename: preset.logo_filename
        });
      } else {
        setClubIcon(null);
      }
    } else {
      setClubIcon(null);
    }
  };

  // Auto-generate preview when config or clubIcon changes
  useEffect(() => {
    if (components) {
      const timeoutId = setTimeout(() => {
        generatePreview();
      }, 500); // Debounce for 500ms to avoid too many API calls

      return () => clearTimeout(timeoutId);
    }
  }, [config, components, clubIcon]);

  const handleConfigChange = (field: keyof TemplateConfig, value: any) => {
    setConfig(prev => ({ ...prev, [field]: value }));
  };

  const handleColorChange = (colorType: 'primary' | 'secondary', value: string) => {
    setConfig(prev => ({
      ...prev,
      colors: { ...prev.colors, [colorType]: value }
    }));
  };

  const generatePreview = async () => {
    setPreviewLoading(true);
    try {
      // Create a dummy crew for preview
      const dummyCrewData = {
        name: "Template Preview",
        clubName: "Demo Club", 
        raceName: "Head of the River",
        boatType: { id: 1, value: "8+", name: "Eight" },
        crewNames: ["Cox", "Julian", "Vian", "George", "Grayson", "Todd", "Alex", "Tim", ""],
        coachName: "Demo Coach"
      };
      
      console.log('Generating preview with club icon:', clubIcon); // Debug log
      
      // Convert uploaded file to base64 for preview
      let processedClubIcon = clubIcon;
      if (clubIcon && clubIcon.type === 'upload' && clubIcon.file) {
        const reader = new FileReader();
        const base64Promise = new Promise<string>((resolve) => {
          reader.onload = (e) => resolve(e.target?.result as string);
          reader.readAsDataURL(clubIcon.file);
        });
        const base64Data = await base64Promise;
        processedClubIcon = {
          type: 'upload',
          base64: base64Data,
          filename: clubIcon.filename
        };
        console.log('Converted uploaded file to base64 for preview'); // Debug log
      }
      
      const response = await fetch('http://localhost:8080/api/crews/generate-custom-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          crewId: null, // We'll pass the crew data directly
          crew: dummyCrewData, // Pass crew data for preview
          templateConfig: config,
          clubIcon: processedClubIcon, // Pass the processed club icon for preview
          imageName: `custom_template_preview_${Date.now()}.png`
        }),
      });

      if (!response.ok) throw new Error('Failed to generate preview');

      const blob = await response.blob();
      const imageUrl = URL.createObjectURL(blob);
      setPreviewImage(imageUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate preview');
    } finally {
      setPreviewLoading(false);
    }
  };

  const saveTemplate = () => {
    if (!templateName.trim()) {
      setError('Please enter a template name');
      return;
    }

    const newTemplate: SavedTemplate = {
      id: Date.now().toString(),
      name: templateName,
      config: { ...config },
      previewUrl: previewImage || undefined,
      createdAt: new Date().toISOString()
    };

    const updated = [...savedTemplates, newTemplate];
    setSavedTemplates(updated);
    localStorage.setItem('savedTemplates', JSON.stringify(updated));
    setTemplateName('');
    
    // Show success message
    console.log('Template saved successfully!');
  };

  const loadTemplate = (template: SavedTemplate) => {
    setConfig(template.config);
  };

  const deleteTemplate = (templateId: string) => {
    const updated = savedTemplates.filter(t => t.id !== templateId);
    setSavedTemplates(updated);
    localStorage.setItem('savedTemplates', JSON.stringify(updated));
  };

  // Load saved templates on mount
  useEffect(() => {
    const saved = localStorage.getItem('savedTemplates');
    if (saved) {
      setSavedTemplates(JSON.parse(saved));
    }
  }, []);

  const getComponentIcon = (type: string) => {
    switch (type) {
      case 'backgrounds': return <Palette sx={{ fontSize: 16 }} />;
      case 'nameDisplays': return <TextFields sx={{ fontSize: 16 }} />;
      case 'boatStyles': return <ViewModule sx={{ fontSize: 16 }} />;
      case 'textLayouts': return <TextFields sx={{ fontSize: 16 }} />;
      case 'logoPositions': return <Image sx={{ fontSize: 16 }} />;
      default: return <Brush sx={{ fontSize: 16 }} />;
    }
  };

  if (loading) {
    return (
      <Container>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 2 }}>
      {/* Compact Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 600, mb: 0.5 }}>
            Template Builder
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Mix and match components to create your perfect template
          </Typography>
        </Box>
        
        {/* Empty space for better alignment */}
        <Box />
      </Box>

      <Grid container spacing={3} sx={{ height: 'calc(100vh - 200px)' }}>
        {/* Left Panel - Component Selectors */}
        <Grid item xs={12} lg={7}>
          
          {/* Component Selectors with Headers */}
          <Grid container spacing={3} sx={{ mb: 3 }}>
            {components && Object.entries(components).map(([type, items]) => {
              // Comment out boat styles for now
              if (type === 'boatStyles') return null;
              
              return (
                <Grid item xs={12} sm={6} md={4} key={type}>
                  <Box>
                    <Typography variant="subtitle2" sx={{ 
                      mb: 1, 
                      fontWeight: 600, 
                      fontSize: '0.875rem'
                    }}>
                      {type.charAt(0).toUpperCase() + type.slice(1).replace(/([A-Z])/g, ' $1')}
                    </Typography>
                    <FormControl fullWidth size="small">
                      <Select
                        value={config[type === 'logoPositions' ? 'logo' : type.slice(0, -1) as keyof TemplateConfig] || ''}
                        onChange={(e) => handleConfigChange(type === 'logoPositions' ? 'logo' : type.slice(0, -1) as keyof TemplateConfig, e.target.value)}
                        size="small"
                        displayEmpty
                        renderValue={(selected) => {
                          if (!selected) return 'Select...';
                          const selectedItem = items.find(item => item.id === selected);
                          return selectedItem ? selectedItem.name : selected;
                        }}
                      >
                        {items.map((item) => (
                          <MenuItem key={item.id} value={item.id}>
                            <Box>
                              <Typography variant="body2" sx={{ fontWeight: 500 }}>{item.name}</Typography>
                              <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                                {item.description}
                              </Typography>
                            </Box>
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Box>
                </Grid>
              );
            })}
          </Grid>

          {/* Colors & Logo Section */}
          <Box sx={{ 
            p: 1.5, 
            backgroundColor: theme.palette.background.paper,
            borderRadius: 2,
            border: `1px solid ${theme.palette.divider}`,
            mb: 3,
            maxWidth: 400
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
              <Typography variant="subtitle2" sx={{ 
                fontWeight: 600, 
                fontSize: '0.875rem'
              }}>
                Colors & Logo
              </Typography>
              
              {/* Club Preset Toggle */}
              <FormControlLabel
                control={
                  <Switch
                    size="small"
                    checked={usePresetColors}
                    onChange={(e) => {
                      setUsePresetColors(e.target.checked);
                      if (!e.target.checked) {
                        setSelectedPresetId(null);
                        setClubIcon(null);
                      } else {
                        // Auto-select favorite preset when toggling on
                        console.log('Available presets:', presets.length); // Debug log
                        if (presets.length > 0) {
                          const favoritePreset = presets.find(p => p.is_default);
                          console.log('Toggling club preset on, favorite preset:', favoritePreset); // Debug log
                          if (favoritePreset) {
                            console.log('Auto-selecting favorite preset:', favoritePreset.club_name); // Debug log
                            handlePresetSelection(favoritePreset.id, favoritePreset);
                          } else {
                            // Fallback to first preset if no favorite
                            console.log('No favorite preset, selecting first preset:', presets[0].club_name); // Debug log
                            handlePresetSelection(presets[0].id, presets[0]);
                          }
                        } else {
                          console.log('Presets not loaded yet, will auto-select when they load'); // Debug log
                        }
                      }
                    }}
                  />
                }
                label={<Typography variant="body2" sx={{ fontSize: '0.8rem' }}>Use Club Preset</Typography>}
                sx={{ m: 0 }}
              />
            </Box>
            
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, justifyContent: 'space-between' }}>
              {/* Left Side - Colors or Preset Dropdown */}
              {usePresetColors ? (
                /* Club Preset Selection */
                <Box sx={{ flex: 1 }}>
                  <ClubPresetDropdown
                    value={selectedPresetId}
                    onChange={handlePresetSelection}
                    label="Select Club"
                    placeholder="Choose a club preset"
                    size="small"
                  />
                </Box>
              ) : (
                /* Custom Colors */
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                  {/* Color Pickers Horizontal */}
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5 }}>
                      <input
                        type="color"
                        value={config.colors.primary}
                        onChange={(e) => handleColorChange('primary', e.target.value)}
                        style={{
                          width: 28,
                          height: 28,
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer'
                        }}
                      />
                      <Typography variant="caption" sx={{ 
                        fontFamily: 'monospace', 
                        fontSize: '0.65rem'
                      }}>
                        {config.colors.primary.toUpperCase()}
                      </Typography>
                    </Box>
                    
                    {/* Swap Colors Button - Rotated */}
                    <Box sx={{ display: 'flex', alignItems: 'center', height: 28 }}>
                      <IconButton
                        size="small"
                        onClick={() => {
                          const temp = config.colors.primary;
                          handleColorChange('primary', config.colors.secondary);
                          handleColorChange('secondary', temp);
                        }}
                        sx={{
                          color: theme.palette.text.secondary,
                          transform: 'rotate(90deg)',
                          '&:hover': {
                            backgroundColor: theme.palette.action.hover,
                            color: theme.palette.primary.main
                          }
                        }}
                      >
                        <SwapVert sx={{ fontSize: 14 }} />
                      </IconButton>
                    </Box>
                    
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5 }}>
                      <input
                        type="color"
                        value={config.colors.secondary}
                        onChange={(e) => handleColorChange('secondary', e.target.value)}
                        style={{
                          width: 28,
                          height: 28,
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer'
                        }}
                      />
                      <Typography variant="caption" sx={{ 
                        fontFamily: 'monospace', 
                        fontSize: '0.65rem'
                      }}>
                        {config.colors.secondary.toUpperCase()}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              )}
              
              {/* Right Side - Logo Upload (Always present) */}
              <Box sx={{ position: 'relative' }}>
                <Button
                  variant="outlined"
                  size="small"
                  component="label"
                  sx={{
                    width: 50,
                    height: 50,
                    borderRadius: 1,
                    borderStyle: 'dashed',
                    minWidth: 50,
                    p: 0
                  }}
                  title="Upload Club Icon"
                >
                  {clubIcon ? (
                    <img
                      src={clubIcon.file ? URL.createObjectURL(clubIcon.file) : `${import.meta.env.VITE_API_URL}/api/club-logos/${clubIcon.filename}`}
                      alt="Club Icon"
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'contain',
                        borderRadius: 4
                      }}
                      onError={(e) => {
                        console.error('Failed to load logo:', `${import.meta.env.VITE_API_URL}/api/club-logos/${clubIcon.filename}`);
                        console.error('Club icon object:', clubIcon);
                      }}
                    />
                  ) : (
                    <Typography variant="caption" sx={{ fontSize: '0.6rem', textAlign: 'center', lineHeight: 1 }}>
                      Upload Club Icon
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
                  <IconButton
                    size="small"
                    onClick={() => setClubIcon(null)}
                    sx={{
                      position: 'absolute',
                      top: -8,
                      right: -8,
                      backgroundColor: theme.palette.error.main,
                      color: 'white',
                      width: 20,
                      height: 20,
                      '&:hover': {
                        backgroundColor: theme.palette.error.dark
                      }
                    }}
                  >
                    <Delete sx={{ fontSize: 12 }} />
                  </IconButton>
                )}
              </Box>
            </Box>
          </Box>

          {/* Saved Templates - Horizontal List */}
          {savedTemplates.length > 0 && (
            <Box>
              <Typography variant="h6" sx={{ mb: 2, fontSize: '1rem', fontWeight: 600 }}>
                Saved Templates ({savedTemplates.length})
              </Typography>
              <Box sx={{ 
                display: 'flex', 
                gap: 1.5, 
                overflowX: 'auto', 
                pb: 1,
                '&::-webkit-scrollbar': { height: 6 },
                '&::-webkit-scrollbar-thumb': { 
                  backgroundColor: theme.palette.divider,
                  borderRadius: 3 
                }
              }}>
                {savedTemplates.map((template) => (
                  <Card 
                    key={template.id} 
                    sx={{ 
                      minWidth: 200, 
                      cursor: 'pointer',
                      '&:hover': { transform: 'translateY(-2px)' },
                      transition: 'transform 0.2s ease'
                    }}
                    onClick={() => loadTemplate(template)}
                  >
                    {template.previewUrl && (
                      <Box
                        sx={{
                          height: 100,
                          backgroundImage: `url(${template.previewUrl})`,
                          backgroundSize: 'cover',
                          backgroundPosition: 'center',
                          position: 'relative'
                        }}
                      >
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteTemplate(template.id);
                          }}
                          sx={{
                            position: 'absolute',
                            top: 4,
                            right: 4,
                            backgroundColor: 'rgba(0,0,0,0.5)',
                            color: 'white',
                            '&:hover': { backgroundColor: 'rgba(0,0,0,0.7)' }
                          }}
                        >
                          <Delete sx={{ fontSize: 14 }} />
                        </IconButton>
                      </Box>
                    )}
                    <CardContent sx={{ p: 1.5 }}>
                      <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.8rem' }}>
                        {template.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                        {new Date(template.createdAt).toLocaleDateString()}
                      </Typography>
                    </CardContent>
                  </Card>
                ))}
              </Box>
            </Box>
          )}
        </Grid>

        {/* Right Panel - Preview */}
        <Grid item xs={12} lg={5}>
          <Box sx={{ 
            position: 'sticky', 
            top: 20,
            backgroundColor: theme.palette.background.paper,
            borderRadius: 2,
            p: 2,
            border: `1px solid ${theme.palette.divider}`,
            height: 'fit-content'
          }}>
            <Typography variant="h6" sx={{ fontSize: '1rem', fontWeight: 600, mb: 2, textAlign: 'center' }}>
              Preview
            </Typography>

            {previewLoading && (
              <Box display="flex" justifyContent="center" alignItems="center" sx={{ height: 300 }}>
                <CircularProgress size={40} />
              </Box>
            )}

            {previewImage && !previewLoading && (
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <img
                  src={previewImage}
                  alt="Template Preview"
                  style={{
                    width: '100%',
                    height: 'auto',
                    maxHeight: '400px',
                    objectFit: 'contain',
                    borderRadius: 8,
                    border: '1px solid #ddd'
                  }}
                />
                
                {/* Template Name Input */}
                <TextField
                  placeholder="Enter template name..."
                  value={templateName}
                  onChange={(e) => setTemplateName(e.target.value)}
                  size="small"
                  sx={{ mt: 2, width: '100%' }}
                />
                
                {/* Save Button */}
                <Button
                  variant="contained"
                  onClick={saveTemplate}
                  startIcon={<Save sx={{ fontSize: 16 }} />}
                  disabled={!templateName.trim()}
                  sx={{ mt: 1, width: '100%' }}
                >
                  Save Template
                </Button>
              </Box>
            )}
          </Box>
        </Grid>
      </Grid>
    </Container>
  );
};

export default TemplateCustomizerPageCompact;