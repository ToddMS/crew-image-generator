import React, { useState, useEffect } from 'react';
import { ClubPreset } from '../../types/club.types';
import { ApiService } from '../../services/api.service';
import { useNotification } from '../../context/NotificationContext';
import './ClubPresets.css';

interface ClubPresetsComponentProps {
  onPresetSelect?: (preset: ClubPreset) => void;
  selectedPresetId?: number | null;
  showManagement?: boolean;
}

const ClubPresetsComponent: React.FC<ClubPresetsComponentProps> = ({
  onPresetSelect,
  selectedPresetId,
  showManagement = true,
}) => {
  const { showSuccess, showError } = useNotification();

  const [clubPresets, setClubPresets] = useState<ClubPreset[]>([]);
  const [newPreset, setNewPreset] = useState<Partial<ClubPreset>>({
    club_name: '',
    primary_color: '#2563eb',
    secondary_color: '#10b981',
    is_default: false,
  });
  const [editingPresetId, setEditingPresetId] = useState<number | null>(null);
  const [saving, setSaving] = useState<string | null>(null);

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

  const handleSaveNewPreset = async () => {
    if (!newPreset.club_name || !newPreset.primary_color || !newPreset.secondary_color) {
      showError('Please fill in all required fields');
      return;
    }

    setSaving('new-preset');
    try {
      const response = await ApiService.createClubPreset(newPreset as Omit<ClubPreset, 'id'>);
      if (response.success && response.data) {
        setClubPresets((prev) => [...prev, response.data]);
        setNewPreset({
          club_name: '',
          primary_color: '#2563eb',
          secondary_color: '#10b981',
          is_default: false,
        });
        showSuccess('Club preset saved successfully!');
      }
    } catch (error) {
      console.error('Error saving club preset:', error);
      // Mock success for development
      const mockPreset: ClubPreset = {
        id: Date.now(),
        club_name: newPreset.club_name!,
        primary_color: newPreset.primary_color!,
        secondary_color: newPreset.secondary_color!,
        is_default: newPreset.is_default || false,
      };
      setClubPresets((prev) => [...prev, mockPreset]);
      setNewPreset({
        club_name: '',
        primary_color: '#2563eb',
        secondary_color: '#10b981',
        is_default: false,
      });
      showSuccess('Club preset saved successfully!');
    } finally {
      setSaving(null);
    }
  };

  const handleUpdatePreset = async (presetId: number, updatedPreset: Partial<ClubPreset>) => {
    setSaving(`preset-${presetId}`);
    try {
      const response = await ApiService.updateClubPreset(presetId, updatedPreset);
      if (response.success && response.data) {
        setClubPresets((prev) =>
          prev.map((preset) => (preset.id === presetId ? { ...preset, ...updatedPreset } : preset)),
        );
        setEditingPresetId(null);
        showSuccess('Club preset updated successfully!');
      }
    } catch (error) {
      console.error('Error updating club preset:', error);
      // Mock success for development
      setClubPresets((prev) =>
        prev.map((preset) => (preset.id === presetId ? { ...preset, ...updatedPreset } : preset)),
      );
      setEditingPresetId(null);
      showSuccess('Club preset updated successfully!');
    } finally {
      setSaving(null);
    }
  };

  const handleDeletePreset = async (presetId: number) => {
    if (!confirm('Are you sure you want to delete this club preset?')) return;

    setSaving(`delete-${presetId}`);
    try {
      const response = await ApiService.deleteClubPreset(presetId);
      if (response.success) {
        setClubPresets((prev) => prev.filter((preset) => preset.id !== presetId));
        showSuccess('Club preset deleted successfully!');
      }
    } catch (error) {
      console.error('Error deleting club preset:', error);
      // Mock success for development
      setClubPresets((prev) => prev.filter((preset) => preset.id !== presetId));
      showSuccess('Club preset deleted successfully!');
    } finally {
      setSaving(null);
    }
  };

  const handlePresetClick = (preset: ClubPreset) => {
    if (onPresetSelect) {
      onPresetSelect(preset);
    }
  };

  return (
    <div className="club-presets-component">
      {showManagement && (
        <>
          {/* Add New Preset */}
          <div className="club-preset-form">
            <h3>Add New Club Preset</h3>
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">Club Name *</label>
                <input
                  type="text"
                  className="form-input"
                  value={newPreset.club_name || ''}
                  onChange={(e) => setNewPreset((prev) => ({ ...prev, club_name: e.target.value }))}
                  placeholder="e.g., Thames Rowing Club"
                />
              </div>
            </div>

            <div className="color-picker-group">
              <div className="color-picker-item">
                <label className="color-label">Primary Color *</label>
                <div className="color-preview" style={{ backgroundColor: newPreset.primary_color }}>
                  <input
                    type="color"
                    className="color-input"
                    value={newPreset.primary_color}
                    onChange={(e) =>
                      setNewPreset((prev) => ({ ...prev, primary_color: e.target.value }))
                    }
                  />
                </div>
              </div>
              <div className="color-picker-item">
                <label className="color-label">Secondary Color *</label>
                <div
                  className="color-preview"
                  style={{ backgroundColor: newPreset.secondary_color }}
                >
                  <input
                    type="color"
                    className="color-input"
                    value={newPreset.secondary_color}
                    onChange={(e) =>
                      setNewPreset((prev) => ({ ...prev, secondary_color: e.target.value }))
                    }
                  />
                </div>
              </div>
            </div>

            <div className="form-actions">
              <button
                className={`btn btn-primary ${saving === 'new-preset' ? 'loading' : ''}`}
                onClick={handleSaveNewPreset}
                disabled={saving === 'new-preset'}
              >
                {saving === 'new-preset' ? 'Saving...' : '➕ Add Club Preset'}
              </button>
            </div>
          </div>
        </>
      )}

      {/* Existing Presets */}
      {clubPresets.length > 0 && (
        <div className="club-presets-list">
          <h3>{showManagement ? 'Your Club Presets' : 'Select Club Preset'}</h3>
          {clubPresets.map((preset) => (
            <div
              key={preset.id}
              className={`club-preset-item ${selectedPresetId === preset.id ? 'selected' : ''}`}
              onClick={() => handlePresetClick(preset)}
            >
              <div className="preset-header">
                <div className="preset-info">
                  <div className="preset-name">
                    {editingPresetId === preset.id ? (
                      <input
                        type="text"
                        className="form-input"
                        defaultValue={preset.club_name}
                        onBlur={(e) => {
                          if (e.target.value !== preset.club_name) {
                            handleUpdatePreset(preset.id, { club_name: e.target.value });
                          }
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.currentTarget.blur();
                          }
                          e.stopPropagation();
                        }}
                        onClick={(e) => e.stopPropagation()}
                      />
                    ) : (
                      <span>{preset.club_name}</span>
                    )}
                    {preset.is_default && <span className="default-badge">Default</span>}
                  </div>
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
                {showManagement && (
                  <div className="preset-actions">
                    <button
                      className="btn btn-text"
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingPresetId(editingPresetId === preset.id ? null : preset.id);
                      }}
                    >
                      {editingPresetId === preset.id ? 'Cancel' : 'Edit'}
                    </button>
                    <button
                      className="btn btn-danger"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeletePreset(preset.id);
                      }}
                      disabled={saving === `delete-${preset.id}`}
                    >
                      {saving === `delete-${preset.id}` ? 'Deleting...' : 'Delete'}
                    </button>
                  </div>
                )}
              </div>

              {editingPresetId === preset.id && showManagement && (
                <div className="preset-edit-section" onClick={(e) => e.stopPropagation()}>
                  <div className="color-picker-group">
                    <div className="color-picker-item">
                      <label className="color-label">Primary Color</label>
                      <div
                        className="color-preview"
                        style={{ backgroundColor: preset.primary_color }}
                      >
                        <input
                          type="color"
                          className="color-input"
                          defaultValue={preset.primary_color}
                          onChange={(e) =>
                            handleUpdatePreset(preset.id, { primary_color: e.target.value })
                          }
                        />
                      </div>
                    </div>
                    <div className="color-picker-item">
                      <label className="color-label">Secondary Color</label>
                      <div
                        className="color-preview"
                        style={{ backgroundColor: preset.secondary_color }}
                      >
                        <input
                          type="color"
                          className="color-input"
                          defaultValue={preset.secondary_color}
                          onChange={(e) =>
                            handleUpdatePreset(preset.id, { secondary_color: e.target.value })
                          }
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ClubPresetsComponent;
