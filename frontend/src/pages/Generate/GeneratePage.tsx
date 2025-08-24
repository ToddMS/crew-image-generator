import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import AuthModal from '../../components/Auth/AuthModal';
import Navigation from '../../components/Navigation/Navigation';
import { useAuth } from '../../context/AuthContext';
import { useThemeMode } from '../../context/RowgramThemeContext';
import { useNotification } from '../../context/NotificationContext';
import { ApiService } from '../../services/api.service';
import { Crew } from '../../types/crew.types';
import './Generate.css';

interface TemplateConfig {
  background: string;
  nameDisplay: string;
  boatStyle: string;
  textLayout: string;
  logo: string;
  dimensions: { width: number; height: number };
  colors: { primary: string; secondary: string };
}

interface Template {
  id: string;
  name: string;
  description: string;
  category: 'preset' | 'custom';
  config: TemplateConfig;
  previewUrl?: string;
  author?: string;
}

interface SavedCrew extends Crew {
  boatClub: string;
  boatName: string;
  boatClass: string;
}

const presetTemplates: Template[] = [
  {
    id: 'regatta-classic',
    name: 'Regatta Classic',
    description: 'Traditional rowing event style',
    category: 'preset',
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
    category: 'preset',
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
    category: 'preset',
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

const GeneratePage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const { isDarkMode, toggleTheme } = useThemeMode();
  const { showSuccess, showError } = useNotification();
  const [showAuthModal, setShowAuthModal] = useState(false);

  const [crews, setCrews] = useState<SavedCrew[]>([]);
  const [templates, setTemplates] = useState<Template[]>(presetTemplates);
  const [selectedCrew, setSelectedCrew] = useState<SavedCrew | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

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

  useEffect(() => {
    if (user) {
      loadCrews();
    }
  }, [user]);

  useEffect(() => {
    const state = location.state as { 
      selectedCrewIds?: string[]; 
      selectedTemplate?: Template;
      templateConfig?: TemplateConfig;
    } | null;
    
    if (state?.selectedTemplate) {
      setSelectedTemplate(state.selectedTemplate);
    }
    
    if (state?.selectedCrewIds && state.selectedCrewIds.length > 0) {
      const crewId = state.selectedCrewIds[0];
      const crew = crews.find(c => c.id === crewId);
      if (crew) {
        setSelectedCrew(crew);
      }
    }
  }, [location.state, crews]);

  const loadCrews = async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await ApiService.getCrews();
      if (result.data) {
        const transformedCrews = result.data.map((crew) => ({
          ...crew,
          boatClub: crew.clubName,
          boatName: crew.name,
          boatClass: crew.boatType.value,
        }));
        setCrews(transformedCrews);
      } else if (result.error) {
        setError('Failed to load crews. Please try again.');
      }
    } catch (error) {
      console.error('Error loading crews:', error);
      setError('Failed to load crews. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateImage = async () => {
    if (!selectedCrew || !selectedTemplate || !user) return;

    setGenerating(true);
    setGenerationProgress(0);

    try {
      const progressInterval = setInterval(() => {
        setGenerationProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      const response = await ApiService.generateImage(selectedCrew.id, {
        templateId: selectedTemplate.id,
        templateConfig: selectedTemplate.config
      });

      clearInterval(progressInterval);
      setGenerationProgress(100);

      if (response.success) {
        showSuccess(`Image generated successfully for "${selectedCrew.boatName}"!`);
        setTimeout(() => {
          navigate('/gallery');
        }, 1000);
      } else {
        throw new Error(response.error || 'Generation failed');
      }
    } catch (error) {
      console.error('Error generating image:', error);
      showError('Failed to generate image. Please try again.');
    } finally {
      setTimeout(() => {
        setGenerating(false);
        setGenerationProgress(0);
      }, 1500);
    }
  };

  const handleAuthSuccess = () => {
    setShowAuthModal(false);
  };

  const currentPage = getCurrentPage();

  if (!user) {
    return (
      <div className="generate-container">
      <Navigation 
        currentPage={currentPage} 
        onAuthModalOpen={() => setShowAuthModal(true)}
      />
        <div className="container">
          <div className="empty-state">
            <div className="empty-state-icon">🎨</div>
            <h2>Generate Crew Images</h2>
            <p>Sign in to create beautiful crew images with custom templates</p>
            <button 
              className="btn btn-primary"
              onClick={() => setShowAuthModal(true)}
            >
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
      <Navigation 
        currentPage={currentPage} 
        onAuthModalOpen={() => setShowAuthModal(true)}
      />
        <div className="container">
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <h3>Loading your crews and templates...</h3>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="generate-container">
      <Navigation 
        currentPage={currentPage} 
        onAuthModalOpen={() => setShowAuthModal(true)}
      />
      <div className="container">
        <div className="generate-header">
          <h1>Generate Images</h1>
          <p>Create beautiful crew images by selecting a crew and template, then generate your custom image</p>
        </div>


        {/* Selection Grid */}
        <div className="selection-grid">
          {/* Crew Selection */}
          <div className="selection-card">
            <div className="selection-card-header">
              <div className="selection-card-title">
                <div className="selection-card-icon crews">👥</div>
                Select Crew
              </div>
              <div className="selection-card-count">
                {crews.length} crew{crews.length !== 1 ? 's' : ''} available
              </div>
            </div>
            <div className="selection-card-content">
              {crews.length === 0 ? (
                <div className="selection-empty">
                  <div className="selection-empty-icon">🚣</div>
                  <h3>No Crews Yet</h3>
                  <p>Create your first crew to get started</p>
                  <button 
                    className="selection-empty-btn"
                    onClick={() => navigate('/crews/create')}
                  >
                    Create First Crew
                  </button>
                </div>
              ) : (
                crews.map((crew) => (
                  <div 
                    key={crew.id} 
                    className={`selection-item ${selectedCrew?.id === crew.id ? 'selected' : ''}`}
                    onClick={() => setSelectedCrew(crew)}
                  >
                    <div className="selection-item-title">{crew.boatName}</div>
                    <div className="selection-item-subtitle">{crew.boatClub} • {crew.raceName}</div>
                    <div className="selection-item-tags">
                      <span className="selection-item-tag primary">{crew.boatClass}</span>
                      <span className="selection-item-tag">{crew.crewNames.length} members</span>
                      {crew.coachName && (
                        <span className="selection-item-tag">Coach: {crew.coachName}</span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Template Selection */}
          <div className="selection-card">
            <div className="selection-card-header">
              <div className="selection-card-title">
                <div className="selection-card-icon templates">🎨</div>
                Select Template
              </div>
              <div className="selection-card-count">
                {templates.length} template{templates.length !== 1 ? 's' : ''} available
              </div>
            </div>
            <div className="selection-card-content">
              {templates.length === 0 ? (
                <div className="selection-empty">
                  <div className="selection-empty-icon">🎨</div>
                  <h3>No Templates Yet</h3>
                  <p>Create or select a template to get started</p>
                  <button 
                    className="selection-empty-btn"
                    onClick={() => navigate('/templates')}
                  >
                    Browse Templates
                  </button>
                </div>
              ) : (
                templates.map((template) => (
                  <div 
                    key={template.id} 
                    className={`selection-item ${selectedTemplate?.id === template.id ? 'selected' : ''}`}
                    onClick={() => setSelectedTemplate(template)}
                  >
                    <div className="selection-item-title">{template.name}</div>
                    <div className="selection-item-subtitle">{template.description}</div>
                    <div className="selection-item-tags">
                      <span className="selection-item-tag primary">{template.category}</span>
                      <span className="selection-item-tag">{template.config.background}</span>
                      <span className="selection-item-tag">{template.config.nameDisplay}</span>
                    </div>
                    <div className="template-colors">
                      <div 
                        className="template-color-dot" 
                        style={{ backgroundColor: template.config.colors.primary }}
                      ></div>
                      <div 
                        className="template-color-dot" 
                        style={{ backgroundColor: template.config.colors.secondary }}
                      ></div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Generation Controls */}
        <div className="generation-controls">
          <h2>
            <div className="generation-icon">⚡</div>
            Generate Image
          </h2>
          
          {selectedCrew && selectedTemplate ? (
            <div className="generation-status ready">
              <h3>Ready to Generate!</h3>
              <p>Your selection is complete. Click the button below to generate your crew image.</p>
              
              <div className="generation-summary">
                <div className="generation-summary-item">
                  <span className="generation-summary-label">Crew:</span>
                  <span className="generation-summary-value">{selectedCrew.boatName}</span>
                </div>
                <div className="generation-summary-item">
                  <span className="generation-summary-label">Template:</span>
                  <span className="generation-summary-value">{selectedTemplate.name}</span>
                </div>
                <div className="generation-summary-item">
                  <span className="generation-summary-label">Boat Class:</span>
                  <span className="generation-summary-value">{selectedCrew.boatClass}</span>
                </div>
                <div className="generation-summary-item">
                  <span className="generation-summary-label">Members:</span>
                  <span className="generation-summary-value">{selectedCrew.crewNames.length}</span>
                </div>
              </div>
              
              {generating && (
                <div className="progress-indicator">
                  <div className="progress-bar">
                    <div 
                      className="progress-fill" 
                      style={{ width: `${generationProgress}%` }}
                    ></div>
                  </div>
                  <div className="progress-text">
                    Generating image... {generationProgress}%
                  </div>
                </div>
              )}
              
              <div className="generation-actions">
                <button
                  className={`btn btn-primary ${generating ? 'btn-loading' : ''}`}
                  onClick={handleGenerateImage}
                  disabled={generating}
                >
                  {generating ? (
                    <>Generating Image...</>
                  ) : (
                    <>⚡ Generate Image</>
                  )}
                </button>
                <button
                  className="btn btn-secondary"
                  onClick={() => navigate('/gallery')}
                >
                  🖼️ View Gallery
                </button>
              </div>
            </div>
          ) : (
            <div className="generation-status incomplete">
              <h3>Select Crew and Template</h3>
              <p>Please select both a crew and a template to generate your image.</p>
              
              <div className="generation-summary">
                <div className="generation-summary-item">
                  <span className="generation-summary-label">Crew:</span>
                  <span className="generation-summary-value">
                    {selectedCrew ? selectedCrew.boatName : 'Not selected'}
                  </span>
                </div>
                <div className="generation-summary-item">
                  <span className="generation-summary-label">Template:</span>
                  <span className="generation-summary-value">
                    {selectedTemplate ? selectedTemplate.name : 'Not selected'}
                  </span>
                </div>
              </div>
              
              <div className="generation-actions">
                <button
                  className="btn btn-primary"
                  disabled
                >
                  ⚡ Generate Image
                </button>
                <button
                  className="btn btn-secondary"
                  onClick={() => navigate('/gallery')}
                >
                  🖼️ View Gallery
                </button>
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

export default GeneratePage;