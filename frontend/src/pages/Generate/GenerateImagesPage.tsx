import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navigation from '../../components/Navigation/Navigation';
import AuthModal from '../../components/Auth/AuthModal';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { useThemeMode } from '../../context/RowgramThemeContext';
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

interface GenerationRequest {
  crewId: string;
  templateId: string;
  colors: {
    primary: string;
    secondary: string;
  };
  formats: string[];
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

  // Loading and error states
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [generationStatus, setGenerationStatus] = useState<GenerationStatus | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const getCurrentPage = () => 'generate';

  // Load data on component mount
  useEffect(() => {
    if (user) {
      loadInitialData();
    }
  }, [user]);

  const loadInitialData = async () => {
    setLoading(true);
    
    try {
      const [crewsResponse, templatesResponse, presetsResponse] = await Promise.all([
        ApiService.getCrews(),
        ApiService.getTemplates(),
        ApiService.getClubPresets(),
      ]);

      // Handle crews response
      if (crewsResponse.success && crewsResponse.data) {
        setCrews(crewsResponse.data);
        // Auto-select first crew if available
        if (crewsResponse.data.length > 0) {
          setSelectedCrews([crewsResponse.data[0]]);
        }
      } else if (crewsResponse.data && !crewsResponse.success) {
        // Handle case where API returns data but no explicit success flag
        setCrews(crewsResponse.data);
        if (crewsResponse.data.length > 0) {
          setSelectedCrews([crewsResponse.data[0]]);
        }
      }

      // Handle templates response
      if (templatesResponse.success && templatesResponse.data) {
        setTemplates(templatesResponse.data);
        // Auto-select first template if available
        if (templatesResponse.data.length > 0) {
          setSelectedTemplate(templatesResponse.data[0]);
        }
      } else if (templatesResponse.data && !templatesResponse.success) {
        setTemplates(templatesResponse.data);
        if (templatesResponse.data.length > 0) {
          setSelectedTemplate(templatesResponse.data[0]);
        }
      } else {
        // Create mock templates so the UI works while backend is being implemented
        const mockTemplates = [
          {
            id: 'classic-lineup',
            name: 'Classic Lineup',
            description: 'Traditional roster layout with boat visualization',
            category: 'classic'
          },
          {
            id: 'modern-grid',
            name: 'Modern Grid',
            description: 'Clean contemporary design with member cards',
            category: 'modern'
          },
          {
            id: 'race-day',
            name: 'Race Day',
            description: 'Event focused template with bold styling',
            category: 'race'
          },
          {
            id: 'minimal',
            name: 'Minimal',
            description: 'Simple, elegant layout',
            category: 'minimal'
          },
          {
            id: 'championship',
            name: 'Championship',
            description: 'Bold design for major events',
            category: 'championship'
          }
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

    } catch (error) {
      showError('Failed to load data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Step navigation
  const nextStep = () => {
    if (validateCurrentStep()) {
      setCurrentStep(prev => Math.min(prev + 1, 3));
      setErrors({});
    }
  };

  const previousStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
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
    setSelectedCrews(prev => {
      const isSelected = prev.find(c => c.id === crew.id);
      if (isSelected) {
        // Remove crew from selection
        return prev.filter(c => c.id !== crew.id);
      } else {
        // Add crew to selection
        return [...prev, crew];
      }
    });
    setErrors(prev => ({ ...prev, crew: '' }));
  };

  const handleTemplateSelect = (template: Template) => {
    setSelectedTemplate(template);
    setErrors(prev => ({ ...prev, template: '' }));
  };

  const handlePresetSelect = (preset: ClubPreset) => {
    setSelectedPreset(preset);
    setErrors(prev => ({ ...prev, preset: '' }));
  };

  const handleFormatToggle = (format: string) => {
    setSelectedFormats(prev => {
      const newFormats = prev.includes(format)
        ? prev.filter(f => f !== format)
        : [...prev, format];
      
      if (newFormats.length > 0) {
        setErrors(prev => ({ ...prev, formats: '' }));
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

    if (!validateCurrentStep() || selectedCrews.length === 0 || !selectedTemplate || !selectedPreset) {
      return;
    }

    setGenerating(true);
    try {
      // Generate images for each selected crew
      const requests = selectedCrews.map(crew => ({
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
          setCurrentStep(4); // Success step
          showSuccess('Images generated successfully!');
        }
      } else {
        throw new Error(response.error || 'Generation failed');
      }
    } catch (error) {
      showError('Failed to generate images. Please try again.');
      setGenerating(false);
    }
  };

  const pollGenerationStatus = async (generationId: string) => {
    try {
      const response = await ApiService.getGenerationStatus(generationId);
      
      if (response.success && response.data) {
        setGenerationStatus(response.data);
        
        if (response.data.status === 'completed') {
          setGenerating(false);
          setCurrentStep(4); // Success step
          showSuccess('Images generated successfully!');
        } else if (response.data.status === 'failed') {
          setGenerating(false);
          showError(response.data.error || 'Generation failed');
        } else if (response.data.status === 'processing' || response.data.status === 'pending') {
          // Continue polling
          setTimeout(() => pollGenerationStatus(generationId), 2000);
        }
      }
    } catch (error) {
      setGenerating(false);
      showError('Failed to get generation status');
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
      case 'classic': return '📋';
      case 'modern': return '🎨';
      case 'race': return '🏆';
      default: return '📄';
    }
  };

  // Filter and sort presets - selected first, then by search query
  const getFilteredAndSortedPresets = () => {
    let filtered = clubPresets.filter(preset => 
      preset.club_name.toLowerCase().includes(presetSearchQuery.toLowerCase())
    );
    
    // Sort with selected preset first
    filtered.sort((a, b) => {
      if (selectedPreset && a.id === selectedPreset.id) return -1;
      if (selectedPreset && b.id === selectedPreset.id) return 1;
      return a.club_name.localeCompare(b.club_name);
    });
    
    return filtered;
  };

  if (!user) {
    return (
      <div className="generate-container">
        <Navigation currentPage={getCurrentPage()} onAuthModalOpen={() => setShowAuthModal(true)} />
        <div className="container">
          <div className="empty-state">
            <div className="empty-state-icon">🎨</div>
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
        {/* Progress Steps */}
        <div className="progress-container">
          <div className="progress-steps">
            <div className={`progress-step ${currentStep === 1 ? 'active' : currentStep > 1 ? 'completed' : ''}`}>
              <div className="step-number">{currentStep > 1 ? '✓' : '1'}</div>
              <div className="step-label">Select Crew</div>
            </div>
            <div className="progress-line"></div>
            <div className={`progress-step ${currentStep === 2 ? 'active' : currentStep > 2 ? 'completed' : ''}`}>
              <div className="step-number">{currentStep > 2 ? '✓' : '2'}</div>
              <div className="step-label">Choose Template & Colors</div>
            </div>
            <div className="progress-line"></div>
            <div className={`progress-step ${currentStep === 3 ? 'active' : currentStep > 3 ? 'completed' : ''}`}>
              <div className="step-number">{currentStep > 3 ? '✓' : '3'}</div>
              <div className="step-label">Generate & Download</div>
            </div>
          </div>
        </div>

        <div className="generate-main">
          {/* Step 1: Select Crew */}
          {currentStep === 1 && (
            <div className="generate-step active">
              <div className="step-content">
                <div className="step-header-with-actions">
                  <div>
                    <h2>Step 1: Select Your Crews</h2>
                    <p>Choose which crews you'd like to create images for</p>
                  </div>
                  {crews.length > 0 && (
                    <div className="crew-selection-actions">
                      <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        onClick={() => setSelectedCrews(crews)}
                      >
                        Select All
                      </button>
                      <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        onClick={() => setSelectedCrews([])}
                      >
                        Clear All
                      </button>
                    </div>
                  )}
                </div>
                
                {errors.crew && <div className="error-message">{errors.crew}</div>}
                
                
                <div className="crew-selection-grid">
                  {crews.length === 0 ? (
                    <div style={{
                      padding: '3rem 2rem',
                      textAlign: 'center',
                      color: 'var(--gray-600)',
                      backgroundColor: 'var(--gray-50)',
                      borderRadius: 'var(--radius-lg)',
                      border: '2px dashed var(--gray-300)'
                    }}>
                      <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>🚣</div>
                      <h3>No Crews Found</h3>
                      <p>You haven't created any crews yet.</p>
                      <button 
                        className="btn btn-primary"
                        onClick={() => navigate('/crews/create')}
                        style={{ marginTop: '1rem' }}
                      >
                        Create Your First Crew
                      </button>
                    </div>
                  ) : (
                    crews.map(crew => {
                      const isSelected = selectedCrews.find(c => c.id === crew.id);
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
                        <div className="crew-detail">{crew.boatType.name} • {crew.clubName}</div>
                        {crew.coachName && (
                          <div className="crew-detail">Coach: {crew.coachName}</div>
                        )}
                      </div>
                    </div>
                  );
                  }))}
                </div>
                
                <div className="step-navigation">
                  <button className="btn btn-secondary" disabled>Previous</button>
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
              <div className="step-layout">
                <div className="step-content">
                  <h2>Step 2: Choose Template & Colors</h2>
                  <p>Select a template design and club colors</p>
                  
                  <div className="template-section">
                    <h3>Template Style</h3>
                    {errors.template && <div className="error-message">{errors.template}</div>}
                    
                    <div className="template-selection-grid">
                      {templates.map(template => (
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
                        {getFilteredAndSortedPresets().map(preset => (
                          <div
                            key={preset.id}
                            className={`preset-selection-card-compact ${selectedPreset?.id === preset.id ? 'selected' : ''}`}
                            onClick={() => handlePresetSelect(preset)}
                          >
                            <div className="preset-colors-compact">
                              <div className="color-compact" style={{ background: preset.primary_color }}></div>
                              <div className="color-compact" style={{ background: preset.secondary_color }}></div>
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
                
                {/* Live Preview Panel */}
                <div className="preview-panel">
                  <div className="preview-header">
                    <h3>Live Preview</h3>
                    <div className="preview-format">Instagram Post (1080×1080)</div>
                  </div>
                  <div className="preview-container">
                    <div 
                      className="preview-image"
                      style={{
                        background: selectedPreset 
                          ? `linear-gradient(135deg, ${selectedPreset.primary_color}, ${selectedPreset.secondary_color})`
                          : 'linear-gradient(135deg, #2563eb, #1e40af)'
                      }}
                    >
                      <div className="preview-content">
                        <div className="preview-header-section">
                          <div className="preview-club-name">
                            {selectedCrews[0]?.clubName || 'Club Name'}
                          </div>
                          <div className="preview-crew-name">
                            {selectedCrews[0]?.name || (selectedCrews.length > 1 ? `${selectedCrews.length} crews selected` : 'Crew Name')}
                          </div>
                        </div>
                        <div className="preview-roster">
                          {selectedCrews.length > 1 ? (
                            <div className="preview-multi-crews">
                              <div className="preview-member">Preview showing: {selectedCrews[0]?.name}</div>
                              <div className="preview-member">+ {selectedCrews.length - 1} other crew{selectedCrews.length - 1 !== 1 ? 's' : ''}</div>
                            </div>
                          ) : selectedCrews[0] ? (
                            <>
                              {selectedCrews[0].crewNames.map((name, index) => (
                                <div key={index} className="preview-member">
                                  {index + 1}. {name}
                                  {index === 0 && selectedCrews[0].boatType.seats > 1 ? ' (Bow)' : ''}
                                  {index === selectedCrews[0].crewNames.length - 1 && selectedCrews[0].boatType.seats > 1 ? ' (Stroke)' : ''}
                                </div>
                              ))}
                              {selectedCrews[0].coxName && (
                                <div className="preview-cox">Cox: {selectedCrews[0].coxName}</div>
                              )}
                            </>
                          ) : (
                            <div className="preview-member">No crew selected</div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Generate & Download */}
          {currentStep === 3 && (
            <div className="generate-step active">
              <div className="step-content">
                <h2>Step 3: Generate & Download</h2>
                <p>Choose your output formats and generate your crew images</p>
                
                <div className="generation-options">
                  <h3>Output Formats</h3>
                  {errors.formats && <div className="error-message">{errors.formats}</div>}
                  
                  <div className="format-options">
                    {formatOptions.map(format => (
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
                          : `${selectedCrews.length} crews selected`
                        }
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
                        {selectedFormats.length} format{selectedFormats.length !== 1 ? 's' : ''} selected
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