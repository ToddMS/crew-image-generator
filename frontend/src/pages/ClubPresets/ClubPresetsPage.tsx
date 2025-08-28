import React, { useState, useEffect } from 'react';
import AuthModal from '../../components/Auth/AuthModal';
import Navigation from '../../components/Navigation/Navigation';
import Button from '../../components/Button';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { ClubPreset } from '../../types/club.types';
import { ApiService } from '../../services/api.service';
import './ClubPresets.css';

const ClubPresetsPage: React.FC = () => {
  const { user } = useAuth();
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
      }
    } catch (error) {
      console.error('Error loading club presets:', error);
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
            <Button variant="primary" onClick={() => setShowAuthModal(true)}>
              Sign In to Manage Presets
            </Button>
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
              <Button variant="primary" onClick={startNewPreset} disabled={isCreatingNew}>
                + Add New
              </Button>
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
                  <Button variant="secondary" onClick={() => setSearchTerm('')}>
                    Clear Search
                  </Button>
                </>
              ) : (
                <>
                  <h3>No Club Presets Yet</h3>
                  <p>Create your first club preset to get started</p>
                  <Button variant="primary" onClick={openAddPresetModal}>
                    Create First Preset
                  </Button>
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
                    <Button variant="secondary" size="small" onClick={cancelNewPreset}>
                      Cancel
                    </Button>
                    <Button variant="primary" size="small" onClick={saveNewPreset}>
                      Save
                    </Button>
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
                          <Button
                            variant="secondary"
                            size="small"
                            onClick={() => handleCancelEdit(preset.id)}
                          >
                            Cancel
                          </Button>
                          <Button
                            variant="primary"
                            size="small"
                            onClick={() => handleSaveEdit(preset)}
                          >
                            Save
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button
                            variant="secondary"
                            size="small"
                            onClick={() => handleEdit(preset)}
                          >
                            Edit
                          </Button>
                          <Button
                            variant="danger"
                            size="small"
                            onClick={() => setShowDeleteConfirm(preset.id)}
                          >
                            Delete
                          </Button>
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
                <Button variant="secondary" onClick={closeAddPresetModal}>
                  Cancel
                </Button>
                <Button variant="success" type="submit">
                  Save Preset
                </Button>
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
              <Button variant="secondary" onClick={() => setShowDeleteConfirm(null)}>
                Cancel
              </Button>
              <Button variant="danger" onClick={() => handleDelete(showDeleteConfirm)}>
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}

      <AuthModal open={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </div>
  );
};

export default ClubPresetsPage;
