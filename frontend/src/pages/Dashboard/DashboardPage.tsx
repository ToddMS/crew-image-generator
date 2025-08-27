import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import AuthModal from '../../components/Auth/AuthModal';
import Navigation from '../../components/Navigation/Navigation';
import './Dashboard.css';

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [showAuthModal, setShowAuthModal] = useState(false);

  const handleActionClick = (action: string) => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }

    switch (action) {
      case 'create':
        navigate('/crews/create');
        break;
      case 'generate':
        navigate('/generate');
        break;
      case 'gallery':
        navigate('/gallery');
        break;
      default:
        break;
    }
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

  const currentPage = getCurrentPage();

  // Don't auto-show login modal - let users explore first

  return (
    <div className="dashboard-container">
      <Navigation currentPage={currentPage} onAuthModalOpen={() => setShowAuthModal(true)} />

      <div className="container">
        <section className="hero">
          <h1>{user ? 'Welcome back to RowGram' : 'Welcome to RowGram'}</h1>
          <p>
            {user
              ? 'Create professional rowing crew images for Instagram in just a few clicks'
              : 'Create professional rowing crew images for Instagram - Sign in to get started'}
          </p>
        </section>

        <div className="action-cards">
          <div className="action-card" onClick={() => handleActionClick('create')}>
            <h3 className="action-title">Create Crew</h3>
            <p className="action-description">
              Set up a new crew with members, cox, and coach details
            </p>
            <div className="action-arrow">
              Get started <span>→</span>
            </div>
          </div>

          <div className="action-card" onClick={() => handleActionClick('generate')}>
            <h3 className="action-title">Generate Images</h3>
            <p className="action-description">
              Turn your crews into beautiful Instagram-ready images
            </p>
            <div className="action-arrow">
              Create now <span>→</span>
            </div>
          </div>

          <div className="action-card" onClick={() => handleActionClick('gallery')}>
            <h3 className="action-title">View Gallery</h3>
            <p className="action-description">Browse and download all your generated crew images</p>
            <div className="action-arrow">
              Browse <span>→</span>
            </div>
          </div>
        </div>
      </div>

      {/* Auth Modal */}
      <AuthModal open={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </div>
  );
};

export default DashboardPage;
