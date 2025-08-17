import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Alert,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useLocation, useNavigate } from 'react-router-dom';
import { MdImage } from 'react-icons/md';
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
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { trackEvent } = useAnalytics();
  const { showSuccess, showError } = useNotification();

  const [selectedCrewIds, setSelectedCrewIds] = useState<string[]>([]);
  const [selectedCrews, setSelectedCrews] = useState<Array<{ id: string; [key: string]: unknown }>>([]);
  const [error, setError] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<SavedTemplate | null>(null);
  const [savedTemplates, setSavedTemplates] = useState<SavedTemplate[]>([]);
  const [previewCrewIndex, setPreviewCrewIndex] = useState(0);
  const [allCrews, setAllCrews] = useState<Array<{ id: string; [key: string]: unknown }>>([]);
  const [crewsLoading, setCrewsLoading] = useState(false);
  const [selectedCrewIdsSet, setSelectedCrewIdsSet] = useState<Set<string>>(new Set());

  useEffect(() => {
    const state = location.state as { selectedCrewIds?: string[] } | null;
    if (state?.selectedCrewIds) {
      setSelectedCrewIds(state.selectedCrewIds);
    } else if (state?.selectedCrewIndex !== undefined) {
      loadCrews().then((crews) => {
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

  useEffect(() => {
    if (selectedCrews.length > 0) {
      setPreviewCrewIndex(Math.min(previewCrewIndex, selectedCrews.length - 1));
    }
  }, [selectedCrews]);

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

  const handleCrewSelection = (crew: { id: string; [key: string]: unknown }) => {
    const crewIdStr = crew.id.toString();
    const newSelectedSet = new Set(selectedCrewIdsSet);

    if (newSelectedSet.has(crewIdStr)) {
      newSelectedSet.delete(crewIdStr);
    } else {
      newSelectedSet.add(crewIdStr);
    }

    setSelectedCrewIdsSet(newSelectedSet);
    const newSelectedIds = Array.from(newSelectedSet);
    setSelectedCrewIds(newSelectedIds);

    if (!selectedCrewIdsSet.has(crewIdStr) && newSelectedSet.has(crewIdStr)) {
      const currentSelectedCrews = allCrews.filter((c) => newSelectedIds.includes(c.id.toString()));
      const newCrewIndex = currentSelectedCrews.findIndex((c) => c.id.toString() === crewIdStr);
      if (newCrewIndex !== -1) {
        setPreviewCrewIndex(newCrewIndex);
      }
    }
  };

  useEffect(() => {
    loadSavedTemplates();

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'savedTemplates') {
        loadSavedTemplates();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const loadSavedTemplates = () => {
    try {
      const savedTemplatesData = localStorage.getItem('savedTemplates');
      if (savedTemplatesData) {
        const templates = JSON.parse(savedTemplatesData) as SavedTemplate[];
        setSavedTemplates(templates);
        if (templates.length > 0 && !selectedTemplate) {
          setSelectedTemplate(templates[0]);
        }
        if (selectedTemplate && !templates.find((t) => t.id === selectedTemplate.id)) {
          setSelectedTemplate(templates.length > 0 ? templates[0] : null);
        }
      } else {
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
      const crews = result.data || result;

      if (crews && Array.isArray(crews)) {
        const selected = crews.filter((crew) => {
          const crewIdStr = crew.id?.toString();
          const isSelected =
            selectedCrewIds.includes(crewIdStr) || selectedCrewIds.includes(crew.id);
          return isSelected;
        });
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
          let clubIconForApi = undefined;
          if (selectedTemplate.clubIcon) {
            if (selectedTemplate.clubIcon.type === 'preset') {
              clubIconForApi = {
                type: 'preset',
                filename: selectedTemplate.clubIcon.filename,
              };
            } else if (selectedTemplate.clubIcon.type === 'upload') {
              clubIconForApi = {
                type: 'upload',
                base64: selectedTemplate.clubIcon.base64,
                filename: selectedTemplate.clubIcon.filename,
              };
            }
          }

          const response = await fetch(
            `${import.meta.env.VITE_API_URL}/api/crews/generate-custom-image`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${localStorage.getItem('sessionId')}`,
              },
              body: JSON.stringify({
                crewId: crew.id,
                templateConfig: selectedTemplate.config,
                clubIcon: clubIconForApi,
                imageName: `${crew.name}_${crew.boatType.value}_${Date.now()}.png`,
              }),
            },
          );

          if (response.ok) {
            successCount++;
            trackEvent('image_generated', {
              template: selectedTemplate.id,
              crewName: crew.boatName,
              raceName: crew.raceName,
              boatClass: crew.boatClass,
            });
          }
        } catch (error) {
          console.error(`Failed to generate image for crew ${crew.id}:`, error);
        }
      }

      if (successCount > 0) {
        showSuccess(
          `Successfully generated ${successCount} image${successCount > 1 ? 's' : ''} for your crew${successCount > 1 ? 's' : ''}!`,
        );
        navigate('/gallery');
      } else {
        showError('Failed to generate any images. Please try again.');
      }
    } catch {
      showError('Failed to generate images');
    } finally {
      setGenerating(false);
    }
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
        <LoginPrompt message="Sign in to generate crew images" actionText="Generate Images" />
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
                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
                    gap: 1,
                    maxHeight: 300,
                    overflowY: 'auto',
                  }}
                >
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
                            borderColor: theme.palette.primary.light,
                          },
                        }}
                        onClick={() => handleCrewSelection(crew)}
                      >
                        <Typography
                          variant="caption"
                          sx={{
                            fontWeight: 600,
                            mb: 0.5,
                            fontSize: '0.7rem',
                            lineHeight: 1.1,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                          }}
                        >
                          {crew.name}
                        </Typography>
                        <Typography
                          variant="caption"
                          sx={{
                            color: theme.palette.text.secondary,
                            fontSize: '0.65rem',
                            mb: 0.5,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            width: '100%',
                          }}
                        >
                          {crew.raceName}
                        </Typography>
                        <Typography
                          variant="caption"
                          sx={{
                            color: theme.palette.text.secondary,
                            fontSize: '0.65rem',
                            mb: 0.5,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            width: '100%',
                          }}
                        >
                          {crew.clubName || crew.boatClub}
                        </Typography>
                        <Chip
                          label={crew.boatType.value}
                          size="small"
                          sx={{
                            height: 16,
                            fontSize: '0.6rem',
                            backgroundColor: isSelected
                              ? theme.palette.primary.main
                              : theme.palette.grey[800],
                            color: 'white',
                            border: 'none',
                            '& .MuiChip-label': {
                              px: 0.5,
                            },
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
                              justifyContent: 'center',
                            }}
                          >
                            <Typography
                              sx={{ color: 'white', fontSize: '0.6rem', fontWeight: 'bold' }}
                            >
                              ✓
                            </Typography>
                          </Box>
                        )}
                      </Box>
                    );
                  })}
                </Box>
              ) : (
                <Box
                  sx={{
                    p: 4,
                    textAlign: 'center',
                    backgroundColor: theme.palette.action.hover,
                    borderRadius: 2,
                  }}
                >
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

          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                Choose Template ({savedTemplates.length})
              </Typography>

              {savedTemplates.length > 0 ? (
                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
                    gap: 1.5,
                  }}
                >
                  {savedTemplates.map((template) => (
                    <Card
                      key={template.id}
                      variant="outlined"
                      sx={{
                        cursor: 'pointer',
                        border:
                          selectedTemplate?.id === template.id
                            ? `2px solid ${theme.palette.primary.main}`
                            : `1px solid ${theme.palette.divider}`,
                        transition: 'all 0.2s ease',
                        '&:hover': {
                          transform: 'translateY(-1px)',
                          boxShadow: theme.shadows[2],
                        },
                      }}
                      onClick={() => {
                        setSelectedTemplate(template);
                      }}
                    >
                      <CardContent sx={{ p: 1.5, textAlign: 'center' }}>
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
                            position: 'relative',
                          }}
                        >
                          <MdImage size={24} color="white" style={{ opacity: 0.8 }} />
                        </Box>

                        <Typography
                          variant="body2"
                          sx={{ fontWeight: 600, mb: 0.5, fontSize: '0.8rem' }}
                        >
                          {template.name}
                        </Typography>
                        <Typography
                          variant="caption"
                          sx={{ color: theme.palette.text.secondary, fontSize: '0.7rem' }}
                        >
                          Created {new Date(template.createdAt).toLocaleDateString()}
                        </Typography>
                      </CardContent>
                    </Card>
                  ))}
                </Box>
              ) : (
                <Box
                  sx={{
                    p: 4,
                    textAlign: 'center',
                    backgroundColor: theme.palette.action.hover,
                    borderRadius: 2,
                  }}
                >
                  <MdImage
                    size={48}
                    color={theme.palette.text.secondary}
                    style={{ marginBottom: 16 }}
                  />
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

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <Card sx={{ position: 'sticky', top: 20 }}>
            <CardContent>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  mb: 2,
                }}
              >
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Preview
                </Typography>
                {selectedCrews.length > 1 && (
                  <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                    {previewCrewIndex + 1} of {selectedCrews.length}
                  </Typography>
                )}
              </Box>

              {selectedTemplate &&
              selectedCrewIds.length > 0 &&
              selectedCrews.length > 0 &&
              selectedCrews[previewCrewIndex] ? (
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <TemplatePreview
                    templateConfig={selectedTemplate.config}
                    crewData={{
                      name: selectedCrews[previewCrewIndex].name,
                      clubName:
                        selectedCrews[previewCrewIndex].clubName ||
                        selectedCrews[previewCrewIndex].boatClub,
                      raceName: selectedCrews[previewCrewIndex].raceName,
                      boatType: selectedCrews[previewCrewIndex].boatType,
                      crewNames:
                        selectedCrews[previewCrewIndex].crewNames ||
                        selectedCrews[previewCrewIndex].crewMembers?.map(
                          (member: { name: string }) => member.name,
                        ) ||
                        [],
                      coachName: selectedCrews[previewCrewIndex].coachName,
                    }}
                    clubIcon={
                      selectedTemplate.clubIcon
                        ? {
                            type: selectedTemplate.clubIcon.type,
                            filename: selectedTemplate.clubIcon.filename,
                            base64: selectedTemplate.clubIcon.base64,
                          }
                        : undefined
                    }
                    width={420}
                    height={525}
                    debounceMs={300}
                    showGenerateButton={true}
                    onGenerate={handleGenerateImages}
                    generating={generating}
                    selectedCrewCount={selectedCrewIds.length}
                    showCyclingControls={selectedCrews.length > 1}
                    currentIndex={previewCrewIndex}
                    totalCount={selectedCrews.length}
                    onPrevious={() =>
                      setPreviewCrewIndex(
                        (prev) => (prev - 1 + selectedCrews.length) % selectedCrews.length,
                      )
                    }
                    onNext={() => setPreviewCrewIndex((prev) => (prev + 1) % selectedCrews.length)}
                    onIndexSelect={setPreviewCrewIndex}
                  />
                </Box>
              ) : (
                <Box
                  sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}
                >
                  <Box
                    sx={{
                      p: 3,
                      backgroundColor: theme.palette.background.paper,
                      borderRadius: 2,
                      border: `1px solid ${theme.palette.divider}`,
                      width: '100%',
                      maxWidth: 400,
                      textAlign: 'center',
                    }}
                  >
                    <MdImage
                      size={48}
                      color={theme.palette.text.secondary}
                      style={{ marginBottom: 16 }}
                    />
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
    </Box>
  );
};

export default GenerateImagesPage;
