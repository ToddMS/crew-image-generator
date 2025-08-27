import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthModal from '../../components/Auth/AuthModal';
import Navigation from '../../components/Navigation/Navigation';
import { useAuth } from '../../context/AuthContext';
import { useThemeMode } from '../../context/RowgramThemeContext';
import { useNotification } from '../../context/NotificationContext';
import { ClubPreset } from '../../types/club.types';
import { ApiService } from '../../services/api.service';
import './ClubPresets.css';

const ClubPresetsPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { isDarkMode, toggleTheme } = useThemeMode();
  const { showSuccess, showError } = useNotification();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [clubPresets, setClubPresets] = useState<ClubPreset[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [newPresetForm, setNewPresetForm] = useState({
    club_name: '',
    primary_color: '#2563eb',
    secondary_color: '#1e40af',
  });
  const [editingPresetId, setEditingPresetId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<{
    [key: number]: { club_name: string; primary_color: string; secondary_color: string };
  }>({});
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Form state
  const [formData, setFormData] = useState({
    club_name: '',
    primary_color: '#2563eb',
    secondary_color: '#1e40af',
    is_default: false,
  });

  const handleNavClick = (path: string) => {
    navigate(path);
  };

  const getCurrentPage = () => {
    const path = window.location.pathname;
    if (path === '/') return 'dashboard';
    if (path.includes('/club-presets')) return 'club-presets';
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
      loadClubPresets();
    }
  }, [user]);

  const loadClubPresets = async () => {
    try {
      setLoading(true);
      const response = await ApiService.getClubPresets();
      if (response.data && !response.error) {
        setClubPresets(response.data);
      } else {
        // API call failed or returned no data, use mock data
        console.log('API response:', response);
        setClubPresets([
          {
            id: 1,
            club_name: 'Thames Rowing Club',
            primary_color: '#2563eb',
            secondary_color: '#1e40af',
            is_default: true,
          },
          {
            id: 2,
            club_name: 'London Rowing Club',
            primary_color: '#dc2626',
            secondary_color: '#1f2937',
            is_default: false,
          },
          {
            id: 3,
            club_name: 'Leander Club',
            primary_color: '#be185d',
            secondary_color: '#f8fafc',
            is_default: false,
          },
          {
            id: 4,
            club_name: 'Tideway Scullers School',
            primary_color: '#16a34a',
            secondary_color: '#1f2937',
            is_default: false,
          },
          {
            id: 5,
            club_name: 'Putney Town RC',
            primary_color: '#0891b2',
            secondary_color: '#fbbf24',
            is_default: false,
          },
          {
            id: 6,
            club_name: 'Imperial College BC',
            primary_color: '#1e40af',
            secondary_color: '#ef4444',
            is_default: false,
          },
          {
            id: 7,
            club_name: 'Kings College London BC',
            primary_color: '#7c3aed',
            secondary_color: '#fbbf24',
            is_default: false,
          },
          {
            id: 8,
            club_name: 'University College London BC',
            primary_color: '#1f2937',
            secondary_color: '#fbbf24',
            is_default: false,
          },
          {
            id: 9,
            club_name: 'London School of Economics BC',
            primary_color: '#dc2626',
            secondary_color: '#f8fafc',
            is_default: false,
          },
          {
            id: 10,
            club_name: 'Fulham Reach BC',
            primary_color: '#059669',
            secondary_color: '#065f46',
            is_default: false,
          },
          {
            id: 11,
            club_name: 'Barn Elms BC',
            primary_color: '#7c2d12',
            secondary_color: '#fbbf24',
            is_default: false,
          },
          {
            id: 12,
            club_name: 'Kingston RC',
            primary_color: '#1e40af',
            secondary_color: '#f8fafc',
            is_default: false,
          },
          {
            id: 13,
            club_name: 'Mortlake Anglian & Alpha BC',
            primary_color: '#0891b2',
            secondary_color: '#0f172a',
            is_default: false,
          },
          {
            id: 14,
            club_name: 'Vesta RC',
            primary_color: '#be123c',
            secondary_color: '#fbbf24',
            is_default: false,
          },
          {
            id: 15,
            club_name: 'Thames RC',
            primary_color: '#1e3a8a',
            secondary_color: '#f8fafc',
            is_default: false,
          },
          {
            id: 16,
            club_name: 'Quintin BC',
            primary_color: '#7c3aed',
            secondary_color: '#f8fafc',
            is_default: false,
          },
          {
            id: 17,
            club_name: 'Westminster School BC',
            primary_color: '#be185d',
            secondary_color: '#1f2937',
            is_default: false,
          },
          {
            id: 18,
            club_name: 'Westminster School Ladies BC',
            primary_color: '#be185d',
            secondary_color: '#fbbf24',
            is_default: false,
          },
          {
            id: 19,
            club_name: 'Hammersmith RC',
            primary_color: '#dc2626',
            secondary_color: '#1f2937',
            is_default: false,
          },
          {
            id: 20,
            club_name: 'Wandsworth RC',
            primary_color: '#1e40af',
            secondary_color: '#fbbf24',
            is_default: false,
          },
          {
            id: 21,
            club_name: 'Auriol Kensington RC',
            primary_color: '#084f29',
            secondary_color: '#efc0d4',
            is_default: false,
          },
          {
            id: 22,
            club_name: 'Star & Arrow Club',
            primary_color: '#1f2937',
            secondary_color: '#fbbf24',
            is_default: false,
          },
          {
            id: 23,
            club_name: 'Crabtree RC',
            primary_color: '#16a34a',
            secondary_color: '#f8fafc',
            is_default: false,
          },
          {
            id: 24,
            club_name: 'City of London School BC',
            primary_color: '#1e40af',
            secondary_color: '#dc2626',
            is_default: false,
          },
          {
            id: 25,
            club_name: 'Dulwich College BC',
            primary_color: '#7c2d12',
            secondary_color: '#fbbf24',
            is_default: false,
          },
          {
            id: 26,
            club_name: "Guy's, King's & St Thomas' BC",
            primary_color: '#1e40af',
            secondary_color: '#dc2626',
            is_default: false,
          },
          {
            id: 27,
            club_name: 'Molesey BC',
            primary_color: '#be123c',
            secondary_color: '#f8fafc',
            is_default: false,
          },
          {
            id: 28,
            club_name: 'Walton RC',
            primary_color: '#dc2626',
            secondary_color: '#1f2937',
            is_default: false,
          },
          {
            id: 29,
            club_name: 'Twickenham RC',
            primary_color: '#059669',
            secondary_color: '#fbbf24',
            is_default: false,
          },
          {
            id: 30,
            club_name: 'Richmond RC',
            primary_color: '#7c3aed',
            secondary_color: '#f8fafc',
            is_default: false,
          },
        ]);
      }
    } catch (error) {
      console.error('Error loading club presets:', error);
      // Set some mock data for development
      setClubPresets([
        {
          id: 1,
          club_name: 'Thames Rowing Club',
          primary_color: '#2563eb',
          secondary_color: '#1e40af',
          is_default: true,
        },
        {
          id: 2,
          club_name: 'London Rowing Club',
          primary_color: '#dc2626',
          secondary_color: '#1f2937',
          is_default: false,
        },
        {
          id: 3,
          club_name: 'Leander Club',
          primary_color: '#be185d',
          secondary_color: '#f8fafc',
          is_default: false,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setShowAuthModal(true);
      return;
    }

    try {
      // Create new preset
      const response = await ApiService.createClubPreset(formData);
      if (response.data && !response.error) {
        showSuccess('Club preset created successfully!');
        loadClubPresets();
      } else {
        showError(response.error || 'Failed to create club preset');
      }

      // Reset form
      setFormData({
        club_name: '',
        primary_color: '#2563eb',
        secondary_color: '#1e40af',
        is_default: false,
      });
      setShowCreateModal(false);
    } catch (error) {
      console.error('Error saving club preset:', error);
      showError('Failed to save club preset. Please try again.');
    }
  };

  const handleEdit = (preset: ClubPreset) => {
    setEditingPresetId(preset.id);
    setEditForm({
      ...editForm,
      [preset.id]: {
        club_name: preset.club_name,
        primary_color: preset.primary_color,
        secondary_color: preset.secondary_color,
      },
    });
  };

  const handleCancelEdit = (presetId: number) => {
    setEditingPresetId(null);
    const newEditForm = { ...editForm };
    delete newEditForm[presetId];
    setEditForm(newEditForm);
  };

  const handleSaveEdit = async (preset: ClubPreset) => {
    const editData = editForm[preset.id];
    if (!editData) return;

    try {
      const response = await ApiService.updateClubPreset(preset.id, editData);
      if (response.data && !response.error) {
        showSuccess('Club preset updated successfully!');
        loadClubPresets();
        setEditingPresetId(null);
        const newEditForm = { ...editForm };
        delete newEditForm[preset.id];
        setEditForm(newEditForm);
      } else {
        showError(response.error || 'Failed to update club preset');
      }
    } catch (error) {
      console.error('Error updating preset:', error);
      showError('Failed to update preset. Please try again.');
    }
  };

  const handleEditFormChange = (presetId: number, field: string, value: string) => {
    setEditForm({
      ...editForm,
      [presetId]: {
        ...editForm[presetId],
        [field]: value,
      },
    });
  };

  const handleDelete = async (presetId: number) => {
    try {
      const response = await ApiService.deleteClubPreset(presetId);
      if (!response.error) {
        showSuccess('Club preset deleted successfully!');
        loadClubPresets();
      } else {
        showError(response.error || 'Failed to delete club preset');
      }
    } catch (error) {
      console.error('Error deleting club preset:', error);
      showError('Failed to delete club preset. Please try again.');
    }
    setShowDeleteConfirm(null);
  };

  const handleToggleFavorite = async (preset: ClubPreset) => {
    try {
      const updatedPreset = { ...preset, is_default: !preset.is_default };
      const response = await ApiService.updateClubPreset(preset.id, updatedPreset);
      if (response.data && !response.error) {
        showSuccess(updatedPreset.is_default ? 'Set as favorite' : 'Removed from favorites');
        loadClubPresets();
      } else {
        showError(response.error || 'Failed to update preset');
      }
    } catch (error) {
      console.error('Error updating preset:', error);
      showError('Failed to update preset. Please try again.');
    }
  };

  const handleApplyPreset = (preset: ClubPreset) => {
    // Navigate to create crew page with preset colors
    navigate('/crews/create', {
      state: {
        presetColors: {
          primary: preset.primary_color,
          secondary: preset.secondary_color,
          clubName: preset.club_name,
        },
      },
    });
    showSuccess(`Applied ${preset.club_name} colors`);
  };

  const filteredPresets = clubPresets.filter((preset) =>
    preset.club_name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const openAddPresetModal = () => {
    // Option 1: Use modal (current)
    setFormData({
      club_name: '',
      primary_color: '#2563eb',
      secondary_color: '#1e40af',
      is_default: false,
    });
    setShowCreateModal(true);
  };

  const startNewPreset = () => {
    // Option 2: Inline new preset
    setIsCreatingNew(true);
    setNewPresetForm({
      club_name: '',
      primary_color: '#2563eb',
      secondary_color: '#1e40af',
    });
  };

  const cancelNewPreset = () => {
    setIsCreatingNew(false);
    setNewPresetForm({
      club_name: '',
      primary_color: '#2563eb',
      secondary_color: '#1e40af',
    });
  };

  const saveNewPreset = async () => {
    if (!newPresetForm.club_name.trim()) {
      showError('Club name is required');
      return;
    }

    try {
      const response = await ApiService.createClubPreset({
        ...newPresetForm,
        is_default: false,
      });
      if (response.data && !response.error) {
        showSuccess('Club preset created successfully!');
        loadClubPresets();
        cancelNewPreset();
      } else {
        showError(response.error || 'Failed to create club preset');
      }
    } catch (error) {
      console.error('Error creating preset:', error);
      showError('Failed to create preset. Please try again.');
    }
  };

  const handleNewPresetChange = (field: string, value: string) => {
    setNewPresetForm({
      ...newPresetForm,
      [field]: value,
    });
  };

  const closeAddPresetModal = () => {
    setShowCreateModal(false);
    setFormData({
      club_name: '',
      primary_color: '#2563eb',
      secondary_color: '#1e40af',
      is_default: false,
    });
  };

  const currentPage = getCurrentPage();

  if (!user) {
    return (
      <div className="club-presets-container">
        <Navigation currentPage={currentPage} onAuthModalOpen={() => setShowAuthModal(true)} />
        <div className="container">
          <div className="empty-state">
            <h2>Club Presets</h2>
            <p>Sign in to manage your club color presets</p>
            <button className="btn btn-primary" onClick={() => setShowAuthModal(true)}>
              Sign In to Manage Presets
            </button>
          </div>
        </div>

        <AuthModal open={showAuthModal} onClose={() => setShowAuthModal(false)} />
      </div>
    );
  }

  return (
    <div className="club-presets-container">
      <Navigation currentPage={currentPage} onAuthModalOpen={() => setShowAuthModal(true)} />

      <div className="container">
        <div className="section-header">
          <div className="section-header-left">
            <span className="section-title">Your Club Presets</span>
            <span className="section-badge">{clubPresets.length}</span>
          </div>
          <div className="section-header-right">
            <div className="search-bar">
              <input
                type="text"
                className="search-input"
                placeholder="Search club presets..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <button className="btn btn-primary" onClick={startNewPreset} disabled={isCreatingNew}>
                + Add New
              </button>
            </div>
          </div>
        </div>

        <div className="gallery-grid">
          {loading ? (
            <div className="loading-state">
              <div className="loading-spinner"></div>
              <p>Loading club presets...</p>
            </div>
          ) : filteredPresets.length === 0 ? (
            <div className="empty-state">
              {searchTerm ? (
                <>
                  <h3>No presets found</h3>
                  <p>No club presets match "{searchTerm}"</p>
                  <button className="btn btn-secondary" onClick={() => setSearchTerm('')}>
                    Clear Search
                  </button>
                </>
              ) : (
                <>
                  <h3>No Club Presets Yet</h3>
                  <p>Create your first club preset to get started</p>
                  <button className="btn btn-primary" onClick={openAddPresetModal}>
                    Create First Preset
                  </button>
                </>
              )}
            </div>
          ) : (
            <>
              {isCreatingNew && (
                <div className="preset-card editing new-preset">
                  <div className="preset-header">
                    <input
                      type="text"
                      className="preset-name-input"
                      placeholder="Enter club name"
                      value={newPresetForm.club_name}
                      onChange={(e) => handleNewPresetChange('club_name', e.target.value)}
                    />
                  </div>
                  <div className="preset-colors">
                    <div className="preset-color-group">
                      <div className="preset-color-label">Primary</div>
                      <input
                        type="color"
                        className="preset-color-picker"
                        value={newPresetForm.primary_color}
                        onChange={(e) => handleNewPresetChange('primary_color', e.target.value)}
                      />
                      <input
                        type="text"
                        className="preset-color-hex-input"
                        value={newPresetForm.primary_color}
                        onChange={(e) => handleNewPresetChange('primary_color', e.target.value)}
                      />
                    </div>
                    <div className="preset-color-group">
                      <div className="preset-color-label">Secondary</div>
                      <input
                        type="color"
                        className="preset-color-picker"
                        value={newPresetForm.secondary_color}
                        onChange={(e) => handleNewPresetChange('secondary_color', e.target.value)}
                      />
                      <input
                        type="text"
                        className="preset-color-hex-input"
                        value={newPresetForm.secondary_color}
                        onChange={(e) => handleNewPresetChange('secondary_color', e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="preset-actions">
                    <button className="preset-btn" onClick={cancelNewPreset}>
                      Cancel
                    </button>
                    <button className="preset-btn primary" onClick={saveNewPreset}>
                      Save
                    </button>
                  </div>
                </div>
              )}
              {filteredPresets.map((preset) => {
                const isEditing = editingPresetId === preset.id;
                const editData = editForm[preset.id] || preset;

                return (
                  <div
                    key={preset.id}
                    className={`preset-card ${preset.is_default ? 'favorite' : ''} ${isEditing ? 'editing' : ''}`}
                  >
                    <div className="preset-header">
                      {isEditing ? (
                        <input
                          type="text"
                          className="preset-name-input"
                          value={editData.club_name}
                          onChange={(e) =>
                            handleEditFormChange(preset.id, 'club_name', e.target.value)
                          }
                        />
                      ) : (
                        <h3 className="preset-name">{preset.club_name}</h3>
                      )}
                      {!isEditing && (
                        <span
                          className={`favorite-star ${preset.is_default ? 'active' : ''}`}
                          onClick={() => handleToggleFavorite(preset)}
                          title={preset.is_default ? 'Remove from favorites' : 'Set as favorite'}
                        >
                          {preset.is_default ? '★' : '☆'}
                        </span>
                      )}
                    </div>
                    <div className="preset-colors">
                      <div className="preset-color-group">
                        <div className="preset-color-label">Primary</div>
                        {isEditing ? (
                          <>
                            <input
                              type="color"
                              className="preset-color-picker"
                              value={editData.primary_color}
                              onChange={(e) =>
                                handleEditFormChange(preset.id, 'primary_color', e.target.value)
                              }
                            />
                            <input
                              type="text"
                              className="preset-color-hex-input"
                              value={editData.primary_color}
                              onChange={(e) =>
                                handleEditFormChange(preset.id, 'primary_color', e.target.value)
                              }
                            />
                          </>
                        ) : (
                          <>
                            <div
                              className="preset-color-swatch"
                              style={{ background: preset.primary_color }}
                            ></div>
                            <div className="preset-color-hex">{preset.primary_color}</div>
                          </>
                        )}
                      </div>
                      <div className="preset-color-group">
                        <div className="preset-color-label">Secondary</div>
                        {isEditing ? (
                          <>
                            <input
                              type="color"
                              className="preset-color-picker"
                              value={editData.secondary_color}
                              onChange={(e) =>
                                handleEditFormChange(preset.id, 'secondary_color', e.target.value)
                              }
                            />
                            <input
                              type="text"
                              className="preset-color-hex-input"
                              value={editData.secondary_color}
                              onChange={(e) =>
                                handleEditFormChange(preset.id, 'secondary_color', e.target.value)
                              }
                            />
                          </>
                        ) : (
                          <>
                            <div
                              className="preset-color-swatch"
                              style={{ background: preset.secondary_color }}
                            ></div>
                            <div className="preset-color-hex">{preset.secondary_color}</div>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="preset-actions">
                      {isEditing ? (
                        <>
                          <button
                            className="preset-btn"
                            onClick={() => handleCancelEdit(preset.id)}
                          >
                            Cancel
                          </button>
                          <button
                            className="preset-btn primary"
                            onClick={() => handleSaveEdit(preset)}
                          >
                            Save
                          </button>
                        </>
                      ) : (
                        <>
                          <button className="preset-btn" onClick={() => handleEdit(preset)}>
                            Edit
                          </button>
                          <button
                            className="preset-btn danger"
                            onClick={() => setShowDeleteConfirm(preset.id)}
                          >
                            Delete
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </>
          )}
        </div>
      </div>

      {/* Add Preset Modal */}
      {showCreateModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3 className="modal-title">Add New Club Preset</h3>
              <button className="modal-close" onClick={closeAddPresetModal}>
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Club Name</label>
                  <input
                    type="text"
                    id="club_name"
                    name="club_name"
                    className="form-input"
                    placeholder="Enter club name"
                    value={formData.club_name}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Primary Color</label>
                  <div className="color-input-group">
                    <input
                      type="color"
                      id="primary_color"
                      name="primary_color"
                      className="color-input"
                      value={formData.primary_color}
                      onChange={handleInputChange}
                    />
                    <input
                      type="text"
                      className="color-hex-input"
                      value={formData.primary_color}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, primary_color: e.target.value }))
                      }
                      placeholder="#000000"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Secondary Color</label>
                  <div className="color-input-group">
                    <input
                      type="color"
                      id="secondary_color"
                      name="secondary_color"
                      className="color-input"
                      value={formData.secondary_color}
                      onChange={handleInputChange}
                    />
                    <input
                      type="text"
                      className="color-hex-input"
                      value={formData.secondary_color}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, secondary_color: e.target.value }))
                      }
                      placeholder="#000000"
                    />
                  </div>
                </div>
              </div>

              <div className="btn-group">
                <button type="button" className="btn btn-secondary" onClick={closeAddPresetModal}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save Preset
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Delete Club Preset</h3>
            <p>Are you sure you want to delete this club preset? This action cannot be undone.</p>
            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => setShowDeleteConfirm(null)}>
                Cancel
              </button>
              <button className="btn btn-danger" onClick={() => handleDelete(showDeleteConfirm)}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      <AuthModal open={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </div>
  );
};

export default ClubPresetsPage;
