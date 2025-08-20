import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  TextField,
  FormControl,
  Select,
  MenuItem,
  Avatar,
  Alert,
  CircularProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
  InputLabel,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import { 
  MdPalette,
  MdSave,
  MdVisibility,
  MdImage,
  MdTextFields,
  MdExpandMore,
  MdColorLens,
  MdSettings
} from 'react-icons/md';
import DashboardLayout from '../components/Layout/DashboardLayout';
import LoginPrompt from '../components/Auth/LoginPrompt';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';

interface TemplateConfig {
  background: string;
  nameDisplay: string;
  boatStyle: string;
  textLayout: string;
  logo: string;
  dimensions: { width: number; height: number };
  colors: { primary: string; secondary: string };
}

const TemplateCustomiserPage: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showSuccess, showError } = useNotification();

  const [templateName, setTemplateName] = useState('');
  const [config, setConfig] = useState<TemplateConfig>({
    background: 'water',
    nameDisplay: 'overlay',
    boatStyle: 'modern',
    textLayout: 'centered',
    logo: 'top-left',
    dimensions: { width: 1080, height: 1080 },
    colors: { primary: '#4a90e2', secondary: '#2ecc71' }
  });
  const [saving, setSaving] = useState(false);

  const backgroundOptions = [
    { value: 'water', label: 'Water Scene', description: 'Beautiful water background' },
    { value: 'sunrise', label: 'Sunrise', description: 'Golden hour water scene' },
    { value: 'solid', label: 'Solid Color', description: 'Clean solid background' },
    { value: 'gradient', label: 'Gradient', description: 'Modern gradient background' },
  ];

  const nameDisplayOptions = [
    { value: 'overlay', label: 'Overlay', description: 'Names overlaid on image' },
    { value: 'sidebar', label: 'Sidebar', description: 'Names in a side panel' },
    { value: 'bottom', label: 'Bottom Bar', description: 'Names at the bottom' },
  ];

  const boatStyleOptions = [
    { value: 'modern', label: 'Modern', description: 'Clean, modern boat design' },
    { value: 'classic', label: 'Classic', description: 'Traditional rowing boat' },
    { value: 'silhouette', label: 'Silhouette', description: 'Simple boat outline' },
  ];

  const textLayoutOptions = [
    { value: 'centered', label: 'Centered', description: 'Center-aligned text' },
    { value: 'left', label: 'Left Aligned', description: 'Left-aligned text' },
    { value: 'justified', label: 'Justified', description: 'Justified text layout' },
  ];

  const logoPositionOptions = [
    { value: 'top-left', label: 'Top Left', description: 'Logo in top left corner' },
    { value: 'top-right', label: 'Top Right', description: 'Logo in top right corner' },
    { value: 'center', label: 'Center', description: 'Logo in center' },
    { value: 'bottom', label: 'Bottom', description: 'Logo at bottom' },
  ];

  const handleSaveTemplate = async () => {
    if (!templateName.trim()) {
      showError('Please enter a template name');
      return;
    }

    try {
      setSaving(true);
      // Mock save for now
      showSuccess('Template saved successfully!');
      navigate('/generate');
    } catch (error) {
      showError('Failed to save template');
    } finally {
      setSaving(false);
    }
  };

  const handleColorChange = (colorType: 'primary' | 'secondary', color: string) => {
    setConfig(prev => ({
      ...prev,
      colors: {
        ...prev.colors,
        [colorType]: color
      }
    }));
  };

  if (!user) {
    return (
      <DashboardLayout title="Template Builder" subtitle="Create custom image templates">
        <LoginPrompt 
          message="Sign in to create and save templates" 
          actionText="Create Templates"
        />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout 
      title="Template Builder" 
      subtitle="Create and customize your image templates"
    >
      <Box sx={{ maxWidth: 1400, mx: 'auto' }}>
        <Grid container spacing={4}>
          {/* Configuration Panel */}
          <Grid item xs={12} lg={8}>
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Avatar sx={{ bgcolor: theme.palette.primary.main, width: 32, height: 32 }}>
                    <MdSettings size={20} />
                  </Avatar>
                  Template Configuration
                </Typography>

                {/* Template Name */}
                <Box sx={{ mb: 3 }}>
                  <TextField
                    fullWidth
                    label="Template Name"
                    value={templateName}
                    onChange={(e) => setTemplateName(e.target.value)}
                    placeholder="e.g., Modern Water Template"
                    required
                  />
                </Box>

                {/* Configuration Sections */}
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {/* Background */}
                  <Accordion defaultExpanded>
                    <AccordionSummary expandIcon={<MdExpandMore />}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <MdImage />
                        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>Background Style</Typography>
                      </Box>
                    </AccordionSummary>
                    <AccordionDetails>
                      <FormControl fullWidth>
                        <InputLabel>Background Type</InputLabel>
                        <Select
                          value={config.background}
                          label="Background Type"
                          onChange={(e) => setConfig(prev => ({ ...prev, background: e.target.value }))}
                        >
                          {backgroundOptions.map(option => (
                            <MenuItem key={option.value} value={option.value}>
                              <Box>
                                <Typography variant="body1">{option.label}</Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {option.description}
                                </Typography>
                              </Box>
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </AccordionDetails>
                  </Accordion>

                  {/* Name Display */}
                  <Accordion>
                    <AccordionSummary expandIcon={<MdExpandMore />}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <MdTextFields />
                        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>Name Display</Typography>
                      </Box>
                    </AccordionSummary>
                    <AccordionDetails>
                      <FormControl fullWidth>
                        <InputLabel>Display Style</InputLabel>
                        <Select
                          value={config.nameDisplay}
                          label="Display Style"
                          onChange={(e) => setConfig(prev => ({ ...prev, nameDisplay: e.target.value }))}
                        >
                          {nameDisplayOptions.map(option => (
                            <MenuItem key={option.value} value={option.value}>
                              <Box>
                                <Typography variant="body1">{option.label}</Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {option.description}
                                </Typography>
                              </Box>
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </AccordionDetails>
                  </Accordion>

                  {/* Colors */}
                  <Accordion>
                    <AccordionSummary expandIcon={<MdExpandMore />}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <MdColorLens />
                        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>Colors</Typography>
                      </Box>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Grid container spacing={3}>
                        <Grid item xs={12} sm={6}>
                          <Typography variant="subtitle2" sx={{ mb: 1 }}>Primary Color</Typography>
                          <input
                            type="color"
                            value={config.colors.primary}
                            onChange={(e) => handleColorChange('primary', e.target.value)}
                            style={{ width: '100%', height: '40px', border: 'none', borderRadius: '4px' }}
                          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <Typography variant="subtitle2" sx={{ mb: 1 }}>Secondary Color</Typography>
                          <input
                            type="color"
                            value={config.colors.secondary}
                            onChange={(e) => handleColorChange('secondary', e.target.value)}
                            style={{ width: '100%', height: '40px', border: 'none', borderRadius: '4px' }}
                          />
                        </Grid>
                      </Grid>
                    </AccordionDetails>
                  </Accordion>

                  {/* Advanced Settings */}
                  <Accordion>
                    <AccordionSummary expandIcon={<MdExpandMore />}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <MdSettings />
                        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>Advanced Settings</Typography>
                      </Box>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Grid container spacing={3}>
                        <Grid item xs={12} sm={4}>
                          <FormControl fullWidth>
                            <InputLabel>Boat Style</InputLabel>
                            <Select
                              value={config.boatStyle}
                              label="Boat Style"
                              onChange={(e) => setConfig(prev => ({ ...prev, boatStyle: e.target.value }))}
                            >
                              {boatStyleOptions.map(option => (
                                <MenuItem key={option.value} value={option.value}>
                                  {option.label}
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={4}>
                          <FormControl fullWidth>
                            <InputLabel>Text Layout</InputLabel>
                            <Select
                              value={config.textLayout}
                              label="Text Layout"
                              onChange={(e) => setConfig(prev => ({ ...prev, textLayout: e.target.value }))}
                            >
                              {textLayoutOptions.map(option => (
                                <MenuItem key={option.value} value={option.value}>
                                  {option.label}
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={4}>
                          <FormControl fullWidth>
                            <InputLabel>Logo Position</InputLabel>
                            <Select
                              value={config.logo}
                              label="Logo Position"
                              onChange={(e) => setConfig(prev => ({ ...prev, logo: e.target.value }))}
                            >
                              {logoPositionOptions.map(option => (
                                <MenuItem key={option.value} value={option.value}>
                                  {option.label}
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        </Grid>
                      </Grid>
                    </AccordionDetails>
                  </Accordion>
                </Box>

                {/* Action Buttons */}
                <Box sx={{ mt: 4, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                  <Button
                    variant="contained"
                    size="large"
                    startIcon={saving ? <CircularProgress size={20} color="inherit" /> : <MdSave />}
                    onClick={handleSaveTemplate}
                    disabled={saving || !templateName.trim()}
                    sx={{ px: 4 }}
                  >
                    {saving ? 'Saving...' : 'Save Template'}
                  </Button>
                  
                  <Button
                    variant="outlined"
                    size="large"
                    startIcon={<MdVisibility />}
                    onClick={() => navigate('/generate')}
                    sx={{ px: 4 }}
                  >
                    Preview & Generate
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Live Preview */}
          <Grid item xs={12} lg={4}>
            <Card sx={{ position: 'sticky', top: 20 }}>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Avatar sx={{ bgcolor: theme.palette.secondary.main, width: 32, height: 32 }}>
                    <MdVisibility size={20} />
                  </Avatar>
                  Live Preview
                </Typography>
                
                <Alert severity="info" sx={{ mb: 2 }}>
                  This is a simplified preview. Full preview available when generating images.
                </Alert>

                <Box 
                  sx={{ 
                    width: '100%',
                    aspectRatio: '1',
                    background: `linear-gradient(135deg, ${config.colors.primary}, ${config.colors.secondary})`,
                    borderRadius: 2,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    p: 2,
                    position: 'relative'
                  }}
                >
                  {/* Sample Content */}
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                    {templateName || 'Template Preview'}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9, mb: 2 }}>
                    {config.background} • {config.nameDisplay}
                  </Typography>
                  
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', justifyContent: 'center' }}>
                    <Chip label={config.boatStyle} size="small" sx={{ bgcolor: 'rgba(255,255,255,0.2)' }} />
                    <Chip label={config.textLayout} size="small" sx={{ bgcolor: 'rgba(255,255,255,0.2)' }} />
                  </Box>
                  
                  {config.logo && (
                    <Box 
                      sx={{ 
                        position: 'absolute',
                        ...(config.logo === 'top-left' && { top: 16, left: 16 }),
                        ...(config.logo === 'top-right' && { top: 16, right: 16 }),
                        ...(config.logo === 'bottom' && { bottom: 16, left: '50%', transform: 'translateX(-50%)' }),
                        ...(config.logo === 'center' && { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }),
                      }}
                    >
                      <Box 
                        sx={{ 
                          width: 24, 
                          height: 24, 
                          borderRadius: '50%', 
                          bgcolor: 'rgba(255,255,255,0.3)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        <MdPalette size={16} />
                      </Box>
                    </Box>
                  )}
                </Box>

                <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block' }}>
                  Dimensions: {config.dimensions.width} × {config.dimensions.height}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </DashboardLayout>
  );
};

export default TemplateCustomiserPage;