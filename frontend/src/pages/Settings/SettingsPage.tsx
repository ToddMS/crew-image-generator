import React, { useState } from 'react';
import AuthModal from '../../components/Auth/AuthModal';
import Navigation from '../../components/Navigation/Navigation';
import { useAuth } from '../../context/AuthContext';
import { useThemeMode } from '../../context/RowgramThemeContext';
import { useNotification } from '../../context/NotificationContext';
import ClubPresetsComponent from '../../components/ClubPresets/ClubPresetsComponent';
import './Settings.css';

interface UserPreferences {
  darkMode: boolean;
  emailNotifications: boolean;
  pushNotifications: boolean;
  autoSaveInterval: number;
}

const NewSettingsPage: React.FC = () => {
  const { user } = useAuth();
  const { isDarkMode, toggleTheme } = useThemeMode();
  const { showSuccess, showError } = useNotification();
  const [showAuthModal, setShowAuthModal] = useState(false);

  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['profile']));
  const [saving, setSaving] = useState<string | null>(null);

  // Profile settings
  const [profileName, setProfileName] = useState(user?.name || '');
  const [profileEmail, setProfileEmail] = useState(user?.email || '');

  // User preferences
  const [preferences, setPreferences] = useState<UserPreferences>({
    darkMode: isDarkMode,
    emailNotifications: true,
    pushNotifications: false,
    autoSaveInterval: 30,
  });

  const getCurrentPage = () => {
    const path = window.location.pathname;
    if (path === '/') return 'dashboard';
    if (path.includes('/crews/create') || path.includes('/create')) return 'create';
    if (path.includes('/crews')) return 'crews';
    if (path.includes('/club-presets')) return 'club-presets';
    if (path.includes('/generate')) return 'generate';
    if (path.includes('/gallery')) return 'gallery';
    if (path.includes('/settings')) return 'settings';
    return 'dashboard';
  };

  const toggleSection = (sectionId: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId);
    } else {
      newExpanded.add(sectionId);
    }
    setExpandedSections(newExpanded);
  };

  const handleSaveProfile = async () => {
    setSaving('profile');
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      showSuccess('Profile settings saved successfully!');
    } catch (error) {
      showError('Failed to save profile settings. Please try again.');
      console.log(error);
    } finally {
      setSaving(null);
    }
  };

  const handleSavePreferences = async () => {
    setSaving('preferences');
    try {
      // API call to save preferences
      await new Promise((resolve) => setTimeout(resolve, 1000));
      showSuccess('Preferences saved successfully!');
    } catch (error) {
      console.log(error);
      showError('Failed to save preferences. Please try again.');
    } finally {
      setSaving(null);
    }
  };

  const handleDeleteAccount = () => {
    if (confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      showError('Account deletion is not yet implemented. Please contact support.');
    }
  };

  const handleExportData = () => {
    showSuccess('Data export initiated. You will receive an email with your data shortly.');
  };

  const handleAuthSuccess = () => {
    setShowAuthModal(false);
  };

  const currentPage = getCurrentPage();

  if (!user) {
    return (
      <div className="settings-container">
        <Navigation currentPage={currentPage} onAuthModalOpen={() => setShowAuthModal(true)} />
        <div className="container">
          <div className="empty-state">
            <div className="empty-state-icon">⚙️</div>
            <h2>Settings</h2>
            <p>Sign in to manage your account settings and preferences</p>
            <button className="btn btn-primary" onClick={() => setShowAuthModal(true)}>
              Sign In to Access Settings
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

  return (
    <div className="settings-container">
      <Navigation currentPage={currentPage} onAuthModalOpen={() => setShowAuthModal(true)} />
      <div className="container">
        <div className="settings-header">
          <h1>Settings</h1>
          <p>Manage your account, preferences, and club settings</p>
        </div>

        <div className="settings-sections">
          {/* Profile Settings */}
          <div className="settings-section">
            <div
              className={`section-header ${expandedSections.has('profile') ? 'expanded' : ''}`}
              onClick={() => toggleSection('profile')}
            >
              <div className="section-title">
                <div className="section-title-content">
                  <span className="section-icon">👤</span>
                  Profile Settings
                </div>
                <span className="expand-icon">▼</span>
              </div>
            </div>
            <div className={`section-content ${expandedSections.has('profile') ? 'expanded' : ''}`}>
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label required">Full Name</label>
                  <input
                    type="text"
                    className="form-input"
                    value={profileName}
                    onChange={(e) => setProfileName(e.target.value)}
                    placeholder="Enter your full name"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Email Address</label>
                  <input
                    type="email"
                    className="form-input"
                    value={profileEmail}
                    onChange={(e) => setProfileEmail(e.target.value)}
                    disabled
                  />
                  <span className="form-helper">Email cannot be changed after registration</span>
                </div>
              </div>
              <div className="form-actions">
                <button
                  className={`btn btn-primary ${saving === 'profile' ? 'loading' : ''}`}
                  onClick={handleSaveProfile}
                  disabled={saving === 'profile'}
                >
                  {saving === 'profile' ? 'Saving...' : '💾 Save Profile'}
                </button>
              </div>
            </div>
          </div>

          {/* Club Presets */}
          <div className="settings-section">
            <div
              className={`section-header ${expandedSections.has('club') ? 'expanded' : ''}`}
              onClick={() => toggleSection('club')}
            >
              <div className="section-title">
                <div className="section-title-content">
                  <span className="section-icon">🏛️</span>
                  Club Presets
                </div>
                <span className="expand-icon">▼</span>
              </div>
            </div>
            <div className={`section-content ${expandedSections.has('club') ? 'expanded' : ''}`}>
              <ClubPresetsComponent showManagement={true} />
            </div>
          </div>

          {/* App Preferences */}
          <div className="settings-section">
            <div
              className={`section-header ${expandedSections.has('preferences') ? 'expanded' : ''}`}
              onClick={() => toggleSection('preferences')}
            >
              <div className="section-title">
                <div className="section-title-content">
                  <span className="section-icon">⚙️</span>
                  App Preferences
                </div>
                <span className="expand-icon">▼</span>
              </div>
            </div>
            <div
              className={`section-content ${expandedSections.has('preferences') ? 'expanded' : ''}`}
            >
              <div className="toggle-group">
                <div className="toggle-item">
                  <div className="toggle-info">
                    <div className="toggle-label">Dark Mode</div>
                    <div className="toggle-description">Switch between light and dark themes</div>
                  </div>
                  <button
                    className={`toggle-switch ${preferences.darkMode ? 'active' : ''}`}
                    onClick={() => {
                      toggleTheme();
                      setPreferences((prev) => ({ ...prev, darkMode: !prev.darkMode }));
                    }}
                  ></button>
                </div>

                <div className="toggle-item">
                  <div className="toggle-info">
                    <div className="toggle-label">Email Notifications</div>
                    <div className="toggle-description">
                      Receive notifications about crew updates
                    </div>
                  </div>
                  <button
                    className={`toggle-switch ${preferences.emailNotifications ? 'active' : ''} disabled`}
                    disabled
                  ></button>
                </div>

                <div className="toggle-item">
                  <div className="toggle-info">
                    <div className="toggle-label">Push Notifications</div>
                    <div className="toggle-description">
                      Get real-time notifications in your browser
                    </div>
                  </div>
                  <button
                    className={`toggle-switch ${preferences.pushNotifications ? 'active' : ''} disabled`}
                    disabled
                  ></button>
                </div>
              </div>

              <div className="alert info">
                Some notification features are coming soon and will be available in future updates.
              </div>

              <div className="form-actions">
                <button
                  className={`btn btn-primary ${saving === 'preferences' ? 'loading' : ''}`}
                  onClick={handleSavePreferences}
                  disabled={saving === 'preferences'}
                >
                  {saving === 'preferences' ? 'Saving...' : '💾 Save Preferences'}
                </button>
              </div>
            </div>
          </div>

          {/* Account Actions */}
          <div className="settings-section">
            <div
              className={`section-header ${expandedSections.has('account') ? 'expanded' : ''}`}
              onClick={() => toggleSection('account')}
            >
              <div className="section-title">
                <div className="section-title-content">
                  <span className="section-icon">🔐</span>
                  Account Actions
                </div>
                <span className="expand-icon">▼</span>
              </div>
            </div>
            <div className={`section-content ${expandedSections.has('account') ? 'expanded' : ''}`}>
              <div className="alert warning">
                ⚠️ These actions are permanent and cannot be undone. Please proceed with caution.
              </div>

              <div className="account-actions-grid">
                <div className="action-card">
                  <div className="action-title">Export Data</div>
                  <div className="action-description">
                    Download all your crews, templates, and generated images in a portable format.
                  </div>
                  <button className="btn btn-secondary" onClick={handleExportData}>
                    Export My Data
                  </button>
                </div>

                <div className="action-card danger">
                  <div className="action-title">Delete Account</div>
                  <div className="action-description">
                    Permanently delete your account and all associated data. This cannot be undone.
                  </div>
                  <button className="btn btn-danger" onClick={handleDeleteAccount}>
                    Delete Account
                  </button>
                </div>
              </div>

              <div className="alert info">
                For additional support or account assistance, please contact us at
                support@rowgram.com
              </div>
            </div>
          </div>
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

export default NewSettingsPage;
