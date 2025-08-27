import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Navigation from '../../components/Navigation/Navigation';
import AuthModal from '../../components/Auth/AuthModal';
import StepIndicator, { Step } from '../../components/StepIndicator';
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
    { label: 'Choose Template & Colors', description: 'Pick design and colors' },
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
      if (templatesResponse.success && templatesResponse.data) {
        setTemplates(templatesResponse.data as Template[]);
        // Auto-select first template if available
        if (templatesResponse.data.length > 0) {
          setSelectedTemplate(templatesResponse.data[0] as Template);
        }
      } else if (templatesResponse.data && !templatesResponse.success) {
        setTemplates(templatesResponse.data as Template[]);
        if (templatesResponse.data.length > 0) {
          setSelectedTemplate(templatesResponse.data[0] as Template);
        }
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
      setCurrentStep((prev) => Math.min(prev + 1, 3));
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
        if (!selectedPreset) {
          newErrors.preset = 'Please select club colors';
        }
        break;
      case 3:
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

  const handleFormatToggle = (format: string) => {
    setSelectedFormats((prev) => {
      const newFormats = prev.includes(format)
        ? prev.filter((f) => f !== format)
        : [...prev, format];

      if (newFormats.length > 0) {
        setErrors((prev) => ({ ...prev, formats: '' }));
      }

      return newFormats;
    });
  };

  // Image generation
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

      console.log(
        '🖼️ Frontend generating images with requests:',
        requests.map((r) => ({
          crewId: r.crewId,
          templateId: r.templateId,
          colors: r.colors,
          formats: r.formats,
        })),
      );

      console.log('📋 Selected template details:', {
        id: selectedTemplate.id,
        name: selectedTemplate.name,
        category: selectedTemplate.category,
      });

      // For now, generate images for the first crew (until backend supports batch generation)
      // TODO: Update when backend supports multiple crew generation
      const response = await ApiService.generateImages(requests[0]);

      if (response.data) {
        setGenerationStatus(response.data);

        // Since we're using immediate generation, no need to poll
        // Just set the final state directly
        if (response.data.status === 'completed') {
          setGenerating(false);
          setCurrentStep(4); // Success step
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

  const formatOptions = [
    { id: 'instagram_post', name: 'Instagram Post', size: '1080×1080px (Square)' },
    { id: 'instagram_story', name: 'Instagram Story', size: '1080×1920px (Portrait)' },
    { id: 'facebook_post', name: 'Facebook Post', size: '1200×630px (Landscape)' },
    { id: 'twitter_post', name: 'Twitter Post', size: '1024×512px (Landscape)' },
  ];

  const getTemplateIcon = (template: Template) => {
    switch (template.category) {
      case 'classic':
        return '📋';
      case 'modern':
        return '🎨';
      case 'event':
        return '🏆';
      case 'minimal':
        return '⚡';
      case 'championship':
        return '🥇';
      case 'vintage':
        return '📜';
      case 'elite':
        return '⚡';
      case 'royal':
        return '👑';
      case 'academic':
        return '🎓';
      case 'traditional':
        return '🏛️';
      default:
        return '📄';
    }
  };

  // Filter and sort presets - selected first, then by search query
  const getFilteredAndSortedPresets = () => {
    const filtered = clubPresets.filter((preset) =>
      preset.club_name.toLowerCase().includes(presetSearchQuery.toLowerCase()),
    );

    // Sort with selected preset first
    filtered.sort((a, b) => {
      if (selectedPreset && a.id === selectedPreset.id) return -1;
      if (selectedPreset && b.id === selectedPreset.id) return 1;
      return a.club_name.localeCompare(b.club_name);
    });

    return filtered;
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
            <button className="btn btn-primary" onClick={() => setShowAuthModal(true)}>
              Sign In to Generate Images
            </button>
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
                <div className="step-header-with-actions">
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
                </div>

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
                      }}
                    >
                      <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>🚣</div>
                      <h3>{crews.length === 0 ? 'No Crews Found' : 'No Matching Crews'}</h3>
                      <p>
                        {crews.length === 0
                          ? "You haven't created any crews yet."
                          : 'Try adjusting your search terms.'}
                      </p>
                      <button
                        className="btn btn-primary"
                        onClick={() => navigate('/crews/create')}
                        style={{ marginTop: '1rem' }}
                      >
                        Create Your First Crew
                      </button>
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
                  <button className="btn btn-secondary" disabled>
                    Previous
                  </button>
                  <button className="btn btn-primary" onClick={nextStep}>
                    Next: Choose Template
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Template & Colors */}
          {currentStep === 2 && (
            <div className="generate-step active">
              <div className="step-content">
                <h2>Choose Template & Colors</h2>
                <p>Select a template design and club colors</p>

                <div className="template-section">
                  <h3>Template Style</h3>
                  {errors.template && <div className="error-message">{errors.template}</div>}

                  <div className="template-selection-grid">
                    {templates.map((template) => (
                      <div
                        key={template.id}
                        className={`template-selection-card ${selectedTemplate?.id === template.id ? 'selected' : ''}`}
                        onClick={() => handleTemplateSelect(template)}
                      >
                        <div className="template-thumb">{getTemplateIcon(template)}</div>
                        <div className="template-info">
                          <div className="template-name">{template.name}</div>
                          <div className="template-desc">{template.description}</div>
                        </div>
                        <div className="selection-radio">
                          <div className="radio-dot"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="colors-section">
                  <h3>Club Colors</h3>
                  {errors.preset && <div className="error-message">{errors.preset}</div>}

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
                    <div className="preset-selection-grid-scrollable">
                      {getFilteredAndSortedPresets().map((preset) => (
                        <div
                          key={preset.id}
                          className={`preset-selection-card-compact ${selectedPreset?.id === preset.id ? 'selected' : ''}`}
                          onClick={() => handlePresetSelect(preset)}
                        >
                          <div className="preset-colors-compact">
                            <div
                              className="color-compact"
                              style={{ background: preset.primary_color }}
                            ></div>
                            <div
                              className="color-compact"
                              style={{ background: preset.secondary_color }}
                            ></div>
                          </div>
                          <div className="preset-name-compact">{preset.club_name}</div>
                          {selectedPreset?.id === preset.id && (
                            <div className="selected-indicator">✓</div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="step-navigation">
                  <button className="btn btn-secondary" onClick={previousStep}>
                    Previous: Select Crew
                  </button>
                  <button className="btn btn-primary" onClick={nextStep}>
                    Next: Generate Image
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Generate & Download */}
          {currentStep === 3 && (
            <div className="generate-step active">
              <div className="step-content">
                <div className="generation-options">
                  <h3>Output Formats</h3>
                  {errors.formats && <div className="error-message">{errors.formats}</div>}

                  <div className="format-options">
                    {formatOptions.map((format) => (
                      <label key={format.id} className="format-option">
                        <input
                          type="checkbox"
                          checked={selectedFormats.includes(format.id)}
                          onChange={() => handleFormatToggle(format.id)}
                        />
                        <div className="format-info">
                          <div className="format-name">{format.name}</div>
                          <div className="format-size">{format.size}</div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="generation-summary">
                  <h3>Generation Summary</h3>
                  <div className="summary-card">
                    <div className="summary-row">
                      <span className="summary-label">Crews:</span>
                      <span className="summary-value">
                        {selectedCrews.length === 1
                          ? selectedCrews[0].name
                          : `${selectedCrews.length} crews selected`}
                      </span>
                    </div>
                    <div className="summary-row">
                      <span className="summary-label">Template:</span>
                      <span className="summary-value">{selectedTemplate?.name}</span>
                    </div>
                    <div className="summary-row">
                      <span className="summary-label">Club Colors:</span>
                      <span className="summary-value">{selectedPreset?.club_name}</span>
                    </div>
                    <div className="summary-row">
                      <span className="summary-label">Formats:</span>
                      <span className="summary-value">
                        {selectedFormats.length} format{selectedFormats.length !== 1 ? 's' : ''}{' '}
                        selected
                      </span>
                    </div>
                  </div>
                </div>

                <div className="step-navigation">
                  <button className="btn btn-secondary" onClick={previousStep}>
                    Previous: Template & Colors
                  </button>
                  <button
                    className={`btn btn-primary btn-generate ${generating ? 'loading' : ''}`}
                    onClick={generateImages}
                    disabled={generating}
                  >
                    {generating ? 'Generating...' : 'Generate Images'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Success State */}
          {currentStep === 4 && generationStatus && (
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
                    <button
                      className="btn btn-primary"
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
                    </button>
                  )}
                  <button className="btn btn-secondary" onClick={resetGenerator}>
                    Generate Another
                  </button>
                  <button className="btn btn-primary" onClick={() => navigate('/gallery')}>
                    View in Gallery
                  </button>
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
