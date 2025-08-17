import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  FormControl,
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
  FormControlLabel,
} from '@mui/material';
import Grid from '@mui/material/Grid2';
import { useTheme } from '@mui/material/styles';
import { Image, Save, Delete, SwapVert } from '@mui/icons-material';
import ClubPresetDropdown from '../components/ClubPresetDropdown/ClubPresetDropdown';
import TemplatePreview from '../components/TemplatePreview/TemplatePreview';

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
  clubIcon?: {
    type: 'upload' | 'preset';
    filename?: string;
    base64?: string;
  };
  previewUrl?: string;
  createdAt: string;
}

const TemplateCustomiser: React.FC = () => {
  const theme = useTheme();
  const [components, setComponents] = useState<TemplateComponents | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [savedTemplates, setSavedTemplates] = useState<SavedTemplate[]>([]);
  const [templateName, setTemplateName] = useState('');
  const [usePresetColors, setUsePresetColors] = useState(false);
  const [selectedPresetId, setSelectedPresetId] = useState<number | null>(null);
  const [clubIcon, setClubIcon] = useState<{ type: string; [key: string]: unknown } | null>(null);
  const [presets, setPresets] = useState<Array<{ id: number; primary_color: string; secondary_color: string; [key: string]: unknown }>>([]);
  const [selectedBoatType, setSelectedBoatType] = useState<string>('8+');
  const [currentPreviewUrl, setCurrentPreviewUrl] = useState<string | null>(null);

  const [config, setConfig] = useState<TemplateConfig>({
    background: 'diagonal',
    nameDisplay: 'labeled',
    boatStyle: 'offset',
    textLayout: 'header-left',
    logo: 'bottom-right',
    dimensions: { width: 1080, height: 1350 },
    colors: { primary: '#DAA520', secondary: '#2C3E50' },
  });

  useEffect(() => {
    const fetchComponents = async () => {
      try {
        const response = await fetch('http://localhost:8080/api/crews/template-components');
        if (!response.ok) throw new Error('Failed to fetch components');
        const data = await response.json();
        setComponents(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchComponents();
  }, []);

  useEffect(() => {
    loadPresets();
  }, []);

  useEffect(() => {
    if (presets.length > 0 && !selectedPresetId && usePresetColors) {
      const favoritePreset = presets.find((p) => p.is_default);
      if (favoritePreset) {
        handlePresetSelection(favoritePreset.id, favoritePreset);
      } else if (presets.length > 0) {
        handlePresetSelection(presets[0].id, presets[0]);
      }
    }
  }, [presets, usePresetColors]);

  const loadPresets = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/club-presets`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('sessionId')}`,
        },
      });
      if (!response.ok) throw new Error('Failed to load presets');
      const data = await response.json();
      setPresets(data);
    } catch (error) {
      console.error('Error loading presets:', error);
    }
  };

  const handlePresetSelection = (presetId: number, preset: { primary_color: string; secondary_color: string; [key: string]: unknown }) => {
    setSelectedPresetId(presetId);
    if (presetId && preset) {
      setConfig((prev) => ({
        ...prev,
        colors: {
          primary: preset.primary_color,
          secondary: preset.secondary_color,
        },
      }));
      if (preset.logo_filename) {
        setClubIcon({
          type: 'preset',
          filename: preset.logo_filename,
        });
      } else {
        setClubIcon(null);
      }
    } else {
      setClubIcon(null);
    }
  };

  const handleConfigChange = (field: keyof TemplateConfig, value: unknown) => {
    setConfig((prev) => ({ ...prev, [field]: value }));
  };

  const handleColorChange = (colorType: 'primary' | 'secondary', value: string) => {
    setConfig((prev) => ({
      ...prev,
      colors: { ...prev.colors, [colorType]: value },
    }));
  };

  const handlePreviewGenerated = (imageUrl: string) => {
    setCurrentPreviewUrl(imageUrl);
  };

  const saveTemplate = () => {
    if (!templateName.trim()) {
      setError('Please enter a template name');
      return;
    }

    // Prepare clubIcon data for saving
    let savedClubIcon = undefined;
    if (clubIcon) {
      if (clubIcon.type === 'preset' && clubIcon.filename) {
        savedClubIcon = {
          type: 'preset' as const,
          filename: clubIcon.filename,
        };
      } else if (clubIcon.type === 'upload' && clubIcon.file) {
        // Convert file to base64 for storage
        const reader = new FileReader();
        reader.readAsDataURL(clubIcon.file);
        reader.onload = () => {
          const base64Data = reader.result as string;
          savedClubIcon = {
            type: 'upload' as const,
            base64: base64Data,
            filename: clubIcon.filename,
          };

          const newTemplate: SavedTemplate = {
            id: Date.now().toString(),
            name: templateName,
            config: { ...config },
            clubIcon: savedClubIcon,
            previewUrl: currentPreviewUrl || undefined,
            createdAt: new Date().toISOString(),
          };

          const updated = [...savedTemplates, newTemplate];
          setSavedTemplates(updated);
          localStorage.setItem('savedTemplates', JSON.stringify(updated));
          setTemplateName('');
        };
        return;
      }
    }

    const newTemplate: SavedTemplate = {
      id: Date.now().toString(),
      name: templateName,
      config: { ...config },
      clubIcon: savedClubIcon,
      previewUrl: currentPreviewUrl || undefined,
      createdAt: new Date().toISOString(),
    };

    const updated = [...savedTemplates, newTemplate];
    setSavedTemplates(updated);
    localStorage.setItem('savedTemplates', JSON.stringify(updated));
    setTemplateName('');
  };

  const loadTemplate = (template: SavedTemplate) => {
    setConfig(template.config);
    // Load the club icon if it exists
    if (template.clubIcon) {
      if (template.clubIcon.type === 'preset') {
        setClubIcon({
          type: 'preset',
          filename: template.clubIcon.filename,
        });
      } else if (template.clubIcon.type === 'upload' && template.clubIcon.base64) {
        setClubIcon({
          type: 'upload',
          base64: template.clubIcon.base64,
          filename: template.clubIcon.filename,
        });
      }
    } else {
      setClubIcon(null);
    }
  };

  const deleteTemplate = (templateId: string) => {
    const updated = savedTemplates.filter((t) => t.id !== templateId);
    setSavedTemplates(updated);
    localStorage.setItem('savedTemplates', JSON.stringify(updated));
  };

  useEffect(() => {
    const saved = localStorage.getItem('savedTemplates');
    if (saved) {
      setSavedTemplates(JSON.parse(saved));
    }
  }, []);

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
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 600, mb: 0.5 }}>
            Template Builder
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Mix and match components to create your perfect template
          </Typography>
        </Box>

        <Box />
      </Box>

      <Grid container spacing={3} sx={{ height: 'calc(100vh - 200px)' }}>
        <Grid size={{ xs: 12, lg: 7 }}>
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <Box>
                <Typography
                  variant="subtitle2"
                  sx={{
                    mb: 1,
                    fontWeight: 600,
                    fontSize: '0.875rem',
                  }}
                >
                  Boat Type
                </Typography>
                <FormControl fullWidth size="small">
                  <Select
                    value={selectedBoatType}
                    onChange={(e) => setSelectedBoatType(e.target.value)}
                    size="small"
                    displayEmpty
                    renderValue={(selected) => {
                      if (!selected) return 'Select...';
                      const boatNames = {
                        '8+': 'Eight (8+)',
                        '4+': 'Coxed Four (4+)',
                        '4-': 'Coxless Four (4-)',
                        '2x': 'Double Sculls (2x)',
                        '2-': 'Coxless Pair (2-)',
                        '1x': 'Single Sculls (1x)',
                      };
                      return boatNames[selected as keyof typeof boatNames] || selected;
                    }}
                  >
                    <MenuItem value="8+">
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          Eight (8+)
                        </Typography>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{ fontSize: '0.7rem' }}
                        >
                          8 rowers + coxswain
                        </Typography>
                      </Box>
                    </MenuItem>
                    <MenuItem value="4+">
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          Coxed Four (4+)
                        </Typography>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{ fontSize: '0.7rem' }}
                        >
                          4 rowers + coxswain
                        </Typography>
                      </Box>
                    </MenuItem>
                    <MenuItem value="4-">
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          Coxless Four (4-)
                        </Typography>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{ fontSize: '0.7rem' }}
                        >
                          4 rowers, no coxswain
                        </Typography>
                      </Box>
                    </MenuItem>
                    <MenuItem value="2x">
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          Double Sculls (2x)
                        </Typography>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{ fontSize: '0.7rem' }}
                        >
                          2 scullers with 2 oars each
                        </Typography>
                      </Box>
                    </MenuItem>
                    <MenuItem value="2-">
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          Coxless Pair (2-)
                        </Typography>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{ fontSize: '0.7rem' }}
                        >
                          2 rowers with 1 oar each
                        </Typography>
                      </Box>
                    </MenuItem>
                    <MenuItem value="1x">
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          Single Sculls (1x)
                        </Typography>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{ fontSize: '0.7rem' }}
                        >
                          1 sculler with 2 oars
                        </Typography>
                      </Box>
                    </MenuItem>
                  </Select>
                </FormControl>
              </Box>
            </Grid>

            {components &&
              Object.entries(components).map(([type, items]) => {
                if (type === 'boatStyles') return null;

                return (
                  <Grid size={{ xs: 12, sm: 6, md: 4 }} key={type}>
                    <Box>
                      <Typography
                        variant="subtitle2"
                        sx={{
                          mb: 1,
                          fontWeight: 600,
                          fontSize: '0.875rem',
                        }}
                      >
                        {type.charAt(0).toUpperCase() + type.slice(1).replace(/([A-Z])/g, ' $1')}
                      </Typography>
                      <FormControl fullWidth size="small">
                        <Select
                          value={
                            config[
                              type === 'logoPositions'
                                ? 'logo'
                                : (type.slice(0, -1) as keyof TemplateConfig)
                            ] || ''
                          }
                          onChange={(e) =>
                            handleConfigChange(
                              type === 'logoPositions'
                                ? 'logo'
                                : (type.slice(0, -1) as keyof TemplateConfig),
                              e.target.value,
                            )
                          }
                          size="small"
                          displayEmpty
                          renderValue={(selected) => {
                            if (!selected) return 'Select...';
                            const selectedItem = items.find(
                              (item: TemplateComponent) => item.id === selected,
                            );
                            return selectedItem ? selectedItem.name : selected;
                          }}
                        >
                          {items.map((item: TemplateComponent) => (
                            <MenuItem key={item.id} value={item.id}>
                              <Box>
                                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                  {item.name}
                                </Typography>
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                  sx={{ fontSize: '0.7rem' }}
                                >
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

          <Box
            sx={{
              p: 1.5,
              backgroundColor: theme.palette.background.paper,
              borderRadius: 2,
              border: `1px solid ${theme.palette.divider}`,
              mb: 3,
              maxWidth: 400,
            }}
          >
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                mb: 1.5,
              }}
            >
              <Typography
                variant="subtitle2"
                sx={{
                  fontWeight: 600,
                  fontSize: '0.875rem',
                }}
              >
                Colors & Logo
              </Typography>

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
                        if (presets.length > 0) {
                          const favoritePreset = presets.find((p) => p.is_default);
                          if (favoritePreset) {
                            handlePresetSelection(favoritePreset.id, favoritePreset);
                          } else {
                            handlePresetSelection(presets[0].id, presets[0]);
                          }
                        }
                      }
                    }}
                  />
                }
                label={
                  <Typography variant="body2" sx={{ fontSize: '0.8rem' }}>
                    Use Club Preset
                  </Typography>
                }
                sx={{ m: 0 }}
              />
            </Box>

            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                justifyContent: 'space-between',
              }}
            >
              {usePresetColors ? (
                <Box sx={{ flex: 1 }}>
                  <ClubPresetDropdown
                    value={selectedPresetId}
                    onChange={handlePresetSelection}
                    label="Select Club"
                    placeholder="Choose a club preset"
                  />
                </Box>
              ) : (
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Box
                      sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: 0.5,
                      }}
                    >
                      <input
                        type="color"
                        value={config.colors.primary}
                        onChange={(e) => handleColorChange('primary', e.target.value)}
                        style={{
                          width: 28,
                          height: 28,
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                        }}
                      />
                      <Typography
                        variant="caption"
                        sx={{
                          fontFamily: 'monospace',
                          fontSize: '0.65rem',
                        }}
                      >
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
                            color: theme.palette.primary.main,
                          },
                        }}
                      >
                        <SwapVert sx={{ fontSize: 14 }} />
                      </IconButton>
                    </Box>

                    <Box
                      sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: 0.5,
                      }}
                    >
                      <input
                        type="color"
                        value={config.colors.secondary}
                        onChange={(e) => handleColorChange('secondary', e.target.value)}
                        style={{
                          width: 28,
                          height: 28,
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                        }}
                      />
                      <Typography
                        variant="caption"
                        sx={{
                          fontFamily: 'monospace',
                          fontSize: '0.65rem',
                        }}
                      >
                        {config.colors.secondary.toUpperCase()}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              )}

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
                    p: 0,
                  }}
                  title="Upload Club Icon"
                >
                  {clubIcon ? (
                    <img
                      src={
                        clubIcon.file
                          ? URL.createObjectURL(clubIcon.file)
                          : `${import.meta.env.VITE_API_URL}/api/club-logos/${clubIcon.filename}`
                      }
                      alt="Club Icon"
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'contain',
                        borderRadius: 4,
                      }}
                      onError={(e) => {
                        console.error(
                          'Failed to load logo:',
                          `${import.meta.env.VITE_API_URL}/api/club-logos/${clubIcon.filename}`,
                          e,
                        );
                        console.error('Club icon object:', clubIcon);
                      }}
                    />
                  ) : (
                    <Typography
                      variant="caption"
                      sx={{ fontSize: '0.6rem', textAlign: 'center', lineHeight: 1 }}
                    >
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
                          filename: file.name,
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
                        backgroundColor: theme.palette.error.dark,
                      },
                    }}
                  >
                    <Delete sx={{ fontSize: 12 }} />
                  </IconButton>
                )}
              </Box>
            </Box>
          </Box>

          {savedTemplates.length > 0 && (
            <Box>
              <Typography variant="h6" sx={{ mb: 2, fontSize: '1rem', fontWeight: 600 }}>
                Saved Templates ({savedTemplates.length})
              </Typography>
              <Box
                sx={{
                  display: 'flex',
                  gap: 1.5,
                  overflowX: 'auto',
                  pb: 1,
                  '&::-webkit-scrollbar': { height: 6 },
                  '&::-webkit-scrollbar-thumb': {
                    backgroundColor: theme.palette.divider,
                    borderRadius: 3,
                  },
                }}
              >
                {savedTemplates.map((template) => (
                  <Card
                    key={template.id}
                    sx={{
                      minWidth: 200,
                      cursor: 'pointer',
                      '&:hover': { transform: 'translateY(-2px)' },
                      transition: 'transform 0.2s ease',
                    }}
                    onClick={() => loadTemplate(template)}
                  >
                    <Box
                      sx={{
                        height: 100,
                        backgroundColor: template.config.colors.primary,
                        backgroundImage: `linear-gradient(135deg, ${template.config.colors.primary} 0%, ${template.config.colors.secondary} 100%)`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        position: 'relative',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Image sx={{ fontSize: 24, color: 'white', opacity: 0.8 }} />
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
                          '&:hover': { backgroundColor: 'rgba(0,0,0,0.7)' },
                        }}
                      >
                        <Delete sx={{ fontSize: 14 }} />
                      </IconButton>
                    </Box>
                    <CardContent sx={{ p: 1.5 }}>
                      <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.8rem' }}>
                        {template.name}
                      </Typography>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ fontSize: '0.7rem' }}
                      >
                        {new Date(template.createdAt).toLocaleDateString()}
                      </Typography>
                    </CardContent>
                  </Card>
                ))}
              </Box>
            </Box>
          )}
        </Grid>

        <Grid size={{ xs: 12, lg: 5 }}>
          <Box
            sx={{
              position: 'sticky',
              top: 20,
              backgroundColor: theme.palette.background.paper,
              borderRadius: 2,
              p: 2,
              border: `1px solid ${theme.palette.divider}`,
              height: 'fit-content',
            }}
          >
            <Typography
              variant="h6"
              sx={{ fontSize: '1rem', fontWeight: 600, mb: 2, textAlign: 'center' }}
            >
              Preview
            </Typography>

            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <TemplatePreview
                templateConfig={config}
                clubIcon={clubIcon}
                selectedBoatType={selectedBoatType}
                width={300}
                height={375}
                onPreviewGenerated={handlePreviewGenerated}
                debounceMs={500}
              />

              <TextField
                placeholder="Enter template name..."
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
                size="small"
                sx={{ mt: 2, width: '100%' }}
              />

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
          </Box>
        </Grid>
      </Grid>
    </Container>
  );
};

export default TemplateCustomiser;
