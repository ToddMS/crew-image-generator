import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import AuthModal from '../components/Auth/AuthModal';
import { useAuth } from '../context/AuthContext';
import { useThemeMode } from '../context/RowgramThemeContext';
import { useNotification } from '../context/NotificationContext';
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

interface Template {
  id: string;
  name: string;
  description: string;
  category: 'preset' | 'custom';
  config: TemplateConfig;
  previewUrl: string;
  isDefault?: boolean;
  author?: string;
  createdAt?: string;
}

const presetTemplates: Template[] = [
  {
    id: 'regatta-classic',
    name: 'Regatta Classic',
    description: 'Traditional rowing event style with elegant typography and classic boat positioning',
    category: 'preset',
    config: {
      background: 'geometric',
      nameDisplay: 'basic',
      boatStyle: 'centered',
      textLayout: 'header-left',
      logo: 'bottom-right',
      dimensions: { width: 1080, height: 1350 },
      colors: { primary: '#1e3a5f', secondary: '#6ba3d0' }
    },
    previewUrl: '/api/templates/regatta-classic/preview',
    isDefault: true
  },
  {
    id: 'modern-racing',
    name: 'Modern Racing',
    description: 'Clean, contemporary design perfect for competitive racing events',
    category: 'preset',
    config: {
      background: 'diagonal',
      nameDisplay: 'labeled',
      boatStyle: 'offset',
      textLayout: 'header-center',
      logo: 'top-left',
      dimensions: { width: 1080, height: 1350 },
      colors: { primary: '#2ecc71', secondary: '#16a085' }
    },
    previewUrl: '/api/templates/modern-racing/preview'
  },
  {
    id: 'championship',
    name: 'Championship',
    description: 'Bold design for major events with dynamic positioning and striking colors',
    category: 'preset',
    config: {
      background: 'radial-burst',
      nameDisplay: 'enhanced',
      boatStyle: 'dynamic',
      textLayout: 'header-split',
      logo: 'center-top',
      dimensions: { width: 1080, height: 1350 },
      colors: { primary: '#e74c3c', secondary: '#f39c12' }
    },
    previewUrl: '/api/templates/championship/preview'
  },
  {
    id: 'minimal-clean',
    name: 'Minimal Clean',
    description: 'Simple and elegant design focusing on clean lines and readability',
    category: 'preset',
    config: {
      background: 'minimal',
      nameDisplay: 'basic',
      boatStyle: 'centered',
      textLayout: 'header-center',
      logo: 'bottom-right',
      dimensions: { width: 1080, height: 1350 },
      colors: { primary: '#374151', secondary: '#9ca3af' }
    },
    previewUrl: '/api/templates/minimal-clean/preview'
  },
  {
    id: 'water-waves',
    name: 'Water Waves',
    description: 'Dynamic wave pattern background perfect for water sports themes',
    category: 'preset',
    config: {
      background: 'waves',
      nameDisplay: 'labeled',
      boatStyle: 'offset',
      textLayout: 'header-left',
      logo: 'top-right',
      dimensions: { width: 1080, height: 1350 },
      colors: { primary: '#0891b2', secondary: '#06b6d4' }
    },
    previewUrl: '/api/templates/water-waves/preview'
  }
];

const TemplatesPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const { isDarkMode, toggleTheme } = useThemeMode();
  const { showSuccess, showError } = useNotification();
  const [showAuthModal, setShowAuthModal] = useState(false);

  const [templates, setTemplates] = useState<Template[]>([]);
  const [customTemplates, setCustomTemplates] = useState<Template[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

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
    loadTemplates();
  }, [user]);

  useEffect(() => {
    const state = location.state as { message?: string } | null;
    if (state?.message) {
      setSuccessMessage(state.message);
      navigate(location.pathname, { replace: true });
      setTimeout(() => setSuccessMessage(null), 3000);
    }
  }, [location.state, navigate, location.pathname]);

  const loadTemplates = async () => {
    setLoading(true);
    setError(null);

    try {
      setTemplates(presetTemplates);
      if (user) {
        setCustomTemplates([]);
      }
    } catch (error) {
      console.error('Error loading templates:', error);
      setError('Failed to load templates. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleTemplateSelect = (templateId: string) => {
    setSelectedTemplate(templateId);
  };

  const handleUseTemplate = (template: Template) => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }

    navigate('/generate', {
      state: {
        selectedTemplate: template,
        templateConfig: template.config
      }
    });
  };

  const handlePreviewTemplate = (template: Template) => {
    const previewWindow = window.open('', '_blank', 'width=600,height=750');
    if (previewWindow) {
      previewWindow.document.write(`
        <html>
          <head>
            <title>Template Preview - ${template.name}</title>
            <style>
              body { margin: 0; padding: 20px; font-family: system-ui; background: #f3f4f6; }
              .preview-container { max-width: 400px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
              .preview-header { padding: 16px; border-bottom: 1px solid #e5e7eb; }
              .preview-title { font-size: 18px; font-weight: 600; margin: 0; }
              .preview-description { font-size: 14px; color: #6b7280; margin: 4px 0 0 0; }
              .preview-image { width: 100%; aspect-ratio: 3/4; background: linear-gradient(135deg, ${template.config.colors.primary}, ${template.config.colors.secondary}); display: flex; align-items: center; justify-content: center; color: white; font-size: 16px; font-weight: 500; }
              .preview-footer { padding: 16px; }
              .preview-details { font-size: 12px; color: #6b7280; }
            </style>
          </head>
          <body>
            <div class="preview-container">
              <div class="preview-header">
                <h3 class="preview-title">${template.name}</h3>
                <p class="preview-description">${template.description}</p>
              </div>
              <div class="preview-image">
                Template Preview
              </div>
              <div class="preview-footer">
                <div class="preview-details">
                  Background: ${template.config.background}<br>
                  Name Display: ${template.config.nameDisplay}<br>
                  Boat Style: ${template.config.boatStyle}
                </div>
              </div>
            </div>
          </body>
        </html>
      `);
    }
  };

  const handleCreateCustomTemplate = () => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }
    navigate('/templates/create');
  };

  const currentPage = getCurrentPage();

  if (loading) {
    return (
      <div className="templates-container">
        <nav className="main-nav">
          <div className="nav-container">
            <button className="logo" onClick={() => handleNavClick('/')}>
              <div className="logo-icon">⚓</div>
              <span>RowGram</span>
            </button>
            
            <div className="nav-links">
              <button 
                className={`nav-link ${currentPage === 'dashboard' ? 'active' : ''}`}
                onClick={() => handleNavClick('/')}
              >
                Dashboard
              </button>
              <button 
                className={`nav-link ${currentPage === 'crews' ? 'active' : ''}`}
                onClick={() => handleNavClick('/crews')}
              >
                My Crews
              </button>
              <button 
                className={`nav-link ${currentPage === 'create' ? 'active' : ''}`}
                onClick={() => handleNavClick('/crews/create')}
              >
                Create Crew
              </button>
              <button 
                className={`nav-link ${currentPage === 'templates' ? 'active' : ''}`}
                onClick={() => handleNavClick('/templates')}
              >
                Templates
              </button>
              <button 
                className={`nav-link ${currentPage === 'generate' ? 'active' : ''}`}
                onClick={() => handleNavClick('/generate')}
              >
                Generate
              </button>
              <button 
                className={`nav-link ${currentPage === 'gallery' ? 'active' : ''}`}
                onClick={() => handleNavClick('/gallery')}
              >
                Gallery
              </button>
              <button 
                className={`nav-link ${currentPage === 'settings' ? 'active' : ''}`}
                onClick={() => handleNavClick('/settings')}
              >
                Settings
              </button>
            </div>
            
            <div className="nav-actions">
              <button 
                className="theme-toggle"
                onClick={toggleTheme}
                title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              >
                {isDarkMode ? '☀️' : '🌙'}
              </button>
              
              {user ? (
                <div className="user-menu">
                  <span className="user-name">{user.club_name || user.name}</span>
                  <div className="user-avatar">
                    {user.name?.[0] || 'U'}
                  </div>
                  <button className="logout-btn" onClick={logout} title="Logout">
                    ↗️
                  </button>
                </div>
              ) : (
                <button 
                  className="login-btn"
                  onClick={() => setShowAuthModal(true)}
                >
                  Sign In
                </button>
              )}
            </div>
          </div>
        </nav>

        <div className="container">
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <h3>Loading templates...</h3>
          </div>
        </div>
      </div>
    );
  }

  if (error && !loading) {
    return (
      <div className="templates-container">
        <nav className="main-nav">
          <div className="nav-container">
            <button className="logo" onClick={() => handleNavClick('/')}>
              <div className="logo-icon">⚓</div>
              <span>RowGram</span>
            </button>
            
            <div className="nav-links">
              <button 
                className={`nav-link ${currentPage === 'dashboard' ? 'active' : ''}`}
                onClick={() => handleNavClick('/')}
              >
                Dashboard
              </button>
              <button 
                className={`nav-link ${currentPage === 'crews' ? 'active' : ''}`}
                onClick={() => handleNavClick('/crews')}
              >
                My Crews
              </button>
              <button 
                className={`nav-link ${currentPage === 'create' ? 'active' : ''}`}
                onClick={() => handleNavClick('/crews/create')}
              >
                Create Crew
              </button>
              <button 
                className={`nav-link ${currentPage === 'templates' ? 'active' : ''}`}
                onClick={() => handleNavClick('/templates')}
              >
                Templates
              </button>
              <button 
                className={`nav-link ${currentPage === 'generate' ? 'active' : ''}`}
                onClick={() => handleNavClick('/generate')}
              >
                Generate
              </button>
              <button 
                className={`nav-link ${currentPage === 'gallery' ? 'active' : ''}`}
                onClick={() => handleNavClick('/gallery')}
              >
                Gallery
              </button>
              <button 
                className={`nav-link ${currentPage === 'settings' ? 'active' : ''}`}
                onClick={() => handleNavClick('/settings')}
              >
                Settings
              </button>
            </div>
            
            <div className="nav-actions">
              <button 
                className="theme-toggle"
                onClick={toggleTheme}
                title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              >
                {isDarkMode ? '☀️' : '🌙'}
              </button>
              
              {user ? (
                <div className="user-menu">
                  <span className="user-name">{user.club_name || user.name}</span>
                  <div className="user-avatar">
                    {user.name?.[0] || 'U'}
                  </div>
                  <button className="logout-btn" onClick={logout} title="Logout">
                    ↗️
                  </button>
                </div>
              ) : (
                <button 
                  className="login-btn"
                  onClick={() => setShowAuthModal(true)}
                >
                  Sign In
                </button>
              )}
            </div>
          </div>
        </nav>

        <div className="container">
          <div className="empty-state">
            <div className="empty-state-icon">⚠️</div>
            <h2>Error Loading Templates</h2>
            <p>{error}</p>
            <button className="btn btn-primary" onClick={loadTemplates}>
              Retry Loading Templates
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="templates-container">
      <nav className="main-nav">
        <div className="nav-container">
          <button className="logo" onClick={() => handleNavClick('/')}>
            <div className="logo-icon">⚓</div>
            <span>RowGram</span>
          </button>
          
          <div className="nav-links">
            <button 
              className={`nav-link ${currentPage === 'dashboard' ? 'active' : ''}`}
              onClick={() => handleNavClick('/')}
            >
              Dashboard
            </button>
            <button 
              className={`nav-link ${currentPage === 'crews' ? 'active' : ''}`}
              onClick={() => handleNavClick('/crews')}
            >
              My Crews
            </button>
            <button 
              className={`nav-link ${currentPage === 'create' ? 'active' : ''}`}
              onClick={() => handleNavClick('/crews/create')}
            >
              Create Crew
            </button>
            <button 
              className={`nav-link ${currentPage === 'templates' ? 'active' : ''}`}
              onClick={() => handleNavClick('/templates')}
            >
              Templates
            </button>
            <button 
              className={`nav-link ${currentPage === 'generate' ? 'active' : ''}`}
              onClick={() => handleNavClick('/generate')}
            >
              Generate
            </button>
            <button 
              className={`nav-link ${currentPage === 'gallery' ? 'active' : ''}`}
              onClick={() => handleNavClick('/gallery')}
            >
              Gallery
            </button>
            <button 
              className={`nav-link ${currentPage === 'settings' ? 'active' : ''}`}
              onClick={() => handleNavClick('/settings')}
            >
              Settings
            </button>
          </div>
          
          <div className="nav-actions">
            <button 
              className="theme-toggle"
              onClick={toggleTheme}
              title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {isDarkMode ? '☀️' : '🌙'}
            </button>
            
            {user ? (
              <div className="user-menu">
                <span className="user-name">{user.club_name || user.name}</span>
                <div className="user-avatar">
                  {user.name?.[0] || 'U'}
                </div>
                <button className="logout-btn" onClick={logout} title="Logout">
                  ↗️
                </button>
              </div>
            ) : (
              <button 
                className="login-btn"
                onClick={() => setShowAuthModal(true)}
              >
                Sign In
              </button>
            )}
          </div>
        </div>
      </nav>

      <div className="container">
        <div className="templates-header">
          <h1>Templates</h1>
          <p>Choose from our professionally designed templates or create your own custom design for your crew images</p>
        </div>

        {successMessage && (
          <div style={{ 
            background: 'rgba(16, 185, 129, 0.1)', 
            border: '1px solid rgba(16, 185, 129, 0.3)', 
            color: '#065f46',
            padding: '1rem 1.5rem',
            borderRadius: '0.75rem',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            animation: 'slideInDown 0.3s ease-out'
          }}>
            ✅ {successMessage}
            <button 
              style={{ 
                marginLeft: 'auto',
                background: 'none',
                border: 'none',
                fontSize: '1.25rem',
                cursor: 'pointer',
                opacity: 0.6
              }}
              onClick={() => setSuccessMessage(null)}
            >
              ×
            </button>
          </div>
        )}

        {/* Preset Templates */}
        <div className="template-categories">
          <div className="category-header">
            <div className="category-title">
              <span className="category-icon">🎨</span>
              Preset Templates
              <span className="category-badge">{templates.length}</span>
            </div>
          </div>
          
          <div className="templates-grid">
            {templates.map((template) => (
              <div 
                key={template.id} 
                className={`template-card ${selectedTemplate === template.id ? 'selected' : ''}`}
                onClick={() => handleTemplateSelect(template.id)}
              >
                <div className="template-preview">
                  <div 
                    style={{
                      width: '100%',
                      height: '100%',
                      background: `linear-gradient(135deg, ${template.config.colors.primary}, ${template.config.colors.secondary})`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontSize: '1rem',
                      fontWeight: 500
                    }}
                  >
                    {template.name}
                  </div>
                  <div className="template-overlay">
                    <button 
                      className="preview-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePreviewTemplate(template);
                      }}
                    >
                      👁️ Preview
                    </button>
                  </div>
                </div>

                <div className="template-info">
                  <h3>{template.name}</h3>
                  <p className="template-description">{template.description}</p>
                  
                  <div className="template-details">
                    <div className="template-colors">
                      <div 
                        className="color-dot" 
                        style={{ backgroundColor: template.config.colors.primary }}
                      ></div>
                      <div 
                        className="color-dot" 
                        style={{ backgroundColor: template.config.colors.secondary }}
                      ></div>
                    </div>
                    <div className="template-meta">
                      {template.isDefault && <span>⭐ Default</span>}
                      <span>{template.config.background}</span>
                    </div>
                  </div>

                  <div className="template-actions">
                    <button 
                      className="template-action-btn primary"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleUseTemplate(template);
                      }}
                    >
                      🎯 Use Template
                    </button>
                    <button 
                      className="template-action-btn secondary"
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePreviewTemplate(template);
                      }}
                    >
                      👁️ Preview
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Custom Templates */}
        <div className="template-categories">
          <div className="category-header">
            <div className="category-title">
              <span className="category-icon">⚡</span>
              Custom Templates
              <span className="category-badge">{customTemplates.length}</span>
            </div>
            <button 
              className="create-template-btn"
              onClick={handleCreateCustomTemplate}
            >
              ➕ Create Custom Template
            </button>
          </div>
          
          {customTemplates.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">🎨</div>
              <h2>No Custom Templates Yet</h2>
              <p>Create your first custom template to match your club's unique style and branding</p>
              <button 
                className="btn btn-primary"
                onClick={handleCreateCustomTemplate}
              >
                🎨 Create Your First Template
              </button>
            </div>
          ) : (
            <div className="templates-grid">
              {customTemplates.map((template) => (
                <div 
                  key={template.id} 
                  className={`template-card ${selectedTemplate === template.id ? 'selected' : ''}`}
                  onClick={() => handleTemplateSelect(template.id)}
                >
                  <div className="template-preview">
                    <div 
                      style={{
                        width: '100%',
                        height: '100%',
                        background: `linear-gradient(135deg, ${template.config.colors.primary}, ${template.config.colors.secondary})`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontSize: '1rem',
                        fontWeight: 500
                      }}
                    >
                      {template.name}
                    </div>
                    <div className="template-overlay">
                      <button 
                        className="preview-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePreviewTemplate(template);
                        }}
                      >
                        👁️ Preview
                      </button>
                    </div>
                  </div>

                  <div className="template-info">
                    <h3>{template.name}</h3>
                    <p className="template-description">{template.description}</p>
                    
                    <div className="template-details">
                      <div className="template-colors">
                        <div 
                          className="color-dot" 
                          style={{ backgroundColor: template.config.colors.primary }}
                        ></div>
                        <div 
                          className="color-dot" 
                          style={{ backgroundColor: template.config.colors.secondary }}
                        ></div>
                      </div>
                      <div className="template-meta">
                        <span>By {template.author || 'You'}</span>
                      </div>
                    </div>

                    <div className="template-actions">
                      <button 
                        className="template-action-btn primary"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleUseTemplate(template);
                        }}
                      >
                        🎯 Use Template
                      </button>
                      <button 
                        className="template-action-btn secondary"
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePreviewTemplate(template);
                        }}
                      >
                        ✏️ Edit
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      
      <AuthModal 
        open={showAuthModal} 
        onClose={() => setShowAuthModal(false)} 
      />
    </div>
  );
};

export default TemplatesPage;