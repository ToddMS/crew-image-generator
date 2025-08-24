import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthModal from '../../components/Auth/AuthModal';
import Navigation from '../../components/Navigation/Navigation';
import { useAuth } from '../../context/AuthContext';
import { useThemeMode } from '../../context/RowgramThemeContext';
import { useNotification } from '../../context/NotificationContext';
import { ClubPreset } from '../../types/club.types';
import { ApiService } from '../../services/api.service';
import './Templates.css';

interface Template {
  id: string;
  name: string;
  type: string;
  icon: string;
  isCustom: boolean;
  author?: string;
  description?: string;
}

const ViewTemplatesPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showSuccess, showError } = useNotification();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState('classic-lineup');
  const [selectedColor, setSelectedColor] = useState('#2563eb');
  const [showDeleteModal, setShowDeleteModal] = useState<string | null>(null);
  
  // Club presets
  const [clubPresets, setClubPresets] = useState<ClubPreset[]>([]);
  const [selectedPresetId, setSelectedPresetId] = useState<number | null>(null);
  const [showClubPresets, setShowClubPresets] = useState(false);

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

  // Mock templates data with custom templates
  const templates: Template[] = [
    { id: 'classic-lineup', name: 'Classic Lineup', type: 'Traditional • Portrait', icon: '📋', isCustom: false },
    { id: 'modern-grid', name: 'Modern Grid', type: 'Contemporary • Square', icon: '🎨', isCustom: false },
    { id: 'action-shot', name: 'Action Shot', type: 'Dynamic • Landscape', icon: '🌊', isCustom: false },
    { id: 'race-day', name: 'Race Day', type: 'Event • Portrait', icon: '🏆', isCustom: false },
    { id: 'minimal', name: 'Minimal', type: 'Clean • Square', icon: '⚡', isCustom: false },
    { id: 'premium', name: 'Premium', type: 'Elegant • Portrait', icon: '✨', isCustom: false },
    // Custom templates (user created)
    { id: 'custom-1', name: 'My Club Style', type: 'Custom • Portrait', icon: '🎯', isCustom: true, author: user?.name },
    { id: 'custom-2', name: 'Championship 2024', type: 'Custom • Landscape', icon: '🏅', isCustom: true, author: user?.name },
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

  const handleDeleteTemplate = async (templateId: string) => {
    try {
      // Call API to delete template
      // await ApiService.deleteTemplate(templateId);
      showSuccess('Template deleted successfully!');
      setShowDeleteModal(null);
    } catch (error) {
      showError('Failed to delete template. Please try again.');
    }
  };

  const handleUseTemplate = () => {
    navigate('/generate', { 
      state: { 
        selectedTemplate: templates.find(t => t.id === selectedTemplate),
        selectedColor 
      }
    });
  };

  const handleEditTemplate = (templateId: string) => {
    navigate('/templates/create', { 
      state: { 
        editingTemplate: templates.find(t => t.id === templateId) 
      }
    });
  };

  const currentPage = getCurrentPage();

  return (
    <div className="templates-container">
      <Navigation 
        currentPage={currentPage} 
        onAuthModalOpen={() => setShowAuthModal(true)}
      />

      <div className="container">
        <section className="hero">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <div>
              <h1>Template Gallery</h1>
              <p>View, customize, and manage your templates</p>
            </div>
            <button 
              className="btn btn-primary"
              onClick={() => navigate('/templates/create')}
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            >
              <span>🎨</span>
              Create New Template
            </button>
          </div>
        </section>

        {/* Template Categories */}
        <div className="template-categories">
          <h2>All Templates</h2>
          <div className="template-grid">
            {templates.map((template) => (
              <div
                key={template.id}
                className={`template-card ${selectedTemplate === template.id ? 'selected' : ''}`}
                onClick={() => handleTemplateSelect(template.id)}
              >
                <div className="template-preview">
                  {template.icon}
                  {template.isCustom && (
                    <div className="template-actions">
                      <button 
                        className="template-action-btn edit"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditTemplate(template.id);
                        }}
                        title="Edit Template"
                      >
                        ✏️
                      </button>
                      <button 
                        className="template-action-btn delete"
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowDeleteModal(template.id);
                        }}
                        title="Delete Template"
                      >
                        🗑️
                      </button>
                    </div>
                  )}
                </div>
                <div className="template-info">
                  <div className="template-name">{template.name}</div>
                  <div className="template-type">
                    {template.type}
                    {template.isCustom && template.author && (
                      <span className="template-author"> • by {template.author}</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Template Customization */}
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
            <button className="btn btn-primary" onClick={handleUseTemplate}>
              Use Template in Generate
            </button>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="modal-overlay" onClick={() => setShowDeleteModal(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Delete Template</h3>
            <p>Are you sure you want to delete this template? This action cannot be undone.</p>
            <div className="modal-actions">
              <button 
                className="btn btn-secondary"
                onClick={() => setShowDeleteModal(null)}
              >
                Cancel
              </button>
              <button 
                className="btn btn-danger"
                onClick={() => handleDeleteTemplate(showDeleteModal)}
              >
                Delete Template
              </button>
            </div>
          </div>
        </div>
      )}
      
      <AuthModal 
        open={showAuthModal} 
        onClose={() => setShowAuthModal(false)}
      />
    </div>
  );
};

export default ViewTemplatesPage;