import React, { useState } from 'react';
import { 
  Box, 
  Card, 
  CardContent, 
  Typography, 
  Button, 
  Grid,
  TextField,
  MenuItem,
  Avatar,
  Alert,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import { 
  MdPalette,
  MdImage,
  MdColorLens,
  MdTextFields,
  MdSave,
  MdVisibility,
  MdExpandMore,
} from 'react-icons/md';
import AuthModal from '../../components/Auth/AuthModal';
import Navigation from '../../components/Navigation/Navigation';
import { useAuth } from '../../context/AuthContext';
import { useThemeMode } from '../../context/RowgramThemeContext';
import TemplatePreview from '../../components/TemplatePreview/TemplatePreview';
import './Templates.css';

interface TemplateConfig {
  background: string;
  nameDisplay: string;
  boatStyle: string;
  textLayout: string;
  logo: string;
  dimensions: { width: number; height: number };
  colors: { primary: string; secondary: string };
}

const presetTemplates = [
  {
    id: 'regatta-classic',
    name: 'Regatta Classic',
    description: 'Traditional rowing event style',
    config: {
      background: 'geometric',
      nameDisplay: 'basic',
      boatStyle: 'centered',
      textLayout: 'header-left',
      logo: 'bottom-right',
      dimensions: { width: 1080, height: 1350 },
      colors: { primary: '#1e3a5f', secondary: '#6ba3d0' }
    }
  },
  {
    id: 'modern-racing',
    name: 'Modern Racing',
    description: 'Clean, contemporary design',
    config: {
      background: 'diagonal',
      nameDisplay: 'labeled',
      boatStyle: 'offset',
      textLayout: 'header-center',
      logo: 'top-left',
      dimensions: { width: 1080, height: 1350 },
      colors: { primary: '#2ecc71', secondary: '#16a085' }
    }
  },
  {
    id: 'championship',
    name: 'Championship',
    description: 'Bold design for major events',
    config: {
      background: 'radial-burst',
      nameDisplay: 'enhanced',
      boatStyle: 'dynamic',
      textLayout: 'header-split',
      logo: 'center-top',
      dimensions: { width: 1080, height: 1350 },
      colors: { primary: '#e74c3c', secondary: '#f39c12' }
    }
  }
];

const backgroundOptions = [
  { value: 'geometric', label: 'Geometric Pattern', description: 'Hexagonal pattern with gradient' },
  { value: 'diagonal', label: 'Diagonal Sections', description: 'Bold diagonal cuts with lines' },
  { value: 'radial-burst', label: 'Radial Burst', description: 'Sunburst pattern' },
  { value: 'waves', label: 'Water Waves', description: 'Flowing wave pattern' },
  { value: 'minimal', label: 'Minimal Clean', description: 'Simple gradient background' }
];

const nameDisplayOptions = [
  { value: 'basic', label: 'Basic Text', description: 'Simple name display' },
  { value: 'labeled', label: 'With Labels', description: 'Names with position labels' },
  { value: 'enhanced', label: 'Enhanced Style', description: 'Stylized with effects' }
];

const boatStyleOptions = [
  { value: 'centered', label: 'Centered', description: 'Boat in center of image' },
  { value: 'offset', label: 'Offset', description: 'Boat positioned to one side' },
  { value: 'dynamic', label: 'Dynamic', description: 'Angled boat with motion' }
];

const NewTemplateBuilderPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { isDarkMode, toggleTheme } = useThemeMode();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const theme = useTheme();
  
  const handleNavClick = (path: string) => {
    navigate(path);
  };

  const getCurrentPage = () => {
    const path = window.location.pathname;
    if (path === '/') return 'dashboard';
    if (path.includes('/crews/create') || path.includes('/create')) return 'create';
    if (path.includes('/crews')) return 'crews';
    if (path.includes('/templates')) return 'templates';
    if (path.includes('/generate')) return 'generate';
    if (path.includes('/gallery')) return 'gallery';
    if (path.includes('/settings')) return 'settings';
    return 'dashboard';
  };
  
  const [templateName, setTemplateName] = useState('');
  const [selectedPreset, setSelectedPreset] = useState<string>('');
  const [config, setConfig] = useState<TemplateConfig>({
    background: 'geometric',
    nameDisplay: 'basic',
    boatStyle: 'centered',
    textLayout: 'header-left',
    logo: 'bottom-right',
    dimensions: { width: 1080, height: 1350 },
    colors: { primary: '#1e3a5f', secondary: '#6ba3d0' }
  });
  const [showColorPicker, setShowColorPicker] = useState<'primary' | 'secondary' | null>(null);
  const [previewBoatType, setPreviewBoatType] = useState('8+');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePresetSelect = (presetId: string) => {
    const preset = presetTemplates.find(p => p.id === presetId);
    if (preset) {
      setSelectedPreset(presetId);
      setConfig(preset.config);
      if (!templateName) {
        setTemplateName(preset.name);
      }
    }
  };

  const handleConfigChange = (key: keyof TemplateConfig, value: any) => {
    setConfig(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleColorChange = (color: string, type: 'primary' | 'secondary') => {
    setConfig(prev => ({
      ...prev,
      colors: {
        ...prev.colors,
        [type]: color
      }
    }));
  };

  const handleSave = async () => {
    if (!templateName.trim()) {
      setError('Please enter a template name');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      // Save template logic here
      // const response = await ApiService.saveTemplate({ name: templateName, config });
      
      // Simulate save
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      navigate('/templates', { 
        state: { 
          message: `Template "${templateName}" saved successfully!` 
        }
      });
    } catch (error) {
      setError('Failed to save template. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const ColorPickerButton = ({ 
    color, 
    type, 
    label 
  }: { 
    color: string; 
    type: 'primary' | 'secondary'; 
    label: string 
  }) => (
    <Box>
      <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
        {label}
      </Typography>
      <Button
        variant="outlined"
        onClick={() => setShowColorPicker(showColorPicker === type ? null : type)}
        sx={{ 
          width: '100%', 
          height: 48,
          justifyContent: 'flex-start',
          gap: 1,
          textTransform: 'none'
        }}
      >
        <Box 
          sx={{ 
            width: 24, 
            height: 24, 
            borderRadius: '50%', 
            bgcolor: color,
            border: `2px solid ${theme.palette.divider}`
          }} 
        />
        {color.toUpperCase()}
      </Button>
      {showColorPicker === type && (
        <Box sx={{ mt: 2, p: 2, border: `1px solid ${theme.palette.divider}`, borderRadius: 2 }}>
          <input
            type="color"
            value={color}
            onChange={(e) => handleColorChange(e.target.value, type)}
            style={{ width: '100%', height: '40px', border: 'none', borderRadius: '4px' }}
          />
        </Box>
      )}
    </Box>
  );

  const currentPage = getCurrentPage();

  return (
    <div className="templates-container">
      <Navigation 
        currentPage={currentPage} 
        onAuthModalOpen={() => setShowAuthModal(true)}
      />

      <div className="container">
        <section className="hero">
          <h1>Template Builder</h1>
          <p>Create custom templates for your crew images</p>
        </section>

        <Grid container spacing={4} sx={{ maxWidth: 1400, mx: 'auto' }}>
        {/* Configuration Panel */}
        <Grid item xs={12} lg={8}>
          <Card>
            <CardContent sx={{ p: 4 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
                <Avatar sx={{ bgcolor: '#2ecc71', width: 56, height: 56 }}>
                  <MdPalette size={28} />
                </Avatar>
                <Box>
                  <Typography variant="h5" sx={{ fontWeight: 600 }}>
                    Design Your Template
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Customize every aspect of your crew image template
                  </Typography>
                </Box>
              </Box>

              {/* Template Name */}
              <Box sx={{ mb: 4 }}>
                <TextField
                  label="Template Name"
                  value={templateName}
                  onChange={(e) => setTemplateName(e.target.value)}
                  fullWidth
                  placeholder="e.g., My Club Style 2024"
                  required
                />
              </Box>

              {/* Preset Templates */}
              <Accordion defaultExpanded>
                <AccordionSummary expandIcon={<MdExpandMore />}>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Start with a Preset
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Grid container spacing={2}>
                    {presetTemplates.map((preset) => (
                      <Grid item xs={12} sm={4} key={preset.id}>
                        <Card 
                          sx={{ 
                            cursor: 'pointer',
                            border: selectedPreset === preset.id 
                              ? `2px solid ${theme.palette.primary.main}` 
                              : `1px solid ${theme.palette.divider}`,
                            '&:hover': { borderColor: theme.palette.primary.main }
                          }}
                          onClick={() => handlePresetSelect(preset.id)}
                        >
                          <CardContent sx={{ textAlign: 'center', p: 2 }}>
                            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                              {preset.name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {preset.description}
                            </Typography>
                            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 0.5, mt: 1 }}>
                              <Box 
                                sx={{ 
                                  width: 16, 
                                  height: 16, 
                                  borderRadius: '50%', 
                                  bgcolor: preset.config.colors.primary 
                                }} 
                              />
                              <Box 
                                sx={{ 
                                  width: 16, 
                                  height: 16, 
                                  borderRadius: '50%', 
                                  bgcolor: preset.config.colors.secondary 
                                }} 
                              />
                            </Box>
                          </CardContent>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                </AccordionDetails>
              </Accordion>

              {/* Background Style */}
              <Accordion>
                <AccordionSummary expandIcon={<MdExpandMore />}>
                  <Typography variant="h6" sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <MdImage size={20} />
                    Background Style
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Grid container spacing={2}>
                    {backgroundOptions.map((option) => (
                      <Grid item xs={12} sm={6} key={option.value}>
                        <Card 
                          sx={{ 
                            cursor: 'pointer',
                            border: config.background === option.value 
                              ? `2px solid ${theme.palette.primary.main}` 
                              : `1px solid ${theme.palette.divider}`,
                            '&:hover': { borderColor: theme.palette.primary.main }
                          }}
                          onClick={() => handleConfigChange('background', option.value)}
                        >
                          <CardContent sx={{ p: 2 }}>
                            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5 }}>
                              {option.label}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {option.description}
                            </Typography>
                          </CardContent>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                </AccordionDetails>
              </Accordion>

              {/* Colors */}
              <Accordion>
                <AccordionSummary expandIcon={<MdExpandMore />}>
                  <Typography variant="h6" sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <MdColorLens size={20} />
                    Colors
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Grid container spacing={3}>
                    <Grid item xs={12} sm={6}>
                      <ColorPickerButton 
                        color={config.colors.primary} 
                        type="primary" 
                        label="Primary Color" 
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <ColorPickerButton 
                        color={config.colors.secondary} 
                        type="secondary" 
                        label="Secondary Color" 
                      />
                    </Grid>
                  </Grid>
                </AccordionDetails>
              </Accordion>

              {/* Layout Options */}
              <Accordion>
                <AccordionSummary expandIcon={<MdExpandMore />}>
                  <Typography variant="h6" sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <MdTextFields size={20} />
                    Layout & Text
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Grid container spacing={3}>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
                        Name Display Style
                      </Typography>
                      <TextField
                        select
                        fullWidth
                        value={config.nameDisplay}
                        onChange={(e) => handleConfigChange('nameDisplay', e.target.value)}
                      >
                        {nameDisplayOptions.map((option) => (
                          <MenuItem key={option.value} value={option.value}>
                            <Box>
                              <Typography variant="body2">{option.label}</Typography>
                              <Typography variant="caption" color="text.secondary">
                                {option.description}
                              </Typography>
                            </Box>
                          </MenuItem>
                        ))}
                      </TextField>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
                        Boat Style
                      </Typography>
                      <TextField
                        select
                        fullWidth
                        value={config.boatStyle}
                        onChange={(e) => handleConfigChange('boatStyle', e.target.value)}
                      >
                        {boatStyleOptions.map((option) => (
                          <MenuItem key={option.value} value={option.value}>
                            <Box>
                              <Typography variant="body2">{option.label}</Typography>
                              <Typography variant="caption" color="text.secondary">
                                {option.description}
                              </Typography>
                            </Box>
                          </MenuItem>
                        ))}
                      </TextField>
                    </Grid>
                  </Grid>
                </AccordionDetails>
              </Accordion>

              {error && (
                <Alert severity="error" sx={{ mt: 3 }}>
                  {error}
                </Alert>
              )}

              {/* Save Button */}
              <Box sx={{ display: 'flex', gap: 2, mt: 4 }}>
                <Button
                  variant="contained"
                  size="large"
                  startIcon={<MdSave />}
                  onClick={handleSave}
                  disabled={!templateName.trim() || saving}
                  sx={{ flex: 1 }}
                >
                  {saving ? 'Saving...' : 'Save Template'}
                </Button>
                <Button
                  variant="outlined"
                  size="large"
                  onClick={() => navigate('/templates')}
                >
                  Cancel
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Live Preview */}
        <Grid item xs={12} lg={4}>
          <Box sx={{ position: 'sticky', top: 24 }}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                  <MdVisibility size={20} />
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Live Preview
                  </Typography>
                </Box>

                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    Preview Boat Type
                  </Typography>
                  <TextField
                    select
                    size="small"
                    value={previewBoatType}
                    onChange={(e) => setPreviewBoatType(e.target.value)}
                    sx={{ minWidth: 120 }}
                  >
                    <MenuItem value="8+">Eight (8+)</MenuItem>
                    <MenuItem value="4+">Coxed Four (4+)</MenuItem>
                    <MenuItem value="4-">Coxless Four (4-)</MenuItem>
                    <MenuItem value="2x">Double Sculls (2x)</MenuItem>
                    <MenuItem value="2-">Pair (2-)</MenuItem>
                    <MenuItem value="1x">Single (1x)</MenuItem>
                  </TextField>
                </Box>

                <TemplatePreview
                  templateConfig={config}
                  selectedBoatType={previewBoatType}
                  width={280}
                  height={350}
                  mode="template-builder"
                />

                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 2 }}>
                  Preview updates automatically as you make changes
                </Typography>
              </CardContent>
            </Card>
          </Box>
        </Grid>
      </Grid>
      </div>
      
      <AuthModal 
        open={showAuthModal} 
        onClose={() => setShowAuthModal(false)}
      />
    </div>
  );
};

export default NewTemplateBuilderPage;