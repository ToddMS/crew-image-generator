import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthModal from '../../components/Auth/AuthModal';
import { useAuth } from '../../context/AuthContext';
import { useThemeMode } from '../../context/RowgramThemeContext';
import { useNotification } from '../../context/NotificationContext';
import { ClubPreset } from '../../types/club.types';
import { ApiService } from '../../services/api.service';
import './Templates.css';

const TemplatesPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { isDarkMode, toggleTheme } = useThemeMode();
  const { showSuccess } = useNotification();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState('classic-lineup');
  const [selectedColor, setSelectedColor] = useState('#2563eb');
  
  // Club presets
  const [clubPresets, setClubPresets] = useState<ClubPreset[]>([]);
  const [selectedPresetId, setSelectedPresetId] = useState<number | null>(null);
  const [showClubPresets, setShowClubPresets] = useState(false);

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
    loadClubPresets();
  }, []);

  const loadClubPresets = async () => {
    try {
      const response = await ApiService.getClubPresets();
      if (response.success && response.data) {
        setClubPresets(response.data);
      }
    } catch (error) {
      console.error('Error loading club presets:', error);
      // Set some mock data for development
      setClubPresets([
        {
          id: 1,
          club_name: 'Thames Rowing Club',
          primary_color: '#1e40af',
          secondary_color: '#3b82f6',
          is_default: true
        },
        {
          id: 2,
          club_name: 'Oxford University BC',
          primary_color: '#1e3a8a',
          secondary_color: '#60a5fa',
          is_default: false
        },
        {
          id: 3,
          club_name: 'Cambridge University BC',
          primary_color: '#0f766e',
          secondary_color: '#14b8a6',
          is_default: false
        }
      ]);
    }
  };

  const handleClubPresetSelect = (preset: ClubPreset) => {
    setSelectedPresetId(preset.id);
    setSelectedColor(preset.primary_color);
    setShowClubPresets(false);
    showSuccess(`Applied colors from ${preset.club_name}`);
  };

  const handleToggleClubPresets = () => {
    setShowClubPresets(!showClubPresets);
  };

  const templates = [
    { id: 'classic-lineup', name: 'Classic Lineup', type: 'Traditional • Portrait', icon: '📋' },
    { id: 'modern-grid', name: 'Modern Grid', type: 'Contemporary • Square', icon: '🎨' },
    { id: 'action-shot', name: 'Action Shot', type: 'Dynamic • Landscape', icon: '🌊' },
    { id: 'race-day', name: 'Race Day', type: 'Event • Portrait', icon: '🏆' },
    { id: 'minimal', name: 'Minimal', type: 'Clean • Square', icon: '⚡' },
    { id: 'premium', name: 'Premium', type: 'Elegant • Portrait', icon: '✨' }
  ];

  const colors = [
    '#2563eb', '#dc2626', '#16a34a', '#7c3aed', '#ea580c', '#0891b2'
  ];

  const handleTemplateSelect = (templateId: string) => {
    setSelectedTemplate(templateId);
  };

  const handleColorSelect = (color: string) => {
    setSelectedColor(color);
  };

  const handleSaveTemplate = () => {
    showSuccess('Template saved successfully!');
  };

  const currentPage = getCurrentPage();

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
        <section className="hero">
          <h1>Template Gallery</h1>
          <p>Choose and customize templates for your crew images</p>
        </section>

        <div className="template-grid">
          {templates.map((template) => (
            <div
              key={template.id}
              className={`template-card ${selectedTemplate === template.id ? 'selected' : ''}`}
              onClick={() => handleTemplateSelect(template.id)}
            >
              <div className="template-preview">{template.icon}</div>
              <div className="template-name">{template.name}</div>
              <div className="template-type">{template.type}</div>
            </div>
          ))}
        </div>

        <div className="customization-panel">
          <h2>Customize Template</h2>
          
          {/* Club Presets Section */}
          <div className="form-section">
            <label className="form-label">Club Presets</label>
            <button 
              className="btn btn-secondary club-presets-toggle"
              onClick={handleToggleClubPresets}
            >
              🏛️ {showClubPresets ? 'Hide' : 'Use'} Club Presets
            </button>
            
            {showClubPresets && (
              <div className="club-presets-dropdown">
                <div className="club-presets-list">
                  {clubPresets.map((preset) => (
                    <div
                      key={preset.id}
                      className={`club-preset-option ${selectedPresetId === preset.id ? 'selected' : ''}`}
                      onClick={() => handleClubPresetSelect(preset)}
                    >
                      <div className="preset-info">
                        <span className="preset-name">
                          {preset.club_name}
                          {preset.is_default && <span className="default-badge">Default</span>}
                        </span>
                        <div className="preset-colors">
                          <div 
                            className="color-dot" 
                            style={{ backgroundColor: preset.primary_color }}
                            title={`Primary: ${preset.primary_color}`}
                          ></div>
                          <div 
                            className="color-dot" 
                            style={{ backgroundColor: preset.secondary_color }}
                            title={`Secondary: ${preset.secondary_color}`}
                          ></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="form-section">
            <label className="form-label">Primary Color</label>
            <div className="color-picker-group">
              {colors.map((color) => (
                <div
                  key={color}
                  className={`color-option ${selectedColor === color ? 'selected' : ''}`}
                  style={{ background: color }}
                  onClick={() => handleColorSelect(color)}
                ></div>
              ))}
            </div>
            {selectedPresetId && (
              <div className="selected-preset-info">
                <span>
                  Using colors from: {clubPresets.find(p => p.id === selectedPresetId)?.club_name}
                </span>
              </div>
            )}
          </div>
          
          <div className="btn-group">
            <button 
              className="btn btn-secondary"
              onClick={() => {
                setSelectedPresetId(null);
                setSelectedColor('#2563eb');
                showSuccess('Reset to default colors');
              }}
            >
              Reset Colors
            </button>
            <button className="btn btn-primary" onClick={handleSaveTemplate}>
              Save Template
            </button>
          </div>
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