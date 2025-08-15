import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Alert,
  CircularProgress,
  Divider,
  Chip,
  TextField,
  IconButton,
  CardActions,
  CardMedia
} from '@mui/material';
import { Palette, Brush, ViewModule, TextFields, Image, Save, Delete, Refresh } from '@mui/icons-material';

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

const TemplateCustomizerPage: React.FC = () => {
  const [components, setComponents] = useState<TemplateComponents | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [savedTemplates, setSavedTemplates] = useState<SavedTemplate[]>([]);
  const [templateName, setTemplateName] = useState('');

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

  // Auto-generate preview when config changes
  useEffect(() => {
    if (components) {
      const timeoutId = setTimeout(() => {
        generatePreview();
      }, 500); // Debounce for 500ms to avoid too many API calls

      return () => clearTimeout(timeoutId);
    }
  }, [config, components]);

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
      
      const response = await fetch('http://localhost:8080/api/crews/generate-custom-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          crewId: null, // We'll pass the crew data directly
          crew: dummyCrewData, // Pass crew data for preview
          templateConfig: config,
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
      case 'backgrounds': return <Palette />;
      case 'nameDisplays': return <TextFields />;
      case 'boatStyles': return <ViewModule />;
      case 'textLayouts': return <TextFields />;
      case 'logoPositions': return <Image />;
      default: return <Brush />;
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
    <Container maxWidth="xl">
      <Grid container spacing={3}>
        {/* Left Panel - Component Selectors */}
        <Grid item xs={12} md={6}>
          <Grid container spacing={2}>
            {components && Object.entries(components).map(([type, items]) => (
              <Grid item xs={12} key={type}>
                <Card>
                  <CardContent>
                    <Box display="flex" alignItems="center" gap={1} mb={2}>
                      {getComponentIcon(type)}
                      <Typography variant="h6">
                        {type.charAt(0).toUpperCase() + type.slice(1).replace(/([A-Z])/g, ' $1')}
                      </Typography>
                    </Box>
                    
                    <FormControl fullWidth>
                      <Select
                        value={config[type.slice(0, -1) as keyof TemplateConfig] || ''}
                        onChange={(e) => handleConfigChange(type.slice(0, -1) as keyof TemplateConfig, e.target.value)}
                      >
                        {items.map((item) => (
                          <MenuItem key={item.id} value={item.id}>
                            <Box>
                              <Typography variant="body1">{item.name}</Typography>
                              <Typography variant="caption" color="text.secondary">
                                {item.description}
                              </Typography>
                            </Box>
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </CardContent>
                </Card>
              </Grid>
            ))}

            {/* Color Selectors */}
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Box display="flex" alignItems="center" gap={1} mb={2}>
                    <Palette />
                    <Typography variant="h6">Colors</Typography>
                  </Box>
                  
                  <Box display="flex" gap={2}>
                    <Box flex={1}>
                      <Typography variant="caption">Primary Color</Typography>
                      <input
                        type="color"
                        value={config.colors.primary}
                        onChange={(e) => handleColorChange('primary', e.target.value)}
                        style={{ width: '100%', height: 40, border: 'none', borderRadius: 4 }}
                      />
                    </Box>
                    <Box flex={1}>
                      <Typography variant="caption">Secondary Color</Typography>
                      <input
                        type="color"
                        value={config.colors.secondary}
                        onChange={(e) => handleColorChange('secondary', e.target.value)}
                        style={{ width: '100%', height: 40, border: 'none', borderRadius: 4 }}
                      />
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* Save Template */}
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>Save Template</Typography>
                  <Box display="flex" gap={1}>
                    <TextField
                      placeholder="Enter template name..."
                      value={templateName}
                      onChange={(e) => setTemplateName(e.target.value)}
                      size="small"
                      fullWidth
                    />
                    <Button
                      variant="contained"
                      onClick={saveTemplate}
                      startIcon={<Save />}
                      disabled={!templateName.trim()}
                    >
                      Save
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Grid>

        {/* Right Panel - Live Preview */}
        <Grid item xs={12} md={6}>
          <Card sx={{ position: 'sticky', top: 20 }}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                <Typography variant="h6">Live Preview</Typography>
                <IconButton onClick={generatePreview} disabled={previewLoading}>
                  <Refresh />
                </IconButton>
              </Box>

              {previewLoading && (
                <Box display="flex" justifyContent="center" alignItems="center" minHeight="300px">
                  <CircularProgress />
                </Box>
              )}

              {previewImage && !previewLoading && (
                <Box>
                  <img
                    src={previewImage}
                    alt="Template Preview"
                    style={{
                      width: '100%',
                      height: 'auto',
                      borderRadius: 8,
                      border: '1px solid #ddd'
                    }}
                  />
                </Box>
              )}

              <Divider sx={{ my: 2 }} />
              
              <Box display="flex" flexWrap="wrap" gap={1}>
                <Chip label={`${config.background} background`} size="small" />
                <Chip label={`${config.nameDisplay} names`} size="small" />
                <Chip label={`${config.boatStyle} boat`} size="small" />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Saved Templates */}
        {savedTemplates.length > 0 && (
          <Grid item xs={12}>
            <Typography variant="h5" gutterBottom>Saved Templates</Typography>
            <Grid container spacing={2}>
              {savedTemplates.map((template) => (
                <Grid item xs={12} sm={6} md={3} key={template.id}>
                  <Card>
                    {template.previewUrl && (
                      <CardMedia
                        component="img"
                        height="200"
                        image={template.previewUrl}
                        alt={template.name}
                      />
                    )}
                    <CardContent>
                      <Typography variant="h6" gutterBottom>{template.name}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {new Date(template.createdAt).toLocaleDateString()}
                      </Typography>
                    </CardContent>
                    <CardActions>
                      <Button size="small" onClick={() => loadTemplate(template)}>
                        Load
                      </Button>
                      <IconButton size="small" onClick={() => deleteTemplate(template.id)}>
                        <Delete />
                      </IconButton>
                    </CardActions>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Grid>
        )}
      </Grid>
    </Container>
  );
};

export default TemplateCustomizerPage;