import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthModal from '../../components/Auth/AuthModal';
import Navigation from '../../components/Navigation/Navigation';
import Button from '../../components/Button';
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
          is_default: true,
        },
        {
          id: 2,
          club_name: 'Oxford University BC',
          primary_color: '#1e3a8a',
          secondary_color: '#60a5fa',
          is_default: false,
        },
        {
          id: 3,
          club_name: 'Cambridge University BC',
          primary_color: '#0f766e',
          secondary_color: '#14b8a6',
          is_default: false,
        },
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

  // Professional rowing templates
  const templates: Template[] = [
    {
      id: 'classic-lineup',
      name: 'Classic Lineup',
      type: 'Traditional • Portrait',
      icon: '📋',
      isCustom: false,
      description: 'Traditional roster layout with clean presentation',
    },
    {
      id: 'modern-card',
      name: 'Modern Card',
      type: 'Contemporary • Square',
      icon: '🎨',
      isCustom: false,
      description: 'Contemporary card-based design with member highlights',
    },
    {
      id: 'race-day',
      name: 'Race Day',
      type: 'Event • Portrait',
      icon: '🏆',
      isCustom: false,
      description: 'Bold event-focused template with dynamic styling',
    },
    {
      id: 'minimal-clean',
      name: 'Minimal Clean',
      type: 'Clean • Square',
      icon: '⚡',
      isCustom: false,
      description: 'Simple, elegant layout with clean typography',
    },
    {
      id: 'championship-gold',
      name: 'Championship Gold',
      type: 'Luxury • Portrait',
      icon: '🥇',
      isCustom: false,
      description: 'Luxurious golden design for major competitions',
    },
    {
      id: 'vintage-classic',
      name: 'Vintage Classic',
      type: 'Traditional • Portrait',
      icon: '📜',
      isCustom: false,
      description: 'Traditional parchment style with ornate decorations',
    },
    {
      id: 'elite-performance',
      name: 'Elite Performance',
      type: 'High-Tech • Square',
      icon: '⚡',
      isCustom: false,
      description: 'High-tech performance styling for elite crews',
    },
    {
      id: 'regatta-royal',
      name: 'Regatta Royal',
      type: 'Royal • Portrait',
      icon: '👑',
      isCustom: false,
      description: 'Royal regatta styling with heraldic elements',
    },
    {
      id: 'oxbridge-herald',
      name: 'Oxbridge Herald',
      type: 'Academic • Portrait',
      icon: '🎓',
      isCustom: false,
      description: 'Academic heraldic design with Latin styling',
    },
    {
      id: 'henley-poster',
      name: 'Henley Poster',
      type: 'Traditional • Portrait',
      icon: '🏛️',
      isCustom: false,
      description: 'Traditional Henley Royal Regatta poster style',
    },
  ];

  const colors = ['#2563eb', '#dc2626', '#16a34a', '#7c3aed', '#ea580c', '#0891b2'];

  const handleTemplateSelect = (templateId: string) => {
    setSelectedTemplate(templateId);
  };

  const handleColorSelect = (color: string) => {
    setSelectedColor(color);
  };

  const handleDeleteTemplate = async (templateId: string) => {
    try {
      showSuccess('Template: ' + templateId + ' deleted successfully!');
      setShowDeleteModal(null);
    } catch (error) {
      showError('Failed to delete template. Please try again.' + error);
    }
  };

  const handleUseTemplate = () => {
    navigate('/generate', {
      state: {
        selectedTemplate: templates.find((t) => t.id === selectedTemplate),
        selectedColor,
      },
    });
  };

  const handleEditTemplate = (templateId: string) => {
    navigate('/templates/create', {
      state: {
        editingTemplate: templates.find((t) => t.id === templateId),
      },
    });
  };

  const currentPage = getCurrentPage();

  return (
    <div className="templates-container">
      <Navigation currentPage={currentPage} onAuthModalOpen={() => setShowAuthModal(true)} />

      <div className="container">
        <section className="hero">
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '1rem',
            }}
          >
            <div>
              <h1>Template Gallery</h1>
              <p>View, customize, and manage your templates</p>
            </div>
            <Button
              variant="primary"
              onClick={() => navigate('/templates/create')}
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            >
              <span>🎨</span>
              Create New Template
            </Button>
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
                <div className="template-preview" title={template.description}>
                  {template.icon}
                  {template.isCustom && (
                    <div className="template-actions">
                      <Button
                        variant="secondary"
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditTemplate(template.id);
                        }}
                        title="Edit Template"
                      >
                        ✏️
                      </Button>
                      <Button
                        variant="danger"
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowDeleteModal(template.id);
                        }}
                        title="Delete Template"
                      >
                        🗑️
                      </Button>
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
                  {template.description && (
                    <div className="template-description">{template.description}</div>
                  )}
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
            <Button variant="secondary" onClick={handleToggleClubPresets}>
              🏛️ {showClubPresets ? 'Hide' : 'Use'} Club Presets
            </Button>

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
                  Using colors from: {clubPresets.find((p) => p.id === selectedPresetId)?.club_name}
                </span>
              </div>
            )}
          </div>

          <div className="btn-group">
            <Button
              variant="secondary"
              onClick={() => {
                setSelectedPresetId(null);
                setSelectedColor('#2563eb');
                showSuccess('Reset to default colors');
              }}
            >
              Reset Colors
            </Button>
            <Button variant="primary" onClick={handleUseTemplate}>
              Use Template in Generate
            </Button>
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
              <Button variant="secondary" onClick={() => setShowDeleteModal(null)}>
                Cancel
              </Button>
              <Button variant="danger" onClick={() => handleDeleteTemplate(showDeleteModal)}>
                Delete Template
              </Button>
            </div>
          </div>
        </div>
      )}

      <AuthModal open={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </div>
  );
};

export default ViewTemplatesPage;
