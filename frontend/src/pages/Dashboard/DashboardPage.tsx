import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { useThemeMode } from '../../context/RowgramThemeContext';
import { ApiService } from '../../services/api.service';
import AuthModal from '../../components/Auth/AuthModal';
import './Dashboard.css';

interface DashboardStats {
  totalCrews: number;
  totalTemplates: number;
  totalImages: number;
  lastGenerated: string;
}

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { showError } = useNotification();
  const { isDarkMode, toggleTheme } = useThemeMode();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [stats, setStats] = useState<DashboardStats>({
    totalCrews: 0,
    totalTemplates: 0,
    totalImages: 0,
    lastGenerated: 'Never'
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadDashboardStats();
    }
  }, [user]);

  const loadDashboardStats = async () => {
    try {
      setLoading(true);
      
      // Load crews
      const crewsResponse = await ApiService.getCrews();
      const totalCrews = crewsResponse.data?.length || 0;
      
      // Mock other stats for now - you can add these API calls when ready
      const totalTemplates = 5;
      const totalImages = Math.floor(totalCrews * 2.5); // Estimate based on crews
      const lastGenerated = totalImages > 0 ? 'Today' : 'Never';

      setStats({
        totalCrews,
        totalTemplates,
        totalImages,
        lastGenerated
      });
    } catch (error) {
      showError('Failed to load dashboard data');
      console.error('Dashboard stats error:', error);
    } finally {
      setLoading(false);
    }
  };

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

  const currentPage = getCurrentPage();

  // Don't auto-show login modal - let users explore first

  return (
    <div className="dashboard-container">
      {/* Navigation */}
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
          <h1>{user ? 'Welcome back to RowGram' : 'Welcome to RowGram'}</h1>
          <p>{user ? 'Create professional rowing crew images for Instagram in just a few clicks' : 'Create professional rowing crew images for Instagram - Sign in to get started'}</p>
        </section>

        <div className="action-cards">
          <div className="action-card" onClick={() => handleActionClick('create')}>
            <h3>Create Crew</h3>
            <p>Set up a new crew with members, cox, and coach details</p>
            <div className="action-arrow">
              Get started <span>→</span>
            </div>
          </div>
          
          <div className="action-card" onClick={() => handleActionClick('generate')}>
            <h3>Generate Images</h3>
            <p>Turn your crews into beautiful Instagram-ready images</p>
            <div className="action-arrow">
              Create now <span>→</span>
            </div>
          </div>
          
          <div className="action-card" onClick={() => handleActionClick('gallery')}>
            <h3>View Gallery</h3>
            <p>Browse and download all your generated crew images</p>
            <div className="action-arrow">
              Browse <span>→</span>
            </div>
          </div>
        </div>

        <div className="stats-section">
          <div className="stats-header">
            <h2>Your Activity</h2>
            <button 
              className="view-all-btn"
              onClick={() => navigate('/crews')}
            >
              View all crews →
            </button>
          </div>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon">👥</div>
              <div className="stat-content">
                <div className="stat-value">
                  {loading ? '...' : user ? stats.totalCrews : '—'}
                </div>
                <div className="stat-label">Active Crews</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">🎨</div>
              <div className="stat-content">
                <div className="stat-value">
                  {loading ? '...' : user ? stats.totalTemplates : '5'}
                </div>
                <div className="stat-label">Templates</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">📸</div>
              <div className="stat-content">
                <div className="stat-value">
                  {loading ? '...' : user ? stats.totalImages : '—'}
                </div>
                <div className="stat-label">Images Created</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Auth Modal */}
      <AuthModal 
        open={showAuthModal} 
        onClose={() => setShowAuthModal(false)} 
      />
    </div>
  );
};

export default DashboardPage;