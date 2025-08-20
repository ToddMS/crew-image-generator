import React, { ReactNode, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useThemeMode } from '../../context/RowgramThemeContext';
import AuthModal from '../Auth/AuthModal';
import './DashboardLayout.css';

interface DashboardLayoutProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ 
  children
}) => {
  const { user, logout } = useAuth();
  const { isDarkMode, toggleTheme } = useThemeMode();
  const [showAuthModal, setShowAuthModal] = useState(false);

  const handleNavClick = (path: string) => {
    window.location.href = path;
  };

  const getCurrentPage = () => {
    const path = window.location.pathname;
    if (path === '/') return 'dashboard';
    if (path.includes('/crews')) return 'crews';
    if (path.includes('/templates')) return 'templates';
    if (path.includes('/generate')) return 'generate';
    if (path.includes('/gallery')) return 'gallery';
    if (path.includes('/analytics')) return 'analytics';
    if (path.includes('/settings')) return 'settings';
    return 'dashboard';
  };

  const currentPage = getCurrentPage();

  return (
    <div className="dashboard-layout">
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
              className={`nav-link ${currentPage === 'templates' ? 'active' : ''}`}
              onClick={() => handleNavClick('/templates/create')}
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
              className={`nav-link ${currentPage === 'analytics' ? 'active' : ''}`}
              onClick={() => handleNavClick('/analytics')}
            >
              Analytics
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

      {/* Main Content */}
      <main className="main-content">
        {children}
      </main>
      
      {/* Auth Modal */}
      <AuthModal 
        open={showAuthModal} 
        onClose={() => setShowAuthModal(false)} 
      />
    </div>
  );
};

export default DashboardLayout;