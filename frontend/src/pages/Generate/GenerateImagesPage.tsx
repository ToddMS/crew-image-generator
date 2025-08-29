import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Navigation from '../../components/Navigation/Navigation';
import AuthModal from '../../components/Auth/AuthModal';
import StepIndicator, { Step } from '../../components/StepIndicator';
import Button from '../../components/Button';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { ApiService } from '../../services/api.service';
import { ClubPreset } from '../../types/club.types';
import './GenerateImages.css';

interface Crew {
  id: string;
  name: string;
  clubName: string;
  raceName: string;
  boatType: {
    seats: number;
    name: string;
    value: string;
  };
  crewNames: string[];
  coachName?: string;
  coxName?: string;
}

interface Template {
  id: string;
  name: string;
  description: string;
  category: string;
  thumbnail?: string;
}

interface GenerationStatus {
  id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  images?: Array<{
    format: string;
    url: string;
    size: string;
  }>;
  error?: string;
}

const GenerateImagesPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { showSuccess, showError } = useNotification();

  // Step management
  const [currentStep, setCurrentStep] = useState(1);
  const [showAuthModal, setShowAuthModal] = useState(false);

  // Data states
  const [crews, setCrews] = useState<Crew[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [clubPresets, setClubPresets] = useState<ClubPreset[]>([]);

  // Selection states
  const [selectedCrews, setSelectedCrews] = useState<Crew[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [selectedPreset, setSelectedPreset] = useState<ClubPreset | null>(null);
  const [selectedFormats, setSelectedFormats] = useState<string[]>(['instagram_post']);

  // Search states
  const [presetSearchQuery, setPresetSearchQuery] = useState('');
  const [crewSearchQuery, setCrewSearchQuery] = useState('');

  // Loading and error states
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [generationStatus, setGenerationStatus] = useState<GenerationStatus | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const getCurrentPage = () => 'generate';

  // Define the steps for the StepIndicator
  const steps: Step[] = [
    { label: 'Select Crew', description: 'Choose your crews' },
    { label: 'Choose Template', description: 'Pick design style' },
    { label: 'Choose Colors', description: 'Select club colors' },
    { label: 'Generate & Download', description: 'Create your images' },
  ];

  // Calculate completed steps based on current step
  const getCompletedSteps = () => {
    const completed = new Set<number>();
    for (let i = 0; i < currentStep - 1; i++) {
      completed.add(i);
    }
    return completed;
  };

  const loadInitialData = useCallback(async () => {
    setLoading(true);

    try {
      const [crewsResponse, templatesResponse, presetsResponse] = await Promise.all([
        ApiService.getCrews(),
        ApiService.getTemplates(),
        ApiService.getClubPresets(),
      ]);

      // Handle crews response
      if (crewsResponse.success && crewsResponse.data) {
        console.log(
          '✅ Crews loaded successfully:',
          crewsResponse.data.map((c) => ({ id: c.id, name: c.name })),
        );
        setCrews(crewsResponse.data);

        // Only auto-select first crew if no selectedCrewIds in location state
        const state = location.state as { selectedCrewIds?: string[] } | null;
        if (!state?.selectedCrewIds && crewsResponse.data.length > 0) {
          console.log('🎯 Auto-selecting first crew:', crewsResponse.data[0].name);
          setSelectedCrews([crewsResponse.data[0]]);
        } else {
          console.log('⏭️ Skipping auto-select, will wait for location state handling');
        }
      } else if (crewsResponse.data && !crewsResponse.success) {
        // Handle case where API returns data but no explicit success flag
        console.log(
          '✅ Crews loaded (no success flag):',
          crewsResponse.data.map((c) => ({ id: c.id, name: c.name })),
        );
        setCrews(crewsResponse.data);

        // Only auto-select first crew if no selectedCrewIds in location state
        const state = location.state as { selectedCrewIds?: string[] } | null;
        if (!state?.selectedCrewIds && crewsResponse.data.length > 0) {
          console.log('🎯 Auto-selecting first crew:', crewsResponse.data[0].name);
          setSelectedCrews([crewsResponse.data[0]]);
        } else {
          console.log('⏭️ Skipping auto-select, will wait for location state handling');
        }
      }

      // Handle templates response
      console.log('🎨 Templates API response:', templatesResponse);
      if (
        templatesResponse.success &&
        templatesResponse.data &&
        templatesResponse.data.length > 0
      ) {
        console.log(
          '✅ Templates loaded successfully:',
          templatesResponse.data.length,
          'templates',
        );
        setTemplates(templatesResponse.data as Template[]);
        // Auto-select first template if available
        console.log('🎯 Auto-selecting first template:', templatesResponse.data[0]);
        setSelectedTemplate(templatesResponse.data[0] as Template);
      } else if (
        templatesResponse.data &&
        !templatesResponse.success &&
        templatesResponse.data.length > 0
      ) {
        console.log(
          '⚠️ Templates loaded (no success flag):',
          templatesResponse.data.length,
          'templates',
        );
        setTemplates(templatesResponse.data as Template[]);
        setSelectedTemplate(templatesResponse.data[0] as Template);
      } else {
        console.log('❌ No templates data received, using mock templates:', templatesResponse);
        // Fallback to mock templates for development - using backend template IDs
        const mockTemplates: Template[] = [
          {
            id: 'classic-lineup',
            name: 'Classic Lineup',
            description: 'Traditional crew layout with clean typography',
            category: 'classic',
          },
          {
            id: 'modern-card',
            name: 'Modern Card',
            description: 'Contemporary design with bold elements',
            category: 'modern',
          },
          {
            id: 'minimal-clean',
            name: 'Minimal Clean',
            description: 'Clean and simple design',
            category: 'minimal',
          },
          {
            id: 'championship-gold',
            name: 'Championship Gold',
            description: 'Premium design for special events',
            category: 'championship',
          },
          {
            id: 'race-day',
            name: 'Race Day',
            description: 'Dynamic race day poster style',
            category: 'event',
          },
          {
            id: 'vintage-classic',
            name: 'Vintage Classic',
            description: 'Classic vintage rowing poster',
            category: 'vintage',
          },
        ];
        setTemplates(mockTemplates);
        setSelectedTemplate(mockTemplates[0]);
      }

      // Handle presets response
      if (presetsResponse.success && presetsResponse.data) {
        setClubPresets(presetsResponse.data);
        // Auto-select default preset or first one
        const defaultPreset = presetsResponse.data.find((p: ClubPreset) => p.is_default);
        const selectedPreset = defaultPreset || presetsResponse.data[0];
        setSelectedPreset(selectedPreset);
      } else if (presetsResponse.data && !presetsResponse.success) {
        setClubPresets(presetsResponse.data);
        const defaultPreset = presetsResponse.data.find((p: ClubPreset) => p.is_default);
        setSelectedPreset(defaultPreset || presetsResponse.data[0]);
      }
    } catch {
      showError('Failed to load data. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [location.state, showError]);

  // Load data on component mount
  useEffect(() => {
    if (user) {
      loadInitialData();
    }
  }, [user, loadInitialData]);

  // Handle selected crews from location state
  useEffect(() => {
    console.log('🔄 Generate Images page useEffect triggered');
    console.log('📍 location.state:', location.state);
    console.log('👥 crews.length:', crews.length);
    console.log(
      '🚣 crews:',
      crews.map((c) => ({ id: c.id, name: c.name })),
    );

    const state = location.state as {
      selectedCrewIds?: string[];
    } | null;

    if (state?.selectedCrewIds && state.selectedCrewIds.length > 0 && crews.length > 0) {
      console.log('✅ Found selectedCrewIds from MyCrews:', state.selectedCrewIds);

      const selectedCrewsFromState = crews.filter((crew) =>
        state.selectedCrewIds!.includes(crew.id),
      );

      console.log(
        '🎯 Filtered crews from state:',
        selectedCrewsFromState.map((c) => ({ id: c.id, name: c.name })),
      );

      if (selectedCrewsFromState.length > 0) {
        console.log(
          '✅ Setting selected crews to:',
          selectedCrewsFromState.map((c) => c.name),
        );
        setSelectedCrews(selectedCrewsFromState);
      }
    } else {
      console.log('⏭️ No selectedCrewIds in location state, keeping auto-selected crews');
    }
  }, [location.state, crews]);

  // Step navigation
  const nextStep = () => {
    if (validateCurrentStep()) {
      setCurrentStep((prev) => Math.min(prev + 1, 4));
      setErrors({});
    }
  };

  const previousStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
    setErrors({});
  };

  const validateCurrentStep = (): boolean => {
    const newErrors: Record<string, string> = {};

    switch (currentStep) {
      case 1:
        if (selectedCrews.length === 0) {
          newErrors.crew = 'Please select at least one crew';
        }
        break;
      case 2:
        if (!selectedTemplate) {
          newErrors.template = 'Please select a template';
        }
        break;
      case 3:
        if (!selectedPreset) {
          newErrors.preset = 'Please select club colors';
        }
        break;
      case 4:
        if (selectedFormats.length === 0) {
          newErrors.formats = 'Please select at least one output format';
        }
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Selection handlers
  const handleCrewToggle = (crew: Crew) => {
    setSelectedCrews((prev) => {
      const isSelected = prev.find((c) => c.id === crew.id);
      if (isSelected) {
        // Remove crew from selection
        return prev.filter((c) => c.id !== crew.id);
      } else {
        // Add crew to selection
        return [...prev, crew];
      }
    });
    setErrors((prev) => ({ ...prev, crew: '' }));
  };

  const handleTemplateSelect = (template: Template) => {
    setSelectedTemplate(template);
    setErrors((prev) => ({ ...prev, template: '' }));
  };

  const handlePresetSelect = (preset: ClubPreset) => {
    setSelectedPreset(preset);
    setErrors((prev) => ({ ...prev, preset: '' }));
  };

  const generateImages = async () => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }

    if (
      !validateCurrentStep() ||
      selectedCrews.length === 0 ||
      !selectedTemplate ||
      !selectedPreset
    ) {
      return;
    }

    setGenerating(true);
    try {
      // Generate images for each selected crew
      const requests = selectedCrews.map((crew) => ({
        crewId: crew.id,
        templateId: selectedTemplate.id,
        colors: {
          primary: selectedPreset.primary_color,
          secondary: selectedPreset.secondary_color,
        },
        formats: selectedFormats,
      }));

      // For now, generate images for the first crew (until backend supports batch generation)
      // TODO: Update when backend supports multiple crew generation
      const response = await ApiService.generateImages(requests[0]);

      if (response.data) {
        setGenerationStatus(response.data);

        // Since we're using immediate generation, no need to poll
        // Just set the final state directly
        if (response.data.status === 'completed') {
          setGenerating(false);
          setCurrentStep(5); // Success step
          showSuccess('Images generated successfully!');
        }
      } else {
        throw new Error(response.error || 'Generation failed');
      }
    } catch {
      showError('Failed to generate images. Please try again.');
      setGenerating(false);
    }
  };

  const resetGenerator = () => {
    setCurrentStep(1);
    setGenerationStatus(null);
    setGenerating(false);
    setErrors({});
    setSelectedFormats(['instagram_post']);
  };

  const handleAuthSuccess = () => {
    setShowAuthModal(false);
    if (user) {
      loadInitialData();
    }
  };

  // Filter crews based on search query
  const getFilteredCrews = () => {
    if (!crewSearchQuery.trim()) return crews;

    const searchTerm = crewSearchQuery.toLowerCase();
    return crews.filter(
      (crew) =>
        crew.name.toLowerCase().includes(searchTerm) ||
        crew.clubName.toLowerCase().includes(searchTerm) ||
        crew.raceName.toLowerCase().includes(searchTerm) ||
        crew.boatType.name.toLowerCase().includes(searchTerm) ||
        (crew.coachName && crew.coachName.toLowerCase().includes(searchTerm)) ||
        (crew.coxName && crew.coxName.toLowerCase().includes(searchTerm)) ||
        crew.crewNames.some((memberName) => memberName.toLowerCase().includes(searchTerm)),
    );
  };

  if (!user) {
    return (
      <div className="generate-container">
        <Navigation currentPage={getCurrentPage()} onAuthModalOpen={() => setShowAuthModal(true)} />
        <div className="container">
          <div className="empty-state">
            <h2>Generate Images</h2>
            <p>Sign in to create professional crew images</p>
            <Button variant="primary" onClick={() => setShowAuthModal(true)}>
              Sign In to Generate Images
            </Button>
          </div>
        </div>

        <AuthModal
          open={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          onSuccess={handleAuthSuccess}
        />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="generate-container">
        <Navigation currentPage={getCurrentPage()} onAuthModalOpen={() => setShowAuthModal(true)} />
        <div className="container">
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <h3>Loading generation tools...</h3>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="generate-container">
      <Navigation currentPage={getCurrentPage()} onAuthModalOpen={() => setShowAuthModal(true)} />

      <div className="container">
        {/* Step Indicator */}
        <StepIndicator
          steps={steps}
          currentStep={currentStep - 1} // Convert from 1-based to 0-based
          completedSteps={getCompletedSteps()}
          className="generate-steps"
        />

        <div className="generate-main">
          {/* Step 1: Select Crew */}
          {currentStep === 1 && (
            <div className="generate-step active">
              <div className="step-content">
                {crews.length > 0 && (
                  <div className="crew-search-container">
                    <input
                      type="text"
                      className="crew-search-input"
                      placeholder="Search crews, clubs, races..."
                      value={crewSearchQuery}
                      onChange={(e) => setCrewSearchQuery(e.target.value)}
                    />
                  </div>
                )}

                {errors.crew && <div className="error-message">{errors.crew}</div>}

                <div className="crew-selection-grid">
                  {getFilteredCrews().length === 0 ? (
                    <div
                      style={{
                        padding: '3rem 2rem',
                        textAlign: 'center',
                        color: 'var(--gray-600)',
                        backgroundColor: 'var(--gray-50)',
                        borderRadius: 'var(--radius-lg)',
                        border: '2px dashed var(--gray-300)',
                        gridColumn: '1 / -1',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        minHeight: '300px',
                      }}
                    >
                      <h3>{crews.length === 0 ? 'No Crews Found' : 'No Matching Crews'}</h3>
                      <p>
                        {crews.length === 0
                          ? "You haven't created any crews yet."
                          : 'Try adjusting your search terms.'}
                      </p>
                      <Button
                        variant="primary"
                        onClick={() => navigate('/crews/create')}
                        style={{ marginTop: '1rem' }}
                      >
                        Create Your First Crew
                      </Button>
                    </div>
                  ) : (
                    getFilteredCrews().map((crew) => {
                      const isSelected = selectedCrews.find((c) => c.id === crew.id);
                      return (
                        <div
                          key={crew.id}
                          className={`crew-selection-card ${isSelected ? 'selected' : ''}`}
                          onClick={() => handleCrewToggle(crew)}
                        >
                          <div className="crew-card-header">
                            <h3>{crew.name}</h3>
                            <div className="selection-checkbox">
                              <input
                                type="checkbox"
                                checked={!!isSelected}
                                onChange={() => handleCrewToggle(crew)}
                                onClick={(e) => e.stopPropagation()}
                              />
                            </div>
                          </div>
                          <div className="crew-card-details">
                            <div className="crew-detail">{crew.clubName}</div>
                            <div className="crew-detail">{crew.boatType.name}</div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                <div className="step-navigation">
                  <Button variant="secondary" disabled>
                    Previous
                  </Button>
                  <Button variant="primary" onClick={nextStep}>
                    Next: Template
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Choose Template */}
          {currentStep === 2 && (
            <div className="generate-step active">
              <div className="step-content">
                <div className="template-colors-wrapper">
                  <div className="template-column">
                    <div className="template-selection-grid">
                      {templates.length === 0 ? (
                        <div
                          style={{
                            padding: '3rem 2rem',
                            textAlign: 'center',
                            color: 'var(--gray-600)',
                            backgroundColor: 'var(--gray-50)',
                            borderRadius: 'var(--radius-lg)',
                            border: '2px dashed var(--gray-300)',
                            gridColumn: '1 / -1',
                          }}
                        >
                          <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>🎨</div>
                          <h3>No Templates Available</h3>
                          <p>Templates are being loaded or there may be a connection issue.</p>
                        </div>
                      ) : (
                        templates.map((template) => (
                          <div
                            key={template.id}
                            className={`template-selection-card ${selectedTemplate?.id === template.id ? 'selected' : ''}`}
                            onClick={() => handleTemplateSelect(template)}
                          >
                            <div className="template-preview">
                              <div>{template.name}</div>
                            </div>
                            <div className="template-info">
                              <div className="template-name">{template.name}</div>
                              <div className="template-desc">{template.description}</div>
                              <div className="selection-radio">
                                <div className="radio-dot"></div>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>

                <div className="step-navigation">
                  <Button variant="secondary" onClick={previousStep}>
                    Previous: Select Crew
                  </Button>
                  <Button variant="primary" onClick={nextStep}>
                    Next: Choose Colors
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Choose Colors */}
          {currentStep === 3 && (
            <div className="generate-step active">
              <div className="step-content">
                <div className="template-colors-wrapper">
                  <div className="colors-column">
                    <div className="colors-search-container">
                      <input
                        type="text"
                        className="colors-search-input"
                        placeholder="Search club colors..."
                        value={presetSearchQuery}
                        onChange={(e) => setPresetSearchQuery(e.target.value)}
                      />
                    </div>

                    <div className="preset-selection-container">
                      <div className="preset-selection-grid">
                        {clubPresets
                          .filter((preset) =>
                            preset.club_name
                              .toLowerCase()
                              .includes(presetSearchQuery.toLowerCase()),
                          )
                          .map((preset) => (
                            <div
                              key={preset.id}
                              className={`preset-selection-card ${selectedPreset?.id === preset.id ? 'selected' : ''}`}
                              onClick={() => handlePresetSelect(preset)}
                            >
                              <div className="preset-colors-mini">
                                <div
                                  className="color-mini"
                                  style={{ background: preset.primary_color }}
                                ></div>
                                <div
                                  className="color-mini"
                                  style={{ background: preset.secondary_color }}
                                ></div>
                              </div>
                              <div className="preset-name-mini">{preset.club_name}</div>
                            </div>
                          ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="step-navigation">
                  <Button variant="secondary" onClick={previousStep}>
                    Previous: Choose Template
                  </Button>
                  <Button variant="primary" onClick={nextStep}>
                    Next: Generate Images
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Generate & Download */}
          {currentStep === 4 && (
            <div className="generate-step active">
              <div className="step-content">
                <div className="generate-preview-centered">
                  <div className="preview-header">
                    <h3>Live Preview</h3>
                    <div className="preview-format">1080×1080px</div>
                  </div>
                  <div className="preview-container">
                    <div
                      className="preview-image"
                      style={{
                        background: selectedPreset
                          ? `linear-gradient(135deg, ${selectedPreset.primary_color}, ${selectedPreset.secondary_color})`
                          : 'linear-gradient(135deg, var(--primary), var(--primary-dark))',
                      }}
                    >
                      <div className="preview-content">
                        <div className="preview-header-section">
                          <div className="preview-club-name">
                            {selectedCrews[0]?.clubName || 'Club Name'}
                          </div>
                          <div className="preview-crew-name">
                            {selectedCrews[0]?.name || 'Crew Name'}
                          </div>
                        </div>
                        <div className="preview-roster">
                          {selectedCrews[0]?.crewNames.map((name, index) => (
                            <div key={index} className="preview-member">
                              {index + 1}. {name}
                            </div>
                          )) || (
                            <>
                              <div className="preview-member">1. Member Name</div>
                              <div className="preview-member">2. Member Name</div>
                              <div className="preview-member">3. Member Name</div>
                              <div className="preview-member">4. Member Name</div>
                            </>
                          )}
                          {selectedCrews[0]?.coxName && (
                            <div className="preview-cox">Cox: {selectedCrews[0].coxName}</div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="step-navigation">
                  <Button variant="secondary" onClick={previousStep}>
                    Previous: Choose Colors
                  </Button>
                  <Button
                    variant="primary"
                    onClick={generateImages}
                    loading={generating}
                    disabled={generating}
                  >
                    Generate Images
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Success State */}
          {currentStep === 5 && generationStatus && (
            <div className="generate-step active">
              <div className="step-content text-center">
                <div className="success-icon">✅</div>
                <h2>Images Generated Successfully!</h2>
                <p>Your crew images have been created and saved to your gallery</p>

                <div className="success-summary">
                  <div className="success-stat">
                    <div className="stat-number">{generationStatus.images?.length || 0}</div>
                    <div className="stat-label">Images Generated</div>
                  </div>
                  {generationStatus.images && generationStatus.images.length > 0 && (
                    <div className="success-stat">
                      <div className="stat-number">{generationStatus.images[0].size}</div>
                      <div className="stat-label">{generationStatus.images[0].format}</div>
                    </div>
                  )}
                </div>

                <div className="success-actions">
                  {generationStatus.images && generationStatus.images.length > 0 && (
                    <Button
                      variant="primary"
                      onClick={() => {
                        const link = document.createElement('a');
                        link.href = generationStatus.images![0].url;
                        link.download = `crew-${selectedCrews[0]?.name || 'image'}-${Date.now()}.png`;
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                      }}
                    >
                      Download Image
                    </Button>
                  )}
                  <Button variant="secondary" onClick={resetGenerator}>
                    Generate Another
                  </Button>
                  <Button variant="primary" onClick={() => navigate('/gallery')}>
                    View in Gallery
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <AuthModal
        open={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={handleAuthSuccess}
      />
    </div>
  );
};

export default GenerateImagesPage;
