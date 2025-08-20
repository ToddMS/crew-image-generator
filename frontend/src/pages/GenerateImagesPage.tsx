import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  Avatar,
  Alert,
  CircularProgress,
  Chip,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import { 
  MdImage, 
  MdVisibility,
  MdSettings,
  MdAdd
} from 'react-icons/md';
import DashboardLayout from '../components/Layout/DashboardLayout';
import LoginPrompt from '../components/Auth/LoginPrompt';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { ApiService } from '../services/api.service';
import { Crew } from '../types/crew.types';

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
  clubIcon?: {
    type: 'upload' | 'preset';
    filename?: string;
    base64?: string;
  };
  previewUrl?: string;
  createdAt: string;
}

const GenerateImagesPage: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showSuccess, showError } = useNotification();

  const [crews, setCrews] = useState<Crew[]>([]);
  const [templates, setTemplates] = useState<SavedTemplate[]>([]);
  const [selectedCrew, setSelectedCrew] = useState<Crew | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<SavedTemplate | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    if (user) {
      loadData();
    } else {
      setLoading(false);
    }
  }, [user]);

  const loadData = async () => {
    try {
      const crewsResponse = await ApiService.getCrews();
      
      if (crewsResponse.error) {
        showError(crewsResponse.error);
      } else {
        setCrews(crewsResponse.data || []);
      }
      
      // Mock templates for now
      setTemplates([]);
    } catch (error) {
      showError('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateImage = async () => {
    if (!selectedCrew || !selectedTemplate) return;

    try {
      setGenerating(true);
      // Mock generation for now
      showSuccess('Image generated successfully!');
      navigate('/gallery');
    } catch (error) {
      showError('Failed to generate image');
    } finally {
      setGenerating(false);
    }
  };

  if (!user) {
    return (
      <DashboardLayout title="Generate Images" subtitle="Create beautiful crew images">
        <LoginPrompt 
          message="Sign in to generate crew images" 
          actionText="Generate Images"
        />
      </DashboardLayout>
    );
  }

  if (loading) {
    return (
      <DashboardLayout title="Generate Images" subtitle="Create beautiful crew images">
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout 
      title="Generate Images" 
      subtitle="Create beautiful crew images with your custom templates"
    >
      <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
        {/* Quick Actions */}
        <Box sx={{ mb: 4 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<MdAdd />}
                onClick={() => navigate('/crews/create')}
                sx={{ py: 1.5 }}
              >
                Create New Crew
              </Button>
            </Grid>
            <Grid item xs={12} md={6}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<MdSettings />}
                onClick={() => navigate('/templates/create')}
                sx={{ py: 1.5 }}
              >
                Create New Template
              </Button>
            </Grid>
          </Grid>
        </Box>

        <Grid container spacing={4}>
          {/* Crew Selection */}
          <Grid item xs={12} lg={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Avatar sx={{ bgcolor: theme.palette.primary.main, width: 32, height: 32 }}>
                    <MdImage size={20} />
                  </Avatar>
                  Select Crew ({crews.length})
                </Typography>
                
                {crews.length === 0 ? (
                  <Alert severity="info" sx={{ mb: 2 }}>
                    No crews found. <Button onClick={() => navigate('/crews/create')}>Create your first crew</Button>
                  </Alert>
                ) : (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, maxHeight: 400, overflowY: 'auto' }}>
                    {crews.map((crew) => (
                      <Card
                        key={crew.id}
                        sx={{
                          cursor: 'pointer',
                          border: selectedCrew?.id === crew.id ? 2 : 1,
                          borderColor: selectedCrew?.id === crew.id ? theme.palette.primary.main : theme.palette.divider,
                          transition: 'all 0.2s ease-in-out',
                          '&:hover': {
                            transform: 'translateY(-1px)',
                            boxShadow: theme.shadows[4],
                          }
                        }}
                        onClick={() => setSelectedCrew(crew)}
                      >
                        <CardContent sx={{ py: 2 }}>
                          <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 0.5 }}>
                            {crew.name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                            {crew.clubName} • {crew.raceName}
                          </Typography>
                          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                            <Chip 
                              label={crew.boatType.name} 
                              size="small" 
                              color="primary" 
                              variant="outlined"
                            />
                            <Chip 
                              label={`${crew.crewNames.length} members`} 
                              size="small" 
                              variant="outlined"
                            />
                          </Box>
                        </CardContent>
                      </Card>
                    ))}
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Template Selection */}
          <Grid item xs={12} lg={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Avatar sx={{ bgcolor: theme.palette.secondary.main, width: 32, height: 32 }}>
                    <MdSettings size={20} />
                  </Avatar>
                  Select Template ({templates.length})
                </Typography>
                
                {templates.length === 0 ? (
                  <Alert severity="info" sx={{ mb: 2 }}>
                    No templates found. <Button onClick={() => navigate('/templates/create')}>Create your first template</Button>
                  </Alert>
                ) : (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, maxHeight: 400, overflowY: 'auto' }}>
                    {templates.map((template) => (
                      <Card
                        key={template.id}
                        sx={{
                          cursor: 'pointer',
                          border: selectedTemplate?.id === template.id ? 2 : 1,
                          borderColor: selectedTemplate?.id === template.id ? theme.palette.secondary.main : theme.palette.divider,
                          transition: 'all 0.2s ease-in-out',
                          '&:hover': {
                            transform: 'translateY(-1px)',
                            boxShadow: theme.shadows[4],
                          }
                        }}
                        onClick={() => setSelectedTemplate(template)}
                      >
                        <CardContent sx={{ py: 2 }}>
                          <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                            {template.name}
                          </Typography>
                          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                            <Chip 
                              label={template.config.background} 
                              size="small" 
                              variant="outlined"
                            />
                            <Chip 
                              label={template.config.nameDisplay} 
                              size="small" 
                              variant="outlined"
                            />
                          </Box>
                          {template.previewUrl && (
                            <Box sx={{ mt: 1, textAlign: 'center' }}>
                              <img 
                                src={template.previewUrl} 
                                alt={template.name}
                                style={{ maxWidth: '100%', height: '60px', objectFit: 'cover', borderRadius: 4 }}
                              />
                            </Box>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Generation Controls */}
        <Box sx={{ mt: 4 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 3 }}>
                Generate Image
              </Typography>
              
              {selectedCrew && selectedTemplate ? (
                <Box>
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    Ready to generate image for <strong>{selectedCrew.name}</strong> using <strong>{selectedTemplate.name}</strong>
                  </Typography>
                  
                  <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                    <Button
                      variant="contained"
                      size="large"
                      startIcon={generating ? <CircularProgress size={20} color="inherit" /> : <MdImage />}
                      onClick={handleGenerateImage}
                      disabled={generating}
                      sx={{ px: 4 }}
                    >
                      {generating ? 'Generating...' : 'Generate Image'}
                    </Button>
                    
                    <Button
                      variant="outlined"
                      size="large"
                      startIcon={<MdVisibility />}
                      onClick={() => navigate('/gallery')}
                      sx={{ px: 4 }}
                    >
                      View Gallery
                    </Button>
                  </Box>
                </Box>
              ) : (
                <Alert severity="info">
                  Select both a crew and a template to generate an image
                </Alert>
              )}
            </CardContent>
          </Card>
        </Box>
      </Box>
    </DashboardLayout>
  );
};

export default GenerateImagesPage;