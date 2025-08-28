import React, { useState } from 'react';
import AuthModal from '../../components/Auth/AuthModal';
import Navigation from '../../components/Navigation/Navigation';
import Button from '../../components/Button';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import './Settings.css';

const NewSettingsPage: React.FC = () => {
  const { user } = useAuth();
  const { showError } = useNotification();
  const [showAuthModal, setShowAuthModal] = useState(false);

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

  const handleDeleteAccount = () => {
    if (confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      showError('Account deletion is not yet implemented. Please contact support.');
    }
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
            <Button variant="primary" onClick={() => setShowAuthModal(true)}>
              Sign In to Access Settings
            </Button>
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

        <div className="account-actions-grid">
          <div className="action-card danger">
            <div className="action-title">Delete Account</div>
            <div className="action-description">
              Permanently delete your account and all associated data. This cannot be undone.
            </div>
            <Button variant="danger" onClick={handleDeleteAccount}>
              Delete Account
            </Button>
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
